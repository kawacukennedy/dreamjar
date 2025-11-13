import mongoose, { Document, Schema } from "mongoose";

export interface IAnalytics extends Document {
  _id: mongoose.Types.ObjectId;
  event: string;
  userId?: mongoose.Types.ObjectId;
  data?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AnalyticsSchema: Schema = new Schema({
  event: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  data: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Indexes
AnalyticsSchema.index({ event: 1, createdAt: -1 });
AnalyticsSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);
