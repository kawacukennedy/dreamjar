import { Injectable } from "@nestjs/common";
import {
  TonClient,
  WalletContractV4,
  internal,
  toNano,
  beginCell,
  Address,
} from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Proposal, ProposalDocument } from "../models/Proposal";
import { MonitoringService } from "./monitoring";

@Injectable()
export class DAOService {
  private client: TonClient;
  private daoContractAddress: string;

  constructor(
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    private monitoring: MonitoringService,
  ) {
    this.client = new TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    });
    this.daoContractAddress =
      process.env.DAO_CONTRACT_ADDRESS ||
      "EQC8rUZqR_pWV1BylWUlPNBzyiTYVoBEmQkMIQDZXICfnuRr"; // placeholder
  }

  async proposeImpactPlan(
    proposerId: string,
    title: string,
    description: string,
    amountRequested: number,
    beneficiary: string,
    planUri?: string,
  ): Promise<ProposalDocument> {
    // Create proposal in database first
    const lastProposal = await this.proposalModel
      .findOne()
      .sort({ proposalId: -1 });
    const nextId = lastProposal ? lastProposal.proposalId + 1 : 1;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7); // 7 days voting period

    const proposal = new this.proposalModel({
      proposalId: nextId,
      proposerId,
      title,
      description,
      planURI: planUri,
      amountRequested,
      beneficiary,
      deadline,
    });

    await proposal.save();

    // Submit to blockchain
    try {
      const mnemonic = process.env.WALLET_MNEMONIC?.split(" ");
      if (!mnemonic) throw new Error("WALLET_MNEMONIC not set");

      const key = await mnemonicToWalletKey(mnemonic);
      const wallet = WalletContractV4.create({
        publicKey: key.publicKey,
        workchain: 0,
      });
      const walletContract = this.client.open(wallet);

      const body = beginCell()
        .storeUint(0x33333333, 32) // propose op
        .storeUint(nextId, 256) // proposal id
        .storeStringTail(planUri || `proposal-${nextId}`) // plan uri
        .storeUint(amountRequested, 64) // amount
        .storeStringTail(beneficiary) // beneficiary
        .endCell();

      const proposeMessage = internal({
        to: this.daoContractAddress,
        value: toNano("0.1"),
        body,
      });

      await walletContract.sendTransfer({
        secretKey: key.secretKey,
        messages: [proposeMessage],
      });

      this.monitoring.info(`Submitted proposal ${nextId} to DAO contract`);
    } catch (error) {
      this.monitoring.error("Failed to submit proposal to DAO contract", error);
      // Don't throw - proposal is still created in DB
    }

    return proposal;
  }

  async voteOnProposal(
    proposalId: number,
    voterId: string,
    choice: boolean,
  ): Promise<void> {
    // Update database first
    const proposal = await this.proposalModel.findOne({ proposalId });
    if (!proposal) throw new Error("Proposal not found");

    if (choice) {
      proposal.votesFor += 1;
    } else {
      proposal.votesAgainst += 1;
    }
    proposal.totalVotes += 1;
    await proposal.save();

    // Submit to blockchain
    try {
      const mnemonic = process.env.WALLET_MNEMONIC?.split(" ");
      if (!mnemonic) throw new Error("WALLET_MNEMONIC not set");

      const key = await mnemonicToWalletKey(mnemonic);
      const wallet = WalletContractV4.create({
        publicKey: key.publicKey,
        workchain: 0,
      });
      const walletContract = this.client.open(wallet);

      const body = beginCell()
        .storeUint(0x44444444, 32) // vote op
        .storeUint(proposalId, 256) // proposal id
        .storeUint(choice ? 1 : 0, 1) // vote choice
        .endCell();

      const voteMessage = internal({
        to: this.daoContractAddress,
        value: toNano("0.05"),
        body,
      });

      await walletContract.sendTransfer({
        secretKey: key.secretKey,
        messages: [voteMessage],
      });

      this.monitoring.info(
        `Submitted vote for proposal ${proposalId} to DAO contract`,
      );
    } catch (error) {
      this.monitoring.error("Failed to submit vote to DAO contract", error);
      // Don't throw - vote is still recorded in DB
    }
  }

  async executeProposal(proposalId: number): Promise<void> {
    // Check database first
    const proposal = await this.proposalModel.findOne({ proposalId });
    if (!proposal) throw new Error("Proposal not found");

    if (proposal.status !== "passed") {
      throw new Error("Proposal has not passed");
    }

    // Submit to blockchain
    try {
      const mnemonic = process.env.WALLET_MNEMONIC?.split(" ");
      if (!mnemonic) throw new Error("WALLET_MNEMONIC not set");

      const key = await mnemonicToWalletKey(mnemonic);
      const wallet = WalletContractV4.create({
        publicKey: key.publicKey,
        workchain: 0,
      });
      const walletContract = this.client.open(wallet);

      const body = beginCell()
        .storeUint(0x55555555, 32) // execute op
        .storeUint(proposalId, 256) // proposal id
        .endCell();

      const executeMessage = internal({
        to: this.daoContractAddress,
        value: toNano("0.05"),
        body,
      });

      await walletContract.sendTransfer({
        secretKey: key.secretKey,
        messages: [executeMessage],
      });

      // Update database
      proposal.status = "executed";
      proposal.executedAt = new Date();
      await proposal.save();

      this.monitoring.info(`Executed proposal ${proposalId} on DAO contract`);
    } catch (error) {
      this.monitoring.error(
        "Failed to execute proposal on DAO contract",
        error,
      );
      throw error;
    }
  }
}
