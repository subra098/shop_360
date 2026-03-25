import prisma from '../config/db.js';

export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { customerId, items, discount, paymentMethod } = req.body;
    // items: [{ productId, quantity, price }]
    
    // Calculate total
    let totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let finalAmount = totalAmount - (discount || 0);

    const order = await prisma.$transaction(async (tx) => {
      let actualCustomerId = customerId || null;

      // Handle on-the-fly customer creation
      if (!actualCustomerId && (req.body.customerName || req.body.customerPhone)) {
        const { customerName, customerPhone } = req.body;
        
        let customer = null;
        if (customerPhone) {
          customer = await tx.customer.findFirst({ where: { phone: customerPhone } });
        }

        if (!customer) {
          customer = await tx.customer.create({
            data: {
              name: customerName || 'Walk-in Customer',
              phone: customerPhone || ''
            }
          });
        }
        actualCustomerId = customer.id;
      }

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerId: actualCustomerId,
          totalAmount,
          discount: discount || 0,
          finalAmount,
          paymentMethod: paymentMethod || 'CASH',
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: { items: true, customer: true }
      });

      // Update inventory
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
      }

      // If KHATA, add a Khata transaction
      if (paymentMethod === 'KHATA' && actualCustomerId) {
        await tx.khataTransaction.create({
          data: {
            customerId: actualCustomerId,
            amount: finalAmount,
            type: 'CREDIT_GIVEN',
            notes: `Order #${newOrder.id}`
          }
        });
      }

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
