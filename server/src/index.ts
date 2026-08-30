import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { setIO } from './socket.js';
import { authRouter } from './routes/authRoutes.js';
import { courseRouter } from './routes/courseRoutes.js';
import { attendanceRouter } from './routes/attendanceRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { enrollmentRouter } from './routes/enrollmentRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = Number(process.env.PORT) || 5000;

// Socket.io — Real-Time Event Server
const corsOrigin = process.env.CLIENT_ORIGIN || '*';
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Register the io instance in the shared singleton
setIO(io);

io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

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

// CORS Configuration
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Apply Rate Limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SmartAttend Security-Hardened Production Server running on port ${PORT}`);
  console.log(`⚡ Socket.io real-time server attached`);
});

