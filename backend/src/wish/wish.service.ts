import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { v4 as uuidv4 } from "uuid";
import { WishJar, WishJarDocument } from "../models/WishJar";
import { Pledge, PledgeDocument } from "../models/Pledge";
import { Update, UpdateDocument } from "../models/Update";
import { MonitoringService } from "../services/monitoring";
import { NFTService } from "../services/nft";
import { VerificationService } from "../services/verification.service";
import { CreateWishDto } from "./create-wish.dto";

@Injectable()
export class WishService {
  constructor(
    @InjectModel(WishJar.name) private wishModel: Model<WishJarDocument>,
    @InjectModel(Pledge.name) private pledgeModel: Model<PledgeDocument>,
    @InjectModel(Update.name) private updateModel: Model<UpdateDocument>,
    @InjectQueue("wish") private wishQueue: Queue,
    private monitoring: MonitoringService,
    private nftService: NFTService,
    private verificationService: VerificationService,
  ) {}

  async createWish(createWishDto: CreateWishDto, userId: string): Promise<any> {
    const wishId = uuidv4();
    const wish = new this.wishModel({
      wish_id: wishId,
      creator_user_id: userId,
      ...createWishDto,
    });
    await wish.save();

    // Enqueue contract creation
    await this.wishQueue.add("create-contract", { wishId });

    this.monitoring.audit("wish_created", { wishId, userId });

    return { wishId, contractAddress: "mock_address", status: "active" };
  }

  async listWishes(query: any): Promise<any> {
    const {
      search,
      status,
      categories,
      creator,
      minStake,
      maxStake,
      minPledged,
      maxPledged,
      deadlineFrom,
      deadlineTo,
      createdFrom,
      createdTo,
      sortBy = "newest",
      limit = 20,
      cursor,
      visibility = "public",
      proofMethod,
      sponsored,
    } = query;

    // Build MongoDB query
    const mongoQuery: any = {};

    // Text search
    if (search) {
      mongoQuery.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category_tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Status filter
    if (status) {
      mongoQuery.status = status;
    }

    // Category filter
    if (categories && categories.length > 0) {
      mongoQuery.category_tags = { $in: categories };
    }

    // Creator filter
    if (creator) {
      mongoQuery.creator_user_id = creator;
    }

    // Stake amount range
    if (minStake !== undefined || maxStake !== undefined) {
      mongoQuery.stake_amount_microton = {};
      if (minStake !== undefined)
        mongoQuery.stake_amount_microton.$gte = minStake;
      if (maxStake !== undefined)
        mongoQuery.stake_amount_microton.$lte = maxStake;
    }

    // Pledged amount range
    if (minPledged !== undefined || maxPledged !== undefined) {
      mongoQuery.pledge_total_microton = {};
      if (minPledged !== undefined)
        mongoQuery.pledge_total_microton.$gte = minPledged;
      if (maxPledged !== undefined)
        mongoQuery.pledge_total_microton.$lte = maxPledged;
    }

    // Deadline range
    if (deadlineFrom || deadlineTo) {
      mongoQuery.goal_deadline = {};
      if (deadlineFrom) mongoQuery.goal_deadline.$gte = new Date(deadlineFrom);
      if (deadlineTo) mongoQuery.goal_deadline.$lte = new Date(deadlineTo);
    }

    // Created date range
    if (createdFrom || createdTo) {
      mongoQuery.created_at = {};
      if (createdFrom) mongoQuery.created_at.$gte = new Date(createdFrom);
      if (createdTo) mongoQuery.created_at.$lte = new Date(createdTo);
    }

    // Visibility filter
    mongoQuery.visibility = visibility;

    // Proof method filter
    if (proofMethod) {
      mongoQuery.proof_method = proofMethod;
    }

    // Sponsored filter
    if (sponsored !== undefined) {
      mongoQuery.sponsor = sponsored ? { $exists: true } : { $exists: false };
    }

    // Pagination
    let skip = 0;
    if (cursor) {
      // Decode cursor (base64 encoded skip value)
      try {
        skip = parseInt(Buffer.from(cursor, "base64").toString());
      } catch (error) {
        skip = 0;
      }
    }

    // Sorting
    let sortOptions: any = { created_at: -1 }; // default: newest first
    switch (sortBy) {
      case "oldest":
        sortOptions = { created_at: 1 };
        break;
      case "trending":
        // Simple trending: recent + pledges
        sortOptions = { pledge_total_microton: -1, created_at: -1 };
        break;
      case "most-pledged":
        sortOptions = { pledge_total_microton: -1 };
        break;
      case "least-pledged":
        sortOptions = { pledge_total_microton: 1 };
        break;
      case "ending-soon":
        sortOptions = { goal_deadline: 1 };
        break;
    }

    // Execute query
    const [wishes, total] = await Promise.all([
      this.wishModel
        .find(mongoQuery)
        .populate("creator_user_id", "display_name username avatar_url")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit + 1) // +1 to check if there are more results
        .lean(),
      this.wishModel.countDocuments(mongoQuery),
    ]);

    // Check if there are more results
    const hasNextPage = wishes.length > limit;
    const results = hasNextPage ? wishes.slice(0, limit) : wishes;

    // Create next cursor
    const nextCursor = hasNextPage
      ? Buffer.from((skip + limit).toString()).toString("base64")
      : null;

    // Transform results
    const transformedWishes = results.map((wish) => ({
      wishId: wish.wish_id,
      title: wish.title,
      description: wish.description,
      stakeAmountMicroTon: wish.stake_amount_microton,
      pledgeTotalMicroTon: wish.pledge_total_microton,
      pledgesCount: wish.pledge_count,
      creator: wish.creator_user_id,
      status: wish.status,
      goalDeadline: wish.goal_deadline,
      visibility: wish.visibility,
      categoryTags: wish.category_tags,
      proofMethod: wish.proof_method,
      sponsor: wish.sponsor,
      createdAt: wish.created_at,
      updatedAt: wish.updated_at,
    }));

    return {
      wishes: transformedWishes,
      pagination: {
        hasNextPage,
        nextCursor,
        total,
        count: transformedWishes.length,
      },
      filters: {
        applied: Object.keys(mongoQuery).length > 0,
        query: mongoQuery,
      },
    };
  }

  async getWish(wishId: string): Promise<any> {
    const wish = await this.wishModel
      .findOne({ wish_id: wishId })
      .populate("creator_user_id");
    if (!wish) throw new Error("Wish not found");

    const pledges = await this.pledgeModel.find({ wish_id: wish._id });
    const updates = await this.updateModel
      .find({ wish_id: wish._id })
      .sort({ created_at: -1 });

    return {
      wishId: wish.wish_id,
      title: wish.title,
      description: wish.description,
      stakeAmountMicroTon: wish.stake_amount_microton,
      pledgeTotalMicroTon: wish.pledge_total_microton,
      pledgesCount: wish.pledge_count,
      creator: wish.creator_user_id,
      status: wish.status,
      goalDeadline: wish.goal_deadline,
      updates,
      contractAddress: wish.contract_address,
    };
  }

  async createPledge(
    wishId: string,
    amountMicroTon: number,
    note: string,
    userId: string,
  ): Promise<any> {
    const wish = await this.wishModel.findOne({ wish_id: wishId });
    if (!wish) throw new Error("Wish not found");

    const pledgeId = uuidv4();
    const pledge = new this.pledgeModel({
      pledge_id: pledgeId,
      wish_id: wish._id,
      supporter_user_id: userId,
      amount_microton: amountMicroTon,
    });
    await pledge.save();

    // Update wish totals
    wish.pledge_total_microton += amountMicroTon;
    wish.pledge_count += 1;
    await wish.save();

    this.monitoring.audit("pledge_created", {
      pledgeId,
      wishId,
      userId,
      amountMicroTon,
    });

    return { pledgeId, status: "pending" };
  }

  async postUpdate(
    wishId: string,
    content: string,
    mediaUrls: string[],
    userId: string,
  ): Promise<any> {
    const wish = await this.wishModel.findOne({ wish_id: wishId });
    if (!wish) throw new Error("Wish not found");

    if (wish.creator_user_id.toString() !== userId)
      throw new Error("Not creator");

    const update = new this.updateModel({
      wish_id: wish._id,
      author_user_id: userId,
      content,
      media: mediaUrls.map((url) => ({ type: "image" as const, url })),
    });
    await update.save();

    this.monitoring.audit("update_posted", { wishId, userId });

    return { updateId: update._id };
  }

  async submitProof(
    wishId: string,
    userId: string,
    proofData: any,
  ): Promise<any> {
    return this.verificationService.submitProof(wishId, userId, proofData);
  }

  async castVote(
    wishId: string,
    userId: string,
    choice: "yes" | "no",
    comment?: string,
  ): Promise<any> {
    return this.verificationService.castVote(wishId, userId, choice, comment);
  }

  async getVerificationDetails(wishId: string): Promise<any> {
    return this.verificationService.getVerificationDetails(wishId);
  }

  async verifyWish(
    wishId: string,
    vote: "approve" | "reject",
    comment: string,
    userId: string,
  ): Promise<any> {
    // Legacy method - now delegates to castVote
    const choice = vote === "approve" ? "yes" : "no";
    return this.castVote(wishId, userId, choice, comment);
  }
}
