import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from '../lib/supabase';

export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
};

type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, nickname: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, nickname')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[auth] fetchProfile failed', error.message);
    return null;
  }
  return data;
}

async function userFromSession(session: Session | null): Promise<AuthUser | null> {
  if (!session?.user) return null;

  const profile = await fetchProfile(session.user.id);
  const email = session.user.email ?? profile?.email ?? '';
  const nickname =
    profile?.nickname ||
    (session.user.user_metadata?.nickname as string | undefined) ||
    email.split('@')[0] ||
    '用户';

  return {
    id: session.user.id,
    email,
    nickname,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isInitialized: false,

  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = await userFromSession(session);
    set({ user, isLoggedIn: !!user, isInitialized: true });

    supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      const nextUser = await userFromSession(nextSession);
      set({ user: nextUser, isLoggedIn: !!nextUser });
    });
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { ok: false, error: mapAuthError(error.message) };
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = await userFromSession(session);
    set({ user, isLoggedIn: !!user });
    return { ok: true };
  },

  register: async (email, nickname, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
      },
    });

    if (error) {
      return { ok: false, error: mapAuthError(error.message) };
    }

    // Supabase may return a user with empty identities when email already exists
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { ok: false, error: '该邮箱已注册' };
    }

    if (!data.user) {
      return { ok: false, error: '注册失败，请稍后重试' };
    }

    // Registration should not keep an auto-login session; user must sign in explicitly
    if (data.session) {
      await supabase.auth.signOut();
    }
    set({ user: null, isLoggedIn: false });
    return { ok: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isLoggedIn: false });
  },
}));

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return '邮箱或密码错误，或该账号尚未注册';
  if (lower.includes('email not confirmed')) return '邮箱尚未验证，请先完成验证或在 Supabase 关闭 Confirm email';
  if (lower.includes('user already registered')) return '该邮箱已注册';
  if (lower.includes('email rate limit')) return '尝试过于频繁，请稍后再试';
  if (lower.includes('password')) return '密码不符合要求（至少 6 位）';
  return message || '操作失败，请稍后重试';
}
