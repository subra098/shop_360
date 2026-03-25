import prisma from '../config/db.js';

export const getShopOwners = async (req, res) => {
  try {
    const owners = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(owners);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
