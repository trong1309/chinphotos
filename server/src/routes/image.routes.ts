import { Router } from 'express';
import {
  getImages,
  uploadImages,
  updateImage,
  deleteImage,
  reorderImages,
  bulkImageActions,
} from '../controllers/image.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = Router();

router.get('/', getImages);

// Admin routes
router.post(
  '/upload',
  authenticate,
  requireRole('admin'),
  upload.array('images', 20),
  uploadImages,
);
router.patch('/reorder', authenticate, requireRole('admin'), reorderImages);
router.patch('/bulk', authenticate, requireRole('admin'), bulkImageActions);
router.put('/:id', authenticate, requireRole('admin'), updateImage);
router.delete('/:id', authenticate, requireRole('admin'), deleteImage);

export default router;
