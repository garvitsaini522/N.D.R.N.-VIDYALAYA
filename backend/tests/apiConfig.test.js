import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseResponseBody, getAuthHeaders, getApiBaseUrl, getApiConfigStatus } from '../../src/services/apiConfig.js';
import { corsMiddleware } from '../middleware/securityMiddleware.js';
import { config } from '../config/env.js';

describe('Frontend API Configuration & CORS Test Suite', () => {
  describe('1. API Base URL Resolution & Environment Fallbacks', () => {
    it('Uses explicit VITE_API_URL when configured (absolute domain)', () => {
      const url = getApiBaseUrl({ VITE_API_URL: 'https://api.ndrnvidyalaya.edu.in/api' });
      assert.strictEqual(url, 'https://api.ndrnvidyalaya.edu.in/api');
    });

    it('Uses explicit VITE_API_URL when configured (relative reverse proxy path)', () => {
      const url = getApiBaseUrl({ VITE_API_URL: '/api' });
      assert.strictEqual(url, '/api');
    });

    it('Trims whitespace and strips redundant trailing slashes from VITE_API_URL', () => {
      const url = getApiBaseUrl({ VITE_API_URL: '  https://api.ndrnvidyalaya.edu.in/api///  ' });
      assert.strictEqual(url, 'https://api.ndrnvidyalaya.edu.in/api');
    });

    it('Falls back to relative "/api" in production builds when VITE_API_URL is omitted', () => {
      const url = getApiBaseUrl({ PROD: true });
      assert.strictEqual(url, '/api');
    });

    it('Falls back to localhost in development environments when VITE_API_URL is omitted', () => {
      const url = getApiBaseUrl({ PROD: false, NODE_ENV: 'development' });
      assert.strictEqual(url, 'http://localhost:5000/api');
    });

    it('getApiConfigStatus reports explicit environment strategy correctly', () => {
      const status = getApiConfigStatus({ VITE_API_URL: 'https://api.ndrnvidyalaya.edu.in/api' });
      assert.strictEqual(status.isConfigured, true);
      assert.strictEqual(status.strategy, 'explicit_environment_variable');
      assert.strictEqual(status.baseUrl, 'https://api.ndrnvidyalaya.edu.in/api');
    });

    it('getApiConfigStatus reports production relative reverse proxy fallback correctly', () => {
      const status = getApiConfigStatus({ PROD: true });
      assert.strictEqual(status.isConfigured, false);
      assert.strictEqual(status.isProduction, true);
      assert.strictEqual(status.strategy, 'production_relative_reverse_proxy');
      assert.strictEqual(status.baseUrl, '/api');
    });
  });

  describe('2. Header & Token Standard Handling', () => {
    it('Creates default headers with JSON Content-Type and Accept', () => {
      const headers = getAuthHeaders();
      assert.strictEqual(headers['Content-Type'], 'application/json');
      assert.strictEqual(headers['Accept'], 'application/json');
    });

    it('Preserves custom headers and attaches Authorization token if present in storage', () => {
      // Mock global localStorage
      global.localStorage = {
        getItem: (key) => (key === 'ndrn_auth_token' ? 'test_jwt_bearer_token_123' : null),
      };

      try {
        const headers = getAuthHeaders({ 'x-custom-request': 'test' });
        assert.strictEqual(headers.Authorization, 'Bearer test_jwt_bearer_token_123');
        assert.strictEqual(headers['x-custom-request'], 'test');
      } finally {
        delete global.localStorage;
      }
    });

    it('Does not attach Authorization header when no token is in storage', () => {
      global.localStorage = {
        getItem: () => null,
      };

      try {
        const headers = getAuthHeaders();
        assert.strictEqual(headers.Authorization, undefined);
      } finally {
        delete global.localStorage;
      }
    });
  });

  describe('3. Response Parsing & Error Extraction', () => {
    it('Returns null for 204 No Content', async () => {
      const mockRes = {
        status: 204,
        headers: { get: () => '' },
      };
      const result = await parseResponseBody(mockRes);
      assert.strictEqual(result, null);
    });

    it('Parses valid JSON response', async () => {
      const mockRes = {
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true, data: { id: 1 } }),
      };
      const result = await parseResponseBody(mockRes);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.id, 1);
    });

    it('Throws descriptive error on malformed JSON payload', async () => {
      const mockRes = {
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      };
      await assert.rejects(
        async () => parseResponseBody(mockRes),
        (err) => {
          assert.ok(err.message.includes('Invalid JSON response from server'));
          return true;
        }
      );
    });

    it('Safely extracts HTML / text error response without crashing JSON parser', async () => {
      const mockRes = {
        status: 502,
        statusText: 'Bad Gateway',
        headers: { get: () => 'text/html' },
        text: async () => '<html><body>502 Bad Gateway</body></html>',
      };
      const result = await parseResponseBody(mockRes);
      assert.ok(result.message.includes('502 Bad Gateway'));
    });
  });

  describe('4. Backend CORS Whitelist Enforcement', () => {
    function createMockRes() {
      const headers = {};
      return {
        setHeader: (k, v) => {
          headers[k] = v;
        },
        getHeader: (k) => headers[k],
      };
    }

    it('Allows requests without origin (server-to-server / curl / mobile)', (t, done) => {
      const res = createMockRes();
      corsMiddleware({ headers: {} }, res, (err) => {
        assert.strictEqual(err, undefined);
        done();
      });
    });

    it('Allows explicitly whitelisted origins', (t, done) => {
      const res = createMockRes();
      const allowedOrigin = config.cors.origin[0];
      corsMiddleware({ headers: { origin: allowedOrigin } }, res, (err) => {
        assert.strictEqual(err, undefined);
        done();
      });
    });

    it('Rejects untrusted external origin when production mode is simulated', (t, done) => {
      const res = createMockRes();
      const originalEnv = config.env;
      config.env = 'production';

      try {
        corsMiddleware({ headers: { origin: 'https://malicious-site.com' } }, res, (err) => {
          assert.ok(err, 'Expected CORS error');
          assert.ok(err.message.includes('CORS blocked for origin'));
          done();
        });
      } finally {
        config.env = originalEnv;
      }
    });
  });
});
