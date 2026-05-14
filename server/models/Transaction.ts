import db from "../config/db";

export class TransactionInstance {
  id?: number | string;
  userId: string;
  type: string;
  method: string;
  currency: string;
  amount: number;
  status: string;
  txHash?: string;
  providerReference?: string;
  retryCount: number;
  created_at?: string;

  constructor(data: any) {
    this.id = data.id;
    this.userId = data.userId || data.user_id;
    this.type = data.type;
    this.method = data.method || data.provider;
    this.currency = data.currency || "USD";
    this.amount = data.amount;
    this.status = data.status || "pending";
    this.txHash = data.txHash || data.tx_hash;
    this.providerReference = data.providerReference || data.provider_reference;
    this.retryCount = data.retryCount !== undefined ? data.retryCount : (data.retry_count !== undefined ? data.retry_count : 0);
    this.created_at = data.created_at;
  }

  async save(): Promise<TransactionInstance> {
    if (this.id !== undefined) {
      db.prepare(`
        UPDATE transactions 
        SET user_id = ?, type = ?, method = ?, currency = ?, amount = ?, status = ?, tx_hash = ?, provider_reference = ?, retry_count = ?
        WHERE id = ?
      `).run(
        this.userId,
        this.type,
        this.method,
        this.currency,
        this.amount,
        this.status,
        this.txHash || null,
        this.providerReference || null,
        this.retryCount,
        this.id
      );
    } else {
      const info = db.prepare(`
        INSERT INTO transactions (user_id, type, method, currency, amount, status, tx_hash, provider_reference, retry_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        this.userId,
        this.type,
        this.method,
        this.currency,
        this.amount,
        this.status,
        this.txHash || null,
        this.providerReference || null,
        this.retryCount
      );
      this.id = Number(info.lastInsertRowid);
    }
    return this;
  }
}

export const Transaction = {
  create: async (data: any): Promise<TransactionInstance> => {
    const tx = new TransactionInstance(data);
    await tx.save();
    return tx;
  },

  find: async (filter: any = {}): Promise<TransactionInstance[]> => {
    let query = "SELECT * FROM transactions";
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.status !== undefined) {
      conditions.push("status = ?");
      params.push(filter.status);
    }
    if (filter.userId !== undefined || filter.user_id !== undefined) {
      conditions.push("user_id = ?");
      params.push(filter.userId || filter.user_id);
    }
    if (filter.type !== undefined) {
      conditions.push("type = ?");
      params.push(filter.type);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY id DESC";

    const rows = db.prepare(query).all(...params) as any[];
    return rows.map(row => new TransactionInstance(row));
  },

  findById: async (id: any): Promise<TransactionInstance | null> => {
    const row = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as any;
    return row ? new TransactionInstance(row) : null;
  }
};

export default Transaction;
