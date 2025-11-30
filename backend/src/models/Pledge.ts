import mongoose, { Document, Schema } from "mongoose";

export interface IPledge extends Document {
  _id: mongoose.Types.ObjectId;
  pledge_id: string;
  wish_id: mongoose.Types.ObjectId;
  supporter_user_id: mongoose.Types.ObjectId;
  amount_microton: number;
  transaction_hash?: string;
  status: "pending" | "confirmed" | "refunded";
  created_at: Date;
}

const PledgeSchema: Schema = new Schema({
  pledge_id: { type: String, required: true, unique: true },
  wish_id: { type: Schema.Types.ObjectId, ref: "WishJar", required: true },
  supporter_user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount_microton: { type: Number, required: true, min: 100 },
  transaction_hash: { type: String },
  status: {
    type: String,
    enum: ["pending", "confirmed", "refunded"],
    default: "pending",
  },
  created_at: { type: Date, default: Date.now },
});

// Indexes
PledgeSchema.index({ wish_id: 1 });
PledgeSchema.index({ supporter_user_id: 1 });

export const Pledge = mongoose.model<IPledge>("Pledge", PledgeSchema);
export type PledgeDocument = IPledge;
export { PledgeSchema };
