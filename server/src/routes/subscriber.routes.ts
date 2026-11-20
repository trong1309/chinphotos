import { Router } from 'express';
import { subscribe, getSubscribers } from '../controllers/subscriber.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.post('/', subscribe);
router.get('/', authenticate, requireRole('admin'), getSubscribers);

export default router;
