import { Router } from 'express';
import {
  recordPageView,
  getAnalyticsSummary,
} from '../controllers/analytics.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { pageviewRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/pageview', pageviewRateLimiter, recordPageView);
router.get('/summary', authenticate, requireRole('admin'), getAnalyticsSummary);

export default router;
