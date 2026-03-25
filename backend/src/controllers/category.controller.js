import prisma from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { products: { select: { id: true } } }
    });
    // Add product count to each category
    const result = categories.map(c => ({
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
      productCount: c.products.length
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ error: 'Category already exists' });

    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    // Check if any products use this category
    const products = await prisma.product.findMany({
      where: { categoryId: Number(req.params.id) }
    });
    if (products.length > 0) {
      return res.status(400).json({ error: 'Cannot delete category with existing products' });
    }

    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
