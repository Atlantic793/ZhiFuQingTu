-- 课程推荐人 / 贡献者展示
alter table public.courses
  add column if not exists recommended_by uuid references public.profiles (id) on delete set null,
  add column if not exists contributor_name text not null default '开发团队';

update public.courses
set contributor_name = '开发团队'
where contributor_name is null or contributor_name = '';

create index if not exists courses_recommended_by_idx
  on public.courses (recommended_by)
  where recommended_by is not null;
