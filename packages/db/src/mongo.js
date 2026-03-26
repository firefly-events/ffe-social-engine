const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.MONGODB_ENCRYPTION_KEY; // Should be base64 encoded

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
  if (!ENCRYPTION_KEY) return text; // No key, no encryption

  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY, 'base64').slice(0, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('Encryption error:', err);
    return text;
  }
}

function decrypt(text) {
  if (!text) return text;
  if (!ENCRYPTION_KEY) return text;
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
    console.error('Decryption error:', err);
    return text;
  }
}

module.exports = { getClient, encrypt, decrypt };
