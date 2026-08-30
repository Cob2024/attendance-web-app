import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
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
  console.log(`👤 Master Admin Account: ${admin.email} (Password: admin123)`);
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
