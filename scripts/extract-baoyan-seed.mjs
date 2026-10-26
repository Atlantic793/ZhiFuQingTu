// 一次性工具：把 supabase/migrations/20260811000001_baoyan_schema_and_seed.sql 里的种子数据
// 提取为 supabase/seed/baoyan_universities.json 与 baoyan_programs.json，
// 之后由 scripts/import-baoyan-seed.mjs 导入数据库（schema 已拆到独立迁移文件）。
// 用法：node scripts/extract-baoyan-seed.mjs <sql文件路径>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sqlPath = process.argv[2] ?? join(root, 'supabase/migrations/20260811000001_baoyan_schema_and_seed.sql');
const sql = readFileSync(sqlPath, 'utf8');

/** 把 SQL 字面量（带可选 ::type 后缀）还原为 JS 值 */
function literalToValue(raw) {
  let v = raw.trim();
  v = v.replace(/::[a-z ]+$/i, '').trim(); // 去 ::timestamptz 等后缀
  if (/^null$/i.test(v)) return null;
  if (v.startsWith("'")) {
    if (!v.endsWith("'")) throw new Error(`字符串未闭合: ${v.slice(0, 60)}`);
    return v.slice(1, -1).replace(/''/g, "'");
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

/** 字符串感知地在“顶层逗号”处切分，支持 '' 转义与括号嵌套 */
function splitTopLevel(text, sep = ',') {
  const parts = [];
  let depth = 0, inStr = false, cur = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      cur += c;
      if (c === "'") {
        if (text[i + 1] === "'") { cur += "'"; i++; } else { inStr = false; }
      }
      continue;
    }
    if (c === "'") { inStr = true; cur += c; continue; }
    if (c === '(' || c === '[') depth++;
    if (c === ')' || c === ']') depth--;
    if (c === sep && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

/** 找到 insert ... values 的行集合（字符串感知，跨行） */
function extractRows(insertSpec) {
  const rows = [];
  const re = new RegExp(`insert into ${insertSpec}\\s*values([\\s\\S]*?);`, 'gi');
  let m;
  while ((m = re.exec(sql)) !== null) {
    let body = m[1];
    // 语句级 on conflict 后缀（不含在字符串内）截断，如 "...) on conflict (name) do nothing"
    {
      let inStr = false;
      for (let i = 0; i < body.length; i++) {
        const c = body[i];
        if (inStr) { if (c === "'") { if (body[i + 1] === "'") i++; else inStr = false; } continue; }
        if (c === "'") { inStr = true; continue; }
        if (/^on\s+conflict\b/i.test(body.slice(i)) && /\)\s*$/.test(body.slice(0, i))) {
          // 保留行本身的收尾 ')'，去掉后面的空白与 on conflict 子句
          body = body.slice(0, i).trimEnd();
          break;
        }
      }
    }
    for (const rowText of splitTopLevel(body)) {
      const t = rowText.trim();
      if (!t.startsWith('(')) continue;
      // 去掉首尾括号
      const inner = t.slice(1, t.lastIndexOf(')'));
      rows.push(splitTopLevel(inner).map(literalToValue));
    }
  }
  return rows;
}

const universidades = extractRows('public\\.baoyan_universities \\(id, name\\)')
  .map(([id, name]) => ({ id, name }));

const programCols = ['university_id', 'program_name', 'url', 'category', 'deadline_status', 'deadline', 'deadline_raw', 'source_url', 'published_at', 'checked_at'];
const programas = extractRows('public\\.baoyan_programs \\(university_id, program_name, url, category, deadline_status, deadline, deadline_raw, source_url, published_at, checked_at\\)')
  .map((vals) => {
    if (vals.length !== programCols.length) throw new Error(`字段数不符: ${vals.length} (期望 ${programCols.length})`);
    const row = {};
    programCols.forEach((col, i) => { row[col] = vals[i]; });
    return row;
  });

const outDir = join(root, 'supabase/seed');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'baoyan_universities.json'), JSON.stringify(universidades, null, 1) + '\n', 'utf8');
// programs 量大（2100+ 行），用紧凑格式减小仓库体积
writeFileSync(join(outDir, 'baoyan_programs.json'), JSON.stringify(programas) + '\n', 'utf8');

const uniIds = new Set(universidades.map((u) => u.id));
const orphan = programas.filter((p) => p.university_id && !uniIds.has(p.university_id)).length;
console.log(`universities: ${universidades.length} rows`);
console.log(`programs:     ${programas.length} rows`);
console.log(`orphan program university_id: ${orphan}`);
