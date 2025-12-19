import mongoose, { Document, Schema } from "mongoose";

export interface ICampaign extends Document {
  _id: mongoose.Types.ObjectId;
  campaignId: string;
  sponsorId: mongoose.Types.ObjectId; // User or organization
  title: string;
  description: string;
  budget: number; // Total budget in microTON
  spent: number; // Amount spent so far
  startDate: Date;
  endDate: Date;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  targetCategories: string[];
  targetStakeRange: {
    min: number;
    max: number;
  };
  rewardMultiplier: number; // Bonus reward for sponsored wishes
  maxSponsoredWishes: number;
  sponsoredWishesCount: number;
  requirements: {
    minStake?: number;
    categories?: string[];
    proofMethods?: string[];
  };
  analytics: {
    impressions: number;
    clicks: number;
    conversions: number;
    totalSponsored: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema: Schema = new Schema({
  campaignId: { type: String, required: true, unique: true },
  sponsorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxLength: 200 },
  description: { type: String, required: true, maxLength: 1000 },
  budget: { type: Number, required: true, min: 0 },
  spent: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["draft", "active", "paused", "completed", "cancelled"],
    default: "draft",
  },
  targetCategories: [{ type: String }],
  targetStakeRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 1000000000 }, // 1000 TON
  },
  rewardMultiplier: { type: Number, default: 1.0, min: 1.0 },
  maxSponsoredWishes: { type: Number, default: 100 },
  sponsoredWishesCount: { type: Number, default: 0 },
  requirements: {
    minStake: { type: Number },
    categories: [{ type: String }],
    proofMethods: [{ type: String }],
  },
  analytics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    totalSponsored: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
CampaignSchema.index({ campaignId: 1 });
CampaignSchema.index({ sponsorId: 1 });
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ startDate: 1, endDate: 1 });
CampaignSchema.index({ targetCategories: 1 });

export const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);
export type CampaignDocument = ICampaign;
export { CampaignSchema };
