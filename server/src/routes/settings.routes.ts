import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate, requireRole('admin'), updateSettings);

export default router;
