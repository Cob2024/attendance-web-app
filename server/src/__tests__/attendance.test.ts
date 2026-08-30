import request from 'supertest';
import { app } from './testApp';

describe('Attendance API', () => {
  // -----------------------------------------------
  // Session Management — Auth Required
  // -----------------------------------------------
  describe('POST /api/attendance/session/start', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/attendance/session/start')
        .send({ courseId: 'test-course', latitude: 4.89, longitude: -1.75 });

      expect(res.status).toBe(401);
    });

    test('should reject without auth token', async () => {
      const res = await request(app)
        .post('/api/attendance/session/start')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/attendance/session/end', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/attendance/session/end')
        .send({ courseId: 'test-course' });

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------
  // Mark Attendance — Auth Required
  // -----------------------------------------------
  describe('POST /api/attendance/mark', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/attendance/mark')
        .send({ courseId: 'test', latitude: 4.89, longitude: -1.75 });

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------
  // Active Session Check
  // -----------------------------------------------
  describe('GET /api/attendance/session/active/:courseId', () => {
    test('should require authentication', async () => {
      const res = await request(app).get('/api/attendance/session/active/test-course');
      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------
  // Manual Attendance
  // -----------------------------------------------
  describe('POST /api/attendance/manual', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/attendance/manual')
        .send({ studentId: 'test', courseId: 'test', date: '2025-01-01', status: 'present' });

      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------
  // Attendance Records
  // -----------------------------------------------
  describe('GET /api/attendance/records', () => {
    test('should require authentication', async () => {
      const res = await request(app).get('/api/attendance/records');
      expect(res.status).toBe(401);
    });
  });
});

describe('Admin API', () => {
  describe('GET /api/admin/users', () => {
    test('should require authentication', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/admin/device/reset', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/admin/device/reset')
        .send({ studentId: 'test' });

      expect(res.status).toBe(401);
    });
  });
});

describe('Enrollment API', () => {
  describe('POST /api/enrollments/enroll', () => {
    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/enrollments/enroll')
        .send({ studentId: 'test', courseId: 'test' });

      expect(res.status).toBe(401);
    });
  });
});

describe('Notification API', () => {
  describe('GET /api/notifications/attendance-warnings/:courseId', () => {
    test('should require authentication', async () => {
      const res = await request(app).get('/api/notifications/attendance-warnings/test-course');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/notifications/system-risk-report', () => {
    test('should require authentication', async () => {
      const res = await request(app).get('/api/notifications/system-risk-report');
      expect(res.status).toBe(401);
    });
  });
});
