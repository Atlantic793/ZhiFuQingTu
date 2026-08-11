import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  School,
  Search,
  Sparkles,
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

function InfoPlaceholder({ icon, title, hint, highlights }: {
  icon: React.ReactNode; title: string; hint: string; highlights: string[];
}) {
  return (
    <div className="rounded-[24px] overflow-hidden bg-white"
      style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.03), inset 0 2px 8px rgba(255,255,255,0.7), 0 2px 12px rgba(0,0,0,0.04)' }}>
      <div className="p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-[18px] bg-claude-surface-cream-strong flex items-center justify-center text-claude-primary">{icon}</div>
        <h3 className="text-lg font-semibold text-claude-ink mb-2">{title}</h3>
        <p className="text-sm text-claude-muted max-w-lg mx-auto mb-5 leading-relaxed">{hint}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {highlights.map((h) => (
            <span key={h} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-claude-pill bg-claude-surface-soft text-claude-body">
              <Sparkles className="w-3.5 h-3.5 text-claude-primary" />{h}
            </span>
          ))}
        </div>
      </div>
    </div>
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
            查询考研、保研相关的院校与时间信息。院校招生数据正在整理中，先提供备考路径参考；具体时间节点以研招网与院校官网当年发布为准。
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
              <InfoPlaceholder icon={<CalendarClock className="w-7 h-7" />} title="考研院校信息整理中"
                hint="我们正在整理各院校的招生简章、初试时间与报名截止节点，上线后将支持「报名倒计时」提醒，方便你按时间规划备考节奏。"
                highlights={['招生信息', '分数线', '报名倒计时', '初试时间']} />

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
