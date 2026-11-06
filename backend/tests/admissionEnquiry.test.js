import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { Admission } from '../models/Admission.js';
import { AdmissionService } from '../services/admissionService.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { getPrincipalWhatsAppDestination, SCHOOL_CONFIG } from '../../src/config/schoolConfig.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_ndrn_backend_tests_only';

function makeToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

describe('Admission Enquiry & Principal Connect Integration Test Suite', () => {
  const originalReadyState = mongoose.connection.readyState;
  const adminId = new mongoose.Types.ObjectId().toString();
  const staffId = new mongoose.Types.ObjectId().toString();
  const studentId = new mongoose.Types.ObjectId().toString();
  const parentId = new mongoose.Types.ObjectId().toString();

  const adminToken = makeToken({ id: adminId, role: 'admin', email: 'admin@ndrnvidyalaya.edu.in' });
  const staffToken = makeToken({ id: staffId, role: 'staff', email: 'staff@ndrnvidyalaya.edu.in' });
  const studentToken = makeToken({ id: studentId, role: 'student' });
  const parentToken = makeToken({ id: parentId, role: 'parent' });

  let originalUserFindById;
  let originalStudentFindOne;
  let originalParentFindOne;
  let originalCreateEnquiry;
  let originalGetEnquiries;
  let originalFindEnquiry;
  let originalUpdateStatus;
  let originalDeleteEnquiry;

  // In-memory admissions store for mocking controller service calls
  const mockAdmissionsStore = new Map();

  before(() => {
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 1,
      configurable: true,
      writable: true,
    });

    originalUserFindById = User.findById;
    User.findById = (id) => ({
      select: async () => {
        const idStr = String(id);
        if (idStr === adminId) {
          return { _id: adminId, status: 'active', role: 'admin', name: 'Admin Officer' };
        }
        if (idStr === staffId) {
          return { _id: staffId, status: 'active', role: 'staff', name: 'Staff Officer' };
        }
        if (idStr === studentId) {
          return { _id: studentId, status: 'active', role: 'student', name: 'Student Account' };
        }
        if (idStr === parentId) {
          return { _id: parentId, status: 'active', role: 'parent', name: 'Parent Account' };
        }
        return null;
      },
    });

    originalStudentFindOne = Student.findOne;
    Student.findOne = () => ({
      lean: async () => null,
    });

    originalParentFindOne = Parent.findOne;
    Parent.findOne = () => ({
      lean: async () => null,
    });

    // Mock service layer methods
    originalCreateEnquiry = AdmissionService.createEnquiry;
    AdmissionService.createEnquiry = async (data) => {
      const normalizedPhone = data.phone ? String(data.phone).trim() : '';
      const studentName = data.studentName ? String(data.studentName).trim() : '';
      const gradeApplying = data.gradeApplying;

      for (const existing of mockAdmissionsStore.values()) {
        if (
          existing.phone === normalizedPhone &&
          existing.studentName.toLowerCase() === studentName.toLowerCase() &&
          existing.gradeApplying === gradeApplying
        ) {
          const err = new Error(
            `An admission enquiry for ${studentName} (${gradeApplying}) with contact number ${normalizedPhone} was already received recently. Reference ID: ${existing.enquiryNumber}.`
          );
          err.statusCode = 409;
          throw err;
        }
      }

      const year = new Date().getFullYear();
      const count = new Set(mockAdmissionsStore.values()).size;
      const sequence = String(count + 1).padStart(4, '0');
      const enquiryNumber = `ADM-${year}-${sequence}`;
      const mockRecord = {
        _id: new mongoose.Types.ObjectId(),
        enquiryNumber,
        studentName: data.studentName,
        parentName: data.parentName,
        phone: data.phone,
        email: data.email,
        gradeApplying: data.gradeApplying,
        message: data.message || '',
        status: data.status || 'Received',
        deliveryStatus: 'Not Applicable',
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAdmissionsStore.set(enquiryNumber, mockRecord);
      mockAdmissionsStore.set(mockRecord._id.toString(), mockRecord);
      return mockRecord;
    };

    originalGetEnquiries = AdmissionService.getEnquiries;
    AdmissionService.getEnquiries = async ({ status, grade, search, page = 1, limit = 10 }) => {
      let items = Array.from(new Set(mockAdmissionsStore.values()));
      if (status && status !== 'all' && status !== 'All') {
        items = items.filter((item) => item.status.toLowerCase() === status.toLowerCase());
      }
      if (grade && grade !== 'all' && grade !== 'All') {
        items = items.filter((item) => item.gradeApplying === grade);
      }
      if (search) {
        const s = search.toLowerCase();
        items = items.filter(
          (item) =>
            item.studentName.toLowerCase().includes(s) ||
            item.parentName.toLowerCase().includes(s) ||
            item.enquiryNumber.toLowerCase().includes(s)
        );
      }
      const total = items.length;
      const skip = (page - 1) * limit;
      const paginated = items.slice(skip, skip + limit);
      return { items: paginated, total, page, limit };
    };

    originalFindEnquiry = AdmissionService.findEnquiry;
    AdmissionService.findEnquiry = async (idOrNumber) => {
      const clean = String(idOrNumber).trim().toUpperCase();
      return mockAdmissionsStore.get(clean) || mockAdmissionsStore.get(String(idOrNumber).trim()) || null;
    };

    originalUpdateStatus = AdmissionService.updateStatus;
    AdmissionService.updateStatus = async (idOrNumber, { status, note, staffId: stId }) => {
      const record = await AdmissionService.findEnquiry(idOrNumber);
      if (!record) {
        const err = new Error(`Admission enquiry with ID '${idOrNumber}' not found`);
        err.statusCode = 404;
        throw err;
      }
      if (status) record.status = status;
      if (note) record.notes.push({ author: stId, note, date: new Date() });
      return record;
    };

    originalDeleteEnquiry = AdmissionService.deleteEnquiry;
    AdmissionService.deleteEnquiry = async (idOrNumber) => {
      const record = await AdmissionService.findEnquiry(idOrNumber);
      if (!record) return null;
      mockAdmissionsStore.delete(record.enquiryNumber);
      mockAdmissionsStore.delete(record._id.toString());
      return record;
    };
  });

  after(() => {
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: originalReadyState,
      configurable: true,
      writable: true,
    });
    User.findById = originalUserFindById;
    Student.findOne = originalStudentFindOne;
    Parent.findOne = originalParentFindOne;
    AdmissionService.createEnquiry = originalCreateEnquiry;
    AdmissionService.getEnquiries = originalGetEnquiries;
    AdmissionService.findEnquiry = originalFindEnquiry;
    AdmissionService.updateStatus = originalUpdateStatus;
    AdmissionService.deleteEnquiry = originalDeleteEnquiry;
  });

  describe('1. Model Validation & Status Defaults', () => {
    it('Defaults new enquiry status to "Received" and deliveryStatus to "Not Applicable"', () => {
      const adm = new Admission({
        enquiryNumber: 'ADM-2026-0099',
        studentName: 'Aarav Sharma',
        parentName: 'Sunil Sharma',
        phone: '9876543210',
        gradeApplying: 'Class 1',
      });
      const valError = adm.validateSync();
      assert.strictEqual(valError, undefined);
      assert.strictEqual(adm.status, 'Received');
      assert.strictEqual(adm.deliveryStatus, 'Not Applicable');
    });

    it('Rejects invalid phone number (less than 10 digits)', () => {
      const adm = new Admission({
        enquiryNumber: 'ADM-2026-0098',
        studentName: 'Aarav Sharma',
        parentName: 'Sunil Sharma',
        phone: '12345',
        gradeApplying: 'Class 1',
      });
      const valError = adm.validateSync();
      assert.ok(valError);
      assert.ok(valError.errors.phone);
    });

    it('Rejects invalid grade outside primary range', () => {
      const adm = new Admission({
        enquiryNumber: 'ADM-2026-0097',
        studentName: 'Aarav Sharma',
        parentName: 'Sunil Sharma',
        phone: '9876543210',
        gradeApplying: 'Class 12',
      });
      const valError = adm.validateSync();
      assert.ok(valError);
      assert.ok(valError.errors.gradeApplying);
    });

    it('Supports workflow statuses: Received, Pending, Under Review, Verified, Admitted, Rejected', () => {
      const statuses = ['Received', 'Pending', 'Under Review', 'Verified', 'Admitted', 'Rejected'];
      for (const st of statuses) {
        const adm = new Admission({
          enquiryNumber: `ADM-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
          studentName: 'Test Student',
          parentName: 'Test Parent',
          phone: '9876543210',
          gradeApplying: 'Nursery',
          status: st,
        });
        assert.strictEqual(adm.validateSync(), undefined, `Expected ${st} to be valid`);
      }
    });
  });

  describe('2. Public Enquiry Submission (POST /api/admissions/enquire)', () => {
    it('Rejects request with missing required fields (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/admissions/enquire')
        .send({});

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      const fields = res.body.errors.map((e) => e.field);
      assert.ok(fields.includes('studentName'));
      assert.ok(fields.includes('parentName'));
      assert.ok(fields.includes('phone'));
      assert.ok(fields.includes('gradeApplying'));
    });

    it('Rejects request with invalid mobile number (< 10 digits)', async () => {
      const res = await request(app)
        .post('/api/admissions/enquire')
        .send({
          studentName: 'Meera Patel',
          parentName: 'Vikram Patel',
          phone: '98765',
          gradeApplying: 'Class 2',
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.errors.some((e) => e.field === 'phone'));
    });

    it('Successfully registers admission enquiry with status "Received" and valid reference ID', async () => {
      const res = await request(app)
        .post('/api/admissions/enquire')
        .send({
          studentName: 'Ananya Gupta',
          parentName: 'Sanjay Gupta',
          phone: '9876543210',
          gradeApplying: 'Class 3',
          email: 'sanjay.gupta@example.com',
          message: 'Interested in admission for session 2026-27 with school bus transport.',
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.enquiryNumber);
      assert.ok(res.body.data.enquiryNumber.startsWith('ADM-'));
      assert.strictEqual(res.body.data.studentName, 'Ananya Gupta');
      assert.strictEqual(res.body.data.gradeApplying, 'Class 3');
      assert.strictEqual(res.body.data.status, 'Received');
      assert.strictEqual(res.body.data.deliveryStatus, 'Not Applicable');
      // Must NOT return fake delivery confirmation flags
      assert.notStrictEqual(res.body.data.deliveryStatus, 'Delivered');
    });

    it('Rejects duplicate admission enquiry with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/admissions/enquire')
        .send({
          studentName: 'Ananya Gupta',
          parentName: 'Sanjay Gupta',
          phone: '9876543210',
          gradeApplying: 'Class 3',
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('already received recently'));
    });
  });

  describe('3. Role-Based Access Control for Admissions Records', () => {
    it('Rejects unauthenticated access to GET /api/admissions (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/admissions');
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('Rejects student access to GET /api/admissions (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admissions')
        .set('Authorization', `Bearer ${studentToken}`);
      assert.strictEqual(res.status, 403);
    });

    it('Rejects parent access to GET /api/admissions (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admissions')
        .set('Authorization', `Bearer ${parentToken}`);
      assert.strictEqual(res.status, 403);
    });

    it('Allows admin access to GET /api/admissions with pagination', async () => {
      const res = await request(app)
        .get('/api/admissions')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.strictEqual(typeof res.body.meta.totalItems, 'number');
    });

    it('Allows staff access to GET /api/admissions', async () => {
      const res = await request(app)
        .get('/api/admissions')
        .set('Authorization', `Bearer ${staffToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });
  });

  describe('4. Admission Enquiry Details & Status Lifecycle Updates', () => {
    let createdEnquiryNumber;
    let createdObjectId;

    before(async () => {
      const res = await request(app)
        .post('/api/admissions/enquire')
        .send({
          studentName: 'Rohan Tiwari',
          parentName: 'Alok Tiwari',
          phone: '9845123456',
          gradeApplying: 'Class 4',
        });
      createdEnquiryNumber = res.body.data.enquiryNumber;
      const stored = await AdmissionService.findEnquiry(createdEnquiryNumber);
      createdObjectId = stored._id.toString();
    });

    it('Allows admin to retrieve enquiry by Enquiry Number', async () => {
      const res = await request(app)
        .get(`/api/admissions/${createdEnquiryNumber}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.enquiryNumber, createdEnquiryNumber);
      assert.strictEqual(res.body.data.studentName, 'Rohan Tiwari');
    });

    it('Allows admin to retrieve enquiry by MongoDB ObjectId', async () => {
      const res = await request(app)
        .get(`/api/admissions/${createdObjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.enquiryNumber, createdEnquiryNumber);
    });

    it('Updates status to "Under Review" with staff note', async () => {
      const res = await request(app)
        .patch(`/api/admissions/${createdObjectId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Under Review',
          note: 'Documents submitted for age verification (Class 4).',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.status, 'Under Review');
    });

    it('Updates status using "notes" field alias (frontend compatibility)', async () => {
      const res = await request(app)
        .patch(`/api/admissions/${createdEnquiryNumber}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Verified',
          notes: 'Birth certificate and transfer certificate verified.',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.status, 'Verified');
    });

    it('Rejects invalid status value (400 Bad Request)', async () => {
      const res = await request(app)
        .patch(`/api/admissions/${createdObjectId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'InvalidArbitraryStatus',
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    it('Allows admin to delete admission enquiry, and rejects non-admin deletion', async () => {
      // Staff cannot delete (only admin)
      const staffDel = await request(app)
        .delete(`/api/admissions/${createdObjectId}`)
        .set('Authorization', `Bearer ${staffToken}`);
      assert.strictEqual(staffDel.status, 403);

      // Admin can delete
      const adminDel = await request(app)
        .delete(`/api/admissions/${createdObjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(adminDel.status, 200);
      assert.strictEqual(adminDel.body.success, true);

      // Verifying deleted
      const check = await request(app)
        .get(`/api/admissions/${createdObjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      assert.strictEqual(check.status, 404);
    });
  });

  describe('5. Principal Connect WhatsApp Configuration Verification', () => {
    it('Resolves clean Principal WhatsApp destination number to "918429231617"', () => {
      const destination = getPrincipalWhatsAppDestination();
      assert.strictEqual(destination, '918429231617');
    });

    it('Confirms school configuration holds correct official WhatsApp details', () => {
      assert.strictEqual(SCHOOL_CONFIG.principalWhatsAppNumber, '918429231617');
      assert.strictEqual(SCHOOL_CONFIG.contact.whatsapp, '918429231617');
      assert.strictEqual(SCHOOL_CONFIG.contact.phone, '+91 8429231617');
    });

    it('Never uses visitor mobile number as WhatsApp destination recipient', () => {
      const visitorPhone = '9876543210';
      const principalDest = getPrincipalWhatsAppDestination({ phone: visitorPhone });
      // The destination must be the Principal's number, NOT the visitor's number
      assert.strictEqual(principalDest, '918429231617');
      assert.notStrictEqual(principalDest, visitorPhone);
    });
  });
});

