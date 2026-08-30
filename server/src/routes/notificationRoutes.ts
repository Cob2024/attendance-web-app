import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';

export const notificationRouter = Router();

// Get attendance warnings for a course (students below 75% threshold)
notificationRouter.get('/attendance-warnings/:courseId', authenticateToken, requireRole(['lecturer', 'admin']), async (req, res) => {
  try {
    const { courseId } = req.params;
    const threshold = parseFloat(req.query.threshold as string) || 75;

    // Get all enrolled students for this course
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: { select: { id: true, name: true, studentId: true, email: true, programme: true, level: true } },
      },
    });

    // Get all sessions for this course (total possible attendance)
    const totalSessions = await prisma.attendanceSession.count({
      where: { courseId },
    });

    if (totalSessions === 0) {
      return res.json({ success: true, warnings: [], totalSessions: 0, threshold });
    }

    const warnings = [];

    for (const enrollment of enrollments) {
      // Count how many sessions this student attended
      const attendedSessions = await prisma.attendanceRecord.count({
        where: {
          studentId: enrollment.studentId,
          courseId,
          status: 'present',
        },
      });

      const percentage = Math.round((attendedSessions / totalSessions) * 100);

      if (percentage < threshold) {
        warnings.push({
          student: enrollment.student,
          attendedSessions,
          totalSessions,
          percentage,
          deficit: Math.ceil((threshold / 100) * totalSessions) - attendedSessions,
        });
      }
    }

    // Sort by lowest attendance first
    warnings.sort((a, b) => a.percentage - b.percentage);

    return res.json({ success: true, warnings, totalSessions, threshold });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get attendance warnings for a specific student across all courses
notificationRouter.get('/student-warnings/:studentId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { studentId } = req.params;
    const threshold = parseFloat(req.query.threshold as string) || 75;

    // Students can only view their own warnings
    if (req.user!.role === 'student' && req.user!.id !== studentId) {
      return res.status(403).json({ success: false, error: 'You can only view your own attendance warnings' });
    }

    // Get all courses the student is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          select: { id: true, courseName: true, courseCode: true, programme: true, level: true },
        },
      },
    });

    const warnings = [];

    for (const enrollment of enrollments) {
      const totalSessions = await prisma.attendanceSession.count({
        where: { courseId: enrollment.courseId },
      });

      if (totalSessions === 0) continue;

      const attendedSessions = await prisma.attendanceRecord.count({
        where: {
          studentId,
          courseId: enrollment.courseId,
          status: 'present',
        },
      });

      const percentage = Math.round((attendedSessions / totalSessions) * 100);

      warnings.push({
        course: enrollment.course,
        attendedSessions,
        totalSessions,
        percentage,
        isAtRisk: percentage < threshold,
        deficit: percentage < threshold ? Math.ceil((threshold / 100) * totalSessions) - attendedSessions : 0,
      });
    }

    warnings.sort((a, b) => a.percentage - b.percentage);

    return res.json({ success: true, warnings, threshold });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get system-wide attendance risk report (Admin only)
notificationRouter.get('/system-risk-report', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold as string) || 75;

    const courses = await prisma.course.findMany({
      include: { lecturer: { select: { id: true, name: true } } },
    });

    const report = [];

    for (const course of courses) {
      const totalSessions = await prisma.attendanceSession.count({
        where: { courseId: course.id },
      });

      if (totalSessions === 0) continue;

      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: course.id },
        include: {
          student: { select: { id: true, name: true, studentId: true } },
        },
      });

      let atRiskCount = 0;
      const atRiskStudents = [];

      for (const enrollment of enrollments) {
        const attendedSessions = await prisma.attendanceRecord.count({
          where: {
            studentId: enrollment.studentId,
            courseId: course.id,
            status: 'present',
          },
        });

        const percentage = Math.round((attendedSessions / totalSessions) * 100);

        if (percentage < threshold) {
          atRiskCount++;
          atRiskStudents.push({
            student: enrollment.student,
            percentage,
            attendedSessions,
          });
        }
      }

      if (atRiskCount > 0) {
        report.push({
          course: {
            id: course.id,
            courseName: course.courseName,
            courseCode: course.courseCode,
            programme: course.programme,
            level: course.level,
          },
          lecturer: course.lecturer,
          totalSessions,
          totalEnrolled: enrollments.length,
          atRiskCount,
          atRiskStudents: atRiskStudents.sort((a, b) => a.percentage - b.percentage),
        });
      }
    }

    report.sort((a, b) => b.atRiskCount - a.atRiskCount);

    return res.json({ success: true, report, threshold });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
