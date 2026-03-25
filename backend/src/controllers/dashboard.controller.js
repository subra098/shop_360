import prisma from '../config/db.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      totalExpensesData,
      totalSalesData,
      todaySalesData
    ] = await Promise.all([
      prisma.product.count(),
      prisma.customer.count(),
      prisma.order.count(),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.order.aggregate({ _sum: { finalAmount: true } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { finalAmount: true }
      })
    ]);

    res.json({
      totalProducts,
      totalCustomers,
      totalOrders,
      totalExpenses: totalExpensesData._sum.amount || 0,
      totalSales: totalSalesData._sum.finalAmount || 0,
      todaySales: todaySalesData._sum.finalAmount || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
