import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js';

describe('N.D.R.N. Vidyalaya Backend API Test Suite', () => {
  it('GET /api/health returns health status and database connection info', async () => {
    const res = await request(app).get('/api/health');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.server);
    assert.strictEqual(res.body.data.server.school, 'N.D.R.N. Vidyalaya');
    assert.ok(res.body.data.database);
    assert.ok('status' in res.body.data.database);
    assert.ok('isConnected' in res.body.data.database);
  });

  it('GET / returns root server info and links to /api/health', async () => {
    const res = await request(app).get('/');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.healthCheck, '/api/health');
    assert.strictEqual(res.body.school.name, 'N.D.R.N. Vidyalaya');
  });

  it('GET /non-existent-route returns structured 404 error', async () => {
    const res = await request(app).get('/api/unknown-endpoint-xyz');

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Route not found'));
  });

  it('POST /api/admissions/enquire validates input and rejects missing fields with 400', async () => {
    const res = await request(app)
      .post('/api/admissions/enquire')
      .send({
        // Empty payload
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));

    const fields = res.body.errors.map((e) => e.field);
    assert.ok(fields.includes('studentName'), 'Should require studentName');
    assert.ok(fields.includes('parentName'), 'Should require parentName');
    assert.ok(fields.includes('phone'), 'Should require phone');
    assert.ok(fields.includes('gradeApplying'), 'Should require gradeApplying');
  });

  it('POST /api/admissions/enquire rejects invalid grade applying', async () => {
    const res = await request(app)
      .post('/api/admissions/enquire')
      .send({
        studentName: 'Aarav Kumar',
        parentName: 'Ramesh Kumar',
        phone: '9876543210',
        gradeApplying: 'Class 12 (Invalid for Primary)',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    const gradeError = res.body.errors.find((e) => e.field === 'gradeApplying');
    assert.ok(gradeError, 'Should have error for gradeApplying');
  });

  it('POST /api/contact validates input and rejects short message with 400', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'A',
        phone: '123',
        message: 'Hi',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));

    const fields = res.body.errors.map((e) => e.field);
    assert.ok(fields.includes('name'));
    assert.ok(fields.includes('phone'));
    assert.ok(fields.includes('message'));
  });

  it('POST /api/auth/login rejects missing credentials with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));
  });

  it('GET /api/students rejects unauthorized access with 401', async () => {
    const res = await request(app).get('/api/students');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Authentication required'));
  });

  it('Sets security headers using Helmet', async () => {
    const res = await request(app).get('/api/health');

    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(res.headers['x-frame-options'], 'SAMEORIGIN');
  });

  it('GET /api/notices returns 503 Service Unavailable when MongoDB is offline', async () => {
    const res = await request(app).get('/api/notices');

    assert.strictEqual(res.status, 503);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Database connection is currently unavailable'));
  });

  it('POST /api/auth/register validates and rejects invalid registration payload with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: 'invalid-email',
        password: '123',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors));
  });

  it('POST /api/auth/logout rejects unauthenticated requests with 401', async () => {
    const res = await request(app).post('/api/auth/logout');

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Authentication required'));
  });

  it('POST /api/contact validates successfully without optional email (proceeds to DB layer 503)', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Ramesh Kumar',
        phone: '9876543210',
        message: 'Inquiring about primary standard admission criteria and transport.',
      });

    assert.strictEqual(res.status, 503, 'Should pass validator and reach DB layer');
  });

  it('POST /api/admissions/enquire validates successfully without optional email', async () => {
    const res = await request(app)
      .post('/api/admissions/enquire')
      .send({
        studentName: 'Aarav Kumar',
        parentName: 'Ramesh Kumar',
        phone: '9876543210',
        gradeApplying: 'Class 1',
        message: 'Looking forward to admission in Class 1.',
      });

    assert.strictEqual(res.status, 503, 'Should pass validator and reach DB layer');
  });

  it('CORS preflight allows x-admin-setup-key header', async () => {
    const res = await request(app)
      .options('/api/auth/register')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'x-admin-setup-key, Content-Type');

    assert.strictEqual(res.status, 204);
    const allowedHeaders = res.headers['access-control-allow-headers'];
    assert.ok(allowedHeaders.toLowerCase().includes('x-admin-setup-key'));
  });

  it('GET /api/events is a public route that reaches DB check (503 when offline)', async () => {
    const res = await request(app).get('/api/events');
    assert.strictEqual(res.status, 503);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/events rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ title: 'Test Sports Meet', startDate: new Date() });
    assert.strictEqual(res.status, 401);
  });

  it('PUT /api/events/:id rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .put('/api/events/507f1f77bcf86cd799439011')
      .send({ title: 'Updated Title' });
    assert.strictEqual(res.status, 401);
  });

  it('DELETE /api/events/:id rejects unauthenticated requests with 401', async () => {
    const res = await request(app).delete('/api/events/507f1f77bcf86cd799439011');
    assert.strictEqual(res.status, 401);
  });
});
