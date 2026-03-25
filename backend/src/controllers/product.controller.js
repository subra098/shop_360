import prisma from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, categoryId, minStockLimit } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        price,
        quantity,
        categoryId: categoryId ? Number(categoryId) : null,
        minStockLimit,
      },
      include: { category: true },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, price, quantity, categoryId, minStockLimit } = req.body;
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        price,
        quantity,
        categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : undefined,
        minStockLimit,
      },
      include: { category: true },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
