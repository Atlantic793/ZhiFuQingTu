import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from '../lib/supabase';
import { updateProfile as updateProfileRow, type ProfileUpdate } from '../services/profileService';
import { fetchPortrait, savePortrait } from '../services/portraitService';
import type { PortraitPatch, UserPortrait } from '../types/portrait';

/** Internal quick-login account (auto-provisioned in Supabase on first use). */
export const TEST_ACCOUNT = {
  email: 'test@example.com',
  password: '123456',
  nickname: '测试用户',
} as const;

export function isAdminEmail(email?: string | null): boolean {
  const raw = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)?.trim();
  const list = (raw || TEST_ACCOUNT.email)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.trim().toLowerCase());
}

export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string | null;
  address: string | null;
  github: string | null;
  bio: string | null;
  created_at: string | null;
  portrait: UserPortrait | null;
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
  updateProfile: (patch: ProfileUpdate) => Promise<AuthResult>;
  updatePortrait: (patch: PortraitPatch) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const PROFILE_SELECT =
  'id, email, nickname, avatar_url, address, github, bio, created_at';

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[auth] fetchProfile failed', error.message);
    return null;
  }
  return data as Profile | null;
}

function toAuthUser(
  sessionUser: Session['user'],
  profile: Profile | null,
  portrait: UserPortrait | null
): AuthUser {
  const email = sessionUser.email ?? profile?.email ?? '';
  const nickname =
    profile?.nickname ||
    (sessionUser.user_metadata?.nickname as string | undefined) ||
    email.split('@')[0] ||
    '用户';

  return {
    id: sessionUser.id,
    email,
    nickname,
    avatar_url: profile?.avatar_url ?? null,
    address: profile?.address ?? null,
    github: profile?.github ?? null,
    bio: profile?.bio ?? null,
    created_at: profile?.created_at ?? sessionUser.created_at ?? null,
    portrait,
  };
}

async function userFromSession(session: Session | null): Promise<AuthUser | null> {
  if (!session?.user) return null;
  const profile = await fetchProfile(session.user.id);
  const portrait = await fetchPortrait(session.user.id);
  return toAuthUser(session.user, profile, portrait);
}

export const useAuthStore = create<AuthState>((set, get) => ({
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

  updateProfile: async (patch) => {
    const current = get().user;
    if (!current) return { ok: false, error: '请先登录' };

    try {
      const profile = await updateProfileRow(current.id, patch);
      set({
        user: {
          ...current,
          nickname: profile.nickname,
          avatar_url: profile.avatar_url,
          address: profile.address,
          github: profile.github,
          bio: profile.bio,
          created_at: profile.created_at ?? current.created_at,
        },
      });
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存失败，请稍后重试';
      return { ok: false, error: mapAuthError(message) };
    }
  },

  updatePortrait: async (patch) => {
    const current = get().user;
    if (!current) return { ok: false, error: '请先登录' };

    try {
      const portrait = await savePortrait(current.id, patch);
      set({
        user: {
          ...current,
          portrait,
        },
      });
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : '画像保存失败，请稍后重试';
      return { ok: false, error: mapAuthError(message) };
    }
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
  if (lower.includes('column') && lower.includes('does not exist')) {
    return '资料字段尚未初始化，请先在 Supabase 执行 20260328000003_profile_fields.sql';
  }
  if (lower.includes('bucket') || lower.includes('storage')) {
    return '头像存储未就绪，请先在 Supabase 执行 20260328000003_profile_fields.sql';
  }
  return message || '操作失败，请稍后重试';
}
