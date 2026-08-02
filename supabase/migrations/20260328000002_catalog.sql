-- P3: platform catalog for agent tools (thin curated dataset from mockData)

create table if not exists public.subjects (
  id text primary key,
  name text not null,
  icon text not null default '',
  description text not null default '',
  color text not null default '#B8C4C4'
);

create table if not exists public.careers (
  id text primary key,
  name text not null,
  icon text not null default '',
  description text not null default '',
  color text not null default '#B8C4C4'
);

create table if not exists public.companies (
  id text primary key,
  name text not null,
  sector text not null default '',
  color text not null default '#B8C4C4'
);

create table if not exists public.courses (
  id text primary key,
  title text not null,
  description text not null default '',
  video_url text not null default 'https://www.bilibili.com/',
  cover_image text not null default '',
  company_id text references public.companies (id) on delete set null,
  rating numeric(3,1) not null default 0,
  rating_count integer not null default 0
);

create table if not exists public.career_courses (
  career_id text not null references public.careers (id) on delete cascade,
  course_id text not null references public.courses (id) on delete cascade,
  primary key (career_id, course_id)
);

create index if not exists courses_title_idx on public.courses (title);
create index if not exists careers_name_idx on public.careers (name);

alter table public.subjects enable row level security;
alter table public.careers enable row level security;
alter table public.companies enable row level security;
alter table public.courses enable row level security;
alter table public.career_courses enable row level security;

create policy "subjects_select_authenticated"
  on public.subjects for select to authenticated using (true);
create policy "careers_select_authenticated"
  on public.careers for select to authenticated using (true);
create policy "companies_select_authenticated"
  on public.companies for select to authenticated using (true);
create policy "courses_select_authenticated"
  on public.courses for select to authenticated using (true);
create policy "career_courses_select_authenticated"
  on public.career_courses for select to authenticated using (true);

-- Seed subjects
insert into public.subjects (id, name, icon, description, color) values
  ('1', '计算机科学', 'Cpu', '人工智能、编程、数据科学', '#B8C4C4'),
  ('2', '数学', 'Calculator', '代数、几何、微积分', '#B8C9B5'),
  ('3', '物理', 'Atom', '力学、电磁学、量子物理', '#D4C9B5'),
  ('4', '化学', 'FlaskConical', '有机化学、无机化学', '#C4B8C9'),
  ('5', '生物', 'Dna', '分子生物学、遗传学', '#C9B8B5'),
  ('6', '经济学', 'TrendingUp', '宏观经济、微观经济', '#D4A5A5'),
  ('7', '管理学', 'Briefcase', '市场营销、人力资源', '#B8C4C4'),
  ('8', '设计', 'Palette', '平面设计、UI设计', '#B8C9B5')
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
  description = excluded.description,
  color = excluded.color;

insert into public.careers (id, name, icon, description, color) values
  ('1', '软件工程师', 'Code', '从事软件开发、系统架构设计', '#B8C4C4'),
  ('2', '数据分析师', 'BarChart2', '数据分析、数据可视化、商业智能', '#B8C9B5'),
  ('3', '产品经理', 'Layout', '产品设计、需求分析、项目管理', '#D4C9B5'),
  ('4', 'UI/UX设计师', 'PenTool', '用户界面设计、用户体验优化', '#C4B8C9'),
  ('5', '人工智能工程师', 'Brain', '机器学习、深度学习、NLP', '#C9B8B5'),
  ('6', '金融分析师', 'LineChart', '投资分析、风险评估、财务建模', '#D4A5A5')
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
  description = excluded.description,
  color = excluded.color;

insert into public.companies (id, name, sector, color) values
  ('1', 'KPMG', '会计事务所', '#B8C4C4'),
  ('2', '东方财富', '券商', '#D4A5A5'),
  ('3', '字节跳动', '互联网', '#B8C9B5'),
  ('4', '腾讯', '互联网', '#C4B8C9')
on conflict (id) do update set
  name = excluded.name,
  sector = excluded.sector,
  color = excluded.color;

insert into public.courses (id, title, description, video_url, cover_image, company_id, rating, rating_count) values
  ('1', '财务报表分析', '本课程深入讲解资产负债表、利润表和现金流量表的编制原理，教您如何运用比率分析、趋势分析等方法评估企业财务状况，识别潜在风险。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=450&fit=crop', '1', 4.8, 1256),
  ('2', '审计基础入门', '从审计的基本概念入手，系统学习审计流程、审计证据收集、内部控制评价等核心内容。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop', '1', 4.6, 892),
  ('3', '税务筹划实务', '结合最新税收政策，深入讲解企业所得税、增值税等主要税种的筹划方法。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop', '1', 4.7, 654),
  ('4', '股票投资分析', '系统学习股票投资的基本面分析和技术分析方法。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800&h=450&fit=crop', '2', 4.9, 423),
  ('5', '金融产品解读', '全面解析股票、债券、基金、衍生品等各类金融产品的特点与风险。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop', '2', 4.8, 789),
  ('6', '量化交易入门', '介绍量化交易的基本概念和策略框架，含 Python 与回测入门。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop', '2', 4.5, 342),
  ('7', 'Python开发实战', '从 Python 基础到实战项目，覆盖 Web、数据分析与自动化。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=450&fit=crop', '3', 4.8, 1567),
  ('8', '产品设计方法论', '系统讲解产品设计全流程与互联网产品方法论。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop', '3', 4.9, 987),
  ('9', '数据分析与决策', '学习数据分析驱动业务决策的核心技能。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop', '3', 4.7, 856),
  ('10', '游戏开发入门', '游戏引擎、逻辑开发与入门实战。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=450&fit=crop', '4', 4.6, 1123),
  ('11', 'AI应用开发', '机器学习、深度学习与 AI 产品应用入门。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop', '4', 4.8, 765),
  ('12', '用户增长策略', '用户获取、激活、留存与增长黑客方法。', 'https://www.bilibili.com/', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop', '4', 4.9, 543)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  video_url = excluded.video_url,
  cover_image = excluded.cover_image,
  company_id = excluded.company_id,
  rating = excluded.rating,
  rating_count = excluded.rating_count;

insert into public.career_courses (career_id, course_id) values
  ('1', '7'), ('1', '10'),
  ('2', '9'), ('2', '6'),
  ('3', '8'), ('3', '12'),
  ('4', '8'),
  ('5', '11'), ('5', '7'),
  ('6', '1'), ('6', '4'), ('6', '5')
on conflict do nothing;
