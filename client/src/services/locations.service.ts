import api from '../lib/api';
import { ApiResponse, LocationItem } from '../types';

export const getLocations = async (): Promise<LocationItem[]> => {
  const response = await api.get<ApiResponse<LocationItem[]>>('/locations');
  return response.data.data;
};

export const getLocationBySlug = async (slug: string): Promise<LocationItem> => {
  const response = await api.get<ApiResponse<LocationItem>>(`/locations/${slug}`);
  return response.data.data;
};
