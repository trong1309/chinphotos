import { Router } from 'express';
import {
  getLocations,
  getLocationBySlug,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/location.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getLocations);
router.get('/:slug', getLocationBySlug);

// Admin routes
router.post('/', authenticate, requireRole('admin'), createLocation);
router.put('/:id', authenticate, requireRole('admin'), updateLocation);
router.delete('/:id', authenticate, requireRole('admin'), deleteLocation);

export default router;
