-- Training job library (public career-site JDs for /training browse)

create table if not exists public.training_jobs (
  id text primary key,
  source text not null default 'jobhunt-cli',
  site text not null,
  external_id text not null,
  job_code text,
  title text not null,
  url text not null default '',
  category_name text not null default '',
  nature_code text not null default '',
  nature_name text not null default '',
  location_names text not null default '',
  department_name text not null default '',
  description text not null default '',
  requirement text not null default '',
  source_updated_at text not null default '',
  search_query text not null default '',
  search_nature text not null default '',
  major_seed_id text not null default '',
  major_seed_name text not null default '',
  suitable_majors jsonb not null default '[]'::jsonb,
  suitable_majors_note text not null default '',
  raw jsonb not null default '{}'::jsonb,
  fetched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site, external_id)
);

create index if not exists training_jobs_site_idx on public.training_jobs (site);
create index if not exists training_jobs_nature_code_idx on public.training_jobs (nature_code);
create index if not exists training_jobs_major_seed_id_idx on public.training_jobs (major_seed_id);
create index if not exists training_jobs_title_idx on public.training_jobs (title);

alter table public.training_jobs enable row level security;

drop policy if exists "training_jobs_select_authenticated" on public.training_jobs;
create policy "training_jobs_select_authenticated"
  on public.training_jobs for select to authenticated using (true);

drop policy if exists "training_jobs_select_anon" on public.training_jobs;
create policy "training_jobs_select_anon"
  on public.training_jobs for select to anon using (true);

comment on table public.training_jobs is
  'Curated job JDs from public company career APIs for occupational training browse. No auto-apply.';
