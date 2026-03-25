import express from 'express';
import { getSettings, upsertSetting } from '../controllers/setting.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/', protect, upsertSetting);

export default router;
