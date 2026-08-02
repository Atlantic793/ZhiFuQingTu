/**
 * 批量导入 B 站课程 → Supabase（元数据 + 分 P + 源站口碑摘要）
 *
 * 用法：
 *   npm.cmd run bili:import -- scripts/data/courses.example.csv
 *   npm.cmd run bili:import -- path/to/list.csv --dry-run
 *   npm.cmd run bili:import -- path/to/list.csv --skip-summary
 *
 * .env 需要：
 *   VITE_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   （service_role，不要用 anon）
 *   GLM_SUMMARY_API_KEY=...         （除非 --skip-summary）
 *
 * CSV 表头示例见 scripts/data/courses.example.csv
 */

import { resolve } from 'node:path';
import { loadEnvFile } from './loadEnv.mjs';
import { extractBvid, fetchVideoBundle, sleep } from './lib/bilibiliClient.mjs';
import { loadCourseList } from './lib/parseCourseList.mjs';
import { summarizeCourse } from './lib/summarizeCourse.mjs';
import { createAdminClient, ensureTopic, upsertCourse } from './lib/supabaseAdmin.mjs';

loadEnvFile('.env');

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const file = args.find((a) => !a.startsWith('--'));
  return {
    file,
    dryRun: flags.has('--dry-run'),
    skipSummary: flags.has('--skip-summary'),
  };
}

function toDbRow(courseId, topicId, companyId, bundle, summary) {
  const intro = bundle.desc || '';
  return {
    id: courseId,
    title: bundle.title,
    description: intro,
    intro,
    video_url: bundle.videoUrl,
    cover_image: bundle.coverImage,
    company_id: companyId || null,
    topic_id: topicId,
    bvid: bundle.bvid,
    owner_name: bundle.ownerName,
    owner_mid: bundle.ownerMid,
    duration: bundle.duration,
    view_count: bundle.viewCount,
    danmaku_count: bundle.danmakuCount,
    reply_count: bundle.replyCount,
    chapters: bundle.chapters,
    source_summary: summary?.sourceSummary || '',
    source_score: summary?.sourceScore ?? null,
    // 保留平台分字段默认值；若已有用户评分，可用 ignoreDuplicates 策略——这里 upsert 不覆盖 rating 时需先读
    rating: 0,
    rating_count: 0,
    platform_rating: 0,
    platform_rating_count: 0,
  };
}

async function importOne(supabase, item, { dryRun, skipSummary }) {
  const bvid = extractBvid(item.bvid || item.url);
  if (!bvid) throw new Error('无法解析 bvid');

  console.log(`\n[import] ▶ ${bvid} → course_id=${item.courseId} topic=${item.topicId}`);

  const bundle = await fetchVideoBundle(bvid);
  console.log(
    `[import] meta ok ·「${bundle.title.slice(0, 40)}」· P${bundle.chapters.length} · 评${bundle.replyCount}`
  );

  let summary = null;
  if (!skipSummary && !item.skipSummary) {
    console.log('[import] summarizing…');
    summary = await summarizeCourse({
      aid: bundle.aid,
      cid: bundle.cid,
      bvid: bundle.bvid,
      title: bundle.title,
      ownerName: bundle.ownerName,
      replyCount: bundle.replyCount,
    });
    console.log(
      `[import] summary ok · score=${summary.sourceScore} · samples=${JSON.stringify(summary.sampleSizes)}`
    );
  } else {
    console.log('[import] skip summary');
  }

  const row = toDbRow(item.courseId, item.topicId, item.companyId, bundle, summary);

  if (dryRun) {
    console.log('[import] dry-run · 不写库', {
      id: row.id,
      topic_id: row.topic_id,
      bvid: row.bvid,
      chapters: row.chapters.length,
      source_score: row.source_score,
      title: row.title.slice(0, 48),
    });
    return { ok: true, dryRun: true, id: row.id };
  }

  await ensureTopic(supabase, {
    topicId: item.topicId,
    topicName: item.topicName || item.topicId,
    domainId: item.domainId,
    coverImage: bundle.coverImage,
    description: bundle.desc.slice(0, 200),
  });

  // 避免覆盖已有平台评分：先读再合并
  const { data: existing } = await supabase
    .from('courses')
    .select('rating, rating_count, platform_rating, platform_rating_count')
    .eq('id', item.courseId)
    .maybeSingle();
  if (existing) {
    row.rating = existing.rating ?? row.rating;
    row.rating_count = existing.rating_count ?? row.rating_count;
    row.platform_rating = existing.platform_rating ?? row.platform_rating;
    row.platform_rating_count = existing.platform_rating_count ?? row.platform_rating_count;
  }

  await upsertCourse(supabase, row);
  console.log(`[import] ✓ wrote courses.id=${row.id}`);
  return { ok: true, id: row.id, sourceScore: row.source_score };
}

async function main() {
  const { file, dryRun, skipSummary } = parseArgs(process.argv);
  if (!file) {
    console.error(`用法: npm.cmd run bili:import -- <list.csv|list.json> [--dry-run] [--skip-summary]

CSV 至少需要列: bvid 或 url, topic_id
可选: course_id, topic_name, domain_id, company_id, skip_summary`);
    process.exit(1);
  }

  const listPath = resolve(process.cwd(), file);
  const items = loadCourseList(listPath);
  if (!items.length) {
    console.error('[import] 列表为空或缺少 bvid/topic_id');
    process.exit(1);
  }

  console.log(
    `[import] loaded ${items.length} courses from ${listPath}${dryRun ? ' (dry-run)' : ''}${
      skipSummary ? ' (skip-summary)' : ''
    }`
  );

  const supabase = dryRun ? null : createAdminClient();
  const results = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const r = await importOne(supabase, item, { dryRun, skipSummary });
      results.push({ ...r, bvid: item.bvid });
    } catch (err) {
      console.error(`[import] ✗ ${item.bvid || item.courseId}:`, err.message || err);
      results.push({ ok: false, bvid: item.bvid, error: String(err.message || err) });
    }
    if (i < items.length - 1) await sleep(800);
  }

  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  console.log(`\n[import] done · success=${ok} fail=${fail}`);
  if (fail) process.exitCode = 1;
}

main().catch((err) => {
  console.error('[import] FATAL', err);
  process.exit(1);
});
