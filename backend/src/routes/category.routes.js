import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/category.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getCategories);
router.post('/', protect, createCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
