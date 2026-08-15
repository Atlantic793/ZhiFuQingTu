/**
 * Import kaoyan exam-paper page images into Supabase Storage + `kaoyan_papers`.
 *
 * Usage:
 *   npm run papers:import
 *   npm run papers:import -- --dry-run
 *
 * Manifest: scripts/data/papers-manifest.json（数组，每项 = 一份真题）：
 *   { "files": ["D:/考研真题/2025数学一/01.jpg", "D:/考研真题/2025数学一/02.jpg"],
 *     "year": 2025, "subject": "数学一", "title": "2025 考研数学一真题" }
 *   - files 为该真题所有页面图片（按页面顺序，.jpg/.jpeg/.png）
 *   - subject 必须与迁移 check 约束一致（政治/数学/英语/专业课，不再细分一二三）
 *   - category 可省略，专业课的二级分类（如 计算机/机械/经管），非专业课留空
 *   - content 可省略，纯文本条目（回忆版/真题分析）的正文；有图片的条目留空
 *   - title 可省略，默认「{year} 考研{subject}真题」
 *
 * 上传到 storage bucket `kaoyan-papers` 的 approved/<subject>-<year>-<hash8>/ 目录
 * （页面按 01.jpg、02.jpg… 编号），并写入 status='approved' 的数据库行。
 * service role 绕过 RLS，站点登录用户即可在考研信息页翻页查看。
 *
 * Requires:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from './loadEnv.mjs';
import { createAdminClient, upsertKaoyanPaper } from './lib/supabaseAdmin.mjs';

loadEnvFile('.env');

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST = resolve(__dirname, 'data/papers-manifest.json');

const SUBJECTS = new Set(['政治', '数学', '英语', '专业课']);

/** Storage 对象 key 只允许 ASCII（a-zA-Z0-9-_./），科目目录用拼音代码；中文只存数据库字段 */
const SUBJECT_DIR = {
  政治: 'zhengzhi',
  数学: 'shuxue',
  英语: 'yingyu',
  专业课: 'zhuanyeke',
};

/**
 * 爬虫产出的图片存在「PNG 数据套 .jpg 扩展名」的情况，扩展名不可信。
 * 按 magic bytes 识别真实类型，返回 { ext, contentType }。
 */
function detectImageType(buf) {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { ext: '.png', contentType: 'image/png' };
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: '.jpg', contentType: 'image/jpeg' };
  }
  return null;
}

function parseArgs(argv) {
  const flags = new Set(argv.slice(2).filter((a) => a.startsWith('--')));
  return { dryRun: flags.has('--dry-run') };
}

/** 文件列表 hash 前 8 位，作为目录与 slug 的幂等键（文件路径变化会导致重复入库）。 */
function hash8(files) {
  return createHash('sha1').update(files.join('|')).digest('hex').slice(0, 8);
}

function pageName(index, detected) {
  return `${String(index + 1).padStart(2, '0')}${detected.ext}`;
}

function defaultTitle(entry) {
  return `${entry.year} 考研${entry.subject}真题`;
}

async function main() {
  const { dryRun } = parseArgs(process.argv);
  const payload = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const entries = Array.isArray(payload) ? payload : [];
  if (entries.length === 0) {
    throw new Error(`manifest 无条目：${MANIFEST}`);
  }

  console.log(`[papers:import] manifest=${entries.length} dryRun=${dryRun}`);

  const ready = [];
  let missingFiles = 0;
  for (const entry of entries) {
    if (!Array.isArray(entry.files)) {
      throw new Error(`files 非数组：${entry.title || entry.year}`);
    }
    if (entry.files.length === 0 && !entry.content) {
      throw new Error(`无图片且无正文（content）的条目：${entry.title || entry.year}`);
    }
    if (!SUBJECTS.has(entry.subject)) {
      throw new Error(`非法科目「${entry.subject}」：${entry.files[0] || entry.title}`);
    }
    const absent = entry.files.filter((file) => !existsSync(file));
    if (absent.length > 0) {
      missingFiles += 1;
      console.warn(`[papers:import] skip (缺图 ${absent.length}/${entry.files.length}) ${entry.title || defaultTitle(entry)}`);
      continue;
    }
    for (const file of entry.files) {
      const head = readFileSync(file).subarray(0, 8);
      if (!detectImageType(head)) {
        throw new Error(`不支持的图片格式（仅 JPG/PNG）：${file}`);
      }
    }
    ready.push(entry);
    if (dryRun) {
      const desc = entry.files.length > 0
        ? `${entry.files.length} 页`
        : `文本 ${String(entry.content).length} 字`;
      console.log(`  - [${entry.year}] ${entry.subject} · ${entry.title || defaultTitle(entry)} · ${desc}`);
    }
  }
  if (missingFiles > 0) {
    console.warn(`[papers:import] ${missingFiles} 条因本机没有图片文件已跳过（清单路径多半是 D:\\\\爬虫\\\\output\\\\kaoyan）`);
  }
  if (dryRun) {
    console.log('[papers:import] dry-run done');
    return;
  }

  const supabase = createAdminClient();
  let ok = 0;
  let skipped = 0;
  for (const entry of ready) {
    // 文本条目没有文件，用标题参与 hash 保证 slug 唯一且幂等
    const hashInput = entry.files.length > 0 ? entry.files : [entry.title];
    const slug = `${entry.subject}-${entry.year}-${hash8(hashInput)}`;
    const dir = `approved/${SUBJECT_DIR[entry.subject]}-${entry.year}-${hash8(hashInput)}`;

    // 断点续传：该 slug 已入库则跳过（重跑时避免重复上传几百张图）
    const { data: existingRow } = await supabase
      .from('kaoyan_papers')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (existingRow?.id) {
      skipped += 1;
      console.log(`[papers:import] skip (exists) ${slug}`);
      continue;
    }

    const paths = [];
    let totalSize = 0;
    for (let i = 0; i < entry.files.length; i += 1) {
      const file = entry.files[i];
      const buf = readFileSync(file);
      const detected = detectImageType(buf);
      if (!detected) throw new Error(`不支持的图片格式（仅 JPG/PNG）：${file}`);
      const path = `${dir}/${pageName(i, detected)}`;
      // 网络抖动重试 3 次，每次间隔 2 秒
      let uploadError = null;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        const res = await supabase.storage
          .from('kaoyan-papers')
          .upload(path, buf, { contentType: detected.contentType, upsert: true });
        uploadError = res.error;
        if (!uploadError) break;
        if (attempt < 3) {
          console.warn(`[papers:import] upload retry ${attempt}/3: ${file} (${uploadError.message})`);
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
      if (uploadError) throw new Error(`upload ${file}: ${uploadError.message}`);
      paths.push(path);
      totalSize += statSync(file).size;
    }

    const saved = await upsertKaoyanPaper(supabase, {
      slug,
      title: entry.title || defaultTitle(entry),
      year: entry.year,
      subject: entry.subject,
      category: entry.category ?? null,
      content: entry.content ?? null,
      file_paths: paths,
      file_size: totalSize,
      status: 'approved',
    });
    ok += 1;
    console.log(`[papers:import] upsert ${saved.id} · ${saved.title} · ${paths.length} 页`);
  }

  const { count, error } = await supabase
    .from('kaoyan_papers')
    .select('id', { count: 'exact', head: true });
  if (error) throw new Error(`count kaoyan_papers: ${error.message}`);

  console.log(`[papers:import] done uploaded=${ok} skipped=${skipped} table_count=${count}`);

  // Windows 下 supabase-js 的 undici 连接池在退出时偶发 libuv 断言崩溃，显式退出规避
  process.exit(0);
}

main().catch((err) => {
  console.error('[papers:import] failed:', err.message || err);
  process.exit(1);
});
