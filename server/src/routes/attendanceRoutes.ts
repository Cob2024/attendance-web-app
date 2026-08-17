import { Router } from 'express';
import { prisma } from '../db.js';
import { calculateDistanceMeters } from '../utils/haversine.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';

export const attendanceRouter = Router();

// Helper: auto-close expired sessions
const autoCloseExpiredSessions = async () => {
  const now = new Date();
  await prisma.attendanceSession.updateMany({
    where: {
      isActive: true,
      expiresAt: { not: null, lte: now },
    },
    data: { isActive: false, endedAt: now },
  });
};

// Start Live Attendance Session (Lecturer)
attendanceRouter.post('/session/start', authenticateToken, requireRole(['lecturer']), async (req: AuthRequest, res) => {
  try {
    const { courseId, latitude, longitude, radiusMeters, customOtp, durationMinutes } = req.body;

    if (!courseId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Course ID and GPS coordinates required' });
    }

    // Deactivate existing active session for this course
    await prisma.attendanceSession.updateMany({
      where: { courseId, isActive: true },
      data: { isActive: false, endedAt: new Date() },
    });

    // Generate random 6-digit OTP passcode
    const otpCode = customOtp || Math.floor(100000 + Math.random() * 900000).toString();

    // Compute expiry time (0 or null = no auto-close)
    const duration = durationMinutes ? parseInt(durationMinutes) : 30;
    const expiresAt = duration > 0
      ? new Date(Date.now() + duration * 60 * 1000)
      : null;

    const session = await prisma.attendanceSession.create({
      data: {
        courseId,
        lecturerId: req.user!.id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusMeters: radiusMeters ? parseFloat(radiusMeters) : 50.0,
        otpCode,
        isActive: true,
        durationMinutes: duration,
        expiresAt,
      },
    });

    return res.json({ success: true, session, otpCode });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// End Live Attendance Session (Lecturer)
attendanceRouter.post('/session/end', authenticateToken, requireRole(['lecturer']), async (req: AuthRequest, res) => {
  try {
    const { courseId } = req.body;

    await prisma.attendanceSession.updateMany({
      where: { courseId, isActive: true },
      data: { isActive: false, endedAt: new Date() },
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get Active Session for Course (auto-closes expired sessions)
attendanceRouter.get('/session/active/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Auto-close any expired sessions first
    await autoCloseExpiredSessions();

    const session = await prisma.attendanceSession.findFirst({
      where: { courseId, isActive: true },
    });
    return res.json({ success: true, session });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Mark Attendance (Student) — Server-Side GPS & OTP Validation
attendanceRouter.post('/mark', authenticateToken, requireRole(['student']), async (req: AuthRequest, res) => {
  try {
    const { courseId, latitude, longitude, otpCode } = req.body;
    const studentId = req.user!.id;

    if (!courseId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Course ID and location coordinates required' });
    }

    // Auto-close expired sessions before checking
    await autoCloseExpiredSessions();

    const session = await prisma.attendanceSession.findFirst({
      where: { courseId, isActive: true },
    });

    if (!session) {
      return res.status(400).json({ success: false, error: 'No active attendance session for this course' });
    }

    // Validate 6-digit OTP code if session requires OTP
    if (session.otpCode) {
      if (!otpCode || otpCode.trim() !== session.otpCode.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid 6-digit session passcode. Please check the code displayed on the lecturer screen.',
        });
      }
    }

    // Calculate distance on backend using Haversine
    const distance = calculateDistanceMeters(
      parseFloat(latitude),
      parseFloat(longitude),
      session.latitude,
      session.longitude
    );

    if (distance > session.radiusMeters) {
      return res.status(400).json({
        success: false,
        error: `Out of range. You are ${Math.round(distance)}m away from the classroom. Max allowed distance is ${session.radiusMeters}m.`,
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Upsert record
    const record = await prisma.attendanceRecord.upsert({
      where: {
        studentId_courseId_date: {
          studentId,
          courseId,
          date: todayStr,
        },
      },
      update: {
        status: 'present',
        timestamp: new Date(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        distance,
        sessionId: session.id,
      },
      create: {
        studentId,
        courseId,
        sessionId: session.id,
        date: todayStr,
        status: 'present',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        distance,
      },
    });

    return res.json({ success: true, record, distance });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Manual Attendance Mark (Lecturer / Admin)
attendanceRouter.post('/manual', authenticateToken, requireRole(['lecturer', 'admin']), async (req, res) => {
  try {
    const { studentId, courseId, date, status } = req.body;

    const record = await prisma.attendanceRecord.upsert({
      where: {
        studentId_courseId_date: {
          studentId,
          courseId,
          date,
        },
      },
      update: {
        status,
        timestamp: new Date(),
        isManual: true,
      },
      create: {
        studentId,
        courseId,
        date,
        status,
        isManual: true,
      },
    });

    return res.json({ success: true, record });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get Attendance Records with optional filters
attendanceRouter.get('/records', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { courseId, studentId, startDate, endDate } = req.query as any;

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (studentId) where.studentId = studentId;
    if (req.user!.role === 'student') where.studentId = req.user!.id;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, studentId: true, email: true } },
        course: { select: { id: true, courseName: true, courseCode: true } },
      },
      orderBy: { timestamp: 'desc' },
    });

    return res.json({ success: true, records });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
