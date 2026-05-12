
import axios from "axios";
import { paystackConfig } from "../config/paystack";

// SAFE MOCK MODE
const MOCK_MODE = true;

interface PayoutParams {
  amount: number;
  bankCode: string;
  accountNumber: string;
  currency?: string;
}

export async function sendFiatPayout({
  amount,
  bankCode,
  accountNumber,
  currency = "GHS",
}: PayoutParams) {
  try {
    // MOCK RESPONSE
    if (MOCK_MODE) {
      return {
        success: true,
        transferCode: "MOCK_TRANSFER_" + Date.now(),
        status: "processing",
      };
    }

    // REAL PAYSTACK
    const response = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        amount: amount * 100,
        recipient: accountNumber,
        reason: "Oracle Live Withdrawal",
        currency,
      },
      {
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data,
      transferCode: response.data.data.transfer_code,
      status: response.data.data.status
    };
  } catch (err: any) {
    console.error("Paystack Payout Error:", err.response?.data || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
}
