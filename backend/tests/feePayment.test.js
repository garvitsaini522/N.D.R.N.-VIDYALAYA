import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { FeeService } from '../services/feeService.js';
import { Fee } from '../models/Fee.js';
import { config } from '../config/env.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_ndrn_backend_tests_only';

function makeToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

describe('Fee Management & Payment Integration Test Suite', () => {
  const studentAId = new mongoose.Types.ObjectId().toString();
  const studentBId = new mongoose.Types.ObjectId().toString();
  const parentId = new mongoose.Types.ObjectId().toString();
  const teacherId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();

  const studentAToken = makeToken({
    id: new mongoose.Types.ObjectId().toString(),
    role: 'student',
    studentId: studentAId,
    admissionNumber: 'NDRN-2026-001',
    isLinked: true,
  });

  const unlinkedStudentToken = makeToken({
    id: new mongoose.Types.ObjectId().toString(),
    role: 'student',
    isLinked: false,
  });

  const parentToken = makeToken({
    id: parentId,
    role: 'parent',
    isLinked: true,
    wardIds: [studentAId],
  });

  const unlinkedParentToken = makeToken({
    id: new mongoose.Types.ObjectId().toString(),
    role: 'parent',
    isLinked: false,
    wardIds: [],
  });

  const teacherToken = makeToken({
    id: teacherId,
    role: 'teacher',
  });

  const adminToken = makeToken({
    id: adminId,
    role: 'admin',
    email: 'admin@ndrnvidyalaya.edu.in',
  });

  describe('1. Payment Gateway Configuration & Status Route', () => {
    it('GET /api/fees/gateway-status returns gateway availability and offline campus counter instructions', async () => {
      const res = await request(app)
        .get('/api/fees/gateway-status')
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(typeof res.body.data.onlinePaymentsEnabled, 'boolean');
      assert.ok(res.body.data.offlineInstructions);
      assert.ok(res.body.data.offlineInstructions.campusDesk.includes('Daulatyarpur Campus'));
      assert.ok(Array.isArray(res.body.data.offlineInstructions.acceptedModes));
      assert.ok(res.body.data.offlineInstructions.acceptedModes.includes('Cash'));
    });

    it('Rejects unauthenticated access to /api/fees/gateway-status (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/fees/gateway-status');
      assert.strictEqual(res.status, 401);
    });
  });

  describe('2. Student & Parent Payment Protection (No Fake Simulation)', () => {
    it('POST /api/fees/pay rejects student payment attempt when gateway is not enabled (503 Service Unavailable)', async () => {
      const res = await request(app)
        .post('/api/fees/pay')
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({
          studentId: studentAId,
          amount: 3200,
          term: 'Term II (2026-27)',
          paymentMode: 'Online UPI',
        });

      assert.strictEqual(res.status, 503);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('unavailable') || res.body.message.includes('gateway'));
    });

    it('POST /api/fees/pay rejects parent payment attempt when gateway is not enabled (503 Service Unavailable)', async () => {
      const res = await request(app)
        .post('/api/fees/pay')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          studentId: studentAId,
          amount: 3200,
          term: 'Term II (2026-27)',
          paymentMode: 'Online UPI',
        });

      assert.strictEqual(res.status, 503);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('unavailable') || res.body.message.includes('gateway'));
    });

    it('Rejects student attempting to initiate payment for another student (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/fees/pay')
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({
          studentId: studentBId,
          amount: 3200,
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(
        res.body.message.includes('own account') ||
        res.body.message.includes('own academic records')
      );
    });

    it('Rejects unlinked student from initiating payment (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/fees/pay')
        .set('Authorization', `Bearer ${unlinkedStudentToken}`)
        .send({
          amount: 3200,
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it('Rejects parent attempting to pay for an unlinked student (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/fees/pay')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          studentId: studentBId,
          amount: 3200,
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(
        res.body.message.includes('linked children') ||
        res.body.message.includes('verified linked children')
      );
    });

    it('Rejects unlinked parent from initiating payment (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/fees/pay')
        .set('Authorization', `Bearer ${unlinkedParentToken}`)
        .send({
          studentId: studentAId,
          amount: 3200,
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('3. Role Access & Data Isolation on Fee Ledgers', () => {
    it('Blocks teacher from accessing student fee ledger (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/fees/student/${studentAId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(
        res.body.message.includes('not authorized') ||
        res.body.message.includes('Teachers are not authorized')
      );
    });

    it('Blocks teacher from viewing fee rosters (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/fees')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it('Blocks student from viewing fee rosters (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/fees')
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it('Blocks parent from viewing fee rosters (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/fees')
        .set('Authorization', `Bearer ${parentToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it('Blocks student or parent from creating fee invoices (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/fees')
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({
          studentId: studentAId,
          amount: 5000,
          feeType: 'Tuition Fee',
          dueDate: '2026-12-01',
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it('Blocks student or parent from administrative payment recording at /api/fees/:id/payment (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/fees/507f1f77bcf86cd799439011/payment')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          paidAmount: 3200,
          paymentMethod: 'Cash',
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('4. Administrative Payment Validation & Accounting Rules', () => {
    it('Rejects recordPayment with invalid non-positive amount (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/fees/507f1f77bcf86cd799439011/payment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paidAmount: 0,
          paymentMethod: 'Cash',
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    it('Rejects recordPayment with invalid payment method (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/fees/507f1f77bcf86cd799439011/payment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paidAmount: 1500,
          paymentMethod: 'BitCoin',
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    it('FeeService.recordPayment enforces remaining balance and prevents overpayment', async () => {
      // Mock fee object
      const mockFee = {
        _id: new mongoose.Types.ObjectId(),
        amount: 3200,
        paidAmount: 2000,
        status: 'partially_paid',
        save: async () => {},
      };

      // Mock Fee.findById
      const originalFindById = Fee.findById;
      Fee.findById = async () => mockFee;

      try {
        await assert.rejects(
          async () => {
            // Attempt to pay 1500 when remaining balance is only 1200
            await FeeService.recordPayment(mockFee._id, { paidAmount: 1500, paymentMethod: 'Cash' }, adminId);
          },
          (err) => {
            assert.strictEqual(err.statusCode, 400);
            assert.ok(err.message.includes('exceeds the outstanding balance'));
            return true;
          }
        );
      } finally {
        Fee.findById = originalFindById;
      }
    });

    it('FeeService.recordPayment prevents duplicate payment if fee is already fully paid', async () => {
      const mockFee = {
        _id: new mongoose.Types.ObjectId(),
        amount: 3200,
        paidAmount: 3200,
        status: 'paid',
        save: async () => {},
      };

      const originalFindById = Fee.findById;
      Fee.findById = async () => mockFee;

      try {
        await assert.rejects(
          async () => {
            await FeeService.recordPayment(mockFee._id, { paidAmount: 500, paymentMethod: 'Cash' }, adminId);
          },
          (err) => {
            assert.strictEqual(err.statusCode, 400);
            assert.ok(err.message.includes('already fully paid'));
            return true;
          }
        );
      } finally {
        Fee.findById = originalFindById;
      }
    });

    it('FeeService.recordPayment correctly calculates partial payment and full settlement', async () => {
      let saved = false;
      const mockFee = {
        _id: new mongoose.Types.ObjectId(),
        amount: 3200,
        paidAmount: 1000,
        status: 'partially_paid',
        receiptNumber: null,
        save: async function () {
          saved = true;
        },
      };

      const originalFindById = Fee.findById;
      const originalFindOne = Fee.findOne;
      const originalCount = Fee.countDocuments;

      Fee.findById = async () => mockFee;
      Fee.findOne = async () => null;
      Fee.countDocuments = async () => 42;

      try {
        // Pay remaining 2200
        const result = await FeeService.recordPayment(
          mockFee._id,
          { paidAmount: 2200, paymentMethod: 'Cash', transactionId: 'CASH-REC-001' },
          adminId
        );

        assert.strictEqual(saved, true);
        assert.strictEqual(result.paidAmount, 3200);
        assert.strictEqual(result.status, 'paid');
        assert.ok(result.receiptNumber.startsWith('REC-'));
        assert.strictEqual(result.receiptGeneratedBy, adminId);
      } finally {
        Fee.findById = originalFindById;
        Fee.findOne = originalFindOne;
        Fee.countDocuments = originalCount;
      }
    });

    it('FeeService.generateReceiptNumber produces unique sequential numbers', async () => {
      const originalCount = Fee.countDocuments;
      const originalFindOne = Fee.findOne;

      Fee.countDocuments = async () => 85;
      Fee.findOne = async () => null;

      try {
        const receiptNo = await FeeService.generateReceiptNumber();
        const year = new Date().getFullYear();
        assert.strictEqual(receiptNo, `REC-${year}-00086`);
      } finally {
        Fee.countDocuments = originalCount;
        Fee.findOne = originalFindOne;
      }
    });
  });

  describe('5. Payment Verification & Anti-Replay Security', () => {
    it('POST /api/fees/verify rejects verification when gateway is disabled (503 Service Unavailable)', async () => {
      const res = await request(app)
        .post('/api/fees/verify')
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({
          feeId: new mongoose.Types.ObjectId().toString(),
          orderId: 'order_123',
          paymentId: 'pay_123',
          signature: 'sig_abc',
        });

      assert.strictEqual(res.status, 503);
      assert.strictEqual(res.body.success, false);
    });
  });
});
