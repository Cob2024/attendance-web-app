import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { authenticateToken, AuthRequest, JWT_SECRET } from '../middleware/auth.js';
import {
  generateOtpCode,
  maskIdentifier,
  createResetSessionToken,
  verifyResetSessionToken,
  verifyVerifiedResetToken,
  dispatchOtp,
} from '../services/otpService.js';

export const authRouter = Router();

// Auto-initialize Default Admin Account
authRouter.get('/init-admin', async (req, res) => {
  try {
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@ttu.edu.gh' },
      update: { passwordHash, role: 'admin' },
      create: {
        name: 'System Administrator',
        email: 'admin@ttu.edu.gh',
        passwordHash,
        role: 'admin',
      },
    });
    return res.json({ success: true, message: 'Admin account verified & initialized', email: admin.email });
  } catch (err: any) {
    console.error('Init admin error:', err);
    return res.status(500).json({ success: false, error: 'Failed to initialize admin' });
  }
});

// Register User
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, studentId, programme, level } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Name, email, password, and role are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Security Hardening: Prevent self-registration as admin
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin accounts cannot be created via public registration. Contact system administrator.'
      });
    }

    if (role !== 'student' && role !== 'lecturer') {
      return res.status(400).json({ success: false, error: 'Invalid user role specified' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    if (role === 'student') {
      if (!studentId || !programme || !level) {
        return res.status(400).json({ success: false, error: 'Student ID, Programme, and Level are required for students' });
      }
      const existingStudentId = await prisma.user.findUnique({ where: { studentId: studentId.trim() } });
      if (existingStudentId) {
        return res.status(400).json({ success: false, error: 'This Student ID is already registered' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role,
        studentId: role === 'student' ? studentId?.trim() : null,
        programme: role === 'student' ? programme?.trim() : null,
        level: role === 'student' ? level?.trim() : null,
      },
    });

    // Auto-enroll new student into all matching courses
    if (role === 'student' && programme && level) {
      try {
        const matchingCourses = await prisma.course.findMany({
          where: { programme: programme.trim(), level: level.trim() },
        });
        for (const course of matchingCourses) {
          await prisma.enrollment.upsert({
            where: { studentId_courseId: { studentId: user.id, courseId: course.id } },
            update: {},
            create: { studentId: user.id, courseId: course.id },
          });
        }
      } catch (enrollErr) {
        console.warn('Auto-enrollment notice:', enrollErr);
      }
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ success: true, user: userWithoutPassword, token });
  } catch (err: any) {
    console.error('Registration Security Error:', err);
    return res.status(500).json({ success: false, error: 'Registration processing failed' });
  }
});

// Login User
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password, role, deviceFingerprint } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Email, password, and role are required' });
    }

    const user = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase(), role },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid email or password for this role' });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    // Hardware device binding check for students
    if (role === 'student' && deviceFingerprint) {
      const binding = await prisma.deviceBinding.findUnique({
        where: { studentId: user.id },
      });

      if (binding) {
        if (binding.fingerprint !== deviceFingerprint) {
          return res.status(403).json({
            success: false,
            error: 'DEVICE_LOCKED',
            message: 'You are signed in on a different device. Reset your device binding through admin to use this device.',
          });
        }
      } else {
        // Register device binding
        await prisma.deviceBinding.create({
          data: {
            studentId: user.id,
            fingerprint: deviceFingerprint,
            userAgent: req.headers['user-agent'] || '',
          },
        });
      }
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ success: true, user: userWithoutPassword, token });
  } catch (err: any) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, error: 'Login processing failed' });
  }
});

// Get Current User Profile
authRouter.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({ success: true, user: userWithoutPassword });
  } catch (err: any) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// Change Password
authRouter.post('/change-password', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        // Security: Store the timestamp so we can invalidate old tokens
        updatedAt: new Date(),
      },
    });

    // Issue a fresh token so the user stays logged in with the new password
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ success: true, token: newToken });
  } catch (err: any) {
    console.error('Password change error:', err);
    return res.status(500).json({ success: false, error: 'Failed to change password' });
  }
});

// ============================================================
// Password Reset Flows (Self-Service for Students & Lecturers)
// ============================================================

// 1. Request Password Reset Code
authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { identifier, channel, role } = req.body;

    if (!identifier || !channel || !role) {
      return res.status(400).json({
        success: false,
        error: 'Identifier (email or phone), channel, and role are required',
      });
    }

    if (channel !== 'email' && channel !== 'sms') {
      return res.status(400).json({
        success: false,
        error: 'Channel must be either email or sms',
      });
    }

    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Administrator accounts cannot reset passwords publicly. Contact institutional administrator.',
      });
    }

    if (role !== 'student' && role !== 'lecturer') {
      return res.status(400).json({
        success: false,
        error: 'Invalid role specified',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Lookup user by email or studentId
    const user = await prisma.user.findFirst({
      where: {
        role,
        OR: [
          { email: cleanIdentifier },
          { studentId: identifier.trim() },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found matching the provided details and role.',
      });
    }

    // Generate 6-digit OTP
    const code = generateOtpCode();
    const target = channel === 'email' ? user.email : identifier.trim();
    const maskedTarget = maskIdentifier(target, channel);

    const resetSessionToken = await createResetSessionToken(
      user.id,
      code,
      target,
      channel,
      user.role
    );

    await dispatchOtp(channel, target, code, user.name);

    return res.json({
      success: true,
      message: `Verification code sent via ${channel.toUpperCase()}`,
      resetSessionToken,
      maskedTarget,
      channel,
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
    });
  }
});

// 2. Verify Reset Code
authRouter.post('/verify-reset-code', async (req, res) => {
  try {
    const { code, resetSessionToken } = req.body;

    if (!code || !resetSessionToken) {
      return res.status(400).json({
        success: false,
        error: 'Verification code and reset session token are required',
      });
    }

    const verification = await verifyResetSessionToken(resetSessionToken, code);

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        error: verification.error || 'Invalid verification code',
      });
    }

    return res.json({
      success: true,
      message: 'Code verified successfully',
      verifiedResetToken: verification.verifiedResetToken,
    });
  } catch (err: any) {
    console.error('Verify reset code error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify reset code',
    });
  }
});

// 3. Set New Password
authRouter.post('/reset-password', async (req, res) => {
  try {
    const { newPassword, verifiedResetToken } = req.body;

    if (!newPassword || !verifiedResetToken) {
      return res.status(400).json({
        success: false,
        error: 'New password and verified reset token are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      });
    }

    const verified = verifyVerifiedResetToken(verifiedResetToken);
    if (!verified.success || !verified.userId) {
      return res.status(400).json({
        success: false,
        error: verified.error || 'Invalid or expired reset token',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: verified.userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User account not found',
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: 'Your password has been successfully reset. You can now log in.',
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to reset password',
    });
  }
});


