import { describe, it } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { AttendanceService } from '../services/attendanceService.js';
import {
  markAttendance,
  getClassAttendance,
  getClassAttendanceHistory,
} from '../controllers/attendanceController.js';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';

describe('Teacher Attendance Architecture & Verification Suite', () => {
  const classAId = new mongoose.Types.ObjectId();
  const classBId = new mongoose.Types.ObjectId();
  const student1Id = new mongoose.Types.ObjectId();
  const student2Id = new mongoose.Types.ObjectId();
  const student3Id = new mongoose.Types.ObjectId();
  const foreignStudentId = new mongoose.Types.ObjectId();

  const mockClassA = {
    _id: classAId,
    name: 'Class 5',
    section: 'A',
    academicYear: '2026-2027',
  };

  const mockStudents = [
    {
      _id: student1Id,
      fullName: 'Aarav Sharma',
      admissionNumber: 'NDRN-2026-0001',
      rollNumber: '1',
      class: classAId,
    },
    {
      _id: student2Id,
      fullName: 'Ananya Verma',
      admissionNumber: 'NDRN-2026-0002',
      rollNumber: '2',
      class: classAId,
    },
    {
      _id: student3Id,
      fullName: 'Vivaan Patel',
      admissionNumber: 'NDRN-2026-0003',
      rollNumber: '3',
      class: classAId,
    },
    {
      _id: foreignStudentId,
      fullName: 'Kabir Singh',
      admissionNumber: 'NDRN-2026-0099',
      rollNumber: '10',
      class: classBId, // Enrolled in Class B!
    },
  ];

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
  // 1. AttendanceService Core Logic & Validations
  // =========================================================================
  describe('AttendanceService.recordClassAttendance', () => {
    it('Persists verified attendance records and calculates exact metrics', async () => {
      // Mock Class.findById
      const origFindById = Class.findById;
      Class.findById = async (id) => (id.toString() === classAId.toString() ? mockClassA : null);

      // Mock Student.find
      const origStudentFind = Student.find;
      Student.find = () => ({
        select: async () => mockStudents.filter((s) => [student1Id, student2Id, student3Id].map(id => id.toString()).includes(s._id.toString())),
      });

      // Mock Attendance.bulkWrite
      const origBulkWrite = Attendance.bulkWrite;
      let executedBulkOps = [];
      Attendance.bulkWrite = async (ops) => {
        executedBulkOps = ops;
        return { upsertedCount: 3, modifiedCount: 0 };
      };

      try {
        const records = [
          { studentId: student1Id.toString(), status: 'present' },
          { studentId: student2Id.toString(), status: 'absent' },
          { studentId: student3Id.toString(), status: 'late' },
        ];

        const result = await AttendanceService.recordClassAttendance(
          classAId.toString(),
          '2026-11-05',
          records,
          new mongoose.Types.ObjectId().toString()
        );

        assert.strictEqual(result.total, 3);
        assert.strictEqual(result.present, 1);
        assert.strictEqual(result.absent, 1);
        assert.strictEqual(result.late, 1);
        assert.strictEqual(result.attendancePercentage, 33.3);
        assert.strictEqual(executedBulkOps.length, 3);

        // Verify compound filter uses student and date
        const op1 = executedBulkOps[0].updateOne;
        assert.strictEqual(op1.filter.student.toString(), student1Id.toString());
        assert.strictEqual(op1.update.$set.status, 'present');
        assert.strictEqual(op1.upsert, true);
      } finally {
        Class.findById = origFindById;
        Student.find = origStudentFind;
        Attendance.bulkWrite = origBulkWrite;
      }
    });

    it('Deduplicates duplicate student IDs in the payload to prevent duplicate records', async () => {
      const origFindById = Class.findById;
      Class.findById = async () => mockClassA;

      const origStudentFind = Student.find;
      Student.find = () => ({
        select: async () => [mockStudents[0]],
      });

      let capturedOps = [];
      const origBulkWrite = Attendance.bulkWrite;
      Attendance.bulkWrite = async (ops) => {
        capturedOps = ops;
        return { upsertedCount: 1, modifiedCount: 0 };
      };

      try {
        // Payload contains same studentId twice with different status
        const records = [
          { studentId: student1Id.toString(), status: 'present' },
          { studentId: student1Id.toString(), status: 'late' }, // duplicate entry
        ];

        const result = await AttendanceService.recordClassAttendance(
          classAId.toString(),
          '2026-11-05',
          records,
          null
        );

        // Should have deduplicated to exactly 1 record
        assert.strictEqual(result.total, 1);
        assert.strictEqual(result.processedCount, 1);
        assert.strictEqual(capturedOps.length, 1);
      } finally {
        Class.findById = origFindById;
        Student.find = origStudentFind;
        Attendance.bulkWrite = origBulkWrite;
      }
    });

    it('Rejects marking attendance if a student does not belong to the selected class (400 Bad Request)', async () => {
      const origFindById = Class.findById;
      Class.findById = async () => mockClassA;

      const origStudentFind = Student.find;
      Student.find = () => ({
        select: async () => [
          mockStudents[0], // student1 in Class A
          mockStudents[3], // foreignStudent in Class B!
        ],
      });

      try {
        const records = [
          { studentId: student1Id.toString(), status: 'present' },
          { studentId: foreignStudentId.toString(), status: 'present' },
        ];

        await assert.rejects(
          async () => {
            await AttendanceService.recordClassAttendance(classAId.toString(), '2026-11-05', records, null);
          },
          (err) => {
            assert.strictEqual(err.statusCode, 400);
            assert.ok(err.message.includes('does not belong to class'));
            return true;
          }
        );
      } finally {
        Class.findById = origFindById;
        Student.find = origStudentFind;
      }
    });

    it('Rejects marking attendance when class does not exist (404 Not Found)', async () => {
      const origFindById = Class.findById;
      Class.findById = async () => null;

      try {
        await assert.rejects(
          async () => {
            await AttendanceService.recordClassAttendance(
              new mongoose.Types.ObjectId().toString(),
              '2026-11-05',
              [{ studentId: student1Id.toString(), status: 'present' }],
              null
            );
          },
          (err) => {
            assert.strictEqual(err.statusCode, 404);
            assert.ok(err.message.includes('Class cohort not found'));
            return true;
          }
        );
      } finally {
        Class.findById = origFindById;
      }
    });

    it('Rejects marking attendance when a student is not found in database (404 Not Found)', async () => {
      const origFindById = Class.findById;
      Class.findById = async () => mockClassA;

      const origStudentFind = Student.find;
      Student.find = () => ({
        select: async () => [], // Empty (no students found)
      });

      try {
        await assert.rejects(
          async () => {
            await AttendanceService.recordClassAttendance(
              classAId.toString(),
              '2026-11-05',
              [{ studentId: student1Id.toString(), status: 'present' }],
              null
            );
          },
          (err) => {
            assert.strictEqual(err.statusCode, 404);
            assert.ok(err.message.includes('not found in database'));
            return true;
          }
        );
      } finally {
        Class.findById = origFindById;
        Student.find = origStudentFind;
      }
    });

    it('Rejects invalid status string with 400 Bad Request', async () => {
      const origFindById = Class.findById;
      Class.findById = async () => mockClassA;

      const origStudentFind = Student.find;
      Student.find = () => ({
        select: async () => [mockStudents[0]],
      });

      try {
        await assert.rejects(
          async () => {
            await AttendanceService.recordClassAttendance(
              classAId.toString(),
              '2026-11-05',
              [{ studentId: student1Id.toString(), status: 'unknown_status' }],
              null
            );
          },
          (err) => {
            assert.strictEqual(err.statusCode, 400);
            assert.ok(err.message.includes('Invalid attendance status'));
            return true;
          }
        );
      } finally {
        Class.findById = origFindById;
        Student.find = origStudentFind;
      }
    });

    it('Rejects empty records array with 400 Bad Request', async () => {
      const origFindById = Class.findById;
      Class.findById = async () => mockClassA;

      try {
        await assert.rejects(
          async () => {
            await AttendanceService.recordClassAttendance(classAId.toString(), '2026-11-05', [], null);
          },
          (err) => {
            assert.strictEqual(err.statusCode, 400);
            assert.ok(err.message.includes('array must not be empty'));
            return true;
          }
        );
      } finally {
        Class.findById = origFindById;
      }
    });
  });

  // =========================================================================
  // 2. Attendance History Aggregation
  // =========================================================================
  describe('AttendanceService.getClassAttendanceHistory', () => {
    it('Executes aggregation pipeline and returns daily historical registers', async () => {
      const origAggregate = Attendance.aggregate;
      Attendance.aggregate = async () => [
        {
          id: '2026-11-05',
          date: '2026-11-05',
          total: 25,
          present: 23,
          absent: 2,
          late: 0,
          halfDay: 0,
          attendancePercentage: 92,
          markedBy: 'Faculty Incharge',
        },
        {
          id: '2026-11-04',
          date: '2026-11-04',
          total: 25,
          present: 24,
          absent: 1,
          late: 0,
          halfDay: 0,
          attendancePercentage: 96,
          markedBy: 'Faculty Incharge',
        },
      ];

      try {
        const history = await AttendanceService.getClassAttendanceHistory(classAId.toString(), 10);
        assert.strictEqual(history.length, 2);
        assert.strictEqual(history[0].date, '2026-11-05');
        assert.strictEqual(history[0].present, 23);
        assert.strictEqual(history[0].attendancePercentage, 92);
      } finally {
        Attendance.aggregate = origAggregate;
      }
    });

    it('Rejects invalid class ID format with 400 Bad Request', async () => {
      await assert.rejects(
        async () => {
          await AttendanceService.getClassAttendanceHistory('invalid-id', 10);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          return true;
        }
      );
    });
  });

  // =========================================================================
  // 3. Controller Role & Assignment Scoping
  // =========================================================================
  describe('Attendance Controllers Permissions & Scoping', () => {
    it('markAttendance: Allows teacher assigned to class to record attendance', async () => {
      const teacherUser = {
        id: new mongoose.Types.ObjectId().toString(),
        role: 'teacher',
        wing: 'Primary',
        assignedClasses: [classAId.toString()],
      };

      const ctx = createMockContext({
        user: teacherUser,
        body: {
          classId: classAId.toString(),
          date: '2026-11-05',
          records: [{ studentId: student1Id.toString(), status: 'present' }],
        },
      });

      const origRecord = AttendanceService.recordClassAttendance;
      AttendanceService.recordClassAttendance = async () => ({
        classId: classAId,
        total: 1,
        present: 1,
      });

      try {
        await markAttendance(ctx.req, ctx.res, ctx.next);
        assert.strictEqual(ctx.getError(), null);
        assert.strictEqual(ctx.getResponse().status, 200);
      } finally {
        AttendanceService.recordClassAttendance = origRecord;
      }
    });

    it('markAttendance: Blocks teacher from marking attendance for an unassigned class (403 Forbidden)', async () => {
      const teacherUser = {
        id: new mongoose.Types.ObjectId().toString(),
        role: 'teacher',
        wing: 'Primary',
        assignedClasses: [classAId.toString()],
      };

      const ctx = createMockContext({
        user: teacherUser,
        body: {
          classId: classBId.toString(), // Class B is NOT assigned!
          date: '2026-11-05',
          records: [{ studentId: student1Id.toString(), status: 'present' }],
        },
      });

      await markAttendance(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
      assert.ok(err.message.includes('assigned classes'));
    });

    it('getClassAttendanceHistory: Blocks teacher from accessing history for unassigned class (403 Forbidden)', async () => {
      const teacherUser = {
        id: new mongoose.Types.ObjectId().toString(),
        role: 'teacher',
        wing: 'Primary',
        assignedClasses: [classAId.toString()],
      };

      const ctx = createMockContext({
        user: teacherUser,
        params: { classId: classBId.toString() },
      });

      await getClassAttendanceHistory(ctx.req, ctx.res, ctx.next);
      const err = ctx.getError();
      assert.ok(err);
      assert.strictEqual(err.statusCode, 403);
      assert.ok(err.message.includes('assigned classes'));
    });

    it('getClassAttendanceHistory: Allows admin to view history for any class cohort', async () => {
      const adminUser = {
        id: new mongoose.Types.ObjectId().toString(),
        role: 'admin',
      };

      const ctx = createMockContext({
        user: adminUser,
        params: { classId: classBId.toString() },
      });

      const origHistory = AttendanceService.getClassAttendanceHistory;
      AttendanceService.getClassAttendanceHistory = async () => [{ date: '2026-11-05', total: 20 }];

      try {
        await getClassAttendanceHistory(ctx.req, ctx.res, ctx.next);
        assert.strictEqual(ctx.getError(), null);
        assert.strictEqual(ctx.getResponse().status, 200);
      } finally {
        AttendanceService.getClassAttendanceHistory = origHistory;
      }
    });
  });
});

