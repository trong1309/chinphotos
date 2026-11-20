import api from '../lib/api';
import { ApiResponse, PaginatedData, Post } from '../types';

export interface GetPostsParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
}

export const getPosts = async (params?: GetPostsParams): Promise<PaginatedData<Post>> => {
  const response = await api.get<ApiResponse<PaginatedData<Post>>>('/posts', { params });
  return response.data.data;
};

export const getPostBySlug = async (slug: string): Promise<Post> => {
  const response = await api.get<ApiResponse<Post>>(`/posts/${slug}`);
  return response.data.data;
};
