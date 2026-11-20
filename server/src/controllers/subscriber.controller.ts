import { Request, Response } from 'express';
import { z } from 'zod';
import Subscriber from '../models/subscriber.model';
import asyncHandler from '../utils/asyncHandler';
import { getPaginationOptions, buildPaginatedResponse } from '../utils/pagination';

const subscriberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const subscribe = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = subscriberSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await Subscriber.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(200).json({
        success: true,
        data: existing,
        message: 'You are already subscribed to our newsletter!',
      });
      return;
    }

    try {
      const subscriber = await Subscriber.create({ email: normalizedEmail });

      res.status(201).json({
        success: true,
        data: subscriber,
        message: 'Thank you for subscribing to our newsletter!',
      });
    } catch (err: unknown) {
      if ((err as { code?: number })?.code === 11000) {
        res.status(200).json({
          success: true,
          data: null,
          message: 'You are already subscribed to our newsletter!',
        });
        return;
      }
      throw err;
    }
  },
);

export const getSubscribers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const pagination = getPaginationOptions(req, 50);

    const [items, total] = await Promise.all([
      Subscriber.find()
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Subscriber.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: buildPaginatedResponse(items, total, pagination),
      message: 'Subscribers retrieved successfully',
    });
  },
);
