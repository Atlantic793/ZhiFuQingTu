-- Smoke: 将「Python开发实战」专题下课程 id=7 替换为真实 BV 元数据（BV1rpWjevEip）
-- 数据来自 scripts/bilibili-fetch-smoke.mjs 冒烟拉取

update public.courses
set
  topic_id = 'topic-7',
  bvid = 'BV1rpWjevEip',
  title = '【全748集】目前B站最全最细的Python零基础全套教程，2026最新版',
  description = '本套教程从零开始讲解，手把手教学，包含基础语法、进阶语法、爬虫、自动化办公、数据分析。无论是新手小白，还是有一定编码经验的选手，皆可学习。',
  intro = '本套教程从零开始讲解，手把手教学，包含基础语法、进阶语法、爬虫、自动化办公、数据分析。无论是新手小白，还是有一定编码经验的选手，皆可学习。',
  video_url = 'https://www.bilibili.com/video/BV1rpWjevEip',
  cover_image = 'https://i2.hdslb.com/bfs/archive/a979056b1a32012cdd00d48fbc3732d253e30620.jpg',
  owner_name = 'Python官方课程',
  owner_mid = '3546597933714079',
  duration = 143894,
  view_count = 18487873,
  danmaku_count = 122106,
  reply_count = 325769,
  chapters = '[
    {"cid":"36010133667","title":"【课前篇】Python从0到1学习指南","page":1,"duration":164},
    {"cid":"500001658674168","title":"【语法基础】Python、PyCharm的安装与相关配置","page":2,"duration":2503},
    {"cid":"500001657139640","title":"【语法基础】了解Python，并编写第一个程序，常见的bug","page":3,"duration":1746},
    {"cid":"500001657139598","title":"【语法基础】debug、注释与输出函数","page":4,"duration":1642},
    {"cid":"500001657139875","title":"【语法基础】变量与标识符","page":5,"duration":1706},
    {"cid":"500001657139713","title":"【语法基础】数值类型、字符串与格式化输出","page":6,"duration":1921},
    {"cid":"500001657142303","title":"【语法基础】算数与赋值运算符、输入函数与转义字符","page":7,"duration":2302},
    {"cid":"500001657142759","title":"【语法基础】if判断、比较运算符与逻辑运算符","page":8,"duration":1608}
  ]'::jsonb
where id = '7';

-- 确保专题名仍是「Python开发实战」
update public.catalog_topics
set name = 'Python开发实战'
where id = 'topic-7';
