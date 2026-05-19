require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');

const timestamp = Date.now();
const testEmail = `testuser_${timestamp}@gmail.com`;

describe('Auth API', () => {

  // Test 1: Successful registration returns 201 with correct fields
  test('POST /api/auth/register — returns 201 with user object (no password)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: testEmail,
        phone: '0712345678',
        password: 'Password1',
        role: 'freelancer',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.role).toBe('freelancer');
    // Password must never appear in the response for security reasons
    expect(res.body.data.user.password).toBeUndefined();
  });

  // Test 2: Login with wrong password returns 401
  test('POST /api/auth/login — wrong password returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword9',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  // Test 3: Freelancer cannot POST a job (returns 403)
  test('POST /api/jobs — freelancer is forbidden (403)', async () => {
    // First login as the freelancer registered above
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'Password1' });

    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Unauthorized Job Post',
        description: 'This should not be allowed.',
        category: 'Web Development',
        location: 'Nairobi',
        budget: 10000,
        skills: ['Node.js'],
        deadline: '2026-12-01',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

});
