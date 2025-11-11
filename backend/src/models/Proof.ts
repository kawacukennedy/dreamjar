import mongoose, { Document, Schema } from "mongoose";

export interface IProof extends Document {
  _id: mongoose.Types.ObjectId;
  wishJarId: mongoose.Types.ObjectId;
  uploaderId: mongoose.Types.ObjectId;
  mediaURI: string;
  mediaHash: string;
  caption?: string;
  createdAt: Date;
}

const ProofSchema: Schema = new Schema({
  wishJarId: { type: Schema.Types.ObjectId, ref: "WishJar", required: true },
  uploaderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  mediaURI: { type: String, required: true },
  mediaHash: { type: String, required: true },
  caption: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProof>("Proof", ProofSchema);
