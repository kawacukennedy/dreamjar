import { Injectable } from "@nestjs/common";
import {
  TonClient,
  WalletContractV4,
  internal,
  toNano,
  beginCell,
} from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Pledge, PledgeDocument } from "../models/Pledge";
import { User, UserDocument } from "../models/User";

@Injectable()
export class NFTService {
  private client: TonClient;
  private badgeContractAddress: string;

  constructor(
    @InjectModel(Pledge.name) private pledgeModel: Model<PledgeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.client = new TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    });
    this.badgeContractAddress =
      process.env.BADGE_CONTRACT_ADDRESS ||
      "EQC8rUZqR_pWV1BylWUlPNBzyiTYVoBEmQkMIQDZXICfnuRr"; // placeholder
  }

  async mintSupporterBadge(wishId: string): Promise<void> {
    // Get all pledges for the wish
    const pledges = await this.pledgeModel
      .find({ wish_id: wishId })
      .populate("supporter_user_id");

    // Load wallet
    const mnemonic = process.env.WALLET_MNEMONIC?.split(" ");
    if (!mnemonic) throw new Error("WALLET_MNEMONIC not set");

    const key = await mnemonicToWalletKey(mnemonic);
    const wallet = WalletContractV4.create({
      publicKey: key.publicKey,
      workchain: 0,
    });
    const walletContract = this.client.open(wallet);

    // For each pledge, mint an NFT
    for (const pledge of pledges) {
      const user = pledge.supporter_user_id as any; // populated
      const tonAddress = user.wallet_addresses.find(
        (w: any) => w.provider === "ton",
      )?.address;
      if (!tonAddress) continue;

      // Create mint message body
      const body = beginCell()
        .storeUint(0x22222222, 32) // mint op
        .storeAddress(tonAddress) // to address
        .storeStringTail(`ipfs://badge-metadata/${wishId}/${pledge.pledge_id}`) // uri
        .endCell();

      const mintMessage = internal({
        to: this.badgeContractAddress,
        value: toNano("0.05"),
        body,
      });

      await walletContract.sendTransfer({
        secretKey: key.secretKey,
        messages: [mintMessage],
      });
    }
  }
}
