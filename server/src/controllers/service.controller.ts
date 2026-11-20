import { Request, Response } from 'express';
import { z } from 'zod';
import Service from '../models/service.model';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';
import { generateUniqueSlug } from '../utils/slugify';

const faqSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

const createServiceSchema = z.object({
  title: z.string().min(1, 'Service title is required'),
  slug: z.string().optional(),
  summary: z.string().optional(),
  heroImage: z.string().optional(),
  content: z.string().optional(),
  priceFrom: z.number().optional(),
  inclusions: z.array(z.string()).optional(),
  faqs: z.array(faqSchema).optional(),
  order: z.number().optional(),
});

const updateServiceSchema = createServiceSchema.partial();

const reorderServicesSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    }),
  ),
});

export const reorderServices = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { items } = reorderServicesSchema.parse(req.body);

    const ops = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    if (ops.length > 0) {
      await Service.bulkWrite(ops);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: 'Services reordered successfully',
    });
  },
);

export const getServices = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const services = await Service.find().sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: services,
      message: 'Services retrieved successfully',
    });
  },
);

export const getServiceBySlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const isObjectId = slug && /^[0-9a-fA-F]{24}$/.test(slug);
    const query = isObjectId ? { $or: [{ _id: slug }, { slug }] } : { slug };

    const service = await Service.findOne(query);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    res.status(200).json({
      success: true,
      data: service,
      message: 'Service retrieved successfully',
    });
  },
);

export const createService = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = createServiceSchema.parse(req.body);

    const slug = body.slug
      ? await generateUniqueSlug(Service, body.slug)
      : await generateUniqueSlug(Service, body.title);

    const service = await Service.create({
      ...body,
      slug,
    });

    res.status(201).json({
      success: true,
      data: service,
      message: 'Service created successfully',
    });
  },
);

export const updateService = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const body = updateServiceSchema.parse(req.body);

    const service = await Service.findById(id);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    if (body.slug && body.slug !== service.slug) {
      body.slug = await generateUniqueSlug(Service, body.slug, id);
    } else if (body.title && body.title !== service.title && !body.slug) {
      body.slug = await generateUniqueSlug(Service, body.title, id);
    }

    Object.assign(service, body);
    await service.save();

    res.status(200).json({
      success: true,
      data: service,
      message: 'Service updated successfully',
    });
  },
);

export const deleteService = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: 'Service deleted successfully',
    });
  },
);
