import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Campaign, CampaignDocument } from "../models/Campaign";
import { WishJar, WishJarDocument } from "../models/WishJar";
import { User, UserDocument } from "../models/User";
import { MonitoringService } from "./monitoring";
import { v4 as uuidv4 } from "uuid";

export interface SponsorshipMatch {
  campaignId: string;
  rewardBonus: number;
  sponsorInfo: {
    name: string;
    logo?: string;
    website?: string;
  };
}

@Injectable()
export class SponsorshipService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(WishJar.name) private wishModel: Model<WishJarDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private monitoring: MonitoringService,
  ) {}

  async createCampaign(
    sponsorId: string,
    campaignData: {
      title: string;
      description: string;
      budget: number;
      startDate: Date;
      endDate: Date;
      targetCategories?: string[];
      targetStakeRange?: { min: number; max: number };
      rewardMultiplier?: number;
      maxSponsoredWishes?: number;
      requirements?: {
        minStake?: number;
        categories?: string[];
        proofMethods?: string[];
      };
    },
  ): Promise<CampaignDocument> {
    const campaignId = uuidv4();

    const campaign = new this.campaignModel({
      campaignId,
      sponsorId,
      ...campaignData,
    });

    await campaign.save();

    this.monitoring.audit("campaign_created", {
      campaignId,
      sponsorId,
      budget: campaignData.budget,
    });

    return campaign;
  }

  async updateCampaign(
    campaignId: string,
    sponsorId: string,
    updates: Partial<CampaignDocument>,
  ): Promise<CampaignDocument> {
    const campaign = await this.campaignModel.findOne({ campaignId });
    if (!campaign) throw new Error("Campaign not found");

    if (campaign.sponsorId.toString() !== sponsorId) {
      throw new Error("Not campaign sponsor");
    }

    Object.assign(campaign, updates);
    campaign.updatedAt = new Date();
    await campaign.save();

    this.monitoring.audit("campaign_updated", {
      campaignId,
      sponsorId,
      updates,
    });

    return campaign;
  }

  async findMatchingSponsorships(wishData: {
    category_tags: string[];
    stake_amount_microton: number;
    proof_method: string;
  }): Promise<SponsorshipMatch[]> {
    const now = new Date();

    // Find active campaigns that match the wish criteria
    const matchingCampaigns = await this.campaignModel
      .find({
        status: "active",
        startDate: { $lte: now },
        endDate: { $gte: now },
        spent: { $lt: { $multiply: ["$budget", 0.95] } }, // Keep 5% buffer
        sponsoredWishesCount: { $lt: "$maxSponsoredWishes" },
        $or: [
          { targetCategories: { $in: wishData.category_tags } },
          { targetCategories: { $size: 0 } }, // No category restrictions
        ],
        "targetStakeRange.min": { $lte: wishData.stake_amount_microton },
        "targetStakeRange.max": { $gte: wishData.stake_amount_microton },
      })
      .populate("sponsorId", "display_name avatar_url")
      .sort({ rewardMultiplier: -1, budget: -1 }) // Prefer higher rewards and bigger budgets
      .limit(3); // Return top 3 matches

    const matches: SponsorshipMatch[] = [];

    for (const campaign of matchingCampaigns) {
      // Check specific requirements
      const requirements = campaign.requirements;
      let meetsRequirements = true;

      if (
        requirements.minStake &&
        wishData.stake_amount_microton < requirements.minStake
      ) {
        meetsRequirements = false;
      }

      if (requirements.categories && requirements.categories.length > 0) {
        const hasMatchingCategory = wishData.category_tags.some((tag) =>
          requirements.categories!.includes(tag),
        );
        if (!hasMatchingCategory) {
          meetsRequirements = false;
        }
      }

      if (requirements.proofMethods && requirements.proofMethods.length > 0) {
        if (!requirements.proofMethods.includes(wishData.proof_method)) {
          meetsRequirements = false;
        }
      }

      if (meetsRequirements) {
        matches.push({
          campaignId: campaign.campaignId,
          rewardBonus: campaign.rewardMultiplier,
          sponsorInfo: {
            name: campaign.title,
            logo: (campaign.sponsorId as any).avatar_url,
            website: campaign.sponsorId.toString(), // Could be a profile link
          },
        });
      }
    }

    return matches;
  }

  async sponsorWish(wishId: string, campaignId: string): Promise<void> {
    const [wish, campaign] = await Promise.all([
      this.wishModel.findOne({ wish_id: wishId }),
      this.campaignModel.findOne({ campaignId }),
    ]);

    if (!wish) throw new Error("Wish not found");
    if (!campaign) throw new Error("Campaign not found");

    if (campaign.status !== "active") {
      throw new Error("Campaign is not active");
    }

    if (wish.sponsor) {
      throw new Error("Wish is already sponsored");
    }

    // Calculate sponsorship cost (simplified)
    const sponsorshipCost = Math.floor(wish.stake_amount_microton * 0.01); // 1% of stake

    if (campaign.spent + sponsorshipCost > campaign.budget) {
      throw new Error("Campaign budget exceeded");
    }

    if (campaign.sponsoredWishesCount >= campaign.maxSponsoredWishes) {
      throw new Error("Campaign sponsorship limit reached");
    }

    // Apply sponsorship
    wish.sponsor = {
      name: campaign.title,
      logo_url: undefined, // Could be set from campaign
      website: undefined,
      campaign_id: campaign.campaignId,
    };

    // Update campaign
    campaign.spent += sponsorshipCost;
    campaign.sponsoredWishesCount += 1;
    campaign.analytics.conversions += 1;
    campaign.analytics.totalSponsored += wish.stake_amount_microton;

    await Promise.all([wish.save(), campaign.save()]);

    this.monitoring.audit("wish_sponsored", {
      wishId,
      campaignId,
      sponsorshipCost,
      rewardMultiplier: campaign.rewardMultiplier,
    });
  }

  async getCampaigns(
    sponsorId?: string,
    status?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const query: any = {};
    if (sponsorId) query.sponsorId = sponsorId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      this.campaignModel
        .find(query)
        .populate("sponsorId", "display_name username avatar_url")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.campaignModel.countDocuments(query),
    ]);

    return {
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCampaign(campaignId: string): Promise<CampaignDocument | null> {
    return this.campaignModel
      .findOne({ campaignId })
      .populate("sponsorId", "display_name username avatar_url");
  }

  async trackCampaignImpression(campaignId: string): Promise<void> {
    await this.campaignModel.updateOne(
      { campaignId },
      { $inc: { "analytics.impressions": 1 } },
    );
  }

  async trackCampaignClick(campaignId: string): Promise<void> {
    await this.campaignModel.updateOne(
      { campaignId },
      { $inc: { "analytics.clicks": 1 } },
    );
  }

  async getSponsoredWishes(
    campaignId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const [wishes, total] = await Promise.all([
      this.wishModel
        .find({ "sponsor.campaign_id": campaignId })
        .populate("creator_user_id", "display_name username")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      this.wishModel.countDocuments({ "sponsor.campaign_id": campaignId }),
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

  async processCampaignEndDates(): Promise<void> {
    const now = new Date();

    // Complete expired campaigns
    await this.campaignModel.updateMany(
      {
        status: "active",
        endDate: { $lt: now },
      },
      { status: "completed" },
    );

    this.monitoring.info("Processed expired campaigns");
  }

  async getCampaignAnalytics(campaignId: string): Promise<any> {
    const campaign = await this.campaignModel.findOne({ campaignId });
    if (!campaign) throw new Error("Campaign not found");

    const sponsoredWishes = await this.wishModel.find({
      "sponsor.campaign_id": campaignId,
    });

    const successfulWishes = sponsoredWishes.filter(
      (w) => w.status === "verified",
    );
    const failedWishes = sponsoredWishes.filter((w) => w.status === "failed");

    return {
      campaign: campaign.analytics,
      sponsoredWishes: {
        total: sponsoredWishes.length,
        successful: successfulWishes.length,
        failed: failedWishes.length,
        successRate:
          sponsoredWishes.length > 0
            ? (successfulWishes.length / sponsoredWishes.length) * 100
            : 0,
      },
      financials: {
        budget: campaign.budget,
        spent: campaign.spent,
        remaining: campaign.budget - campaign.spent,
        totalSponsoredValue: campaign.analytics.totalSponsored,
      },
    };
  }
}
