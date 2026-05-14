import { createTronWallet } from "../blockchain/tronWallet";
import { createEthWallet } from "../blockchain/ethWallet";
import { createSolWallet } from "../blockchain/solWallet";
import { createBTCWallet } from "../blockchain/btcWallet";
import { CryptoWallet } from "../models/CryptoWallet";

export async function createUserWallets(userId: string): Promise<void> {
  try {
    const existing = await CryptoWallet.find({ userId });
    if (existing && existing.length > 0) {
      console.log(`Wallets already exist for user ${userId}. Skipping generation.`);
      return;
    }

    const tron = createTronWallet();
    const eth = createEthWallet();
    const sol = createSolWallet();
    const btc = createBTCWallet();

    const wallets = [
      { chain: "TRON", ...tron },
      { chain: "ETH", ...eth },
      { chain: "SOL", ...sol },
      { chain: "BTC", ...btc },
    ];

    for (const w of wallets) {
      await CryptoWallet.create({
        userId,
        chain: w.chain,
        address: w.address,
        encryptedPrivateKey: w.privateKey,
        balance: 0,
        walletType: "user"
      });
    }

    console.log(`Successfully generated multi-chain wallets for user: ${userId}`);
  } catch (error) {
    console.error("Failed to generate user wallets:", error);
  }
}
