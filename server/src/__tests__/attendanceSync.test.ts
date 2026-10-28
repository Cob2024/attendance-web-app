import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from './testApp.js';
import { JWT_SECRET } from '../middleware/auth.js';

describe('Eventual Consistency & Attendance Sync API (TDD)', () => {
  jest.setTimeout(15000);
  const studentToken = jwt.sign(
    { id: 'test-student-id', email: 'kwabena.mensah@ttu.edu.gh', role: 'student', name: 'Kwabena Mensah' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const lecturerToken = jwt.sign(
    { id: 'test-lecturer-id', email: 'frank.odoom@ttu.edu.gh', role: 'lecturer', name: 'Dr. Frank Odoom' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  describe('POST /api/attendance/sync', () => {
    test('should require authentication (401 without token)', async () => {
      const res = await request(app)
        .post('/api/attendance/sync')
        .send({ items: [] });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should reject non-student roles (403 for lecturer)', async () => {
      const res = await request(app)
        .post('/api/attendance/sync')
        .set('Authorization', `Bearer ${lecturerToken}`)
        .send({ items: [] });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('should reject invalid payload without items array (400)', async () => {
      const res = await request(app)
        .post('/api/attendance/sync')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ invalidField: true });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/items array is required/i);
    });

    test('should accept empty items array with empty results (200)', async () => {
      const res = await request(app)
        .post('/api/attendance/sync')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ items: [] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.results).toEqual([]);
    });

    test('should reject item with missing required fields', async () => {
      const res = await request(app)
        .post('/api/attendance/sync')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          items: [
            {
              clientQueueId: 'queue-item-1',
              // missing courseId, latitude, longitude
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].clientQueueId).toBe('queue-item-1');
      expect(res.body.results[0].status).toBe('rejected');
      expect(res.body.results[0].error).toMatch(/missing required fields/i);
    });

    test('should reject item when course has no active or matching session', async () => {
      const res = await request(app)
        .post('/api/attendance/sync')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          items: [
            {
              clientQueueId: 'queue-item-2',
              courseId: 'non-existent-course-id',
              latitude: 4.8967,
              longitude: -1.7725,
              accuracy: 10,
              capturedAt: new Date().toISOString(),
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].status).toBe('rejected');
      expect(res.body.results[0].error).toMatch(/no active.*session/i);
    });
  });
});

