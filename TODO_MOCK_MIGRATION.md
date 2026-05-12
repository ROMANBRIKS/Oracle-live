# Mock Migration To-Todo List

This file tracks the features currently running in **Demo Mode** using mock data. Once you provide the real API keys, follow this guide to "flip the switch" and go live.

## 🔑 Required Secrets Checklist
Provide these in your Environment Variables to enable real functionality:

- [ ] `AGORA_APP_ID` & `AGORA_APP_CERT`: Required for live streaming.
- [ ] `PAYSTACK_SECRET_KEY` & `PAYSTACK_PUBLIC_KEY`: Required for processing real money payments.
- [ ] `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Required for Google Login.
- [ ] `JWT_SECRET`: (Optional) Change "oracle_secret_fallback" to a secure long string.
- [ ] Crypto Hot Wallets (BTC, ETH, USDT, TRX, SOL, BNB):
    - `[SYMBOL]_HOT_WALLET`: The public address.
    - `[SYMBOL]_PRIVATE_KEY`: The key needed to move funds (Keep safe!).

---

## 🛠️ Current Mock Implementations (Switching Guide)

### 1. Live Streaming (Agora)
- **Current State**: Using custom "DEMO_TOKEN" logic in `server/routes/agoraRoutes.ts`.
- **How to revert**: The code is written to use real Agora logic if `AGORA_APP_ID` is present. No code changes needed, just add the keys.

### 2. Payments (Paystack)
- **Current State**: `server/utils/paystackEngine.ts` returns a simulated successful transaction if the secret key is missing.
- **How to revert**: Once `PAYSTACK_SECRET_KEY` is provided, real API requests will execute automatically.

### 3. Blockchain Wallets
- **Current State**: `server/config/blockchainWallets.ts` uses static demo addresses if environment variables are not found.
- **How to revert**: Fill in the `_HOT_WALLET` variables to see your real balance/addresses in the app.

### 4. Google Login
- **Current State**: If `GOOGLE_CLIENT_ID` is missing, the backend `/auth/google` route redirects to a bypass route `/auth/callback/google/mock` which creates a demo user session.
- **How to revert**: Simply add your Google OAuth credentials.

---

## 🚀 Deployment Instructions
1. Add all missing keys to your deployment environment.
2. Restart the server.
3. The app will automatically detect the presence of keys and disable "Demo Mode" logic for those specific features.
