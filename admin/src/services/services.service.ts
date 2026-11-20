import api from './http/api';
import { Service, ApiResponse } from '../types';
import { initialMockServices, mockDelay } from '../data/mockData';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

let mockServicesList = [...initialMockServices];

export const servicesService = {
  getServices: async (): Promise<Service[]> => {
    if (isMock) {
      await mockDelay(250);
      return [...mockServicesList];
    }
    const response = await api.get<ApiResponse<Service[]>>('/services');
    return response.data.data;
  },

  createService: async (data: Partial<Service>): Promise<Service> => {
    if (isMock) {
      await mockDelay(350);
      const newServ: Service = {
        _id: `serv-${Date.now()}`,
        title: data.title || 'New Service',
        slug: data.slug || `service-${Date.now()}`,
        summary: data.summary || '',
        heroImage: data.heroImage || '',
        content: data.content || '',
        priceFrom: data.priceFrom || 0,
        inclusions: data.inclusions || [],
        faqs: data.faqs || [],
        order: mockServicesList.length + 1,
        createdAt: new Date().toISOString(),
      };
      mockServicesList.push(newServ);
      return newServ;
    }
    const response = await api.post<ApiResponse<Service>>('/services', data);
    return response.data.data;
  },

  updateService: async (id: string, data: Partial<Service>): Promise<Service> => {
    if (isMock) {
      await mockDelay(300);
      const index = mockServicesList.findIndex((s) => s._id === id);
      if (index === -1) throw new Error('Service not found');
      const existing = mockServicesList[index]!;
      const updated: Service = { ...existing, ...data, _id: existing._id };
      mockServicesList[index] = updated;
      return updated;
    }
    const response = await api.put<ApiResponse<Service>>(`/services/${id}`, data);
    return response.data.data;
  },

  deleteService: async (id: string): Promise<void> => {
    if (isMock) {
      await mockDelay(300);
      mockServicesList = mockServicesList.filter((s) => s._id !== id);
      return;
    }
    await api.delete(`/services/${id}`);
  },

  reorderServices: async (items: { id: string; order: number }[]): Promise<void> => {
    if (isMock) {
      await mockDelay(250);
      items.forEach((item) => {
        const s = mockServicesList.find((srv) => srv._id === item.id);
        if (s) s.order = item.order;
      });
      mockServicesList.sort((a, b) => a.order - b.order);
      return;
    }
    await api.patch('/services/reorder', { items });
  },
};

export default servicesService;
