import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';

export const courseRouter = Router();

// Get Courses (Role-filtered)
courseRouter.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { role, id } = req.user!;

    if (role === 'admin') {
      const courses = await prisma.course.findMany({
        include: { lecturer: { select: { id: true, name: true, email: true } } },
        orderBy: { courseCode: 'asc' },
      });
      return res.json({ success: true, courses });
    } else if (role === 'lecturer') {
      const courses = await prisma.course.findMany({
        where: { lecturerId: id },
        include: { lecturer: { select: { id: true, name: true, email: true } } },
        orderBy: { courseCode: 'asc' },
      });
      return res.json({ success: true, courses });
    } else if (role === 'student') {
      const student = await prisma.user.findUnique({ where: { id } });
      if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

      // Check for explicit enrollments first
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: id },
        include: {
          course: {
            include: { lecturer: { select: { id: true, name: true, email: true } } },
          },
        },
      });

      if (enrollments.length > 0) {
        const courses = enrollments
          .map((e) => e.course)
          .sort((a, b) => a.courseCode.localeCompare(b.courseCode));
        return res.json({ success: true, courses });
      }

      // Fallback: programme + level matching (for backward compatibility)
      const courses = await prisma.course.findMany({
        where: { programme: student.programme!, level: student.level! },
        include: { lecturer: { select: { id: true, name: true, email: true } } },
        orderBy: { courseCode: 'asc' },
      });
      return res.json({ success: true, courses });
    }

    return res.status(400).json({ success: false, error: 'Invalid user role' });
  } catch (err: any) {
    console.error('Course fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch courses' });
  }
});

// Create Course (Admin only)
courseRouter.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { courseName, courseCode, programme, level, lecturerId } = req.body;

    if (!courseName || !courseCode || !programme || !level || !lecturerId) {
      return res.status(400).json({ success: false, error: 'All course fields are required' });
    }

    const existing = await prisma.course.findUnique({ where: { courseCode } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Course code already exists' });
    }

    const course = await prisma.course.create({
      data: {
        courseName: courseName.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        programme,
        level,
        lecturerId,
      },
      include: { lecturer: { select: { id: true, name: true, email: true } } },
    });

    return res.json({ success: true, course });
  } catch (err: any) {
    console.error('Course create error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create course' });
  }
});

// Update Course (Admin only)
courseRouter.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { courseName, courseCode, programme, level, lecturerId } = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(courseName && { courseName: courseName.trim() }),
        ...(courseCode && { courseCode: courseCode.trim().toUpperCase() }),
        ...(programme && { programme }),
        ...(level && { level }),
        ...(lecturerId !== undefined && { lecturerId }),
      },
      include: { lecturer: { select: { id: true, name: true, email: true } } },
    });

    return res.json({ success: true, course });
  } catch (err: any) {
    console.error('Course update error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update course' });
  }
});

// Delete Course (Admin only)
courseRouter.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Course delete error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete course' });
  }
});
