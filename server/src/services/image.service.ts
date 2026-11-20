import sharp from 'sharp';
import crypto from 'crypto';
import env from '../config/env';
import AppError from '../utils/appError';
import { saveFileLocally, deleteFileLocally } from './storage/local';
import { saveFileToCloudinary, deleteFileFromCloudinary } from './storage/cloudinary';

const saveFile = (filename: string, buffer: Buffer) =>
  env.STORAGE_DRIVER === 'cloudinary'
    ? saveFileToCloudinary(filename, buffer)
    : saveFileLocally(filename, buffer);

const deleteFile = (filename: string) =>
  env.STORAGE_DRIVER === 'cloudinary'
    ? deleteFileFromCloudinary(filename)
    : deleteFileLocally(filename);

export interface ProcessedImageResult {
  url: string; // Defaults to large image URL
  storageKey: string;
  width: number;
  height: number;
  blurDataUrl: string;
  sizes: {
    thumbnail: string;
    medium: string;
    large: string;
  };
}

/**
 * Validates image buffer using magic bytes (prevents renamed executables or malicious files).
 */
export const validateImageMagicBytes = (buffer: Buffer): boolean => {
  if (!buffer || buffer.length < 12) {
    return false;
  }

  // Check JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (isJpeg) return true;

  // Check PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  if (isPng) return true;

  // Check WebP: RIFF ... WEBP
  const isRiff =
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWebp =
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  if (isRiff && isWebp) return true;

  return false;
};

export const processAndSaveImage = async (
  buffer: Buffer,
): Promise<ProcessedImageResult> => {
  // Validate magic bytes
  if (!validateImageMagicBytes(buffer)) {
    throw new AppError(
      'Invalid file format. Only true JPEG, PNG, or WebP images are allowed.',
      400,
    );
  }

  let sharpInstance = sharp(buffer);
  const metadata = await sharpInstance.metadata();

  if (!metadata.width || !metadata.height) {
    throw new AppError('Unable to read image dimensions.', 400);
  }

  // Ensure orientation is normalized according to EXIF
  sharpInstance = sharpInstance.rotate();

  const originalWidth = metadata.width;
  const originalHeight = metadata.height;

  const baseKey = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;

  // 1. Generate Large (max 2000px)
  const largeBuffer = await sharp(buffer)
    .rotate()
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  const largeFilename = `${baseKey}-large.webp`;
  const largeSaved = await saveFile(largeFilename, largeBuffer);

  // 2. Generate Medium (max 1200px)
  const mediumBuffer = await sharp(buffer)
    .rotate()
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const mediumFilename = `${baseKey}-medium.webp`;
  const mediumSaved = await saveFile(mediumFilename, mediumBuffer);

  // 3. Generate Thumbnail (max 400px)
  const thumbBuffer = await sharp(buffer)
    .rotate()
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const thumbFilename = `${baseKey}-thumb.webp`;
  const thumbSaved = await saveFile(thumbFilename, thumbBuffer);

  // 4. Generate BlurDataURL (tiny 16px placeholder base64)
  const tinyBuffer = await sharp(buffer)
    .rotate()
    .resize(16, 16, { fit: 'inside' })
    .webp({ quality: 30 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${tinyBuffer.toString('base64')}`;

  return {
    url: largeSaved.url,
    storageKey: baseKey,
    width: originalWidth,
    height: originalHeight,
    blurDataUrl,
    sizes: {
      large: largeSaved.url,
      medium: mediumSaved.url,
      thumbnail: thumbSaved.url,
    },
  };
};

export const deleteImageFiles = async (storageKey: string): Promise<void> => {
  const filenames = [
    `${storageKey}-large.webp`,
    `${storageKey}-medium.webp`,
    `${storageKey}-thumb.webp`,
  ];

  await Promise.all(filenames.map((filename) => deleteFile(filename)));
};
