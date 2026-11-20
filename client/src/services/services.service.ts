import api from '../lib/api';
import { ApiResponse, Service } from '../types';

export const getServices = async (): Promise<Service[]> => {
  const response = await api.get<ApiResponse<Service[]>>('/services');
  return response.data.data;
};

export const getServiceBySlug = async (slug: string): Promise<Service> => {
  const response = await api.get<ApiResponse<Service>>(`/services/${slug}`);
  return response.data.data;
};
