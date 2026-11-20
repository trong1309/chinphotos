import api from './http/api';
import { Gallery, ImageItem, ApiResponse, PaginatedResponse } from '../types';
import {
  initialMockGalleries,
  initialMockImages,
  mockDelay,
} from '../data/mockData';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

let mockGalleriesList = [...initialMockGalleries];
let mockImagesList = [...initialMockImages];

export interface GetGalleriesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  featured?: boolean;
}

export const galleriesService = {
  getGalleries: async (
    params?: GetGalleriesParams,
  ): Promise<PaginatedResponse<Gallery>> => {
    if (isMock) {
      await mockDelay(350);
      let filtered = [...mockGalleriesList];

      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.slug.toLowerCase().includes(q) ||
            g.location?.toLowerCase().includes(q),
        );
      }

      if (params?.category) {
        filtered = filtered.filter((g) => {
          const catId = typeof g.category === 'object' ? g.category._id : g.category;
          return catId === params.category;
        });
      }

      if (params?.status) {
        filtered = filtered.filter((g) => g.status === params.status);
      }

      if (typeof params?.featured === 'boolean') {
        filtered = filtered.filter((g) => g.isFeatured === params.featured);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 12;
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const items = filtered.slice(start, start + limit);

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }

    const response = await api.get<ApiResponse<PaginatedResponse<Gallery>>>(
      '/galleries',
      { params },
    );
    return response.data.data;
  },

  getGalleryById: async (
    idOrSlug: string,
  ): Promise<{ gallery: Gallery; images: ImageItem[] }> => {
    if (isMock) {
      await mockDelay(300);
      const gallery = mockGalleriesList.find(
        (g) => g._id === idOrSlug || g.slug === idOrSlug,
      );
      if (!gallery) throw new Error('Gallery not found');
      const images = mockImagesList.filter((img) => img.gallery === gallery._id);
      return { gallery, images };
    }

    const response = await api.get<
      ApiResponse<{ gallery: Gallery; images: ImageItem[] }>
    >(`/galleries/${idOrSlug}`);
    return response.data.data;
  },

  createGallery: async (data: Partial<Gallery>): Promise<Gallery> => {
    if (isMock) {
      await mockDelay(400);
      const newGal: Gallery = {
        _id: `gal-${Date.now()}`,
        title: data.title || 'Untitled Gallery',
        slug: data.slug || `gallery-${Date.now()}`,
        category: data.category || 'cat-1',
        status: data.status || 'draft',
        isUnlisted: Boolean(data.isUnlisted),
        isFeatured: Boolean(data.isFeatured),
        order: mockGalleriesList.length + 1,
        imageCount: 0,
        createdAt: new Date().toISOString(),
        ...data,
      };
      mockGalleriesList.unshift(newGal);
      return newGal;
    }

    const response = await api.post<ApiResponse<Gallery>>('/galleries', data);
    return response.data.data;
  },

  updateGallery: async (id: string, data: Partial<Gallery>): Promise<Gallery> => {
    if (isMock) {
      await mockDelay(400);
      const index = mockGalleriesList.findIndex((g) => g._id === id);
      if (index === -1) throw new Error('Gallery not found');
      const existing = mockGalleriesList[index]!;
      const updated: Gallery = { ...existing, ...data, _id: existing._id };
      mockGalleriesList[index] = updated;
      return updated;
    }

    const response = await api.put<ApiResponse<Gallery>>(
      `/galleries/${id}`,
      data,
    );
    return response.data.data;
  },

  deleteGallery: async (id: string): Promise<void> => {
    if (isMock) {
      await mockDelay(300);
      mockGalleriesList = mockGalleriesList.filter((g) => g._id !== id);
      mockImagesList = mockImagesList.filter((img) => img.gallery !== id);
      return;
    }

    await api.delete(`/galleries/${id}`);
  },
};

export default galleriesService;
