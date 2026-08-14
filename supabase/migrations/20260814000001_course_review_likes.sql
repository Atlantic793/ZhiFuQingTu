-- P: 课程评价点赞 — course_review_likes（review_id + user_id 去重，支持点赞/取消）
-- 纯新增表，不修改 course_reviews；与 course_favorites（按课程收藏）同款设计，按评论点赞。

create table if not exists public.course_review_likes (
  review_id uuid not null references public.course_reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create index if not exists course_review_likes_user_idx on public.course_review_likes (user_id);

alter table public.course_review_likes enable row level security;

drop policy if exists "course_review_likes_select_authenticated" on public.course_review_likes;
create policy "course_review_likes_select_authenticated"
  on public.course_review_likes for select to authenticated using (true);

drop policy if exists "course_review_likes_insert_own" on public.course_review_likes;
create policy "course_review_likes_insert_own"
  on public.course_review_likes for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "course_review_likes_delete_own" on public.course_review_likes;
create policy "course_review_likes_delete_own"
  on public.course_review_likes for delete to authenticated
  using (auth.uid() = user_id);
