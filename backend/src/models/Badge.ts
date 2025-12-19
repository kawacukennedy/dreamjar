import mongoose, { Document, Schema } from "mongoose";

export interface IBadge extends Document {
  _id: mongoose.Types.ObjectId;
  tokenId: string;
  wishId: mongoose.Types.ObjectId;
  pledgeId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  metadataURI: string;
  contractAddress: string;
  mintedAt: Date;
  transferredAt?: Date;
  burnedAt?: Date;
  status: "minted" | "transferred" | "burned";
}

const BadgeSchema: Schema = new Schema({
  tokenId: { type: String, required: true, unique: true },
  wishId: { type: Schema.Types.ObjectId, ref: "WishJar", required: true },
  pledgeId: { type: Schema.Types.ObjectId, ref: "Pledge", required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  metadataURI: { type: String, required: true },
  contractAddress: { type: String, required: true },
  mintedAt: { type: Date, default: Date.now },
  transferredAt: { type: Date },
  burnedAt: { type: Date },
  status: {
    type: String,
    enum: ["minted", "transferred", "burned"],
    default: "minted",
  },
});

// Indexes
BadgeSchema.index({ tokenId: 1 });
BadgeSchema.index({ ownerId: 1 });
BadgeSchema.index({ wishId: 1 });
BadgeSchema.index({ status: 1 });

export const Badge = mongoose.model<IBadge>("Badge", BadgeSchema);
export type BadgeDocument = IBadge;
export { BadgeSchema };
