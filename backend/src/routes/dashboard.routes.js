import express from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getDashboardSummary);

export default router;
