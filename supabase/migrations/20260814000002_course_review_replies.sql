-- P: 楼中楼 — 课程评价的二级回复 + 回复点赞
-- course_review_replies：一级 course_reviews 下的回复（一个用户可对同一评价回复多次，无唯一约束）
-- course_review_reply_likes：回复点赞（reply_id + user_id 去重，与 course_review_likes 同款）

create table if not exists public.course_review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.course_reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_review_replies_review_idx on public.course_review_replies (review_id);
create index if not exists course_review_replies_user_idx on public.course_review_replies (user_id);

create table if not exists public.course_review_reply_likes (
  reply_id uuid not null references public.course_review_replies (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reply_id, user_id)
);

create index if not exists course_review_reply_likes_user_idx on public.course_review_reply_likes (user_id);

alter table public.course_review_replies enable row level security;
alter table public.course_review_reply_likes enable row level security;

-- ── course_review_replies 策略 ──
drop policy if exists "course_review_replies_select_authenticated" on public.course_review_replies;
create policy "course_review_replies_select_authenticated"
  on public.course_review_replies for select to authenticated using (true);

drop policy if exists "course_review_replies_insert_own" on public.course_review_replies;
create policy "course_review_replies_insert_own"
  on public.course_review_replies for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "course_review_replies_delete_own" on public.course_review_replies;
create policy "course_review_replies_delete_own"
  on public.course_review_replies for delete to authenticated
  using (auth.uid() = user_id);

-- ── course_review_reply_likes 策略 ──
drop policy if exists "course_review_reply_likes_select_authenticated" on public.course_review_reply_likes;
create policy "course_review_reply_likes_select_authenticated"
  on public.course_review_reply_likes for select to authenticated using (true);

drop policy if exists "course_review_reply_likes_insert_own" on public.course_review_reply_likes;
create policy "course_review_reply_likes_insert_own"
  on public.course_review_reply_likes for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "course_review_reply_likes_delete_own" on public.course_review_reply_likes;
create policy "course_review_reply_likes_delete_own"
  on public.course_review_reply_likes for delete to authenticated
  using (auth.uid() = user_id);
