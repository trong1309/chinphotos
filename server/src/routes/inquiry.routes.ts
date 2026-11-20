import { Router } from 'express';
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry,
  bulkInquiryActions,
} from '../controllers/inquiry.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { inquiryRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Public: Submit inquiry (protected by 5 requests/hour per IP rate limit)
router.post('/', inquiryRateLimiter, createInquiry);

// Admin routes
router.get('/', authenticate, requireRole('admin'), getInquiries);
router.patch('/bulk', authenticate, requireRole('admin'), bulkInquiryActions);
router.get('/:id', authenticate, requireRole('admin'), getInquiryById);
router.patch('/:id', authenticate, requireRole('admin'), updateInquiry);
router.delete('/:id', authenticate, requireRole('admin'), deleteInquiry);

export default router;
