import { describe, it } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';
import { errorHandler, notFoundHandler } from '../middleware/errorMiddleware.js';
import { ApiError } from '../utils/apiError.js';

describe('Database Connection Failures & Global Error Handling Test Suite', () => {
  function createMockContext({ method = 'GET', originalUrl = '/api/test', body = {} } = {}) {
    const req = {
      method,
      originalUrl,
      body,
      headers: {},
    };

    let statusCode = 200;
    let jsonBody = null;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(payload) {
        jsonBody = payload;
        return this;
      },
    };

    let nextCalled = false;
    let nextError = null;
    const next = (err) => {
      if (err) nextError = err;
      else nextCalled = true;
    };

    return {
      req,
      res,
      next,
      wasNextCalled: () => nextCalled,
      getError: () => nextError,
      getResponse: () => ({ status: statusCode, body: jsonBody }),
    };
  }

  // =========================================================================
  // 1. requireDatabase Middleware State Checks
  // =========================================================================
  describe('1. Database Connection States (requireDatabase)', () => {
    const originalReadyState = mongoose.connection.readyState;

    function setMongooseReadyState(val) {
      Object.defineProperty(mongoose.connection, 'readyState', {
        value: val,
        configurable: true,
        writable: true,
      });
    }

    it('Rejects requests with 503 Service Unavailable when readyState is 0 (Disconnected)', () => {
      setMongooseReadyState(0);
      try {
        const ctx = createMockContext();
        requireDatabase(ctx.req, ctx.res, ctx.next);

        assert.strictEqual(ctx.wasNextCalled(), false);
        const res = ctx.getResponse();
        assert.strictEqual(res.status, 503);
        assert.strictEqual(res.body.success, false);
        assert.ok(res.body.message.includes('Database connection is currently unavailable'));
      } finally {
        setMongooseReadyState(originalReadyState);
      }
    });

    it('Rejects requests with 503 Service Unavailable when readyState is 2 (Connecting)', () => {
      setMongooseReadyState(2);
      try {
        const ctx = createMockContext();
        requireDatabase(ctx.req, ctx.res, ctx.next);

        assert.strictEqual(ctx.wasNextCalled(), false);
        const res = ctx.getResponse();
        assert.strictEqual(res.status, 503);
        assert.strictEqual(res.body.success, false);
      } finally {
        setMongooseReadyState(originalReadyState);
      }
    });

    it('Rejects requests with 503 Service Unavailable when readyState is 3 (Disconnecting)', () => {
      setMongooseReadyState(3);
      try {
        const ctx = createMockContext();
        requireDatabase(ctx.req, ctx.res, ctx.next);

        assert.strictEqual(ctx.wasNextCalled(), false);
        const res = ctx.getResponse();
        assert.strictEqual(res.status, 503);
      } finally {
        setMongooseReadyState(originalReadyState);
      }
    });

    it('Calls next() when readyState is 1 (Active Database Connection)', () => {
      setMongooseReadyState(1);
      try {
        const ctx = createMockContext();
        requireDatabase(ctx.req, ctx.res, ctx.next);

        assert.strictEqual(ctx.wasNextCalled(), true);
      } finally {
        setMongooseReadyState(originalReadyState);
      }
    });
  });

  // =========================================================================
  // 2. Global Error Handler (errorHandler)
  // =========================================================================
  describe('2. Global Error Handler & Status Mapping', () => {
    it('Handles ApiError instances with custom HTTP status codes', () => {
      const errorCases = [
        { err: ApiError.badRequest('Invalid input payload'), expectedStatus: 400 },
        { err: ApiError.unauthorized('Authentication required'), expectedStatus: 401 },
        { err: ApiError.forbidden('Access forbidden for student'), expectedStatus: 403 },
        { err: ApiError.notFound('Record not found'), expectedStatus: 404 },
        { err: ApiError.conflict('Duplicate record detected'), expectedStatus: 409 },
      ];

      for (const { err, expectedStatus } of errorCases) {
        const ctx = createMockContext();
        errorHandler(err, ctx.req, ctx.res, ctx.next);
        const res = ctx.getResponse();
        assert.strictEqual(res.status, expectedStatus);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.message, err.message);
      }
    });

    it('Transforms Mongoose ValidationError into 400 Bad Request with field details', () => {
      const validationErr = new Error('Database validation failed');
      validationErr.name = 'ValidationError';
      validationErr.errors = {
        fullName: { path: 'fullName', message: 'Student full name is required' },
        class: { path: 'class', message: 'Class assignment is required' },
      };

      const ctx = createMockContext();
      errorHandler(validationErr, ctx.req, ctx.res, ctx.next);

      const res = ctx.getResponse();
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Database validation failed');
      assert.ok(Array.isArray(res.body.errors));
      assert.strictEqual(res.body.errors.length, 2);
      assert.strictEqual(res.body.errors[0].field, 'fullName');
      assert.strictEqual(res.body.errors[1].field, 'class');
    });

    it('Transforms Mongoose CastError into 400 Bad Request', () => {
      const castErr = new Error('Cast to ObjectId failed');
      castErr.name = 'CastError';
      castErr.path = 'classId';

      const ctx = createMockContext();
      errorHandler(castErr, ctx.req, ctx.res, ctx.next);

      const res = ctx.getResponse();
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("Invalid format for field 'classId'"));
    });

    it('Transforms Mongoose duplicate key error (code 11000) into 409 Conflict', () => {
      const dupErr = new Error('Duplicate key');
      dupErr.code = 11000;
      dupErr.keyValue = { admissionNumber: 'NDRN-2026-0001' };

      const ctx = createMockContext();
      errorHandler(dupErr, ctx.req, ctx.res, ctx.next);

      const res = ctx.getResponse();
      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("admissionNumber 'NDRN-2026-0001' already exists"));
    });

    it('Transforms JWT errors into 401 Unauthorized', () => {
      const jwtErr = new Error('jwt malformed');
      jwtErr.name = 'JsonWebTokenError';

      const ctx1 = createMockContext();
      errorHandler(jwtErr, ctx1.req, ctx1.res, ctx1.next);
      assert.strictEqual(ctx1.getResponse().status, 401);
      assert.strictEqual(ctx1.getResponse().body.message, 'Invalid authentication token');

      const expErr = new Error('jwt expired');
      expErr.name = 'TokenExpiredError';

      const ctx2 = createMockContext();
      errorHandler(expErr, ctx2.req, ctx2.res, ctx2.next);
      assert.strictEqual(ctx2.getResponse().status, 401);
      assert.strictEqual(ctx2.getResponse().body.message, 'Authentication token has expired');
    });

    it('Sanitizes database URIs and credentials from error responses', () => {
      const sensitiveErr = new Error('Failed to connect to mongodb://admin:SecretPassword123@10.0.0.1:27017/ndrn_prod');
      sensitiveErr.statusCode = 503;

      const ctx = createMockContext();
      errorHandler(sensitiveErr, ctx.req, ctx.res, ctx.next);

      const res = ctx.getResponse();
      assert.strictEqual(res.body.message.includes('SecretPassword123'), false, 'Password must not be leaked');
      assert.ok(res.body.message.includes('[REDACTED_DATABASE_URI]'));
    });

    it('Masks internal 500 error messages and suppresses stack trace in production', () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const unexpectedErr = new Error('Database crash: table corrupted /var/data/cluster');

        const ctx = createMockContext();
        errorHandler(unexpectedErr, ctx.req, ctx.res, ctx.next);

        const res = ctx.getResponse();
        assert.strictEqual(res.status, 500);
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(
          res.body.message,
          'An unexpected internal server error occurred. Please contact system administration.'
        );
        assert.strictEqual(res.body.stack, undefined, 'Stack trace must be undefined in production');
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });
  });

  // =========================================================================
  // 3. 404 Route Not Found Handler (notFoundHandler)
  // =========================================================================
  describe('3. Route Not Found Handler (notFoundHandler)', () => {
    it('Returns structured 404 JSON for unmatched routes', () => {
      const ctx = createMockContext({ method: 'POST', originalUrl: '/api/v1/invalid-route' });
      notFoundHandler(ctx.req, ctx.res, ctx.next);

      const res = ctx.getResponse();
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Cannot POST /api/v1/invalid-route - Route not found'));
    });
  });
});

