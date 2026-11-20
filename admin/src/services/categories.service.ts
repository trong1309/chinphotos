import api from './http/api';
import { Category, ApiResponse } from '../types';
import { initialMockCategories, mockDelay } from '../data/mockData';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

let mockCategoriesList = [...initialMockCategories];

export const categoriesService = {
  getCategories: async (all: boolean = true): Promise<Category[]> => {
    if (isMock) {
      await mockDelay(250);
      return all ? [...mockCategoriesList] : mockCategoriesList.filter((c) => c.isVisible);
    }
    const response = await api.get<ApiResponse<Category[]>>('/categories', {
      params: { all: all ? 'true' : undefined },
    });
    return response.data.data;
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    if (isMock) {
      await mockDelay(350);
      const newCat: Category = {
        _id: `cat-${Date.now()}`,
        name: data.name || 'New Category',
        slug: data.slug || `category-${Date.now()}`,
        description: data.description || '',
        coverImage: data.coverImage || '',
        order: mockCategoriesList.length + 1,
        isVisible: data.isVisible ?? true,
        galleryCount: 0,
        createdAt: new Date().toISOString(),
      };
      mockCategoriesList.push(newCat);
      return newCat;
    }
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
    if (isMock) {
      await mockDelay(300);
      const index = mockCategoriesList.findIndex((c) => c._id === id);
      if (index === -1) throw new Error('Category not found');
      const existing = mockCategoriesList[index]!;
      const updated: Category = { ...existing, ...data, _id: existing._id };
      mockCategoriesList[index] = updated;
      return updated;
    }
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    if (isMock) {
      await mockDelay(300);
      mockCategoriesList = mockCategoriesList.filter((c) => c._id !== id);
      return;
    }
    await api.delete(`/categories/${id}`);
  },

  reorderCategories: async (items: { id: string; order: number }[]): Promise<void> => {
    if (isMock) {
      await mockDelay(250);
      items.forEach((item) => {
        const cat = mockCategoriesList.find((c) => c._id === item.id);
        if (cat) cat.order = item.order;
      });
      mockCategoriesList.sort((a, b) => a.order - b.order);
      return;
    }
    await api.patch('/categories/reorder', { items });
  },
};

export default categoriesService;
