/**
 * Harvest interview *question stems only* from a public campus-recruitment index.
 *
 * Source: 0voice/Campus_recruitment_interview_questions README (company sections).
 * We keep titles + company/career/tags. We do NOT copy answers, video transcripts,
 * or write-ups — the product generates reference answers via interview-answer.
 *
 * Usage:
 *   npm run interview:harvest
 */

import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_README =
  'https://raw.githubusercontent.com/0voice/Campus_recruitment_interview_questions/main/README.md';
const SOURCE_REPO = 'https://github.com/0voice/Campus_recruitment_interview_questions';

const SKIP_SECTIONS = [
  'leetcode',
  '技术分享',
  '简历修改',
  'c++ 相关',
  'golang 相关',
  'cpp 相关',
];

const COMPANY_ALIAS = {
  阿里: '阿里巴巴',
  字节: '字节跳动',
  蚂蚁: '蚂蚁集团',
  虾皮: 'Shopee',
  shopee: 'Shopee',
  bilibili: '哔哩哔哩',
  Bilibili: '哔哩哔哩',
};

const TAG_RULES = [
  { tag: 'C++', re: /\bc\+\+|cpp|stl|虚函数|智能指针/i },
  { tag: 'Golang', re: /\bgolang|\bgo\b|goroutine|channel/i },
  { tag: 'Java', re: /\bjava\b|spring|jvm|hashmap/i },
  { tag: 'Python', re: /\bpython\b/i },
  { tag: 'MySQL', re: /mysql|innodb|索引|事务|隔离级别/i },
  { tag: 'Redis', re: /redis|缓存/i },
  { tag: '计算机网络', re: /tcp|udp|http|https|三次握手|四次挥手|网络/i },
  { tag: '操作系统', re: /进程|线程|协程|内存|锁|操作系统|linux/i },
  { tag: '算法', re: /手撕|leetcode|排序|链表|树|dp|动态规划/i },
  { tag: '系统设计', re: /设计|海量|高并发|架构|分表/i },
];

function stripHtml(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeCompany(raw) {
  const name = stripHtml(raw)
    .replace(/（.*?）/g, '')
    .replace(/\(.*?\)/g, '')
    .trim();
  return COMPANY_ALIAS[name] || name;
}

function shouldSkipSection(heading) {
  const h = heading.toLowerCase();
  return SKIP_SECTIONS.some((s) => h.includes(s.toLowerCase()));
}

function inferTags(question) {
  const tags = [];
  for (const rule of TAG_RULES) {
    if (rule.re.test(question)) tags.push(rule.tag);
  }
  return tags;
}

function inferCategory(question) {
  if (/自我介绍|职业规划|为什么选|优缺点|最大困难|团队协作/.test(question)) return 'career';
  if (/开放性|场景|怎么排查|如何设计|海量数据/.test(question)) return 'situational';
  return 'technical';
}

function inferDifficulty(question) {
  if (/手撕|设计|海量|原理|底层/.test(question)) return 'hard';
  if (/是什么|区别|了解吗|有哪些/.test(question)) return 'easy';
  return 'medium';
}

function inferCareer(question) {
  if (/sql|指标|数据分析|ab\s?test|漏斗/i.test(question)) return '数据分析师';
  if (/产品经理|用户体验|需求评审/.test(question)) return '产品经理';
  return '软件工程师';
}

function parseReadme(markdown) {
  const questions = [];
  const seen = new Set();
  let company = '';
  let skip = true;

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      const raw = heading[1].trim();
      skip = shouldSkipSection(raw);
      company = skip ? '' : normalizeCompany(raw);
      continue;
    }
    if (skip || !company) continue;

    const qMatch = line.match(/^####\s+(?:\d+\.\s*)?\[(.+?)\]\(/);
    if (!qMatch) continue;
    const question = qMatch[1].replace(/\s+/g, ' ').trim();
    if (question.length < 4) continue;

    const key = `${company}|${question.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const idSeed = createHash('sha1').update(key).digest('hex').slice(0, 12);
    questions.push({
      id: `iq-0voice-${idSeed}`,
      career_name: inferCareer(question),
      company,
      category: inferCategory(question),
      question,
      answer_hint: '',
      difficulty: inferDifficulty(question),
      tags: inferTags(question),
      source: '0voice-campus-index',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return questions;
}

async function main() {
  const res = await fetch(SOURCE_README);
  if (!res.ok) throw new Error(`fetch README failed: HTTP ${res.status}`);
  const markdown = await res.text();
  const questions = parseReadme(markdown);
  if (questions.length === 0) throw new Error('parsed 0 questions');

  const byCompany = {};
  for (const q of questions) {
    byCompany[q.company] = (byCompany[q.company] || 0) + 1;
  }

  const payload = {
    generated_at: new Date().toISOString(),
    purpose:
      'Question stems harvested from a public campus-recruitment index (company sections only). Answers are intentionally empty; the app generates AI reference answers on demand.',
    source_repo: SOURCE_REPO,
    source_note:
      'Only question titles + company labels are stored. Video write-ups and answer text are not copied.',
    experiences: [],
    questions,
  };

  const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/fixtures/interview-smoke.json');
  writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`[interview:harvest] questions=${questions.length} companies=${Object.keys(byCompany).length}`);
  console.log(`[interview:harvest] wrote ${out}`);
}

main().catch((err) => {
  console.error('[interview:harvest] failed:', err.message || err);
  process.exit(1);
});
