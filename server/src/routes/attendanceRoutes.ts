import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { calculateDistanceMeters } from '../utils/haversine.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { getIO } from '../socket.js';

export const attendanceRouter = Router();

// Helper: Auto-mark all enrolled students who didn't check in within the geofence as absent
const markUncheckedStudentsAbsent = async (courseId: string, sessionId?: string) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Get all students enrolled in this course (via Enrollment table)
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { studentId: true },
    });
    let enrolledStudentIds = enrollments.map(e => e.studentId);

    // Also include students matching course programme & level
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (course) {
      const matchingStudents = await prisma.user.findMany({
        where: {
          role: 'student',
          programme: course.programme,
          level: course.level,
        },
        select: { id: true },
      });
      const matchingIds = matchingStudents.map(s => s.id);
      enrolledStudentIds = Array.from(new Set([...enrolledStudentIds, ...matchingIds]));
    }

    if (enrolledStudentIds.length === 0) return;

    // 2. Find which of these students already checked in for this course today
    const existingRecords = await prisma.attendanceRecord.findMany({
      where: {
        courseId,
        date: todayStr,
        studentId: { in: enrolledStudentIds },
      },
      select: { studentId: true },
    });
    const checkedInStudentIds = new Set(existingRecords.map(r => r.studentId));

    // 3. For all students NOT in checkedInStudentIds, create an 'absent' record
    const absentRecords = enrolledStudentIds
      .filter(id => !checkedInStudentIds.has(id))
      .map(studentId => ({
        studentId,
        courseId,
        sessionId: sessionId || null,
        date: todayStr,
        status: 'absent',
        isManual: false,
      }));

    if (absentRecords.length > 0) {
      await prisma.attendanceRecord.createMany({
        data: absentRecords,
        skipDuplicates: true,
      });
      console.log(`📋 Auto-marked ${absentRecords.length} student(s) absent for course ${courseId} on ${todayStr}`);
    }
  } catch (err) {
    console.error('Error auto-marking absent students:', err);
  }
};

// Helper: auto-close expired sessions and sweep absent students
const autoCloseExpiredSessions = async () => {
  const now = new Date();
  const expired = await prisma.attendanceSession.findMany({
    where: {
      isActive: true,
      expiresAt: { not: null, lte: now },
    },
    select: { id: true, courseId: true },
  });

  if (expired.length > 0) {
    await prisma.attendanceSession.updateMany({
      where: {
        id: { in: expired.map(s => s.id) },
      },
      data: { isActive: false, endedAt: now },
    });

    for (const session of expired) {
      await markUncheckedStudentsAbsent(session.courseId, session.id);
    }
  }
};

// Start Live Attendance Session (Lecturer)
attendanceRouter.post('/session/start', authenticateToken, requireRole(['lecturer']), async (req: AuthRequest, res) => {
  try {
    const { courseId, latitude, longitude, radiusMeters, customOtp, durationMinutes } = req.body;

    if (!courseId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Course ID and GPS coordinates required' });
    }

    // Security: Verify lecturer owns this course
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.lecturerId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'You can only start sessions for your own courses' });
    }

    // Deactivate existing active session for this course
    await prisma.attendanceSession.updateMany({
      where: { courseId, isActive: true },
      data: { isActive: false, endedAt: new Date() },
    });

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
        isActive: true,
        durationMinutes: duration,
        expiresAt,
      },
    });

    const sessionEventData = {
      sessionId: session.id,
      courseId,
      expiresAt: session.expiresAt,
      lecturerName: req.user!.name,
    };
    getIO().to(`course:${courseId}`).emit('session:started', sessionEventData);
    getIO().emit('session:started', sessionEventData);

    return res.json({ success: true, session });
  } catch (err: any) {
    console.error('Session start error:', err);
    return res.status(500).json({ success: false, error: 'Failed to start attendance session' });
  }
});

// End Live Attendance Session (Lecturer)
attendanceRouter.post('/session/end', authenticateToken, requireRole(['lecturer']), async (req: AuthRequest, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, error: 'Course ID is required' });
    }

    // Security (M2): Verify lecturer owns this course before allowing session end
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.lecturerId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'You can only end sessions for your own courses' });
    }

    const activeSession = await prisma.attendanceSession.findFirst({
      where: { courseId, isActive: true },
    });

    await prisma.attendanceSession.updateMany({
      where: { courseId, isActive: true },
      data: { isActive: false, endedAt: new Date() },
    });

    // Auto-mark enrolled students who didn't check in within geofence as absent
    await markUncheckedStudentsAbsent(courseId, activeSession?.id);

    // Emit real-time event: session ended
    getIO().to(`course:${courseId}`).emit('session:ended', { courseId });
    getIO().emit('session:ended', { courseId });

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Session end error:', err);
    return res.status(500).json({ success: false, error: 'Failed to end attendance session' });
  }
});

// Get All Active Sessions for the current user's courses
attendanceRouter.get('/sessions/active', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await autoCloseExpiredSessions();

    const where: any = { isActive: true };

    if (req.user!.role === 'student') {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: req.user!.id },
        select: { courseId: true },
      });
      const enrolledCourseIds = enrollments.map(e => e.courseId);

      // Also find courses matching programme & level
      const student = await prisma.user.findUnique({ where: { id: req.user!.id } });
      let matchingCourseIds: string[] = [];
      if (student?.programme && student?.level) {
        const matching = await prisma.course.findMany({
          where: { programme: student.programme, level: student.level },
          select: { id: true },
        });
        matchingCourseIds = matching.map(m => m.id);
      }

      const allEligibleIds = Array.from(new Set([...enrolledCourseIds, ...matchingCourseIds]));
      where.courseId = { in: allEligibleIds };
    }

    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: {
        course: { select: { id: true, courseName: true, courseCode: true, programme: true, level: true } },
        lecturer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const safeSessions = sessions.map(({ otpCode, ...s }) => s);
    return res.json({ success: true, sessions: safeSessions });
  } catch (err: any) {
    console.error('Active sessions fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch active sessions' });
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

    // Security: Don't expose OTP code in session data returned to students
    if (session) {
      const { otpCode, ...sessionWithoutOtp } = session;
      return res.json({ success: true, session: sessionWithoutOtp });
    }

    return res.json({ success: true, session: null });
  } catch (err: any) {
    console.error('Active session fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch active session' });
  }
});

// Mark Attendance (Student) — Server-Side Strict GPS Geofence Verification
attendanceRouter.post('/mark', authenticateToken, requireRole(['student']), async (req: AuthRequest, res) => {
  try {
    const { courseId, latitude, longitude } = req.body;
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

    // Emit real-time event: attendance marked
    const studentInfo = await prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, studentId: true },
    });
    getIO().to(`course:${courseId}`).emit('attendance:marked', {
      courseId,
      studentName: studentInfo?.name || 'Unknown',
      studentIdNumber: studentInfo?.studentId || '',
      distance: Math.round(distance),
      timestamp: new Date().toISOString(),
    });

    return res.json({ success: true, record, distance });
  } catch (err: any) {
    console.error('Attendance mark error:', err);
    return res.status(500).json({ success: false, error: 'Failed to mark attendance' });
  }
});

// Manual Attendance Mark (Lecturer / Admin)
attendanceRouter.post('/manual', authenticateToken, requireRole(['lecturer', 'admin']), async (req: AuthRequest, res) => {
  try {
    const { studentId, courseId, date, status } = req.body;

    if (!studentId || !courseId || !date || !status) {
      return res.status(400).json({ success: false, error: 'Student ID, Course ID, date, and status are required' });
    }

    // Validate status value
    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be "present" or "absent"' });
    }

    // Security: If lecturer, verify they own the course
    if (req.user!.role === 'lecturer') {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || course.lecturerId !== req.user!.id) {
        return res.status(403).json({ success: false, error: 'You can only manage attendance for your own courses' });
      }
    }

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
    console.error('Manual attendance error:', err);
    return res.status(500).json({ success: false, error: 'Failed to record manual attendance' });
  }
});

// Get Attendance Records with optional filters
// Security (M3): Scoped by role — students see only their own, lecturers see only their courses
attendanceRouter.get('/records', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { courseId, studentId, startDate, endDate } = req.query as any;

    const where: any = {};
    if (courseId) where.courseId = courseId;

    if (req.user!.role === 'student') {
      // Students can only see their own records
      where.studentId = req.user!.id;
    } else if (req.user!.role === 'lecturer') {
      // Lecturers can only see records for courses they teach
      const lecturerCourses = await prisma.course.findMany({
        where: { lecturerId: req.user!.id },
        select: { id: true },
      });
      const courseIds = lecturerCourses.map(c => c.id);

      if (courseId) {
        // Verify the requested course belongs to this lecturer
        if (!courseIds.includes(courseId)) {
          return res.status(403).json({ success: false, error: 'You can only view records for your own courses' });
        }
      } else {
        where.courseId = { in: courseIds };
      }

      if (studentId) where.studentId = studentId;
    } else if (req.user!.role === 'admin') {
      // Admins can see everything
      if (studentId) where.studentId = studentId;
    }

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
    console.error('Attendance records fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch attendance records' });
  }
});
