-- Schema: baoyan（保研）信息
-- Tables: baoyan_universities, baoyan_programs
--
-- 种子数据已拆分至 supabase/seed/baoyan_universities.json 与 baoyan_programs.json，
-- 由 `npm run seed:baoyan`（scripts/import-baoyan-seed.mjs）导入，避免把 2100+ 行数据
-- 打进迁移造成数据库 bloat 与 diff 噪音。

create table if not exists public.baoyan_universities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  tier text,
  region text,
  created_at timestamptz not null default now()
);

create table if not exists public.baoyan_programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.baoyan_universities(id) on delete cascade,
  program_name text not null,
  url text not null default '',
  category text not null,
  deadline_status text not null default 'tba',
  deadline timestamptz,
  deadline_raw text not null default '',
  source_url text not null default '',
  published_at timestamptz,
  checked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_baoyan_programs_university on public.baoyan_programs(university_id);
create index if not exists idx_baoyan_programs_category on public.baoyan_programs(category);
create index if not exists idx_baoyan_programs_status on public.baoyan_programs(deadline_status);
create index if not exists idx_baoyan_programs_deadline on public.baoyan_programs(deadline desc);

alter table public.baoyan_universities enable row level security;
alter table public.baoyan_programs enable row level security;

drop policy if exists "baoyan_universities_select_authenticated" on public.baoyan_universities;
create policy "baoyan_universities_select_authenticated"
  on public.baoyan_universities for select to authenticated using (true);

drop policy if exists "baoyan_universities_select_anon" on public.baoyan_universities;
create policy "baoyan_universities_select_anon"
  on public.baoyan_universities for select to anon using (true);

drop policy if exists "baoyan_programs_select_authenticated" on public.baoyan_programs;
create policy "baoyan_programs_select_authenticated"
  on public.baoyan_programs for select to authenticated using (true);

drop policy if exists "baoyan_programs_select_anon" on public.baoyan_programs;
create policy "baoyan_programs_select_anon"
  on public.baoyan_programs for select to anon using (true);
