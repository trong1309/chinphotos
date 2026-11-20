import api from './http/api';
import { Inquiry, InquiryStatus, ApiResponse, PaginatedResponse } from '../types';
import { initialMockInquiries, mockDelay } from '../data/mockData';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

let mockInquiriesList = [...initialMockInquiries];

export interface GetInquiriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  serviceType?: string;
  from?: string;
  to?: string;
  sort?: 'newest' | 'oldest';
}

export const inquiriesService = {
  getInquiries: async (
    params?: GetInquiriesParams,
  ): Promise<PaginatedResponse<Inquiry>> => {
    if (isMock) {
      await mockDelay(300);
      let filtered = [...mockInquiriesList];

      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (inq) =>
            inq.name.toLowerCase().includes(q) ||
            inq.email.toLowerCase().includes(q) ||
            inq.phone?.includes(q) ||
            inq.message.toLowerCase().includes(q),
        );
      }

      if (params?.status) {
        filtered = filtered.filter((inq) => inq.status === params.status);
      }

      if (params?.serviceType) {
        filtered = filtered.filter((inq) => inq.serviceType === params.serviceType);
      }

      if (params?.from) {
        const fromDate = new Date(params.from).getTime();
        filtered = filtered.filter(
          (inq) => inq.createdAt && new Date(inq.createdAt).getTime() >= fromDate,
        );
      }

      if (params?.to) {
        const toDate = new Date(params.to).getTime() + 86400000;
        filtered = filtered.filter(
          (inq) => inq.createdAt && new Date(inq.createdAt).getTime() <= toDate,
        );
      }

      filtered.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return params?.sort === 'oldest' ? timeA - timeB : timeB - timeA;
      });

      const page = params?.page || 1;
      const limit = params?.limit || 20;
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

    const response = await api.get<ApiResponse<PaginatedResponse<Inquiry>>>(
      '/inquiries',
      { params },
    );
    return response.data.data;
  },

  getInquiryById: async (id: string): Promise<Inquiry> => {
    if (isMock) {
      await mockDelay(200);
      const index = mockInquiriesList.findIndex((inq) => inq._id === id);
      if (index === -1) throw new Error('Inquiry not found');
      const existing = mockInquiriesList[index]!;
      if (existing.status === 'new') {
        mockInquiriesList[index] = { ...existing, status: 'read' };
      }
      return mockInquiriesList[index]!;
    }
    const response = await api.get<ApiResponse<Inquiry>>(`/inquiries/${id}`);
    return response.data.data;
  },

  updateInquiryStatus: async (
    id: string,
    status: InquiryStatus,
    internalNote?: string,
  ): Promise<Inquiry> => {
    if (isMock) {
      await mockDelay(250);
      const index = mockInquiriesList.findIndex((inq) => inq._id === id);
      if (index === -1) throw new Error('Inquiry not found');
      const existing = mockInquiriesList[index]!;
      const updated: Inquiry = {
        ...existing,
        status,
        internalNote: internalNote !== undefined ? internalNote : existing.internalNote,
        _id: existing._id,
      };
      mockInquiriesList[index] = updated;
      return updated;
    }

    const response = await api.patch<ApiResponse<Inquiry>>(`/inquiries/${id}`, {
      status,
      internalNote,
    });
    return response.data.data;
  },

  bulkAction: async (
    ids: string[],
    action: 'read' | 'replied' | 'archived' | 'delete',
  ): Promise<void> => {
    if (isMock) {
      await mockDelay(300);
      if (action === 'delete') {
        mockInquiriesList = mockInquiriesList.filter((inq) => !ids.includes(inq._id));
      } else {
        mockInquiriesList = mockInquiriesList.map((inq) =>
          ids.includes(inq._id) ? { ...inq, status: action } : inq,
        );
      }
      return;
    }
    await api.patch('/inquiries/bulk', { ids, action });
  },

  deleteInquiry: async (id: string): Promise<void> => {
    if (isMock) {
      await mockDelay(250);
      mockInquiriesList = mockInquiriesList.filter((inq) => inq._id !== id);
      return;
    }
    await api.delete(`/inquiries/${id}`);
  },
};

export default inquiriesService;
