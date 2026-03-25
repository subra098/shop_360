import express from 'express';
import { getKhataTransactions, createKhataTransaction, getCustomerKhataBalance, updateKhataTransaction, deleteKhataTransaction } from '../controllers/khata.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getKhataTransactions);
router.post('/', createKhataTransaction);
router.put('/:id', updateKhataTransaction);
router.delete('/:id', deleteKhataTransaction);
router.get('/balance/:customerId', getCustomerKhataBalance);

export default router;
