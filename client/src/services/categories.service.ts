import api from '../lib/api';
import { ApiResponse, Category } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<ApiResponse<Category[]>>('/categories');
  return response.data.data;
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const response = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
  return response.data.data;
};
