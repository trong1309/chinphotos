import api from '../lib/api';
import { ApiResponse } from '../types';

export interface CreateInquiryDto {
  name: string;
  email: string;
  phone?: string;
  serviceType?: string;
  eventDate?: string;
  location?: string;
  adultsCount?: number;
  childrenInfo?: string;
  message: string;
  source?: string;
  lang?: 'vi' | 'en';
  website_url_hp?: string;
}

export const submitInquiry = async (data: CreateInquiryDto): Promise<ApiResponse<unknown>> => {
  const response = await api.post<ApiResponse<unknown>>('/inquiries', data);
  return response.data;
};
