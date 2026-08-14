-- 考研真题：页面图片元数据表 + 私有 storage bucket
-- 一份真题 = 多张页面图片（每页一张 .jpg/.png），file_paths 存页面路径数组。
-- V1：仅脚本（service role）写入，站内登录用户只读已审核(approved)的真题；
--     用户上传 + 管理员审核留待 V2（表结构已预留 status 字段）。
-- 执行方式：Supabase SQL Editor 按序粘贴执行（幂等，可重复运行）。
-- 注意：若已执行过旧版（file_path 单列版），请先 drop table public.kaoyan_papers 再执行本文件。

-- 1) 真题表
create table if not exists public.kaoyan_papers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,          -- 脚本 upsert 的幂等键，如 数学一-2025-<hash8>
  title text not null,
  year integer not null check (year between 1980 and 2100),
  subject text not null check (
    subject in ('政治', '数学', '英语', '专业课')
  ),
  category text,  -- 专业课的二级分类（如 计算机/机械/经管），暂不建类别表；以后要规范时再加类别表迁移
  content text,   -- 纯文本条目正文（回忆版/真题分析类，无图片）；图片类条目为 null
  file_paths jsonb not null default '[]',  -- 页面图片路径数组，如 ["approved/数学-2025-abcd1234/01.jpg", ...]
  file_size bigint not null default 0,     -- 所有页面图片总字节数
  uploaded_by uuid references public.profiles (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);

create index if not exists kaoyan_papers_status_year_idx on public.kaoyan_papers (status, year desc);
create index if not exists kaoyan_papers_subject_idx on public.kaoyan_papers (subject, category);

alter table public.kaoyan_papers enable row level security;

-- V1 只读策略：登录用户仅能看到 approved 真题。
-- V2 加用户上传时：select 追加 or uploaded_by = auth.uid()（本人 pending 可见），
--                 并补 insert（仅本人、仅 pending）与管理员 update/delete 策略。
drop policy if exists "kaoyan_papers_select_approved" on public.kaoyan_papers;
create policy "kaoyan_papers_select_approved"
  on public.kaoyan_papers
  for select
  to authenticated
  using (status = 'approved');

-- 2) 私有 bucket：仅页面图片、单文件 20MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kaoyan-papers',
  'kaoyan-papers',
  false,
  20971520,
  array['image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 3) 对象读取策略：登录用户仅能对 approved/ 下的文件签名访问（createSignedUrl）。
--    V2：追加 or (storage.foldername(name))[2] = auth.uid()::text（本人 pending 文件）
drop policy if exists "kaoyan_papers_read_approved" on storage.objects;
create policy "kaoyan_papers_read_approved"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'kaoyan-papers'
    and (storage.foldername(name))[1] = 'approved'
  );
