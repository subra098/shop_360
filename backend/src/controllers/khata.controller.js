import prisma from '../config/db.js';

export const getKhataTransactions = async (req, res) => {
  try {
    const transactions = await prisma.khataTransaction.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createKhataTransaction = async (req, res) => {
  try {
    const { customerId, amount, type, notes } = req.body;
    // type: CREDIT_GIVEN or PAYMENT_RECEIVED
    const transaction = await prisma.khataTransaction.create({
      data: {
        customerId: Number(customerId),
        amount: Number(amount),
        type,
        notes,
      },
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCustomerKhataBalance = async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);
    const transactions = await prisma.khataTransaction.findMany({
      where: { customerId }
    });

    let balance = 0;
    transactions.forEach(t => {
      if (t.type === 'CREDIT_GIVEN') balance = balance + t.amount;
      if (t.type === 'PAYMENT_RECEIVED') balance = balance - t.amount;
    });

    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateKhataTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, amount, type, notes } = req.body;
    const transaction = await prisma.khataTransaction.update({
      where: { id: Number(id) },
      data: {
        customerId: Number(customerId),
        amount: Number(amount),
        type,
        notes,
      },
    });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteKhataTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.khataTransaction.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
