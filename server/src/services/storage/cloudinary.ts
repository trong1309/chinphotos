import crypto from 'crypto';
import env from '../../config/env';
import AppError from '../../utils/appError';

export interface SavedFileResult {
  storageKey: string;
  url: string;
}

const getCloudinaryConfig = () => {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      'Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are required when STORAGE_DRIVER=cloudinary.',
      500,
    );
  }

  return { cloudName, apiKey, apiSecret };
};

const signCloudinaryParams = (params: Record<string, string>, apiSecret: string): string => {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${sorted}${apiSecret}`)
    .digest('hex');
};

export const saveFileToCloudinary = async (
  filename: string,
  buffer: Buffer,
): Promise<SavedFileResult> => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const publicId = `chinphotos/${filename.replace(/\.webp$/i, '')}`;
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const signature = signCloudinaryParams({ public_id: publicId, timestamp }, apiSecret);

  const formData = new FormData();
  const base64Data = `data:image/webp;base64,${buffer.toString('base64')}`;
  formData.append('file', base64Data);
  formData.append('public_id', publicId);
  formData.append('timestamp', timestamp);
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new AppError(`Cloudinary upload failed: ${errText}`, 502);
  }

  const data = (await response.json()) as { secure_url?: string; public_id?: string };
  if (!data.secure_url) {
    throw new AppError('Cloudinary upload did not return a secure_url.', 502);
  }

  return {
    storageKey: data.public_id || publicId,
    url: data.secure_url,
  };
};

export const deleteFileFromCloudinary = async (filename: string): Promise<void> => {
  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const publicId = `chinphotos/${filename.replace(/\.webp$/i, '')}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = signCloudinaryParams({ public_id: publicId, timestamp }, apiSecret);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    console.warn(`[cloudinary] Failed to delete ${filename}:`, err);
  }
};
