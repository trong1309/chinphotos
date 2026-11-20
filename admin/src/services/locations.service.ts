import api from './http/api';
import { LocationItem, ApiResponse } from '../types';
import { initialMockLocations, mockDelay } from '../data/mockData';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

let mockLocationsList = [...initialMockLocations];

export const locationsService = {
  getLocations: async (): Promise<LocationItem[]> => {
    if (isMock) {
      await mockDelay(250);
      return [...mockLocationsList];
    }
    const response = await api.get<ApiResponse<LocationItem[]>>('/locations');
    return response.data.data;
  },

  getLocationBySlug: async (slug: string): Promise<LocationItem> => {
    if (isMock) {
      await mockDelay(250);
      const loc = mockLocationsList.find((l) => l.slug === slug);
      if (!loc) throw new Error('Location not found');
      return loc;
    }
    const response = await api.get<ApiResponse<LocationItem>>(`/locations/${slug}`);
    return response.data.data;
  },

  createLocation: async (data: Partial<LocationItem>): Promise<LocationItem> => {
    if (isMock) {
      await mockDelay(300);
      const newLoc: LocationItem = {
        _id: `loc-${Date.now()}`,
        name: data.name || 'New Area',
        slug: data.slug || `location-${Date.now()}`,
        titleVi: data.titleVi || '',
        titleEn: data.titleEn || '',
        descriptionVi: data.descriptionVi || '',
        descriptionEn: data.descriptionEn || '',
        popularSpotsVi: data.popularSpotsVi || [],
        popularSpotsEn: data.popularSpotsEn || [],
        tipsVi: data.tipsVi || '',
        tipsEn: data.tipsEn || '',
        coverImage: data.coverImage || '',
        order: mockLocationsList.length + 1,
      };
      mockLocationsList.push(newLoc);
      return newLoc;
    }
    const response = await api.post<ApiResponse<LocationItem>>('/locations', data);
    return response.data.data;
  },

  updateLocation: async (
    id: string,
    data: Partial<LocationItem>,
  ): Promise<LocationItem> => {
    if (isMock) {
      await mockDelay(300);
      const index = mockLocationsList.findIndex((l) => l._id === id);
      if (index === -1) throw new Error('Location not found');
      const existing = mockLocationsList[index]!;
      const updated: LocationItem = { ...existing, ...data, _id: existing._id };
      mockLocationsList[index] = updated;
      return updated;
    }
    const response = await api.put<ApiResponse<LocationItem>>(`/locations/${id}`, data);
    return response.data.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    if (isMock) {
      await mockDelay(300);
      mockLocationsList = mockLocationsList.filter((l) => l._id !== id);
      return;
    }
    await api.delete(`/locations/${id}`);
  },
};

export default locationsService;
