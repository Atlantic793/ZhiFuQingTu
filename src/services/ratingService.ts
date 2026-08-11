import { supabase } from '../lib/supabase';
import type { CourseReview } from '../types/catalog';

type DbReview = {
  id: string;
  course_id: string;
  user_id: string;
  score: number;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: { nickname?: string | null; avatar_url?: string | null } | null;
};

function mapReview(row: DbReview): CourseReview {
  return {
    id: row.id,
    courseId: row.course_id,
    userId: row.user_id,
    userName: row.profiles?.nickname?.trim() || '匿名用户',
    userAvatar: row.profiles?.avatar_url ?? null,
    score: row.score,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchCourseReviews(courseId: string): Promise<CourseReview[]> {
  const { data, error } = await supabase
    .from('course_reviews')
    .select('id, course_id, user_id, score, content, created_at, updated_at, profiles(nickname, avatar_url)')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[rating] fetch reviews failed', error.message);
    return [];
  }
  return ((data as DbReview[]) ?? []).map(mapReview);
}

export async function fetchMyReview(courseId: string, userId: string): Promise<CourseReview | null> {
  const { data, error } = await supabase
    .from('course_reviews')
    .select('id, course_id, user_id, score, content, created_at, updated_at, profiles(nickname, avatar_url)')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapReview(data as DbReview);
}

export async function upsertCourseReview(input: {
  courseId: string;
  userId: string;
  score: number;
  content: string;
}): Promise<CourseReview> {
  const { data, error } = await supabase
    .from('course_reviews')
    .upsert(
      {
        course_id: input.courseId,
        user_id: input.userId,
        score: input.score,
        content: input.content.trim(),
      },
      { onConflict: 'course_id,user_id' }
    )
    .select('id, course_id, user_id, score, content, created_at, updated_at, profiles(nickname, avatar_url)')
    .single();

  if (error || !data) {
    throw new Error(error?.message || '保存评价失败');
  }
  return mapReview(data as DbReview);
}

export async function deleteCourseReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('course_reviews')
    .delete()
    .eq('id', reviewId);
  if (error) throw new Error(error.message);
}

export async function fetchMyReviews(userId: string): Promise<CourseReview[]> {
  const { data, error } = await supabase
    .from('course_reviews')
    .select('id, course_id, user_id, score, content, created_at, updated_at, profiles(nickname, avatar_url)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn('[rating] fetch my reviews failed', error.message);
    return [];
  }
  return ((data as DbReview[]) ?? []).map(mapReview);
}

export async function isCourseFavorited(courseId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('course_favorites')
    .select('course_id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

export async function toggleCourseFavorite(courseId: string, userId: string): Promise<boolean> {
  const exists = await isCourseFavorited(courseId, userId);
  if (exists) {
    const { error } = await supabase
      .from('course_favorites')
      .delete()
      .eq('course_id', courseId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return false;
  }
  const { error } = await supabase.from('course_favorites').insert({
    course_id: courseId,
    user_id: userId,
  });
  if (error) throw new Error(error.message);
  return true;
}

export async function fetchMyFavoriteCourseIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('course_favorites')
    .select('course_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[rating] fetch favorites failed', error.message);
    return [];
  }
  return (data ?? []).map((row) => row.course_id as string);
}
