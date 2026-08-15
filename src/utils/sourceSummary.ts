/** 从粘贴文本中提取全部 BV 号（去重，保序） */
export function extractBvids(input: string): string[] {
  const matches = String(input || '').match(/BV[0-9A-Za-z]+/gi) || [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches) {
    const id = m.startsWith('BV') ? m : `BV${m.slice(2)}`;
    const normalized = id.replace(/^bv/i, 'BV');
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

export type SourceSummaryParsed = {
  score: number | null;
  dimensions: { key: string; label: string; value: number }[];
  highlights: string[];
  quotes: { like: number | null; text: string }[];
  disclaimer: string;
  rawFallback: string;
};

const DIM_LABELS: Record<string, string> = {
  清晰度: '清晰度',
  受众: '受众匹配',
  完整时效: '完整时效',
  体验风险: '体验风险',
  推荐意愿: '推荐意愿',
};

/**
 * 解析 GLM 源站口碑摘要为结构化块，便于详情页分层展示。
 */
export function parseSourceSummary(raw: string, fallbackScore?: number | null): SourceSummaryParsed {
  const text = String(raw || '').trim();
  const empty: SourceSummaryParsed = {
    score: fallbackScore ?? null,
    dimensions: [],
    highlights: [],
    quotes: [],
    disclaimer: '',
    rawFallback: text,
  };
  if (!text) return empty;

  const scoreMatch = text.match(/源站口碑分\s*[:：]\s*([0-9]+(?:\.[0-9])?)/);
  const score = scoreMatch ? Number(scoreMatch[1]) : fallbackScore ?? null;

  const dimLine = text.match(/维度分\s*[:：]\s*([^\n]+)/);
  const dimensions: SourceSummaryParsed['dimensions'] = [];
  if (dimLine) {
    const re = /(清晰度|受众|完整时效|体验风险|推荐意愿)\s*([0-9]+(?:\.[0-9])?)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(dimLine[1]))) {
      dimensions.push({
        key: m[1],
        label: DIM_LABELS[m[1]] || m[1],
        value: Number(m[2]),
      });
    }
  }

  const quotes: SourceSummaryParsed['quotes'] = [];
  const quoteBlock = text.match(/好评原话\s*[:：]?\s*([\s\S]*?)(?=(基于约|声明|须注明|$))/);
  if (quoteBlock) {
    for (const line of quoteBlock[1].split(/\n+/)) {
      const qm = line.match(/^\s*\d+[\.、]\s*(?:\[赞(\d+)\])?\s*(.+)$/);
      if (qm) {
        quotes.push({
          like: qm[1] ? Number(qm[1]) : null,
          text: qm[2].trim(),
        });
      }
    }
  }

  let body = text
    .replace(/维度分\s*[:：][^\n]+\n?/g, '')
    .replace(/源站口碑分\s*[:：]\s*[0-9]+(?:\.[0-9])?\n?/g, '')
    .replace(/好评原话\s*[:：]?[\s\S]*$/g, '')
    .trim();

  const discMatch = body.match(/(基于约[\s\S]+)$/);
  let disclaimer = '';
  if (discMatch) {
    disclaimer = discMatch[1].trim();
    body = body.slice(0, discMatch.index).trim();
  } else {
    const tail = text.match(/(基于约[\s\S]+)$/);
    if (tail) disclaimer = tail[1].trim();
  }

  const highlights = body
    .split(/\n+/)
    .map((s) => s.replace(/^[\d\.\、\-\*]\s*/, '').trim())
    .filter((s) => s.length >= 8 && !/^维度分/.test(s) && !/^源站口碑分/.test(s));

  return {
    score: Number.isFinite(score as number) ? (score as number) : null,
    dimensions,
    highlights: highlights.slice(0, 8),
    quotes: quotes.slice(0, 3),
    disclaimer,
    rawFallback: text,
  };
}
