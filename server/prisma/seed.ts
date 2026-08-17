import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TTU SmartAttend production database...');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const lecturerPasswordHash = await bcrypt.hash('lecturer123', 10);

  // 1. Create Admin
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
  console.log('✅ Admin created:', admin.email);

  // 2. Create Lecturers
  const lecturer1 = await prisma.user.upsert({
    where: { email: 'kwame.owusu@ttu.edu.gh' },
    update: {},
    create: {
      name: 'Dr. Kwame Owusu',
      email: 'kwame.owusu@ttu.edu.gh',
      passwordHash: lecturerPasswordHash,
      role: 'lecturer',
    },
  });

  const lecturer2 = await prisma.user.upsert({
    where: { email: 'abena.mensah@ttu.edu.gh' },
    update: {},
    create: {
      name: 'Mrs. Abena Mensah',
      email: 'abena.mensah@ttu.edu.gh',
      passwordHash: lecturerPasswordHash,
      role: 'lecturer',
    },
  });
  console.log('✅ Lecturers created:', lecturer1.email, lecturer2.email);

  // 3. Create Students
  const student1 = await prisma.user.upsert({
    where: { email: 'kofi.adom@student.ttu.edu.gh' },
    update: {},
    create: {
      name: 'Kofi Adom',
      email: 'kofi.adom@student.ttu.edu.gh',
      passwordHash,
      role: 'student',
      studentId: 'BC/GRD/22/045',
      programme: 'B.Tech Graphic Design Technology',
      level: 'Level 300',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'ama.serwaa@student.ttu.edu.gh' },
    update: {},
    create: {
      name: 'Ama Serwaa',
      email: 'ama.serwaa@student.ttu.edu.gh',
      passwordHash,
      role: 'student',
      studentId: 'BC/GRD/22/118',
      programme: 'B.Tech Graphic Design Technology',
      level: 'Level 300',
    },
  });
  console.log('✅ Students created:', student1.email, student2.email);

  // 4. Create Courses
  const course1 = await prisma.course.upsert({
    where: { courseCode: 'GRD 301' },
    update: { lecturerId: lecturer1.id },
    create: {
      courseName: 'Production Management',
      courseCode: 'GRD 301',
      programme: 'B.Tech Graphic Design Technology',
      level: 'Level 300',
      lecturerId: lecturer1.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { courseCode: 'GRD 303' },
    update: { lecturerId: lecturer1.id },
    create: {
      courseName: 'Packaging & Design Technology',
      courseCode: 'GRD 303',
      programme: 'B.Tech Graphic Design Technology',
      level: 'Level 300',
      lecturerId: lecturer1.id,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { courseCode: 'GRD 305' },
    update: { lecturerId: lecturer2.id },
    create: {
      courseName: 'Digital Illustration & UI Design',
      courseCode: 'GRD 305',
      programme: 'B.Tech Graphic Design Technology',
      level: 'Level 300',
      lecturerId: lecturer2.id,
    },
  });
  // 5. Create Student Enrollments
  const enrollments = [
    { studentId: student1.id, courseId: course1.id },
    { studentId: student1.id, courseId: course2.id },
    { studentId: student1.id, courseId: course3.id },
    { studentId: student2.id, courseId: course1.id },
    { studentId: student2.id, courseId: course2.id },
    { studentId: student2.id, courseId: course3.id },
  ];

  for (const enr of enrollments) {
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: enr.studentId,
          courseId: enr.courseId,
        },
      },
      update: {},
      create: enr,
    });
  }
  console.log('✅ Student enrollments seeded');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
