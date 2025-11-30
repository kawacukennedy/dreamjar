import mongoose, { Document, Schema } from "mongoose";

export interface IApiKey extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  key: string;
  name: string;
  permissions: string[];
  active: boolean;
  lastUsed?: Date;
  createdAt: Date;
}

const ApiKeySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  permissions: [{ type: String }],
  active: { type: Boolean, default: true },
  lastUsed: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Indexes
ApiKeySchema.index({ key: 1 });
ApiKeySchema.index({ userId: 1 });

export const ApiKey = mongoose.model<IApiKey>("ApiKey", ApiKeySchema);
export type ApiKeyDocument = IApiKey;
export { ApiKeySchema };
