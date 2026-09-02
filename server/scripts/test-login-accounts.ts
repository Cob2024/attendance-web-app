import bcrypt from 'bcryptjs';
import { prisma } from '../src/db.js';

async function testLogins() {
  console.log('🧪 Testing authentication for all default accounts...\n');

  const testAccounts = [
    { email: 'admin@ttu.edu.gh', password: 'admin123', expectedRole: 'admin' },
    { email: 'frank.odoom@ttu.edu.gh', password: 'lecturer123', expectedRole: 'lecturer' },
    { email: 'kwabena.mensah@ttu.edu.gh', password: 'student123', expectedRole: 'student' },
  ];

  let allPassed = true;

  for (const account of testAccounts) {
    const user = await prisma.user.findFirst({
      where: { email: account.email.trim().toLowerCase(), role: account.expectedRole },
    });

    if (!user) {
      console.error(`❌ User NOT FOUND for: ${account.email} (Role: ${account.expectedRole})`);
      allPassed = false;
      continue;
    }

    const passwordMatch = await bcrypt.compare(account.password, user.passwordHash);
    if (!passwordMatch) {
      console.error(`❌ Password MISMATCH for: ${account.email}`);
      allPassed = false;
      continue;
    }

    console.log(`✅ SUCCESS: ${account.email} | Role: ${user.role} | Name: ${user.name}`);
  }

  if (allPassed) {
    console.log('\n🎉 ALL 3 DEFAULT INSTITUTIONAL ACCOUNTS ARE FULLY VALIDATED AND WORKING IN THE DATABASE!');
  } else {
    console.error('\n⚠️ Some accounts failed validation.');
  }

  await prisma.$disconnect();
}

testLogins().catch(console.error);
