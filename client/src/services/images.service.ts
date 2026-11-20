import api from '../lib/api';
import { ApiResponse, GalleryImage, PaginatedData } from '../types';

export interface GetImagesParams {
  page?: number;
  limit?: number;
  gallery?: string;
  featured?: boolean;
}

export const getImages = async (
  params?: GetImagesParams,
): Promise<PaginatedData<GalleryImage>> => {
  const response = await api.get<ApiResponse<PaginatedData<GalleryImage>>>('/images', {
    params,
  });
  return response.data.data;
};

export const getFeaturedImages = async (
  params?: { page?: number; limit?: number },
): Promise<PaginatedData<GalleryImage>> => {
  return getImages({ ...params, featured: true });
};
