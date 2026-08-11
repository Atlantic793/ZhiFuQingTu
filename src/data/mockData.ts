export type {
  Subject,
  Career,
  Company,
  Course,
  CatalogTopic,
  CourseChapter,
  CourseReview,
  StudyPath,
  StudyPathKind,
  StudyPathTimeframeStep,
} from '../types/catalog';

import type { Career, CatalogTopic, Company, Course, CourseChapter, Subject } from '../types/catalog';
import course7Chapters from './fixtures/course-7-chapters.json';

const placeholderChapters = [
  { cid: 'p1', title: '第 1 讲 · 导论', page: 1, duration: 600 },
  { cid: 'p2', title: '第 2 讲 · 核心概念', page: 2, duration: 900 },
  { cid: 'p3', title: '第 3 讲 · 实战练习', page: 3, duration: 1200 },
];

type CourseSeed = {
  id: string;
  topicTitle: string;
  domainId: string;
  description: string;
  videoUrl: string;
  coverImage: string;
  companyId: string;
  rating: number;
  ratingCount: number;
};

function leafFromSeed(seed: CourseSeed, suffix: 'A' | 'B'): Course {
  const rating = suffix === 'A' ? seed.rating : Math.max(seed.rating - 0.2, 3.5);
  const ratingCount = suffix === 'A' ? seed.ratingCount : Math.max(Math.floor(seed.ratingCount / 3), 10);
  return {
    id: suffix === 'A' ? seed.id : `${seed.id}-b`,
    title: `${seed.topicTitle} · 占位课 ${suffix}`,
    description: seed.description,
    videoUrl: seed.videoUrl,
    coverImage: seed.coverImage,
    companyId: seed.companyId,
    rating,
    ratingCount,
    topicId: `topic-${seed.id}`,
    bvid: null,
    intro: seed.description,
    chapters: placeholderChapters,
    platformRating: rating,
    platformRatingCount: ratingCount,
    sourceScore: null,
    sourceSummary: '',
  };
}

const courseSeeds: CourseSeed[] = [
  {
    id: '1',
    topicTitle: '财务报表分析',
    domainId: '6',
    description:
      '本课程深入讲解资产负债表、利润表和现金流量表的编制原理，教您如何运用比率分析、趋势分析等方法评估企业财务状况，识别潜在风险。适合财务人员、投资者和企业管理者学习。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=450&fit=crop',
    companyId: '1',
    rating: 4.8,
    ratingCount: 1256,
  },
  {
    id: '2',
    topicTitle: '审计基础入门',
    domainId: '6',
    description:
      '从审计的基本概念入手，系统学习审计流程、审计证据收集、内部控制评价等核心内容。通过案例分析和实务操作，帮助学员建立完整的审计思维框架，掌握审计工作的基本技能。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    companyId: '1',
    rating: 4.6,
    ratingCount: 892,
  },
  {
    id: '3',
    topicTitle: '税务筹划实务',
    domainId: '6',
    description:
      '结合最新税收政策，深入讲解企业所得税、增值税等主要税种的筹划方法。课程涵盖税收优惠政策运用、收入与费用的合理安排、跨境税务筹划等内容，助力企业合法降低税负。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop',
    companyId: '1',
    rating: 4.7,
    ratingCount: 654,
  },
  {
    id: '4',
    topicTitle: '股票投资分析',
    domainId: '6',
    description:
      '系统学习股票投资的基本面分析和技术分析方法。课程涵盖财务报表分析、估值模型、K线技术、趋势判断等内容，帮助投资者建立科学的投资决策体系，提升投资收益。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800&h=450&fit=crop',
    companyId: '2',
    rating: 4.9,
    ratingCount: 423,
  },
  {
    id: '5',
    topicTitle: '金融产品解读',
    domainId: '6',
    description:
      '全面解析股票、债券、基金、衍生品等各类金融产品的特点、风险收益特征和适用场景。课程帮助投资者理解不同金融产品的运作机制，学会根据自身风险偏好进行资产配置。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
    companyId: '2',
    rating: 4.8,
    ratingCount: 789,
  },
  {
    id: '6',
    topicTitle: '量化交易入门',
    domainId: '6',
    description:
      '介绍量化交易的基本概念和策略框架，包括统计套利、趋势跟踪、均值回归等经典策略。课程涵盖Python编程基础、数据获取与处理、策略回测与优化等内容，帮助学员入门量化交易领域。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    companyId: '2',
    rating: 4.5,
    ratingCount: 342,
  },
  {
    id: '7',
    topicTitle: 'Python开发实战',
    domainId: '1',
    description:
      '从Python基础语法到高级应用，课程涵盖数据类型、函数、面向对象、文件操作、数据库连接等核心内容。通过多个实战项目，帮助学员掌握Python在Web开发、数据分析、自动化脚本等领域的应用。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=450&fit=crop',
    companyId: '3',
    rating: 4.8,
    ratingCount: 1567,
  },
  {
    id: '8',
    topicTitle: '产品设计方法论',
    domainId: '7',
    description:
      '系统讲解产品设计的全流程，包括用户研究、需求分析、原型设计、可用性测试等环节。课程介绍字节跳动的产品设计理念和方法论，帮助学员掌握如何设计出优秀的互联网产品。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop',
    companyId: '3',
    rating: 4.9,
    ratingCount: 987,
  },
  {
    id: '9',
    topicTitle: '数据分析与决策',
    domainId: '1',
    description:
      '学习如何运用数据分析方法解决实际业务问题。课程涵盖数据采集与清洗、统计分析、可视化呈现、A/B测试等内容，帮助学员掌握数据分析驱动业务决策的核心技能。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
    companyId: '3',
    rating: 4.7,
    ratingCount: 856,
  },
  {
    id: '10',
    topicTitle: '游戏开发入门',
    domainId: '1',
    description:
      '从游戏开发的基本概念入手，学习游戏引擎的使用、游戏逻辑开发、美术资源处理等内容。课程涵盖Unity引擎基础、C#编程、UI设计、物理系统等核心知识，帮助学员入门游戏开发领域。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=450&fit=crop',
    companyId: '4',
    rating: 4.6,
    ratingCount: 1123,
  },
  {
    id: '11',
    topicTitle: 'AI应用开发',
    domainId: '1',
    description:
      '探索人工智能技术在实际产品中的应用。课程涵盖机器学习基础、深度学习框架、自然语言处理、计算机视觉等内容，帮助学员了解AI技术的应用场景和开发方法。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    companyId: '4',
    rating: 4.8,
    ratingCount: 765,
  },
  {
    id: '12',
    topicTitle: '用户增长策略',
    domainId: '7',
    description:
      '系统讲解用户增长的核心策略和方法。课程涵盖用户获取、激活、留存、变现等环节，介绍增长黑客思维、A/B测试、数据分析等工具，帮助学员掌握驱动用户增长的实战技能。',
    videoUrl: 'https://www.bilibili.com/',
    coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
    companyId: '4',
    rating: 4.9,
    ratingCount: 543,
  },
];

export const catalogTopics: CatalogTopic[] = courseSeeds.map((s, index) => ({
  id: `topic-${s.id}`,
  domainId: s.domainId,
  name: s.topicTitle,
  slug: `topic-${s.id}`,
  description: s.description,
  coverImage: s.coverImage,
  sortOrder: index + 1,
}));

export const courses: Course[] = courseSeeds.flatMap((s) => [leafFromSeed(s, 'A'), leafFromSeed(s, 'B')]);

/** 冒烟测试写入：topic「Python开发实战」下占位课 A ← BV1rpWjevEip 真实元数据 */
const pythonSmokeCourse: Partial<Course> & { id: string } = {
  id: '7',
  title: '【全748集】目前B站最全最细的Python零基础全套教程，2026最新版',
  description:
    '本套教程从零开始讲解，手把手教学，包含基础语法、进阶语法、爬虫、自动化办公、数据分析。无论是新手小白，还是有一定编码经验的选手，皆可学习。',
  intro:
    '本套教程从零开始讲解，手把手教学，包含基础语法、进阶语法、爬虫、自动化办公、数据分析。无论是新手小白，还是有一定编码经验的选手，皆可学习。',
  videoUrl: 'https://www.bilibili.com/video/BV1rpWjevEip',
  coverImage: 'https://i2.hdslb.com/bfs/archive/a979056b1a32012cdd00d48fbc3732d253e30620.jpg',
  bvid: 'BV1rpWjevEip',
  ownerName: 'Python官方课程',
  viewCount: 18488024,
  danmakuCount: 122108,
  replyCount: 325769,
  chapters: course7Chapters as CourseChapter[],
  sourceScore: 5.3,
  sourceSummary:
    '维度分：清晰度6.5 受众6.5 完整时效4.5 体验风险3.5 推荐意愿5.0\n源站口碑分：5.3\n\n本课程标称"全748集""2026最新版"，但抽样评论揭示多个明显问题。课程内容仅上传约100集（由300多集整合），剩余400余集需添加助理老师微信领取，平台内并不完整。评论中使用的Python版本为3.7，已有用户质疑版本过时，与标题宣称的"最新版"不符。教学方面，少量真实反馈较为正面，有用户称"比我学校好多了""太详细了""最不绕弯子，最不废话"，对零基础入门有一定友好度。但评论区被大量"666求资料"刷屏淹没，UP回复几乎清一色"后台请查收"引导私信，且反复出现冒充小号的诈骗警告，整体学习体验和风险隐患突出。适合想快速了解Python基础语法的零基础学习者试看，但不宜作为系统学习的唯一依赖，需警惕引流和诈骗风险。\n\n好评原话：\n1. [赞340] 666（资料），真的良心，如果看完所有课程包学会的吗\n2. [赞48] 这是我自己记得一些笔记……之后的课程我都会上传像老师边写代码边做注释的笔记，因为我觉得这样不仅……\n3. [赞6880] 孩子们课代表来了 简约? 1.查看文件扩展名 2.版本推荐 3.安装python 勾选add python3.7path 配置环境变量的作用……\n\n基于约500条评论抽样，非全量统计；与本站平台评分相互独立。',
};
{
  const idx = courses.findIndex((c) => c.id === pythonSmokeCourse.id);
  if (idx >= 0) courses[idx] = { ...courses[idx], ...pythonSmokeCourse };
}

export const companies: Company[] = [
  { id: '1', name: 'KPMG', sector: '会计事务所', courses: [] },
  { id: '2', name: '东方财富', sector: '券商', courses: [] },
  { id: '3', name: '字节跳动', sector: '互联网', courses: [] },
  { id: '4', name: '腾讯', sector: '互联网', courses: [] },
].map((company) => ({
  ...company,
  courses: courses.filter((c) => c.companyId === company.id && !c.id.endsWith('-b')),
}));

export interface QuizQuestion {
  id: string;
  courseId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const subjects: Subject[] = [
  { id: '1', name: '计算机科学', icon: 'Cpu', description: '人工智能、编程、数据科学' },
  { id: '2', name: '数学', icon: 'Calculator', description: '代数、几何、微积分' },
  { id: '3', name: '物理', icon: 'Atom', description: '力学、电磁学、量子物理' },
  { id: '4', name: '化学', icon: 'FlaskConical', description: '有机化学、无机化学' },
  { id: '5', name: '生物', icon: 'Dna', description: '分子生物学、遗传学' },
  { id: '6', name: '经济学', icon: 'TrendingUp', description: '宏观经济、微观经济' },
  { id: '7', name: '管理学', icon: 'Briefcase', description: '市场营销、人力资源' },
  { id: '8', name: '设计', icon: 'Palette', description: '平面设计、UI设计' },
];

export const careers: Career[] = [
  { id: '1', name: '软件工程师', icon: 'Code', description: '从事软件开发、系统架构设计' },
  { id: '2', name: '数据分析师', icon: 'BarChart2', description: '数据分析、数据可视化、商业智能' },
  { id: '3', name: '产品经理', icon: 'Layout', description: '产品设计、需求分析、项目管理' },
  { id: '4', name: 'UI/UX设计师', icon: 'PenTool', description: '用户界面设计、用户体验优化' },
  { id: '5', name: '人工智能工程师', icon: 'Brain', description: '机器学习、深度学习、NLP' },
  { id: '6', name: '金融分析师', icon: 'LineChart', description: '投资分析、风险评估、财务建模' },
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: '1',
    courseId: '1',
    question: '资产负债表反映的是企业哪个时间段的财务状况？',
    options: ['某一特定日期', '某一会计期间', '某一自然年度', '某一财政季度'],
    correctAnswer: 0,
    explanation: '资产负债表是静态报表，反映企业在某一特定日期（如年末、季末、月末）的财务状况，而非一定期间的经营成果。',
  },
  {
    id: '2',
    courseId: '1',
    question: '以下哪项属于流动资产？',
    options: ['固定资产', '无形资产', '应收账款', '长期投资'],
    correctAnswer: 2,
    explanation: '流动资产是指预计在一年内或一个正常营业周期内变现、出售或耗用的资产。应收账款是典型的流动资产。',
  },
  {
    id: '3',
    courseId: '1',
    question: '净利润计算公式是？',
    options: ['营业收入-营业成本', '利润总额-所得税费用', '营业利润+营业外收入', '主营业务收入-主营业务成本'],
    correctAnswer: 1,
    explanation: '净利润=利润总额-所得税费用。利润总额=营业利润+营业外收入-营业外支出。',
  },
  {
    id: '4',
    courseId: '1',
    question: '所有者权益不包括以下哪项？',
    options: ['实收资本', '资本公积', '应付账款', '未分配利润'],
    correctAnswer: 2,
    explanation: '应付账款属于负债，不属于所有者权益。所有者权益包括实收资本、资本公积、盈余公积和未分配利润。',
  },
  {
    id: '5',
    courseId: '1',
    question: '利润表的编制基础是什么？',
    options: ['权责发生制', '收付实现制', '现金流量制', '历史成本制'],
    correctAnswer: 0,
    explanation: '利润表按照权责发生制编制，即收入和费用在发生时确认，而不是在收到或支付现金时确认。',
  },
  {
    id: '6',
    courseId: '1',
    question: '以下哪项会影响营业利润？',
    options: ['营业外收入', '所得税费用', '销售费用', '资本公积'],
    correctAnswer: 2,
    explanation: '营业利润=营业收入-营业成本-税金及附加-销售费用-管理费用-财务费用-资产减值损失+公允价值变动收益+投资收益。',
  },
  {
    id: '7',
    courseId: '1',
    question: '现金流量表中，购买固定资产属于哪种活动？',
    options: ['经营活动', '投资活动', '筹资活动', '融资活动'],
    correctAnswer: 1,
    explanation: '购买固定资产属于投资活动现金流出。投资活动主要包括购建和处置长期资产。',
  },
  {
    id: '8',
    courseId: '1',
    question: '流动比率的计算公式是？',
    options: ['流动资产/流动负债', '流动负债/流动资产', '总资产/总负债', '净利润/总资产'],
    correctAnswer: 0,
    explanation: '流动比率=流动资产÷流动负债，反映企业短期偿债能力，一般认为2:1较为合理。',
  },
  {
    id: '9',
    courseId: '1',
    question: '资产负债率的计算公式是？',
    options: ['总资产/总负债', '总负债/总资产', '流动资产/流动负债', '净利润/净资产'],
    correctAnswer: 1,
    explanation: '资产负债率=总负债÷总资产，反映企业长期偿债能力和财务杠杆水平。',
  },
  {
    id: '10',
    courseId: '1',
    question: '杜邦分析体系的核心指标是？',
    options: ['资产负债率', '净资产收益率', '流动比率', '毛利率'],
    correctAnswer: 1,
    explanation: '杜邦分析体系以净资产收益率(ROE)为核心，将其分解为销售净利率×资产周转率×权益乘数。',
  },
  {
    id: '11',
    courseId: '4',
    question: '市盈率的计算公式是？',
    options: ['股价/每股净资产', '股价/每股收益', '每股收益/股价', '每股净资产/股价'],
    correctAnswer: 1,
    explanation: '市盈率(P/E)=每股市价÷每股收益，反映投资者愿意为每一元净利润支付的价格。',
  },
  {
    id: '12',
    courseId: '4',
    question: '以下哪项不是股票的基本面分析指标？',
    options: ['市盈率', '市净率', 'MACD', '净资产收益率'],
    correctAnswer: 2,
    explanation: 'MACD属于技术分析指标，用于分析股价的趋势和动量。市盈率、市净率、ROE都是基本面分析指标。',
  },
  {
    id: '13',
    courseId: '4',
    question: '市净率的计算公式是？',
    options: ['股价/每股净资产', '每股净资产/股价', '股价/每股收益', '每股收益/净资产'],
    correctAnswer: 0,
    explanation: '市净率(P/B)=每股市价÷每股净资产，适用于金融、重资产行业的估值。',
  },
  {
    id: '14',
    courseId: '4',
    question: '以下哪项属于系统性风险？',
    options: ['公司经营风险', '行业竞争风险', '利率风险', '财务风险'],
    correctAnswer: 2,
    explanation: '系统性风险是指影响整个市场的风险，如利率风险、汇率风险、通货膨胀风险等，无法通过分散投资消除。',
  },
  {
    id: '15',
    courseId: '4',
    question: 'β系数衡量的是？',
    options: ['公司特有风险', '系统性风险', '非系统性风险', '信用风险'],
    correctAnswer: 1,
    explanation: 'β系数衡量股票相对于市场的波动性，是系统性风险的度量。β=1表示与市场同步。',
  },
  {
    id: '16',
    courseId: '4',
    question: '股利贴现模型(DDM)的核心思想是？',
    options: ['未来现金流折现', '比较同类公司', '资产重置成本', '市场情绪分析'],
    correctAnswer: 0,
    explanation: 'DDM认为股票价值等于未来所有股利的现值之和，是现金流折现法的一种应用。',
  },
  {
    id: '17',
    courseId: '4',
    question: 'ROE的计算公式是？',
    options: ['净利润/总资产', '净利润/净资产', '营业收入/总资产', '净利润/营业收入'],
    correctAnswer: 1,
    explanation: 'ROE=净利润÷净资产，反映股东权益的回报率，是衡量公司盈利能力的核心指标。',
  },
  {
    id: '18',
    courseId: '4',
    question: 'EPS的计算公式是？',
    options: ['净利润/总股本', '净利润/净资产', '每股净资产/股价', '股价/每股收益'],
    correctAnswer: 0,
    explanation: 'EPS=净利润÷加权平均普通股股数，即每股收益，是衡量公司盈利能力的重要指标。',
  },
  {
    id: '19',
    courseId: '4',
    question: 'PEG比率的计算公式是？',
    options: ['市盈率/增长率', '增长率/市盈率', '市盈率×增长率', '市盈率-增长率'],
    correctAnswer: 0,
    explanation: 'PEG=市盈率÷盈利增长率，用于评估股票的估值是否合理，PEG<1通常认为被低估。',
  },
  {
    id: '20',
    courseId: '4',
    question: '以下哪项属于技术分析方法？',
    options: ['财务报表分析', '趋势线分析', '行业分析', '公司估值'],
    correctAnswer: 1,
    explanation: '趋势线分析属于技术分析，通过研究股价图表和交易量来预测未来走势。',
  },
  {
    id: '21',
    courseId: '7',
    question: 'Python中如何定义一个函数？',
    options: ['def func():', 'function func():', 'func = function():', 'def func[]:'],
    correctAnswer: 0,
    explanation: 'Python使用def关键字定义函数，语法为def 函数名(参数):。',
  },
  {
    id: '22',
    courseId: '7',
    question: 'Python中列表(list)和元组(tuple)的主要区别是？',
    options: ['列表可修改，元组不可修改', '元组可修改，列表不可修改', '两者完全相同', '列表只能存储数字'],
    correctAnswer: 0,
    explanation: '列表是可变序列，可以修改元素；元组是不可变序列，创建后不能修改元素。',
  },
  {
    id: '23',
    courseId: '7',
    question: 'Python中如何导入模块？',
    options: ['import module', 'include module', 'require module', 'using module'],
    correctAnswer: 0,
    explanation: 'Python使用import语句导入模块，如import math或from math import sqrt。',
  },
  {
    id: '24',
    courseId: '7',
    question: 'Python中什么是列表推导式？',
    options: ['快速创建列表的语法', '列表排序方法', '列表索引方式', '列表切片操作'],
    correctAnswer: 0,
    explanation: '列表推导式是一种简洁创建列表的语法，如[x*2 for x in range(10)]。',
  },
  {
    id: '25',
    courseId: '7',
    question: 'Python中__init__方法的作用是？',
    options: ['初始化类的实例', '定义类方法', '销毁对象', '创建类'],
    correctAnswer: 0,
    explanation: '__init__是构造函数，在创建类的实例时自动调用，用于初始化对象的属性。',
  },
  {
    id: '26',
    courseId: '7',
    question: 'Python中pass语句的作用是？',
    options: ['占位符，什么都不做', '退出程序', '跳过循环', '抛出异常'],
    correctAnswer: 0,
    explanation: 'pass是占位符语句，当语法上需要语句但不需要执行任何操作时使用。',
  },
  {
    id: '27',
    courseId: '7',
    question: 'Python中try-except的作用是？',
    options: ['异常处理', '循环控制', '条件判断', '函数定义'],
    correctAnswer: 0,
    explanation: 'try-except用于捕获和处理异常，防止程序因错误而崩溃。',
  },
  {
    id: '28',
    courseId: '7',
    question: 'Python中range(5)生成的序列是？',
    options: ['0,1,2,3,4', '1,2,3,4,5', '0,1,2,3,4,5', '5'],
    correctAnswer: 0,
    explanation: 'range(n)生成从0到n-1的整数序列，range(5)生成0,1,2,3,4。',
  },
  {
    id: '29',
    courseId: '7',
    question: 'Python中字典(dict)的键必须满足什么条件？',
    options: ['必须是可哈希的', '必须是字符串', '必须是数字', '可以是任意类型'],
    correctAnswer: 0,
    explanation: '字典的键必须是可哈希的(不可变)，如字符串、数字、元组等，列表不能作为键。',
  },
  {
    id: '30',
    courseId: '7',
    question: 'Python中lambda函数的特点是？',
    options: ['匿名函数，单行表达式', '多行函数', '类方法', '递归函数'],
    correctAnswer: 0,
    explanation: 'lambda是匿名函数，只能包含一个表达式，常用于简单的函数定义。',
  },
  {
    id: '31',
    courseId: '8',
    question: '产品设计的核心目标是什么？',
    options: ['满足用户需求', '追求技术创新', '降低成本', '美观好看'],
    correctAnswer: 0,
    explanation: '产品设计的核心是解决用户问题，满足用户需求，创造价值。',
  },
  {
    id: '32',
    courseId: '8',
    question: '用户体验(UX)和用户界面(UI)的关系是？',
    options: ['UX包含UI', 'UI包含UX', '两者完全独立', '两者相同'],
    correctAnswer: 0,
    explanation: 'UX是整体用户体验，UI是用户界面设计，UI是UX的一部分。',
  },
  {
    id: '33',
    courseId: '8',
    question: 'MVP(最小可行产品)的含义是？',
    options: ['用最少功能验证假设', '功能最全的产品', '最赚钱的产品', '最小的团队'],
    correctAnswer: 0,
    explanation: 'MVP是用最少的功能来验证产品假设，快速获取用户反馈。',
  },
  {
    id: '34',
    courseId: '8',
    question: '用户调研的主要方法不包括？',
    options: ['问卷调查', '用户访谈', '数据分析', '凭空想象'],
    correctAnswer: 3,
    explanation: '用户调研需要通过实际数据和用户反馈，不能凭空想象。',
  },
  {
    id: '35',
    courseId: '8',
    question: '需求优先级排序常用的方法是？',
    options: ['MoSCoW', 'SWOT', 'KPI', 'ROI'],
    correctAnswer: 0,
    explanation: 'MoSCoW方法将需求分为Must have(必须)、Should have(应该)、Could have(可以)、Won\'t have(不会)。',
  },
  {
    id: '36',
    courseId: '8',
    question: '原型设计工具常用的有？',
    options: ['Figma', 'Excel', 'Word', 'Notepad'],
    correctAnswer: 0,
    explanation: 'Figma是流行的UI/UX设计工具，支持原型设计和协作。',
  },
  {
    id: '37',
    courseId: '8',
    question: 'A/B测试的目的是什么？',
    options: ['比较两个版本的效果', '测试产品稳定性', '测试代码质量', '测试服务器性能'],
    correctAnswer: 0,
    explanation: 'A/B测试通过对比两个版本，确定哪个更符合用户需求。',
  },
  {
    id: '38',
    courseId: '8',
    question: '用户画像的作用是？',
    options: ['了解目标用户', '美化产品界面', '提高代码质量', '增加服务器负载'],
    correctAnswer: 0,
    explanation: '用户画像帮助团队理解目标用户的特征、需求和行为。',
  },
  {
    id: '39',
    courseId: '8',
    question: '产品路线图的作用是？',
    options: ['规划产品发展方向', '编写代码', '测试产品', '发布产品'],
    correctAnswer: 0,
    explanation: '产品路线图展示产品的发展规划和里程碑。',
  },
  {
    id: '40',
    courseId: '8',
    question: '用户反馈的收集渠道不包括？',
    options: ['用户访谈', 'App Store评论', '社交媒体', '自己猜测'],
    correctAnswer: 3,
    explanation: '用户反馈需要通过实际渠道收集，不能自己猜测用户想法。',
  },
];

export const comments: Comment[] = [
  { id: '1', userId: '1', userName: '小明', content: '课程讲解清晰，非常适合入门学习！', createdAt: '2024-01-15 10:30' },
  { id: '2', userId: '2', userName: '小红', content: '老师讲得很好，希望能更新更多内容。', createdAt: '2024-01-14 15:20' },
  { id: '3', userId: '3', userName: '小李', content: '学习了很多，推荐给大家！', createdAt: '2024-01-13 09:15' },
];
