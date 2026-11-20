import api from './http/api';
import { User, ApiResponse } from '../types';
import { initialMockUser, mockDelay } from '../data/mockData';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';

let currentMockUser: User | null = isMock ? initialMockUser : null;

export const authService = {
  getMe: async (): Promise<User> => {
    if (isMock) {
      await mockDelay(200);
      if (!currentMockUser) throw new Error('Unauthenticated');
      return currentMockUser;
    }
    const response = await api.get<ApiResponse<User | { user: User & { id?: string } }>>('/auth/me');
    const raw = response.data.data;
    const u = ('user' in raw && raw.user ? raw.user : raw) as User & { id?: string };
    return {
      _id: u._id || u.id || '',
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
    };
  },

  login: async (credentials: { email: string; password: string }): Promise<User> => {
    if (isMock) {
      await mockDelay(400);
      if (
        credentials.email === 'admin@example.com' &&
        (credentials.password === 'Admin@123' || credentials.password === 'change_me_strong')
      ) {
        currentMockUser = initialMockUser;
        return initialMockUser;
      }
      throw new Error('Invalid email or password');
    }
    const response = await api.post<ApiResponse<User | { user: User & { id?: string } }>>('/auth/login', credentials);
    const raw = response.data.data;
    const u = ('user' in raw && raw.user ? raw.user : raw) as User & { id?: string };
    return {
      _id: u._id || u.id || '',
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
    };
  },

  logout: async (): Promise<void> => {
    if (isMock) {
      await mockDelay(200);
      currentMockUser = null;
      return;
    }
    await api.post('/auth/logout');
  },

  updateProfile: async (data: { name?: string; avatar?: string }): Promise<User> => {
    if (isMock) {
      await mockDelay(300);
      if (currentMockUser) {
        currentMockUser = { ...currentMockUser, ...data };
        return currentMockUser;
      }
      return { ...initialMockUser, ...data };
    }
    const response = await api.put<ApiResponse<User | { user: User & { id?: string } }>>(
      '/auth/me',
      data,
    );
    const raw = response.data.data;
    const u = ('user' in raw && raw.user ? raw.user : raw) as User & { id?: string };
    return {
      _id: u._id || u.id || '',
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
    };
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    if (isMock) {
      await mockDelay(350);
      if (data.currentPassword !== 'Admin@123' && data.currentPassword !== 'change_me_strong') {
        throw new Error('Mật khẩu hiện tại không chính xác');
      }
      return;
    }
    await api.patch('/auth/password', data);
  },
};

export default authService;
