import { Request, Response } from 'express';
import { z } from 'zod';
import Product from '../models/product.model';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';
import { generateUniqueSlug } from '../utils/slugify';
import { getPaginationOptions, buildPaginatedResponse } from '../utils/pagination';

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().optional(),
  type: z.enum(['print', 'photobook', 'preset', 'gear']),
  price: z.number().min(0, 'Price must be positive'),
  inventory: z.number().int().min(0).default(0),
  linkType: z.enum(['internal', 'external']).default('internal'),
  externalUrl: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

const updateProductSchema = createProductSchema.partial();

export const getProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { type, isActive, search } = req.query;
    const pagination = getPaginationOptions(req, 20);

    const filter: Record<string, unknown> = {};

    if (typeof type === 'string' && ['print', 'photobook', 'preset', 'gear'].includes(type)) {
      filter['type'] = type;
    }

    if (typeof isActive === 'string') {
      filter['isActive'] = isActive === 'true';
    } else {
      // If user is not admin, only show active products
      const isAdmin = Boolean(req.user && req.user.role === 'admin');
      if (!isAdmin) {
        filter['isActive'] = true;
      }
    }

    if (typeof search === 'string' && search.trim()) {
      filter['name'] = { $regex: search.trim(), $options: 'i' };
    }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: buildPaginatedResponse(items, total, pagination),
      message: 'Products retrieved successfully',
    });
  },
);

export const getProductByIdOrSlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const isObjectId = id && /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };

    const product = await Product.findOne(query);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product retrieved successfully',
    });
  },
);

export const createProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = createProductSchema.parse(req.body);

    if (body.linkType === 'external' && !body.externalUrl) {
      throw new AppError('External URL is required when linkType is external', 400);
    }

    const slug = body.slug
      ? await generateUniqueSlug(Product, body.slug)
      : await generateUniqueSlug(Product, body.name);

    const product = await Product.create({
      ...body,
      slug,
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const body = updateProductSchema.parse(req.body);

    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (body.slug && body.slug !== product.slug) {
      body.slug = await generateUniqueSlug(Product, body.slug, id);
    } else if (body.name && body.name !== product.name && !body.slug) {
      body.slug = await generateUniqueSlug(Product, body.name, id);
    }

    Object.assign(product, body);
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: 'Product deleted successfully',
    });
  },
);
