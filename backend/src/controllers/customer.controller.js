import prisma from '../config/db.js';

export const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        orders: true,
        transactions: true,
      }
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing) return res.status(400).json({ error: 'Customer with this phone already exists' });
    
    const customer = await prisma.customer.create({
      data: { name, phone, address },
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const customer = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: { name, phone, address },
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
