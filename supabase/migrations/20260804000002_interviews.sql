-- Interview module for /training: curated interview experiences + question bank.

create table if not exists public.interview_experiences (
  id text primary key,
  career_name text not null default '',
  company text not null default '',
  title text not null,
  tags jsonb not null default '[]'::jsonb,
  content text not null default '',
  source text not null default 'curated',
  source_url text not null default '',
  author text not null default '',
  like_count integer not null default 0,
  collected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interview_experiences_career_idx on public.interview_experiences (career_name);
create index if not exists interview_experiences_company_idx on public.interview_experiences (company);

create table if not exists public.interview_questions (
  id text primary key,
  career_name text not null default '',
  company text not null default '',
  category text not null default 'behavioral',
  question text not null,
  answer_hint text not null default '',
  difficulty text not null default 'medium',
  tags jsonb not null default '[]'::jsonb,
  source text not null default 'curated',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interview_questions_career_idx on public.interview_questions (career_name);
create index if not exists interview_questions_company_idx on public.interview_questions (company);
create index if not exists interview_questions_category_idx on public.interview_questions (category);

alter table public.interview_experiences enable row level security;
alter table public.interview_questions enable row level security;

drop policy if exists "interview_experiences_select_authenticated" on public.interview_experiences;
create policy "interview_experiences_select_authenticated"
  on public.interview_experiences for select to authenticated using (true);

drop policy if exists "interview_experiences_select_anon" on public.interview_experiences;
create policy "interview_experiences_select_anon"
  on public.interview_experiences for select to anon using (true);

drop policy if exists "interview_questions_select_authenticated" on public.interview_questions;
create policy "interview_questions_select_authenticated"
  on public.interview_questions for select to authenticated using (true);

drop policy if exists "interview_questions_select_anon" on public.interview_questions;
create policy "interview_questions_select_anon"
  on public.interview_questions for select to anon using (true);

comment on table public.interview_experiences is
  'Curated interview experiences (process, mindset, commonly asked questions) for /training interview browse.';
comment on table public.interview_questions is
  'Curated interview question bank with optional AI-generated answer hints.';
