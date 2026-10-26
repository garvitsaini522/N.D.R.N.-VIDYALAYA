import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory or project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ndrn_vidyalaya',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_ndrn_change_in_production_9921',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  adminSetupKey: process.env.ADMIN_SETUP_KEY || 'ndrn_admin_secure_setup_bootstrap_key_2026',
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300, // Limit each IP to 300 requests per windowMs
  },
  school: {
    name: 'N.D.R.N. Vidyalaya',
    village: 'Daulatyarpur',
    town: 'Madhoganj',
    state: 'Uttar Pradesh',
    country: 'India',
  },
};

// Validate that in production, sensitive variables must not be default
if (config.env === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('dev_jwt_secret')) {
    console.error('FATAL: In production, JWT_SECRET must be set to a secure random string.');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('FATAL: In production, MONGODB_URI environment variable is required.');
    process.exit(1);
  }
}
