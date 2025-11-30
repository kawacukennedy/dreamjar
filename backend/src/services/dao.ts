import { Injectable } from "@nestjs/common";
import {
  TonClient,
  WalletContractV4,
  internal,
  toNano,
  beginCell,
} from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";

@Injectable()
export class DAOService {
  private client: TonClient;
  private daoContractAddress: string;

  constructor() {
    this.client = new TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    });
    this.daoContractAddress =
      process.env.DAO_CONTRACT_ADDRESS ||
      "EQC8rUZqR_pWV1BylWUlPNBzyiTYVoBEmQkMIQDZXICfnuRr"; // placeholder
  }

  async proposeImpactPlan(planUri: string): Promise<void> {
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
      .storeStringTail(planUri)
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
  }

  async voteOnProposal(proposalId: number, choice: boolean): Promise<void> {
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
      .storeUint(proposalId, 32)
      .storeUint(choice ? 1 : 0, 1)
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
  }

  async executeProposal(proposalId: number): Promise<void> {
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
      .storeUint(proposalId, 32)
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
  }
}
