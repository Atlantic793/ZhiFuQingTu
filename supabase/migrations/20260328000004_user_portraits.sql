-- P4: user portrait (个人画像) — separate 1:1 table linked to profiles,
--     plus subject_tiers reference table for major / careers / courses options.

create table if not exists public.subject_tiers (
  id bigint generated always as identity primary key,
  subject text not null unique,
  careers jsonb not null default '[]'::jsonb,
  courses jsonb not null default '[]'::jsonb,
  sort_order int not null default 0
);

alter table public.subject_tiers enable row level security;

create policy "subject_tiers_select_all"
  on public.subject_tiers for select to authenticated using (true);

create table if not exists public.user_portraits (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  major text not null,
  grade text not null,
  math_basis text not null default '',
  programming_basis text not null default '',
  english_level text not null default '',
  target_university text not null default '',
  target_careers jsonb not null default '[]'::jsonb,
  learned_courses jsonb not null default '[]'::jsonb,
  weak_points jsonb not null default '[]'::jsonb,
  weekly_hours text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_portraits enable row level security;

create policy "user_portraits_select_own"
  on public.user_portraits for select to authenticated using (auth.uid() = user_id);

create policy "user_portraits_insert_own"
  on public.user_portraits for insert to authenticated
  with check (auth.uid() = user_id);

create policy "user_portraits_update_own"
  on public.user_portraits for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_user_portraits_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_portraits_set_updated_at on public.user_portraits;

create trigger user_portraits_set_updated_at
  before update on public.user_portraits
  for each row
  execute function public.set_user_portraits_updated_at();
