-- P4: rating framework — 三级目录 + 平台评分/收藏（无真实 BV / 无源站抓取）

-- ─── topics（专题，挂在 subjects 领域下）───────────────────────────────────
create table if not exists public.catalog_topics (
  id text primary key,
  domain_id text not null references public.subjects (id) on delete cascade,
  name text not null,
  slug text not null default '',
  description text not null default '',
  cover_image text not null default '',
  sort_order integer not null default 0
);

create index if not exists catalog_topics_domain_idx on public.catalog_topics (domain_id);

alter table public.catalog_topics enable row level security;

drop policy if exists "catalog_topics_select_authenticated" on public.catalog_topics;
create policy "catalog_topics_select_authenticated"
  on public.catalog_topics for select to authenticated using (true);

-- ─── courses 扩展（叶子课 = 将来的 BV 课）──────────────────────────────────
alter table public.courses
  add column if not exists topic_id text references public.catalog_topics (id) on delete set null,
  add column if not exists bvid text,
  add column if not exists owner_name text not null default '',
  add column if not exists owner_mid text not null default '',
  add column if not exists duration integer not null default 0,
  add column if not exists view_count integer not null default 0,
  add column if not exists danmaku_count integer not null default 0,
  add column if not exists reply_count integer not null default 0,
  add column if not exists chapters jsonb not null default '[]'::jsonb,
  add column if not exists intro text not null default '',
  add column if not exists platform_rating numeric(3,1) not null default 0,
  add column if not exists platform_rating_count integer not null default 0,
  add column if not exists source_score numeric(3,1),
  add column if not exists source_summary text not null default '';

create index if not exists courses_topic_idx on public.courses (topic_id);

-- 同步旧 rating → platform_*（首次迁移）
update public.courses
set
  platform_rating = coalesce(nullif(platform_rating, 0), rating, 0),
  platform_rating_count = coalesce(nullif(platform_rating_count, 0), rating_count, 0),
  intro = case when intro = '' then description else intro end
where true;

-- ─── 从现有粗粒度课名生成专题，并把原课降为叶子占位课 ─────────────────────
-- domain 映射：财务/金融 → 经济学(6)；产品/增长 → 管理学(7)；其余编程/数据/游戏/AI → 计算机科学(1)
insert into public.catalog_topics (id, domain_id, name, slug, description, cover_image, sort_order)
select
  'topic-' || c.id,
  case c.id
    when '1' then '6' when '2' then '6' when '3' then '6'
    when '4' then '6' when '5' then '6' when '6' then '6'
    when '8' then '7' when '12' then '7'
    else '1'
  end,
  regexp_replace(c.title, '\s*·\s*占位课.*$', ''),
  'topic-' || c.id,
  c.description,
  c.cover_image,
  c.id::integer
from public.courses c
where c.id ~ '^\d+$'
  and c.id::integer between 1 and 12
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  cover_image = excluded.cover_image,
  domain_id = excluded.domain_id,
  sort_order = excluded.sort_order;

-- 原 12 门课：挂到对应专题，标题改为占位叶子课，bvid 空（可重复执行）
update public.courses c
set
  topic_id = 'topic-' || c.id,
  title = case
    when c.title like '%· 占位课%' then c.title
    else c.title || ' · 占位课 A'
  end,
  bvid = null,
  chapters = case
    when jsonb_array_length(coalesce(c.chapters, '[]'::jsonb)) > 0 then c.chapters
    else jsonb_build_array(
      jsonb_build_object('cid', 'p1', 'title', '第 1 讲 · 导论', 'page', 1, 'duration', 600),
      jsonb_build_object('cid', 'p2', 'title', '第 2 讲 · 核心概念', 'page', 2, 'duration', 900),
      jsonb_build_object('cid', 'p3', 'title', '第 3 讲 · 实战练习', 'page', 3, 'duration', 1200)
    )
  end,
  video_url = 'https://www.bilibili.com/'
where c.id ~ '^\d+$'
  and c.id::integer between 1 and 12;

-- 每个专题再加一门占位课 B（新 id）
insert into public.courses (
  id, title, description, video_url, cover_image, company_id,
  rating, rating_count, topic_id, bvid, chapters, intro,
  platform_rating, platform_rating_count
)
select
  c.id || '-b',
  replace(c.title, ' · 占位课 A', '') || ' · 占位课 B',
  c.description,
  'https://www.bilibili.com/',
  c.cover_image,
  c.company_id,
  greatest(c.rating - 0.2, 3.5),
  greatest(c.rating_count / 3, 10),
  c.topic_id,
  null,
  jsonb_build_array(
    jsonb_build_object('cid', 'p1', 'title', '开篇', 'page', 1, 'duration', 480),
    jsonb_build_object('cid', 'p2', 'title', '进阶', 'page', 2, 'duration', 720)
  ),
  c.intro,
  greatest(c.platform_rating - 0.2, 3.5),
  greatest(c.platform_rating_count / 3, 10)
from public.courses c
where c.topic_id is not null
  and c.id ~ '^\d+$'
  and c.id::integer between 1 and 12
on conflict (id) do update set
  title = excluded.title,
  topic_id = excluded.topic_id,
  chapters = excluded.chapters;

-- ─── 平台评价 / 收藏 ───────────────────────────────────────────────────────
-- 评价区需要读取他人昵称/头像
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select to authenticated using (true);

create table if not exists public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  score smallint not null check (score >= 1 and score <= 5),
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, user_id)
);

create index if not exists course_reviews_course_idx on public.course_reviews (course_id);
create index if not exists course_reviews_user_idx on public.course_reviews (user_id);

create table if not exists public.course_favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create index if not exists course_favorites_user_idx on public.course_favorites (user_id);

alter table public.course_reviews enable row level security;
alter table public.course_favorites enable row level security;

drop policy if exists "course_reviews_select_authenticated" on public.course_reviews;
create policy "course_reviews_select_authenticated"
  on public.course_reviews for select to authenticated using (true);

drop policy if exists "course_reviews_insert_own" on public.course_reviews;
create policy "course_reviews_insert_own"
  on public.course_reviews for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "course_reviews_update_own" on public.course_reviews;
create policy "course_reviews_update_own"
  on public.course_reviews for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "course_reviews_delete_own" on public.course_reviews;
create policy "course_reviews_delete_own"
  on public.course_reviews for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "course_favorites_select_authenticated" on public.course_favorites;
create policy "course_favorites_select_authenticated"
  on public.course_favorites for select to authenticated using (true);

drop policy if exists "course_favorites_insert_own" on public.course_favorites;
create policy "course_favorites_insert_own"
  on public.course_favorites for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "course_favorites_delete_own" on public.course_favorites;
create policy "course_favorites_delete_own"
  on public.course_favorites for delete to authenticated
  using (auth.uid() = user_id);

-- ─── 聚合平台评分 ──────────────────────────────────────────────────────────
create or replace function public.refresh_course_platform_rating(p_course_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  avg_score numeric(3,1);
  cnt integer;
begin
  select coalesce(round(avg(score)::numeric, 1), 0), count(*)::integer
    into avg_score, cnt
  from public.course_reviews
  where course_id = p_course_id;

  update public.courses
  set
    platform_rating = avg_score,
    platform_rating_count = cnt,
    rating = avg_score,
    rating_count = cnt
  where id = p_course_id;
end;
$$;

create or replace function public.trg_course_reviews_refresh_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_course_platform_rating(old.course_id);
    return old;
  end if;
  perform public.refresh_course_platform_rating(new.course_id);
  if tg_op = 'UPDATE' and old.course_id is distinct from new.course_id then
    perform public.refresh_course_platform_rating(old.course_id);
  end if;
  return new;
end;
$$;

drop trigger if exists course_reviews_refresh_rating on public.course_reviews;
create trigger course_reviews_refresh_rating
  after insert or update or delete on public.course_reviews
  for each row execute function public.trg_course_reviews_refresh_rating();

create or replace function public.set_course_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists course_reviews_set_updated_at on public.course_reviews;
create trigger course_reviews_set_updated_at
  before update on public.course_reviews
  for each row execute function public.set_course_reviews_updated_at();
