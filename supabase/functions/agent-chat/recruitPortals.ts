/** 与 src/data/recruitPortals.ts 保持同步。 */
export type RecruitPortal = {
  id: string;
  kind: 'board' | 'company';
  name: string;
  blurb: string;
  careers: string[];
  jobsUrl: string;
  jobsLabel: string;
  internUrl?: string;
  internLabel?: string;
};

export const RECRUIT_PORTALS: RecruitPortal[] = [
  { id: 'ncss', kind: 'board', name: '国家大学生就业服务平台', blurb: '教育部就业网', careers: [], jobsUrl: 'https://www.ncss.cn/', jobsLabel: '就业网' },
  { id: 'shixiseng', kind: 'board', name: '实习僧', blurb: '实习岗位检索', careers: [], jobsUrl: 'https://www.shixiseng.com/', jobsLabel: '找实习' },
  { id: 'nowcoder-jobs', kind: 'board', name: '牛客招聘', blurb: '互联网校招/实习', careers: ['软件工程师', '数据分析师', '产品经理', '人工智能工程师'], jobsUrl: 'https://www.nowcoder.com/jobs', jobsLabel: '校招实习' },
  { id: 'haitou', kind: 'board', name: '海投网', blurb: '宣讲会、网申日历', careers: [], jobsUrl: 'https://www.haitou.cc/', jobsLabel: '宣讲网申' },
  { id: 'yingjiesheng', kind: 'board', name: '应届生求职网', blurb: '应届校招信息站', careers: [], jobsUrl: 'https://www.yingjiesheng.com/', jobsLabel: '应届校招' },
  { id: 'zhaopin-campus', kind: 'board', name: '智联校园', blurb: '校园招聘', careers: ['金融分析师', '产品经理', '数据分析师'], jobsUrl: 'https://xiaoyuan.zhaopin.com/', jobsLabel: '校园招聘' },
  { id: 'tencent', kind: 'company', name: '腾讯', blurb: '招聘官网', careers: ['软件工程师', '产品经理', 'UI/UX设计师', '数据分析师', '人工智能工程师'], jobsUrl: 'https://careers.tencent.com/', jobsLabel: '招聘官网', internUrl: 'https://careers.tencent.com/zh-cn/campusrecruit.html', internLabel: '校园招聘' },
  { id: 'bytedance', kind: 'company', name: '字节跳动', blurb: '校招页', careers: ['软件工程师', '产品经理', 'UI/UX设计师', '数据分析师', '人工智能工程师'], jobsUrl: 'https://jobs.bytedance.com/experienced/position', jobsLabel: '招聘官网', internUrl: 'https://jobs.bytedance.com/campus/position', internLabel: '校园/实习' },
  { id: 'alibaba', kind: 'company', name: '阿里巴巴', blurb: '人才官网', careers: ['软件工程师', '产品经理', 'UI/UX设计师', '数据分析师', '人工智能工程师'], jobsUrl: 'https://talent.alibaba.com/', jobsLabel: '招聘官网' },
  { id: 'meituan', kind: 'company', name: '美团', blurb: '招聘网', careers: ['软件工程师', '产品经理', '数据分析师', '人工智能工程师'], jobsUrl: 'https://zhaopin.meituan.com/', jobsLabel: '招聘官网' },
  { id: 'baidu', kind: 'company', name: '百度', blurb: '人才官网', careers: ['软件工程师', '人工智能工程师', '产品经理', '数据分析师'], jobsUrl: 'https://talent.baidu.com/external/baidu/index.html#/job/list', jobsLabel: '招聘官网' },
  { id: 'netease', kind: 'company', name: '网易', blurb: '招聘官网', careers: ['软件工程师', '产品经理', 'UI/UX设计师'], jobsUrl: 'https://hr.163.com/', jobsLabel: '招聘官网' },
  { id: 'huawei', kind: 'company', name: '华为', blurb: '校园招聘', careers: ['软件工程师', '人工智能工程师', '产品经理'], jobsUrl: 'https://career.huawei.com/reccampportal/portal5/index.html', jobsLabel: '校园招聘' },
  { id: 'jd', kind: 'company', name: '京东', blurb: '校园招聘', careers: ['软件工程师', '产品经理', '数据分析师'], jobsUrl: 'https://campus.jd.com/', jobsLabel: '校园招聘' },
  { id: 'xiaomi', kind: 'company', name: '小米', blurb: '招聘网', careers: ['软件工程师', '产品经理', 'UI/UX设计师'], jobsUrl: 'https://hr.xiaomi.com/', jobsLabel: '招聘官网' },
  { id: 'pdd', kind: 'company', name: '拼多多', blurb: '招聘官网', careers: ['软件工程师', '产品经理', '数据分析师'], jobsUrl: 'https://careers.pinduoduo.com/', jobsLabel: '招聘官网' },
  { id: 'eastmoney', kind: 'company', name: '东方财富', blurb: '加入我们', careers: ['金融分析师', '软件工程师', '数据分析师'], jobsUrl: 'https://about.eastmoney.com/joinus.html', jobsLabel: '加入我们' },
  { id: 'cmb', kind: 'company', name: '招商银行', blurb: '招聘官网', careers: ['金融分析师', '软件工程师', '数据分析师'], jobsUrl: 'https://career.cmbchina.com/', jobsLabel: '招聘官网' },
  { id: 'cicc', kind: 'company', name: '中金公司', blurb: '校园招聘', careers: ['金融分析师'], jobsUrl: 'https://campus.cicc.com/', jobsLabel: '校园招聘' },
  { id: 'kpmg', kind: 'company', name: '毕马威', blurb: '招聘官网', careers: ['金融分析师', '数据分析师'], jobsUrl: 'https://kpmg.com/cn/zh/home/careers.html', jobsLabel: '招聘官网', internUrl: 'https://kpmg.com/cn/zh/home/careers/students.html', internLabel: '校园招聘' },
  { id: 'deloitte', kind: 'company', name: '德勤', blurb: '招聘官网', careers: ['金融分析师', '数据分析师'], jobsUrl: 'https://www2.deloitte.com/cn/zh/careers.html', jobsLabel: '招聘官网' },
];

export function filterRecruitPortals(query: string, career = ''): RecruitPortal[] {
  const kw = query.trim().toLowerCase();
  const careerName = career.trim();
  return RECRUIT_PORTALS.filter((item) => {
    if (careerName && item.careers.length > 0 && !item.careers.includes(careerName)) return false;
    if (!kw) return true;
    return `${item.name} ${item.blurb} ${item.careers.join(' ')}`.toLowerCase().includes(kw);
  });
}
