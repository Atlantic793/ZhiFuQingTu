import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const chapters = JSON.parse(
  readFileSync(resolve(root, 'src/data/fixtures/course-7-chapters.json'), 'utf8')
);
const cover =
  'https://i2.hdslb.com/bfs/archive/a979056b1a32012cdd00d48fbc3732d253e30620.jpg';
const json = JSON.stringify(chapters).replace(/'/g, "''");
const sql = `-- Full pagelist (${chapters.length}P) for course 7 BV1rpWjevEip
update public.courses
set
  cover_image = '${cover}',
  bvid = 'BV1rpWjevEip',
  video_url = 'https://www.bilibili.com/video/BV1rpWjevEip',
  chapters = '${json}'::jsonb
where id = '7';
`;
writeFileSync(resolve(root, 'supabase/migrations/20260328000006_python_full_chapters.sql'), sql);
console.log('wrote migration with', chapters.length, 'chapters');
