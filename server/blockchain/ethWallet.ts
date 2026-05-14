import { ethers } from "ethers";
import { encrypt } from "../utils/encryption";

export function createEthWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: encrypt(wallet.privateKey),
  };
}
