import { Router } from 'express';
import authRoutes from './auth.routes';
import settingsRoutes from './settings.routes';
import categoryRoutes from './category.routes';
import galleryRoutes from './gallery.routes';
import imageRoutes from './image.routes';
import postRoutes from './post.routes';
import serviceRoutes from './service.routes';
import productRoutes from './product.routes';
import inquiryRoutes from './inquiry.routes';
import subscriberRoutes from './subscriber.routes';
import analyticsRoutes from './analytics.routes';
import locationRoutes from './location.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/categories', categoryRoutes);
router.use('/galleries', galleryRoutes);
router.use('/images', imageRoutes);
router.use('/posts', postRoutes);
router.use('/services', serviceRoutes);
router.use('/products', productRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/locations', locationRoutes);

export default router;
