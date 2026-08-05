/**
 * Coarse major tags from search seed + JD text heuristics.
 * LLM refine is intentionally out of scope for the smoke trial.
 */

/** @typedef {{ id: string, name: string, keywords: string[], searchTerms?: string[] }} MajorSeed */

/** First-wave majors for the /training job-library MVP. */
export const MAJOR_SEEDS = /** @type {MajorSeed[]} */ ([
  {
    id: 'cs-se',
    name: '计算机/软件工程',
    keywords: ['前端', '后端', 'Java', '客户端', '服务端', '全栈', 'Go', 'C++', 'Python', '算法', '测试', '架构'],
    searchTerms: ['软件'],
  },
  {
    id: 'data',
    name: '数据科学/统计',
    keywords: ['数据分析', '数据科学', '数据开发', '商业分析', 'BI', '数据挖掘', '机器学习', '统计'],
    searchTerms: ['数据'],
  },
  {
    id: 'pm',
    name: '产品/信息管理',
    keywords: ['产品经理', '产品实习', '产品助理', '产品运营', '策略产品', 'B端产品'],
    searchTerms: ['产品'],
  },
  {
    id: 'marketing',
    name: '市场营销',
    keywords: ['市场', '营销', '运营', '增长', '品牌', '新媒体'],
    searchTerms: ['运营'],
  },
  {
    id: 'design',
    name: '设计',
    keywords: ['UI', 'UX', '交互设计', '视觉设计', '平面设计', '产品设计'],
    searchTerms: ['设计'],
  },
  {
    id: 'finance',
    name: '财务/会计',
    keywords: ['财务', '会计', '审计', '税务', '风控'],
    searchTerms: ['财务'],
  },
  {
    id: 'hr',
    name: '人力资源/管理',
    keywords: ['人力资源', 'HR', '招聘', '行政', '组织发展'],
    searchTerms: ['招聘'],
  },
  {
    id: 'mech',
    name: '机械/自动化',
    keywords: ['机械', '自动化', '机电', '机器人', '控制工程', '智能制造'],
  },
  {
    id: 'ee',
    name: '电子/电气/通信',
    keywords: ['电子', '电气', '通信', '硬件', '嵌入式', '芯片', '集成电路', 'FPGA', '射频', '天线'],
  },
  {
    id: 'vehicle',
    name: '车辆工程',
    keywords: ['车辆', '汽车', '底盘', '动力总成', '新能源车', '自动驾驶'],
  },
  {
    id: 'logistics',
    name: '供应链/物流',
    keywords: ['供应链', '物流', '采购', '仓储', '配送', '运输'],
  },
  {
    id: 'law',
    name: '法学',
    keywords: ['法学', '法律', '合规', '法务', '知识产权', '专利'],
  },
  {
    id: 'bio',
    name: '生物医药',
    keywords: ['生物', '医药', '临床', '制药', '医疗器械', '基因'],
  },
  {
    id: 'chem-materials',
    name: '材料/化学',
    keywords: ['材料', '化学', '化工', '高分子', '新能源材料', '冶金'],
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

/**
 * 纯启发式匹配（用于 `all` 模式：无搜索词，无 seed 可依赖）。
 * 只把 JD 文本命中的专业打上标签，命中不到则返回空数组。
 *
 * @param {{ name?: string, description?: string, requirement?: string, category_name?: string }} job
 */
export function heuristicMajors(job) {
  const blob = [job.name, job.category_name, job.description, job.requirement]
    .filter(Boolean)
    .join('\n');

  /** @type {Map<string, { id: string, name: string, source: string }>} */
  const hits = new Map();

  for (const seed of MAJOR_SEEDS) {
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
