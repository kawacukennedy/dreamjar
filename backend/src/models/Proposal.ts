import mongoose, { Document, Schema } from "mongoose";

export interface IProposal extends Document {
  _id: mongoose.Types.ObjectId;
  proposalId: number;
  proposerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  planURI?: string;
  amountRequested: number;
  beneficiary: string; // DAO/charity identifier
  status: "active" | "passed" | "failed" | "executed";
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorumReached: boolean;
  deadline: Date;
  executedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProposalSchema: Schema = new Schema({
  proposalId: { type: Number, required: true, unique: true },
  proposerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxLength: 200 },
  description: { type: String, required: true, maxLength: 2000 },
  planURI: { type: String },
  amountRequested: { type: Number, required: true, min: 0 },
  beneficiary: { type: String, required: true },
  status: {
    type: String,
    enum: ["active", "passed", "failed", "executed"],
    default: "active",
  },
  votesFor: { type: Number, default: 0 },
  votesAgainst: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  quorumReached: { type: Boolean, default: false },
  deadline: { type: Date, required: true },
  executedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
ProposalSchema.index({ proposalId: 1 });
ProposalSchema.index({ status: 1 });
ProposalSchema.index({ deadline: 1 });
ProposalSchema.index({ proposerId: 1 });

export const Proposal = mongoose.model<IProposal>("Proposal", ProposalSchema);
export type ProposalDocument = IProposal;
export { ProposalSchema };
