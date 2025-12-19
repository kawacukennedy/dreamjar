import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { WishJar, WishJarDocument } from "../models/WishJar";
import { Proposal, ProposalDocument } from "../models/Proposal";
import { MonitoringService } from "./monitoring";
import { DAOService } from "./dao";

export interface ImpactPoolStats {
  totalFunds: number;
  allocatedFunds: number;
  availableFunds: number;
  totalProposals: number;
  activeProposals: number;
  executedProposals: number;
}

@Injectable()
export class ImpactPoolService {
  constructor(
    @InjectModel(WishJar.name) private wishModel: Model<WishJarDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    private monitoring: MonitoringService,
    private daoService: DAOService,
  ) {}

  async depositFailedWishFunds(wishId: string): Promise<void> {
    const wish = await this.wishModel.findOne({ wish_id: wishId });
    if (!wish) throw new Error("Wish not found");

    if (wish.status !== "failed") {
      throw new Error("Wish is not failed");
    }

    // Calculate impact allocation
    const totalPot = wish.stake_amount_microton + wish.pledge_total_microton;
    const impactAmount = Math.floor(
      totalPot * (wish.impact_allocation.on_fail_percent / 100),
    );

    if (impactAmount <= 0) {
      this.monitoring.info(`No impact allocation for wish ${wishId}`);
      return;
    }

    // In a real implementation, this would transfer funds to the ImpactDAO contract
    // For now, we'll just log it
    this.monitoring.audit("impact_funds_deposited", {
      wishId,
      totalPot,
      impactAmount,
      beneficiary: wish.impact_allocation.beneficiary,
    });

    // Update impact pool stats (in a real system, this would be tracked on-chain)
    this.monitoring.info(
      `Deposited ${impactAmount} microTON to impact pool from failed wish ${wishId}`,
    );
  }

  async createProposal(
    proposerId: string,
    title: string,
    description: string,
    amountRequested: number,
    beneficiary: string,
    planURI?: string,
  ): Promise<ProposalDocument> {
    // Check if proposer has permission (could be based on badges, reputation, etc.)
    // For now, allow anyone to propose

    // Get next proposal ID
    const lastProposal = await this.proposalModel
      .findOne()
      .sort({ proposalId: -1 });
    const nextId = lastProposal ? lastProposal.proposalId + 1 : 1;

    // Set voting deadline (7 days from now)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    const proposal = new this.proposalModel({
      proposalId: nextId,
      proposerId,
      title,
      description,
      planURI,
      amountRequested,
      beneficiary,
      deadline,
    });

    await proposal.save();

    // Submit to DAO contract
    try {
      await this.daoService.proposeImpactPlan(planURI || `proposal-${nextId}`);
    } catch (error) {
      this.monitoring.error("Failed to submit proposal to DAO contract", error);
    }

    this.monitoring.audit("proposal_created", {
      proposalId: nextId,
      proposerId,
      amountRequested,
      beneficiary,
    });

    return proposal;
  }

  async voteOnProposal(
    proposalId: number,
    voterId: string,
    vote: boolean,
  ): Promise<void> {
    const proposal = await this.proposalModel.findOne({ proposalId });
    if (!proposal) throw new Error("Proposal not found");

    if (proposal.status !== "active") {
      throw new Error("Proposal is not active");
    }

    if (new Date() > proposal.deadline) {
      throw new Error("Voting period has ended");
    }

    // Check if user already voted (in a real system, this would be tracked)
    // For now, allow multiple votes (simplified)

    if (vote) {
      proposal.votesFor += 1;
    } else {
      proposal.votesAgainst += 1;
    }
    proposal.totalVotes += 1;

    // Check quorum (simplified - 10 votes minimum)
    if (proposal.totalVotes >= 10) {
      proposal.quorumReached = true;

      // Check if majority
      if (proposal.votesFor > proposal.votesAgainst) {
        proposal.status = "passed";
      } else {
        proposal.status = "failed";
      }
    }

    proposal.updatedAt = new Date();
    await proposal.save();

    // Submit vote to DAO contract
    try {
      await this.daoService.voteOnProposal(proposalId, vote);
    } catch (error) {
      this.monitoring.error("Failed to submit vote to DAO contract", error);
    }

    this.monitoring.audit("proposal_voted", {
      proposalId,
      voterId,
      vote,
      totalVotes: proposal.totalVotes,
    });
  }

  async executeProposal(proposalId: number, executorId: string): Promise<void> {
    const proposal = await this.proposalModel.findOne({ proposalId });
    if (!proposal) throw new Error("Proposal not found");

    if (proposal.status !== "passed") {
      throw new Error("Proposal has not passed");
    }

    if (new Date() <= proposal.deadline) {
      throw new Error("Voting period has not ended");
    }

    // Check if funds are available (simplified)
    const stats = await this.getImpactPoolStats();
    if (stats.availableFunds < proposal.amountRequested) {
      throw new Error("Insufficient funds in impact pool");
    }

    // Execute proposal (in real system, this would transfer funds)
    proposal.status = "executed";
    proposal.executedAt = new Date();
    await proposal.save();

    // Submit execution to DAO contract
    try {
      await this.daoService.executeProposal(proposalId);
    } catch (error) {
      this.monitoring.error(
        "Failed to execute proposal on DAO contract",
        error,
      );
    }

    this.monitoring.audit("proposal_executed", {
      proposalId,
      executorId,
      amountRequested: proposal.amountRequested,
      beneficiary: proposal.beneficiary,
    });
  }

  async getImpactPoolStats(): Promise<ImpactPoolStats> {
    // In a real system, this would query the DAO contract
    // For now, return mock data
    const proposals = await this.proposalModel.find();

    const totalFunds = 1000000000; // Mock: 1000 TON in microTON
    const allocatedFunds = proposals
      .filter((p) => p.status === "executed")
      .reduce((sum, p) => sum + p.amountRequested, 0);

    return {
      totalFunds,
      allocatedFunds,
      availableFunds: totalFunds - allocatedFunds,
      totalProposals: proposals.length,
      activeProposals: proposals.filter((p) => p.status === "active").length,
      executedProposals: proposals.filter((p) => p.status === "executed")
        .length,
    };
  }

  async getProposals(
    status?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<ProposalDocument[]> {
    const query: any = {};
    if (status) {
      query.status = status;
    }

    return this.proposalModel
      .find(query)
      .populate("proposerId", "display_name avatar_url")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
  }

  async getProposal(proposalId: number): Promise<ProposalDocument | null> {
    return this.proposalModel
      .findOne({ proposalId })
      .populate("proposerId", "display_name avatar_url");
  }

  // Process failed wishes and route funds to impact pool
  async processFailedWishes(): Promise<void> {
    const failedWishes = await this.wishModel.find({
      status: "failed",
      // Add a check to ensure we haven't processed this wish yet
    });

    for (const wish of failedWishes) {
      try {
        await this.depositFailedWishFunds(wish.wish_id);
        // Mark as processed (add a field to WishJar model)
      } catch (error) {
        this.monitoring.error(
          `Failed to process failed wish ${wish.wish_id}`,
          error,
        );
      }
    }
  }
}
