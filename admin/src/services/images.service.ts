import api from './http/api';
import { ImageItem, ApiResponse, PaginatedResponse } from '../types';
import { initialMockImages, mockDelay } from '../data/mockData';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

let mockImages = [...initialMockImages];

export interface GetImagesParams {
  gallery?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export const imagesService = {
  getImages: async (params?: GetImagesParams): Promise<PaginatedResponse<ImageItem>> => {
    if (isMock) {
      await mockDelay(250);
      let filtered = [...mockImages];
      if (params?.gallery) {
        filtered = filtered.filter((img) => img.gallery === params.gallery);
      }
      if (typeof params?.featured === 'boolean') {
        filtered = filtered.filter((img) => img.isFeatured === params.featured);
      }
      filtered.sort((a, b) => a.order - b.order);

      const page = params?.page || 1;
      const limit = params?.limit || 24;
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;

      return {
        items: filtered.slice(start, start + limit),
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

    const response = await api.get<ApiResponse<PaginatedResponse<ImageItem>>>('/images', {
      params,
    });
    return response.data.data;
  },

  uploadImages: async (
    galleryId: string,
    files: File[],
    onProgress?: (percent: number) => void,
  ): Promise<ImageItem[]> => {
    if (isMock) {
      await mockDelay(600);
      const newItems: ImageItem[] = files.map((file, i) => ({
        _id: `img-${Date.now()}-${i}`,
        gallery: galleryId,
        url: URL.createObjectURL(file),
        storageKey: `mock-${file.name}`,
        width: 1600,
        height: 1067,
        alt: file.name.replace(/\.[^/.]+$/, ''),
        caption: '',
        isFeatured: false,
        order: mockImages.length + i + 1,
        createdAt: new Date().toISOString(),
      }));
      mockImages.push(...newItems);
      if (onProgress) onProgress(100);
      return newItems;
    }

    const formData = new FormData();
    formData.append('galleryId', galleryId);
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post<ApiResponse<ImageItem[]>>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data.data;
  },

  updateImage: async (id: string, data: Partial<ImageItem>): Promise<ImageItem> => {
    if (isMock) {
      await mockDelay(200);
      const index = mockImages.findIndex((img) => img._id === id);
      if (index === -1) throw new Error('Image not found');
      const updated = { ...mockImages[index]!, ...data };
      mockImages[index] = updated;
      return updated;
    }

    const response = await api.put<ApiResponse<ImageItem>>(`/images/${id}`, data);
    return response.data.data;
  },

  deleteImage: async (id: string): Promise<void> => {
    if (isMock) {
      await mockDelay(200);
      mockImages = mockImages.filter((img) => img._id !== id);
      return;
    }
    await api.delete(`/images/${id}`);
  },

  reorderImages: async (items: { id: string; order: number }[]): Promise<void> => {
    if (isMock) {
      await mockDelay(250);
      items.forEach((item) => {
        const img = mockImages.find((i) => i._id === item.id);
        if (img) img.order = item.order;
      });
      mockImages.sort((a, b) => a.order - b.order);
      return;
    }
    await api.patch('/images/reorder', { items });
  },

  bulkAction: async (
    ids: string[],
    action: 'delete' | 'feature' | 'unfeature',
  ): Promise<void> => {
    if (isMock) {
      await mockDelay(300);
      if (action === 'delete') {
        mockImages = mockImages.filter((img) => !ids.includes(img._id));
      } else if (action === 'feature') {
        mockImages.forEach((img) => {
          if (ids.includes(img._id)) img.isFeatured = true;
        });
      } else if (action === 'unfeature') {
        mockImages.forEach((img) => {
          if (ids.includes(img._id)) img.isFeatured = false;
        });
      }
      return;
    }

    await api.patch('/images/bulk', { ids, action });
  },
};

export default imagesService;
