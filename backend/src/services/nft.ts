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
import { Pledge, PledgeDocument } from "../models/Pledge";
import { User, UserDocument } from "../models/User";
import { Badge, BadgeDocument } from "../models/Badge";
import { MonitoringService } from "./monitoring";

@Injectable()
export class NFTService {
  private client: TonClient;
  private badgeContractAddress: string;

  constructor(
    @InjectModel(Pledge.name) private pledgeModel: Model<PledgeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Badge.name) private badgeModel: Model<BadgeDocument>,
    private monitoring: MonitoringService,
  ) {
    this.client = new TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    });
    this.badgeContractAddress =
      process.env.BADGE_CONTRACT_ADDRESS ||
      "EQC8rUZqR_pWV1BylWUlPNBzyiTYVoBEmQkMIQDZXICfnuRr"; // placeholder
  }

  async mintSupporterBadge(wishId: string): Promise<void> {
    try {
      // Get all confirmed pledges for the wish
      const pledges = await this.pledgeModel
        .find({
          wish_id: wishId,
          status: "confirmed",
        })
        .populate("supporter_user_id");

      if (pledges.length === 0) {
        this.monitoring.info(`No confirmed pledges found for wish ${wishId}`);
        return;
      }

      // Load wallet
      const mnemonic = process.env.WALLET_MNEMONIC?.split(" ");
      if (!mnemonic) throw new Error("WALLET_MNEMONIC not set");

      const key = await mnemonicToWalletKey(mnemonic);
      const wallet = WalletContractV4.create({
        publicKey: key.publicKey,
        workchain: 0,
      });
      const walletContract = this.client.open(wallet);

      const messages = [];

      // For each pledge, mint an NFT
      for (const pledge of pledges) {
        const user = pledge.supporter_user_id as any; // populated
        const tonAddress = user.wallet_addresses.find(
          (w: any) => w.provider === "TonConnect" || w.provider === "TonKeep",
        )?.address;

        if (!tonAddress) {
          this.monitoring.warn(`No TON address found for user ${user._id}`);
          continue;
        }

        // Generate unique token ID
        const tokenId = `badge_${wishId}_${pledge.pledge_id}`;

        // Check if badge already exists
        const existingBadge = await this.badgeModel.findOne({ tokenId });
        if (existingBadge) {
          this.monitoring.info(`Badge ${tokenId} already exists`);
          continue;
        }

        // Create metadata URI
        const metadataURI = await this.generateBadgeMetadata(wishId, pledge);

        // Create mint message body
        const body = beginCell()
          .storeUint(0x22222222, 32) // mint op
          .storeUint(BigInt(tokenId), 256) // token id
          .storeAddress(Address.parse(tonAddress)) // to address
          .storeStringTail(metadataURI) // metadata uri
          .endCell();

        messages.push(
          internal({
            to: this.badgeContractAddress,
            value: toNano("0.05"),
            body,
          }),
        );

        // Create badge record in database
        await this.badgeModel.create({
          tokenId,
          wishId,
          pledgeId: pledge._id,
          ownerId: user._id,
          metadataURI,
          contractAddress: this.badgeContractAddress,
          status: "minted",
        });

        this.monitoring.audit("badge_minted", {
          tokenId,
          wishId,
          pledgeId: pledge.pledge_id,
          ownerId: user._id,
          tonAddress,
        });
      }

      if (messages.length > 0) {
        await walletContract.sendTransfer({
          secretKey: key.secretKey,
          messages,
        });

        this.monitoring.info(
          `Minted ${messages.length} badges for wish ${wishId}`,
        );
      }
    } catch (error) {
      this.monitoring.error("Failed to mint supporter badges", error);
      throw error;
    }
  }

  async transferBadge(
    tokenId: string,
    fromUserId: string,
    toAddress: string,
  ): Promise<void> {
    const badge = await this.badgeModel.findOne({ tokenId });
    if (!badge) throw new Error("Badge not found");

    if (badge.ownerId.toString() !== fromUserId) {
      throw new Error("Not badge owner");
    }

    // Load wallet
    const mnemonic = process.env.WALLET_MNEMONIC?.split(" ");
    if (!mnemonic) throw new Error("WALLET_MNEMONIC not set");

    const key = await mnemonicToWalletKey(mnemonic);
    const wallet = WalletContractV4.create({
      publicKey: key.publicKey,
      workchain: 0,
    });
    const walletContract = this.client.open(wallet);

    // Create transfer message
    const body = beginCell()
      .storeUint(0x33333333, 32) // transfer op
      .storeUint(BigInt(tokenId), 256) // token id
      .storeAddress(Address.parse(toAddress)) // to address
      .endCell();

    await walletContract.sendTransfer({
      secretKey: key.secretKey,
      messages: [
        internal({
          to: this.badgeContractAddress,
          value: toNano("0.05"),
          body,
        }),
      ],
    });

    // Update badge record
    badge.status = "transferred";
    badge.transferredAt = new Date();
    await badge.save();

    this.monitoring.audit("badge_transferred", {
      tokenId,
      fromUserId,
      toAddress,
    });
  }

  async burnBadge(tokenId: string, ownerId: string): Promise<void> {
    const badge = await this.badgeModel.findOne({ tokenId });
    if (!badge) throw new Error("Badge not found");

    if (badge.ownerId.toString() !== ownerId) {
      throw new Error("Not badge owner");
    }

    // Load wallet
    const mnemonic = process.env.WALLET_MNEMONIC?.split(" ");
    if (!mnemonic) throw new Error("WALLET_MNEMONIC not set");

    const key = await mnemonicToWalletKey(mnemonic);
    const wallet = WalletContractV4.create({
      publicKey: key.publicKey,
      workchain: 0,
    });
    const walletContract = this.client.open(wallet);

    // Create burn message
    const body = beginCell()
      .storeUint(0x44444444, 32) // burn op
      .storeUint(BigInt(tokenId), 256) // token id
      .endCell();

    await walletContract.sendTransfer({
      secretKey: key.secretKey,
      messages: [
        internal({
          to: this.badgeContractAddress,
          value: toNano("0.05"),
          body,
        }),
      ],
    });

    // Update badge record
    badge.status = "burned";
    badge.burnedAt = new Date();
    await badge.save();

    this.monitoring.audit("badge_burned", {
      tokenId,
      ownerId,
    });
  }

  async getUserBadges(userId: string): Promise<BadgeDocument[]> {
    return this.badgeModel
      .find({ ownerId: userId, status: { $ne: "burned" } })
      .populate("wishId", "title description")
      .populate("pledgeId", "amount_microton");
  }

  async getBadgeMetadata(tokenId: string): Promise<any> {
    const badge = await this.badgeModel
      .findOne({ tokenId })
      .populate("wishId", "title description")
      .populate("pledgeId", "amount_microton");

    if (!badge) throw new Error("Badge not found");

    return {
      tokenId: badge.tokenId,
      name: `DreamJar Supporter Badge`,
      description: `Supporter badge for pledge to "${badge.wishId.title}"`,
      image: `ipfs://badge-image/${badge.tokenId}`,
      attributes: [
        {
          trait_type: "Pledge Amount",
          value: badge.pledgeId.amount_microton / 1000000, // Convert to TON
          display_type: "number",
          unit: "TON",
        },
        {
          trait_type: "Wish",
          value: badge.wishId.title,
        },
        {
          trait_type: "Status",
          value: badge.status,
        },
      ],
    };
  }

  private async generateBadgeMetadata(
    wishId: string,
    pledge: any,
  ): Promise<string> {
    // In a real implementation, this would upload metadata to IPFS
    // For now, return a placeholder URI
    return `ipfs://badge-metadata/${wishId}/${pledge.pledge_id}`;
  }
}
