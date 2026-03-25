import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('--- Current Users ---');
    users.forEach(u => {
      console.log(`- ${u.name} | Email: ${u.email} | Role: ${u.role}`);
    });
  } catch (err) {
    console.error('Database Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
