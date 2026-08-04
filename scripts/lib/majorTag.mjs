/**
 * Coarse major tags from search seed + JD text heuristics.
 * LLM refine is intentionally out of scope for the smoke trial.
 */

/** @typedef {{ id: string, name: string, keywords: string[] }} MajorSeed */

/** First-wave majors for the /training job-library MVP. */
export const MAJOR_SEEDS = /** @type {MajorSeed[]} */ ([
  {
    id: 'cs-se',
    name: '计算机/软件工程',
    keywords: ['前端', '后端', 'Java', '客户端', '服务端', '全栈'],
  },
  {
    id: 'data',
    name: '数据科学/统计',
    keywords: ['数据分析', '数据科学', '数据开发', '商业分析', 'BI'],
  },
  {
    id: 'pm',
    name: '产品/信息管理',
    keywords: ['产品经理', '产品实习', '产品助理', '产品运营'],
  },
]);

/**
 * @param {string} text
 * @param {MajorSeed} seed
 */
function textHitsSeed(text, seed) {
  const lower = text.toLowerCase();
  return seed.keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * @param {{ name?: string, description?: string, requirement?: string, category_name?: string }} job
 * @param {MajorSeed} searchSeed major used as the search query source
 */
export function coarseSuitableMajors(job, searchSeed) {
  const blob = [job.name, job.category_name, job.description, job.requirement]
    .filter(Boolean)
    .join('\n');

  /** @type {Map<string, { id: string, name: string, source: string }>} */
  const hits = new Map();

  hits.set(searchSeed.id, {
    id: searchSeed.id,
    name: searchSeed.name,
    source: 'search_seed',
  });

  for (const seed of MAJOR_SEEDS) {
    if (seed.id === searchSeed.id) continue;
    if (textHitsSeed(blob, seed)) {
      hits.set(seed.id, {
        id: seed.id,
        name: seed.name,
        source: 'jd_heuristic',
      });
    }
  }

  return [...hits.values()];
}
