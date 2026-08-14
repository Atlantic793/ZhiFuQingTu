import { supabase } from '../lib/supabase';
import type { CourseReply, CourseReview } from '../types/catalog';

type DbReply = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { nickname?: string | null; avatar_url?: string | null } | null;
  course_review_reply_likes?: { count: number }[] | null;
};

type DbReview = {
  id: string;
  course_id: string;
  user_id: string;
  score: number;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: { nickname?: string | null; avatar_url?: string | null } | null;
  course_review_likes?: { count: number }[] | null;
  course_review_replies?: DbReply[] | null;
};

function mapReply(row: DbReply, reviewId: string): CourseReply {
  return {
    id: row.id,
    reviewId,
    userId: row.user_id,
    userName: row.profiles?.nickname?.trim() || '匿名用户',
    userAvatar: row.profiles?.avatar_url ?? null,
    content: row.content,
    createdAt: row.created_at,
    likeCount: row.course_review_reply_likes?.[0]?.count ?? 0,
    likedByMe: false,
  };
}

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
    likeCount: row.course_review_likes?.[0]?.count ?? 0,
    likedByMe: false,
    replies: (row.course_review_replies ?? [])
      .map((rp) => mapReply(rp, row.id))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

export async function fetchCourseReviews(courseId: string, viewerId?: string): Promise<CourseReview[]> {
  const { data, error } = await supabase
    .from('course_reviews')
    .select(
      `id, course_id, user_id, score, content, created_at, updated_at, profiles!course_reviews_user_id_fkey(nickname, avatar_url), course_review_likes(count), course_review_replies(id, user_id, content, created_at, profiles!course_review_replies_user_id_fkey(nickname, avatar_url), course_review_reply_likes(count))`
    )
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[rating] fetch reviews failed', error.message);
    return [];
  }

  const reviews = ((data as DbReview[]) ?? []).map(mapReview);
  if (!viewerId) return reviews;

  const [likedRowsRes, likedReplyRowsRes] = await Promise.all([
    supabase.from('course_review_likes').select('review_id').eq('user_id', viewerId),
    supabase.from('course_review_reply_likes').select('reply_id').eq('user_id', viewerId),
  ]);
  const likedIds = new Set((likedRowsRes.data ?? []).map((row) => row.review_id as string));
  const likedReplyIds = new Set(
    (likedReplyRowsRes.data ?? []).map((row) => row.reply_id as string)
  );
  return reviews.map((r) => ({
    ...r,
    likedByMe: likedIds.has(r.id),
    replies: r.replies.map((rp) => ({ ...rp, likedByMe: likedReplyIds.has(rp.id) })),
  }));
}

export async function fetchMyReview(courseId: string, userId: string): Promise<CourseReview | null> {
  const { data, error } = await supabase
    .from('course_reviews')
    .select('id, course_id, user_id, score, content, created_at, updated_at, profiles!course_reviews_user_id_fkey(nickname, avatar_url), course_review_likes(count)')
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
    .select('id, course_id, user_id, score, content, created_at, updated_at, profiles!course_reviews_user_id_fkey(nickname, avatar_url), course_review_likes(count)')
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

/** 点赞 / 取消点赞，返回最新是否已点赞 */
export async function toggleCourseReviewLike(reviewId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('course_review_likes')
    .select('review_id')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .maybeSingle();

  if (data) {
    const { error } = await supabase
      .from('course_review_likes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return false;
  }

  const { error } = await supabase.from('course_review_likes').insert({
    review_id: reviewId,
    user_id: userId,
  });
  if (error) throw new Error(error.message);
  return true;
}

/** 回复评价（二级评论），同一用户可对同一评价回复多次 */
export async function createCourseReviewReply(
  reviewId: string,
  userId: string,
  content: string
): Promise<void> {
  const { error } = await supabase.from('course_review_replies').insert({
    review_id: reviewId,
    user_id: userId,
    content: content.trim(),
  });
  if (error) throw new Error(error.message);
}

export async function deleteCourseReviewReply(replyId: string): Promise<void> {
  const { error } = await supabase
    .from('course_review_replies')
    .delete()
    .eq('id', replyId);
  if (error) throw new Error(error.message);
}

/** 回复点赞 / 取消点赞，返回最新是否已点赞 */
export async function toggleCourseReviewReplyLike(
  replyId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('course_review_reply_likes')
    .select('reply_id')
    .eq('reply_id', replyId)
    .eq('user_id', userId)
    .maybeSingle();

  if (data) {
    const { error } = await supabase
      .from('course_review_reply_likes')
      .delete()
      .eq('reply_id', replyId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return false;
  }

  const { error } = await supabase.from('course_review_reply_likes').insert({
    reply_id: replyId,
    user_id: userId,
  });
  if (error) throw new Error(error.message);
  return true;
}

export async function fetchMyReviews(userId: string): Promise<CourseReview[]> {
  const { data, error } = await supabase
    .from('course_reviews')
    .select('id, course_id, user_id, score, content, created_at, updated_at, profiles!course_reviews_user_id_fkey(nickname, avatar_url), course_review_likes(count)')
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
