import express from 'express';
import { getOrders, createOrder } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getOrders);
router.post('/', createOrder);

export default router;
