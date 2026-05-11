import db from "../config/db";

export const buyWithCrypto = (req: any, res: any) => {
  const { userId, amount, currency, network } = req.body;
  try {
    // MOCK MODE: Return a fake wallet address for the user to send funds to
    const fakeWallet = "0xORACLELIVE_MOCK_WALLET_" + currency + "_" + network;
    
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, amount, type, status, provider, currency, network, wallet_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(userId, amount, "crypto_purchase", "pending", "mock_crypto", currency, network, fakeWallet);
    
    // Trigger Whale Identification
    import("./growthController").then(m => m.identifyWhale(userId));

    res.json({
      success: true,
      id: result.lastInsertRowid,
      mode: "mock",
      wallet: fakeWallet,
      amount,
      currency,
      network
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to initiate crypto purchase" });
  }
};

export const cryptoWithdraw = (req: any, res: any) => {
  const { userId, amount, currency, walletAddress, network } = req.body;
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    if (!user || user.coins < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, amount, type, status, provider, currency, network, wallet_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(userId, amount, "crypto_withdrawal", "pending", "mock_crypto", currency, network, walletAddress);
    
    res.json({
      success: true,
      mode: "mock",
      message: "Crypto withdrawal request pending"
    });
  } catch (error) {
    res.status(500).json({ error: "Crypto withdrawal failed" });
  }
};

export const updateWallets = (req: any, res: any) => {
  const { userId, btc, eth, usdt } = req.body;
  try {
    db.prepare(`
      UPDATE users 
      SET btc_wallet = ?, eth_wallet = ?, usdt_wallet = ? 
      WHERE id = ?
    `).run(btc, eth, usdt, userId);
    
    res.json({ success: true, message: "Wallets updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update wallets" });
  }
};
