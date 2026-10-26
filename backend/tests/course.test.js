import { describe, it } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../app.js';
import { Course } from '../models/Course.js';
import { CourseService } from '../services/courseService.js';

describe('Course Model & API Endpoints Test Suite', () => {
  it('Validates Course Mongoose Schema and required fields', () => {
    const invalidCourse = new Course({ classGrade: '' });
    const err = invalidCourse.validateSync();
    assert.ok(err, 'Validation should fail on empty required fields');
    assert.ok(err.errors.classGrade, 'classGrade is required');
  });

  it('Creates Course instance with valid schema defaults', () => {
    const course = new Course({
      classGrade: 'Class 1',
      academicSession: '2026-27',
      timing: '8:00 AM – 2:00 PM',
      medium: 'Bilingual (UP Board)',
      weeklyLoad: '32 Periods / Week',
      subjectList: [
        { name: 'Mathematics', desc: 'Numbers, Addition, Subtraction' },
        { name: 'Hindi', desc: 'Reading & Grammar' },
      ],
      outcomes: ['Fluent reading', 'Single digit math'],
    });

    const err = course.validateSync();
    assert.strictEqual(err, undefined, 'Course should pass schema validation');
    assert.strictEqual(course.classGrade, 'Class 1');
    assert.strictEqual(course.subjectList.length, 2);
    assert.strictEqual(course.outcomes.length, 2);
    assert.strictEqual(course.isPublished, true);
  });

  it('GET /api/courses is a public route that handles request without requiring bearer token', async () => {
    const res = await supertest(app).get('/api/courses');
    assert.ok([200, 503].includes(res.status), `Unexpected status: ${res.status}`);
  });

  it('GET /api/courses/admin rejects unauthenticated requests with 401', async () => {
    const res = await supertest(app).get('/api/courses/admin');
    assert.strictEqual(res.status, 401);
  });

  it('POST /api/courses rejects unauthenticated requests with 401', async () => {
    const res = await supertest(app)
      .post('/api/courses')
      .send({
        classGrade: 'Class 2',
        academicSession: '2026-27',
      });
    assert.strictEqual(res.status, 401);
  });

  it('PUT /api/courses/:id rejects unauthenticated requests with 401', async () => {
    const res = await supertest(app)
      .put('/api/courses/507f1f77bcf86cd799439011')
      .send({ timing: '8:30 AM – 1:30 PM' });
    assert.strictEqual(res.status, 401);
  });

  it('DELETE /api/courses/:id rejects unauthenticated requests with 401', async () => {
    const res = await supertest(app).delete('/api/courses/507f1f77bcf86cd799439011');
    assert.strictEqual(res.status, 401);
  });

  it('PATCH /api/courses/:id/publish rejects unauthenticated requests with 401', async () => {
    const res = await supertest(app)
      .patch('/api/courses/507f1f77bcf86cd799439011/publish')
      .send({ isPublished: false });
    assert.strictEqual(res.status, 401);
  });

  it('Normalizes academic sessions across standard hyphen, en-dash, em-dash, and 4-digit formats', () => {
    assert.strictEqual(CourseService.normalizeSession('2026-27'), '2026-27');
    assert.strictEqual(CourseService.normalizeSession('2026–27'), '2026-27'); // en-dash
    assert.strictEqual(CourseService.normalizeSession('2026—27'), '2026-27'); // em-dash
    assert.strictEqual(CourseService.normalizeSession('2026 - 27'), '2026-27'); // spaces
    assert.strictEqual(CourseService.normalizeSession('2026-2027'), '2026-27'); // 4-digit span
    assert.strictEqual(CourseService.normalizeSession('all'), 'all');
  });

  it('GET /api/courses handles en-dash academic session parameter gracefully', async () => {
    const res = await supertest(app).get('/api/courses?session=2026–27');
    assert.ok([200, 503].includes(res.status));
  });
});
