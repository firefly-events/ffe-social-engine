/**
 * AES-256-GCM encryption utilities for OAuth token storage.
 *
 * Key: 64-char hex string (32 bytes) stored in env OAUTH_TOKEN_ENCRYPTION_KEY.
 * GCP Secret Manager:
 *   - dev:  social-engine-dev-oauth-token-encryption-key
 *   - prod: social-engine-prod-oauth-token-encryption-key
 *
 * Ciphertext format (all base64url, colon-separated):
 *   <iv>:<authTag>:<ciphertext>
 *
 * Generate a key locally:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit tag

function getKey(): Buffer {
  const hex = process.env.OAUTH_TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "OAUTH_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
        "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a base64url-encoded string in the format: <iv>:<authTag>:<ciphertext>
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

/**
 * Decrypt a ciphertext string produced by `encrypt()`.
 * Throws if the key is wrong or the ciphertext has been tampered with.
 */
export function decrypt(ciphertext: string): string {
  const key = getKey();

  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid ciphertext format. Expected <iv>:<authTag>:<ciphertext>");
  }

  const [ivB64, authTagB64, encryptedB64] = parts;
  const iv = Buffer.from(ivB64, "base64url");
  const authTag = Buffer.from(authTagB64, "base64url");
  const encrypted = Buffer.from(encryptedB64, "base64url");

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
