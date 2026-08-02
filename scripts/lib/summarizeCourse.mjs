import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchCommentCorpus } from './bilibiliClient.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const POSITIVE_RE =
  /(讲得?(很|挺|真)?(好|清楚|细|明白)|很好懂|通俗易懂|干货|推荐|受益|收获|学会了|入门友好|比学校|比老师|太棒了|非常感谢|谢谢老师|良心|质量高|条理清晰|不废话|适合零基础|值得一看|收藏了|学到了|讲得好|讲的好|太强了|爱了|好课|优秀)/;
const NOISE_RE =
  /(求资料|求安装|求课件|求笔记|求链接|有没有资料|求一份|加微信|加v|私信我|骗子|破解|百度网盘|b23\.tv\/mall|配套籽料都整理|没有任何小号|复制去坑|一个赞拿走|^6+$|^哈+$|打卡$|来了$|求包|安装包)/;

function isClearPositive(row) {
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

function formatReplyLines(rows) {
  return rows.map((r, i) => `${i + 1}. [赞${r.like}][${r.tag}] ${r.message}`).join('\n');
}

function loadRubric() {
  const path = resolve(__dirname, '../source-score-rubric.txt');
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

/**
 * @param {{ aid:number, cid:number, bvid:string, title:string, ownerName?:string, replyCount?:number }} meta
 */
export async function summarizeCourse(meta, options = {}) {
  const apiKey = options.apiKey || process.env.GLM_SUMMARY_API_KEY || process.env.GLM_API_KEY;
  if (!apiKey) throw new Error('缺少 GLM_SUMMARY_API_KEY');
  const model = options.model || process.env.GLM_SUMMARY_MODEL || 'glm-4-flash';
  const target = options.targetComments || 500;
  const quotePick = 3;

  const { comments, danmaku } = await fetchCommentCorpus(meta.aid, meta.cid, target);
  const clearPositives = comments
    .filter(isClearPositive)
    .sort((a, b) => b.like - a.like || b.ctime - a.ctime)
    .slice(0, 40);

  const rubric = loadRubric();
  const system = `你是课程「源站口碑」分析助手。你必须严格遵守下列统一评分量表，对所有课程使用同一标准。

【统一评分量表】
${rubric}

【输出格式（必须遵守）】
1) 先输出维度分（0-10，一位小数），格式固定：
维度分：清晰度X.X 受众X.X 完整时效X.X 体验风险X.X 推荐意愿X.X
2) 再输出一行：源站口碑分：X.X
   （必须等于 0.25*清晰+0.20*受众+0.20*完整时效+0.20*体验风险+0.15*推荐意愿，四舍五入一位小数）
3) 再用 5–10 句中文概括：适合谁、优点；槽点/风险可简要提及
4) 代表性原话：只输出「明显好评」${quotePick} 条：
好评原话：
1. [赞N] ……
2. [赞N] ……
3. [赞N] ……
只能从【明显好评候选】挑选；禁止编造；不要输出差评原话区块。
5) 结尾声明：基于约 ${target} 条评论抽样，非全量统计；与本站平台评分相互独立
不要输出 Markdown 代码块。`;

  const user = `课程：${meta.title}
UP：${meta.ownerName || ''}
全站评论总数（仅供参考）：${meta.replyCount ?? ''}
本轮评论抽样条数：${comments.length}
明显好评候选：${clearPositives.length}

【评论抽样】
${formatReplyLines(comments)}

【弹幕抽样】
${danmaku.map((t, i) => `${i + 1}. ${t}`).join('\n')}

【明显好评候选】
${
  clearPositives.length
    ? clearPositives.map((r, i) => `${i + 1}. (赞${r.like})[${r.tag}] ${r.message}`).join('\n')
    : '（无）'
}`;

  const summary = (await callGlm(apiKey, model, system, user)).trim();
  return {
    sourceSummary: summary,
    sourceScore: parseScore(summary),
    sampleSizes: {
      comments: comments.length,
      clearPositives: clearPositives.length,
      danmaku: danmaku.length,
    },
    model,
  };
}
