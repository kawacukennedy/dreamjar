import mongoose, { Document, Schema } from "mongoose";

export interface IVote extends Document {
  _id: mongoose.Types.ObjectId;
  wishJarId: mongoose.Types.ObjectId;
  voterId: mongoose.Types.ObjectId;
  choice: "yes" | "no";
  weight: number;
  txHash?: string;
  createdAt: Date;
}

const VoteSchema: Schema = new Schema({
  wishJarId: { type: Schema.Types.ObjectId, ref: "WishJar", required: true },
  voterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  choice: { type: String, enum: ["yes", "no"], required: true },
  weight: { type: Number, default: 1 },
  txHash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IVote>("Vote", VoteSchema);
