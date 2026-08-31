import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      studentId: true,
      programme: true,
      level: true,
      createdAt: true
    }
  });

  console.log(`\n=== USERS IN SUPABASE (${users.length} total) ===`);
  console.table(users);

  const courses = await prisma.course.findMany({
    select: { id: true, courseName: true, courseCode: true, programme: true, level: true }
  });
  console.log(`\n=== COURSES IN SUPABASE (${courses.length} total) ===`);
  console.table(courses);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
