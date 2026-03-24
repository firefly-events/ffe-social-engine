import mongoose, { type ConnectOptions } from 'mongoose';

const MONGODB_URI = process.env['MONGODB_URI'];

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

/**
 * Cached connection promise so we don't open multiple connections
 * in the same process (important for Next.js hot-reload and serverless).
 */
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const options: ConnectOptions = {
    dbName: 'social_engine',
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5_000,
    socketTimeoutMS: 45_000,
  };
  connectionPromise = mongoose.connect(MONGODB_URI!, options);

  connectionPromise.catch(() => {
    // Reset so next call retries
    connectionPromise = null;
  });

  return connectionPromise;
}

export async function disconnectDB(): Promise<void> {
  connectionPromise = null;
  await mongoose.disconnect();
}

export { mongoose };
