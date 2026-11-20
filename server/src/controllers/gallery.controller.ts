import { Request, Response } from 'express';
import { z } from 'zod';
import Gallery from '../models/gallery.model';
import Category from '../models/category.model';
import Image from '../models/image.model';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';
import { generateUniqueSlug } from '../utils/slugify';
import { getPaginationOptions, buildPaginatedResponse } from '../utils/pagination';
import { deleteImageFiles } from '../services/image.service';

const vendorSchema = z.object({
  role: z.string().min(1),
  name: z.string().min(1),
  url: z.string().optional(),
});

const createGallerySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  location: z.string().optional(),
  eventDate: z.string().or(z.date()).optional(),
  description: z.string().optional(),
  vendors: z.array(vendorSchema).optional(),
  coverImage: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  isUnlisted: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const updateGallerySchema = createGallerySchema.partial();

export const getGalleries = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { search, category, status, featured, sort } = req.query;
    const pagination = getPaginationOptions(req, 12);

    const filter: Record<string, unknown> = {};

    // Auth check: if user is admin, allow status filter; otherwise force status: 'published' and exclude unlisted
    const isAdmin = Boolean(req.user && req.user.role === 'admin');
    if (!isAdmin) {
      filter['status'] = 'published';
      filter['isUnlisted'] = { $ne: true };
    } else if (typeof status === 'string' && ['draft', 'published'].includes(status)) {
      filter['status'] = status;
    }

    if (typeof featured === 'string') {
      filter['isFeatured'] = featured === 'true';
    }

    if (typeof search === 'string' && search.trim()) {
      filter['$or'] = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (typeof category === 'string' && category.trim()) {
      // Find category by slug or ID
      const catDoc = await Category.findOne({
        $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { slug: category }],
      });
      if (catDoc) {
        filter['category'] = catDoc._id;
      }
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'eventDate') {
      sortOption = { eventDate: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    const [items, total] = await Promise.all([
      Gallery.find(filter)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(pagination.skip)
        .limit(pagination.limit),
      Gallery.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: buildPaginatedResponse(items, total, pagination),
      message: 'Galleries retrieved successfully',
    });
  },
);

export const getGalleryBySlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const isAdmin = Boolean(req.user && req.user.role === 'admin');

    const isObjectId = slug && /^[0-9a-fA-F]{24}$/.test(slug);
    const query = isObjectId ? { $or: [{ _id: slug }, { slug }] } : { slug };

    const gallery = await Gallery.findOne(query).populate('category', 'name slug');

    if (!gallery) {
      throw new AppError('Gallery not found', 404);
    }

    if (!isAdmin && gallery.status === 'draft') {
      throw new AppError('Gallery not found', 404);
    }

    // Get images for this gallery
    const images = await Image.find({ gallery: gallery._id }).sort({ order: 1, createdAt: 1 });

    // Find previous and next galleries for editorial navigation (exclude unlisted and drafts for public)
    const publicFilter = isAdmin ? {} : { status: 'published', isUnlisted: { $ne: true } };
    const [prevGallery, nextGallery] = await Promise.all([
      Gallery.findOne({
        ...publicFilter,
        createdAt: { $lt: gallery.createdAt },
      })
        .sort({ createdAt: -1 })
        .select('title slug coverImage'),
      Gallery.findOne({
        ...publicFilter,
        createdAt: { $gt: gallery.createdAt },
      })
        .sort({ createdAt: 1 })
        .select('title slug coverImage'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        gallery,
        images,
        navigation: {
          prev: prevGallery,
          next: nextGallery,
        },
      },
      message: 'Gallery details retrieved successfully',
    });
  },
);

export const createGallery = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = createGallerySchema.parse(req.body);

    const categoryExists = await Category.findById(body.category);
    if (!categoryExists) {
      throw new AppError('Referenced category does not exist', 400);
    }

    const slug = body.slug
      ? await generateUniqueSlug(Gallery, body.slug)
      : await generateUniqueSlug(Gallery, body.title);

    const gallery = await Gallery.create({
      ...body,
      slug,
    });

    res.status(201).json({
      success: true,
      data: gallery,
      message: 'Gallery created successfully',
    });
  },
);

export const updateGallery = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const body = updateGallerySchema.parse(req.body);

    const gallery = await Gallery.findById(id);
    if (!gallery) {
      throw new AppError('Gallery not found', 404);
    }

    if (body.category) {
      const categoryExists = await Category.findById(body.category);
      if (!categoryExists) {
        throw new AppError('Referenced category does not exist', 400);
      }
    }

    if (body.slug && body.slug !== gallery.slug) {
      body.slug = await generateUniqueSlug(Gallery, body.slug, id);
    } else if (body.title && body.title !== gallery.title && !body.slug) {
      body.slug = await generateUniqueSlug(Gallery, body.title, id);
    }

    Object.assign(gallery, body);
    await gallery.save();

    res.status(200).json({
      success: true,
      data: gallery,
      message: 'Gallery updated successfully',
    });
  },
);

export const deleteGallery = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const gallery = await Gallery.findById(id);
    if (!gallery) {
      throw new AppError('Gallery not found', 404);
    }

    // Find and delete all attached images from disk
    const images = await Image.find({ gallery: id });
    for (const img of images) {
      if (img.storageKey) {
        await deleteImageFiles(img.storageKey);
      }
    }

    await Image.deleteMany({ gallery: id });
    await Gallery.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Gallery and associated images deleted successfully',
    });
  },
);
