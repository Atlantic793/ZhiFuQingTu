import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  School,
  Search,
  Tag,
} from 'lucide-react';
import {
  fetchStudyPaths,
  fetchSubjects,
} from '../services/catalogService';
import type { StudyPath, Subject, BaoyanProgram, BaoyanUniversity } from '../types/catalog';
import { subjectIconMap } from '../utils/subjectIcons';
import { fetchBaoyanPrograms, fetchBaoyanUniversities } from '../services/pathwayService';
import { SkeletonPathways, SkeletonTopicGrid } from '../components/Skeleton';

type GradTab = 'kaoyan' | 'baoyan';

const CATEGORIES = ['全部', '计算机大类', '经管法学类', '机械能源自动化大类', '材料化学类'] as const;
const STATUSES = ['全部', 'open', 'closed', 'tba'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  '计算机大类': 'bg-macaron-mint/50 border-macaron-mint/50 text-claude-body',
  '经管法学类': 'bg-macaron-peach/40 border-macaron-peach/40 text-claude-body',
  '机械能源自动化大类': 'bg-macaron-lavender/50 border-macaron-lavender/50 text-claude-body',
  '材料化学类': 'bg-claude-surface-card border-claude-hairline text-claude-body',
};

const STATUS_LABELS: Record<string, string> = {
  open: '报名中', closed: '已截止', tba: '待公布', '全部': '全部',
};

function deadlineCountdown(deadline: string | null): string {
  if (!deadline) return '';
  const now = Date.now();
  const diff = new Date(deadline).getTime() - now;
  if (diff <= 0) return '已截止';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return days + ' 天后截止';
  if (hours > 0) return hours + ' 小时后截止';
  return '即将截止';
}

function filterClass(active: boolean) {
  return active
    ? 'bg-claude-primary text-white border-claude-primary shadow-sm'
    : 'bg-white text-claude-body border-claude-hairline hover:border-claude-muted hover:bg-claude-surface-soft';
}

function PathCard({ path, subject }: { path: StudyPath; subject?: Subject }) {
  return (
    <div
      className="rounded-claude-xl bg-white border border-claude-hairline p-5 transition-all hover:shadow-md"
      style={{ boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.04), inset 0 2px 8px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-claude-pill text-xs font-medium"
              style={{ backgroundColor: '#a8d8ea55', color: '#4a4a4a' }}>
              <GraduationCap className="w-4 h-4" />考研
            </span>
            {subject && <span className="text-xs text-claude-muted">{subject.name}</span>}
          </div>
          <h3 className="text-base font-semibold text-claude-ink">{path.name}</h3>
        </div>
      </div>
      <p className="text-sm text-claude-body leading-relaxed mb-4">{path.description}</p>
      {path.examSubjects.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-claude-muted mb-2">考试科目</p>
          <div className="flex flex-wrap gap-1.5">
            {path.examSubjects.map((s) => (
              <span key={s} className="px-2 py-1 rounded-claude-sm bg-claude-canvas border border-claude-hairline text-xs text-claude-body">{s}</span>
            ))}
          </div>
        </div>
      )}
      {path.applicableMajors.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-claude-muted mb-2">对口专业</p>
          <div className="flex flex-wrap gap-1.5">
            {path.applicableMajors.map((m) => (
              <span key={m} className="px-2 py-1 rounded-claude-sm bg-claude-surface-blue text-xs text-claude-body">{m}</span>
            ))}
          </div>
        </div>
      )}
      {path.timeframe.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-claude-muted mb-2">备考时间线</p>
          <div className="space-y-1.5">
            {path.timeframe.map((step) => (
              <div key={step.phase} className="flex items-start gap-2 text-xs text-claude-body">
                <span className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-claude-sm font-medium text-claude-muted whitespace-nowrap"
                  style={{ backgroundColor: '#a8d8ea30' }}>{step.phase}</span>
                <span className="leading-snug">{step.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {path.notes && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-claude-md bg-amber-50 border border-amber-100">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">{path.notes}</p>
        </div>
      )}
    </div>
  );
}

const NATIONAL_TIMELINE: Array<{ phase: string; when: string; detail: string }> = [
  { phase: '预报名', when: '约 10 月上旬', detail: '上一届（2026 考研）为 2025 年 10 月 10–13 日。安排由各省级考试机构确定并公布。填报成功并缴费后，正式报名阶段一般不必重复报名。' },
  { phase: '正式报名', when: '约 10 月中下旬', detail: '上一届为 2025 年 10 月 16–27 日，每日 9:00–22:00，在研招网完成网上报名并缴费，逾期不补。报名期间可改信息，但每人只保留一条有效报名。' },
  { phase: '网上确认', when: '报名后、初试前', detail: '时间由各省级考试机构确定。未参加或未通过网上确认的，无法参加考试。' },
  { phase: '全国初试', when: '约 12 月第三个周末', detail: '上一届为 2025 年 12 月 20–21 日，全国同一天笔试。准考证考前约 10 天在研招网下载。' },
  { phase: '国家线', when: '次年 2–3 月', detail: '上一届于 2026 年 2 月 28 日由教育部公布。按学科门类和 A/B 区划进入复试的基本要求。各校院线在此之上另划；经批准的招生单位可自主划线。' },
  { phase: '复试与调剂', when: '国家线之后', detail: '复试时间、内容由学校公布。调剂须通过研招网调剂服务系统。' },
];

const UNIFIED_SUBJECTS: Array<{
  name: string;
  note: string;
  courses: Array<{ label: string; bvid: string }>;
}> = [
  {
    name: '思想政治理论',
    note: '绝大多数专业都考，全国统考。',
    courses: [{ label: '徐涛 2027 强化班', bvid: 'BV1HCgj65EQq' }],
  },
  {
    name: '英语一 / 英语二',
    note: '学硕多用英语一，专硕多用英语二，以当年专业目录为准。',
    courses: [
      { label: '田静 句句真研（语法）', bvid: 'BV1fu9QB1Emi' },
      { label: '唐迟《真题的逻辑》试看', bvid: 'BV1zRzKB7E1S' },
    ],
  },
  {
    name: '数学一 / 二 / 三',
    note: '理工、经管常见；部分专业改考 396 经济类联考，或不考数学。',
    courses: [{ label: '张宇 基础 30 讲', bvid: 'BV19PQBBREK1' }],
  },
  {
    name: '专业课统考（如 408）',
    note: '计算机等专业可能考全国统考专业课；很多学校仍用自命题。',
    courses: [
      { label: '王道 · 数据结构', bvid: 'BV1b7411N798' },
      { label: '王道 · 操作系统', bvid: 'BV1YE411D7nH' },
    ],
  },
];

function NationalKaoyanGuide() {
  const [openPhase, setOpenPhase] = useState<string | null>('预报名');
  const [openSubject, setOpenSubject] = useState<string | null>(null);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-claude-ink">全国统考须知</h2>
          <p className="text-sm text-claude-muted mt-1">
            报名、初试、国家线全国一套。点开节点看上一届核实过的日期；2027 具体日子等研招网当年公告。
          </p>
        </div>
        <a
          href="https://yz.chsi.com.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-claude-primary hover:underline"
        >
          研招网
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div
        className="rounded-[24px] overflow-hidden bg-white px-5 py-6 sm:px-8 sm:py-8"
        style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.03), inset 0 2px 8px rgba(255,255,255,0.7), 0 2px 12px rgba(0,0,0,0.04)' }}
      >
        <ol className="relative ml-3 sm:ml-4">
          <span
            aria-hidden
            className="absolute left-[7px] top-2 bottom-2 w-px bg-[#eadfd4]"
          />
          {NATIONAL_TIMELINE.map((step) => {
            const open = openPhase === step.phase;
            return (
              <li key={step.phase} className="relative pl-8 sm:pl-10 pb-1 last:pb-0">
                <span
                  aria-hidden
                  className={`absolute left-0 top-3 h-4 w-4 rounded-full border-2 border-white ${
                    open ? 'bg-[#7eb8c9]' : 'bg-[#d4c4b0]'
                  }`}
                  style={{ boxShadow: '0 0 0 1px #eadfd4' }}
                />
                <button
                  type="button"
                  onClick={() => setOpenPhase(open ? null : step.phase)}
                  className="w-full text-left py-2.5 group"
                  aria-expanded={open}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-claude-ink group-hover:text-claude-primary transition-colors">
                      {step.phase}
                    </span>
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-xs text-claude-muted">
                      {step.when}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-claude-muted-soft transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </div>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-claude-body leading-relaxed pb-5 pr-1">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-2 pt-6 border-t border-[#eadfd4]/80">
          <p className="text-xs text-claude-muted mb-3">统考科目 · 点名称看说明</p>
          <div className="flex flex-wrap gap-2">
            {UNIFIED_SUBJECTS.map((item) => {
              const open = openSubject === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setOpenSubject(open ? null : item.name)}
                  className={`text-left text-sm px-3 py-1.5 rounded-full transition-colors ${
                    open
                      ? 'bg-[#7eb8c9]/25 text-claude-ink'
                      : 'bg-[#f6f0ea] text-claude-body hover:bg-[#eadfd4]/70'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
          {openSubject && (() => {
            const subject = UNIFIED_SUBJECTS.find((s) => s.name === openSubject);
            if (!subject) return null;
            return (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-claude-body leading-relaxed">{subject.note}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {subject.courses.map((course) => (
                    <a
                      key={course.bvid}
                      href={`https://www.bilibili.com/video/${course.bvid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-claude-primary hover:underline"
                    >
                      {course.label}
                      <span className="text-xs text-claude-muted font-mono">{course.bvid}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
                <p className="text-[11px] text-claude-muted">
                  B 站公开课，合集可能下架；不是官方指定教材。
                </p>
              </div>
            );
          })()}
        </div>

        <p className="mt-6 text-xs text-claude-muted leading-relaxed">
          国家线分 A 区、B 区，是进复试的全国底线，不是某校录取分。
          <a
            href="https://yz.chsi.com.cn/kyzx/kp/202602/20260228/2293449093.html"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-claude-primary hover:underline"
          >
            2026 年公告
          </a>
          。院校目录还在整理，专业课自命题、拟招人数、复试线各校不同。
        </p>
      </div>
    </section>
  );
}

function ProgramCard({ program, onOpen }: { program: BaoyanProgram; onOpen: (p: BaoyanProgram) => void }) {
  const badge = program.deadlineStatus === 'open'
    ? <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-macaron-mint/50 border-claude-hairline text-claude-success">{deadlineCountdown(program.deadline)}</span>
    : program.deadlineStatus === 'closed'
    ? <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-claude-surface-card border-claude-hairline text-claude-muted">已截止</span>
    : <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-macaron-peach/40 border-claude-hairline text-claude-body">待公布</span>;

  return (
    <button type="button" onClick={() => onOpen(program)}
      className="group w-full text-left rounded-[16px] overflow-hidden bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.04)' }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-medium text-claude-ink leading-snug group-hover:text-claude-primary transition-colors line-clamp-2">{program.programName}</h3>
          {badge}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-claude-muted mb-3">
          <span className="inline-flex items-center gap-1"><Building2 className="w-4 h-4" />{program.universityName}</span>
          <span className="inline-flex items-center gap-1"><Tag className="w-4 h-4" />{program.category}</span>
        </div>
        {program.deadlineStatus === 'open' && program.deadline && (
          <div className="flex items-center gap-1 text-xs text-claude-muted-soft">
            <Calendar className="w-3.5 h-3.5" />
            <span>截止日期：{new Date(program.deadline).toLocaleDateString('zh-CN')}</span>
          </div>
        )}
      </div>
    </button>
  );
}

function ProgramDetail({ program, onBack }: { program: BaoyanProgram; onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button type="button" onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-claude-lg bg-claude-surface-card text-claude-ink text-sm font-medium hover:bg-claude-surface-soft border border-claude-hairline transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />返回列表
      </button>
      <div className="rounded-[24px] overflow-hidden bg-macaron-mint/40 p-6 sm:p-8 mb-6"
        style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.5), 0 2px 10px rgba(0,0,0,0.04)' }}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[program.category] || 'bg-claude-surface-card border-claude-hairline text-claude-body'}`}>{program.category}</span>
          {program.deadlineStatus === 'open' ? <span className="text-xs px-2.5 py-1 rounded-full bg-macaron-mint/50 text-claude-success border-claude-hairline">{deadlineCountdown(program.deadline)}</span>
          : program.deadlineStatus === 'closed' ? <span className="text-xs px-2.5 py-1 rounded-full bg-claude-surface-card text-claude-muted border-claude-hairline">已截止</span>
          : <span className="text-xs px-2.5 py-1 rounded-full bg-macaron-peach/40 text-claude-body border-claude-hairline">待公布</span>}
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-claude-ink mb-3">{program.programName}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-claude-body mb-4">
          <span className="inline-flex items-center gap-1.5"><Building2 className="w-4 h-4 text-claude-muted" />{program.universityName}</span>
          {program.deadline && <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-claude-muted" />截止：{new Date(program.deadline).toLocaleString('zh-CN')}</span>}
        </div>
        <p className="text-claude-muted text-sm">原始截止信息：{program.deadlineRaw}</p>
      </div>
      <a href={program.url} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-claude-lg bg-claude-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
        查看通知原文<ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

const Pathways = () => {
  const [tab, setTab] = useState<GradTab>('kaoyan');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [paths, setPaths] = useState<StudyPath[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [examLoading, setExamLoading] = useState(true);
  const [error, setError] = useState('');

  const [programs, setPrograms] = useState<BaoyanProgram[]>([]);
  const [universities, setUniversities] = useState<BaoyanUniversity[]>([]);
  const [baoyanLoading, setBaoyanLoading] = useState(true);
  const [selected, setSelected] = useState<BaoyanProgram | null>(null);
  const [keyword, setKeyword] = useState('');
  const [universityFilter, setUniversityFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('全部');
  const [statusFilter, setStatusFilter] = useState<string>('全部');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sr, pr] = await Promise.all([fetchSubjects(), fetchStudyPaths()]);
        if (!cancelled) { setSubjects(sr); setPaths(pr); }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载升学规划失败');
      } finally {
        if (!cancelled) setExamLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rows, unis] = await Promise.all([fetchBaoyanPrograms(), fetchBaoyanUniversities()]);
        if (!cancelled) { setPrograms(rows); setUniversities(unis); }
      } finally {
        if (!cancelled) setBaoyanLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const kaoyanPaths = useMemo(() => paths.filter((p) => p.kind === 'kaoyan'), [paths]);
  const filteredPaths = useMemo(() =>
    selectedSubjectId ? kaoyanPaths.filter((p) => p.subjectId === selectedSubjectId) : kaoyanPaths,
  [kaoyanPaths, selectedSubjectId]);

  const filteredPrograms = useMemo(() => {
    let r = programs;
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      r = r.filter((p) => p.programName.toLowerCase().includes(kw) || p.universityName.toLowerCase().includes(kw));
    }
    if (universityFilter) r = r.filter((p) => p.universityName === universityFilter);
    if (categoryFilter !== '全部') r = r.filter((p) => p.category === categoryFilter);
    if (statusFilter !== '全部') r = r.filter((p) => p.deadlineStatus === statusFilter);
    return r;
  }, [programs, keyword, universityFilter, categoryFilter, statusFilter]);

  // 院校下拉框：每个大类统一展示全部院校
  const universityNames = useMemo(() => {
    const names = new Set(programs.map((p) => p.universityName).filter(Boolean));
    return universities.map((u) => u.name).filter((n) => names.has(n));
  }, [programs, universities]);

  const openCount = useMemo(() => programs.filter((p) => p.deadlineStatus === 'open').length, [programs]);

  const tabClass = (active: boolean) =>
    'px-4 py-2 rounded-claude-pill text-sm font-medium transition-colors ' + (
      active ? 'bg-claude-surface-cream-strong text-claude-ink ring-1 ring-claude-primary'
        : 'bg-claude-surface-card text-claude-muted hover:bg-claude-surface-soft'
    );

  if (selected) {
    return (
      <div className="pt-16 min-h-screen relative">
        <div className="fixed top-16 right-4 w-36 h-36 rounded-[50%_55%_45%_50%] pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle at 40% 35%, #a8d8ea 0%, transparent 70%)', boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
        <div className="fixed bottom-8 left-4 w-28 h-28 rounded-[55%_40%_55%_45%] pointer-events-none opacity-50"
          style={{ background: 'radial-gradient(circle at 35% 30%, #f8b8c8 0%, transparent 70%)', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProgramDetail program={selected} onBack={() => setSelected(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen relative">
      <div className="fixed top-16 right-4 w-36 h-36 rounded-[50%_55%_45%_50%] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle at 40% 35%, #a8d8ea 0%, transparent 70%)', boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-8 left-4 w-28 h-28 rounded-[55%_40%_55%_45%] pointer-events-none opacity-50"
        style={{ background: 'radial-gradient(circle at 35% 30%, #f8b8c8 0%, transparent 70%)', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-1/3 left-8 w-20 h-20 rounded-[45%_55%_55%_45%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 40% 30%, #d4b8e0 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-claude-ink mb-2">升学规划</h1>
          <p className="text-claude-muted text-base max-w-2xl">
            查询考研、保研相关信息。考研先看全国统考时间线和科目；院校目录仍在整理。具体日期以研招网与院校官网当年发布为准。
          </p>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <button type="button" onClick={() => setTab('kaoyan')} className={tabClass(tab === 'kaoyan')}>
            <span className="inline-flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />考研信息</span>
          </button>
          <button type="button" onClick={() => setTab('baoyan')} className={tabClass(tab === 'baoyan')}>
            <span className="inline-flex items-center gap-1.5"><School className="w-4 h-4" />保研信息</span>
          </button>
        </div>

        {error && <div className="mb-6 p-3 rounded-claude-md bg-red-100 text-red-600 text-sm">{error}</div>}

        {tab === 'kaoyan' ? (
          examLoading ? <SkeletonTopicGrid /> : (
            <div className="space-y-10">
              <NationalKaoyanGuide />

              <section>
                <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-claude-ink">考研路径建议</h2>
                    <span className="text-xs text-claude-muted-soft">{filteredPaths.length} 条路径</span>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setSelectedSubjectId(null)}
                      className={'px-4 py-2 rounded-claude-pill text-sm font-medium transition-colors ' + (
                        selectedSubjectId === null ? 'bg-claude-surface-cream-strong text-claude-ink ring-1 ring-claude-primary' : 'bg-claude-surface-card text-claude-muted hover:bg-claude-surface-soft')}>全部学科</button>
                    {subjects.map((s) => (
                      <button key={s.id} type="button" onClick={() => setSelectedSubjectId(s.id)}
                        className={'inline-flex items-center gap-1.5 px-4 py-2 rounded-claude-pill text-sm font-medium transition-colors ' + (
                          selectedSubjectId === s.id ? 'text-claude-ink ring-1 ring-claude-primary' : 'bg-claude-surface-card text-claude-muted hover:bg-claude-surface-soft')}
                        style={{ backgroundColor: selectedSubjectId === s.id ? s.color + '35' : undefined }}>
                        {subjectIconMap[s.icon]}{s.name}
                      </button>
                    ))}
                  </div>
                </div>
                {filteredPaths.length === 0 ? (
                  <div className="text-center py-16 text-claude-muted">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-claude-muted-soft" />
                    <p>该学科暂无考研路径数据，请先确认已执行 study_paths 迁移 SQL。</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredPaths.map((path) => (
                      <PathCard key={path.id} path={path} subject={subjects.find((s) => s.id === path.subjectId)} />
                    ))}
                  </div>
                )}
                <div className="flex items-start gap-2 px-4 py-3 rounded-claude-md bg-claude-surface-soft mt-8">
                  <CheckCircle2 className="w-4 h-4 text-claude-muted mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-claude-muted leading-relaxed">
                    本页信息为结构性参考（考试科目、对口专业、备考时间线），属于稳定内容；具体分数线、招生人数与政策以研招网及院校官网当年发布为准。
                  </p>
                </div>
              </section>
            </div>
          )
        ) : (
          baoyanLoading ? <SkeletonPathways /> : (
            <div>
              <div className="mb-6 space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-muted-soft" />
                  <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                    placeholder="搜索院校或项目名称…"
                    className="w-full pl-10 pr-4 py-2.5 rounded-claude-lg text-sm bg-white border border-claude-hairline text-claude-ink placeholder:text-claude-muted-soft focus:outline-none focus:border-claude-primary transition-colors" />
                </div>
                <div>
                  <select value={universityFilter} onChange={(e) => setUniversityFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-claude-lg text-sm bg-white border border-claude-hairline text-claude-ink focus:outline-none focus:border-claude-primary transition-colors max-w-xs cursor-pointer">
                    <option value="">全部院校</option>
                    {universityNames.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c} type="button" onClick={() => setCategoryFilter(c)}
                      className={'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ' + filterClass(categoryFilter === c)}>
                      {c === '全部' ? '全部大类' : c}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button key={s} type="button" onClick={() => setStatusFilter(s)}
                      className={'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ' + filterClass(statusFilter === s)}>
                      {STATUS_LABELS[s]}
                      {s === 'open' && openCount > 0 && <span className="ml-1 text-[10px] opacity-70">({openCount})</span>}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-claude-muted">
                  共 {filteredPrograms.length} / {programs.length} 条项目
                  {filteredPrograms.length !== programs.length && '（已筛选）'}
                </p>
              </div>
              {filteredPrograms.length === 0 ? (
                <div className="text-center py-16 text-claude-muted">
                  <Search className="w-12 h-12 mx-auto mb-3 text-claude-muted-soft" />
                  <p className="mb-4">没有匹配的保研项目</p>
                  <button type="button"
                    onClick={() => { setKeyword(''); setUniversityFilter(''); setCategoryFilter('全部'); setStatusFilter('全部'); }}
                    className="px-5 py-2 rounded-claude-lg bg-claude-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    返回全部列表
                  </button>
                </div>
              ) : (
                <div key={`${categoryFilter}-${statusFilter}-${universityFilter}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                  {filteredPrograms.map((p) => <ProgramCard key={p.id} program={p} onOpen={setSelected} />)}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Pathways;
