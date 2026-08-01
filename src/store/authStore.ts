import { create } from 'zustand'

interface AuthState {
  user: { email: string; nickname: string } | null
  isLoggedIn: boolean
  login: (email: string, password: string) => boolean
  register: (email: string, nickname: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  login: (email, password) => {
    if ((email === 'test@example.com' && password === '123456')) {
      set({ 
        user: { email, nickname: '测试用户' }, 
        isLoggedIn: true 
      })
      return true
    }
    return false
  },
  register: (email, nickname, password) => {
    if (email && nickname && password) {
      set({ 
        user: { email, nickname }, 
        isLoggedIn: true 
      })
      return true
    }
    return false
  },
  logout: () => set({ user: null, isLoggedIn: false }),
}))
