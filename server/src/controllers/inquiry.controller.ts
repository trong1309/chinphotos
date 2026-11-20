import { Request, Response } from 'express';
import { z } from 'zod';
import Inquiry from '../models/inquiry.model';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';
import { getPaginationOptions, buildPaginatedResponse } from '../utils/pagination';
import {
  sendInquiryNotificationToOwner,
  sendInquiryConfirmationToClient,
} from '../services/mail.service';

const createInquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  serviceType: z.string().optional(),
  eventDate: z.string().or(z.date()).optional(),
  location: z.string().optional(),
  adultsCount: z.number().or(z.string().regex(/^\d+$/).transform(Number)).optional(),
  childrenInfo: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters long'),
  source: z.string().optional(),
  lang: z.enum(['vi', 'en']).optional().default('vi'),
  // Honeypot field (should remain empty for legitimate human submissions)
  website_url_hp: z.string().optional(),
});

const updateInquirySchema = z.object({
  status: z.enum(['new', 'read', 'replied', 'archived']).optional(),
  internalNote: z.string().optional(),
});

const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one inquiry ID is required'),
  action: z.enum(['read', 'replied', 'archived', 'delete']),
});

export const createInquiry = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = createInquirySchema.parse(req.body);

    // Honeypot spam check: if honeypot field is filled, silently succeed without storing
    if (body.website_url_hp && body.website_url_hp.trim() !== '') {
      console.warn('[inquiry] Honeypot triggered, discarded spam submission.');
      res.status(201).json({
        success: true,
        data: null,
        message: 'Your inquiry has been received.',
      });
      return;
    }

    delete body.website_url_hp;
    const inquiryData = body;

    const parsedEventDate = inquiryData.eventDate ? new Date(inquiryData.eventDate) : undefined;

    const inquiry = await Inquiry.create({
      ...inquiryData,
      eventDate: parsedEventDate,
      status: 'new',
    });

    // Send emails asynchronously (doesn't block the HTTP response)
    Promise.all([
      sendInquiryNotificationToOwner({
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        serviceType: inquiry.serviceType,
        eventDate: inquiry.eventDate,
        location: inquiry.location,
        message: inquiry.message,
      }),
      sendInquiryConfirmationToClient({
        name: inquiry.name,
        email: inquiry.email,
      }),
    ]).catch((err) => {
      console.error('[inquiry] Email dispatch failed:', err);
    });

    res.status(201).json({
      success: true,
      data: inquiry,
      message: 'Thank you! Your message has been sent successfully.',
    });
  },
);

export const getInquiries = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { search, status, serviceType, from, to, sort } = req.query;
    const pagination = getPaginationOptions(req, 20);

    const filter: Record<string, unknown> = {};

    if (typeof status === 'string' && ['new', 'read', 'replied', 'archived'].includes(status)) {
      filter['status'] = status;
    }

    if (typeof serviceType === 'string' && serviceType.trim()) {
      filter['serviceType'] = serviceType.trim();
    }

    if (typeof search === 'string' && search.trim()) {
      filter['$or'] = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { message: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (typeof from === 'string' && from.trim()) {
        dateFilter['$gte'] = new Date(from.trim());
      }
      if (typeof to === 'string' && to.trim()) {
        dateFilter['$lte'] = new Date(to.trim());
      }
      filter['createdAt'] = dateFilter;
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const [items, total] = await Promise.all([
      Inquiry.find(filter)
        .sort(sortOption)
        .skip(pagination.skip)
        .limit(pagination.limit),
      Inquiry.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: buildPaginatedResponse(items, total, pagination),
      message: 'Inquiries retrieved successfully',
    });
  },
);

export const getInquiryById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      throw new AppError('Inquiry not found', 404);
    }

    // Auto mark as read if it was new
    if (inquiry.status === 'new') {
      inquiry.status = 'read';
      await inquiry.save();
    }

    res.status(200).json({
      success: true,
      data: inquiry,
      message: 'Inquiry details retrieved successfully',
    });
  },
);

export const updateInquiry = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const body = updateInquirySchema.parse(req.body);

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      throw new AppError('Inquiry not found', 404);
    }

    Object.assign(inquiry, body);
    await inquiry.save();

    res.status(200).json({
      success: true,
      data: inquiry,
      message: 'Inquiry updated successfully',
    });
  },
);

export const bulkInquiryActions = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { ids, action } = bulkActionSchema.parse(req.body);

    if (action === 'delete') {
      await Inquiry.deleteMany({ _id: { $in: ids } });
    } else {
      await Inquiry.updateMany({ _id: { $in: ids } }, { $set: { status: action } });
    }

    res.status(200).json({
      success: true,
      data: null,
      message: `Action '${action}' applied to ${ids.length} inquiry(ies)`,
    });
  },
);

export const deleteInquiry = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const inquiry = await Inquiry.findByIdAndDelete(id);
    if (!inquiry) {
      throw new AppError('Inquiry not found', 404);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: 'Inquiry deleted successfully',
    });
  },
);
