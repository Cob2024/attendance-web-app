import { Router } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';

export const enrollmentRouter = Router();

// Enroll student(s) to a course (Admin/Lecturer)
enrollmentRouter.post('/enroll', authenticateToken, requireRole(['admin', 'lecturer']), async (req: AuthRequest, res) => {
  try {
    const { studentId, studentIds, courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, error: 'Course ID is required' });
    }

    // Support both single and bulk enrollment
    const ids: string[] = studentIds || (studentId ? [studentId] : []);
    if (ids.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one student ID is required' });
    }

    // If lecturer, verify they own this course
    if (req.user!.role === 'lecturer') {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || course.lecturerId !== req.user!.id) {
        return res.status(403).json({ success: false, error: 'You can only manage enrollments for your own courses' });
      }
    }

    const results = [];
    const errors = [];

    for (const sid of ids) {
      try {
        const enrollment = await prisma.enrollment.upsert({
          where: { studentId_courseId: { studentId: sid, courseId } },
          update: {},
          create: { studentId: sid, courseId },
          include: {
            student: { select: { id: true, name: true, studentId: true, email: true } },
          },
        });
        results.push(enrollment);
      } catch (err: any) {
        errors.push({ studentId: sid, error: 'Failed to enroll student' });
      }
    }

    return res.json({
      success: true,
      enrolled: results.length,
      errors: errors.length > 0 ? errors : undefined,
      enrollments: results,
    });
  } catch (err: any) {
    console.error('Enrollment error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process enrollment' });
  }
});

// Unenroll student from a course (Admin/Lecturer)
enrollmentRouter.post('/unenroll', authenticateToken, requireRole(['admin', 'lecturer']), async (req: AuthRequest, res) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({ success: false, error: 'Student ID and Course ID are required' });
    }

    // If lecturer, verify they own this course
    if (req.user!.role === 'lecturer') {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || course.lecturerId !== req.user!.id) {
        return res.status(403).json({ success: false, error: 'You can only manage enrollments for your own courses' });
      }
    }

    await prisma.enrollment.delete({
      where: { studentId_courseId: { studentId, courseId } },
    });

    return res.json({ success: true });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }
    console.error('Unenroll error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process unenrollment' });
  }
});

// Get enrolled students for a course
// Security (M4): Scoped by role
enrollmentRouter.get('/course/:courseId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { courseId } = req.params;

    // Security: Verify access — lecturers can only view their own courses, students can view courses they're enrolled in
    if (req.user!.role === 'lecturer') {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course || course.lecturerId !== req.user!.id) {
        return res.status(403).json({ success: false, error: 'You can only view enrollments for your own courses' });
      }
    } else if (req.user!.role === 'student') {
      const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: req.user!.id, courseId } },
      });
      if (!enrollment) {
        return res.status(403).json({ success: false, error: 'You are not enrolled in this course' });
      }
    }

    let enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            programme: true,
            level: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { student: { name: 'asc' } },
    });

    // If no enrollments exist yet, auto-match by programme + level
    if (enrollments.length === 0) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course) {
        const matchingStudents = await prisma.user.findMany({
          where: { role: 'student', programme: course.programme, level: course.level },
          select: { id: true, name: true, email: true, studentId: true, programme: true, level: true, profilePicture: true },
          orderBy: { name: 'asc' },
        });

        for (const s of matchingStudents) {
          try {
            await prisma.enrollment.upsert({
              where: { studentId_courseId: { studentId: s.id, courseId } },
              update: {},
              create: { studentId: s.id, courseId },
            });
          } catch {}
        }

        if (matchingStudents.length > 0) {
          enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  studentId: true,
                  programme: true,
                  level: true,
                  profilePicture: true,
                },
              },
            },
            orderBy: { student: { name: 'asc' } },
          });
        }
      }
    }

    const students = enrollments.map((e) => ({
      ...e.student,
      enrolledAt: e.enrolledAt,
      enrollmentId: e.id,
    }));

    return res.json({ success: true, students, count: students.length });
  } catch (err: any) {
    console.error('Enrollment fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch enrollments' });
  }
});

// Get courses a student is enrolled in
// Security (M4): Students can only view their own enrollments
enrollmentRouter.get('/student/:studentId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { studentId } = req.params;

    // Security: Students can only view their own enrollments
    if (req.user!.role === 'student' && req.user!.id !== studentId) {
      return res.status(403).json({ success: false, error: 'You can only view your own enrollments' });
    }

    // Lecturers can only view enrollments for students in their courses
    if (req.user!.role === 'lecturer') {
      const lecturerCourses = await prisma.course.findMany({
        where: { lecturerId: req.user!.id },
        select: { id: true },
      });
      const courseIds = lecturerCourses.map(c => c.id);

      const enrollments = await prisma.enrollment.findMany({
        where: { studentId, courseId: { in: courseIds } },
        include: {
          course: {
            include: {
              lecturer: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { course: { courseCode: 'asc' } },
      });

      const courses = enrollments.map((e) => ({
        ...e.course,
        enrolledAt: e.enrolledAt,
      }));

      return res.json({ success: true, courses });
    }

    // Admin can see all
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            lecturer: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { course: { courseCode: 'asc' } },
    });

    const courses = enrollments.map((e) => ({
      ...e.course,
      enrolledAt: e.enrolledAt,
    }));

    return res.json({ success: true, courses });
  } catch (err: any) {
    console.error('Student enrollment fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch student enrollments' });
  }
});

// Auto-enroll all matching students by programme + level (Admin/Lecturer)
enrollmentRouter.post('/auto-enroll/:courseId', authenticateToken, requireRole(['admin', 'lecturer']), async (req: AuthRequest, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // If lecturer, verify they own this course
    if (req.user!.role === 'lecturer') {
      if (course.lecturerId !== req.user!.id) {
        return res.status(403).json({ success: false, error: 'You can only manage enrollments for your own courses' });
      }
    }

    // Find all students matching programme + level
    const matchingStudents = await prisma.user.findMany({
      where: {
        role: 'student',
        programme: course.programme,
        level: course.level,
      },
      select: { id: true },
    });

    let enrolled = 0;
    for (const student of matchingStudents) {
      try {
        await prisma.enrollment.upsert({
          where: { studentId_courseId: { studentId: student.id, courseId } },
          update: {},
          create: { studentId: student.id, courseId },
        });
        enrolled++;
      } catch {
        // Skip duplicates silently
      }
    }

    return res.json({
      success: true,
      enrolled,
      total: matchingStudents.length,
      message: `Auto-enrolled ${enrolled} students from ${course.programme} ${course.level}`,
    });
  } catch (err: any) {
    console.error('Auto-enroll error:', err);
    return res.status(500).json({ success: false, error: 'Failed to auto-enroll students' });
  }
});
