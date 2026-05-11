import db from "../config/db";
import wallets from "../config/blockchainWallets";

interface SendCryptoParams {
  userId: string;
  currency: string;
  amount: number;
  walletAddress: string;
}

/**
 * MOCK ENGINE
 * In a real app, this would use real blockchain SDKs (ethers, bitcoinjs, etc.)
 */
export async function sendCrypto({
  userId,
  currency,
  amount,
  walletAddress,
}: SendCryptoParams) {
  try {
    const config = wallets[currency];

    if (!config) {
      throw new Error("Unsupported currency");
    }

    // MOCK TX HASH
    const txHash = "TX_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

    // Record the transaction in our database
    const stmt = db.prepare(`
      INSERT INTO blockchain_transactions (
        user_id, currency, amount, wallet_address, tx_hash, network, status, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      currency,
      amount,
      walletAddress,
      txHash,
      config.network,
      "broadcasted",
      "withdrawal"
    );

    return {
      success: true,
      txHash,
      id: result.lastInsertRowid,
    };
  } catch (err: any) {
    console.error("Blockchain Engine Error:", err);
    return {
      success: false,
      message: err.message,
    };
  }
}
