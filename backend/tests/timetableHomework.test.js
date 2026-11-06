import { describe, it } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import {
  getTimetable,
  getTeacherTimetable,
  setTimetable,
} from '../controllers/timetableController.js';
import {
  getHomework,
  createHomework,
  submitHomework,
  getHomeworkSubmissions,
} from '../controllers/homeworkController.js';
import { Timetable } from '../models/Timetable.js';
import { Homework } from '../models/Homework.js';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { getKolkataDayOfWeek } from '../utils/timezone.js';

describe('Timetable & Homework Integration Test Suite', () => {
  const classAId = new mongoose.Types.ObjectId();
  const classBId = new mongoose.Types.ObjectId();
  const student1Id = new mongoose.Types.ObjectId();
  const student2Id = new mongoose.Types.ObjectId();
  const teacherAId = new mongoose.Types.ObjectId();
  const teacherUserAId = new mongoose.Types.ObjectId();
  const adminUserId = new mongoose.Types.ObjectId();

  const mockClassA = {
    _id: classAId,
    name: 'Class 5',
    section: 'A',
    roomNumber: 'Room 101',
    academicYear: '2026-2027',
  };

  const mockClassB = {
    _id: classBId,
    name: 'Class 4',
    section: 'A',
    roomNumber: 'Room 102',
    academicYear: '2026-2027',
  };

  const mockStudent1 = {
    _id: student1Id,
    fullName: 'Rohan Sharma',
    admissionNumber: 'NDRN-2026-1001',
    class: classAId, // Enrolled in Class A
  };

  const mockStudent2 = {
    _id: student2Id,
    fullName: 'Pooja Gupta',
    admissionNumber: 'NDRN-2026-1002',
    class: classBId, // Enrolled in Class B
  };

  const mockTeacherA = {
    _id: teacherAId,
    user: teacherUserAId,
    fullName: 'Suman Verma',
    employeeId: 'EMP-TCH-001',
    assignedClasses: [classAId],
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
  // 1. TIMETABLE INTEGRATION TESTS
  // =========================================================================
  describe('Timetable System & Asia/Kolkata Scheduling', () => {
    it('Calculates current school working day in Asia/Kolkata timezone', () => {
      const day = getKolkataDayOfWeek(new Date());
      const validSchoolDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      assert.ok(validSchoolDays.includes(day), `Expected valid school day but got ${day}`);
    });

    it('getTimetable: Retrieves class timetable from MongoDB with populated teacher and class', async () => {
      const origClassFindById = Class.findById;
      Class.findById = async (id) => (id.toString() === classAId.toString() ? mockClassA : null);

      const origTimetableFind = Timetable.find;
      Timetable.find = () => ({
        populate() {
          return this;
        },
        sort() {
          return this;
        },
        lean: async () => [
          {
            _id: new mongoose.Types.ObjectId(),
            class: mockClassA,
            dayOfWeek: 'Monday',
            periods: [
              {
                periodNumber: 1,
                startTime: '08:30 AM',
                endTime: '09:15 AM',
                subject: 'Mathematics',
                teacher: { fullName: 'Suman Verma' },
                room: 'Room 101',
              },
            ],
          },
        ],
      });

      const ctx = createMockContext({
        user: { role: 'admin', id: adminUserId.toString() },
        params: { classId: classAId.toString() },
        query: { day: 'Monday' },
      });

      try {
        await getTimetable(ctx.req, ctx.res, ctx.next);
        assert.strictEqual(ctx.getError(), null);
        const res = ctx.getResponse();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.data.length, 1);
        assert.strictEqual(res.body.data[0].periods[0].subject, 'Mathematics');
      } finally {
        Class.findById = origClassFindById;
        Timetable.find = origTimetableFind;
      }
    });

    it('getTimetable: Rejects teacher viewing timetable for unassigned class (403 Forbidden)', async () => {
      const origClassFindById = Class.findById;
      Class.findById = async (id) => (id.toString() === classBId.toString() ? mockClassB : null);

      const ctx = createMockContext({
        user: {
          role: 'teacher',
          id: teacherUserAId.toString(),
          wing: 'Primary',
          assignedClasses: [classAId.toString()], // Only assigned to Class A!
        },
        params: { classId: classBId.toString() }, // Requesting Class B!
      });

      try {
        await getTimetable(ctx.req, ctx.res, ctx.next);
        const err = ctx.getError();
        assert.ok(err, 'Expected error to be thrown');
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('assigned classes'));
      } finally {
        Class.findById = origClassFindById;
      }
    });

    it('setTimetable: Allows administrator to configure and upsert timetable periods in MongoDB', async () => {
      const origClassFindById = Class.findById;
      Class.findById = async () => mockClassA;

      let savedRecord = null;
      const origFindOneAndUpdate = Timetable.findOneAndUpdate;
      Timetable.findOneAndUpdate = (query, update) => {
        savedRecord = { ...query, ...update };
        return {
          populate() {
            return this;
          },
          then(resolve) {
            resolve(savedRecord);
          },
        };
      };

      const ctx = createMockContext({
        user: { role: 'admin', id: adminUserId.toString() },
        params: { classId: classAId.toString() },
        body: {
          dayOfWeek: 'Monday',
          periods: [
            {
              periodNumber: 1,
              startTime: '08:30 AM',
              endTime: '09:15 AM',
              subject: 'English Grammar',
            },
          ],
        },
      });

      try {
        await setTimetable(ctx.req, ctx.res, ctx.next);
        assert.strictEqual(ctx.getError(), null);
        assert.strictEqual(ctx.getResponse().status, 200);
        assert.ok(savedRecord);
        assert.strictEqual(savedRecord.dayOfWeek, 'Monday');
        assert.strictEqual(savedRecord.periods[0].subject, 'English Grammar');
      } finally {
        Class.findById = origClassFindById;
        Timetable.findOneAndUpdate = origFindOneAndUpdate;
      }
    });
  });

  // =========================================================================
  // 2. HOMEWORK INTEGRATION TESTS
  // =========================================================================
  describe('Homework System, Creation & Verified Submissions', () => {
    it('createHomework: Persists new homework assignment to MongoDB for authorized teacher', async () => {
      const origClassFindById = Class.findById;
      Class.findById = async () => mockClassA;

      const origTeacherFindOne = Teacher.findOne;
      Teacher.findOne = async () => mockTeacherA;

      let createdDoc = null;
      const origHomeworkCreate = Homework.create;
      Homework.create = async (doc) => {
        createdDoc = { ...doc, _id: new mongoose.Types.ObjectId() };
        return createdDoc;
      };

      const origHomeworkFindById = Homework.findById;
      Homework.findById = () => ({
        populate() {
          return this;
        },
        lean: async () => createdDoc,
      });

      const ctx = createMockContext({
        user: {
          role: 'teacher',
          id: teacherUserAId.toString(),
          wing: 'Primary',
          assignedClasses: [classAId.toString()],
        },
        body: {
          classId: classAId.toString(),
          subject: 'Mathematics',
          title: 'Fraction Addition Practice',
          description: 'Solve questions 1 through 10 on page 45.',
          dueDate: '2026-11-08',
        },
      });

      try {
        await createHomework(ctx.req, ctx.res, ctx.next);
        assert.strictEqual(ctx.getError(), null);
        assert.strictEqual(ctx.getResponse().status, 201);
        assert.ok(createdDoc);
        assert.strictEqual(createdDoc.subject, 'Mathematics');
        assert.strictEqual(createdDoc.title, 'Fraction Addition Practice');
      } finally {
        Class.findById = origClassFindById;
        Teacher.findOne = origTeacherFindOne;
        Homework.create = origHomeworkCreate;
        Homework.findById = origHomeworkFindById;
      }
    });

    it('createHomework: Rejects teacher issuing homework for an unassigned class (403 Forbidden)', async () => {
      const origClassFindById = Class.findById;
      Class.findById = async () => mockClassB;

      const ctx = createMockContext({
        user: {
          role: 'teacher',
          id: teacherUserAId.toString(),
          wing: 'Primary',
          assignedClasses: [classAId.toString()], // Only assigned to Class A!
        },
        body: {
          classId: classBId.toString(), // Trying to issue homework to Class B!
          subject: 'Environmental Studies',
          title: 'Plant Anatomy',
          description: 'Draw a flower and label parts.',
          dueDate: '2026-11-09',
        },
      });

      try {
        await createHomework(ctx.req, ctx.res, ctx.next);
        const err = ctx.getError();
        assert.ok(err);
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('assigned classes'));
      } finally {
        Class.findById = origClassFindById;
      }
    });

    it('submitHomework: Persists student submission in MongoDB and enforces student ownership', async () => {
      const homeworkId = new mongoose.Types.ObjectId();
      const mockHwDoc = {
        _id: homeworkId,
        class: { _id: classAId, name: 'Class 5', section: 'A' },
        title: 'Math Exercises',
        submissions: [],
        save: async function () {
          return this;
        },
      };

      const origHwFindById = Homework.findById;
      Homework.findById = () => ({
        populate: async () => mockHwDoc,
      });

      const origStudentFindById = Student.findById;
      Student.findById = async (id) => (id.toString() === student1Id.toString() ? mockStudent1 : null);

      // Student 1 submits work (passes foreign studentId in body which MUST be ignored)
      const ctx = createMockContext({
        user: {
          role: 'student',
          id: new mongoose.Types.ObjectId().toString(),
          studentId: student1Id.toString(), // Official linked studentId
          isLinked: true,
        },
        params: { id: homeworkId.toString() },
        body: {
          studentId: 'fraudulent-foreign-id', // Attacker attempt to submit for another student
          submissionNotes: 'All questions solved in notebook.',
        },
      });

      try {
        await submitHomework(ctx.req, ctx.res, ctx.next);
        assert.strictEqual(ctx.getError(), null);
        assert.strictEqual(ctx.getResponse().status, 200);

        // Verify that submission was recorded for student1Id (NOT the fraudulent body ID)
        assert.strictEqual(mockHwDoc.submissions.length, 1);
        assert.strictEqual(mockHwDoc.submissions[0].student.toString(), student1Id.toString());
        assert.strictEqual(mockHwDoc.submissions[0].submissionNotes, 'All questions solved in notebook.');
      } finally {
        Homework.findById = origHwFindById;
        Student.findById = origStudentFindById;
      }
    });

    it('submitHomework: Rejects submission if student is not enrolled in the assigned class (400 Bad Request)', async () => {
      const homeworkId = new mongoose.Types.ObjectId();
      const mockHwDoc = {
        _id: homeworkId,
        class: { _id: classAId, name: 'Class 5', section: 'A' },
        submissions: [],
      };

      const origHwFindById = Homework.findById;
      Homework.findById = () => ({
        populate: async () => mockHwDoc,
      });

      // Student 2 is enrolled in Class B (NOT Class A!)
      const origStudentFindById = Student.findById;
      Student.findById = async (id) => (id.toString() === student2Id.toString() ? mockStudent2 : null);

      const ctx = createMockContext({
        user: {
          role: 'student',
          id: new mongoose.Types.ObjectId().toString(),
          studentId: student2Id.toString(),
          isLinked: true,
        },
        params: { id: homeworkId.toString() },
        body: { submissionNotes: 'Completed.' },
      });

      try {
        await submitHomework(ctx.req, ctx.res, ctx.next);
        const err = ctx.getError();
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.ok(err.message.includes('not enrolled in class'));
      } finally {
        Homework.findById = origHwFindById;
        Student.findById = origStudentFindById;
      }
    });

    it('getHomework: Scopes homework listing for student and attaches accurate submission status', async () => {
      const origStudentFindById = Student.findById;
      Student.findById = () => ({
        select: () => ({
          lean: async () => ({ _id: student1Id, class: classAId }),
        }),
      });

      const origHwFind = Homework.find;
      Homework.find = () => ({
        sort() {
          return this;
        },
        skip() {
          return this;
        },
        limit() {
          return this;
        },
        populate() {
          return this;
        },
        lean: async () => [
          {
            _id: new mongoose.Types.ObjectId(),
            title: 'Science Project',
            subject: 'Science',
            class: mockClassA,
            dueDate: new Date(Date.now() + 86400000), // Future due date
            submissions: [
              {
                student: student1Id,
                submittedAt: new Date(),
                submissionNotes: 'Project submitted.',
              },
            ],
          },
        ],
      });

      const origCount = Homework.countDocuments;
      Homework.countDocuments = async () => 1;

      const ctx = createMockContext({
        user: {
          role: 'student',
          id: new mongoose.Types.ObjectId().toString(),
          studentId: student1Id.toString(),
          isLinked: true,
        },
      });

      try {
        await getHomework(ctx.req, ctx.res, ctx.next);
        assert.strictEqual(ctx.getError(), null);
        const res = ctx.getResponse();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.data.length, 1);
        // Verified status should be 'Submitted'
        assert.strictEqual(res.body.data[0].status, 'Submitted');
        assert.strictEqual(res.body.data[0].isSubmitted, true);
      } finally {
        Student.findById = origStudentFindById;
        Homework.find = origHwFind;
        Homework.countDocuments = origCount;
      }
    });
  });
});

