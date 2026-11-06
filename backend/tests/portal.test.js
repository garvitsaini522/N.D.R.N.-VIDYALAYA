import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { config } from '../config/env.js';
import { AuthService } from '../services/authService.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { Teacher } from '../models/Teacher.js';
import { Fee } from '../models/Fee.js';
import { Attendance } from '../models/Attendance.js';
import { Result } from '../models/Result.js';

describe('Four-Portal Role-Based Access Control & Database Ownership Test Suite', () => {
  const originalReadyState = mongoose.connection.readyState;

  // Real ObjectIDs
  const studentAId = new mongoose.Types.ObjectId().toString();
  const studentBId = new mongoose.Types.ObjectId().toString();
  const classAId = new mongoose.Types.ObjectId().toString();
  const classBId = new mongoose.Types.ObjectId().toString();
  const parentAId = new mongoose.Types.ObjectId().toString();
  const parentBId = new mongoose.Types.ObjectId().toString();
  const teacherAId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();

  const userStudentAId = new mongoose.Types.ObjectId().toString();
  const userStudentBId = new mongoose.Types.ObjectId().toString();
  const userParentAId = new mongoose.Types.ObjectId().toString();
  const userTeacherAId = new mongoose.Types.ObjectId().toString();
  const userUnlinkedStudentId = new mongoose.Types.ObjectId().toString();
  const userUnlinkedParentId = new mongoose.Types.ObjectId().toString();

  // Production-matching tokens generated using AuthService.generateToken
  const studentAUser = { _id: userStudentAId, email: 'aarav.student@ndrn.edu.in', role: 'student', name: 'Aarav Student' };
  const studentAToken = AuthService.generateToken(studentAUser, { isLinked: true, studentId: studentAId });

  const studentBUser = { _id: userStudentBId, email: 'rohan.student@ndrn.edu.in', role: 'student', name: 'Rohan Student' };
  const studentBToken = AuthService.generateToken(studentBUser, { isLinked: true, studentId: studentBId });

  const unlinkedStudentUser = { _id: userUnlinkedStudentId, email: 'unlinked.student@ndrn.edu.in', role: 'student', name: 'Unlinked Student' };
  const unlinkedStudentToken = AuthService.generateToken(unlinkedStudentUser, { isLinked: false });

  const parentAUser = { _id: userParentAId, email: 'parent.a@ndrn.edu.in', role: 'parent', name: 'Sunita Parent' };
  const parentAToken = AuthService.generateToken(parentAUser, { isLinked: true, parentId: parentAId, wardIds: [studentAId] });

  const unlinkedParentUser = { _id: userUnlinkedParentId, email: 'unlinked.parent@ndrn.edu.in', role: 'parent', name: 'Unlinked Parent' };
  const unlinkedParentToken = AuthService.generateToken(unlinkedParentUser, { isLinked: false, wardIds: [] });

  const teacherAUser = { _id: userTeacherAId, email: 'teacher.a@ndrn.edu.in', role: 'teacher', name: 'Sharma Teacher' };
  const teacherAToken = AuthService.generateToken(teacherAUser, { isLinked: true });

  const adminUser = { _id: adminId, email: 'principal@ndrnvidyalaya.edu.in', role: 'admin', name: 'Principal Admin' };
  const adminToken = AuthService.generateToken(adminUser, { isLinked: true });

  // Original functions to restore
  let origUserFindById;
  let origStudentFindOne;
  let origStudentFindById;
  let origParentFindOne;
  let origParentFindById;
  let origTeacherFindOne;
  let origFeeFind;
  let origAttendanceFind;
  let origResultFind;

  before(() => {
    // Enable database layer simulation
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 1,
      configurable: true,
      writable: true,
    });

    function createChainableQuery(data) {
      const chain = {
        select: () => chain,
        populate: () => chain,
        sort: () => chain,
        limit: () => chain,
        skip: () => chain,
        lean: async () => data,
        exec: async () => data,
        then: (resolve, reject) => Promise.resolve(data).then(resolve, reject),
      };
      return chain;
    }

    origUserFindById = User.findById;
    User.findById = (id) => ({
      select: async () => {
        const idStr = String(id);
        if (idStr === userStudentAId) return { _id: userStudentAId, status: 'active', role: 'student' };
        if (idStr === userStudentBId) return { _id: userStudentBId, status: 'active', role: 'student' };
        if (idStr === userUnlinkedStudentId) return { _id: userUnlinkedStudentId, status: 'active', role: 'student' };
        if (idStr === userParentAId) return { _id: userParentAId, status: 'active', role: 'parent' };
        if (idStr === userUnlinkedParentId) return { _id: userUnlinkedParentId, status: 'active', role: 'parent' };
        if (idStr === userTeacherAId) return { _id: userTeacherAId, status: 'active', role: 'teacher' };
        if (idStr === adminId) return { _id: adminId, status: 'active', role: 'admin' };
        return null;
      },
    });

    origStudentFindOne = Student.findOne;
    Student.findOne = (query) => {
      let found = null;
      if (query?.user && String(query.user) === userStudentAId) {
        found = { _id: studentAId, user: userStudentAId, fullName: 'Aarav Kumar', admissionNumber: 'NDRN-2026-0001', class: classAId };
      } else if (query?.user && String(query.user) === userStudentBId) {
        found = { _id: studentBId, user: userStudentBId, fullName: 'Rohan Verma', admissionNumber: 'NDRN-2026-0002', class: classBId };
      } else if (query?._id && String(query._id) === studentAId) {
        found = { _id: studentAId, user: userStudentAId, fullName: 'Aarav Kumar', admissionNumber: 'NDRN-2026-0001', class: classAId };
      } else if (query?._id && String(query._id) === studentBId) {
        found = { _id: studentBId, user: userStudentBId, fullName: 'Rohan Verma', admissionNumber: 'NDRN-2026-0002', class: classBId };
      } else if (query?.admissionNumber && query.admissionNumber === 'NDRN-2026-0001') {
        found = { _id: studentAId, user: userStudentAId, fullName: 'Aarav Kumar', admissionNumber: 'NDRN-2026-0001', class: classAId };
      } else if (query?.admissionNumber && query.admissionNumber === 'NDRN-2026-0002') {
        found = { _id: studentBId, user: userStudentBId, fullName: 'Rohan Verma', admissionNumber: 'NDRN-2026-0002', class: classBId };
      }
      return createChainableQuery(found);
    };

    origStudentFindById = Student.findById;
    Student.findById = (id) => {
      const idStr = String(id);
      const studentObj = (idStr === studentAId || idStr === studentBId) ? {
        _id: idStr,
        user: idStr === studentAId ? userStudentAId : userStudentBId,
        fullName: idStr === studentAId ? 'Aarav Kumar' : 'Rohan Verma',
        admissionNumber: idStr === studentAId ? 'NDRN-2026-0001' : 'NDRN-2026-0002',
        class: idStr === studentAId ? classAId : classBId,
        dateOfBirth: new Date('2019-05-15'),
        guardianDetails: { fatherName: 'Sunil Kumar', contactNumber: '9876543210' },
      } : null;
      return createChainableQuery(studentObj);
    };

    origParentFindOne = Parent.findOne;
    Parent.findOne = (query) => {
      let found = null;
      if (query?.user && String(query.user) === userParentAId) {
        found = { _id: parentAId, user: userParentAId, fullName: 'Sunita Kumar', students: [studentAId] };
      } else if (query?._id && String(query._id) === parentAId) {
        found = { _id: parentAId, user: userParentAId, fullName: 'Sunita Kumar', students: [studentAId] };
      }
      return createChainableQuery(found);
    };

    origParentFindById = Parent.findById;
    Parent.findById = (id) => {
      const idStr = String(id);
      const parentObj = idStr === parentAId ? {
        _id: parentAId,
        user: userParentAId,
        fullName: 'Sunita Kumar',
        students: [studentAId],
      } : null;
      return createChainableQuery(parentObj);
    };

    origTeacherFindOne = Teacher.findOne;
    Teacher.findOne = (query) => {
      let found = null;
      if (query?.user && String(query.user) === userTeacherAId) {
        found = {
          _id: teacherAId,
          user: userTeacherAId,
          fullName: 'Anita Sharma',
          employeeId: 'EMP-101',
          assignedClasses: [classAId],
          department: 'Primary Instruction',
        };
      }
      return createChainableQuery(found);
    };

    origFeeFind = Fee.find;
    Fee.find = () => createChainableQuery([
      {
        _id: new mongoose.Types.ObjectId(),
        student: studentAId,
        amount: 5000,
        paidAmount: 5000,
        totalAmount: 5000,
        dueAmount: 0,
        status: 'paid',
        dueDate: new Date(),
      },
    ]);

    origAttendanceFind = Attendance.find;
    Attendance.find = () => createChainableQuery([
      {
        _id: new mongoose.Types.ObjectId(),
        student: studentAId,
        status: 'present',
        date: new Date(),
      },
    ]);

    origResultFind = Result.find;
    Result.find = () => createChainableQuery([
      {
        _id: new mongoose.Types.ObjectId(),
        student: studentAId,
        term: 'Term I',
        totalMarks: 95,
      },
    ]);
  });

  after(() => {
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: originalReadyState,
      configurable: true,
      writable: true,
    });
    User.findById = origUserFindById;
    Student.findOne = origStudentFindOne;
    Student.findById = origStudentFindById;
    Parent.findOne = origParentFindOne;
    Parent.findById = origParentFindById;
    Teacher.findOne = origTeacherFindOne;
    Fee.find = origFeeFind;
    Attendance.find = origAttendanceFind;
    Result.find = origResultFind;
  });

  // =========================================================================
  // 1. STUDENT PORTAL DATA ISOLATION
  // =========================================================================
  describe('1. Student Portal Data Isolation & Ownership', () => {
    it('Allows linked student to view their own student record (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/students/${studentAId}`)
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data._id, studentAId);
    });

    it('Allows linked student to access their profile using "me" alias (200 OK)', async () => {
      const res = await request(app)
        .get('/api/students/me')
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data._id, studentAId);
    });

    it('Blocks a student from viewing another student record (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/students/${studentBId}`)
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('only permitted to access their own academic records'));
    });

    it('Blocks an unlinked student from accessing student records (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/students/${studentAId}`)
        .set('Authorization', `Bearer ${unlinkedStudentToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it('Allows a student to access their own attendance record (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/attendance/student/${studentAId}`)
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('Blocks a student from viewing another student attendance (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/attendance/student/${studentBId}`)
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it('Allows a student to access their own fee ledger (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/fees/student/${studentAId}`)
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('Blocks a student from viewing another student fee ledger (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/fees/student/${studentBId}`)
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 403);
    });

    it('Blocks student from modifying examination results (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({ studentId: studentAId, term: 'Term I' });

      assert.strictEqual(res.status, 403);
    });

    it('Blocks student from marking class attendance (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${studentAToken}`)
        .send({ classId: classAId, date: '2026-10-24', records: [] });

      assert.strictEqual(res.status, 403);
    });

    it('Blocks student from accessing parent records at GET /api/parents/:id (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/parents/${parentAId}`)
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 403);
    });
  });

  // =========================================================================
  // 2. PARENT PORTAL DATA ISOLATION
  // =========================================================================
  describe('2. Parent Portal Data Isolation & Ward Verification', () => {
    it('Allows linked parent to view verified child student record (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/students/${studentAId}`)
        .set('Authorization', `Bearer ${parentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data._id, studentAId);
    });

    it('Blocks linked parent from viewing unlinked student record (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/students/${studentBId}`)
        .set('Authorization', `Bearer ${parentAToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('only permitted to access records for their linked children'));
    });

    it('Allows linked parent to view verified child attendance (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/attendance/student/${studentAId}`)
        .set('Authorization', `Bearer ${parentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('Blocks linked parent from viewing unlinked student attendance (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/attendance/student/${studentBId}`)
        .set('Authorization', `Bearer ${parentAToken}`);

      assert.strictEqual(res.status, 403);
    });

    it('Allows linked parent to view verified child fee ledger (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/fees/student/${studentAId}`)
        .set('Authorization', `Bearer ${parentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('Blocks linked parent from viewing unlinked student fee ledger (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/fees/student/${studentBId}`)
        .set('Authorization', `Bearer ${parentAToken}`);

      assert.strictEqual(res.status, 403);
    });

    it('Blocks unlinked parent (0 wards) from accessing any student records (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/students/${studentAId}`)
        .set('Authorization', `Bearer ${unlinkedParentToken}`);

      assert.strictEqual(res.status, 403);
    });

    it('Blocks parent from modifying academic examination results (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${parentAToken}`)
        .send({ studentId: studentAId, term: 'Term I' });

      assert.strictEqual(res.status, 403);
    });

    it('Blocks parent from marking class attendance (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${parentAToken}`)
        .send({ classId: classAId, date: '2026-10-24', records: [] });

      assert.strictEqual(res.status, 403);
    });
  });

  // =========================================================================
  // 3. TEACHER PORTAL DATA ISOLATION
  // =========================================================================
  describe('3. Teacher Portal Data Isolation & Scope Enforcement', () => {
    it('Blocks teacher from accessing student fee ledgers (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/fees/student/${studentAId}`)
        .set('Authorization', `Bearer ${teacherAToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(
        res.body.message.includes('not authorized') ||
        res.body.message.includes('not permitted') ||
        res.body.message.includes('Forbidden')
      );
    });

    it('Blocks teacher from viewing parent profile records (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/parents/${parentAId}`)
        .set('Authorization', `Bearer ${teacherAToken}`);

      assert.strictEqual(res.status, 403);
    });
  });

  // =========================================================================
  // 4. ADMIN PORTAL ADMINISTRATIVE PRIVILEGES
  // =========================================================================
  describe('4. Administrator Portal Privileges & Institutional Oversight', () => {
    it('Allows administrator to view any student record (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/students/${studentAId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data._id, studentAId);
    });

    it('Allows administrator to view parent record at /api/parents/:id (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/parents/${parentAId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data._id, parentAId);
    });

    it('Allows administrator to view any student fee ledger (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/fees/student/${studentAId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });
  });

  // =========================================================================
  // 5. API FAILURES, INVALID IDS & ERROR HANDLING
  // =========================================================================
  describe('5. API Failures, Malformed Inputs & Non-Existent Resources', () => {
    it('Rejects request without Authorization header on protected routes (401 Unauthorized)', async () => {
      const res = await request(app).get(`/api/students/${studentAId}`);

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Authentication required'));
    });

    it('Rejects malformed Bearer token with 401 Unauthorized', async () => {
      const res = await request(app)
        .get(`/api/students/${studentAId}`)
        .set('Authorization', 'Bearer totally.invalid.signature');

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Invalid authentication token.');
    });

    it('Rejects expired Bearer token with 401 Unauthorized', async () => {
      const expiredToken = jwt.sign(
        { id: userStudentAId, role: 'student', studentId: studentAId, isLinked: true },
        config.jwt.secret,
        { expiresIn: '-10s' }
      );

      const res = await request(app)
        .get(`/api/students/${studentAId}`)
        .set('Authorization', `Bearer ${expiredToken}`);

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.message, 'Authentication token expired. Please login again.');
    });

    it('Rejects invalid non-ObjectId class identifier with 400 Bad Request', async () => {
      const res = await request(app)
        .get('/api/classes/invalid-non-object-id')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Invalid class identifier format');
    });

    it('Returns 404 Not Found for valid ObjectId that does not exist in database', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/students/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('not found'));
    });
  });

  // =========================================================================
  // 6. DATABASE-VERIFIED ACCESS & FORGED TOKEN REJECTION (ANTI-TAMPERING)
  // =========================================================================
  describe('6. Database-Verified Access & Forged Token Rejection (Anti-Tampering)', () => {
    it('Rejects manually constructed JWT with forged studentId when user is not linked in MongoDB (403 Forbidden)', async () => {
      // Attacker crafts a token claiming to be linked to studentAId
      const forgedStudentToken = jwt.sign(
        { id: userUnlinkedStudentId, role: 'student', studentId: studentAId, isLinked: true },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get(`/api/students/${studentAId}`)
        .set('Authorization', `Bearer ${forgedStudentToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('not yet linked') || res.body.message.includes('Forbidden'));
    });

    it('Rejects manually constructed JWT with forged wardIds when parent is not linked in MongoDB (403 Forbidden)', async () => {
      // Attacker crafts a token claiming to have wardIds = [studentAId]
      const forgedParentToken = jwt.sign(
        { id: userUnlinkedParentId, role: 'parent', wardIds: [studentAId], isLinked: true },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get(`/api/students/${studentAId}`)
        .set('Authorization', `Bearer ${forgedParentToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('linked children') || res.body.message.includes('Forbidden'));
    });

    it('Allows student with minimal token (no studentId in token) to access own records via MongoDB link (200 OK)', async () => {
      // Minimal token containing only id and role
      const minimalStudentToken = jwt.sign(
        { id: userStudentAId, role: 'student' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get(`/api/students/${studentAId}`)
        .set('Authorization', `Bearer ${minimalStudentToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data._id, studentAId);
    });

    it('Allows parent with minimal token (no wardIds in token) to access verified child records via MongoDB link (200 OK)', async () => {
      // Minimal token containing only id and role
      const minimalParentToken = jwt.sign(
        { id: userParentAId, role: 'parent' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get(`/api/students/${studentAId}`)
        .set('Authorization', `Bearer ${minimalParentToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data._id, studentAId);
    });

    it('Rejects student attempting to query examination results with another studentId (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/results?studentId=${studentBId}`)
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(
        res.body.message.includes('own academic records') ||
        res.body.message.includes('own examination results') ||
        res.body.message.includes('Forbidden')
      );
    });

    it('Rejects parent attempting to query examination results for an unlinked student (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/results?studentId=${studentBId}`)
        .set('Authorization', `Bearer ${parentAToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('linked children') || res.body.message.includes('Forbidden'));
    });

    it('Allows student to retrieve their own examination results (200 OK)', async () => {
      const res = await request(app)
        .get('/api/results')
        .set('Authorization', `Bearer ${studentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('Allows parent to retrieve their verified child examination results (200 OK)', async () => {
      const res = await request(app)
        .get('/api/results')
        .set('Authorization', `Bearer ${parentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('Allows linked parent to access child attendance using "me" alias (200 OK)', async () => {
      const res = await request(app)
        .get('/api/attendance/student/me')
        .set('Authorization', `Bearer ${parentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('Allows linked parent to access child fee ledger using "me" alias (200 OK)', async () => {
      const res = await request(app)
        .get('/api/fees/student/me')
        .set('Authorization', `Bearer ${parentAToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });
  });
});
