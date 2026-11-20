import { Model } from 'mongoose';

export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD') // Normalize accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[đĐ]/g, 'd') // Replace Vietnamese đ/Đ
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

export const generateUniqueSlug = async <T>(
  model: Model<T>,
  baseText: string,
  currentId?: string,
): Promise<string> => {
  const baseSlug = slugify(baseText) || 'item';
  let slug = baseSlug;
  let counter = 1;

  let isUnique = false;
  while (!isUnique) {
    const query: Record<string, unknown> = { slug };
    if (currentId) {
      query['_id'] = { $ne: currentId };
    }

    const existing = await model.findOne(query);
    if (!existing) {
      isUnique = true;
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

export default slugify;
