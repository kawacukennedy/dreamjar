import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  walletAddress: string;
  telegramId?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  lastSeen: Date;
}

const UserSchema: Schema = new Schema({
  walletAddress: { type: String, required: true, unique: true },
  telegramId: { type: String },
  displayName: { type: String },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
