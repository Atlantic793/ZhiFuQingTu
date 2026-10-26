// 把 supabase/seed/baoyan_*.json 导入 Supabase（配合 20260811000001_baoyan_schema.sql）。
//
// 用法：
//   环境变量需要 SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
//   （RLS 只放行 select，anon key 无法插入；service role key 严禁以 VITE_ 前缀入前端）
//   node scripts/import-baoyan-seed.mjs            # 幂等：表里已有数据则跳过
//   node scripts/import-baoyan-seed.mjs --force    # 清空 baoyan_programs / baoyan_universities 后重灌
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('缺少环境变量：SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY');
  console.error('RLS 下 anon key 无写权限，必须使用 service role key（仅命令行注入，勿入前端）');
  process.exit(1);
}

const force = process.argv.includes('--force');
const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

const universities = JSON.parse(readFileSync(join(root, 'supabase/seed/baoyan_universities.json'), 'utf8'));
const programs = JSON.parse(readFileSync(join(root, 'supabase/seed/baoyan_programs.json'), 'utf8'));

// 前置校验：programs 的 university_id 必须都能在 universities 里找到
const uniIds = new Set(universities.map((u) => u.id));
const orphans = new Set(programs.map((p) => p.university_id).filter((id) => id && !uniIds.has(id)));
if (orphans.size > 0) {
  console.error(`校验失败：${orphans.size} 个 program 引用了未知 university_id，请在源数据修正后重试`);
  process.exit(1);
}

async function currentCount(table) {
  const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

const [uniCount, progCount] = await Promise.all([currentCount('baoyan_universities'), currentCount('baoyan_programs')]);
console.log(`现有数据：baoyan_universities=${uniCount}, baoyan_programs=${progCount}`);

if (uniCount > 0 || progCount > 0) {
  if (!force) {
    console.log('表中已有数据，跳过（如需重灌请加 --force）');
    process.exit(0);
  }
  console.log('--force：清空后重灌…');
  const d1 = await supabase.from('baoyan_programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (d1.error) throw d1.error;
  const d2 = await supabase.from('baoyan_universities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (d2.error) throw d2.error;
}

async function insertChunked(table, rows, opts) {
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from(table).insert(chunk, opts);
    if (error) throw error;
    process.stdout.write(`\r${table}: ${Math.min(i + CHUNK, rows.length)}/${rows.length}`);
  }
  process.stdout.write('\n');
}

try {
  await insertChunked('baoyan_universities', universities, { ignoreDuplicates: true });
  await insertChunked('baoyan_programs', programs);
  console.log(`完成：universities ${universities.length} 行、programs ${programs.length} 行`);
} catch (err) {
  console.error('导入失败：', err.message ?? err);
  process.exit(1);
}
