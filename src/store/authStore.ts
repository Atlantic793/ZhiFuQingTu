import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, nickname: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const mockUsers: Record<string, { nickname: string; password: string }> = {
  'test@example.com': { nickname: '测试用户', password: '123456' },
  'admin@example.com': { nickname: '管理员', password: 'admin123' },
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const userData = mockUsers[email];
    if (userData && userData.password === password) {
      set({
        user: {
          id: '1',
          email,
          nickname: userData.nickname,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        },
        isAuthenticated: true,
      });
      return true;
    }
    return false;
  },
  
  register: async (email: string, nickname: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (mockUsers[email]) {
      return false;
    }
    
    mockUsers[email] = { nickname, password };
    set({
      user: {
        id: Date.now().toString(),
        email,
        nickname,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      },
      isAuthenticated: true,
    });
    return true;
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
