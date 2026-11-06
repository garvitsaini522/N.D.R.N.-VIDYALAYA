import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateEnvironment } from '../config/env.js';

describe('Environment Variable & Secret Validation Test Suite', () => {
  const validProductionSecret = 'c7f9a2b8e4d1f6a0c5b3e9d2f8a1b4c7d0e3f5a8b2c4d6e9f1a3b5c7d9e2f4a6';
  const validProductionAdminKey = '8e2d4c6a9b1f3e5d7a0c2b4f6e8d1a3c5b7e9f2a4d6c8b0e1f3a5d7c9b2e4f6a';
  const validProductionMongoUri = 'mongodb+srv://app_user:StrongSecretPass992@cluster0.abcde.mongodb.net/ndrn_vidyalaya?retryWrites=true&w=majority';
  const validProductionCors = 'https://ndrnvidyalaya.edu.in,https://www.ndrnvidyalaya.edu.in';

  describe('1. Universal Secret Presence & Baseline Validation', () => {
    it('Rejects configuration when JWT_SECRET is missing', () => {
      const result = validateEnvironment({ ADMIN_SETUP_KEY: 'some_admin_key_123' }, 'development');
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('JWT_SECRET is missing or empty')));
    });

    it('Rejects configuration when ADMIN_SETUP_KEY is missing', () => {
      const result = validateEnvironment({ JWT_SECRET: 'some_jwt_secret_123' }, 'development');
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('ADMIN_SETUP_KEY is missing or empty')));
    });

    it('Rejects configuration when secrets are whitespace only', () => {
      const result = validateEnvironment(
        { JWT_SECRET: '   ', ADMIN_SETUP_KEY: '   ' },
        'development'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('JWT_SECRET is missing or empty')));
      assert.ok(result.errors.some((e) => e.includes('ADMIN_SETUP_KEY is missing or empty')));
    });

    it('Rejects example template placeholder for JWT_SECRET in development', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: 'your_secure_random_jwt_secret_here',
          ADMIN_SETUP_KEY: 'custom_admin_key_dev_123',
        },
        'development'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('JWT_SECRET is set to an unconfigured example placeholder')));
    });

    it('Rejects example template placeholder for ADMIN_SETUP_KEY in development', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: 'custom_jwt_secret_dev_123',
          ADMIN_SETUP_KEY: 'your_secure_admin_bootstrap_key_here',
        },
        'development'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('ADMIN_SETUP_KEY is set to an unconfigured example placeholder')));
    });

    it('Rejects changeme placeholders', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: 'changeme',
          ADMIN_SETUP_KEY: 'change_me',
        },
        'development'
      );
      assert.strictEqual(result.isValid, false);
    });

    it('Rejects angle bracket and prefix template placeholders', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: '<jwt_secret>',
          ADMIN_SETUP_KEY: 'your_admin_setup_key_here',
        },
        'development'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('JWT_SECRET is set to an unconfigured example placeholder')));
      assert.ok(result.errors.some((e) => e.includes('ADMIN_SETUP_KEY is set to an unconfigured example placeholder')));
    });
  });

  describe('2. Strict Production Cryptographic & Isolation Requirements', () => {
    it('Rejects production JWT_SECRET with less than 32 characters (256-bit entropy)', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: 'short_secret_under_32_chars',
          ADMIN_SETUP_KEY: validProductionAdminKey,
          MONGODB_URI: validProductionMongoUri,
          CORS_ORIGIN: validProductionCors,
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('at least 32 characters long')));
    });

    it('Rejects production ADMIN_SETUP_KEY with less than 16 characters', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: 'short_key_123',
          MONGODB_URI: validProductionMongoUri,
          CORS_ORIGIN: validProductionCors,
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('at least 16 characters long')));
    });

    it('Rejects identical JWT_SECRET and ADMIN_SETUP_KEY (requires independently generated secrets)', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: validProductionSecret, // Duplicate
          MONGODB_URI: validProductionMongoUri,
          CORS_ORIGIN: validProductionCors,
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('must be distinct, independently generated secrets')));
    });

    it('Rejects production JWT_SECRET containing known development / fallback patterns', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: 'dev_jwt_secret_ndrn_change_in_production_9921_extra_padding',
          ADMIN_SETUP_KEY: validProductionAdminKey,
          MONGODB_URI: validProductionMongoUri,
          CORS_ORIGIN: validProductionCors,
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('contains an insecure, default, or placeholder pattern')));
    });

    it('Rejects production ADMIN_SETUP_KEY containing fallback pattern', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: 'ndrn_admin_secure_setup_bootstrap_key_2026',
          MONGODB_URI: validProductionMongoUri,
          CORS_ORIGIN: validProductionCors,
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('contains an insecure, default, or placeholder pattern')));
    });
  });

  describe('3. Production Database & CORS Security Validation', () => {
    it('Rejects production configuration when MONGODB_URI is missing', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: validProductionAdminKey,
          CORS_ORIGIN: validProductionCors,
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('MONGODB_URI environment variable is required')));
    });

    it('Rejects production MONGODB_URI containing unconfigured <username> or <password> placeholders', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: validProductionAdminKey,
          MONGODB_URI: 'mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/ndrn',
          CORS_ORIGIN: validProductionCors,
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('contains unconfigured template placeholders')));
    });

    it('Rejects production MONGODB_URI pointing to unauthenticated localhost', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: validProductionAdminKey,
          MONGODB_URI: 'mongodb://127.0.0.1:27017/ndrn_vidyalaya',
          CORS_ORIGIN: validProductionCors,
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('points to an unauthenticated local development host')));
    });

    it('Rejects production configuration when CORS_ORIGIN is missing', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: validProductionAdminKey,
          MONGODB_URI: validProductionMongoUri,
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('CORS_ORIGIN environment variable is required')));
    });

    it('Rejects production CORS_ORIGIN containing wildcard (*)', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: validProductionAdminKey,
          MONGODB_URI: validProductionMongoUri,
          CORS_ORIGIN: '*',
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('cannot contain wildcard (*)')));
    });
  });

  describe('4. Valid Configuration Acceptance & Secret Privacy in Diagnostics', () => {
    it('Accepts high-entropy distinct production secrets and valid cloud database with explicit CORS', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: validProductionAdminKey,
          MONGODB_URI: validProductionMongoUri,
          CORS_ORIGIN: validProductionCors,
        },
        'production'
      );
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('Accepts valid local development secrets and local database', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: 'ndrn_local_dev_secret_unique_key_123',
          ADMIN_SETUP_KEY: 'ndrn_local_admin_bootstrap_key_123',
          MONGODB_URI: 'mongodb://127.0.0.1:27017/ndrn_vidyalaya',
        },
        'development'
      );
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('Never leaks actual secret values in error diagnostic messages', () => {
      const sensitiveLeakProbeSecret = 'SECRET_VALUE_THAT_MUST_NEVER_APPEAR_IN_LOGS';
      const result = validateEnvironment(
        {
          JWT_SECRET: sensitiveLeakProbeSecret, // < 32 chars in production
          ADMIN_SETUP_KEY: sensitiveLeakProbeSecret,
          MONGODB_URI: 'mongodb://127.0.0.1:27017/test',
        },
        'production'
      );

      assert.strictEqual(result.isValid, false);
      for (const err of result.errors) {
        assert.strictEqual(
          err.includes(sensitiveLeakProbeSecret),
          false,
          `Error message leaked the secret value: "${err}"`
        );
      }
    });
  });

  describe('5. Optional Payment Gateway Security & Parameter Integrity', () => {
    it('Rejects production payment gateway when key ID is a placeholder', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: validProductionAdminKey,
          MONGODB_URI: validProductionMongoUri,
          CORS_ORIGIN: validProductionCors,
          PAYMENT_GATEWAY_PROVIDER: 'razorpay',
          PAYMENT_GATEWAY_KEY_ID: 'your_payment_gateway_key_id',
          PAYMENT_GATEWAY_KEY_SECRET: 'live_sec_1234567890abcdef',
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('PAYMENT_GATEWAY_KEY_ID is set to an unconfigured example placeholder')));
    });

    it('Rejects production payment gateway when key secret is missing', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: validProductionAdminKey,
          MONGODB_URI: validProductionMongoUri,
          CORS_ORIGIN: validProductionCors,
          PAYMENT_GATEWAY_PROVIDER: 'razorpay',
          PAYMENT_GATEWAY_KEY_ID: 'rzp_live_real_id_9921',
        },
        'production'
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('PAYMENT_GATEWAY_KEY_SECRET is required when PAYMENT_GATEWAY_KEY_ID is configured')));
    });

    it('Accepts fully configured, authentic production payment gateway credentials', () => {
      const result = validateEnvironment(
        {
          JWT_SECRET: validProductionSecret,
          ADMIN_SETUP_KEY: validProductionAdminKey,
          MONGODB_URI: validProductionMongoUri,
          CORS_ORIGIN: validProductionCors,
          PAYMENT_GATEWAY_PROVIDER: 'razorpay',
          PAYMENT_GATEWAY_KEY_ID: 'rzp_live_abc1234567890',
          PAYMENT_GATEWAY_KEY_SECRET: 'live_sec_abcdef1234567890',
          PAYMENT_GATEWAY_WEBHOOK_SECRET: 'whsec_9876543210abcdef',
        },
        'production'
      );
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
    });
  });
});
