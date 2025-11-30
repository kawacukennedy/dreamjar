import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  walletAddress: string;
  telegramId?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  role: "user" | "moderator" | "admin";
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    pledges: boolean;
    proofs: boolean;
    resolutions: boolean;
    deadlines: boolean;
  };
  createdAt: Date;
  lastSeen: Date;
}

const UserSchema: Schema = new Schema({
  walletAddress: { type: String, required: true, unique: true, index: true },
  telegramId: { type: String },
  email: { type: String, sparse: true },
  displayName: { type: String },
  avatarUrl: { type: String },
  role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    pledges: { type: Boolean, default: true },
    proofs: { type: Boolean, default: true },
    resolutions: { type: Boolean, default: true },
    deadlines: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

// Indexes
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastSeen: -1 });

export const User = mongoose.model<IUser>("User", UserSchema);
export type UserDocument = IUser;
export { UserSchema };
