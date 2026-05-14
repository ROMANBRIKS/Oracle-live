import { Transaction } from "../models/Transaction";

export interface DepositParams {
  userId: string;
  amount: number;
  currency: string;
  method: string;
}

export interface WithdrawalParams {
  userId: string;
  amount: number;
  currency: string;
  method: string;
}

export async function createDeposit({
  userId,
  amount,
  currency,
  method,
}: DepositParams) {
  return await Transaction.create({
    userId,
    amount,
    currency,
    method,
    type: "deposit",
    status: "pending",
  });
}

export async function createWithdrawal({
  userId,
  amount,
  currency,
  method,
}: WithdrawalParams) {
  return await Transaction.create({
    userId,
    amount,
    currency,
    method,
    type: "withdrawal",
    status: "pending",
  });
}
