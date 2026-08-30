import request from 'supertest';
import { app } from './testApp';

describe('Authentication API', () => {
  // -----------------------------------------------
  // Health Check
  // -----------------------------------------------
  test('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });

  // -----------------------------------------------
  // Registration
  // -----------------------------------------------
  describe('POST /api/auth/register', () => {
    test('should reject registration without required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject short passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123',
          role: 'student',
          studentId: 'BC/TST/24/001',
          programme: 'B.Tech Graphic Design Technology',
          level: 'Level 300',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('6 characters');
    });

    test('should block admin self-registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker Admin',
          email: 'hacker@test.com',
          password: 'password123',
          role: 'admin',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Admin accounts cannot be created');
    });

    test('should reject invalid roles', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Role',
          email: 'invalid@test.com',
          password: 'password123',
          role: 'superuser',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should require studentId for student registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Student Without ID',
          email: 'nostudentid@test.com',
          password: 'password123',
          role: 'student',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Student ID');
    });
  });

  // -----------------------------------------------
  // Login
  // -----------------------------------------------
  describe('POST /api/auth/login', () => {
    test('should reject login without required fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
          role: 'student',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -----------------------------------------------
  // Protected Routes
  // -----------------------------------------------
  describe('GET /api/auth/me', () => {
    test('should require authentication token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('token');
    });

    test('should reject invalid tokens', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token_here');

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Invalid');
    });
  });

  // -----------------------------------------------
  // Change Password
  // -----------------------------------------------
  describe('POST /api/auth/change-password', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .send({ currentPassword: 'old', newPassword: 'newpass123' });

      expect(res.status).toBe(401);
    });
  });
});
