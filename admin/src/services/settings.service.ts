import api from './http/api';
import { Settings, ApiResponse } from '../types';
import { initialMockSettings, mockDelay } from '../data/mockData';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

let mockSettingsData = { ...initialMockSettings };

export const settingsService = {
  getSettings: async (): Promise<Settings> => {
    if (isMock) {
      await mockDelay(250);
      return { ...mockSettingsData };
    }
    const response = await api.get<ApiResponse<Settings>>('/settings');
    return response.data.data;
  },

  updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
    if (isMock) {
      await mockDelay(350);
      mockSettingsData = { ...mockSettingsData, ...data };
      return { ...mockSettingsData };
    }
    const response = await api.put<ApiResponse<Settings>>('/settings', data);
    return response.data.data;
  },
};

export default settingsService;
