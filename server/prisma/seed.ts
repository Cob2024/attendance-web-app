import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initializing TTU SmartAttend database with seed accounts and academic records...');

  const adminPassHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  const lecturerPassHash = await bcrypt.hash('lecturer123', 12);
  const studentPassHash = await bcrypt.hash('student123', 12);

  // 1. Master Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ttu.edu.gh' },
    update: { passwordHash: adminPassHash, role: 'admin' },
    create: {
      name: 'System Administrator',
      email: 'admin@ttu.edu.gh',
      passwordHash: adminPassHash,
      role: 'admin',
    },
  });
  console.log('✓ Admin seeded:', admin.email);

  // 2. Lecturers
  const lecturersData = [
    {
      name: 'Dr. Frank Odoom',
      email: 'frank.odoom@ttu.edu.gh',
      passwordHash: lecturerPassHash,
      role: 'lecturer',
    },
    {
      name: 'Prof. Emmanuel Mensah',
      email: 'emmanuel.mensah@ttu.edu.gh',
      passwordHash: lecturerPassHash,
      role: 'lecturer',
    },
    {
      name: 'Dr. Sarah Boateng',
      email: 'sarah.boateng@ttu.edu.gh',
      passwordHash: lecturerPassHash,
      role: 'lecturer',
    },
  ];

  const lecturers: any[] = [];
  for (const l of lecturersData) {
    const lecturer = await prisma.user.upsert({
      where: { email: l.email },
      update: { name: l.name, passwordHash: l.passwordHash, role: 'lecturer' },
      create: l,
    });
    lecturers.push(lecturer);
    console.log(`✓ Lecturer seeded: ${lecturer.name} (${lecturer.email})`);
  }

  // 3. Courses
  const coursesData = [
    {
      courseName: 'UI/UX Design Principles',
      courseCode: 'GRD 201',
      programme: 'Graphic Design',
      level: 'Level 200',
      semester: 'Second Semester',
      lecturerId: lecturers[0].id,
    },
    {
      courseName: 'Digital Illustration & Typography',
      courseCode: 'GRD 202',
      programme: 'Graphic Design',
      level: 'Level 200',
      semester: 'Second Semester',
      lecturerId: lecturers[0].id,
    },
    {
      courseName: 'Database Systems & Architecture',
      courseCode: 'CSC 301',
      programme: 'Computer Science',
      level: 'Level 300',
      semester: 'Second Semester',
      lecturerId: lecturers[1].id,
    },
    {
      courseName: 'Mobile Application Development',
      courseCode: 'CSC 302',
      programme: 'Computer Science',
      level: 'Level 300',
      semester: 'Second Semester',
      lecturerId: lecturers[1].id,
    },
    {
      courseName: 'Circuit Theory & Electronics',
      courseCode: 'EET 201',
      programme: 'Electrical Engineering',
      level: 'Level 200',
      semester: 'Second Semester',
      lecturerId: lecturers[2].id,
    },
  ];

  const courses: any[] = [];
  for (const c of coursesData) {
    const course = await prisma.course.upsert({
      where: { courseCode: c.courseCode },
      update: {
        courseName: c.courseName,
        programme: c.programme,
        level: c.level,
        lecturerId: c.lecturerId,
      },
      create: c,
    });
    courses.push(course);
    console.log(`✓ Course seeded: ${course.courseCode} - ${course.courseName}`);
  }

  // 4. Students
  const studentsData = [
    {
      name: 'Kwabena Mensah',
      email: 'kwabena.mensah@ttu.edu.gh',
      studentId: 'BC/GRD/22/101',
      programme: 'Graphic Design',
      level: 'Level 200',
      passwordHash: studentPassHash,
      role: 'student',
    },
    {
      name: 'Abena Pokuaa',
      email: 'abena.pokuaa@ttu.edu.gh',
      studentId: 'BC/GRD/22/102',
      programme: 'Graphic Design',
      level: 'Level 200',
      passwordHash: studentPassHash,
      role: 'student',
    },
    {
      name: 'Kofi Owusu',
      email: 'kofi.owusu@ttu.edu.gh',
      studentId: 'BC/GRD/22/103',
      programme: 'Graphic Design',
      level: 'Level 200',
      passwordHash: studentPassHash,
      role: 'student',
    },
    {
      name: 'Kojo Antwi',
      email: 'kojo.antwi@ttu.edu.gh',
      studentId: 'BC/CSC/21/201',
      programme: 'Computer Science',
      level: 'Level 300',
      passwordHash: studentPassHash,
      role: 'student',
    },
    {
      name: 'Ama Serwaa',
      email: 'ama.serwaa@ttu.edu.gh',
      studentId: 'BC/CSC/21/202',
      programme: 'Computer Science',
      level: 'Level 300',
      passwordHash: studentPassHash,
      role: 'student',
    },
    {
      name: 'Yaw Boateng',
      email: 'yaw.boateng@ttu.edu.gh',
      studentId: 'BC/EET/22/301',
      programme: 'Electrical Engineering',
      level: 'Level 200',
      passwordHash: studentPassHash,
      role: 'student',
    },
  ];

  const students: any[] = [];
  for (const s of studentsData) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        studentId: s.studentId,
        programme: s.programme,
        level: s.level,
        passwordHash: s.passwordHash,
        role: 'student',
      },
      create: s,
    });
    students.push(student);
    console.log(`✓ Student seeded: ${student.name} (${student.studentId})`);
  }

  // 5. Auto-Enrollment
  for (const student of students) {
    const matchingCourses = courses.filter(
      (c) => c.programme === student.programme && c.level === student.level
    );
    for (const course of matchingCourses) {
      await prisma.enrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id,
          },
        },
        update: {},
        create: {
          studentId: student.id,
          courseId: course.id,
        },
      });
    }
  }

  console.log('✅ TTU Database seeding complete. Ready for live logins!');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
