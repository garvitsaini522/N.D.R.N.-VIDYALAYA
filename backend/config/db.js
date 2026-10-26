import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

/**
 * Connect to MongoDB database
 */
export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const { uri, options } = config.mongodb;

  // Sanitize URI for safe logging (hides password if present)
  const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(uri, options);
    isConnected = true;

    console.log(`[MongoDB] Connected to database: "${conn.connection.name}" at host: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`[MongoDB] Initial connection error: ${error.message} (Target: ${safeUri})`);
    isConnected = false;
    // In dev/test, don't crash immediately so health checks and mock tests can run
    if (config.env === 'production') {
      throw error;
    }
    return null;
  }
}

// Connection event listeners
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('[MongoDB] Connection established successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Connection lost/disconnected.');
});

/**
 * Get current MongoDB connection status for health monitoring
 */
export function getDbStatus() {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const readyState = mongoose.connection.readyState;
  const status = stateMap[readyState] || 'unknown';

  return {
    status,
    readyState,
    isConnected: readyState === 1,
    database: mongoose.connection.name || null,
    host: mongoose.connection.host || null,
  };
}

/**
 * Disconnect from MongoDB (useful for test teardown and graceful shutdown)
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected cleanly.');
  }
}
