import api from '../lib/api';
import { ApiResponse, Settings } from '../types';

export const getSettings = async (): Promise<Settings> => {
  const response = await api.get<ApiResponse<Settings>>('/settings');
  return response.data.data;
};

export interface RecordPageViewPayload {
  path: string;
  refType?: 'gallery' | 'post' | 'page';
  refId?: string;
  referrer?: string;
}

export const recordPageView = async (payload: RecordPageViewPayload): Promise<void> => {
  try {
    await api.post('/analytics/pageview', payload);
  } catch {
    // Non-blocking telemetry
  }
};
