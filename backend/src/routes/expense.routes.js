import express from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expense.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', adminOnly, deleteExpense);

export default router;
