import { Router } from 'express';
import {
  login,
  logout,
  getMe,
  updateMe,
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { loginRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/login', loginRateLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.patch('/password', authenticate, changePassword);

export default router;
