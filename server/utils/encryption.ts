import crypto from "crypto";

const algorithm = "aes-256-cbc";

function getKey(): Buffer {
  const secret = process.env.WALLET_SECRET || "ORACLE_STATIC_FALLBACK_WALLET_SECRET_SECURE_DEV_KEY_123";
  return crypto
    .createHash("sha256")
    .update(secret)
    .digest();
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(text: string): string {
  const parts = text.split(":");
  if (parts.length < 2) {
    throw new Error("Invalid encrypted text format");
  }
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
