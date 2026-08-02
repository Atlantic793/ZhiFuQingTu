import { readFileSync } from 'node:fs';
import { extractBvid } from './bilibiliClient.mjs';

function splitCsvLine(line) {
  const cells = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

function parseCsv(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line, idx) => {
    const cells = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? '';
    });
    row.__line = idx + 2;
    return row;
  });
}

function normalizeRow(raw) {
  const bvid = extractBvid(raw.bvid || raw.bv || raw.url || raw.link || raw.video_url || '');
  const url = raw.url || raw.link || raw.video_url || (bvid ? `https://www.bilibili.com/video/${bvid}` : '');
  const topicId = raw.topic_id || raw.topicid || raw.topic || '';
  const topicName = raw.topic_name || raw.topicname || '';
  const domainId = raw.domain_id || raw.domainid || raw.domain || '';
  const courseId = raw.course_id || raw.courseid || raw.id || (bvid ? `bv-${bvid}` : '');
  const companyId = raw.company_id || raw.companyid || raw.company || null;
  const skipSummary =
    String(raw.skip_summary || raw.skipsummary || '').toLowerCase() === 'true' ||
    raw.skip_summary === '1';

  return {
    bvid,
    url,
    topicId: topicId || null,
    topicName: topicName || null,
    domainId: domainId || null,
    courseId: courseId || null,
    companyId: companyId || null,
    skipSummary,
    line: raw.__line,
  };
}

export function loadCourseList(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const trimmed = text.trim();
  let rows;
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const json = JSON.parse(trimmed);
    const arr = Array.isArray(json) ? json : json.courses || json.items || [];
    rows = arr.map((r, i) => ({ ...r, __line: i + 1 }));
  } else {
    rows = parseCsv(text);
  }

  const items = rows.map(normalizeRow).filter((r) => r.bvid);
  const missingTopic = items.filter((r) => !r.topicId);
  if (missingTopic.length) {
    console.warn(
      `[import] 警告：${missingTopic.length} 条缺少 topic_id，将跳过（行：${missingTopic
        .map((r) => r.line)
        .join(', ')}）`
    );
  }
  return items.filter((r) => r.bvid && r.topicId && r.courseId);
}
