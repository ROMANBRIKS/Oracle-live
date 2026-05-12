import axios from "axios";

interface PaystackPayoutParams {
  amount: number;
  recipient: string;
  reason: string;
}

export async function sendPaystackPayout({ amount, recipient, reason }: PaystackPayoutParams) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.log(`[DEMO MODE] Simulating Paystack Payout: ${amount} to ${recipient} (${reason})`);
    return { status: true, message: "Demo Transfer Successful", data: { reference: `demo_${Date.now()}` } };
  }
  try {
    const response = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        amount: Math.round(amount * 100), // convert to kobo
        recipient,
        reason,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    console.error("Paystack Payout Error:", err.response?.data || err.message);
    return null;
  }
}
