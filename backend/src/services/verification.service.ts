import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { WishJar, WishJarDocument } from "../models/WishJar";
import { Vote, IVote } from "../models/Vote";
import { Proof, IProof } from "../models/Proof";
import { User, UserDocument } from "../models/User";
import { MonitoringService } from "./monitoring";

export interface VerificationResult {
  status: "pending" | "approved" | "rejected";
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  quorumReached: boolean;
  timeExpired: boolean;
}

@Injectable()
export class VerificationService {
  constructor(
    @InjectModel(WishJar.name) private wishModel: Model<WishJarDocument>,
    @InjectModel(Vote.name) private voteModel: Model<IVote>,
    @InjectModel(Proof.name) private proofModel: Model<IProof>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private monitoring: MonitoringService,
  ) {}

  async submitProof(
    wishId: string,
    userId: string,
    proofData: {
      mediaURI?: string;
      mediaHash?: string;
      caption?: string;
      proofMethod: "media" | "gps" | "github" | "strava" | "custom";
      customProof?: any;
    },
  ): Promise<any> {
    const wish = await this.wishModel.findOne({ wish_id: wishId });
    if (!wish) throw new Error("Wish not found");

    if (wish.creator_user_id.toString() !== userId) {
      throw new Error("Only creator can submit proof");
    }

    if (wish.status !== "active") {
      throw new Error("Wish is not in active state");
    }

    // Validate proof based on method
    await this.validateProof(proofData);

    // Create proof record
    const proof = new this.proofModel({
      wishJarId: wish._id,
      uploaderId: userId,
      mediaURI: proofData.mediaURI,
      mediaHash: proofData.mediaHash,
      caption: proofData.caption,
    });
    await proof.save();

    // Update wish status to pending verification
    wish.status = "pending_verification";
    await wish.save();

    this.monitoring.audit("proof_submitted", {
      wishId,
      userId,
      proofMethod: proofData.proofMethod,
    });

    return { proofId: proof._id, status: "pending_verification" };
  }

  async castVote(
    wishId: string,
    userId: string,
    choice: "yes" | "no",
    comment?: string,
  ): Promise<any> {
    const wish = await this.wishModel.findOne({ wish_id: wishId });
    if (!wish) throw new Error("Wish not found");

    if (wish.status !== "pending_verification") {
      throw new Error("Wish is not pending verification");
    }

    // Check if user already voted
    const existingVote = await this.voteModel.findOne({
      wishJarId: wish._id,
      voterId: userId,
    });

    if (existingVote) {
      throw new Error("User has already voted");
    }

    // Calculate vote weight (could be based on reputation, stake, etc.)
    const voteWeight = await this.calculateVoteWeight(userId, wishId);

    // Create vote
    const vote = new this.voteModel({
      wishJarId: wish._id,
      voterId: userId,
      choice,
      weight: voteWeight,
    });
    await vote.save();

    this.monitoring.audit("vote_cast", {
      wishId,
      userId,
      choice,
      weight: voteWeight,
    });

    // Check if verification can be resolved
    const result = await this.checkVerificationStatus(wishId);
    if (result.status !== "pending") {
      await this.resolveVerification(wishId, result);
    }

    return {
      voteId: vote._id,
      status: result.status,
      totalVotes: result.totalVotes,
    };
  }

  async checkVerificationStatus(wishId: string): Promise<VerificationResult> {
    const wish = await this.wishModel.findOne({ wish_id: wishId });
    if (!wish) throw new Error("Wish not found");

    const votes = await this.voteModel.find({ wishJarId: wish._id });

    const totalVotes = votes.length;
    const yesVotes = votes.filter((v) => v.choice === "yes").length;
    const noVotes = votes.filter((v) => v.choice === "no").length;

    const quorumThreshold = 10; // Configurable
    const quorumReached = totalVotes >= quorumThreshold;

    const now = new Date();
    const deadline = new Date(wish.goal_deadline);
    const timeExpired = now > deadline;

    let status: "pending" | "approved" | "rejected" = "pending";

    if (quorumReached || timeExpired) {
      if (yesVotes > noVotes) {
        status = "approved";
      } else {
        status = "rejected";
      }
    }

    return {
      status,
      totalVotes,
      yesVotes,
      noVotes,
      quorumReached,
      timeExpired,
    };
  }

  async resolveVerification(
    wishId: string,
    result: VerificationResult,
  ): Promise<void> {
    const wish = await this.wishModel.findOne({ wish_id: wishId });
    if (!wish) return;

    if (result.status === "approved") {
      wish.status = "verified";
      // Trigger reward distribution
      await this.distributeRewards(wishId);
    } else if (result.status === "rejected") {
      wish.status = "failed";
      // Route funds to impact pool
      await this.routeToImpactPool(wishId);
    }

    await wish.save();

    this.monitoring.audit("verification_resolved", {
      wishId,
      status: result.status,
      totalVotes: result.totalVotes,
      yesVotes: result.yesVotes,
      noVotes: result.noVotes,
    });
  }

  async getVerificationDetails(wishId: string): Promise<any> {
    const wish = await this.wishModel.findOne({ wish_id: wishId });
    if (!wish) throw new Error("Wish not found");

    const proofs = await this.proofModel.find({ wishJarId: wish._id });
    const votes = await this.voteModel
      .find({ wishJarId: wish._id })
      .populate("voterId", "display_name avatar_url");

    const result = await this.checkVerificationStatus(wishId);

    return {
      wishId,
      status: wish.status,
      proofMethod: wish.proof_method,
      proofs,
      votes,
      verificationResult: result,
    };
  }

  private async validateProof(proofData: any): Promise<void> {
    const { proofMethod } = proofData;

    switch (proofMethod) {
      case "media":
        if (!proofData.mediaURI || !proofData.mediaHash) {
          throw new Error("Media proof requires URI and hash");
        }
        break;

      case "gps":
        // Validate GPS coordinates and timestamp
        if (
          !proofData.customProof?.latitude ||
          !proofData.customProof?.longitude
        ) {
          throw new Error("GPS proof requires coordinates");
        }
        // Could integrate with mapping service to verify location
        break;

      case "github":
        if (!proofData.customProof?.repo || !proofData.customProof?.commit) {
          throw new Error("GitHub proof requires repository and commit hash");
        }
        // Could verify commit exists via GitHub API
        break;

      case "strava":
        if (!proofData.customProof?.activityId) {
          throw new Error("Strava proof requires activity ID");
        }
        // Could verify activity via Strava API
        break;

      case "custom":
        if (!proofData.customProof) {
          throw new Error("Custom proof requires proof data");
        }
        break;

      default:
        throw new Error("Invalid proof method");
    }
  }

  private async calculateVoteWeight(
    userId: string,
    wishId: string,
  ): Promise<number> {
    // Base weight of 1
    let weight = 1;

    // Bonus for pledgers
    const pledge = await this.wishModel.findOne({
      wish_id: wishId,
      pledges: { $elemMatch: { supporter_user_id: userId } },
    });

    if (pledge) {
      weight += 2; // Pledgers get higher weight
    }

    // Could add more factors: user reputation, stake amount, etc.

    return weight;
  }

  private async distributeRewards(wishId: string): Promise<void> {
    // Implementation for reward distribution
    // This would interact with the smart contract to distribute funds
    this.monitoring.info(`Distributing rewards for wish ${wishId}`);
  }

  private async routeToImpactPool(wishId: string): Promise<void> {
    // Implementation for routing failed funds to impact pool
    // This would interact with the ImpactDAO contract
    this.monitoring.info(`Routing funds to impact pool for wish ${wishId}`);
  }
}
