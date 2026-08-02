import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from '../lib/supabase';

/** Internal quick-login account (auto-provisioned in Supabase on first use). */
export const TEST_ACCOUNT = {
  email: 'test@example.com',
  password: '123456',
  nickname: '测试用户',
} as const;

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
  loginWithTestAccount: () => Promise<AuthResult>;
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
    if (!error) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = await userFromSession(session);
      set({ user, isLoggedIn: !!user });
      return { ok: true };
    }

    // First-time team setup: auto-create the shared test account if missing
    const isTestLogin =
      email.trim().toLowerCase() === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password;
    if (isTestLogin && /invalid login credentials/i.test(error.message)) {
      return provisionTestAccountAndLogin(set);
    }

    return { ok: false, error: mapAuthError(error.message) };
  },

  loginWithTestAccount: async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: TEST_ACCOUNT.email,
      password: TEST_ACCOUNT.password,
    });
    if (!error) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = await userFromSession(session);
      set({ user, isLoggedIn: !!user });
      return { ok: true };
    }
    if (/invalid login credentials/i.test(error.message)) {
      return provisionTestAccountAndLogin(set);
    }
    return { ok: false, error: mapAuthError(error.message) };
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

async function provisionTestAccountAndLogin(
  set: (partial: Partial<AuthState>) => void
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: TEST_ACCOUNT.email,
    password: TEST_ACCOUNT.password,
    options: {
      data: { nickname: TEST_ACCOUNT.nickname },
    },
  });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  if (data.session) {
    const user = await userFromSession(data.session);
    set({ user, isLoggedIn: !!user });
    return { ok: true };
  }

  // Confirm-email enabled: user exists but no session — try sign-in once more
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_ACCOUNT.email,
    password: TEST_ACCOUNT.password,
  });
  if (signInError) {
    return {
      ok: false,
      error:
        '测试账号已创建但无法登录。请在 Supabase 关闭 Confirm email，或在 Users 里确认该邮箱。',
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = await userFromSession(session);
  set({ user, isLoggedIn: !!user });
  return { ok: true };
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return '邮箱或密码错误，或该账号尚未注册';
  if (lower.includes('email not confirmed')) return '邮箱尚未验证，请先完成验证或在 Supabase 关闭 Confirm email';
  if (lower.includes('user already registered')) return '该邮箱已注册';
  if (lower.includes('email rate limit')) return '尝试过于频繁，请稍后再试';
  if (lower.includes('password')) return '密码不符合要求（至少 6 位）';
  return message || '操作失败，请稍后重试';
}
