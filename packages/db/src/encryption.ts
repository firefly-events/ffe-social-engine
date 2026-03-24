/**
 * Application-level AES-256-GCM encryption for sensitive fields
 * (OAuth tokens, etc.) stored in MongoDB.
 *
 * Key must be a 32-byte value base64-encoded in ENCRYPTION_KEY env var.
 * GCM provides authenticated encryption — any tampering will throw on decrypt.
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm' as const;
const IV_BYTES = 12; // 96-bit IV — recommended for GCM
const TAG_BYTES = 16;

function getKey(): Buffer {
  const raw = process.env['ENCRYPTION_KEY'];
  if (!raw) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must be 32 bytes when base64-decoded (got ${key.length})`);
  }
  return key;
}

/**
 * Encrypts a UTF-8 string and returns a compact string in the format:
 *   base64(iv):base64(authTag):base64(ciphertext)
 *
 * Returns the input unchanged if ENCRYPTION_KEY is not set (dev mode).
 */
export function encrypt(plaintext: string): string {
  if (!process.env['ENCRYPTION_KEY']) return plaintext;

  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

/**
 * Decrypts a string produced by {@link encrypt}.
 * Throws if authentication fails (data tampered).
 *
 * Returns the input unchanged if it doesn't look like an encrypted value,
 * allowing safe migration of unencrypted legacy records.
 */
export function decrypt(ciphertext: string): string {
  if (!process.env['ENCRYPTION_KEY']) return ciphertext;

  const parts = ciphertext.split(':');
  // Legacy CBC format used two parts (iv:ciphertext); GCM uses three.
  // If not three parts, assume plaintext (unencrypted legacy record).
  if (parts.length !== 3) return ciphertext;

  const [ivB64, tagB64, encB64] = parts as [string, string, string];
  const key = getKey();
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const encrypted = Buffer.from(encB64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
}
