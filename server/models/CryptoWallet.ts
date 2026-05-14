import db from "../config/db";

export class CryptoWalletInstance {
  id?: number;
  userId: string;
  chain: string; // 'TRON' | 'ETH' | 'SOL' | 'BTC' | 'BNB'
  address: string;
  encryptedPrivateKey: string;
  balance: number;
  walletType: 'hot' | 'cold' | 'user';
  created_at?: string;
  updated_at?: string;

  constructor(data: any) {
    this.id = data.id;
    this.userId = data.userId || data.user_id;
    this.chain = data.chain;
    this.address = data.address;
    this.encryptedPrivateKey = data.encryptedPrivateKey || data.encrypted_private_key;
    this.balance = data.balance !== undefined ? data.balance : 0;
    this.walletType = data.walletType || data.wallet_type || "user";
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  async save(): Promise<CryptoWalletInstance> {
    if (this.id !== undefined) {
      db.prepare(`
        UPDATE crypto_wallets 
        SET user_id = ?, chain = ?, address = ?, encrypted_private_key = ?, balance = ?, wallet_type = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        this.userId,
        this.chain,
        this.address,
        this.encryptedPrivateKey,
        this.balance,
        this.walletType,
        this.id
      );
    } else {
      const info = db.prepare(`
        INSERT INTO crypto_wallets (user_id, chain, address, encrypted_private_key, balance, wallet_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        this.userId,
        this.chain,
        this.address,
        this.encryptedPrivateKey,
        this.balance,
        this.walletType
      );
      this.id = Number(info.lastInsertRowid);
    }
    return this;
  }
}

export const CryptoWallet = {
  create: async (data: any): Promise<CryptoWalletInstance> => {
    const wallet = new CryptoWalletInstance(data);
    await wallet.save();
    return wallet;
  },

  find: async (filter: any = {}): Promise<CryptoWalletInstance[]> => {
    let query = "SELECT * FROM crypto_wallets";
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.userId !== undefined || filter.user_id !== undefined) {
      conditions.push("user_id = ?");
      params.push(filter.userId || filter.user_id);
    }
    if (filter.chain !== undefined) {
      conditions.push("chain = ?");
      params.push(filter.chain);
    }
    if (filter.walletType !== undefined || filter.wallet_type !== undefined) {
      conditions.push("wallet_type = ?");
      params.push(filter.walletType || filter.wallet_type);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const rows = db.prepare(query).all(...params) as any[];
    return rows.map(row => new CryptoWalletInstance(row));
  },

  findOne: async (filter: any = {}): Promise<CryptoWalletInstance | null> => {
    let query = "SELECT * FROM crypto_wallets";
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.userId !== undefined || filter.user_id !== undefined) {
      conditions.push("user_id = ?");
      params.push(filter.userId || filter.user_id);
    }
    if (filter.chain !== undefined) {
      conditions.push("chain = ?");
      params.push(filter.chain);
    }
    if (filter.walletType !== undefined || filter.wallet_type !== undefined) {
      conditions.push("wallet_type = ?");
      params.push(filter.walletType || filter.wallet_type);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " LIMIT 1";

    const row = db.prepare(query).get(...params) as any;
    return row ? new CryptoWalletInstance(row) : null;
  },

  findById: async (id: any): Promise<CryptoWalletInstance | null> => {
    const row = db.prepare("SELECT * FROM crypto_wallets WHERE id = ?").get(id) as any;
    return row ? new CryptoWalletInstance(row) : null;
  }
};

export default CryptoWallet;
