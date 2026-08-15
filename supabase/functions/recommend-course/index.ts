import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BILI_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://www.bilibili.com',
};

const RUBRIC = `源站口碑分 0–10，一位小数。维度：清晰度25% 受众20% 完整时效20% 体验风险20% 推荐意愿15%。
分档：9–10强推；7.5–8.9值得学；6–7.4能用；4–5.9争议；0–3.9负面为主。须声明基于抽样。`;

type RequestBody = { topicId?: string; urlOrBvid?: string };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getJson(url: string, retries = 3): Promise<unknown> {
  let lastErr: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, { headers: BILI_HEADERS });
    if (res.ok) return res.json();
    lastErr = new Error(`HTTP ${res.status} ${url}`);
    if ((res.status === 412 || res.status === 429 || res.status === 503) && i < retries) {
      await sleep(1200 * (i + 1));
      continue;
    }
    throw lastErr;
  }
  throw lastErr ?? new Error('fetch failed');
}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, { headers: BILI_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

function extractBvid(input: string): string | null {
  const raw = String(input || '').trim();
  if (!raw) return null;
  const fromUrl = raw.match(/\/video\/(BV[0-9A-Za-z]+)/i);
  if (fromUrl) return fromUrl[1];
  const bare = raw.match(/^(BV[0-9A-Za-z]+)$/i);
  if (bare) return bare[1];
  const anywhere = raw.match(/(BV[0-9A-Za-z]+)/i);
  return anywhere ? anywhere[1] : null;
}

type Chapter = { cid: string; title: string; page: number; duration: number };

type VideoBundle = {
  bvid: string;
  aid: number;
  cid: number;
  title: string;
  desc: string;
  coverImage: string;
  ownerName: string;
  ownerMid: string;
  duration: number;
  viewCount: number;
  danmakuCount: number;
  replyCount: number;
  chapters: Chapter[];
  videoUrl: string;
};

async function fetchVideoBundle(bvid: string): Promise<VideoBundle> {
  const viewBody = (await getJson(
    `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
  )) as { code: number; message?: string; data?: Record<string, unknown> };
  if (viewBody.code !== 0 || !viewBody.data) {
    throw new Error(`view failed: ${viewBody.message || viewBody.code}`);
  }
  const v = viewBody.data as {
    bvid: string;
    aid: number;
    cid: number;
    title: string;
    desc?: string;
    pic?: string;
    owner?: { name?: string; mid?: number };
    duration?: number;
    stat?: { view?: number; danmaku?: number; reply?: number };
  };

  const pageBody = (await getJson(
    `https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`
  )) as { code: number; message?: string; data?: Array<Record<string, unknown>> };
  if (pageBody.code !== 0 || !Array.isArray(pageBody.data)) {
    throw new Error(`pagelist failed: ${pageBody.message || pageBody.code}`);
  }

  const chapters = pageBody.data.map((p) => ({
    cid: String(p.cid),
    title: String(p.part || `P${p.page}`),
    page: Number(p.page) || 0,
    duration: Number(p.duration) || 0,
  }));

  return {
    bvid: v.bvid,
    aid: v.aid,
    cid: v.cid,
    title: v.title,
    desc: v.desc || '',
    coverImage: String(v.pic || '').replace(/^http:/, 'https:'),
    ownerName: v.owner?.name || '',
    ownerMid: String(v.owner?.mid || ''),
    duration: v.duration || 0,
    viewCount: v.stat?.view || 0,
    danmakuCount: v.stat?.danmaku || 0,
    replyCount: v.stat?.reply || 0,
    chapters,
    videoUrl: `https://www.bilibili.com/video/${v.bvid}`,
  };
}

type ReplyRow = { tag: string; like: number; ctime: number; message: string };

function normalizeMessage(raw: unknown, maxLen = 240) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function mapReply(r: Record<string, unknown>, tag: string): ReplyRow | null {
  const content = r.content as { message?: string } | undefined;
  const message = normalizeMessage(content?.message);
  if (!message) return null;
  return {
    tag,
    like: Number(r.like) || 0,
    ctime: Number(r.ctime) || 0,
    message,
  };
}

function dedupeByMessage(rows: ReplyRow[]) {
  const seen = new Set<string>();
  const out: ReplyRow[] = [];
  for (const r of rows) {
    const key = r.message.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

async function fetchReplyClassic(aid: number, sort: number, pages: number) {
  const all: ReplyRow[] = [];
  const tag = sort === 2 ? '热评' : '较新';
  for (let pn = 1; pn <= pages; pn++) {
    const url = `https://api.bilibili.com/x/v2/reply?type=1&oid=${aid}&sort=${sort}&pn=${pn}&ps=20`;
    try {
      const body = (await getJson(url)) as {
        code: number;
        data?: { replies?: Array<Record<string, unknown>> };
      };
      if (body.code !== 0) break;
      const rows = body.data?.replies || [];
      if (!rows.length) break;
      for (const r of rows) {
        const m = mapReply(r, tag);
        if (m) all.push(m);
      }
    } catch {
      break;
    }
    await sleep(250);
  }
  return all;
}

function sampleDanmaku(xml: string, limit = 30) {
  const all: string[] = [];
  const re = />([^<]{2,40})<\/d>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const t = m[1].trim();
    if (!t || /^6+$/.test(t) || /^哈+$/.test(t)) continue;
    all.push(t);
  }
  if (all.length <= limit) return [...new Set(all)];
  const step = all.length / limit;
  const picked: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < limit; i++) {
    const t = all[Math.floor(i * step)];
    if (t && !seen.has(t)) {
      seen.add(t);
      picked.push(t);
    }
  }
  return picked;
}

const POSITIVE_RE =
  /(讲得?(很|挺|真)?(好|清楚|细|明白)|很好懂|通俗易懂|干货|推荐|受益|收获|学会了|入门友好|比学校|比老师|太棒了|非常感谢|谢谢老师|良心|质量高|条理清晰|不废话|适合零基础|值得一看|收藏了|学到了|讲得好|讲的好|太强了|爱了|好课|优秀)/;
const NOISE_RE =
  /(求资料|求安装|求课件|求笔记|求链接|有没有资料|求一份|加微信|加v|私信我|骗子|破解|百度网盘|b23\.tv\/mall|配套籽料都整理|没有任何小号|复制去坑|一个赞拿走|^6+$|^哈+$|打卡$|来了$|求包|安装包)/;

function isClearPositive(row: ReplyRow) {
  const msg = row.message || '';
  if (msg.length < 8) return false;
  if (NOISE_RE.test(msg)) return false;
  const plain = msg.replace(/\[.*?\]/g, '').trim();
  if (plain.length < 6) return false;
  if (POSITIVE_RE.test(msg)) return true;
  if (row.like >= 30 && plain.length >= 20 && /(好|棒|感谢|谢谢|收获|学到|推荐|清晰|明白)/.test(plain)) {
    return true;
  }
  return false;
}

function parseScore(text: string) {
  const m = text.match(/源站口碑分\s*[:：]\s*([0-9]+(?:\.[0-9])?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? Math.min(10, Math.max(0, Math.round(n * 10) / 10)) : null;
}

async function summarizeLight(meta: {
  aid: number;
  cid: number;
  title: string;
  ownerName: string;
  replyCount: number;
}) {
  const apiKey = Deno.env.get('GLM_SUMMARY_API_KEY') || Deno.env.get('GLM_API_KEY');
  if (!apiKey) throw new Error('缺少 GLM_SUMMARY_API_KEY / GLM_API_KEY');
  const model = Deno.env.get('GLM_SUMMARY_MODEL') || 'glm-4-flash';

  const hot = await fetchReplyClassic(meta.aid, 2, 6);
  const recent = await fetchReplyClassic(meta.aid, 0, 4);
  const comments = dedupeByMessage([...hot, ...recent]).slice(0, 180);
  const clearPositives = comments
    .filter(isClearPositive)
    .sort((a, b) => b.like - a.like || b.ctime - a.ctime)
    .slice(0, 30);

  let danmaku: string[] = [];
  try {
    const xml = await getText(`https://api.bilibili.com/x/v1/dm/list.so?oid=${meta.cid}`);
    danmaku = sampleDanmaku(xml, 30);
  } catch {
    /* ignore */
  }

  const system = `你是课程「源站口碑」分析助手。严格按统一量表评分。

【统一评分量表】
${RUBRIC}

【输出格式】
1) 维度分：清晰度X.X 受众X.X 完整时效X.X 体验风险X.X 推荐意愿X.X
2) 源站口碑分：X.X
3) 5–8 句中文概括
4) 好评原话：从候选挑 3 条，格式 1. [赞N] ……
5) 声明：基于抽样，非全量；与平台评分独立
不要 Markdown 代码块。`;

  const user = `课程：${meta.title}
UP：${meta.ownerName}
全站评论总数：${meta.replyCount}
抽样评论：${comments.length}
明显好评候选：${clearPositives.length}

【评论】
${comments.map((r, i) => `${i + 1}. [赞${r.like}][${r.tag}] ${r.message}`).join('\n')}

【弹幕】
${danmaku.map((t, i) => `${i + 1}. ${t}`).join('\n')}

【明显好评候选】
${
  clearPositives.length
    ? clearPositives.map((r, i) => `${i + 1}. (赞${r.like})[${r.tag}] ${r.message}`).join('\n')
    : '（无）'
}`;

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
  const summary = String(content).trim();
  return { sourceSummary: summary, sourceScore: parseScore(summary) };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: '未登录' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
    return jsonResponse({ error: '服务端缺少 Supabase 环境变量' }, 500);
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) return jsonResponse({ error: '登录已失效，请重新登录' }, 401);

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonResponse({ error: '请求体无效' }, 400);
  }

  const topicId = String(body.topicId || '').trim();
  const urlOrBvid = String(body.urlOrBvid || '').trim();
  if (!topicId) return jsonResponse({ error: '请选择专题（topicId）' }, 400);
  const bvid = extractBvid(urlOrBvid);
  if (!bvid) return jsonResponse({ error: '无法解析 B 站 BV 号或视频链接' }, 400);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: topic, error: topicErr } = await admin
    .from('catalog_topics')
    .select('id,name')
    .eq('id', topicId)
    .maybeSingle();
  if (topicErr) return jsonResponse({ error: topicErr.message }, 500);
  if (!topic) return jsonResponse({ error: '专题不存在' }, 404);

  const { data: existingByBvid } = await admin
    .from('courses')
    .select('id,title,contributor_name')
    .eq('bvid', bvid)
    .maybeSingle();
  if (existingByBvid?.id) {
    return jsonResponse({
      ok: true,
      existed: true,
      courseId: existingByBvid.id,
      title: existingByBvid.title,
      contributorName: existingByBvid.contributor_name || '开发团队',
      summaryOk: null,
      message: '该课程已在库中',
    });
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('nickname,email')
    .eq('id', user.id)
    .maybeSingle();
  const contributorName =
    (profile?.nickname && String(profile.nickname).trim()) ||
    (profile?.email ? String(profile.email).split('@')[0] : '') ||
    '匿名用户';

  let bundle: VideoBundle;
  try {
    bundle = await fetchVideoBundle(bvid);
  } catch (err) {
    return jsonResponse({ error: `拉取 B 站元数据失败：${(err as Error).message || err}` }, 502);
  }

  const courseId = `bv-${bundle.bvid}`;
  const intro = bundle.desc || '';
  const baseRow = {
    id: courseId,
    title: bundle.title,
    description: intro,
    intro,
    video_url: bundle.videoUrl,
    cover_image: bundle.coverImage,
    company_id: null as string | null,
    topic_id: topicId,
    bvid: bundle.bvid,
    owner_name: bundle.ownerName,
    owner_mid: bundle.ownerMid,
    duration: bundle.duration,
    view_count: bundle.viewCount,
    danmaku_count: bundle.danmakuCount,
    reply_count: bundle.replyCount,
    chapters: bundle.chapters,
    source_summary: '',
    source_score: null as number | null,
    rating: 0,
    rating_count: 0,
    platform_rating: 0,
    platform_rating_count: 0,
    recommended_by: user.id,
    contributor_name: contributorName,
  };

  const { error: upsertErr } = await admin.from('courses').upsert(baseRow, { onConflict: 'id' });
  if (upsertErr) return jsonResponse({ error: `写库失败：${upsertErr.message}` }, 500);

  let summaryOk = false;
  try {
    const summary = await summarizeLight({
      aid: bundle.aid,
      cid: bundle.cid,
      title: bundle.title,
      ownerName: bundle.ownerName,
      replyCount: bundle.replyCount,
    });
    const { error: sumErr } = await admin
      .from('courses')
      .update({
        source_summary: summary.sourceSummary,
        source_score: summary.sourceScore,
      })
      .eq('id', courseId);
    if (!sumErr) summaryOk = true;
  } catch (err) {
    console.warn('[recommend-course] summary skipped', (err as Error).message || err);
  }

  return jsonResponse({
    ok: true,
    existed: false,
    courseId,
    title: bundle.title,
    contributorName,
    summaryOk,
    topicName: topic.name,
  });
});
