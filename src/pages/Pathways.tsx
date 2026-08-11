import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  GraduationCap,
  Search,
  Tag,
} from 'lucide-react';
import type { BaoyanProgram, BaoyanUniversity } from '../types/catalog';
import { fetchBaoyanPrograms, fetchBaoyanUniversities } from '../services/pathwayService';
import { SkeletonPathways } from '../components/Skeleton';

type PathwayTab = 'exam' | 'baoyan';

const CATEGORIES = ['全部', '计算机大类', '经管法学类', '机械能源自动化大类', '材料化学类'] as const;
const STATUSES = ['全部', 'open', 'closed', 'tba'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  '计算机大类': 'bg-macaron-mint/50 border-macaron-mint/50 text-claude-body',
  '经管法学类': 'bg-macaron-peach/40 border-macaron-peach/40 text-claude-body',
  '机械能源自动化大类': 'bg-macaron-lavender/50 border-macaron-lavender/50 text-claude-body',
  '材料化学类': 'bg-claude-surface-card border-claude-hairline text-claude-body',
};

const STATUS_LABELS: Record<string, string> = {
  open: '报名中',
  closed: '已截止',
  tba: '待公布',
  '全部': '全部',
};

function deadlineCountdown(deadline: string | null): string {
  if (!deadline) return '';
  const now = Date.now();
  const target = new Date(deadline).getTime();
  const diff = target - now;
  if (diff <= 0) return '已截止';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} 天后截止`;
  if (hours > 0) return `${hours} 小时后截止`;
  return '即将截止';
}

function filterClass(active: boolean) {
  return active
    ? 'bg-claude-primary text-white border-claude-primary shadow-sm'
    : 'bg-white text-claude-body border-claude-hairline hover:border-claude-muted hover:bg-claude-surface-soft';
}

// ── Card ──

function ProgramCard({ program, onOpen }: { program: BaoyanProgram; onOpen: (p: BaoyanProgram) => void }) {
  const statusBadge = (() => {
    if (program.deadlineStatus === 'open') {
      const countdown = deadlineCountdown(program.deadline);
      return (
        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-macaron-mint/50 border-claude-hairline text-claude-success">
          {countdown}
        </span>
      );
    }
    if (program.deadlineStatus === 'closed') {
      return (
        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-claude-surface-card border-claude-hairline text-claude-muted">
          已截止
        </span>
      );
    }
    return (
      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-macaron-peach/40 border-claude-hairline text-claude-body">
        待公布
      </span>
    );
  })();

  return (
    <button
      type="button"
      onClick={() => onOpen(program)}
      className="group w-full text-left rounded-[16px] overflow-hidden bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        boxShadow:
          'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.04)',
      }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-medium text-claude-ink leading-snug group-hover:text-claude-primary transition-colors line-clamp-2">
            {program.programName}
          </h3>
          {statusBadge}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-claude-muted mb-3">
          <span className="inline-flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            {program.universityName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Tag className="w-4 h-4" />
            {program.category}
          </span>
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

// ── Detail ──

function ProgramDetail({ program, onBack }: { program: BaoyanProgram; onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-claude-muted hover:text-claude-ink mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        返回列表
      </button>

      <div
        className="rounded-[24px] overflow-hidden bg-macaron-mint/40 p-6 sm:p-8 mb-6"
        style={{
          boxShadow:
            'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.5), 0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span
            className={`text-xs px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[program.category] || 'bg-claude-surface-card border-claude-hairline text-claude-body'}`}
          >
            {program.category}
          </span>
          {program.deadlineStatus === 'open' ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-macaron-mint/50 text-claude-success border-claude-hairline">
              {deadlineCountdown(program.deadline)}
            </span>
          ) : program.deadlineStatus === 'closed' ? (
            <span className="text-xs px-2.5 py-1 rounded-full bg-claude-surface-card text-claude-muted border-claude-hairline">
              已截止
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full bg-macaron-peach/40 text-claude-body border-claude-hairline">
              待公布
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold text-claude-ink mb-3">{program.programName}</h1>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-claude-body mb-4">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-claude-muted" />
            {program.universityName}
          </span>
          {program.deadline && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-claude-muted" />
              截止：{new Date(program.deadline).toLocaleString('zh-CN')}
            </span>
          )}
        </div>

        <p className="text-claude-muted text-sm">
          原始截止信息：{program.deadlineRaw}
        </p>
      </div>

      <a
        href={program.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-claude-lg bg-claude-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        查看通知原文
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

// ── Page ──

const Pathways = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [programs, setPrograms] = useState<BaoyanProgram[]>([]);
  const [universities, setUniversities] = useState<BaoyanUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BaoyanProgram | null>(null);
  const [keyword, setKeyword] = useState('');
  const [universityFilter, setUniversityFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('全部');
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [activeTab, setActiveTab] = useState<PathwayTab>(
    (searchParams.get('tab') as PathwayTab) || 'baoyan',
  );

  const switchTab = (tab: PathwayTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rows, unis] = await Promise.all([
          fetchBaoyanPrograms(),
          fetchBaoyanUniversities(),
        ]);
        if (!cancelled) {
          setPrograms(rows);
          setUniversities(unis);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let result = programs;

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.programName.toLowerCase().includes(kw) ||
          p.universityName.toLowerCase().includes(kw),
      );
    }

    if (universityFilter) {
      result = result.filter((p) => p.universityName === universityFilter);
    }

    if (categoryFilter !== '全部') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (statusFilter !== '全部') {
      result = result.filter((p) => p.deadlineStatus === statusFilter);
    }

    return result;
  }, [programs, keyword, universityFilter, categoryFilter, statusFilter]);

  // Derived: university names in source-data order, only those with programs
  const universityNames = useMemo(() => {
    const namesInSet = new Set(programs.map((p) => p.universityName).filter(Boolean));
    return universities.map((u) => u.name).filter((n) => namesInSet.has(n));
  }, [programs, universities]);

  const openCount = useMemo(() => programs.filter((p) => p.deadlineStatus === 'open').length, [programs]);

  // ── Detail view ──
  if (selected) {
    return (
      <div className="pt-16 relative min-h-screen">
        {/* Clay blobs */}
        <div
          className="fixed top-16 right-8 w-36 h-36 rounded-[55%_45%_50%_50%] pointer-events-none opacity-60"
          style={{
            background: 'radial-gradient(circle at 40% 35%, #a8d8ea 0%, transparent 70%)',
            boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)',
          }}
        />
        <div
          className="fixed bottom-16 left-6 w-28 h-28 rounded-[45%_55%_55%_45%] pointer-events-none opacity-55"
          style={{
            background: 'radial-gradient(circle at 35% 30%, #f8e8a0 0%, transparent 70%)',
            boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)',
          }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
          <ProgramDetail program={selected} onBack={() => setSelected(null)} />
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="pt-16 relative">
      {/* Clay blobs */}
      <div
        className="fixed top-16 right-8 w-36 h-36 rounded-[55%_45%_50%_50%] pointer-events-none opacity-60"
        style={{
          background: 'radial-gradient(circle at 40% 35%, #a8d8ea 0%, transparent 70%)',
          boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)',
        }}
      />
      <div
        className="fixed bottom-16 left-6 w-28 h-28 rounded-[45%_55%_55%_45%] pointer-events-none opacity-55"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #f8e8a0 0%, transparent 70%)',
          boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)',
        }}
      />
      <div
        className="fixed top-1/2 right-12 w-24 h-24 rounded-[50%_55%_45%_50%] pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 40% 35%, #fcc8a8 0%, transparent 70%)',
          boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Folder tab bar */}
        <div className="mt-4 mb-10 relative z-10">
          <div
            className="rounded-claude-lg pl-6 pr-4 pt-3 pb-0 w-full"
            style={{
              background: 'linear-gradient(180deg, #e8e0d2 0%, #ddd5c4 100%)',
              boxShadow:
                'inset 0 -3px 10px rgba(0,0,0,0.08), inset 0 2px 6px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => switchTab('exam')}
                className="relative px-5 py-2.5 text-sm font-semibold transition-all duration-200"
                style={
                  activeTab === 'exam'
                    ? {
                        backgroundColor: '#fff',
                        color: '#0d9488',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px',
                        borderBottomLeftRadius: '0',
                        borderBottomRightRadius: '0',
                        boxShadow:
                          '0 -2px 8px rgba(0,0,0,0.06), 0 -1px 2px rgba(0,0,0,0.04), inset 0 1px 3px rgba(255,255,255,0.9), 0 2px 0 #fff',
                        transform: 'translateY(-2px)',
                        zIndex: 10,
                      }
                    : {
                        backgroundColor: 'rgba(239,232,216,0.8)',
                        color: '#787670',
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        borderBottomLeftRadius: '0',
                        borderBottomRightRadius: '0',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
                      }
                }
              >
                考研信息
              </button>
              <button
                type="button"
                onClick={() => switchTab('baoyan')}
                className="relative px-5 py-2.5 text-sm font-semibold transition-all duration-200"
                style={
                  activeTab === 'baoyan'
                    ? {
                        backgroundColor: '#fff',
                        color: '#0d9488',
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px',
                        borderBottomLeftRadius: '0',
                        borderBottomRightRadius: '0',
                        boxShadow:
                          '0 -2px 8px rgba(0,0,0,0.06), 0 -1px 2px rgba(0,0,0,0.04), inset 0 1px 3px rgba(255,255,255,0.9), 0 2px 0 #fff',
                        transform: 'translateY(-2px)',
                        zIndex: 10,
                      }
                    : {
                        backgroundColor: 'rgba(239,232,216,0.8)',
                        color: '#787670',
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        borderBottomLeftRadius: '0',
                        borderBottomRightRadius: '0',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
                      }
                }
              >
                保研信息
              </button>
            </div>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'exam' ? (
          /* 考研信息 — placeholder */
          <div className="pb-20">
            <div
              className="rounded-[24px] overflow-hidden bg-macaron-peach/30 p-10 sm:p-16 text-center max-w-2xl mx-auto"
              style={{
                boxShadow:
                  'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.5), 0 2px 10px rgba(0,0,0,0.04)',
              }}
            >
              <GraduationCap className="w-16 h-16 text-claude-muted-soft mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-claude-ink mb-2">考研信息</h2>
              <p className="text-claude-muted">数据收集中，敬请期待</p>
            </div>
          </div>
        ) : (
          /* 保研信息 */
          <>
            {loading ? (
              <SkeletonPathways />
            ) : (
              <>
                {/* Search + filters */}
                <div className="mb-6 space-y-4">
                  {/* Search */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-muted-soft" />
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="搜索院校或项目名称…"
                      className="w-full pl-10 pr-4 py-2.5 rounded-claude-lg text-sm bg-white border border-claude-hairline text-claude-ink placeholder:text-claude-muted-soft focus:outline-none focus:border-claude-primary transition-colors"
                    />
                  </div>

                  {/* University filter */}
                  <div>
                    <select
                      value={universityFilter}
                      onChange={(e) => setUniversityFilter(e.target.value)}
                      className="px-3.5 py-2 rounded-claude-lg text-sm bg-white border border-claude-hairline text-claude-ink focus:outline-none focus:border-claude-primary transition-colors max-w-xs cursor-pointer"
                    >
                      <option value="">全部院校</option>
                      {universityNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category filter */}
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${filterClass(categoryFilter === cat)}`}
                      >
                        {cat === '全部' ? `全部大类` : cat}
                      </button>
                    ))}
                  </div>

                  {/* Status filter */}
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFilter(s)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${filterClass(statusFilter === s)}`}
                      >
                        {STATUS_LABELS[s]}
                        {s === 'open' && openCount > 0 && (
                          <span className="ml-1 text-[10px] opacity-70">({openCount})</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Count */}
                  <p className="text-xs text-claude-muted">
                    共 {filtered.length} / {programs.length} 条项目
                    {filtered.length !== programs.length && '（已筛选）'}
                  </p>
                </div>

                {/* Results */}
                {filtered.length === 0 ? (
                  <div className="text-center py-16 text-claude-muted">
                    <Search className="w-12 h-12 mx-auto mb-3 text-claude-muted-soft" />
                    <p>没有匹配的保研项目</p>
                    <button
                      type="button"
                      onClick={() => {
                        setKeyword('');
                        setUniversityFilter('');
                        setCategoryFilter('全部');
                        setStatusFilter('全部');
                      }}
                      className="mt-2 text-sm text-claude-primary hover:underline"
                    >
                      清除筛选
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {filtered.map((p) => (
                      <ProgramCard key={p.id} program={p} onOpen={setSelected} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Pathways;
