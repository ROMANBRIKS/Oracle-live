import { TronWeb } from "tronweb";
import { encrypt } from "../utils/encryption";

export function createTronWallet() {
  let account: any;
  try {
    const tronWebInstance = new (TronWeb as any)({ fullHost: "https://api.trongrid.io" });
    account = tronWebInstance.createAccount();
  } catch (err) {
    // Static fallback
    account = (TronWeb as any).createAccount();
  }

  const base58Address = typeof account.address === 'object' ? account.address.base58 : account.address;

  if (!base58Address || !account.privateKey) {
    throw new Error("Failed to generate TRON account");
  }

  return {
    address: base58Address,
    privateKey: encrypt(account.privateKey),
  };
}
