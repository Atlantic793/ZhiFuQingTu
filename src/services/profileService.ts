import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

export type ProfileUpdate = Partial<
  Pick<Profile, 'nickname' | 'avatar_url' | 'address' | 'github' | 'bio'>
>;

const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<Profile> {
  const payload: ProfileUpdate = {};

  if (patch.nickname !== undefined) {
    const nickname = patch.nickname.trim();
    if (!nickname) throw new Error('昵称不能为空');
    payload.nickname = nickname;
  }
  if (patch.avatar_url !== undefined) payload.avatar_url = patch.avatar_url;
  if (patch.address !== undefined) {
    payload.address = patch.address?.trim() || null;
  }
  if (patch.github !== undefined) {
    payload.github = normalizeGithub(patch.github ?? '');
  }
  if (patch.bio !== undefined) {
    payload.bio = patch.bio?.trim() || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('id, email, nickname, avatar_url, address, github, bio, created_at')
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('仅支持 JPG / PNG / WebP / GIF');
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('头像大小不能超过 2MB');
  }

  const ext = extensionForMime(file.type);
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: '3600',
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  // bust CDN/browser cache after replace
  return `${data.publicUrl}?t=${Date.now()}`;
}

export function formatGithubDisplay(github: string | null | undefined): string | null {
  const normalized = normalizeGithub(github ?? '');
  if (!normalized) return null;
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;
  return `github.com/${normalized}`;
}

function normalizeGithub(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      const url = new URL(value);
      if (!/github\.com$/i.test(url.hostname)) return value;
      const handle = url.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
      return handle || value;
    }
  } catch {
    // fall through
  }

  return value
    .replace(/^github\.com\//i, '')
    .replace(/^www\.github\.com\//i, '')
    .replace(/^@/, '');
}

function extensionForMime(mime: string): string {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpg';
  }
}
