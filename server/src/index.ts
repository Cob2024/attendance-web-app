import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { setIO } from './socket.js';
import { authRouter } from './routes/authRoutes.js';
import { courseRouter } from './routes/courseRoutes.js';
import { attendanceRouter } from './routes/attendanceRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { enrollmentRouter } from './routes/enrollmentRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';

dotenv.config();

// Security: Crash early if JWT_SECRET is not set
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set. Server cannot start.');
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);
const PORT = Number(process.env.PORT) || 5000;

// Security (H5): Lock down CORS origin — no wildcards in production
const corsOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
if (process.env.NODE_ENV === 'production' && corsOrigin === '*') {
  console.warn('⚠️  WARNING: CORS origin is set to wildcard (*) in production. This is insecure.');
}

// Socket.io — Real-Time Event Server
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Security (H3): Socket.io JWT Authentication Middleware
// Reject unauthenticated connections before they can join rooms or receive events
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    (socket as any).user = decoded;
    next();
  } catch (err) {
    return next(new Error('Invalid or expired token'));
  }
});

// Register the io instance in the shared singleton
setIO(io);

io.on('connection', (socket) => {
  const user = (socket as any).user;
  console.log(`⚡ Client connected: ${socket.id} (${user?.email || 'unknown'})`);

  // Allow clients to join course-specific rooms for targeted events
  socket.on('join:course', (courseId: string) => {
    socket.join(`course:${courseId}`);
  });

  socket.on('leave:course', (courseId: string) => {
    socket.leave(`course:${courseId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Security Middleware: Helmet HTTP Headers
app.use(helmet());

// Security Middleware: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 login/signup attempts per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts, please try again after 15 minutes.' },
});

// Security (L3): Stricter rate limit for sensitive operations
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Max 10 attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts. Please try again later.' },
});

// CORS Configuration
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// Security (L4): Tighter JSON body size limit (was 10mb)
app.use(express.json({ limit: '1mb' }));

// Apply Rate Limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/change-password', sensitiveLimiter);
app.use('/api/admin/device/reset', sensitiveLimiter);

// Root & Health Check Endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'SmartAttend Production Backend API',
    institution: 'Takoradi Technical University (TTU)',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      courses: '/api/courses',
      attendance: '/api/attendance',
      admin: '/api/admin',
      enrollments: '/api/enrollments',
      notifications: '/api/notifications',
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartAttend Security-Hardened API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/admin', adminRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/notifications', notificationRouter);

import bcrypt from 'bcryptjs';
import { prisma } from './db.js';

// Auto-provision initial institutional test accounts on boot
async function ensureInitialAccounts() {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
    const lecturerPasswordHash = await bcrypt.hash('lecturer123', 12);
    const studentPasswordHash = await bcrypt.hash('student123', 12);

    // 1. Admin
    await prisma.user.upsert({
      where: { email: 'admin@ttu.edu.gh' },
      update: { passwordHash: adminPasswordHash, role: 'admin' },
      create: {
        name: 'System Administrator',
        email: 'admin@ttu.edu.gh',
        passwordHash: adminPasswordHash,
        role: 'admin',
      },
    });

    // 2. Demo Lecturer
    const lecturer = await prisma.user.upsert({
      where: { email: 'frank.odoom@ttu.edu.gh' },
      update: { name: 'Dr. Frank Odoom', passwordHash: lecturerPasswordHash, role: 'lecturer' },
      create: {
        name: 'Dr. Frank Odoom',
        email: 'frank.odoom@ttu.edu.gh',
        passwordHash: lecturerPasswordHash,
        role: 'lecturer',
      },
    });

    // 3. Demo Student
    const student = await prisma.user.upsert({
      where: { email: 'kwabena.mensah@ttu.edu.gh' },
      update: {
        name: 'Kwabena Mensah',
        studentId: 'BC/GRD/22/101',
        programme: 'Graphic Design',
        level: 'Level 200',
        passwordHash: studentPasswordHash,
        role: 'student',
      },
      create: {
        name: 'Kwabena Mensah',
        email: 'kwabena.mensah@ttu.edu.gh',
        studentId: 'BC/GRD/22/101',
        programme: 'Graphic Design',
        level: 'Level 200',
        passwordHash: studentPasswordHash,
        role: 'student',
      },
    });

    // 4. Ensure demo course exists
    const course = await prisma.course.upsert({
      where: { courseCode: 'GRD 201' },
      update: {
        courseName: 'UI/UX Design Principles',
        programme: 'Graphic Design',
        level: 'Level 200',
        lecturerId: lecturer.id,
      },
      create: {
        courseCode: 'GRD 201',
        courseName: 'UI/UX Design Principles',
        programme: 'Graphic Design',
        level: 'Level 200',
        semester: 'Second Semester',
        lecturerId: lecturer.id,
      },
    });

    // 5. Ensure student enrollment in demo course
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        studentId: student.id,
        courseId: course.id,
      },
    });

    console.log('👤 Institutional accounts verified & active:');
    console.log('  🛡️ Admin:    admin@ttu.edu.gh / admin123');
    console.log('  👨‍🏫 Lecturer: frank.odoom@ttu.edu.gh / lecturer123');
    console.log('  🎓 Student:  kwabena.mensah@ttu.edu.gh / student123');
  } catch (e: any) {
    console.error('Error ensuring initial accounts:', e?.message || e);
  }
}

httpServer.listen(PORT, '0.0.0.0', async () => {
  await ensureInitialAccounts();
  console.log(`🚀 SmartAttend Security-Hardened Production Server running on port ${PORT}`);
  console.log(`⚡ Socket.io real-time server attached (JWT-authenticated)`);
});
