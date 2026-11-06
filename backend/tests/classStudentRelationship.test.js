import { describe, it } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { Teacher } from '../models/Teacher.js';
import {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import {
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/classController.js';

describe('Class & Student MongoDB Relationships Test Suite', () => {
  const adminUser = { id: new mongoose.Types.ObjectId().toString(), role: 'admin' };
  const teacherUser = {
    id: new mongoose.Types.ObjectId().toString(),
    role: 'teacher',
    assignedClasses: [new mongoose.Types.ObjectId().toString()],
  };
  const adminWingTeacherUser = {
    id: new mongoose.Types.ObjectId().toString(),
    role: 'teacher',
    wing: 'Administration',
    assignedClasses: [],
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
    const next = (err) => {
      if (err) nextError = err;
    };

    return {
      req,
      res,
      next,
      getResponse: () => ({ status: statusCode, body: responseData }),
      getError: () => nextError,
    };
  }

  // =========================================================================
  // 1. Class Schema & Relationship Constraints
  // =========================================================================
  describe('1. Class Schema & Reference Integrity', () => {
    it('Validates primary class levels (Nursery through Class 5)', () => {
      const validLevels = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
      for (const name of validLevels) {
        const cls = new Class({
          name,
          section: 'A',
          academicYear: '2026-2027',
        });
        assert.strictEqual(cls.validateSync(), undefined, `Expected ${name} to pass validation`);
      }
    });

    it('Rejects classes outside primary education scope', () => {
      const invalidCls = new Class({
        name: 'Class 10',
        section: 'A',
        academicYear: '2026-2027',
      });
      const err = invalidCls.validateSync();
      assert.ok(err);
      assert.ok(err.errors.name);
    });

    it('Class can associate with Teacher model via classTeacher ObjectId', () => {
      const teacherId = new mongoose.Types.ObjectId();
      const cls = new Class({
        name: 'Class 3',
        section: 'A',
        academicYear: '2026-2027',
        classTeacher: teacherId,
      });
      assert.strictEqual(cls.validateSync(), undefined);
      assert.strictEqual(cls.classTeacher.toString(), teacherId.toString());
    });

    it('Normalizes section to uppercase', () => {
      const cls = new Class({
        name: 'Class 2',
        section: 'b',
        academicYear: '2026-2027',
      });
      assert.strictEqual(cls.section, 'B');
    });

    it('Populates default subjects appropriate for primary wing', () => {
      const cls = new Class({
        name: 'Class 1',
        section: 'A',
      });
      assert.ok(Array.isArray(cls.subjects));
      assert.ok(cls.subjects.includes('Hindi'));
      assert.ok(cls.subjects.includes('English'));
      assert.ok(cls.subjects.includes('Mathematics'));
      assert.ok(cls.subjects.includes('Arts & Craft'));
    });
  });

  // =========================================================================
  // 2. Student Schema & Class Association
  // =========================================================================
  describe('2. Student Schema & Class Association', () => {
    it('Requires class assignment reference in Student document', () => {
      const student = new Student({
        admissionNumber: 'NDRN-2026-0101',
        fullName: 'Aarav Patel',
        dateOfBirth: new Date('2019-06-15'),
        gender: 'Male',
        // class omitted
      });
      const err = student.validateSync();
      assert.ok(err);
      assert.ok(err.errors.class, 'Student must require a class reference');
    });

    it('Validates student document with class, parent, and user references', () => {
      const classId = new mongoose.Types.ObjectId();
      const parentId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      const student = new Student({
        admissionNumber: 'NDRN-2026-0102',
        fullName: 'Diya Sharma',
        dateOfBirth: new Date('2019-08-20'),
        gender: 'Female',
        class: classId,
        parent: parentId,
        user: userId,
        academicYear: '2026-2027',
      });

      assert.strictEqual(student.validateSync(), undefined);
      assert.strictEqual(student.class.toString(), classId.toString());
      assert.strictEqual(student.parent.toString(), parentId.toString());
      assert.strictEqual(student.user.toString(), userId.toString());
    });

    it('Enforces uppercase admission number formatting', () => {
      const student = new Student({
        admissionNumber: 'ndrn-2026-0103',
        fullName: 'Kabir Singh',
        dateOfBirth: new Date('2018-04-10'),
        gender: 'Male',
        class: new mongoose.Types.ObjectId(),
      });
      assert.strictEqual(student.admissionNumber, 'NDRN-2026-0103');
    });
  });

  // =========================================================================
  // 3. Controller-Level Relationship Resolution in createStudent
  // =========================================================================
  describe('3. Controller-Level Class & Parent Relationship Resolution', () => {
    it('createStudent links directly to Class when classId ObjectId is supplied', async () => {
      const classId = new mongoose.Types.ObjectId();
      const studentId = new mongoose.Types.ObjectId();

      const origStudentCount = Student.countDocuments;
      const origStudentCreate = Student.create;
      const origStudentFindById = Student.findById;

      Student.countDocuments = async () => 15;
      Student.create = async (doc) => ({
        _id: studentId,
        ...doc,
      });
      Student.findById = () => ({
        populate: () => ({
          populate: async () => ({
            _id: studentId,
            fullName: 'Riya Sen',
            admissionNumber: 'NDRN-2026-0016',
            class: { _id: classId, name: 'Class 4', section: 'A' },
            parent: null,
          }),
        }),
      });

      try {
        const ctx = createMockContext({
          user: adminUser,
          body: {
            fullName: 'Riya Sen',
            class: classId.toString(),
            dateOfBirth: '2017-09-12',
            gender: 'Female',
          },
        });

        await createStudent(ctx.req, ctx.res, ctx.next);
        const res = ctx.getResponse();
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.class.name, 'Class 4');
      } finally {
        Student.countDocuments = origStudentCount;
        Student.create = origStudentCreate;
        Student.findById = origStudentFindById;
      }
    });

    it('createStudent auto-resolves Class when class name string is supplied', async () => {
      const classId = new mongoose.Types.ObjectId();
      const studentId = new mongoose.Types.ObjectId();

      const origClassFindOne = Class.findOne;
      const origStudentCount = Student.countDocuments;
      const origStudentCreate = Student.create;
      const origStudentFindById = Student.findById;

      Class.findOne = async (query) => {
        if (query.name === 'Class 2') {
          return { _id: classId, name: 'Class 2', section: 'A' };
        }
        return null;
      };

      let createdData = null;
      Student.countDocuments = async () => 20;
      Student.create = async (doc) => {
        createdData = doc;
        return { _id: studentId, ...doc };
      };
      Student.findById = () => ({
        populate: () => ({
          populate: async () => ({
            _id: studentId,
            ...createdData,
            class: { _id: classId, name: 'Class 2', section: 'A' },
          }),
        }),
      });

      try {
        const ctx = createMockContext({
          user: adminUser,
          body: {
            name: 'Ananya Roy',
            grade: 'Class 2',
            dateOfBirth: '2019-01-25',
            gender: 'Female',
          },
        });

        await createStudent(ctx.req, ctx.res, ctx.next);
        const res = ctx.getResponse();
        assert.strictEqual(res.status, 201);
        assert.strictEqual(createdData.class.toString(), classId.toString());
      } finally {
        Class.findOne = origClassFindOne;
        Student.countDocuments = origStudentCount;
        Student.create = origStudentCreate;
        Student.findById = origStudentFindById;
      }
    });

    it('createStudent links Parent and updates parent students array via $addToSet', async () => {
      const parentId = new mongoose.Types.ObjectId();
      const studentId = new mongoose.Types.ObjectId();
      const classId = new mongoose.Types.ObjectId();

      const origParentFindOne = Parent.findOne;
      const origParentFindByIdAndUpdate = Parent.findByIdAndUpdate;
      const origStudentCount = Student.countDocuments;
      const origStudentCreate = Student.create;
      const origStudentFindById = Student.findById;

      let parentUpdateCalled = false;
      Parent.findOne = async () => ({ _id: parentId });
      Parent.findByIdAndUpdate = async (id, update) => {
        if (id.toString() === parentId.toString() && update.$addToSet?.students) {
          parentUpdateCalled = true;
        }
        return { _id: parentId };
      };

      Student.countDocuments = async () => 5;
      Student.create = async (doc) => ({ _id: studentId, ...doc });
      Student.findById = () => ({
        populate: () => ({
          populate: async () => ({
            _id: studentId,
            fullName: 'Dev Malhotra',
            class: { _id: classId, name: 'Class 1', section: 'A' },
            parent: { _id: parentId, primaryContact: { name: 'Sunil Malhotra', phone: '9876543210' } },
          }),
        }),
      });

      try {
        const ctx = createMockContext({
          user: adminUser,
          body: {
            fullName: 'Dev Malhotra',
            class: classId.toString(),
            dateOfBirth: '2020-03-10',
            gender: 'Male',
            parentName: 'Sunil Malhotra',
            parentPhone: '9876543210',
          },
        });

        await createStudent(ctx.req, ctx.res, ctx.next);
        const res = ctx.getResponse();
        assert.strictEqual(res.status, 201);
        assert.strictEqual(parentUpdateCalled, true, 'Expected Parent.findByIdAndUpdate with $addToSet: { students }');
      } finally {
        Parent.findOne = origParentFindOne;
        Parent.findByIdAndUpdate = origParentFindByIdAndUpdate;
        Student.countDocuments = origStudentCount;
        Student.create = origStudentCreate;
        Student.findById = origStudentFindById;
      }
    });
  });

  // =========================================================================
  // 4. Class Cohort Queries & Role Isolation
  // =========================================================================
  describe('4. Class Cohort Student Listing & Teacher Access Control', () => {
    it('Allows Admin to filter students by classId', async () => {
      const targetClassId = new mongoose.Types.ObjectId().toString();
      let queriedClass = null;

      const origStudentFind = Student.find;
      const origStudentCount = Student.countDocuments;

      Student.find = (filter) => {
        queriedClass = filter.class;
        return {
          sort: () => ({
            skip: () => ({
              limit: () => ({
                populate: () => ({
                  populate: () => ({
                    lean: async () => [
                      { _id: new mongoose.Types.ObjectId(), fullName: 'Student in Target Class', class: targetClassId },
                    ],
                  }),
                }),
              }),
            }),
          }),
        };
      };
      Student.countDocuments = async () => 1;

      try {
        const ctx = createMockContext({
          user: adminUser,
          query: { classId: targetClassId },
        });

        await getStudents(ctx.req, ctx.res, ctx.next);
        const res = ctx.getResponse();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(queriedClass, targetClassId);
      } finally {
        Student.find = origStudentFind;
        Student.countDocuments = origStudentCount;
      }
    });

    it('Rejects teacher querying student roster for unassigned class (403 Forbidden)', async () => {
      const unassignedClassId = new mongoose.Types.ObjectId().toString();
      const ctx = createMockContext({
        user: teacherUser, // assigned to teacherUser.assignedClasses[0], not unassignedClassId
        query: { classId: unassignedClassId },
      });

      await getStudents(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
      assert.ok(err.message.includes('assigned classes'));
    });

    it('Allows Administration wing teacher to query across any class', async () => {
      const anyClassId = new mongoose.Types.ObjectId().toString();
      let queriedClass = null;

      const origStudentFind = Student.find;
      const origStudentCount = Student.countDocuments;

      Student.find = (filter) => {
        queriedClass = filter.class;
        return {
          sort: () => ({
            skip: () => ({
              limit: () => ({
                populate: () => ({
                  populate: () => ({
                    lean: async () => [],
                  }),
                }),
              }),
            }),
          }),
        };
      };
      Student.countDocuments = async () => 0;

      try {
        const ctx = createMockContext({
          user: adminWingTeacherUser,
          query: { classId: anyClassId },
        });

        await getStudents(ctx.req, ctx.res, ctx.next);
        const res = ctx.getResponse();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(queriedClass, anyClassId);
      } finally {
        Student.find = origStudentFind;
        Student.countDocuments = origStudentCount;
      }
    });
  });

  // =========================================================================
  // 5. Class Deletion Constraint
  // =========================================================================
  describe('5. Class Deletion Enrolled Student Constraint', () => {
    it('Prevents deleting a class cohort when active students are enrolled', async () => {
      const classId = new mongoose.Types.ObjectId();
      const origClassFindById = Class.findById;
      const origStudentCount = Student.countDocuments;

      Class.findById = async () => ({ _id: classId, name: 'Class 3', section: 'A' });
      Student.countDocuments = async () => 28;

      try {
        const ctx = createMockContext({
          user: adminUser,
          params: { id: classId.toString() },
        });

        await deleteClass(ctx.req, ctx.res, ctx.next);
        const err = ctx.getError();
        assert.ok(err);
        assert.strictEqual(err.statusCode, 409);
        assert.ok(err.message.includes('28 active student(s) are currently enrolled'));
      } finally {
        Class.findById = origClassFindById;
        Student.countDocuments = origStudentCount;
      }
    });
  });
});

