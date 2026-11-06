import { describe, it } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { Teacher } from '../models/Teacher.js';
import { Class } from '../models/Class.js';
import { Fee } from '../models/Fee.js';
import { User } from '../models/User.js';
import {
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import {
  createParent,
  updateParent,
  deleteParent,
  linkParentWard,
  unlinkParentWard,
} from '../controllers/parentController.js';
import {
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import {
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/classController.js';
import {
  payFee,
} from '../controllers/feeController.js';

describe('Data Integration Architecture Test Suite', () => {
  const adminUser = { id: new mongoose.Types.ObjectId().toString(), role: 'admin' };
  const teacherUser = { id: new mongoose.Types.ObjectId().toString(), role: 'teacher' };
  const studentAId = new mongoose.Types.ObjectId().toString();
  const studentBId = new mongoose.Types.ObjectId().toString();
  const linkedStudentUser = {
    id: new mongoose.Types.ObjectId().toString(),
    role: 'student',
    studentId: studentAId,
    isLinked: true,
  };
  const unlinkedStudentUser = {
    id: new mongoose.Types.ObjectId().toString(),
    role: 'student',
    studentId: null,
    isLinked: false,
  };
  const linkedParentUser = {
    id: new mongoose.Types.ObjectId().toString(),
    role: 'parent',
    parentId: new mongoose.Types.ObjectId().toString(),
    wardIds: [studentAId],
    isLinked: true,
  };
  const unlinkedParentUser = {
    id: new mongoose.Types.ObjectId().toString(),
    role: 'parent',
    parentId: null,
    wardIds: [],
    isLinked: false,
  };

  function createMockContext({ user, params = {}, query = {}, body = {} }) {
    const req = { user, params, query, body, headers: {} };
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

    let nextError = null;
    let nextCalled = false;
    const next = (err) => {
      if (err) nextError = err;
      else nextCalled = true;
    };

    return {
      req,
      res,
      next,
      getResponse: () => ({ status: statusCode, body: responseData }),
      getError: () => nextError,
      wasNextCalled: () => nextCalled,
    };
  }

  // =========================================================================
  // 1. Student Integration
  // =========================================================================
  describe('Student CRUD & Schema Mapping', () => {
    it('Enforces admin role on deleteStudent (Rejects non-admin with 403)', async () => {
      const ctx = createMockContext({
        user: teacherUser,
        params: { id: studentAId },
      });

      await deleteStudent(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err, 'Expected error to be passed to next()');
      assert.strictEqual(err.statusCode, 403);
    });

    it('Rejects student update by unauthorized role with 403', async () => {
      const ctx = createMockContext({
        user: teacherUser,
        params: { id: studentAId },
        body: { fullName: 'Unauthorized Update' },
      });

      // Mock Student.findOne
      const origFindOne = Student.findOne;
      Student.findOne = async () => ({ _id: studentAId, fullName: 'Original Name' });

      try {
        await updateStudent(ctx.req, ctx.res, ctx.next);
        const err = ctx.getError();
        assert.ok(err);
        assert.strictEqual(err.statusCode, 403);
      } finally {
        Student.findOne = origFindOne;
      }
    });

    it('Validates Student Model schema requirements', () => {
      const student = new Student({
        fullName: 'Test Candidate',
        admissionNumber: 'NDRN-2026-9999',
        dateOfBirth: new Date('2018-05-10'),
        gender: 'Male',
        class: new mongoose.Types.ObjectId(),
      });

      const err = student.validateSync();
      assert.strictEqual(err, undefined, 'Student with valid fields should pass validation');
    });

    it('Rejects Student Model when admissionNumber or fullName is missing', () => {
      const student = new Student({});
      const err = student.validateSync();
      assert.ok(err);
      assert.ok(err.errors.fullName, 'Expected error on fullName');
      assert.ok(err.errors.admissionNumber, 'Expected error on admissionNumber');
      assert.ok(err.errors.gender, 'Expected error on gender');
    });
  });

  // =========================================================================
  // 2. Parent Integration
  // =========================================================================
  describe('Parent CRUD & Ward Linking', () => {
    it('Enforces admin role on deleteParent (Rejects non-admin with 403)', async () => {
      const ctx = createMockContext({
        user: linkedParentUser,
        params: { id: new mongoose.Types.ObjectId().toString() },
      });

      await deleteParent(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
    });

    it('Rejects deleteParent when target parent ID is invalid', async () => {
      const ctx = createMockContext({
        user: adminUser,
        params: { id: 'invalid-id' },
      });

      await deleteParent(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 400);
    });

    it('Rejects linkParentWard when requested by non-admin', async () => {
      const ctx = createMockContext({
        user: teacherUser,
        params: { id: new mongoose.Types.ObjectId().toString() },
        body: { studentId: studentAId },
      });

      await linkParentWard(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
    });

    it('Validates Parent Model schema requirements', () => {
      const parent = new Parent({
        primaryContact: {
          name: 'Shri Ramesh Kumar',
          phone: '9876543210',
          relationship: 'Father',
        },
      });

      const err = parent.validateSync();
      assert.strictEqual(err, undefined, 'Parent with valid primaryContact should pass validation');
    });

    it('Rejects Parent Model when primaryContact name or phone is missing', () => {
      const parent = new Parent({});
      const err = parent.validateSync();
      assert.ok(err);
      assert.ok(err.errors['primaryContact.name']);
      assert.ok(err.errors['primaryContact.phone']);
    });
  });

  // =========================================================================
  // 3. Teacher Integration
  // =========================================================================
  describe('Teacher CRUD & Class Unassignment', () => {
    it('Enforces admin role on deleteTeacher (Rejects non-admin with 403)', async () => {
      const ctx = createMockContext({
        user: teacherUser,
        params: { id: new mongoose.Types.ObjectId().toString() },
      });

      await deleteTeacher(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
    });

    it('Validates Teacher Model schema requirements', () => {
      const teacher = new Teacher({
        user: new mongoose.Types.ObjectId(),
        employeeId: 'EMP-2026-001',
        fullName: 'Mrs. Suman Verma',
        email: 'suman.verma@ndrn.edu',
        designation: 'Primary Educator',
        phone: '9876543210',
      });

      const err = teacher.validateSync();
      assert.strictEqual(err, undefined, 'Teacher with required fields should pass validation');
    });

    it('Rejects Teacher Model when employeeId or user reference is missing', () => {
      const teacher = new Teacher({});
      const err = teacher.validateSync();
      assert.ok(err);
      assert.ok(err.errors.user);
      assert.ok(err.errors.employeeId);
      assert.ok(err.errors.fullName);
    });
  });

  // =========================================================================
  // 4. Class Cohort Integration & Enrolled Constraint
  // =========================================================================
  describe('Class Cohort CRUD & Deletion Constraint', () => {
    it('Enforces admin role on updateClass (Rejects non-admin with 403)', async () => {
      const ctx = createMockContext({
        user: teacherUser,
        params: { id: new mongoose.Types.ObjectId().toString() },
        body: { capacity: 40 },
      });

      await updateClass(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
    });

    it('Enforces admin role on deleteClass (Rejects non-admin with 403)', async () => {
      const ctx = createMockContext({
        user: teacherUser,
        params: { id: new mongoose.Types.ObjectId().toString() },
      });

      await deleteClass(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
    });

    it('Blocks deleteClass when active students are enrolled (409 Conflict)', async () => {
      const targetClassId = new mongoose.Types.ObjectId();
      const ctx = createMockContext({
        user: adminUser,
        params: { id: targetClassId.toString() },
      });

      const origFindById = Class.findById;
      const origCountDocs = Student.countDocuments;

      Class.findById = async () => ({ _id: targetClassId, name: 'Class 5', section: 'A' });
      Student.countDocuments = async () => 24; // 24 active enrolled students

      try {
        await deleteClass(ctx.req, ctx.res, ctx.next);
        const err = ctx.getError();
        assert.ok(err);
        assert.strictEqual(err.statusCode, 409);
        assert.ok(err.message.includes('24 active student(s) are currently enrolled'));
      } finally {
        Class.findById = origFindById;
        Student.countDocuments = origCountDocs;
      }
    });

    it('Allows deleteClass when no students are enrolled', async () => {
      const targetClassId = new mongoose.Types.ObjectId();
      const ctx = createMockContext({
        user: adminUser,
        params: { id: targetClassId.toString() },
      });

      let deleted = false;
      const origFindById = Class.findById;
      const origCountDocs = Student.countDocuments;
      const origFindByIdAndDelete = Class.findByIdAndDelete;

      Class.findById = async () => ({ _id: targetClassId, name: 'Class 1', section: 'B' });
      Student.countDocuments = async () => 0; // 0 students enrolled
      Class.findByIdAndDelete = async () => { deleted = true; };

      try {
        await deleteClass(ctx.req, ctx.res, ctx.next);
        const response = ctx.getResponse();
        assert.strictEqual(response.status, 200);
        assert.strictEqual(deleted, true);
      } finally {
        Class.findById = origFindById;
        Student.countDocuments = origCountDocs;
        Class.findByIdAndDelete = origFindByIdAndDelete;
      }
    });
  });

  // =========================================================================
  // 5. Fee Payment Integration & Ownership Enforcement
  // =========================================================================
  describe('Fee Payment Authorization & Persistence', () => {
    it('Blocks unlinked student from processing online payments (403 Forbidden)', async () => {
      const ctx = createMockContext({
        user: unlinkedStudentUser,
        body: { studentId: studentAId, amount: 3200 },
      });

      await payFee(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
    });

    it('Blocks student from paying fees for another student account (403 Forbidden)', async () => {
      const ctx = createMockContext({
        user: linkedStudentUser,
        body: { studentId: studentBId, amount: 3200 },
      });

      await payFee(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
    });

    it('Blocks unlinked parent from processing fee payments (403 Forbidden)', async () => {
      const ctx = createMockContext({
        user: unlinkedParentUser,
        body: { studentId: studentAId, amount: 3200 },
      });

      await payFee(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
    });

    it('Blocks parent from paying fees for an unlinked student ward (403 Forbidden)', async () => {
      const ctx = createMockContext({
        user: linkedParentUser,
        body: { studentId: studentBId, amount: 3200 },
      });

      await payFee(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
    });
  });
});
