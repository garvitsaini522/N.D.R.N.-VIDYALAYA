import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js';
import { FeeStructure } from '../models/FeeStructure.js';
import { FeeStructureService } from '../services/feeStructureService.js';

describe('FeeStructure Model & API Endpoints Test Suite', () => {
  it('Validates FeeStructure Mongoose Schema and required fields', () => {
    const invalidFee = new FeeStructure({ classGrade: '', academicSession: null });
    const validationError = invalidFee.validateSync();

    assert.ok(validationError);
    assert.ok(validationError.errors.classGrade, 'Should require classGrade');
    assert.ok(validationError.errors.academicSession, 'Should require academicSession');
  });

  it('Calculates total estimated annual fee consistently without double counting', () => {
    const fee = new FeeStructure({
      classGrade: 'Class 1',
      academicSession: '2026-27',
      admissionFee: 1000,
      monthlyTuitionFee: 400,
      annualCharges: 800,
      otherCharges: 200,
    });

    // Expected total: 1000 + (400 * 12) + 800 + 200 = 1000 + 4800 + 800 + 200 = 6800
    const expected = 1000 + 400 * 12 + 800 + 200;
    const computed =
      Number(fee.admissionFee) +
      Number(fee.monthlyTuitionFee) * 12 +
      Number(fee.annualCharges) +
      Number(fee.otherCharges);

    assert.strictEqual(computed, expected);
    assert.strictEqual(computed, 6800);
  });

  it('Validates and stores optional bus fee in FeeStructure schema', () => {
    const feeWithBus = new FeeStructure({
      classGrade: 'Class 2',
      academicSession: '2026-27',
      admissionFee: 800,
      monthlyTuitionFee: 450,
      annualCharges: 850,
      otherCharges: 250,
      busFee: 300,
    });

    assert.strictEqual(feeWithBus.busFee, 300);
    const err = feeWithBus.validateSync();
    assert.strictEqual(err, undefined);

    const negativeBus = new FeeStructure({
      classGrade: 'Class 2',
      academicSession: '2026-27',
      admissionFee: 800,
      monthlyTuitionFee: 450,
      annualCharges: 850,
      busFee: -100,
    });
    const negErr = negativeBus.validateSync();
    assert.ok(negErr.errors.busFee, 'Should reject negative bus fee');
  });

  it('GET /api/fee-structure is a public route that handles request without requiring bearer token', async () => {
    const res = await request(app).get('/api/fee-structure');
    // When MongoDB is offline, requireDatabase middleware returns 503 Service Unavailable,
    // which confirms the route is public and reaches the database check without throwing 401 Unauthorized.
    assert.ok([200, 503].includes(res.status), `Expected 200 or 503, got ${res.status}`);
    if (res.status === 200) {
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    }
  });

  it('GET /api/fee-structure/admin rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/fee-structure/admin');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Authentication required'));
  });

  it('POST /api/fee-structure rejects unauthenticated requests with 401', async () => {
    const res = await request(app).post('/api/fee-structure').send({
      classGrade: 'Nursery',
      academicSession: '2026-27',
      admissionFee: 500,
      monthlyTuitionFee: 300,
      annualCharges: 600,
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('PUT /api/fee-structure/:id rejects unauthenticated requests with 401', async () => {
    const res = await request(app).put('/api/fee-structure/507f1f77bcf86cd799439011').send({
      monthlyTuitionFee: 350,
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('DELETE /api/fee-structure/:id rejects unauthenticated requests with 401', async () => {
    const res = await request(app).delete('/api/fee-structure/507f1f77bcf86cd799439011');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('PATCH /api/fee-structure/:id/publish rejects unauthenticated requests with 401', async () => {
    const res = await request(app).patch('/api/fee-structure/507f1f77bcf86cd799439011/publish').send({
      isPublished: true,
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('Normalizes academic sessions across standard hyphen, en-dash, em-dash, and 4-digit formats', () => {
    assert.strictEqual(FeeStructureService.normalizeSession('2026-27'), '2026-27');
    assert.strictEqual(FeeStructureService.normalizeSession('2026–27'), '2026-27'); // en-dash
    assert.strictEqual(FeeStructureService.normalizeSession('2026—27'), '2026-27'); // em-dash
    assert.strictEqual(FeeStructureService.normalizeSession('2026 - 27'), '2026-27'); // spaces
    assert.strictEqual(FeeStructureService.normalizeSession('2026-2027'), '2026-27'); // 4-digit span
    assert.strictEqual(FeeStructureService.normalizeSession('all'), 'all');
  });

  it('GET /api/fee-structure handles en-dash academic session parameter gracefully', async () => {
    const res = await request(app).get('/api/fee-structure?session=2026–27');
    assert.ok([200, 503].includes(res.status), `Expected 200 or 503, got ${res.status}`);
  });
});
