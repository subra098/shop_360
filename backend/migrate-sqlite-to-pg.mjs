import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const require = createRequire(import.meta.url);
const initSqlJs = require('sql.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();

async function main() {
  console.log('Loading SQLite database...');
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'prisma', 'dev.db');
  const fileBuffer = readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);

  function all(table) {
    try {
      const stmt = db.prepare(`SELECT * FROM "${table}"`);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    } catch (e) {
      console.warn(`  ⚠ Could not read table "${table}": ${e.message}`);
      return [];
    }
  }

  // --- Users ---
  const users = all('User');
  console.log(`Migrating ${users.length} users...`);
  for (const u of users) {
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: {},
      create: {
        name: u.name,
        phone: u.phone,
        email: u.email || null,
        password: u.password,
        role: u.role || 'STAFF',
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      },
    }).catch(e => console.warn(`  User ${u.phone}: ${e.message}`));
  }

  // --- Products ---
  const products = all('Product');
  console.log(`Migrating ${products.length} products...`);
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: Number(p.id) },
      update: {},
      create: {
        id: Number(p.id),
        name: p.name,
        price: Number(p.price),
        quantity: Number(p.quantity),
        category: p.category || null,
        minStockLimit: Number(p.minStockLimit) || 5,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      },
    }).catch(e => console.warn(`  Product ${p.id}: ${e.message}`));
  }

  // --- Customers ---
  const customers = all('Customer');
  console.log(`Migrating ${customers.length} customers...`);
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: {
        id: Number(c.id),
        name: c.name,
        phone: c.phone,
        address: c.address || null,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
      },
    }).catch(e => console.warn(`  Customer ${c.phone}: ${e.message}`));
  }

  // --- Expenses ---
  const expenses = all('Expense');
  console.log(`Migrating ${expenses.length} expenses...`);
  for (const e of expenses) {
    await prisma.expense.upsert({
      where: { id: Number(e.id) },
      update: {},
      create: {
        id: Number(e.id),
        amount: Number(e.amount),
        category: e.category,
        description: e.description || null,
        date: e.date ? new Date(e.date) : new Date(),
        createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
      },
    }).catch(err => console.warn(`  Expense ${e.id}: ${err.message}`));
  }

  // --- Orders ---
  const orders = all('Order');
  console.log(`Migrating ${orders.length} orders...`);
  for (const o of orders) {
    await prisma.order.upsert({
      where: { id: Number(o.id) },
      update: {},
      create: {
        id: Number(o.id),
        customerId: o.customerId ? Number(o.customerId) : null,
        totalAmount: Number(o.totalAmount),
        discount: Number(o.discount) || 0,
        finalAmount: Number(o.finalAmount),
        paymentMethod: o.paymentMethod || 'CASH',
        status: o.status || 'COMPLETED',
        createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
      },
    }).catch(err => console.warn(`  Order ${o.id}: ${err.message}`));
  }

  // --- OrderItems ---
  const orderItems = all('OrderItem');
  console.log(`Migrating ${orderItems.length} order items...`);
  for (const oi of orderItems) {
    await prisma.orderItem.upsert({
      where: { id: Number(oi.id) },
      update: {},
      create: {
        id: Number(oi.id),
        orderId: Number(oi.orderId),
        productId: Number(oi.productId),
        quantity: Number(oi.quantity),
        price: Number(oi.price),
        createdAt: oi.createdAt ? new Date(oi.createdAt) : new Date(),
      },
    }).catch(err => console.warn(`  OrderItem ${oi.id}: ${err.message}`));
  }

  // --- KhataTransactions ---
  const khatas = all('KhataTransaction');
  console.log(`Migrating ${khatas.length} khata transactions...`);
  for (const k of khatas) {
    await prisma.khataTransaction.upsert({
      where: { id: Number(k.id) },
      update: {},
      create: {
        id: Number(k.id),
        customerId: Number(k.customerId),
        amount: Number(k.amount),
        type: k.type,
        notes: k.notes || null,
        createdAt: k.createdAt ? new Date(k.createdAt) : new Date(),
      },
    }).catch(err => console.warn(`  KhataTransaction ${k.id}: ${err.message}`));
  }

  db.close();
  console.log('\n✅ Migration complete!');
}

main()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
