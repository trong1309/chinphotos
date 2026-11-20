import api from '../lib/api';
import { ApiResponse, Gallery, GalleryDetailData, PaginatedData } from '../types';

export interface GetGalleriesParams {
  category?: string;
  search?: string;
  status?: string;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export const getGalleries = async (
  params?: GetGalleriesParams,
): Promise<PaginatedData<Gallery>> => {
  const response = await api.get<ApiResponse<PaginatedData<Gallery>>>('/galleries', {
    params,
  });
  return response.data.data;
};

export const getGalleryBySlug = async (slug: string): Promise<GalleryDetailData> => {
  const response = await api.get<ApiResponse<GalleryDetailData>>(`/galleries/${slug}`);
  return response.data.data;
};
