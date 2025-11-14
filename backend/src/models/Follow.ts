import mongoose, { Schema, Document } from "mongoose";

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId; // User who is following
  following: mongoose.Types.ObjectId; // User being followed
  createdAt: Date;
}

const FollowSchema: Schema = new Schema({
  follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
  following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to prevent duplicate follows
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

export default mongoose.model<IFollow>("Follow", FollowSchema);
