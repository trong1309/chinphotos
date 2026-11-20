import { Router } from 'express';
import {
  getCategories,
  getCategoryByIdOrSlug,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../controllers/category.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryByIdOrSlug);

// Admin routes
router.post('/', authenticate, requireRole('admin'), createCategory);
router.patch('/reorder', authenticate, requireRole('admin'), reorderCategories);
router.put('/:id', authenticate, requireRole('admin'), updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), deleteCategory);

export default router;
