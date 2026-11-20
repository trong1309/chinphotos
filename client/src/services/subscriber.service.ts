import api from '../lib/api';
import { ApiResponse } from '../types';

export const subscribeNewsletter = async (email: string): Promise<ApiResponse<unknown>> => {
  const response = await api.post<ApiResponse<unknown>>('/subscribers', { email });
  return response.data;
};
