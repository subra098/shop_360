import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Attempting to create product...');
    const product = await prisma.product.create({
      data: {
        name: 'test product',
        price: 10.5,
        quantity: 100,
        categoryId: null,
        minStockLimit: 5
      }
    });
    console.log('Success:', product);
  } catch (err) {
    console.error('Error creating product:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
