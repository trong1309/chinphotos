import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import User from '../models/user.model';
import {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/post.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined = undefined;
    if (req.cookies && req.cookies['token']) {
      token = req.cookies['token'];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid token
  }
  next();
};

router.get('/', optionalAuth, getPosts);
router.get('/:slug', optionalAuth, getPostBySlug);

// Admin routes
router.post('/', authenticate, requireRole('admin'), createPost);
router.put('/:id', authenticate, requireRole('admin'), updatePost);
router.delete('/:id', authenticate, requireRole('admin'), deletePost);

export default router;
