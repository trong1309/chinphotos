import { Request, Response } from 'express';
import { z } from 'zod';
import Image from '../models/image.model';
import Gallery from '../models/gallery.model';
import AppError from '../utils/appError';
import asyncHandler from '../utils/asyncHandler';
import { processAndSaveImage, deleteImageFiles } from '../services/image.service';
import { getPaginationOptions, buildPaginatedResponse } from '../utils/pagination';

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    }),
  ),
});

const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one image ID required'),
  action: z.enum(['delete', 'feature', 'unfeature']),
});

const updateImageSchema = z.object({
  alt: z.string().optional(),
  caption: z.string().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().optional(),
  gallery: z.string().optional(),
});

export const getImages = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { featured, gallery } = req.query;
    const pagination = getPaginationOptions(req, 24);

    const filter: Record<string, unknown> = {};

    if (featured === 'true') {
      filter['isFeatured'] = true;
    }

    const isAdmin = Boolean(req.user && req.user.role === 'admin');
    if (!isAdmin) {
      const publicGalleries = await Gallery.find({
        status: 'published',
        isUnlisted: { $ne: true },
      }).select('_id');
      const publicIds = publicGalleries.map((g) => g._id);

      if (typeof gallery === 'string' && gallery.trim()) {
        const isAllowed = publicIds.some((id) => id.toString() === gallery.trim());
        filter['gallery'] = isAllowed ? gallery.trim() : null;
      } else {
        filter['gallery'] = { $in: publicIds };
      }
    } else if (typeof gallery === 'string' && gallery.trim()) {
      filter['gallery'] = gallery;
    }

    const [items, total] = await Promise.all([
      Image.find(filter)
        .populate('gallery', 'title slug status')
        .sort({ order: 1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Image.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: buildPaginatedResponse(items, total, pagination),
      message: 'Images retrieved successfully',
    });
  },
);

export const uploadImages = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      throw new AppError('No image files were uploaded', 400);
    }

    const galleryId = req.body['galleryId'] || req.body['gallery'];
    if (galleryId) {
      const gallery = await Gallery.findById(galleryId);
      if (!gallery) {
        throw new AppError('Specified gallery not found', 400);
      }
    }

    // Determine current max order in this gallery
    const lastImage = galleryId
      ? await Image.findOne({ gallery: galleryId }).sort({ order: -1 })
      : null;
    let nextOrder = lastImage ? lastImage.order + 1 : 1;

    const createdImages = [];

    for (const file of files) {
      // processAndSaveImage checks magic bytes, converts to 3 sizes WebP, and makes blurDataUrl
      const processed = await processAndSaveImage(file.buffer);

      const newImage = await Image.create({
        gallery: galleryId || undefined,
        url: processed.url,
        storageKey: processed.storageKey,
        width: processed.width,
        height: processed.height,
        blurDataUrl: processed.blurDataUrl,
        alt: file.originalname.replace(/\.[^/.]+$/, ''),
        caption: '',
        isFeatured: false,
        order: nextOrder++,
      });

      // If gallery doesn't have a cover image yet, set this as cover image
      if (galleryId) {
        const gallery = await Gallery.findById(galleryId);
        if (gallery && !gallery.coverImage) {
          gallery.coverImage = processed.url;
          await gallery.save();
        }
      }

      createdImages.push(newImage);
    }

    res.status(201).json({
      success: true,
      data: createdImages,
      message: `Successfully uploaded and processed ${createdImages.length} image(s)`,
    });
  },
);

export const updateImage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const body = updateImageSchema.parse(req.body);

    const image = await Image.findById(id);
    if (!image) {
      throw new AppError('Image not found', 404);
    }

    Object.assign(image, body);
    await image.save();

    res.status(200).json({
      success: true,
      data: image,
      message: 'Image updated successfully',
    });
  },
);

export const deleteImage = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const image = await Image.findById(id);
    if (!image) {
      throw new AppError('Image not found', 404);
    }

    // Delete physical files
    if (image.storageKey) {
      await deleteImageFiles(image.storageKey);
    }

    await Image.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Image deleted successfully',
    });
  },
);

export const reorderImages = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { items } = reorderSchema.parse(req.body);

    const updateOperations = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await Image.bulkWrite(updateOperations);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Images reordered successfully',
    });
  },
);

export const bulkImageActions = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { ids, action } = bulkActionSchema.parse(req.body);

    if (action === 'delete') {
      const images = await Image.find({ _id: { $in: ids } });
      for (const img of images) {
        if (img.storageKey) {
          await deleteImageFiles(img.storageKey);
        }
      }
      await Image.deleteMany({ _id: { $in: ids } });
    } else if (action === 'feature') {
      await Image.updateMany({ _id: { $in: ids } }, { $set: { isFeatured: true } });
    } else if (action === 'unfeature') {
      await Image.updateMany({ _id: { $in: ids } }, { $set: { isFeatured: false } });
    }

    res.status(200).json({
      success: true,
      data: null,
      message: `Bulk action '${action}' applied to ${ids.length} images`,
    });
  },
);
