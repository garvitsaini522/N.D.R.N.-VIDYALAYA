import { describe, it } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app.js';
import { config } from '../config/env.js';

describe('Student & Parent Portal Authorization & Access Control Test Suite', () => {
  const generateToken = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  };

  const studentAId = '507f1f77bcf86cd799439001';
  const studentBId = '507f1f77bcf86cd799439002';

  const studentAToken = generateToken({
    id: studentAId,
    role: 'student',
    email: 'aarav.kumar@student.ndrn.edu.in',
    studentId: studentAId,
  });

  const parentToken = generateToken({
    id: '507f1f77bcf86cd799439099',
    role: 'parent',
    email: 'sunita.kumar@gmail.com',
    wardIds: [studentAId],
  });

  it('Blocks a student from viewing another student record (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/students/${studentBId}`)
      .set('Authorization', `Bearer ${studentAToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('only permitted to access their own academic records'));
  });

  it('Allows a student to access their own student record (reaches DB layer 503)', async () => {
    const res = await request(app)
      .get(`/api/students/${studentAId}`)
      .set('Authorization', `Bearer ${studentAToken}`);

    assert.notStrictEqual(res.status, 401);
    assert.notStrictEqual(res.status, 403);
    assert.strictEqual(res.status, 503, 'Passed authorization and reached database check');
  });

  it('Blocks a student from viewing another student attendance (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/attendance/student/${studentBId}`)
      .set('Authorization', `Bearer ${studentAToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  it('Allows a student to access their own attendance record', async () => {
    const res = await request(app)
      .get(`/api/attendance/student/${studentAId}`)
      .set('Authorization', `Bearer ${studentAToken}`);

    assert.notStrictEqual(res.status, 403);
    assert.strictEqual(res.status, 503);
  });

  it('Blocks a parent from accessing an unlinked student fee ledger (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/fees/student/${studentBId}`)
      .set('Authorization', `Bearer ${parentToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('only permitted to access records for their linked children'));
  });

  it('Allows a parent to access their linked child fee ledger', async () => {
    const res = await request(app)
      .get(`/api/fees/student/${studentAId}`)
      .set('Authorization', `Bearer ${parentToken}`);

    assert.notStrictEqual(res.status, 403);
    assert.strictEqual(res.status, 503);
  });

  it('Blocks student from modifying examination results (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/results')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ studentId: studentAId, term: 'Term I' });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  it('Blocks parent from modifying examination results (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/results')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ studentId: studentAId, term: 'Term I' });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  it('Blocks student or parent from marking class attendance (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/attendance')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ classId: 'cls123', date: '2026-10-24', records: [] });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  it('Constrains collection-level GET /api/results for student tokens without query param', async () => {
    const res = await request(app)
      .get('/api/results')
      .set('Authorization', `Bearer ${studentAToken}`);

    assert.notStrictEqual(res.status, 401);
    assert.notStrictEqual(res.status, 403);
    assert.strictEqual(res.status, 503, 'Constrained student query passes auth to DB layer');
  });

  it('Blocks parent from accessing unlinked student examination results (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/results?studentId=${studentBId}`)
      .set('Authorization', `Bearer ${parentToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  it('Blocks student from accessing parent records at GET /api/parents/:id (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/parents/507f1f77bcf86cd799439099')
      .set('Authorization', `Bearer ${studentAToken}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  it('Allows administrator to access parent record at GET /api/parents/:id', async () => {
    const adminToken = generateToken({
      id: '507f1f77bcf86cd799439999',
      role: 'admin',
      email: 'principal@ndrnvidyalaya.edu.in',
    });

    const res = await request(app)
      .get('/api/parents/507f1f77bcf86cd799439099')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.notStrictEqual(res.status, 401);
    assert.notStrictEqual(res.status, 403);
    assert.strictEqual(res.status, 503, 'Admin token passes role authorization to DB layer');
  });
});
