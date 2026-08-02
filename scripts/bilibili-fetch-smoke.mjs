/**
 * Smoke test: fetch one Bilibili video and map into courses schema.
 *
 * Usage: node scripts/bilibili-fetch-smoke.mjs [bvid]
 * Default: BV1rpWjevEip
 *
 * Also writes full chapter list to src/data/fixtures/course-7-chapters.json when bvid is default.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bvid = process.argv[2] || 'BV1rpWjevEip';
const TOPIC = { id: 'topic-7', name: 'Python开发实战', courseId: '7' };

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://www.bilibili.com',
};

async function getJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function getText(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function sampleDanmaku(xml, limit = 8) {
  const out = [];
  const re = />([^<]{1,40})<\/d>/g;
  let m;
  while ((m = re.exec(xml)) && out.length < limit) {
    const t = m[1].trim();
    if (t && t !== '666') out.push(t);
  }
  return out;
}

async function main() {
  console.log(`[smoke] fetching view bvid=${bvid}`);
  const viewBody = await getJson(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
  if (viewBody.code !== 0 || !viewBody.data) {
    throw new Error(`view failed: code=${viewBody.code} message=${viewBody.message}`);
  }
  const v = viewBody.data;

  console.log(`[smoke] fetching pagelist (all parts)`);
  const pageBody = await getJson(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`);
  if (pageBody.code !== 0 || !Array.isArray(pageBody.data)) {
    throw new Error(`pagelist failed: code=${pageBody.code}`);
  }
  const pages = pageBody.data;

  console.log(`[smoke] fetching hot replies aid=${v.aid}`);
  const replyBody = await getJson(
    `https://api.bilibili.com/x/v2/reply/main?type=1&oid=${v.aid}&mode=3`
  );

  console.log(`[smoke] fetching danmaku cid=${v.cid}`);
  const dmXml = await getText(`https://api.bilibili.com/x/v1/dm/list.so?oid=${v.cid}`);

  const chapters = pages.map((p) => ({
    cid: String(p.cid),
    title: p.part || `P${p.page}`,
    page: p.page,
    duration: p.duration || 0,
  }));

  const sampleQuotes = (replyBody.data?.replies || []).slice(0, 5).map((r) => ({
    like: r.like,
    message: String(r.content?.message || '')
      .replace(/\s+/g, ' ')
      .slice(0, 160),
  }));

  const mapped = {
    id: TOPIC.courseId,
    topicId: TOPIC.id,
    topicName: TOPIC.name,
    bvid: v.bvid,
    title: v.title,
    intro: v.desc || '',
    description: v.desc || '',
    videoUrl: `https://www.bilibili.com/video/${v.bvid}`,
    coverImage: String(v.pic || '').replace(/^http:/, 'https:'),
    companyId: '3',
    ownerName: v.owner?.name || '',
    ownerMid: String(v.owner?.mid || ''),
    duration: v.duration || 0,
    viewCount: v.stat?.view || 0,
    danmakuCount: v.stat?.danmaku || 0,
    replyCount: v.stat?.reply || 0,
    chapters,
    chaptersFetched: chapters.length,
    videosDeclared: v.videos,
    sampleQuotes,
    danmakuSamples: sampleDanmaku(dmXml),
    fetchedAt: new Date().toISOString(),
  };

  const outMapped = resolve(__dirname, '../tmp-mapped-course-7.json');
  writeFileSync(outMapped, JSON.stringify(mapped, null, 2), 'utf8');

  if (bvid === 'BV1rpWjevEip' || TOPIC.courseId === '7') {
    const fixtureDir = resolve(__dirname, '../src/data/fixtures');
    mkdirSync(fixtureDir, { recursive: true });
    const fixturePath = resolve(fixtureDir, 'course-7-chapters.json');
    writeFileSync(fixturePath, JSON.stringify(chapters, null, 2), 'utf8');
    console.log(`[smoke] wrote chapters fixture (${chapters.length}) → src/data/fixtures/course-7-chapters.json`);
  }

  console.log('[smoke] OK — pipeline works');
  console.log(
    JSON.stringify(
      {
        topic: TOPIC.name,
        bvid: mapped.bvid,
        title: mapped.title,
        owner: mapped.ownerName,
        coverImage: mapped.coverImage,
        chaptersFetched: mapped.chaptersFetched,
        videosDeclared: mapped.videosDeclared,
        replyCount: mapped.replyCount,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error('[smoke] FAILED', err);
  process.exit(1);
});
