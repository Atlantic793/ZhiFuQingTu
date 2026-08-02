/**
 * Sample Bilibili comments/danmaku + summarize with a separate GLM key.
 *
 * Env:
 *   GLM_SUMMARY_API_KEY=...
 *   GLM_SUMMARY_MODEL=glm-4-flash   (optional)
 *
 * Usage:
 *   node scripts/bilibili-summarize-smoke.mjs [bvid]
 *
 * 抽样：
 *   - 热评 + 较新，合计约 500 条（去重后）
 *   - 代表性原话：仅保留启发式筛出的「明显好评」候选，展示 3 条
 * 评分标准见 scripts/source-score-rubric.txt
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from './loadEnv.mjs';

loadEnvFile('.env');

const __dirname = dirname(fileURLToPath(import.meta.url));
const bvid = process.argv[2] || 'BV1rpWjevEip';
const COURSE_ID = '7';

/** 抽样规模：评论合计约 500 */
const SAMPLE = {
  hotPages: 14,
  recentPages: 14,
  hotKeep: 280,
  recentKeep: 280,
  targetComments: 500,
  danmakuKeep: 40,
  quoteCandidates: 40,
  quotePick: 3,
  maxMessageLen: 240,
};

/** 明显好评：需命中正面信号，且不能是求资料/引流等噪声 */
const POSITIVE_RE =
  /(讲得?(很|挺|真)?(好|清楚|细|明白)|很好懂|通俗易懂|干货|推荐|受益|收获|学会了|入门友好|比学校|比老师|太棒了|非常感谢|谢谢老师|良心|质量高|条理清晰|不废话|适合零基础|值得一看|收藏了|学到了|讲得好|讲的好|太强了|爱了|好课|优秀)/;
const NOISE_RE =
  /(求资料|求安装|求课件|求笔记|求链接|有没有资料|求一份|加微信|加v|私信我|骗子|破解|百度网盘|b23\.tv\/mall|配套籽料都整理|没有任何小号|复制去坑|一个赞拿走|^6+$|^哈+$|打卡$|来了$|求包|安装包)/;

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://www.bilibili.com',
};

async function getJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function getText(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeMessage(raw) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, SAMPLE.maxMessageLen);
}

function mapReply(r, tag) {
  const message = normalizeMessage(r?.content?.message);
  if (!message) return null;
  return {
    tag,
    rpid: String(r.rpid ?? ''),
    like: Number(r.like) || 0,
    ctime: Number(r.ctime) || 0,
    message,
  };
}

function collectTopExtras(payload) {
  const out = [];
  const top = payload?.data?.top;
  if (top?.upper) {
    const m = mapReply(top.upper, 'up精选');
    if (m) out.push(m);
  }
  for (const r of top?.replies || []) {
    const m = mapReply(r, '置顶');
    if (m) out.push(m);
  }
  for (const r of payload?.data?.upper?.top || []) {
    const m = mapReply(r, 'up置顶');
    if (m) out.push(m);
  }
  return out;
}

async function fetchReplyPages(aid, mode, pages) {
  const all = [];
  let offset = '';
  for (let i = 0; i < pages; i++) {
    let url = `https://api.bilibili.com/x/v2/reply/main?type=1&oid=${aid}&mode=${mode}`;
    if (offset) {
      url += `&pagination_str=${encodeURIComponent(JSON.stringify({ offset }))}`;
    }
    const body = await getJson(url);
    if (body.code !== 0) break;
    if (i === 0) all.push(...collectTopExtras(body));
    for (const r of body.data?.replies || []) {
      const m = mapReply(r, mode === 3 ? '热评' : '较新');
      if (m) all.push(m);
    }
    const next = body.data?.cursor?.pagination_reply?.next_offset;
    if (!next || body.data?.cursor?.is_end) break;
    offset = next;
    await sleep(200);
  }
  return all;
}

/** 经典分页接口补量：sort=0 时间，sort=2 热度 */
async function fetchReplyClassic(aid, sort, pages) {
  const all = [];
  const tag = sort === 2 ? '热评' : '较新';
  for (let pn = 1; pn <= pages; pn++) {
    const url = `https://api.bilibili.com/x/v2/reply?type=1&oid=${aid}&sort=${sort}&pn=${pn}&ps=20`;
    const body = await getJson(url);
    if (body.code !== 0) break;
    const rows = body.data?.replies || [];
    if (!rows.length) break;
    for (const r of rows) {
      const m = mapReply(r, tag);
      if (m) all.push(m);
    }
    await sleep(150);
  }
  return all;
}

/** 楼中楼补量：对高赞根评论各取一页回复 */
async function fetchSubReplies(aid, roots, perRoot = 10, maxRoots = 40) {
  const all = [];
  const list = roots.slice(0, maxRoots);
  for (const root of list) {
    if (!root.rpid) continue;
    const url = `https://api.bilibili.com/x/v2/reply/reply?type=1&oid=${aid}&root=${root.rpid}&ps=${perRoot}&pn=1`;
    try {
      const body = await getJson(url);
      if (body.code !== 0) continue;
      for (const r of body.data?.replies || []) {
        const m = mapReply(r, '楼中楼');
        if (m) all.push(m);
      }
    } catch {
      /* ignore single root failure */
    }
    await sleep(120);
  }
  return all;
}

function dedupeByMessage(rows) {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const key = r.message.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

/** 弹幕均匀抽样，跳过纯水 */
function sampleDanmaku(xml, limit) {
  const all = [];
  const re = />([^<]{2,40})<\/d>/g;
  let m;
  while ((m = re.exec(xml))) {
    const t = m[1].trim();
    if (!t || /^6+$/.test(t) || /^哈+$/.test(t) || t === '1' || t === '？' || t === '?') continue;
    all.push(t);
  }
  if (all.length <= limit) return [...new Set(all)];
  const step = all.length / limit;
  const picked = [];
  const seen = new Set();
  for (let i = 0; i < limit; i++) {
    const t = all[Math.floor(i * step)];
    if (t && !seen.has(t)) {
      seen.add(t);
      picked.push(t);
    }
  }
  return picked;
}

function loadRubric() {
  const path = resolve(__dirname, 'source-score-rubric.txt');
  if (existsSync(path)) return readFileSync(path, 'utf8');
  return '源站口碑分 0-10，一位小数；须声明基于抽样。';
}

async function callGlm(apiKey, model, system, user) {
  const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.msg || data?.message || `GLM HTTP ${res.status}`);
  }
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('GLM 未返回内容');
  return content;
}

function parseScore(text) {
  const m = text.match(/源站口碑分\s*[:：]\s*([0-9]+(?:\.[0-9])?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? Math.min(10, Math.max(0, Math.round(n * 10) / 10)) : null;
}

function formatReplyLines(rows) {
  return rows
    .map(
      (r, i) =>
        `${i + 1}. [赞${r.like}][${r.tag}] ${r.message}`
    )
    .join('\n');
}

function isClearPositive(row) {
  const msg = row.message || '';
  if (msg.length < 8) return false;
  if (NOISE_RE.test(msg)) return false;
  const plain = msg.replace(/\[.*?\]/g, '').trim();
  if (plain.length < 6) return false;
  if (POSITIVE_RE.test(msg)) return true;
  // 高赞长评且不含噪声：常见「分享笔记」类，要求有正面语气词或明确感谢
  if (row.like >= 30 && plain.length >= 20 && /(好|棒|感谢|谢谢|收获|学到|推荐|清晰|明白)/.test(plain)) {
    return true;
  }
  return false;
}

async function main() {
  const apiKey = process.env.GLM_SUMMARY_API_KEY || process.env.GLM_API_KEY;
  if (!apiKey) {
    console.error(
      '[summarize] 缺少密钥。请在 .env 中设置 GLM_SUMMARY_API_KEY=你的智谱key（可与 agent 密钥不同）'
    );
    process.exit(1);
  }
  const model = process.env.GLM_SUMMARY_MODEL || 'glm-4-flash';
  const rubric = loadRubric();

  console.log(`[summarize] view ${bvid}`);
  const viewBody = await getJson(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
  if (viewBody.code !== 0) throw new Error(`view ${viewBody.message}`);
  const v = viewBody.data;
  const aid = v.aid;
  const cid = v.cid;

  console.log(`[summarize] hot replies (main+classic)`);
  const hotRaw = [
    ...(await fetchReplyPages(aid, 3, SAMPLE.hotPages)),
    ...(await fetchReplyClassic(aid, 2, 20)),
  ];
  const hotSorted = dedupeByMessage(hotRaw)
    .sort((a, b) => b.like - a.like || b.ctime - a.ctime)
    .slice(0, SAMPLE.hotKeep);

  console.log(`[summarize] recent replies (main+classic)`);
  const recentRaw = [
    ...(await fetchReplyPages(aid, 2, SAMPLE.recentPages)),
    ...(await fetchReplyClassic(aid, 0, 20)),
  ];
  const recentSorted = dedupeByMessage(recentRaw)
    .sort((a, b) => b.ctime - a.ctime)
    .slice(0, SAMPLE.recentKeep);

  const pinned = dedupeByMessage(
    [...hotRaw, ...recentRaw].filter((r) => r.tag === '置顶' || r.tag === 'up精选' || r.tag === 'up置顶')
  );

  // 根评论去重后往往远不足 500（本课大量重复求资料），用楼中楼补量
  const rootPool = dedupeByMessage([...pinned, ...hotSorted, ...recentSorted]);
  console.log(`[summarize] root unique=${rootPool.length}, fetching sub-replies to pad ~${SAMPLE.targetComments}`);
  const subRaw = await fetchSubReplies(aid, hotSorted, 12, 45);

  // 合并到约 500：热评根 → 较新根 → 楼中楼
  const merged = dedupeByMessage([...pinned, ...hotSorted, ...recentSorted, ...subRaw]);
  const comments500 = merged.slice(0, SAMPLE.targetComments);

  // 只保留较为明显的好评，供「代表性原话」使用
  const clearPositives = comments500
    .filter(isClearPositive)
    .sort((a, b) => b.like - a.like || b.ctime - a.ctime)
    .slice(0, SAMPLE.quoteCandidates);

  console.log(
    `[summarize] comments=${comments500.length} clearPositives=${clearPositives.length}`
  );

  console.log('[summarize] danmaku stratified sample');
  const dmXml = await getText(`https://api.bilibili.com/x/v1/dm/list.so?oid=${cid}`);
  const danmakuSamples = sampleDanmaku(dmXml, SAMPLE.danmakuKeep);

  const corpus = {
    title: v.title,
    bvid: v.bvid,
    owner: v.owner?.name,
    totalReplyCount: v.stat?.reply,
    comments: comments500,
    clearPositives,
    danmaku: danmakuSamples,
  };

  const system = `你是课程「源站口碑」分析助手。你必须严格遵守下列统一评分量表，对所有课程使用同一标准。

【统一评分量表】
${rubric}

【输出格式（必须遵守）】
1) 先输出维度分（0-10，一位小数），格式固定：
维度分：清晰度X.X 受众X.X 完整时效X.X 体验风险X.X 推荐意愿X.X
2) 再输出一行：源站口碑分：X.X
   （必须等于 0.25*清晰+0.20*受众+0.20*完整时效+0.20*体验风险+0.15*推荐意愿，四舍五入一位小数）
3) 再用 5–10 句中文概括：适合谁、优点；槽点/风险可简要提及（依据【评论抽样】整体，勿夸大）
4) 代表性原话：只输出「明显好评」${SAMPLE.quotePick} 条，格式固定：
好评原话：
1. [赞N] ……
2. [赞N] ……
3. [赞N] ……
规则：只能从【明显好评候选】中挑选；必须是明确表扬讲解/收获/推荐的句子；禁止选求资料、引流广告、水评；禁止编造；可轻微删节但勿改原意。
若候选不足 ${SAMPLE.quotePick} 条，如实说明并少列，禁止凑数编造。
不要输出差评原话区块。
5) 结尾声明：基于约 ${SAMPLE.targetComments} 条评论抽样，非全量统计；与本站平台评分相互独立
不要输出 Markdown 代码块。`;

  const user = `课程：${corpus.title}
UP：${corpus.owner}
全站评论总数（仅供参考，勿当作已读完）：${corpus.totalReplyCount}
本轮评论抽样条数：${corpus.comments.length}
其中脚本筛出的明显好评候选：${corpus.clearPositives.length}

【评论抽样（约 ${corpus.comments.length} 条，热评+较新混合，供打分与概况）】
${formatReplyLines(corpus.comments)}

【弹幕抽样 ${corpus.danmaku.length} 条】
${corpus.danmaku.map((t, i) => `${i + 1}. ${t}`).join('\n')}

【明显好评候选（代表性原话只能从这里选 ${SAMPLE.quotePick} 条）】
${
  corpus.clearPositives.length
    ? corpus.clearPositives
        .map((r, i) => `${i + 1}. (赞${r.like})[${r.tag}] ${r.message}`)
        .join('\n')
    : '（无：抽样中未筛到足够明显的好评）'
}`;

  const textCount = corpus.comments.length + corpus.danmaku.length;
  console.log(`[summarize] calling GLM model=${model} texts≈${textCount}`);
  const summary = await callGlm(apiKey, model, system, user);
  const score = parseScore(summary);

  const result = {
    courseId: COURSE_ID,
    bvid: corpus.bvid,
    model,
    sourceScore: score,
    sourceSummary: summary.trim(),
    rubricVersion: '2026-08-02-v3',
    sampleSizes: {
      comments: corpus.comments.length,
      clearPositives: corpus.clearPositives.length,
      danmaku: corpus.danmaku.length,
      totalReplySignal: corpus.totalReplyCount,
      approxTexts: textCount,
      mergedBeforeCap: merged.length,
    },
    clearPositiveQuotes: corpus.clearPositives.slice(0, 12).map((r) => ({
      like: r.like,
      message: r.message,
    })),
    fetchedAt: new Date().toISOString(),
  };

  const outJson = resolve(__dirname, '../tmp-source-summary-7.json');
  writeFileSync(outJson, JSON.stringify(result, null, 2), 'utf8');

  const sqlPath = resolve(__dirname, '../tmp-source-summary-7.sql');
  const escaped = summary.trim().replace(/'/g, "''");
  const sql = `-- generated by bili:summarize for course ${COURSE_ID}
-- rubric: scripts/source-score-rubric.txt
update public.courses
set
  source_summary = '${escaped}',
  source_score = ${score == null ? 'null' : score}
where id = '${COURSE_ID}';
`;
  writeFileSync(sqlPath, sql, 'utf8');

  console.log('[summarize] OK');
  console.log(
    JSON.stringify(
      {
        courseId: COURSE_ID,
        sourceScore: score,
        sampleSizes: result.sampleSizes,
        clearPositives: result.sampleSizes.clearPositives,
        preview: summary.slice(0, 220).replace(/\n/g, ' '),
        outJson: 'tmp-source-summary-7.json',
        outSql: 'tmp-source-summary-7.sql',
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error('[summarize] FAILED', err);
  process.exit(1);
});
