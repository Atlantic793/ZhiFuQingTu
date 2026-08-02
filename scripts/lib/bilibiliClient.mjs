const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://www.bilibili.com',
};

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

export async function getText(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

/** 从 BV 号或 B 站链接提取 bvid */
export function extractBvid(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;
  const fromUrl = raw.match(/\/video\/(BV[0-9A-Za-z]+)/i);
  if (fromUrl) return fromUrl[1];
  const bare = raw.match(/^(BV[0-9A-Za-z]+)$/i);
  if (bare) return bare[1];
  const anywhere = raw.match(/(BV[0-9A-Za-z]+)/i);
  return anywhere ? anywhere[1] : null;
}

export async function fetchVideoBundle(bvid) {
  const viewBody = await getJson(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
  if (viewBody.code !== 0 || !viewBody.data) {
    throw new Error(`view failed: ${viewBody.message || viewBody.code}`);
  }
  const v = viewBody.data;

  const pageBody = await getJson(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`);
  if (pageBody.code !== 0 || !Array.isArray(pageBody.data)) {
    throw new Error(`pagelist failed: ${pageBody.message || pageBody.code}`);
  }

  const chapters = pageBody.data.map((p) => ({
    cid: String(p.cid),
    title: p.part || `P${p.page}`,
    page: p.page,
    duration: p.duration || 0,
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
    videosDeclared: v.videos,
    chapters,
    videoUrl: `https://www.bilibili.com/video/${v.bvid}`,
  };
}

function normalizeMessage(raw, maxLen = 240) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
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

async function fetchSubReplies(aid, roots, perRoot = 12, maxRoots = 45) {
  const all = [];
  for (const root of roots.slice(0, maxRoots)) {
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
      /* ignore */
    }
    await sleep(120);
  }
  return all;
}

export function dedupeByMessage(rows) {
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

export function sampleDanmaku(xml, limit = 40) {
  const all = [];
  const re = />([^<]{2,40})<\/d>/g;
  let m;
  while ((m = re.exec(xml))) {
    const t = m[1].trim();
    if (!t || /^6+$/.test(t) || /^哈+$/.test(t)) continue;
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

/** 拉取约 target 条评论样本 + 弹幕 */
export async function fetchCommentCorpus(aid, cid, target = 500) {
  const hotRaw = [
    ...(await fetchReplyPages(aid, 3, 14)),
    ...(await fetchReplyClassic(aid, 2, 20)),
  ];
  const recentRaw = [
    ...(await fetchReplyPages(aid, 2, 14)),
    ...(await fetchReplyClassic(aid, 0, 20)),
  ];
  const hotSorted = dedupeByMessage(hotRaw).sort((a, b) => b.like - a.like || b.ctime - a.ctime);
  const recentSorted = dedupeByMessage(recentRaw).sort((a, b) => b.ctime - a.ctime);
  const pinned = dedupeByMessage(
    [...hotRaw, ...recentRaw].filter((r) => r.tag === '置顶' || r.tag === 'up精选')
  );
  const subRaw = await fetchSubReplies(aid, hotSorted, 12, 45);
  const comments = dedupeByMessage([...pinned, ...hotSorted, ...recentSorted, ...subRaw]).slice(
    0,
    target
  );

  const dmXml = await getText(`https://api.bilibili.com/x/v1/dm/list.so?oid=${cid}`);
  const danmaku = sampleDanmaku(dmXml, 40);

  return { comments, danmaku, pinned };
}
