/**
 * Express app export for testing with Supertest.
 * This creates the app without starting the HTTP server or Socket.io.
 * We initialize a mock Socket.io server to satisfy the getIO() calls in routes.
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_dev_key_for_unit_tests';
}

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setIO } from '../socket.js';
import { authRouter } from '../routes/authRoutes.js';
import { courseRouter } from '../routes/courseRoutes.js';
import { attendanceRouter } from '../routes/attendanceRoutes.js';
import { adminRouter } from '../routes/adminRoutes.js';
import { enrollmentRouter } from '../routes/enrollmentRoutes.js';
import { notificationRouter } from '../routes/notificationRoutes.js';

const app = express();
const httpServer = createServer(app);

// Create a minimal Socket.io server for testing
const io = new Server(httpServer, { cors: { origin: '*' } });
setIO(io);

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartAttend Test Server', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/admin', adminRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/notifications', notificationRouter);

export { app };
