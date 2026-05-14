import db from "../config/db";

export class BlockchainDepositInstance {
  id?: number | string;
  userId: string;
  walletAddress: string;
  chain: string; // 'TRON' | 'ETH' | 'SOL' | 'BTC' | 'BNB'
  txHash: string;
  amount: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt?: string;

  constructor(data: any) {
    this.id = data.id;
    this.userId = data.userId || data.user_id;
    this.walletAddress = data.walletAddress || data.wallet_address;
    this.chain = data.chain || data.network;
    this.txHash = data.txHash || data.tx_hash;
    this.amount = data.amount;
    this.confirmations = data.confirmations !== undefined ? data.confirmations : 0;
    this.status = data.status || "pending";
    this.createdAt = data.created_at || data.createdAt;
  }

  async save(): Promise<BlockchainDepositInstance> {
    if (this.id !== undefined) {
      db.prepare(`
        UPDATE blockchain_transactions 
        SET user_id = ?, wallet_address = ?, network = ?, tx_hash = ?, amount = ?, confirmations = ?, status = ?
        WHERE id = ?
      `).run(
        this.userId,
        this.walletAddress,
        this.chain,
        this.txHash,
        this.amount,
        this.confirmations,
        this.status,
        this.id
      );
    } else {
      const info = db.prepare(`
        INSERT INTO blockchain_transactions (user_id, wallet_address, network, tx_hash, amount, confirmations, status, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'deposit')
      `).run(
        this.userId,
        this.walletAddress,
        this.chain,
        this.txHash,
        this.amount,
        this.confirmations,
        this.status
      );
      this.id = Number(info.lastInsertRowid);
    }
    return this;
  }
}

export const BlockchainDeposit = {
  create: async (data: any): Promise<BlockchainDepositInstance> => {
    const deposit = new BlockchainDepositInstance(data);
    await deposit.save();
    return deposit;
  },

  find: async (filter: any = {}): Promise<BlockchainDepositInstance[]> => {
    let query = "SELECT * FROM blockchain_transactions WHERE type = 'deposit'";
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.userId !== undefined || filter.user_id !== undefined) {
      conditions.push("user_id = ?");
      params.push(filter.userId || filter.user_id);
    }
    if (filter.chain !== undefined) {
      conditions.push("network = ?");
      params.push(filter.chain);
    }
    if (filter.status !== undefined) {
      conditions.push("status = ?");
      params.push(filter.status);
    }

    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ");
    }

    query += " ORDER BY id DESC";

    const rows = db.prepare(query).all(...params) as any[];
    return rows.map(row => new BlockchainDepositInstance(row));
  },

  findById: async (id: any): Promise<BlockchainDepositInstance | null> => {
    const row = db.prepare("SELECT * FROM blockchain_transactions WHERE id = ?").get(id) as any;
    return row ? new BlockchainDepositInstance(row) : null;
  }
};

export default BlockchainDeposit;
