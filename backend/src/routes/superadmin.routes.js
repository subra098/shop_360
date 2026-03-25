import express from 'express';
import { getShopOwners } from '../controllers/superadmin.controller.js';
import { protect, superAdminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/owners', protect, superAdminOnly, getShopOwners);

export default router;
