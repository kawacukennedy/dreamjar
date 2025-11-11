import mongoose, { Document, Schema } from "mongoose";

export interface IPledge extends Document {
  _id: mongoose.Types.ObjectId;
  wishJarId: mongoose.Types.ObjectId;
  supporterId: mongoose.Types.ObjectId;
  amount: number;
  txHash: string;
  mintedBadgeTokenId?: string;
  createdAt: Date;
}

const PledgeSchema: Schema = new Schema({
  wishJarId: { type: Schema.Types.ObjectId, ref: "WishJar", required: true },
  supporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  txHash: { type: String, required: true },
  mintedBadgeTokenId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPledge>("Pledge", PledgeSchema);
