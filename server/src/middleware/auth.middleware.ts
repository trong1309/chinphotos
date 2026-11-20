import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import User, { IUser } from '../models/user.model';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';

interface JwtPayload {
  id: string;
  role: string;
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined = undefined;

    // Check cookie first (primary auth mechanism in this architecture)
    if (req.cookies && req.cookies['token']) {
      token = req.cookies['token'];
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError('The user belonging to this token no longer exists.', 401);
      }

      req.user = user as IUser;
      next();
    } catch {
      throw new AppError('Invalid or expired authentication token. Please log in again.', 401);
    }
  },
);

export const requireRole = (role: 'admin') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      throw new AppError('You do not have permission to perform this action.', 403);
    }
    next();
  };
};

export default authenticate;
