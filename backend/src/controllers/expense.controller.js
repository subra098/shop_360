import prisma from '../config/db.js';

export const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const expense = await prisma.expense.create({
      data: {
        amount: Number(amount),
        category,
        description,
        date: date ? new Date(date) : new Date()
      },
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    await prisma.expense.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
