import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function checkItems() {
  try {
    const products = await prisma.product.findMany();
    console.log('--- Current Products in Shop ---');
    if (products.length === 0) {
      console.log('The shop is currently empty. No products found.');
    } else {
      products.forEach(p => {
        console.log(`- ${p.name} | Price: ₹${p.price} | Stock: ${p.quantity}`);
      });
    }
  } catch (err) {
    console.error('Database Connection Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkItems();
