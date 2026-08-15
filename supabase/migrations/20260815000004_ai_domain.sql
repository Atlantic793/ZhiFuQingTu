-- 人工智能专区：从计算机科学拆出 AI 应用开发专题
insert into public.subjects (id, name, icon, description, color) values
  ('9', '人工智能', 'Brain', '大模型、Agent、RAG 与 AI 应用开发', '#C9B8B5')
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
  description = excluded.description,
  color = excluded.color;

update public.subjects
set description = '编程、数据科学、游戏开发'
where id = '1';

update public.catalog_topics
set domain_id = '9'
where id = 'topic-11';
