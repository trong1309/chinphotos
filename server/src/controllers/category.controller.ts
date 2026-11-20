import { Request, Response } from 'express';
import { z } from 'zod';
import Category from '../models/category.model';
import Gallery from '../models/gallery.model';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';
import { generateUniqueSlug } from '../utils/slugify';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  order: z.number().optional(),
  isVisible: z.boolean().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  order: z.number().optional(),
  isVisible: z.boolean().optional(),
});

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    }),
  ),
});

export const getCategories = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const isPublic = req.query['all'] !== 'true';
    const filter: Record<string, unknown> = {};

    if (isPublic) {
      filter['isVisible'] = true;
    }

    const categories = await Category.find(filter).sort({ order: 1, createdAt: -1 });

    // Compute galleryCount for each category
    const categoryIds = categories.map((c) => c._id);
    const galleryCountAgg = await Gallery.aggregate([
      {
        $match: {
          category: { $in: categoryIds },
          ...(isPublic ? { status: 'published', isUnlisted: { $ne: true } } : {}),
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    galleryCountAgg.forEach((item) => {
      countMap.set(item._id.toString(), item.count);
    });

    const data = categories.map((cat) => ({
      id: cat._id,
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      coverImage: cat.coverImage,
      order: cat.order,
      isVisible: cat.isVisible,
      galleryCount: countMap.get(cat._id.toString()) || 0,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data,
      message: 'Categories retrieved successfully',
    });
  },
);

export const getCategoryByIdOrSlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const isObjectId = id && /^[0-9a-fA-F]{24}$/.test(id);

    const query = isObjectId ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
    const category = await Category.findOne(query);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category retrieved successfully',
    });
  },
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = createCategorySchema.parse(req.body);

    const slug = body.slug
      ? await generateUniqueSlug(Category, body.slug)
      : await generateUniqueSlug(Category, body.name);

    const category = await Category.create({
      ...body,
      slug,
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const body = updateCategorySchema.parse(req.body);

    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (body.slug && body.slug !== category.slug) {
      body.slug = await generateUniqueSlug(Category, body.slug, id);
    } else if (body.name && body.name !== category.name && !body.slug) {
      body.slug = await generateUniqueSlug(Category, body.name, id);
    }

    Object.assign(category, body);
    await category.save();

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if category has associated galleries
    const galleryCount = await Gallery.countDocuments({ category: id });
    if (galleryCount > 0) {
      throw new AppError(
        `Cannot delete category "${category.name}" because it still has ${galleryCount} associated gallery(ies). Please reassign or delete them first.`,
        400,
      );
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Category deleted successfully',
    });
  },
);

export const reorderCategories = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { items } = reorderSchema.parse(req.body);

    const updateOperations = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await Category.bulkWrite(updateOperations);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Categories reordered successfully',
    });
  },
);
