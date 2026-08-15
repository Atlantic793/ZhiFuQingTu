export type RecruitKind = 'board' | 'company';

export type RecruitPortal = {
  id: string;
  kind: RecruitKind;
  name: string;
  blurb: string;
  careers: string[];
  jobsUrl: string;
  jobsLabel: string;
  internUrl?: string;
  internLabel?: string;
};

/** 公开信息站 + 站内 6 岗常见雇主。网址会变，以打开后的页面为准。 */
export const RECRUIT_PORTALS: RecruitPortal[] = [
  {
    id: 'ncss',
    kind: 'board',
    name: '国家大学生就业服务平台',
    blurb: '教育部就业网，校招、实习、公告较全',
    careers: [],
    jobsUrl: 'https://www.ncss.cn/',
    jobsLabel: '就业网',
  },
  {
    id: 'shixiseng',
    kind: 'board',
    name: '实习僧',
    blurb: '实习岗位检索，适合先投一波看看市场',
    careers: [],
    jobsUrl: 'https://www.shixiseng.com/',
    jobsLabel: '找实习',
  },
  {
    id: 'nowcoder-jobs',
    kind: 'board',
    name: '牛客招聘',
    blurb: '互联网校招/实习信息集中，也有面经讨论',
    careers: ['软件工程师', '数据分析师', '产品经理', '人工智能工程师'],
    jobsUrl: 'https://www.nowcoder.com/jobs',
    jobsLabel: '校招实习',
  },
  {
    id: 'haitou',
    kind: 'board',
    name: '海投网',
    blurb: '宣讲会、网申日历，赶投递节点用',
    careers: [],
    jobsUrl: 'https://www.haitou.cc/',
    jobsLabel: '宣讲网申',
  },
  {
    id: 'yingjiesheng',
    kind: 'board',
    name: '应届生求职网',
    blurb: '应届校招信息站，覆盖面比单一公司官网广',
    careers: [],
    jobsUrl: 'https://www.yingjiesheng.com/',
    jobsLabel: '应届校招',
  },
  {
    id: 'zhaopin-campus',
    kind: 'board',
    name: '智联校园',
    blurb: '校园招聘入口，国企、传统行业也常见',
    careers: ['金融分析师', '产品经理', '数据分析师'],
    jobsUrl: 'https://xiaoyuan.zhaopin.com/',
    jobsLabel: '校园招聘',
  },
  {
    id: 'tencent',
    kind: 'company',
    name: '腾讯',
    blurb: '校招与社招都在招聘官网',
    careers: ['软件工程师', '产品经理', 'UI/UX设计师', '数据分析师', '人工智能工程师'],
    jobsUrl: 'https://careers.tencent.com/',
    jobsLabel: '招聘官网',
    internUrl: 'https://careers.tencent.com/zh-cn/campusrecruit.html',
    internLabel: '校园招聘',
  },
  {
    id: 'bytedance',
    kind: 'company',
    name: '字节跳动',
    blurb: '校招页和社招页分开，投实习走校园通道',
    careers: ['软件工程师', '产品经理', 'UI/UX设计师', '数据分析师', '人工智能工程师'],
    jobsUrl: 'https://jobs.bytedance.com/experienced/position',
    jobsLabel: '招聘官网',
    internUrl: 'https://jobs.bytedance.com/campus/position',
    internLabel: '校园/实习',
  },
  {
    id: 'alibaba',
    kind: 'company',
    name: '阿里巴巴',
    blurb: '校招、实习走人才官网',
    careers: ['软件工程师', '产品经理', 'UI/UX设计师', '数据分析师', '人工智能工程师'],
    jobsUrl: 'https://talent.alibaba.com/',
    jobsLabel: '招聘官网',
  },
  {
    id: 'meituan',
    kind: 'company',
    name: '美团',
    blurb: '校招岗位在美团招聘网',
    careers: ['软件工程师', '产品经理', '数据分析师', '人工智能工程师'],
    jobsUrl: 'https://zhaopin.meituan.com/',
    jobsLabel: '招聘官网',
  },
  {
    id: 'baidu',
    kind: 'company',
    name: '百度',
    blurb: '校招与实习在人才官网检索',
    careers: ['软件工程师', '人工智能工程师', '产品经理', '数据分析师'],
    jobsUrl: 'https://talent.baidu.com/external/baidu/index.html#/job/list',
    jobsLabel: '招聘官网',
  },
  {
    id: 'netease',
    kind: 'company',
    name: '网易',
    blurb: '游戏、互娱、杭州岗较多',
    careers: ['软件工程师', '产品经理', 'UI/UX设计师'],
    jobsUrl: 'https://hr.163.com/',
    jobsLabel: '招聘官网',
  },
  {
    id: 'huawei',
    kind: 'company',
    name: '华为',
    blurb: '校园招聘入口在华为招聘门户',
    careers: ['软件工程师', '人工智能工程师', '产品经理'],
    jobsUrl: 'https://career.huawei.com/reccampportal/portal5/index.html',
    jobsLabel: '校园招聘',
  },
  {
    id: 'jd',
    kind: 'company',
    name: '京东',
    blurb: '校招集中在京东校园招聘',
    careers: ['软件工程师', '产品经理', '数据分析师'],
    jobsUrl: 'https://campus.jd.com/',
    jobsLabel: '校园招聘',
  },
  {
    id: 'xiaomi',
    kind: 'company',
    name: '小米',
    blurb: '校招、实习在小米招聘网',
    careers: ['软件工程师', '产品经理', 'UI/UX设计师'],
    jobsUrl: 'https://hr.xiaomi.com/',
    jobsLabel: '招聘官网',
  },
  {
    id: 'pdd',
    kind: 'company',
    name: '拼多多',
    blurb: '校招节奏快，以官网岗位为准',
    careers: ['软件工程师', '产品经理', '数据分析师'],
    jobsUrl: 'https://careers.pinduoduo.com/',
    jobsLabel: '招聘官网',
  },
  {
    id: 'eastmoney',
    kind: 'company',
    name: '东方财富',
    blurb: '站内金融岗对应雇主之一',
    careers: ['金融分析师', '软件工程师', '数据分析师'],
    jobsUrl: 'https://about.eastmoney.com/joinus.html',
    jobsLabel: '加入我们',
  },
  {
    id: 'cmb',
    kind: 'company',
    name: '招商银行',
    blurb: '银行校招、管培、科技岗',
    careers: ['金融分析师', '软件工程师', '数据分析师'],
    jobsUrl: 'https://career.cmbchina.com/',
    jobsLabel: '招聘官网',
  },
  {
    id: 'cicc',
    kind: 'company',
    name: '中金公司',
    blurb: '投行/研究实习走校园招聘',
    careers: ['金融分析师'],
    jobsUrl: 'https://campus.cicc.com/',
    jobsLabel: '校园招聘',
  },
  {
    id: 'kpmg',
    kind: 'company',
    name: '毕马威',
    blurb: '站内已有实训课的咨询所',
    careers: ['金融分析师', '数据分析师'],
    jobsUrl: 'https://kpmg.com/cn/zh/home/careers.html',
    jobsLabel: '招聘官网',
    internUrl: 'https://kpmg.com/cn/zh/home/careers/students.html',
    internLabel: '校园招聘',
  },
  {
    id: 'deloitte',
    kind: 'company',
    name: '德勤',
    blurb: '审计、咨询、风险校招',
    careers: ['金融分析师', '数据分析师'],
    jobsUrl: 'https://www2.deloitte.com/cn/zh/careers.html',
    jobsLabel: '招聘官网',
  },
];

export function filterRecruitPortals(query: string, career = ''): RecruitPortal[] {
  const kw = query.trim().toLowerCase();
  const careerName = career.trim();
  return RECRUIT_PORTALS.filter((item) => {
    if (careerName && item.careers.length > 0 && !item.careers.includes(careerName)) {
      return false;
    }
    if (!kw) return true;
    const hay = `${item.name} ${item.blurb} ${item.careers.join(' ')}`.toLowerCase();
    return hay.includes(kw);
  });
}
