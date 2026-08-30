import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export const adminRouter = Router();

// Apply admin role check to all admin routes
adminRouter.use(authenticateToken, requireRole(['admin']));

// Get all users (students and lecturers)
adminRouter.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        programme: true,
        level: true,
        profilePicture: true,
        createdAt: true,
        deviceBinding: { select: { id: true, registeredAt: true } },
      },
      orderBy: { name: 'asc' },
    });
    return res.json({ success: true, users });
  } catch (err: any) {
    console.error('Admin users fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Admin update user
adminRouter.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, studentId, programme, level, password } = req.body;

    const data: any = {};
    if (name) data.name = name.trim();
    if (email) data.email = email.trim().toLowerCase();
    if (studentId !== undefined) data.studentId = studentId?.trim();
    if (programme !== undefined) data.programme = programme?.trim();
    if (level !== undefined) data.level = level?.trim();
    if (password) data.passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    const { passwordHash: _, ...userWithout } = user;
    return res.json({ success: true, user: userWithout });
  } catch (err: any) {
    console.error('Admin user update error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// Delete User
adminRouter.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await prisma.user.findUnique({ where: { id } });

    if (!targetUser) return res.status(404).json({ success: false, error: 'User not found' });

    // Security Fix: Previously returned a plain object instead of HTTP response — admin accounts were deletable!
    if (targetUser.role === 'admin') {
      return res.status(403).json({ success: false, error: 'Cannot delete admin accounts' });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Admin user delete error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// Reset Device Binding
adminRouter.post('/device/reset', async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ success: false, error: 'Student ID required' });

    await prisma.deviceBinding.deleteMany({
      where: { studentId },
    });

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Device reset error:', err);
    return res.status(500).json({ success: false, error: 'Failed to reset device binding' });
  }
});

