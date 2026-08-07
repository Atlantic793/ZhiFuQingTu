import { supabase } from '../lib/supabase';
import type { PortraitPatch, SubjectTier, UserPortrait } from '../types/portrait';

const PORTRAIT_SELECT =
  'user_id, major, grade, math_basis, programming_basis, english_level, target_university, target_careers, learned_courses, weak_points, weekly_hours, updated_at';

export async function fetchPortrait(userId: string): Promise<UserPortrait | null> {
  const { data, error } = await supabase
    .from('user_portraits')
    .select(PORTRAIT_SELECT)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[portrait] fetchPortrait failed', error.message);
    return null;
  }
  if (!data) return null;
  return normalizePortrait(data);
}

export async function savePortrait(
  userId: string,
  patch: PortraitPatch
): Promise<UserPortrait> {
  const { data, error } = await supabase
    .from('user_portraits')
    .upsert(
      { user_id: userId, ...patch },
      { onConflict: 'user_id' }
    )
    .select(PORTRAIT_SELECT)
    .single();

  if (error) throw error;
  return normalizePortrait(data);
}

export async function fetchSubjectTiers(): Promise<SubjectTier[]> {
  const { data, error } = await supabase
    .from('subject_tiers')
    .select('subject, careers, courses')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[portrait] fetchSubjectTiers failed', error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    subject: row.subject,
    careers: Array.isArray(row.careers) ? (row.careers as string[]) : [],
    courses: Array.isArray(row.courses) ? (row.courses as string[]) : [],
  }));
}

function normalizePortrait(raw: Record<string, unknown>): UserPortrait {
  return {
    user_id: String(raw.user_id ?? ''),
    major: String(raw.major ?? ''),
    grade: String(raw.grade ?? ''),
    math_basis: String(raw.math_basis ?? ''),
    programming_basis: String(raw.programming_basis ?? ''),
    english_level: String(raw.english_level ?? ''),
    target_university: String(raw.target_university ?? ''),
    target_careers: toArray(raw.target_careers),
    learned_courses: toArray(raw.learned_courses),
    weak_points: toArray(raw.weak_points),
    weekly_hours: String(raw.weekly_hours ?? ''),
    updated_at: raw.updated_at ? String(raw.updated_at) : null,
  };
}

function toArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
}
