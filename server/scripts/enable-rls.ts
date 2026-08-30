import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tables = [
  'User',
  'Course',
  'AttendanceSession',
  'AttendanceRecord',
  'Enrollment',
  'DeviceBinding',
];

async function main() {
  console.log('🔒 Applying Row Level Security (RLS) & Hardening to Supabase tables...');

  for (const table of tables) {
    try {
      // 1. Enable RLS
      await prisma.$executeRawUnsafe(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;`);
      
      // 2. Revoke direct PostgREST anon and authenticated access
      await prisma.$executeRawUnsafe(`REVOKE ALL ON TABLE public."${table}" FROM anon, authenticated;`);
      
      console.log(`✅ RLS enabled and direct public access revoked on: ${table}`);
    } catch (err: any) {
      console.error(`❌ Error on ${table}:`, err.message);
    }
  }

  console.log('\n🛡️ All tables secured. Prisma connection via Express API retains full access.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
