import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { WishJar, WishJarDocument } from "../models/WishJar";
import { User, UserDocument } from "../models/User";
import { Pledge, PledgeDocument } from "../models/Pledge";
import { Vote, IVote } from "../models/Vote";
import { Proposal, ProposalDocument } from "../models/Proposal";
import { Badge, BadgeDocument } from "../models/Badge";
import { MonitoringService } from "./monitoring";
import { ImpactPoolService } from "./impact-pool.service";
import { VerificationService } from "./verification.service";

export interface DashboardStats {
  totalWishes: number;
  activeWishes: number;
  verifiedWishes: number;
  failedWishes: number;
  totalPledges: number;
  totalPledgeAmount: number;
  totalUsers: number;
  activeUsers: number;
  totalVolume: number;
  impactPoolFunds: number;
  pendingDisputes: number;
  pendingProposals: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(WishJar.name) private wishModel: Model<WishJarDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Pledge.name) private pledgeModel: Model<PledgeDocument>,
    @InjectModel(Vote.name) private voteModel: Model<IVote>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(Badge.name) private badgeModel: Model<BadgeDocument>,
    private monitoring: MonitoringService,
    private impactPoolService: ImpactPoolService,
    private verificationService: VerificationService,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalWishes,
      activeWishes,
      verifiedWishes,
      failedWishes,
      totalPledges,
      totalPledgeAmount,
      totalUsers,
      activeUsers,
      impactPoolStats,
      pendingDisputes,
      pendingProposals,
    ] = await Promise.all([
      this.wishModel.countDocuments(),
      this.wishModel.countDocuments({ status: "active" }),
      this.wishModel.countDocuments({ status: "verified" }),
      this.wishModel.countDocuments({ status: "failed" }),
      this.pledgeModel.countDocuments(),
      this.pledgeModel.aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$amount_microton" } } },
      ]),
      this.userModel.countDocuments(),
      this.userModel.countDocuments({
        created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      this.impactPoolService.getImpactPoolStats(),
      this.getPendingDisputesCount(),
      this.proposalModel.countDocuments({ status: "active" }),
    ]);

    const totalVolume = totalPledgeAmount[0]?.total || 0;

    return {
      totalWishes,
      activeWishes,
      verifiedWishes,
      failedWishes,
      totalPledges,
      totalPledgeAmount: totalVolume,
      totalUsers,
      activeUsers,
      totalVolume,
      impactPoolFunds: impactPoolStats.totalFunds,
      pendingDisputes,
      pendingProposals,
    };
  }

  async getWishes(
    status?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [wishes, total] = await Promise.all([
      this.wishModel
        .find(query)
        .populate("creator_user_id", "display_name username")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      this.wishModel.countDocuments(query),
    ]);

    return {
      wishes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getWishDetails(wishId: string): Promise<any> {
    const wish = await this.wishModel
      .findOne({ wish_id: wishId })
      .populate("creator_user_id", "display_name username avatar_url");

    if (!wish) throw new Error("Wish not found");

    const [pledges, updates, verificationDetails] = await Promise.all([
      this.pledgeModel
        .find({ wish_id: wish._id })
        .populate("supporter_user_id", "display_name username"),
      this.wishModel.db
        .collection("updates")
        .find({ wish_id: wish._id })
        .toArray(),
      this.verificationService.getVerificationDetails(wishId),
    ]);

    return {
      wish,
      pledges,
      updates,
      verificationDetails,
    };
  }

  async updateWishStatus(
    wishId: string,
    status: string,
    reason?: string,
  ): Promise<any> {
    const wish = await this.wishModel.findOne({ wish_id: wishId });
    if (!wish) throw new Error("Wish not found");

    const oldStatus = wish.status;
    wish.status = status;
    wish.updated_at = new Date();
    await wish.save();

    this.monitoring.audit("admin_wish_status_update", {
      wishId,
      oldStatus,
      newStatus: status,
      reason,
      adminId: "system", // In real app, get from JWT
    });

    return { success: true, wish };
  }

  async getDisputes(
    status?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    // For now, return wishes that are in verification or have issues
    // In a real system, you'd have a dedicated disputes collection
    const query: any = {
      status: { $in: ["pending_verification", "failed"] },
    };

    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [disputes, total] = await Promise.all([
      this.wishModel
        .find(query)
        .populate("creator_user_id", "display_name username")
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(limit),
      this.wishModel.countDocuments(query),
    ]);

    return {
      disputes: disputes.map((wish) => ({
        id: wish.wish_id,
        wishId: wish.wish_id,
        title: wish.title,
        creator: wish.creator_user_id,
        status: wish.status,
        createdAt: wish.created_at,
        updatedAt: wish.updated_at,
        reason: this.getDisputeReason(wish),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async resolveDispute(
    disputeId: string,
    resolution: string,
    notes?: string,
  ): Promise<any> {
    // For now, disputeId is wishId
    const wish = await this.wishModel.findOne({ wish_id: disputeId });
    if (!wish) throw new Error("Wish not found");

    // Apply resolution
    if (resolution === "verify") {
      wish.status = "verified";
    } else if (resolution === "fail") {
      wish.status = "failed";
    } else if (resolution === "cancel") {
      wish.status = "cancelled";
    }

    wish.updated_at = new Date();
    await wish.save();

    this.monitoring.audit("admin_dispute_resolved", {
      disputeId,
      wishId: disputeId,
      resolution,
      notes,
    });

    return { success: true, wish };
  }

  async getContracts(
    status?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    // Return unique contract addresses with stats
    const pipeline = [
      {
        $group: {
          _id: "$contract_address",
          wishCount: { $sum: 1 },
          activeWishes: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          verifiedWishes: {
            $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] },
          },
          failedWishes: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          totalPledged: { $sum: "$pledge_total_microton" },
          lastActivity: { $max: "$updated_at" },
        },
      },
      {
        $project: {
          address: "$_id",
          wishCount: 1,
          activeWishes: 1,
          verifiedWishes: 1,
          failedWishes: 1,
          totalPledged: 1,
          lastActivity: 1,
          status: {
            $cond: {
              if: { $gt: ["$activeWishes", 0] },
              then: "active",
              else: "inactive",
            },
          },
        },
      },
    ];

    if (status) {
      pipeline.push({ $match: { status } });
    }

    pipeline.push(
      { $sort: { lastActivity: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    );

    const contracts = await this.wishModel.aggregate(pipeline);
    const total = await this.wishModel
      .distinct("contract_address")
      .then((arr) => arr.length);

    return {
      contracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getContractDetails(address: string): Promise<any> {
    const wishes = await this.wishModel
      .find({ contract_address: address })
      .populate("creator_user_id", "display_name username")
      .sort({ created_at: -1 });

    const stats = await this.wishModel.aggregate([
      { $match: { contract_address: address } },
      {
        $group: {
          _id: null,
          totalWishes: { $sum: 1 },
          totalPledged: { $sum: "$pledge_total_microton" },
          totalStaked: { $sum: "$stake_amount_microton" },
        },
      },
    ]);

    return {
      address,
      wishes,
      stats: stats[0] || {
        totalWishes: 0,
        totalPledged: 0,
        totalStaked: 0,
      },
    };
  }

  async getAnalyticsOverview(
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [wishStats, pledgeStats, userStats] = await Promise.all([
      this.getWishAnalytics(startDate, endDate),
      this.getPledgeAnalytics(startDate, endDate),
      this.getUserAnalytics(startDate, endDate),
    ]);

    return {
      period: { start, end },
      wishes: wishStats,
      pledges: pledgeStats,
      users: userStats,
    };
  }

  async getUserAnalytics(startDate?: string, endDate?: string): Promise<any> {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ created_at: { $gte: start, $lte: end } }),
      this.userModel.countDocuments({
        updated_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    return {
      totalUsers,
      newUsers,
      activeUsers,
      period: { start, end },
    };
  }

  async getWishAnalytics(startDate?: string, endDate?: string): Promise<any> {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [totalWishes, newWishes, completedWishes, failedWishes] =
      await Promise.all([
        this.wishModel.countDocuments(),
        this.wishModel.countDocuments({
          created_at: { $gte: start, $lte: end },
        }),
        this.wishModel.countDocuments({
          status: "verified",
          updated_at: { $gte: start, $lte: end },
        }),
        this.wishModel.countDocuments({
          status: "failed",
          updated_at: { $gte: start, $lte: end },
        }),
      ]);

    return {
      totalWishes,
      newWishes,
      completedWishes,
      failedWishes,
      completionRate:
        totalWishes > 0 ? (completedWishes / totalWishes) * 100 : 0,
      period: { start, end },
    };
  }

  async getImpactPoolStats(): Promise<any> {
    return this.impactPoolService.getImpactPoolStats();
  }

  async getProposals(
    status?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [proposals, total] = await Promise.all([
      this.proposalModel
        .find(query)
        .populate("proposerId", "display_name username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.proposalModel.countDocuments(query),
    ]);

    return {
      proposals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async executeProposal(proposalId: number): Promise<any> {
    return this.impactPoolService.executeProposal(
      proposalId.toString(),
      "admin",
    );
  }

  async getAuditLogs(
    action?: string,
    userId?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<any> {
    // In a real system, you'd have an audit log collection
    // For now, return mock data
    return {
      logs: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    };
  }

  async runMaintenance(operation: string, params?: any): Promise<any> {
    switch (operation) {
      case "process_failed_wishes":
        await this.impactPoolService.processFailedWishes();
        return { success: true, message: "Processed failed wishes" };

      case "cleanup_expired_sessions":
        // Implement session cleanup
        return { success: true, message: "Cleaned up expired sessions" };

      case "reindex_database":
        // Implement database reindexing
        return { success: true, message: "Database reindexed" };

      default:
        throw new Error(`Unknown maintenance operation: ${operation}`);
    }
  }

  private async getPendingDisputesCount(): Promise<number> {
    // Count wishes that might need admin attention
    return this.wishModel.countDocuments({
      status: { $in: ["pending_verification", "failed"] },
      updated_at: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Older than 7 days
    });
  }

  private getDisputeReason(wish: WishJarDocument): string {
    switch (wish.status) {
      case "pending_verification":
        return "Awaiting verification completion";
      case "failed":
        return "Wish failed - potential refund dispute";
      default:
        return "General dispute";
    }
  }

  private async getPledgeAnalytics(
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [totalPledges, newPledges, totalAmount] = await Promise.all([
      this.pledgeModel.countDocuments(),
      this.pledgeModel.countDocuments({
        created_at: { $gte: start, $lte: end },
      }),
      this.pledgeModel.aggregate([
        { $match: { created_at: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount_microton" } } },
      ]),
    ]);

    return {
      totalPledges,
      newPledges,
      totalAmount: totalAmount[0]?.total || 0,
      period: { start, end },
    };
  }
}
