import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { Teacher } from '../models/Teacher.js';
import { Class } from '../models/Class.js';
import { Timetable } from '../models/Timetable.js';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { errorHandler } from '../middleware/errorMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_ndrn_backend_tests_only';

function makeToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

describe('Privacy & API Security Test Suite', () => {
  const originalReadyState = mongoose.connection.readyState;

  // Simulate active database connection state so requireDatabase allows controller execution
  Object.defineProperty(mongoose.connection, 'readyState', {
    value: 1,
    configurable: true,
    writable: true,
  });

  const originalUserFindById = User.findById;
  User.findById = (id) => ({
    select: async () => {
      return {
        _id: id,
        status: 'active',
        role: id === userObjId.toString() ? 'teacher' : 'admin',
      };
    },
  });

  const originalTeacherFindOne = Teacher.findOne;
  Teacher.findOne = (query) => ({
    populate: () => ({
      populate: () => ({
        lean: async () => mockTeacherData,
      }),
      select: () => ({
        lean: async () => mockTeacherData,
      }),
      lean: async () => mockTeacherData,
    }),
    select: () => ({
      lean: async () => mockTeacherData,
    }),
    lean: async () => mockTeacherData,
  });

  const teacherObjId = new mongoose.Types.ObjectId();
  const userObjId = new mongoose.Types.ObjectId();
  const classObjId = new mongoose.Types.ObjectId();

  const mockTeacherData = {
    _id: teacherObjId,
    user: userObjId,
    employeeId: 'EMP-2026-009',
    fullName: 'Shri Vikramaditya Sharma',
    designation: 'Senior Science Faculty',
    wing: 'Primary',
    phone: '+91 98765 43210',
    email: 'vikramaditya.sharma@ndrn.edu.in',
    qualification: 'M.Sc. Physics, B.Ed.',
    experienceYears: 12,
    primarySubjects: ['Science', 'Mathematics'],
    bio: 'Dedicated educator inspiring students through experiential scientific experiments.',
    photoUrl: '/images/faculty/vikram.jpg',
    assignedClasses: [classObjId],
    status: 'active',
  };

  const adminToken = makeToken({
    id: new mongoose.Types.ObjectId().toString(),
    role: 'admin',
    email: 'principal@ndrnvidyalaya.edu.in',
  });

  const teacherToken = makeToken({
    id: userObjId.toString(),
    role: 'teacher',
    teacherId: teacherObjId.toString(),
    employeeId: 'EMP-2026-009',
    email: 'vikramaditya.sharma@ndrn.edu.in',
    isLinked: true,
  });

  const studentToken = makeToken({
    id: new mongoose.Types.ObjectId().toString(),
    role: 'student',
    studentId: new mongoose.Types.ObjectId().toString(),
    admissionNumber: 'NDRN-2026-042',
    isLinked: true,
  });

  describe('1. Public Faculty Endpoints Privacy (No Leaked Phone, Email, EmployeeId, or User)', () => {
    it('GET /api/teachers returns safe public profiles with phone, email, employeeId, and user redacted', async () => {
      // Mock Teacher.find to return our sample teacher
      const originalFind = Teacher.find;
      Teacher.find = () => ({
        populate: () => ({
          sort: () => ({
            lean: async () => [mockTeacherData],
          }),
        }),
      });

      try {
        const res = await request(app).get('/api/teachers');

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.ok(Array.isArray(res.body.data));
        assert.strictEqual(res.body.data.length, 1);

        const publicTeacher = res.body.data[0];

        // Legitimate public fields must be present
        assert.strictEqual(publicTeacher.fullName, 'Shri Vikramaditya Sharma');
        assert.strictEqual(publicTeacher.designation, 'Senior Science Faculty');
        assert.strictEqual(publicTeacher.wing, 'Primary');
        assert.strictEqual(publicTeacher.qualification, 'M.Sc. Physics, B.Ed.');
        assert.deepStrictEqual(publicTeacher.primarySubjects, ['Science', 'Mathematics']);

        // SENSITIVE PERSONAL & INTERNAL FIELDS MUST BE REDACTED
        assert.strictEqual(publicTeacher.phone, undefined, 'Teacher phone must be redacted from public view');
        assert.strictEqual(publicTeacher.email, undefined, 'Teacher email must be redacted from public view');
        assert.strictEqual(publicTeacher.employeeId, undefined, 'Teacher employeeId must be redacted from public view');
        assert.strictEqual(publicTeacher.user, undefined, 'User account reference must be redacted from public view');
        assert.strictEqual(publicTeacher.__v, undefined, 'Database internal version key must be omitted');
      } finally {
        Teacher.find = originalFind;
      }
    });

    it('GET /api/teachers/:id returns safe public profile when unauthenticated', async () => {
      const res = await request(app).get(`/api/teachers/${teacherObjId.toString()}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);

      const publicTeacher = res.body.data;
      assert.strictEqual(publicTeacher.fullName, 'Shri Vikramaditya Sharma');
      assert.strictEqual(publicTeacher.phone, undefined, 'Public single teacher query must not expose phone');
      assert.strictEqual(publicTeacher.email, undefined, 'Public single teacher query must not expose email');
      assert.strictEqual(publicTeacher.employeeId, undefined, 'Public single teacher query must not expose employeeId');
      assert.strictEqual(publicTeacher.user, undefined, 'Public single teacher query must not expose user reference');
    });

    it('GET /api/teachers/:id rejects invalid identifier format with 400 Bad Request', async () => {
      const res = await request(app).get('/api/teachers/not-a-valid-id-1234');
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Invalid teacher identifier'));
    });
  });

  describe('2. Role-Authorized Teacher Endpoints (Admin & Teacher Self)', () => {
    it('GET /api/teachers with Administrator token returns full administrative details for management', async () => {
      const originalFind = Teacher.find;
      const originalPopulate = Teacher.populate;

      Teacher.find = () => ({
        populate: () => ({
          sort: () => ({
            lean: async () => [mockTeacherData],
          }),
        }),
      });

      Teacher.populate = async (docs) => docs;

      try {
        const res = await request(app)
          .get('/api/teachers')
          .set('Authorization', `Bearer ${adminToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);

        const adminTeacherView = res.body.data[0];
        // Administrator must retain management access to employeeId, phone, email
        assert.strictEqual(adminTeacherView.employeeId, 'EMP-2026-009');
        assert.strictEqual(adminTeacherView.phone, '+91 98765 43210');
        assert.strictEqual(adminTeacherView.email, 'vikramaditya.sharma@ndrn.edu.in');
      } finally {
        Teacher.find = originalFind;
        Teacher.populate = originalPopulate;
      }
    });

    it('GET /api/teachers/me allows authenticated teacher to view their own profile', async () => {
      const res = await request(app)
        .get('/api/teachers/me')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.employeeId, 'EMP-2026-009');
      assert.strictEqual(res.body.data.phone, '+91 98765 43210');
    });
  });

  describe('3. Public Class Cohort & Timetable Endpoints Privacy', () => {
    it('GET /api/classes redacts classTeacher phone, email, and employeeId from public responses', async () => {
      const mockClass = {
        _id: classObjId,
        name: 'Class 5',
        section: 'A',
        academicYear: '2026-2027',
        classTeacher: {
          _id: teacherObjId,
          fullName: 'Shri Vikramaditya Sharma',
          employeeId: 'EMP-2026-009',
          wing: 'Primary',
          email: 'vikramaditya.sharma@ndrn.edu.in',
          phone: '+91 98765 43210',
        },
      };

      const originalFind = Class.find;
      Class.find = () => ({
        populate: () => ({
          sort: () => ({
            lean: async () => [mockClass],
          }),
        }),
      });

      try {
        const res = await request(app).get('/api/classes');
        assert.strictEqual(res.status, 200);

        const cls = res.body.data[0];
        assert.strictEqual(cls.name, 'Class 5');
        assert.strictEqual(cls.classTeacher.fullName, 'Shri Vikramaditya Sharma');
        assert.strictEqual(cls.classTeacher.email, undefined, 'Class teacher email must not be exposed');
        assert.strictEqual(cls.classTeacher.phone, undefined, 'Class teacher phone must not be exposed');
        assert.strictEqual(cls.classTeacher.employeeId, undefined, 'Class teacher employeeId must not be exposed');
      } finally {
        Class.find = originalFind;
      }
    });

    it('GET /api/classes/:id rejects non-ObjectId parameter with 400 Bad Request', async () => {
      const res = await request(app).get('/api/classes/invalid-class-id-xyz');
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Invalid class identifier'));
    });

    it('GET /api/timetable/class/:classId redacts teacher email and employeeId in period rosters', async () => {
      const mockTimetableDoc = {
        _id: new mongoose.Types.ObjectId(),
        class: classObjId,
        dayOfWeek: 'Monday',
        periods: [
          {
            periodNumber: 1,
            subject: 'Science',
            startTime: '08:30',
            endTime: '09:15',
            teacher: {
              _id: teacherObjId,
              fullName: 'Shri Vikramaditya Sharma',
              designation: 'Senior Faculty',
              email: 'vikramaditya.sharma@ndrn.edu.in',
              employeeId: 'EMP-2026-009',
              phone: '+91 98765 43210',
            },
          },
        ],
      };

      const originalClassFindById = Class.findById;
      const originalTimetableFind = Timetable.find;

      Class.findById = async () => ({ _id: classObjId, name: 'Class 5' });
      Timetable.find = () => ({
        populate: () => ({
          populate: () => ({
            sort: () => ({
              lean: async () => [mockTimetableDoc],
            }),
          }),
        }),
      });

      try {
        const res = await request(app)
          .get(`/api/timetable/class/${classObjId.toString()}?day=Monday`)
          .set('Authorization', `Bearer ${adminToken}`);

        assert.strictEqual(res.status, 200);
        const daySchedule = res.body.data[0];
        const period1 = daySchedule.periods[0];

        assert.strictEqual(period1.subject, 'Science');
        assert.strictEqual(period1.teacher.fullName, 'Shri Vikramaditya Sharma');
        assert.strictEqual(period1.teacher.email, undefined, 'Timetable period teacher email must be redacted');
        assert.strictEqual(period1.teacher.employeeId, undefined, 'Timetable period teacher employeeId must be redacted');
        assert.strictEqual(period1.teacher.phone, undefined, 'Timetable period teacher phone must be redacted');
      } finally {
        Class.findById = originalClassFindById;
        Timetable.find = originalTimetableFind;
      }
    });
  });

  describe('4. Student & Parent Directory Access Restrictions', () => {
    it('GET /api/students rejects unauthenticated public access with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/students');
      assert.strictEqual(res.status, 401);
    });

    it('GET /api/parents rejects unauthenticated public access with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/parents');
      assert.strictEqual(res.status, 401);
    });

    it('GET /api/parents rejects student or teacher access with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/parents')
        .set('Authorization', `Bearer ${teacherToken}`);
      assert.strictEqual(res.status, 403);
    });

    it('GET /api/admissions rejects unauthenticated public access with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/admissions');
      assert.strictEqual(res.status, 401);
    });
  });

  describe('5. Production Error Handler Privacy & Information Leakage Prevention', () => {
    it('errorHandler suppresses stack trace in production environment', () => {
      const mockReq = { method: 'GET', originalUrl: '/api/test' };
      let capturedStatusCode = 0;
      let capturedPayload = null;

      const mockRes = {
        status: (code) => {
          capturedStatusCode = code;
          return {
            json: (payload) => {
              capturedPayload = payload;
              return payload;
            },
          };
        },
      };

      const error = new Error('Database connection failed: mongodb://admin:SecretPass123@10.0.0.5:27017/ndrn_prod');
      error.statusCode = 500;

      // Temporarily set production
      const originalEnv = config.env;
      const originalNodeEnv = process.env.NODE_ENV;
      config.env = 'production';
      process.env.NODE_ENV = 'production';

      try {
        errorHandler(error, mockReq, mockRes, () => {});

        assert.strictEqual(capturedStatusCode, 500);
        assert.strictEqual(capturedPayload.success, false);
        assert.strictEqual(
          capturedPayload.message,
          'An unexpected internal server error occurred. Please contact system administration.'
        );
        assert.strictEqual(capturedPayload.stack, undefined, 'Stack trace must NEVER be included in production');
        assert.ok(!JSON.stringify(capturedPayload).includes('SecretPass123'), 'Passwords must never leak in error response');
        assert.ok(!JSON.stringify(capturedPayload).includes('mongodb://'), 'Database URI must never leak in error response');
      } finally {
        config.env = originalEnv;
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });
});
