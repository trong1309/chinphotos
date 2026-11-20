import fs from 'fs';
import path from 'path';
import env from '../../config/env';

export interface SavedFile {
  filename: string;
  storageKey: string;
  url: string;
  path: string;
}

export const getUploadDirectory = (): string => {
  const uploadDir = path.isAbsolute(env.UPLOAD_DIR)
    ? env.UPLOAD_DIR
    : path.join(process.cwd(), env.UPLOAD_DIR);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return uploadDir;
};

export const saveFileLocally = async (
  filename: string,
  buffer: Buffer,
): Promise<SavedFile> => {
  const dir = getUploadDirectory();
  const filePath = path.join(dir, filename);
  await fs.promises.writeFile(filePath, buffer);

  const cleanUploadUrl = env.PUBLIC_UPLOAD_URL.replace(/\/+$/, '');
  const url = `${cleanUploadUrl}/${filename}`;

  return {
    filename,
    storageKey: filename,
    url,
    path: filePath,
  };
};

export const deleteFileLocally = async (filename: string): Promise<void> => {
  try {
    const dir = getUploadDirectory();
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.error(`[storage] Failed to delete file ${filename}:`, err);
  }
};
