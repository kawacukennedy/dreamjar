import mongoose, { Document, Schema } from "mongoose";

export interface IWishJar extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category?: string;
  metadataURI?: string;
  contractAddress: string;
  stakeAmount: number;
  pledgedAmount: number;
  deadline: Date;
  status: "Active" | "ResolvedSuccess" | "ResolvedFail";
  validatorMode: "community" | "designatedValidators";
  validators?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WishJarSchema: Schema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  metadataURI: { type: String },
  contractAddress: { type: String, required: true },
  stakeAmount: { type: Number, required: true },
  pledgedAmount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Active", "ResolvedSuccess", "ResolvedFail"],
    default: "Active",
  },
  validatorMode: {
    type: String,
    enum: ["community", "designatedValidators"],
    required: true,
  },
  validators: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

// Indexes
WishJarSchema.index({ ownerId: 1, createdAt: -1 });
WishJarSchema.index({ status: 1, deadline: 1 });
WishJarSchema.index({ category: 1 }); // If we add category field
WishJarSchema.index({ pledgedAmount: -1 });
WishJarSchema.index({ title: "text", description: "text" }); // Full-text search

export default mongoose.model<IWishJar>("WishJar", WishJarSchema);
