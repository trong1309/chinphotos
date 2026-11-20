import { Request, Response } from 'express';
import { z } from 'zod';
import Post from '../models/post.model';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';
import { generateUniqueSlug } from '../utils/slugify';
import { getPaginationOptions, buildPaginatedResponse } from '../utils/pagination';

const createPostSchema = z.object({
  title: z.string().min(1, 'Post title is required'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  publishedAt: z.string().or(z.date()).optional(),
});

const updatePostSchema = createPostSchema.partial();

export const getPosts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { search, category, tag, status } = req.query;
    const pagination = getPaginationOptions(req, 10);

    const filter: Record<string, unknown> = {};
    const isAdmin = Boolean(req.user && req.user.role === 'admin');

    if (!isAdmin) {
      filter['status'] = 'published';
    } else if (typeof status === 'string' && ['draft', 'published'].includes(status)) {
      filter['status'] = status;
    }

    if (typeof search === 'string' && search.trim()) {
      filter['$or'] = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { excerpt: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (typeof category === 'string' && category.trim()) {
      filter['category'] = category.trim();
    }

    if (typeof tag === 'string' && tag.trim()) {
      filter['tags'] = tag.trim();
    }

    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: buildPaginatedResponse(items, total, pagination),
      message: 'Posts retrieved successfully',
    });
  },
);

export const getPostBySlug = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const isAdmin = Boolean(req.user && req.user.role === 'admin');

    const isObjectId = slug && /^[0-9a-fA-F]{24}$/.test(slug);
    const query = isObjectId ? { $or: [{ _id: slug }, { slug }] } : { slug };

    const post = await Post.findOne(query);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (!isAdmin && post.status === 'draft') {
      throw new AppError('Post not found', 404);
    }

    // Get up to 3 related posts in same category or matching tags
    const publicFilter = isAdmin ? {} : { status: 'published' };
    const relatedPosts = await Post.find({
      ...publicFilter,
      _id: { $ne: post._id },
      $or: [{ category: post.category }, { tags: { $in: post.tags } }],
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug coverImage excerpt publishedAt category');

    res.status(200).json({
      success: true,
      data: {
        post,
        relatedPosts,
      },
      message: 'Post retrieved successfully',
    });
  },
);

export const createPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const body = createPostSchema.parse(req.body);

    const slug = body.slug
      ? await generateUniqueSlug(Post, body.slug)
      : await generateUniqueSlug(Post, body.title);

    const publishedAt =
      body.status === 'published' ? body.publishedAt || new Date() : body.publishedAt;

    const post = await Post.create({
      ...body,
      slug,
      publishedAt,
    });

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully',
    });
  },
);

export const updatePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const body = updatePostSchema.parse(req.body);

    const post = await Post.findById(id);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (body.slug && body.slug !== post.slug) {
      body.slug = await generateUniqueSlug(Post, body.slug, id);
    } else if (body.title && body.title !== post.title && !body.slug) {
      body.slug = await generateUniqueSlug(Post, body.title, id);
    }

    if (body.status === 'published' && !post.publishedAt && !body.publishedAt) {
      body.publishedAt = new Date();
    }

    Object.assign(post, body);
    await post.save();

    res.status(200).json({
      success: true,
      data: post,
      message: 'Post updated successfully',
    });
  },
);

export const deletePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: 'Post deleted successfully',
    });
  },
);
