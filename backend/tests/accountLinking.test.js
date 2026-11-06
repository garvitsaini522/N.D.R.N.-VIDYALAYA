import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Parent } from '../models/Parent.js';
import { Student } from '../models/Student.js';
import { AuthService } from '../services/authService.js';
import { AccountLinkingService } from '../services/accountLinkingService.js';
import {
  enforceStudentOrParentDataIsolation,
  protectAcademicRecords,
  enforceParentAccessControl,
} from '../middleware/portalAccessMiddleware.js';
import { getStudentLedger } from '../controllers/feeController.js';
import { getStudentAttendance, markAttendance } from '../controllers/attendanceController.js';
import { getResults, publishResult } from '../controllers/resultController.js';
import { updateParent } from '../controllers/parentController.js';
import { updateStudent } from '../controllers/studentController.js';
import { config } from '../config/env.js';

describe('Authentication & Account-Linking Security Test Suite', () => {
  // Test Mock ObjectIDs
  const studentAId = new mongoose.Types.ObjectId().toString();
  const studentBId = new mongoose.Types.ObjectId().toString();
  const classAId = new mongoose.Types.ObjectId().toString();
  const classBId = new mongoose.Types.ObjectId().toString();
  const parentAId = new mongoose.Types.ObjectId().toString();
  const parentBId = new mongoose.Types.ObjectId().toString();
  const userStudentAId = new mongoose.Types.ObjectId().toString();
  const userParentAId = new mongoose.Types.ObjectId().toString();
  const userTeacherAId = new mongoose.Types.ObjectId().toString();
  const userUnlinkedId = new mongoose.Types.ObjectId().toString();

  // Helper to mock Express req, res, next
  function createMockContext({ user, params = {}, query = {}, body = {}, originalUrl = '', baseUrl = '' }) {
    const req = {
      user,
      params,
      query,
      body,
      headers: {},
      originalUrl,
      baseUrl,
    };

    let responseData = null;
    let statusCode = 200;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(payload) {
        responseData = payload;
        return this;
      },
    };

    let nextCalled = false;
    let nextError = null;
    const next = (err) => {
      if (err) {
        nextError = err;
      } else {
        nextCalled = true;
      }
    };

    return {
      req,
      res,
      next,
      getResponse: () => ({ status: statusCode, body: responseData }),
      wasNextCalled: () => nextCalled,
      getNextError: () => nextError,
    };
  }

  // ============================================================================
  // 1. JWT Payload Tests
  // ============================================================================
  describe('JWT Generation & Payload Minimalism', () => {
    it('Generates minimal JWT for linked student with studentId', () => {
      const mockUser = {
        _id: userStudentAId,
        email: 'aarav@student.ndrn.edu.in',
        role: 'student',
        name: 'Aarav Sharma',
      };
      const token = AuthService.generateToken(mockUser, {
        isLinked: true,
        studentId: studentAId,
      });

      const decoded = jwt.verify(token, config.jwt.secret);
      assert.strictEqual(decoded.id, userStudentAId);
      assert.strictEqual(decoded.role, 'student');
      assert.strictEqual(decoded.isLinked, true);
      assert.strictEqual(decoded.studentId, studentAId);
      assert.strictEqual(decoded.password, undefined);
    });

    it('Generates minimal JWT for linked parent with wardIds', () => {
      const mockUser = {
        _id: userParentAId,
        email: 'parent@gmail.com',
        role: 'parent',
        name: 'Sunita Sharma',
      };
      const token = AuthService.generateToken(mockUser, {
        isLinked: true,
        parentId: parentAId,
        wardIds: [studentAId],
      });

      const decoded = jwt.verify(token, config.jwt.secret);
      assert.strictEqual(decoded.id, userParentAId);
      assert.strictEqual(decoded.role, 'parent');
      assert.strictEqual(decoded.isLinked, true);
      assert.strictEqual(decoded.parentId, parentAId);
      assert.deepStrictEqual(decoded.wardIds, [studentAId]);
    });

    it('Generates JWT for unlinked account with isLinked: false', () => {
      const mockUser = {
        _id: userUnlinkedId,
        email: 'unlinked@example.com',
        role: 'student',
        name: 'New Student',
      };
      const token = AuthService.generateToken(mockUser, { isLinked: false });

      const decoded = jwt.verify(token, config.jwt.secret);
      assert.strictEqual(decoded.isLinked, false);
      assert.strictEqual(decoded.studentId, undefined);
      assert.strictEqual(decoded.wardIds, undefined);
    });
  });

  // ============================================================================
  // 2. Student Data Isolation Tests
  // ============================================================================
  describe('Student Data Isolation Middleware', () => {
    const linkedStudentUser = {
      id: userStudentAId,
      role: 'student',
      isLinked: true,
      studentId: studentAId,
      admissionNumber: 'NDRN-2026-001',
    };

    it('Allows linked student to access their own record using studentId', async () => {
      const { req, res, next, wasNextCalled } = createMockContext({
        user: linkedStudentUser,
        params: { studentId: studentAId },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), true);
      assert.strictEqual(req.params.studentId, studentAId);
    });

    it('Allows linked student to access their own record using admissionNumber', async () => {
      const { req, res, next, wasNextCalled } = createMockContext({
        user: linkedStudentUser,
        params: { studentId: 'NDRN-2026-001' },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), true);
      assert.strictEqual(req.params.studentId, studentAId);
    });

    it('Allows linked student to access their record using "me"', async () => {
      const { req, res, next, wasNextCalled } = createMockContext({
        user: linkedStudentUser,
        params: { studentId: 'me' },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), true);
      assert.strictEqual(req.params.studentId, studentAId);
    });

    it('Blocks a student from accessing another student record (403 Forbidden)', async () => {
      const { req, res, next, getResponse, wasNextCalled } = createMockContext({
        user: linkedStudentUser,
        params: { studentId: studentBId },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      const response = getResponse();
      assert.strictEqual(response.status, 403);
      assert.ok(response.body.message.includes('only permitted to access their own academic records'));
    });

    it('Blocks an unlinked student from accessing any student records (403 Forbidden)', async () => {
      const unlinkedUser = {
        id: userUnlinkedId,
        role: 'student',
        isLinked: false,
        studentId: null,
      };

      const { req, res, next, getResponse, wasNextCalled } = createMockContext({
        user: unlinkedUser,
        params: { studentId: 'me' },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      const response = getResponse();
      assert.strictEqual(response.status, 403);
      assert.ok(response.body.message.includes('not yet linked to an official student record'));
    });
  });

  // ============================================================================
  // 3. Parent Ward Access Isolation Tests
  // ============================================================================
  describe('Parent Ward Access Isolation Middleware', () => {
    const linkedParentUser = {
      id: userParentAId,
      role: 'parent',
      isLinked: true,
      parentId: parentAId,
      wardIds: [studentAId],
    };

    it('Allows linked parent to access their verified linked child record', async () => {
      const { req, res, next, wasNextCalled } = createMockContext({
        user: linkedParentUser,
        params: { studentId: studentAId },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), true);
      assert.strictEqual(req.params.studentId, studentAId);
    });

    it('Blocks linked parent from accessing unlinked student records (403 Forbidden)', async () => {
      const { req, res, next, getResponse, wasNextCalled } = createMockContext({
        user: linkedParentUser,
        params: { studentId: studentBId },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      const response = getResponse();
      assert.strictEqual(response.status, 403);
      assert.ok(response.body.message.includes('only permitted to access records for their linked children'));
    });

    it('Blocks unlinked parent with 0 wards from accessing any student records (403 Forbidden)', async () => {
      const unlinkedParent = {
        id: userUnlinkedId,
        role: 'parent',
        isLinked: false,
        parentId: null,
        wardIds: [],
      };

      const { req, res, next, getResponse, wasNextCalled } = createMockContext({
        user: unlinkedParent,
        params: { studentId: studentAId },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      const response = getResponse();
      assert.strictEqual(response.status, 403);
      assert.ok(response.body.message.includes('only permitted to access records for their linked children'));
    });

    it('Blocks student from viewing parent profile records at /api/parents/:id', () => {
      const { req, res, next, getResponse, wasNextCalled } = createMockContext({
        user: { id: userStudentAId, role: 'student' },
        params: { id: parentAId },
      });

      enforceParentAccessControl(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      const response = getResponse();
      assert.strictEqual(response.status, 403);
      assert.ok(response.body.message.includes('not authorized to view or modify parent records'));
    });

    it('Blocks parent from accessing another parent profile record', () => {
      const { req, res, next, getResponse, wasNextCalled } = createMockContext({
        user: linkedParentUser,
        params: { id: parentBId },
      });

      enforceParentAccessControl(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      const response = getResponse();
      assert.strictEqual(response.status, 403);
      assert.ok(response.body.message.includes('only permitted to access their own parent record'));
    });
  });

  // ============================================================================
  // 4. Teacher Scope & Academic Assignment Isolation Tests
  // ============================================================================
  describe('Teacher Scope & Academic Assignment Isolation', () => {
    const assignedTeacher = {
      id: userTeacherAId,
      role: 'teacher',
      wing: 'Primary',
      assignedClasses: [classAId],
    };

    it('Allows teacher to access records for their assigned class', async () => {
      const { req, res, next, wasNextCalled } = createMockContext({
        user: assignedTeacher,
        params: { classId: classAId },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), true);
    });

    it('Blocks teacher from accessing records for an unassigned class (403 Forbidden)', async () => {
      const { req, res, next, getResponse, wasNextCalled } = createMockContext({
        user: assignedTeacher,
        params: { classId: classBId },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      const response = getResponse();
      assert.strictEqual(response.status, 403);
      assert.ok(response.body.message.includes('only permitted to access records for their assigned classes'));
    });

    it('Blocks teacher from accessing student fee records (403 Forbidden)', async () => {
      const { req, res, next, getResponse, wasNextCalled } = createMockContext({
        user: assignedTeacher,
        originalUrl: '/api/fees/student/' + studentAId,
        params: { studentId: studentAId },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      const response = getResponse();
      assert.strictEqual(response.status, 403);
      assert.ok(response.body.message.includes('Teachers are not authorized to access student fee records'));
    });

    it('Allows Administration wing teacher to access across classes', async () => {
      const adminTeacher = {
        id: userTeacherAId,
        role: 'teacher',
        wing: 'Administration',
        assignedClasses: [],
      };

      const { req, res, next, wasNextCalled } = createMockContext({
        user: adminTeacher,
        params: { classId: classBId },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), true);
    });
  });

  // ============================================================================
  // 5. Controller Defense-in-Depth Tests
  // ============================================================================
  describe('Controller-Level Ownership Verification', () => {
    it('getStudentLedger: Rejects teacher request with 403', async () => {
      const { req, res, next, getNextError } = createMockContext({
        user: { id: userTeacherAId, role: 'teacher' },
        params: { studentId: studentAId },
      });

      await getStudentLedger(req, res, next);
      const err = getNextError();
      assert.ok(err, 'Expected error to be thrown');
      assert.strictEqual(err.statusCode, 403);
      assert.ok(err.message.includes('Teachers are not authorized'));
    });

    it('getStudentLedger: Rejects cross-account student request with 403', async () => {
      const { req, res, next, getNextError } = createMockContext({
        user: { id: userStudentAId, role: 'student', isLinked: true, studentId: studentAId },
        params: { studentId: studentBId },
      });

      await getStudentLedger(req, res, next);
      const err = getNextError();
      assert.ok(err, 'Expected error to be thrown');
      assert.strictEqual(err.statusCode, 403);
      assert.ok(err.message.includes('Students can only view their own fee ledger'));
    });

    it('getStudentLedger: Rejects parent request for unlinked student with 403', async () => {
      const { req, res, next, getNextError } = createMockContext({
        user: { id: userParentAId, role: 'parent', isLinked: true, parentId: parentAId, wardIds: [studentAId] },
        params: { studentId: studentBId },
      });

      await getStudentLedger(req, res, next);
      const err = getNextError();
      assert.ok(err, 'Expected error to be thrown');
      assert.strictEqual(err.statusCode, 403);
      assert.ok(err.message.includes('Parents can only view fee ledgers for their verified linked children'));
    });

    it('getStudentAttendance: Rejects student request for another student with 403', async () => {
      const { req, res, next, getNextError } = createMockContext({
        user: { id: userStudentAId, role: 'student', isLinked: true, studentId: studentAId },
        params: { studentId: studentBId },
      });

      await getStudentAttendance(req, res, next);
      const err = getNextError();
      assert.ok(err, 'Expected error to be thrown');
      assert.strictEqual(err.statusCode, 403);
      assert.ok(err.message.includes('Students can only view their own attendance records'));
    });

    it('markAttendance: Rejects teacher marking attendance for unassigned class with 403', async () => {
      const { req, res, next, getNextError } = createMockContext({
        user: { id: userTeacherAId, role: 'teacher', wing: 'Primary', assignedClasses: [classAId] },
        body: { classId: classBId, date: '2026-11-05', records: [] },
      });

      await markAttendance(req, res, next);
      const err = getNextError();
      assert.ok(err, 'Expected error to be thrown');
      assert.strictEqual(err.statusCode, 403);
      assert.ok(err.message.includes('Teachers are only permitted to mark attendance for their assigned classes'));
    });

    it('publishResult: Rejects teacher publishing results for unassigned class with 403', async () => {
      const { req, res, next, getNextError } = createMockContext({
        user: { id: userTeacherAId, role: 'teacher', wing: 'Primary', assignedClasses: [classAId] },
        body: { studentId: studentAId, classId: classBId, term: 'Term 1' },
      });

      await publishResult(req, res, next);
      const err = getNextError();
      assert.ok(err, 'Expected error to be thrown');
      assert.strictEqual(err.statusCode, 403);
      assert.ok(err.message.includes('Teachers are only permitted to publish results for their assigned classes'));
    });

    it('updateParent: Rejects parent update when parent document does not exist (404)', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const origFindById = Parent.findById;
      Parent.findById = async () => null;

      try {
        const { req, res, next, getNextError } = createMockContext({
          user: { id: userParentAId, role: 'parent', isLinked: true, parentId: nonExistentId },
          params: { id: nonExistentId },
          body: { fatherName: 'New Name' },
        });

        await updateParent(req, res, next);
        const err = getNextError();
        assert.ok(err, 'Expected error to be thrown');
        assert.strictEqual(err.statusCode, 404);
        assert.ok(err.message.includes('Parent record not found'));
      } finally {
        Parent.findById = origFindById;
      }
    });

    it('updateParent: Blocks parent from updating another parent profile (403)', async () => {
      const targetId = parentBId;
      const origFindById = Parent.findById;
      Parent.findById = async () => ({
        _id: targetId,
        user: new mongoose.Types.ObjectId().toString(),
      });

      try {
        const { req, res, next, getNextError } = createMockContext({
          user: { id: userParentAId, role: 'parent', isLinked: true, parentId: parentAId },
          params: { id: targetId },
          body: { fatherName: 'Intruder' },
        });

        await updateParent(req, res, next);
        const err = getNextError();
        assert.ok(err, 'Expected error to be thrown');
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('Forbidden: You are not authorized to update this parent record.'));
      } finally {
        Parent.findById = origFindById;
      }
    });

    it('updateStudent: Blocks parent from updating details of an unlinked student (403)', async () => {
      const origFindOne = Student.findOne;
      Student.findOne = async () => ({
        _id: studentBId,
        admissionNumber: 'NDRN-2026-999',
      });

      try {
        const { req, res, next, getNextError } = createMockContext({
          user: { id: userParentAId, role: 'parent', isLinked: true, parentId: parentAId, wardIds: [studentAId] },
          params: { id: studentBId },
          body: { bloodGroup: 'O+' },
        });

        await updateStudent(req, res, next);
        const err = getNextError();
        assert.ok(err, 'Expected error to be thrown');
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('Parents are only permitted to update details for their linked child'));
      } finally {
        Student.findOne = origFindOne;
      }
    });
  });

  // ============================================================================
  // 6. Institutional Role Oversight & Academic Protection Tests
  // ============================================================================
  describe('Institutional Role Oversight & Academic Protection', () => {
    it('Allows administrator to pass through student/parent isolation check', async () => {
      const { req, res, next, wasNextCalled } = createMockContext({
        user: { id: 'admin1', role: 'admin' },
        params: { studentId: studentBId },
      });

      await enforceStudentOrParentDataIsolation(req, res, next);
      assert.strictEqual(wasNextCalled(), true);
    });

    it('Blocks student from mutating academic records', () => {
      const { req, res, next, getResponse, wasNextCalled } = createMockContext({
        user: { id: userStudentAId, role: 'student' },
      });

      protectAcademicRecords(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      assert.strictEqual(getResponse().status, 403);
    });

    it('Blocks parent from mutating academic records', () => {
      const { req, res, next, getResponse, wasNextCalled } = createMockContext({
        user: { id: userParentAId, role: 'parent' },
      });

      protectAcademicRecords(req, res, next);
      assert.strictEqual(wasNextCalled(), false);
      assert.strictEqual(getResponse().status, 403);
    });
  });

  // ============================================================================
  // 7. Account-Linking Service Permission & Validation Tests
  // ============================================================================
  describe('Account Linking Service Security Checks', () => {
    it('Rejects non-admin attempts to link accounts', async () => {
      await assert.rejects(
        async () => {
          await AccountLinkingService.linkStudentAccount(
            { userId: userStudentAId, studentId: studentAId },
            { id: userStudentAId, role: 'student' }
          );
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          assert.ok(err.message.includes('Administrative authorization is required'));
          return true;
        }
      );
    });

    it('Rejects linking without required parameters', async () => {
      await assert.rejects(
        async () => {
          await AccountLinkingService.linkStudentAccount(
            { userId: null, studentId: null },
            { id: 'admin1', role: 'admin' }
          );
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          return true;
        }
      );
    });

    it('Rejects linking parent ward without admin authorization', async () => {
      await assert.rejects(
        async () => {
          await AccountLinkingService.linkParentWard(
            { parentId: parentAId, studentId: studentAId },
            { id: userParentAId, role: 'parent' }
          );
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          return true;
        }
      );
    });

    it('Rejects code generation without admin authorization', async () => {
      await assert.rejects(
        async () => {
          await AccountLinkingService.generateLinkingCode(
            { targetType: 'student', targetId: studentAId },
            { id: userStudentAId, role: 'student' }
          );
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          return true;
        }
      );
    });

    it('Rejects duplicate student linking when student is already linked to another account (409 Conflict)', async () => {
      const origUserFindById = User.findById;
      const origStudentFindOne = Student.findOne;

      const otherUserId = new mongoose.Types.ObjectId().toString();
      User.findById = (id) => {
        const userDoc = {
          _id: id,
          email: 'newuser@student.ndrn.edu.in',
          role: 'student',
        };
        return {
          select: () => Promise.resolve(userDoc),
          then: (res, rej) => Promise.resolve(userDoc).then(res, rej),
        };
      };
      Student.findOne = async () => ({
        _id: studentAId,
        fullName: 'Aarav Kumar',
        admissionNumber: 'NDRN-2026-0001',
        user: otherUserId,
      });

      try {
        await assert.rejects(
          async () => {
            await AccountLinkingService.linkStudentAccount(
              { userId: userStudentAId, studentId: studentAId },
              { id: 'admin1', role: 'admin' }
            );
          },
          (err) => {
            assert.strictEqual(err.statusCode, 409);
            assert.ok(err.message.includes('already linked'));
            return true;
          }
        );
      } finally {
        User.findById = origUserFindById;
        Student.findOne = origStudentFindOne;
      }
    });

    it('Rejects duplicate student linking when user is already linked to another student (409 Conflict)', async () => {
      const origUserFindById = User.findById;
      const origStudentFindOne = Student.findOne;

      const otherStudentId = new mongoose.Types.ObjectId().toString();
      User.findById = async (id) => ({
        _id: id,
        email: 'user@student.ndrn.edu.in',
        role: 'student',
        student: otherStudentId,
      });
      Student.findOne = async () => ({
        _id: studentAId,
        fullName: 'Aarav Kumar',
        admissionNumber: 'NDRN-2026-0001',
        user: null,
      });

      try {
        await assert.rejects(
          async () => {
            await AccountLinkingService.linkStudentAccount(
              { userId: userStudentAId, studentId: studentAId },
              { id: 'admin1', role: 'admin' }
            );
          },
          (err) => {
            assert.strictEqual(err.statusCode, 409);
            assert.ok(err.message.includes('already linked'));
            return true;
          }
        );
      } finally {
        User.findById = origUserFindById;
        Student.findOne = origStudentFindOne;
      }
    });

    it('Rejects duplicate parent linking when parent record is already linked to another account (409 Conflict)', async () => {
      const origUserFindById = User.findById;
      const origParentFindById = Parent.findById;

      const otherUserId = new mongoose.Types.ObjectId().toString();
      User.findById = (id) => {
        const userDoc = {
          _id: id,
          email: 'newparent@ndrn.edu.in',
          role: 'parent',
        };
        return {
          select: () => Promise.resolve(userDoc),
          then: (res, rej) => Promise.resolve(userDoc).then(res, rej),
        };
      };
      Parent.findById = async () => ({
        _id: parentAId,
        primaryContact: { name: 'Sunita Kumar' },
        user: otherUserId,
        students: [studentAId],
      });

      try {
        await assert.rejects(
          async () => {
            await AccountLinkingService.linkParentAccount(
              { userId: userParentAId, parentId: parentAId },
              { id: 'admin1', role: 'admin' }
            );
          },
          (err) => {
            assert.strictEqual(err.statusCode, 409);
            assert.ok(err.message.includes('already linked'));
            return true;
          }
        );
      } finally {
        User.findById = origUserFindById;
        Parent.findById = origParentFindById;
      }
    });

    it('Rejects duplicate parent linking when user is already linked to another parent record (409 Conflict)', async () => {
      const origUserFindById = User.findById;
      const origParentFindById = Parent.findById;

      const otherParentId = new mongoose.Types.ObjectId().toString();
      User.findById = async (id) => ({
        _id: id,
        email: 'parent@ndrn.edu.in',
        role: 'parent',
        parent: otherParentId,
      });
      Parent.findById = async () => ({
        _id: parentAId,
        primaryContact: { name: 'Sunita Kumar' },
        user: null,
        students: [studentAId],
      });

      try {
        await assert.rejects(
          async () => {
            await AccountLinkingService.linkParentAccount(
              { userId: userParentAId, parentId: parentAId },
              { id: 'admin1', role: 'admin' }
            );
          },
          (err) => {
            assert.strictEqual(err.statusCode, 409);
            assert.ok(err.message.includes('already linked'));
            return true;
          }
        );
      } finally {
        User.findById = origUserFindById;
        Parent.findById = origParentFindById;
      }
    });

    it('Rejects invalid or expired linking code (400 Bad Request)', async () => {
      const origStudentFindOne = Student.findOne;
      Student.findOne = () => ({
        select: async () => null,
      });

      try {
        await assert.rejects(
          async () => {
            await AccountLinkingService.redeemLinkingCode(
              { _id: userStudentAId, role: 'student' },
              { linkingCode: 'EXPIRED-1234' }
            );
          },
          (err) => {
            assert.strictEqual(err.statusCode, 400);
            assert.ok(err.message.includes('Invalid or expired linking code'));
            return true;
          }
        );
      } finally {
        Student.findOne = origStudentFindOne;
      }
    });

    it('Rejects redemption when student record is already linked to another account (409 Conflict)', async () => {
      const origStudentFindOne = Student.findOne;
      const otherUserId = new mongoose.Types.ObjectId().toString();
      Student.findOne = () => ({
        select: async () => ({
          _id: studentAId,
          user: otherUserId,
          linkingCode: 'VALID-1234',
          linkingCodeExpires: new Date(Date.now() + 60000),
        }),
      });

      try {
        await assert.rejects(
          async () => {
            await AccountLinkingService.redeemLinkingCode(
              { _id: userStudentAId, role: 'student' },
              { linkingCode: 'VALID-1234' }
            );
          },
          (err) => {
            assert.strictEqual(err.statusCode, 409);
            assert.ok(err.message.includes('already linked'));
            return true;
          }
        );
      } finally {
        Student.findOne = origStudentFindOne;
      }
    });
  });

  // ============================================================================
  // 8. Verified Student & Parent Login Information Resolution
  // ============================================================================
  describe('Verified Account Login & Link Resolution', () => {
    let origReadyState;

    before(() => {
      origReadyState = mongoose.connection.readyState;
      Object.defineProperty(mongoose.connection, 'readyState', {
        value: 1,
        configurable: true,
        writable: true,
      });
    });

    after(() => {
      Object.defineProperty(mongoose.connection, 'readyState', {
        value: origReadyState,
        configurable: true,
        writable: true,
      });
    });

    it('Resolves linked student login with isLinked: true and studentProfile', async () => {
      const origUserFindOne = User.findOne;
      const origStudentFindOne = Student.findOne;
      const origUserFindByIdAndUpdate = User.findByIdAndUpdate;

      const mockStudentUser = {
        _id: userStudentAId,
        email: 'aarav@student.ndrn.edu.in',
        role: 'student',
        status: 'active',
        name: 'Aarav Kumar',
        student: studentAId,
        isLinked: true,
        matchPassword: async () => true,
        save: async () => {},
      };

      User.findOne = () => ({
        select: async () => mockStudentUser,
      });

      User.findByIdAndUpdate = async () => ({});

      Student.findOne = () => ({
        populate: () => ({
          populate: () => ({
            lean: async () => ({
              _id: studentAId,
              fullName: 'Aarav Kumar',
              admissionNumber: 'NDRN-2026-0001',
              rollNumber: 12,
              class: { name: 'Class 5' },
              section: 'A',
              academicYear: '2026-27',
              user: userStudentAId,
            }),
          }),
        }),
      });

      try {
        const result = await AuthService.login('aarav@student.ndrn.edu.in', 'Password123!');
        assert.strictEqual(result.user.isLinked, true);
        assert.strictEqual(result.user.studentId.toString(), studentAId);
        assert.strictEqual(result.user.studentProfile.admissionNumber, 'NDRN-2026-0001');
        assert.strictEqual(result.user.studentProfile.fullName, 'Aarav Kumar');
        assert.ok(result.token);
      } finally {
        User.findOne = origUserFindOne;
        Student.findOne = origStudentFindOne;
        User.findByIdAndUpdate = origUserFindByIdAndUpdate;
      }
    });

    it('Resolves linked parent login with isLinked: true, parentId, wardIds, and wards', async () => {
      const origUserFindOne = User.findOne;
      const origParentFindOne = Parent.findOne;
      const origUserFindByIdAndUpdate = User.findByIdAndUpdate;

      const mockParentUser = {
        _id: userParentAId,
        email: 'sunita@parent.ndrn.edu.in',
        role: 'parent',
        status: 'active',
        name: 'Sunita Kumar',
        parent: parentAId,
        isLinked: true,
        matchPassword: async () => true,
        save: async () => {},
      };

      User.findOne = () => ({
        select: async () => mockParentUser,
      });

      User.findByIdAndUpdate = async () => ({});

      Parent.findOne = () => ({
        populate: () => ({
          lean: async () => ({
            _id: parentAId,
            fullName: 'Sunita Kumar',
            user: userParentAId,
            students: [
              {
                _id: studentAId,
                fullName: 'Aarav Kumar',
                admissionNumber: 'NDRN-2026-0001',
                rollNumber: 12,
                class: { name: 'Class 5' },
                section: 'A',
              },
            ],
          }),
        }),
      });

      try {
        const result = await AuthService.login('sunita@parent.ndrn.edu.in', 'Password123!');
        assert.strictEqual(result.user.isLinked, true);
        assert.strictEqual(result.user.parentId.toString(), parentAId);
        assert.strictEqual(result.user.wardIds.length, 1);
        assert.strictEqual(result.user.wardIds[0], studentAId);
        assert.strictEqual(result.user.wards[0].fullName, 'Aarav Kumar');
        assert.ok(result.token);
      } finally {
        User.findOne = origUserFindOne;
        Parent.findOne = origParentFindOne;
        User.findByIdAndUpdate = origUserFindByIdAndUpdate;
      }
    });

    it('Resolves unlinked account login with isLinked: false and empty relationships', async () => {
      const origUserFindOne = User.findOne;
      const origStudentFindOne = Student.findOne;

      const mockUnlinkedUser = {
        _id: userUnlinkedId,
        email: 'unlinked@student.ndrn.edu.in',
        role: 'student',
        status: 'active',
        name: 'Unlinked Student',
        student: null,
        parent: null,
        isLinked: false,
        matchPassword: async () => true,
        save: async () => {},
      };

      User.findOne = () => ({
        select: async () => mockUnlinkedUser,
      });

      Student.findOne = () => ({
        populate: () => ({
          populate: () => ({
            lean: async () => null,
          }),
        }),
      });

      try {
        const result = await AuthService.login('unlinked@student.ndrn.edu.in', 'Password123!');
        assert.strictEqual(result.user.isLinked, false);
        assert.strictEqual(result.user.studentId, undefined);
        assert.strictEqual(result.user.studentProfile, undefined);
        assert.ok(result.token);
      } finally {
        User.findOne = origUserFindOne;
        Student.findOne = origStudentFindOne;
      }
    });
  });
});
