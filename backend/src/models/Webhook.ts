import mongoose, { Document, Schema } from "mongoose";

export interface IWebhook extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: Date;
}

const WebhookSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  events: [{ type: String }],
  secret: { type: String, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Indexes
WebhookSchema.index({ userId: 1 });

export default mongoose.model<IWebhook>("Webhook", WebhookSchema);
