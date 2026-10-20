import request from 'supertest';
import { app } from './testApp.js';

describe('Password Reset API (TDD)', () => {
  const testStudentEmail = 'kwabena.mensah@ttu.edu.gh';
  const testLecturerEmail = 'frank.odoom@ttu.edu.gh';

  // ============================================================
  // Step 1: Request Password Reset Code (/api/auth/forgot-password)
  // ============================================================
  describe('POST /api/auth/forgot-password', () => {
    test('should reject request missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ role: 'student' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/identifier.*channel.*role/i);
    });

    test('should reject invalid channel', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          identifier: testStudentEmail,
          channel: 'smoke-signal',
          role: 'student',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/channel must be either email or sms/i);
    });

    test('should block admin role from public password reset', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          identifier: 'admin@ttu.edu.gh',
          channel: 'email',
          role: 'admin',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/admin.*cannot.*reset/i);
    });

    test('should return 404 for non-existent student or lecturer', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          identifier: 'nonexistent.user@ttu.edu.gh',
          channel: 'email',
          role: 'student',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/no account found/i);
    });

    test('should successfully generate and dispatch OTP code for student via email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          identifier: testStudentEmail,
          channel: 'email',
          role: 'student',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.resetSessionToken).toBeDefined();
      expect(res.body.maskedTarget).toBeDefined();
      expect(res.body.channel).toBe('email');
      // In test/dev mode, devCode is provided for automated testing assertions
      expect(res.body.devCode).toBeDefined();
      expect(res.body.devCode).toMatch(/^\d{6}$/);
    });

    test('should successfully generate and dispatch OTP code for lecturer via sms/email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          identifier: testLecturerEmail,
          channel: 'email',
          role: 'lecturer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.resetSessionToken).toBeDefined();
      expect(res.body.devCode).toBeDefined();
    });
  });

  // ============================================================
  // Step 2: Verify Reset Code (/api/auth/verify-reset-code)
  // ============================================================
  describe('POST /api/auth/verify-reset-code', () => {
    test('should reject request missing code or resetSessionToken', async () => {
      const res = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({ code: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject invalid 6-digit code', async () => {
      // First request a valid session
      const reqRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          identifier: testStudentEmail,
          channel: 'email',
          role: 'student',
        });

      const { resetSessionToken } = reqRes.body;

      const verifyRes = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({
          code: '000000',
          resetSessionToken,
        });

      expect(verifyRes.status).toBe(400);
      expect(verifyRes.body.success).toBe(false);
      expect(verifyRes.body.error).toMatch(/invalid.*code/i);
    });

    test('should reject tampered or corrupted resetSessionToken', async () => {
      const verifyRes = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({
          code: '123456',
          resetSessionToken: 'tampered.jwt.token',
        });

      expect(verifyRes.status).toBe(400);
      expect(verifyRes.body.success).toBe(false);
      expect(verifyRes.body.error).toMatch(/invalid.*session/i);
    });

    test('should accept correct 6-digit code and issue verifiedResetToken', async () => {
      const reqRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          identifier: testStudentEmail,
          channel: 'email',
          role: 'student',
        });

      const { resetSessionToken, devCode } = reqRes.body;

      const verifyRes = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({
          code: devCode,
          resetSessionToken,
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.verifiedResetToken).toBeDefined();
    });
  });

  // ============================================================
  // Step 3: Complete Password Reset (/api/auth/reset-password)
  // ============================================================
  describe('POST /api/auth/reset-password', () => {
    test('should reject request missing newPassword or verifiedResetToken', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ newPassword: 'newPassword123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject short passwords (< 6 characters)', async () => {
      // Setup a verified token
      const reqRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          identifier: testStudentEmail,
          channel: 'email',
          role: 'student',
        });

      const verifyRes = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({
          code: reqRes.body.devCode,
          resetSessionToken: reqRes.body.resetSessionToken,
        });

      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          newPassword: '123',
          verifiedResetToken: verifyRes.body.verifiedResetToken,
        });

      expect(resetRes.status).toBe(400);
      expect(resetRes.body.error).toMatch(/at least 6 characters/i);
    });

    test('should successfully update password and permit login with the new password', async () => {
      const newPassword = 'updatedStudentPass2026!';

      // 1. Request code
      const reqRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          identifier: testStudentEmail,
          channel: 'email',
          role: 'student',
        });

      // 2. Verify code
      const verifyRes = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({
          code: reqRes.body.devCode,
          resetSessionToken: reqRes.body.resetSessionToken,
        });

      // 3. Reset password
      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          newPassword,
          verifiedResetToken: verifyRes.body.verifiedResetToken,
        });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);

      // 4. Verify login with NEW password succeeds
      const loginNewRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testStudentEmail,
          password: newPassword,
          role: 'student',
        });

      expect(loginNewRes.status).toBe(200);
      expect(loginNewRes.body.success).toBe(true);
      expect(loginNewRes.body.token).toBeDefined();

      // 5. Restore original password so tests remain repeatable
      const restoreReq = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          identifier: testStudentEmail,
          channel: 'email',
          role: 'student',
        });

      const restoreVerify = await request(app)
        .post('/api/auth/verify-reset-code')
        .send({
          code: restoreReq.body.devCode,
          resetSessionToken: restoreReq.body.resetSessionToken,
        });

      await request(app)
        .post('/api/auth/reset-password')
        .send({
          newPassword: 'student123',
          verifiedResetToken: restoreVerify.body.verifiedResetToken,
        });
    });
  });
});
