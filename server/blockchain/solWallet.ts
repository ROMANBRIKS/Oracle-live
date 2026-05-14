import { Keypair } from "@solana/web3.js";
import { encrypt } from "../utils/encryption";

export function createSolWallet() {
  const keypair = Keypair.generate();
  return {
    address: keypair.publicKey.toBase58(),
    privateKey: encrypt(
      Buffer.from(keypair.secretKey).toString("hex")
    ),
  };
}
