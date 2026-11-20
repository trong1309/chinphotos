import { Router } from 'express';
import {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  reorderServices,
} from '../controllers/service.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getServices);
router.get('/:slug', getServiceBySlug);

// Admin routes
router.post('/', authenticate, requireRole('admin'), createService);
router.patch('/reorder', authenticate, requireRole('admin'), reorderServices);
router.put('/:id', authenticate, requireRole('admin'), updateService);
router.delete('/:id', authenticate, requireRole('admin'), deleteService);

export default router;
