import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';

import productRoutes from './routes/product.routes.js';

import customerRoutes from './routes/customer.routes.js';
import orderRoutes from './routes/order.routes.js';
import khataRoutes from './routes/khata.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import superadminRoutes from './routes/superadmin.routes.js';
import categoryRoutes from './routes/category.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import settingRoutes from './routes/setting.routes.js';

import bcrypt from 'bcryptjs';
import prisma from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/khata', khataRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/settings', settingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dukaan360 API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

const seedSuperAdmin = async () => {
  try {
    const existing = await prisma.user.findFirst({ where: { email: 'superadmin@gmail.com' } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('super', 10);
      await prisma.user.create({
        data: {
          name: 'Super Admin',
          phone: '0000000000',
          email: 'superadmin@gmail.com',
          password: hashedPassword,
          role: 'SUPERADMIN'
        }
      });
      console.log('Super Admin user seeded.');
    }
  } catch (error) {
    console.error('Failed to seed Super Admin:', error);
  }
};

seedSuperAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
