import { Router } from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductByIdOrSlug);

// Admin routes
router.post('/', authenticate, requireRole('admin'), createProduct);
router.put('/:id', authenticate, requireRole('admin'), updateProduct);
router.delete('/:id', authenticate, requireRole('admin'), deleteProduct);

export default router;
