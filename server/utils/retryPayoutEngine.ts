import { TransactionInstance } from "../models/Transaction";

export async function retryPayout(transaction: TransactionInstance) {
  if (transaction.retryCount >= 3) {
    transaction.status = "failed";
    await transaction.save();
    console.warn(`[RETRY PAYOUT] Transaction ${transaction.id} exceeded maximum retries. Status marked as failed.`);
    return;
  }

  transaction.retryCount += 1;
  transaction.status = "processing";
  await transaction.save();

  console.log(`[RETRY PAYOUT] Retrying payout. Attempt: ${transaction.retryCount} for transaction: ${transaction.id}`);
  // Background processing integration hook populated here
}
