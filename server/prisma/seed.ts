import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initializing clean production database for SmartAttend...');

  // 1. Clean out legacy demo data
  await prisma.attendanceRecord.deleteMany({});
  await prisma.attendanceSession.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.deviceBinding.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      role: { not: 'admin' },
    },
  });

  // 2. Create or Update Default Administrator
  // Security (C2): Generate a cryptographically random password instead of hardcoded 'admin123'
  const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('base64url');
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ttu.edu.gh' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@ttu.edu.gh',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });

  console.log('✅ Clean slate initialized.');
  console.log(`👤 Master Admin Account: ${admin.email}`);
  console.log(`🔑 Admin Password: ${adminPassword}`);
  console.log('⚠️  IMPORTANT: Save this password now. It will not be shown again.');
  console.log('🏛️ Ready for real departmental courses, lecturers, and student registrations.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
