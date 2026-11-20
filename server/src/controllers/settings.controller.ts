import { Request, Response } from 'express';
import Settings from '../models/settings.model';
import asyncHandler from '../utils/asyncHandler';

export const getSettings = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings retrieved successfully',
    });
  },
);

export const updateSettings = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings updated successfully',
    });
  },
);
