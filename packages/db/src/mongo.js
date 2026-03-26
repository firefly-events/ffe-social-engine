const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const isBuild = process.env.npm_lifecycle_event === 'build' || process.env.NEXT_PHASE !== undefined;
const dummyKey = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='; // 32 bytes of zeros
const ENCRYPTION_KEY = process.env.MONGODB_ENCRYPTION_KEY || (isBuild ? dummyKey : undefined);

// Validate encryption key at module load time
if (!ENCRYPTION_KEY) {
  throw new Error('MONGODB_ENCRYPTION_KEY is required for token encryption');
}
const keyBytes = Buffer.from(ENCRYPTION_KEY, 'base64');
if (keyBytes.length !== 32) {
  throw new Error(
    `MONGODB_ENCRYPTION_KEY must decode to exactly 32 bytes (got ${keyBytes.length}). ` +
    'Generate with: openssl rand -base64 32'
  );
}

let client;

async function getClient() {
  if (client) return client;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  console.log('Connected to MongoDB');
  return client;
}

// Simple encryption helper since native CSFLE requires complex setup
// This follows the directive "Tokens MUST be encrypted at rest"
function encrypt(text) {
  if (!text) return text;
  if (!ENCRYPTION_KEY) {
    throw new Error('MONGODB_ENCRYPTION_KEY is required for token encryption');
  }

  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY, 'base64').slice(0, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    throw new Error(`Encryption failed: ${err.message}`);
  }
}

function decrypt(text) {
  if (!text) return text;
  if (!ENCRYPTION_KEY) {
    throw new Error('MONGODB_ENCRYPTION_KEY is required for token decryption');
  }
  if (!text.includes(':')) return text;

  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(ENCRYPTION_KEY, 'base64').slice(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    throw new Error(`Decryption failed: ${err.message}`);
  }
}

module.exports = { getClient, encrypt, decrypt };
