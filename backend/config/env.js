import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const activeNodeEnv = process.env.NODE_ENV || 'development';

// Priority 1: Load environment-specific configuration (.env.production, .env.development, etc.)
dotenv.config({ path: path.resolve(__dirname, `../.env.${activeNodeEnv}`) });
dotenv.config({ path: path.resolve(__dirname, `../../.env.${activeNodeEnv}`) });

// Priority 2: Fall back to standard .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProd = (process.env.NODE_ENV || 'development') === 'production';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodb: {
    uri: process.env.MONGODB_URI || (isProd ? null : 'mongodb://127.0.0.1:27017/ndrn_vidyalaya'),
    options: {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  adminSetupKey: process.env.ADMIN_SETUP_KEY,
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
      : isProd
        ? []
        : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300, // Limit each IP to 300 requests per windowMs
  },
  paymentGateway: {
    provider: process.env.PAYMENT_GATEWAY_PROVIDER || null, // 'razorpay' | 'payu' | null
    keyId: process.env.PAYMENT_GATEWAY_KEY_ID || null,
    keySecret: process.env.PAYMENT_GATEWAY_KEY_SECRET || null,
    webhookSecret: process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET || null,
    enabled: Boolean(
      process.env.PAYMENT_GATEWAY_KEY_ID &&
      process.env.PAYMENT_GATEWAY_KEY_SECRET &&
      !['placeholder', 'your_key_id', 'test_key'].includes((process.env.PAYMENT_GATEWAY_KEY_ID || '').toLowerCase())
    ),
  },
  school: {
    name: 'N.D.R.N. Vidyalaya',
    village: 'Daulatyarpur',
    town: 'Madhoganj',
    state: 'Uttar Pradesh',
    country: 'India',
  },
};

/**
 * Validate environment variables and configuration secrets.
 * Ensures:
 * - JWT_SECRET and ADMIN_SETUP_KEY are provided and non-empty.
 * - Placeholder / default example strings are rejected.
 * - In production, secrets must be high-entropy, distinct (independently generated),
 *   and adhere to minimum cryptographic length recommendations.
 * - Secret values are NEVER echoed into log messages or diagnostic outputs.
 *
 * @param {Record<string, string>} env
 * @param {string} nodeEnv
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateEnvironment(env = process.env, nodeEnv = config.env) {
  const errors = [];
  const rawJwtSecret = env.JWT_SECRET;
  const rawAdminKey = env.ADMIN_SETUP_KEY;
  const rawMongoUri = env.MONGODB_URI;

  const jwtSecret = typeof rawJwtSecret === 'string' ? rawJwtSecret.trim() : '';
  const adminSetupKey = typeof rawAdminKey === 'string' ? rawAdminKey.trim() : '';
  const mongoUri = typeof rawMongoUri === 'string' ? rawMongoUri.trim() : '';

  // 1. Mandatory presence in all environments
  if (!jwtSecret) {
    errors.push('JWT_SECRET is missing or empty. Please set JWT_SECRET in your environment or .env file.');
  }
  if (!adminSetupKey) {
    errors.push('ADMIN_SETUP_KEY is missing or empty. Please set ADMIN_SETUP_KEY in your environment or .env file.');
  }

  // 2. Reject known example template placeholders in all environments
  const TEMPLATE_PLACEHOLDERS = [
    'your_secure_random_jwt_secret_here',
    'your_secure_admin_bootstrap_key_here',
    'your_jwt_secret_here',
    'your_admin_setup_key_here',
    'your_jwt_secret',
    'your_admin_key',
    'your_secret_here',
    'replace_with_your_secret',
    'change_in_production',
    '<jwt_secret>',
    '<admin_setup_key>',
    'changeme',
    'change_me',
  ];

  const isTemplatePlaceholder = (val) => {
    if (!val) return false;
    const lower = val.toLowerCase();
    return (
      TEMPLATE_PLACEHOLDERS.includes(lower) ||
      /^<.*>$/.test(val) ||
      lower.includes('placeholder') ||
      lower.startsWith('your_') ||
      lower.includes('test_key')
    );
  };

  if (jwtSecret && isTemplatePlaceholder(jwtSecret)) {
    errors.push('JWT_SECRET is set to an unconfigured example placeholder. A real secret key is required.');
  }
  if (adminSetupKey && isTemplatePlaceholder(adminSetupKey)) {
    errors.push('ADMIN_SETUP_KEY is set to an unconfigured example placeholder. A real secret key is required.');
  }

  // 3. Strict production validation
  if (nodeEnv === 'production') {
    const INSECURE_PRODUCTION_PATTERNS = [
      'dev_jwt_secret',
      'ndrn_admin_secure_setup_bootstrap_key_2026',
      'ndrn_vidyalaya_jwt_secret_key_2026_secure_hash_token_primary',
      'default',
      'placeholder',
      'example',
      'secret',
      'password',
      '123456',
      'admin123',
    ];

    if (jwtSecret) {
      const lower = jwtSecret.toLowerCase();
      const matched = INSECURE_PRODUCTION_PATTERNS.find((p) => lower.includes(p));
      if (matched) {
        errors.push('In production, JWT_SECRET contains an insecure, default, or placeholder pattern.');
      }
      if (jwtSecret.length < 32) {
        errors.push('In production, JWT_SECRET must be at least 32 characters long to ensure cryptographic security (256-bit entropy).');
      }
    }

    if (adminSetupKey) {
      const lower = adminSetupKey.toLowerCase();
      const matched = INSECURE_PRODUCTION_PATTERNS.find((p) => lower.includes(p));
      if (matched) {
        errors.push('In production, ADMIN_SETUP_KEY contains an insecure, default, or placeholder pattern.');
      }
      if (adminSetupKey.length < 16) {
        errors.push('In production, ADMIN_SETUP_KEY must be at least 16 characters long.');
      }
    }

    // Require independently generated secrets
    if (jwtSecret && adminSetupKey && jwtSecret === adminSetupKey) {
      errors.push('In production, JWT_SECRET and ADMIN_SETUP_KEY must be distinct, independently generated secrets.');
    }

    // MongoDB URI production enforcement
    if (!mongoUri) {
      errors.push('In production, MONGODB_URI environment variable is required.');
    } else {
      if (mongoUri.includes('<username>') || mongoUri.includes('<password>')) {
        errors.push('In production, MONGODB_URI contains unconfigured template placeholders (<username> or <password>).');
      }
      if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
        errors.push('In production, MONGODB_URI points to an unauthenticated local development host.');
      }
    }

    // CORS origin production enforcement
    const rawCors = env.CORS_ORIGIN;
    if (!rawCors || !rawCors.trim()) {
      errors.push('In production, CORS_ORIGIN environment variable is required to explicitly whitelist frontend domains.');
    } else if (rawCors.includes('*')) {
      errors.push('In production, CORS_ORIGIN cannot contain wildcard (*) when credentials are enabled.');
    }

    // Payment Gateway production enforcement (if configured)
    const paymentKeyId = env.PAYMENT_GATEWAY_KEY_ID;
    const paymentKeySecret = env.PAYMENT_GATEWAY_KEY_SECRET;
    if (paymentKeyId || paymentKeySecret) {
      if (paymentKeyId && isTemplatePlaceholder(paymentKeyId)) {
        errors.push('In production, PAYMENT_GATEWAY_KEY_ID is set to an unconfigured example placeholder.');
      }
      if (paymentKeySecret && isTemplatePlaceholder(paymentKeySecret)) {
        errors.push('In production, PAYMENT_GATEWAY_KEY_SECRET is set to an unconfigured example placeholder.');
      }
      if (paymentKeyId && !paymentKeySecret) {
        errors.push('In production, PAYMENT_GATEWAY_KEY_SECRET is required when PAYMENT_GATEWAY_KEY_ID is configured.');
      }
      if (!paymentKeyId && paymentKeySecret) {
        errors.push('In production, PAYMENT_GATEWAY_KEY_ID is required when PAYMENT_GATEWAY_KEY_SECRET is configured.');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Perform startup validation
const validationResult = validateEnvironment(process.env, config.env);
if (!validationResult.isValid) {
  console.error('FATAL: Environment configuration validation failed:');
  for (const errorMsg of validationResult.errors) {
    console.error(`  - ${errorMsg}`);
  }
  process.exit(1);
}
