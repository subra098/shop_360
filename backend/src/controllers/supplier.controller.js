import prisma from '../config/db.js';

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Supplier name is required' });

    if (phone) {
      const existing = await prisma.supplier.findUnique({ where: { phone } });
      if (existing) return res.status(400).json({ error: 'Supplier with this phone already exists' });
    }

    const supplier = await prisma.supplier.create({
      data: { name, phone, email, address },
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: Number(req.params.id) },
      data: { name, phone, email, address },
    });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    await prisma.supplier.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Supplier removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
