import mongoose, { Document, Schema } from "mongoose";

export interface IWishJar extends Document {
  _id: mongoose.Types.ObjectId;
  wish_id: string;
  creator_user_id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  stake_amount_microton: number;
  goal_deadline: Date;
  proof_method: "media" | "gps" | "github" | "strava" | "custom";
  contract_address: string;
  status:
    | "active"
    | "pending_verification"
    | "verified"
    | "failed"
    | "cancelled";
  created_at: Date;
  updated_at: Date;
  pledge_total_microton: number;
  pledge_count: number;
  validators: Array<{
    user_id: mongoose.Types.ObjectId;
    role: "community" | "appointed" | "oracle";
  }>;
  visibility: "public" | "private" | "friends";
  category_tags: string[];
  impact_allocation: {
    on_fail_percent: number;
    beneficiary: string;
  };
}

const WishJarSchema: Schema = new Schema({
  wish_id: { type: String, required: true, unique: true },
  creator_user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxLength: 120 },
  description: { type: String, required: true, maxLength: 2000 },
  stake_amount_microton: { type: Number, required: true },
  goal_deadline: { type: Date, required: true },
  proof_method: {
    type: String,
    enum: ["media", "gps", "github", "strava", "custom"],
    required: true,
  },
  contract_address: { type: String, required: true },
  status: {
    type: String,
    enum: ["active", "pending_verification", "verified", "failed", "cancelled"],
    default: "active",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  pledge_total_microton: { type: Number, default: 0 },
  pledge_count: { type: Number, default: 0 },
  validators: [
    {
      user_id: { type: Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["community", "appointed", "oracle"] },
    },
  ],
  visibility: {
    type: String,
    enum: ["public", "private", "friends"],
    default: "public",
  },
  category_tags: [{ type: String }],
  impact_allocation: {
    on_fail_percent: { type: Number, min: 0, max: 100, default: 50 },
    beneficiary: { type: String },
  },
});

// Indexes
WishJarSchema.index({ wish_id: 1 });
WishJarSchema.index({ creator_user_id: 1 });
WishJarSchema.index({ status: 1, goal_deadline: 1 });
WishJarSchema.index({ contract_address: 1 });

export const WishJar = mongoose.model<IWishJar>("WishJar", WishJarSchema);
export type WishJarDocument = IWishJar;
export { WishJarSchema };
