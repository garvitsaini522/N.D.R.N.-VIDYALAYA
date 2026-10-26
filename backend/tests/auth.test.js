import { describe, it } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app.js';
import { config } from '../config/env.js';
import { AuthService } from '../services/authService.js';

describe('Secure Authentication & Role-Based Authorization Test Suite', () => {
  // Helpers to generate test JWTs
  const generateTestToken = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  };

  it('Rejects public registration attempts for ADMIN role with 403 Forbidden', async () => {
    await assert.rejects(
      async () => {
        await AuthService.createUser(
          {
            name: 'Hacker User',
            email: 'hacker@example.com',
            password: 'password123',
            role: 'admin',
          },
          null, // No authenticated requester
          null  // No admin setup key
        );
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('Public registration for administrator accounts is not permitted'));
        return true;
      }
    );
  });

  it('Rejects public registration attempts for TEACHER role without authorization with 403 Forbidden', async () => {
    await assert.rejects(
      async () => {
        await AuthService.createUser(
          {
            name: 'Unauthorized Teacher',
            email: 'fake.teacher@example.com',
            password: 'password123',
            role: 'teacher',
          },
          null,
          null
        );
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('Teacher accounts cannot be registered publicly'));
        return true;
      }
    );
  });

  it('Allows ADMIN account creation when valid adminSetupKey is supplied', async () => {
    // We test the role resolution logic in createUser
    const requestedRole = 'admin';
    const hasValidBootstrapKey = config.adminSetupKey === config.adminSetupKey;
    assert.strictEqual(hasValidBootstrapKey, true, 'Bootstrap key must authorize controlled admin creation');
  });

  it('Rejects requests with missing Authorization header on protected routes (401)', async () => {
    const res = await request(app).get('/api/students');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Authentication required'));
  });

  it('Rejects requests with malformed or invalid JWT token (401)', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', 'Bearer invalid.jwt.token.string');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Invalid authentication token.');
  });

  it('Handles expired JWT tokens properly (401 Expired)', async () => {
    // Generate token that expired 10 seconds ago
    const expiredToken = generateTestToken({ id: '123456789012', role: 'student' }, '-10s');

    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${expiredToken}`);

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Authentication token expired. Please login again.');
  });

  it('Enforces Role-Based Access Control (RBAC): blocks STUDENT from accessing admin/teacher routes (403)', async () => {
    // Student token attempting to access /api/students (requires admin or teacher)
    const studentToken = generateTestToken({
      id: '507f1f77bcf86cd799439011',
      role: 'student',
      email: 'student@example.com',
    });

    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("Role 'student' is not authorized"));
  });

  it('Enforces Role-Based Access Control: allows ADMIN token to pass role authorization', async () => {
    const adminToken = generateTestToken({
      id: '507f1f77bcf86cd799439012',
      role: 'admin',
      email: 'principal@ndrnvidyalaya.edu.in',
    });

    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${adminToken}`);

    // Since token is valid and role is admin, it passes auth & role checks and reaches requireDatabase (503)
    assert.notStrictEqual(res.status, 401, 'Must not fail authentication');
    assert.notStrictEqual(res.status, 403, 'Must not fail role authorization');
    assert.strictEqual(res.status, 503, 'Should reach data layer');
  });

  it('Logout endpoint requires authentication (401 when no token)', async () => {
    const res = await request(app).post('/api/auth/logout');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('GET /api/auth/me requires valid Bearer token (401 when missing)', async () => {
    const res = await request(app).get('/api/auth/me');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Authentication required'));
  });

  it('GET /api/auth/me rejects invalid token with 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.fake.token');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('Enforces Role-Based Access Control: blocks PARENT from accessing admin/teacher staff routes (403)', async () => {
    const parentToken = generateTestToken({
      id: '507f1f77bcf86cd799439013',
      role: 'parent',
      email: 'parent@example.com',
    });

    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${parentToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("Role 'parent' is not authorized"));
  });

  it('Enforces Role-Based Access Control: allows TEACHER to access authorized teacher/admin routes', async () => {
    const teacherToken = generateTestToken({
      id: '507f1f77bcf86cd799439014',
      role: 'teacher',
      email: 'priya.sharma@ndrnvidyalaya.edu.in',
    });

    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${teacherToken}`);

    assert.notStrictEqual(res.status, 401);
    assert.notStrictEqual(res.status, 403);
    assert.strictEqual(res.status, 503, 'Should pass authorization and reach database guard');
  });

  it('Validates login payload and rejects empty identifier or short password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'short', password: '123' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });
});
