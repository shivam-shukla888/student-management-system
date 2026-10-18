const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Set test environment and test database path before loading app
const TEST_DB_PATH = path.resolve(__dirname, 'test_students.db');
process.env.NODE_ENV = 'test';
process.env.DB_PATH = TEST_DB_PATH;

const { getDatabase, closeDatabase } = require('../src/db/database');
const { seedDatabase } = require('../src/db/seed');
const app = require('../src/app');

describe('Student Management System API & Security Test Suite', () => {
  let db;

  before(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      try { fs.unlinkSync(TEST_DB_PATH); } catch (e) {}
    }
    db = getDatabase(TEST_DB_PATH);
    seedDatabase(db);
  });

  after(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      try { fs.unlinkSync(TEST_DB_PATH); } catch (e) {}
    }
    const walFile = `${TEST_DB_PATH}-wal`;
    const shmFile = `${TEST_DB_PATH}-shm`;
    if (fs.existsSync(walFile)) { try { fs.unlinkSync(walFile); } catch (e) {} }
    if (fs.existsSync(shmFile)) { try { fs.unlinkSync(shmFile); } catch (e) {} }
  });

  // 1. Health Check
  test('GET /api/health returns 200 OK and health status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.database, 'healthy');
  });

  // 2. Security Headers (Helmet)
  test('Security headers (Helmet) are set on HTTP responses', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');
  });

  // 3. HTTP Method Restriction
  test('Unsupported HTTP methods are rejected with 405 Method Not Allowed', async () => {
    const res = await request(app).trace('/api/health');
    assert.equal(res.status, 405);
    assert.equal(res.body.success, false);
  });

  // 4. Content-Type Enforcement
  test('POST with non-JSON Content-Type returns 415 Unsupported Media Type', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Content-Type', 'text/plain')
      .send('plain text payload');
    assert.equal(res.status, 415);
    assert.equal(res.body.success, false);
  });

  // 5. Dashboard Stats
  test('GET /api/dashboard/stats returns accurate metrics', async () => {
    const res = await request(app).get('/api/dashboard/stats');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(typeof res.body.data.totalStudents === 'number');
    assert.ok(typeof res.body.data.activeStudents === 'number');
    assert.ok(typeof res.body.data.inactiveStudents === 'number');
    assert.equal(res.body.data.totalStudents, res.body.data.activeStudents + res.body.data.inactiveStudents);
    assert.ok(Array.isArray(res.body.data.courseDistribution));
    assert.ok(Array.isArray(res.body.data.recentStudents));
  });

  // 6. List Students & Pagination
  test('GET /api/students returns paginated student list', async () => {
    const res = await request(app).get('/api/students?page=1&limit=5');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 5);
    assert.equal(res.body.pagination.page, 1);
    assert.equal(res.body.pagination.limit, 5);
    assert.ok(res.body.pagination.total >= 12);
  });

  // 7. Search and Filter
  test('GET /api/students filters by search query', async () => {
    const res = await request(app).get('/api/students?search=Aarav');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0);
    assert.ok(res.body.data[0].full_name.includes('Aarav'));
  });

  test('GET /api/students filters by course', async () => {
    const res = await request(app).get('/api/students?course=Computer Science');
    assert.equal(res.status, 200);
    res.body.data.forEach(student => {
      assert.equal(student.course, 'Computer Science');
    });
  });

  // 8. Create Student Validation & Security Checks
  test('POST /api/students rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/students')
      .send({ full_name: 'Incomplete User' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(Array.isArray(res.body.details));
  });

  test('POST /api/students rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/students')
      .send({
        full_name: 'Bad Email Student',
        email: 'invalid-email-format',
        phone: '+1 (555) 123-4567',
        course: 'Physics',
        enrollment_date: '2026-01-10',
        status: 'Active'
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    const emailError = res.body.details.find(d => d.field === 'email');
    assert.ok(emailError);
  });

  test('POST /api/students rejects XSS script tags in inputs', async () => {
    const res = await request(app)
      .post('/api/students')
      .send({
        full_name: '<script>alert("xss")</script>',
        email: 'attacker@example.edu',
        phone: '+1 (555) 000-0000',
        course: 'Computer Science',
        enrollment_date: '2026-01-10',
        status: 'Active'
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    const nameError = res.body.details.find(d => d.field === 'full_name');
    assert.ok(nameError);
  });

  test('POST /api/students rejects invalid calendar date (e.g. Feb 30th)', async () => {
    const res = await request(app)
      .post('/api/students')
      .send({
        full_name: 'Calendar Test',
        email: 'calendar.test@example.edu',
        phone: '+1 (555) 000-0000',
        course: 'Computer Science',
        enrollment_date: '2026-02-30', // Feb 30th does not exist
        status: 'Active'
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    const dateError = res.body.details.find(d => d.field === 'enrollment_date');
    assert.ok(dateError);
  });

  // 9. Create Student Success & Duplicate Prevention
  let newStudentId = null;
  const testStudentPayload = {
    full_name: 'Jessica Taylor',
    email: 'jessica.taylor@example.edu',
    phone: '+1 (555) 765-4321',
    course: 'Cybersecurity',
    enrollment_date: '2026-02-15',
    status: 'Active'
  };

  test('POST /api/students successfully creates a new student with formatted ID', async () => {
    const res = await request(app)
      .post('/api/students')
      .send(testStudentPayload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.id.startsWith('STU-'));
    assert.equal(res.body.data.full_name, 'Jessica Taylor');
    assert.equal(res.body.data.email, 'jessica.taylor@example.edu');
    newStudentId = res.body.data.id;
  });

  test('POST /api/students rejects duplicate email address with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/students')
      .send(testStudentPayload);

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.toLowerCase().includes('already exists'));
  });

  // 10. Get by ID & Invalid ID Validation
  test('GET /api/students/:id returns 400 for malicious or invalid ID format', async () => {
    const res = await request(app).get('/api/students/<script>');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('GET /api/students/:id returns student details', async () => {
    const res = await request(app).get(`/api/students/${newStudentId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, newStudentId);
    assert.equal(res.body.data.full_name, 'Jessica Taylor');
  });

  test('GET /api/students/:id returns 404 for non-existent ID', async () => {
    const res = await request(app).get('/api/students/STU-9999-9999');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  // 11. Update Student
  test('PUT /api/students/:id successfully updates student details', async () => {
    const res = await request(app)
      .put(`/api/students/${newStudentId}`)
      .send({
        full_name: 'Jessica Taylor-Smith',
        email: 'jessica.tsmith@example.edu',
        phone: '+1 (555) 765-9999',
        course: 'Cybersecurity & Forensics',
        enrollment_date: '2026-02-15',
        status: 'Active'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.full_name, 'Jessica Taylor-Smith');
    assert.equal(res.body.data.email, 'jessica.tsmith@example.edu');
    assert.equal(res.body.data.course, 'Cybersecurity & Forensics');
  });

  test('PUT /api/students/:id prevents updating to another student email (409 Conflict)', async () => {
    const res = await request(app)
      .put(`/api/students/${newStudentId}`)
      .send({
        full_name: 'Jessica Taylor-Smith',
        email: 'aarav.sharma@example.edu', // Already belongs to Aarav
        phone: '+1 (555) 765-9999',
        course: 'Cybersecurity',
        enrollment_date: '2026-02-15',
        status: 'Active'
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  // 12. Delete Student
  test('DELETE /api/students/:id successfully deletes a student', async () => {
    const res = await request(app).delete(`/api/students/${newStudentId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, newStudentId);

    // Verify deletion
    const verifyRes = await request(app).get(`/api/students/${newStudentId}`);
    assert.equal(verifyRes.status, 404);
  });

  test('DELETE /api/students/:id returns 404 when deleting non-existent ID', async () => {
    const res = await request(app).delete(`/api/students/${newStudentId}`);
    assert.equal(res.status, 404);
  });

  // 13. Centralized 404 for unknown routes
  test('GET /api/unknown-endpoint returns 404 with structured JSON', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});
