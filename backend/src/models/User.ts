import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  display_name: string;
  avatar_url?: string;
  wallet_addresses: Array<{
    address: string;
    connected_at: Date;
    provider: string;
  }>;
  created_at: Date;
  bio?: string;
  statistics: {
    created_wishes_count: number;
    completed_wishes_count: number;
    supporter_badges_count: number;
  };
  preferences: {
    notifications: {
      telegram_mentions: boolean;
      email: boolean;
    };
    locale: string;
  };
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  display_name: { type: String, required: true },
  avatar_url: { type: String },
  wallet_addresses: [
    {
      address: { type: String, required: true },
      connected_at: { type: Date, default: Date.now },
      provider: { type: String, required: true },
    },
  ],
  created_at: { type: Date, default: Date.now },
  bio: { type: String },
  statistics: {
    created_wishes_count: { type: Number, default: 0 },
    completed_wishes_count: { type: Number, default: 0 },
    supporter_badges_count: { type: Number, default: 0 },
  },
  preferences: {
    notifications: {
      telegram_mentions: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
    },
    locale: { type: String, default: "en" },
  },
});

// Indexes
UserSchema.index({ username: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
export type UserDocument = IUser;
export { UserSchema };
