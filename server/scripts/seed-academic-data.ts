import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive TTU academic database seeding...\n');

  // 1. Passwords
  const adminPassHash = await bcrypt.hash('admin123', 12);
  const lecturerPassHash = await bcrypt.hash('lecturer123', 12);
  const studentPassHash = await bcrypt.hash('student123', 12);

  // 2. Admin User
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

  // 3. Lecturers
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

  // 4. Courses
  const coursesData = [
    {
      courseName: 'UI/UX Design Principles',
      courseCode: 'GRD 201',
      programme: 'Graphic Design',
      level: 'Level 200',
      semester: 'Second Semester',
      lecturerId: lecturers[0].id, // Dr. Frank Odoom
    },
    {
      courseName: 'Digital Illustration & Typography',
      courseCode: 'GRD 202',
      programme: 'Graphic Design',
      level: 'Level 200',
      semester: 'Second Semester',
      lecturerId: lecturers[0].id, // Dr. Frank Odoom
    },
    {
      courseName: 'Database Systems & Architecture',
      courseCode: 'CSC 301',
      programme: 'Computer Science',
      level: 'Level 300',
      semester: 'Second Semester',
      lecturerId: lecturers[1].id, // Prof. Emmanuel Mensah
    },
    {
      courseName: 'Mobile Application Development',
      courseCode: 'CSC 302',
      programme: 'Computer Science',
      level: 'Level 300',
      semester: 'Second Semester',
      lecturerId: lecturers[1].id, // Prof. Emmanuel Mensah
    },
    {
      courseName: 'Circuit Theory & Electronics',
      courseCode: 'EET 201',
      programme: 'Electrical Engineering',
      level: 'Level 200',
      semester: 'Second Semester',
      lecturerId: lecturers[2].id, // Dr. Sarah Boateng
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

  // 5. Students
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
    console.log(`✓ Student seeded: ${student.name} (${student.studentId} - ${student.programme})`);
  }

  // 6. Auto-Enrollment
  console.log('\n🔗 Auto-enrolling students into matching courses...');
  for (const student of students) {
    const matchingCourses = courses.filter(
      c => c.programme === student.programme && c.level === student.level
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
      console.log(`  ➔ Enrolled ${student.name} into ${course.courseCode}`);
    }
  }

  // 7. Seed Past Attendance Records for Analytics
  console.log('\n📊 Seeding historical attendance sessions & records for rich analytics...');
  const today = new Date();
  const pastDates: string[] = [];
  for (let i = 6; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 3);
    pastDates.push(d.toISOString().split('T')[0]);
  }

  const sessionsToCreate: any[] = [];
  const recordsToCreate: any[] = [];

  for (const course of courses) {
    const enrolledStudents = students.filter(
      s => s.programme === course.programme && s.level === course.level
    );

    for (let i = 0; i < pastDates.length; i++) {
      const dateStr = pastDates[i];
      const sessionId = `seed_sess_${course.courseCode.replace(/\s+/g, '_')}_${i}`;

      sessionsToCreate.push({
        id: sessionId,
        courseId: course.id,
        lecturerId: course.lecturerId,
        otpCode: `${100000 + Math.floor(Math.random() * 900000)}`,
        latitude: 4.8967,
        longitude: -1.7554,
        radiusMeters: 50,
        isActive: false,
        durationMinutes: 45,
        createdAt: new Date(`${dateStr}T09:00:00Z`),
        endedAt: new Date(`${dateStr}T09:45:00Z`),
      });

      for (let sIdx = 0; sIdx < enrolledStudents.length; sIdx++) {
        const student = enrolledStudents[sIdx];
        const isPresent = sIdx === 2 ? (i % 2 === 0) : true;

        if (isPresent) {
          recordsToCreate.push({
            studentId: student.id,
            courseId: course.id,
            sessionId: sessionId,
            status: 'present',
            date: dateStr,
            latitude: 4.8967 + (Math.random() - 0.5) * 0.0001,
            longitude: -1.7554 + (Math.random() - 0.5) * 0.0001,
            distance: Math.floor(Math.random() * 25) + 5,
            timestamp: new Date(`${dateStr}T09:05:00Z`),
          });
        }
      }
    }
  }

  console.log(`  Inserting ${sessionsToCreate.length} sessions...`);
  await prisma.attendanceSession.createMany({
    data: sessionsToCreate,
    skipDuplicates: true,
  });

  console.log(`  Inserting ${recordsToCreate.length} attendance records...`);
  await prisma.attendanceRecord.createMany({
    data: recordsToCreate,
    skipDuplicates: true,
  });

  console.log('\n🎉 Academic database seeding successfully completed!');
}

main()
  .catch(e => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
