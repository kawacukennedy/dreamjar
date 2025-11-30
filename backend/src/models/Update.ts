import mongoose, { Document, Schema } from "mongoose";

export interface IUpdate extends Document {
  _id: mongoose.Types.ObjectId;
  wish_id: mongoose.Types.ObjectId;
  author_user_id: mongoose.Types.ObjectId;
  content: string;
  media: Array<{
    type: "image" | "video" | "document";
    url: string;
    thumbnail_url?: string;
  }>;
  created_at: Date;
  verified_proof_metadata?: object;
}

const UpdateSchema: Schema = new Schema({
  wish_id: { type: Schema.Types.ObjectId, ref: "WishJar", required: true },
  author_user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxLength: 2000 },
  media: [
    {
      type: { type: String, enum: ["image", "video", "document"] },
      url: { type: String, required: true },
      thumbnail_url: { type: String },
    },
  ],
  created_at: { type: Date, default: Date.now },
  verified_proof_metadata: { type: Schema.Types.Mixed },
});

// Indexes
UpdateSchema.index({ wish_id: 1, created_at: -1 });

export const Update = mongoose.model<IUpdate>("Update", UpdateSchema);
export type UpdateDocument = IUpdate;
export { UpdateSchema };
