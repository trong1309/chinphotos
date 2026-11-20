import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import env from '../config/env';
import User from '../models/user.model';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  avatar: z.string().url('Avatar must be a valid URL').or(z.literal('')).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

const COOKIE_NAME = 'token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const isProd = env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
};

const sendTokenCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: SEVEN_DAYS_MS,
  });
};

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' },
  );

  sendTokenCookie(res, token);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    },
    message: 'Logged in successfully',
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie(COOKIE_NAME, cookieOptions);

  res.status(200).json({
    success: true,
    data: null,
    message: 'Logged out successfully',
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    },
    message: 'Current user profile retrieved',
  });
});

export const updateMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  const validatedData = updateProfileSchema.parse(req.body);

  if (validatedData.name !== undefined) user.name = validatedData.name;
  if (validatedData.avatar !== undefined) user.avatar = validatedData.avatar;

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    },
    message: 'Profile updated successfully',
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  // Fetch passwordHash since it is hidden by default
  const userWithPassword = await User.findById(user._id).select('+passwordHash');
  if (!userWithPassword) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await userWithPassword.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 400);
  }

  const salt = await bcrypt.genSalt(12);
  userWithPassword.passwordHash = await bcrypt.hash(newPassword, salt);
  await userWithPassword.save();

  res.status(200).json({
    success: true,
    data: null,
    message: 'Password changed successfully',
  });
});
