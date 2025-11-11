import { TonClient, WalletContractV4, internal, toNano } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import * as fs from "fs";
import * as path from "path";

// Load contract code
const loadContractCode = (filename: string): Buffer => {
  const filePath = path.join(__dirname, "../../contracts", filename);
  return fs.readFileSync(filePath);
};

// Deploy WishJarFactory
async function deployWishJarFactory() {
  const client = new TonClient({
    endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  });

  // Load mnemonic from env
  const mnemonic = process.env.WALLET_MNEMONIC?.split(" ");
  if (!mnemonic) throw new Error("WALLET_MNEMONIC not set");

  const key = await mnemonicToWalletKey(mnemonic);
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

  const walletContract = client.open(wallet);

  // Load contract code
  const code = loadContractCode("WishJarFactory.tvc"); // Assuming compiled

  // Deploy
  const contract = client.open(/* WishJarFactory contract */);

  // Send deploy transaction
  await walletContract.sendTransfer({
    secretKey: key.secretKey,
    messages: [
      internal({
        to: contract.address,
        value: toNano("0.1"),
        init: { code, data: /* initial data */ },
      }),
    ],
  });

  console.log("WishJarFactory deployed at:", contract.address.toString());
}

deployWishJarFactory().catch(console.error);