import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  walletAddress: string;
  telegramId?: string;
  displayName?: string;
  avatarUrl?: string;
  role: "user" | "moderator" | "admin";
  createdAt: Date;
  lastSeen: Date;
}

const UserSchema: Schema = new Schema({
  walletAddress: { type: String, required: true, unique: true, index: true },
  telegramId: { type: String },
  displayName: { type: String },
  avatarUrl: { type: String },
  role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

// Indexes
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastSeen: -1 });

export default mongoose.model<IUser>("User", UserSchema);
