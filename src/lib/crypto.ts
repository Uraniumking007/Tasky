import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt,
  createHash,
} from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Get encryption key from environment or generate a fallback
const getEncryptionKey = async (): Promise<Buffer> => {
  const secretKey =
    process.env.ENCRYPTION_KEY || "tasky-default-key-32-chars-long";

  // Derive a 32-byte key using scrypt
  const key = await scryptAsync(secretKey, "tasky-salt", 32);
  return key as Buffer;
};

/**
 * Encrypt data using AES-256-GCM
 */
export async function encrypt(data: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-gcm", key, iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Combine IV, encrypted data, and auth tag
    const result =
      iv.toString("hex") + ":" + encrypted + ":" + authTag.toString("hex");

    return result;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const key = await getEncryptionKey();

    // Split the encrypted data into IV, encrypted text, and auth tag
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const ivHex = parts[0];
    const encrypted = parts[1];
    const authTagHex = parts[2];

    if (!ivHex || !encrypted || !authTagHex) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Generate a secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

/**
 * Hash data using SHA-256
 */
export function hash(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}
