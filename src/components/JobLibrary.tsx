import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ExternalLink,
  GraduationCap,
  MapPin,
  Search,
} from 'lucide-react';
import type { TrainingJob } from '../types/training';
import { fetchTrainingJobs } from '../services/trainingService';

const SITE_NAMES: Record<string, string> = {
  meituan: '美团',
  bytedance: '字节跳动',
  tencent: '腾讯',
  baidu: '百度',
  jd: '京东',
  xiaomi: '小米',
  kuaishou: '快手',
  didi: '滴滴',
  xiaohongshu: '小红书',
  bilibili: '哔哩哔哩',
  netease: '网易',
  huawei: '华为',
  mihoyo: '米哈游',
  zhipu: '智谱',
  moonshot: '月之暗面',
  dewu: '得物',
  minimax: 'MiniMax',
  ctrip: '携程',
  dji: '大疆',
  ant: '蚂蚁集团',
  dingtalk: '钉钉',
  quark: '夸克',
  taotian: '淘天集团',
};

function siteDisplayName(site: string): string {
  return SITE_NAMES[site] ?? site;
}

function JobCard({ job, onOpen }: { job: TrainingJob; onOpen: (job: TrainingJob) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(job)}
      className="group w-full text-left rounded-[16px] overflow-hidden bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.04)' }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-medium text-claude-ink leading-snug group-hover:text-claude-primary transition-colors">
            {job.title}
          </h3>
          <span
            className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${
              job.natureName === '实习'
                ? 'bg-macaron-mint/40 border-claude-hairline text-claude-body'
                : job.natureName === '校招'
                  ? 'bg-macaron-peach/40 border-claude-hairline text-claude-body'
                  : 'bg-claude-surface-card border-claude-hairline text-claude-muted'
            }`}
          >
            {job.natureName || '社招'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-claude-muted mb-3">
          <span className="inline-flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            {siteDisplayName(job.site)}
          </span>
          {job.locationNames && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.locationNames}
            </span>
          )}
          {job.categoryName && <span className="inline-flex items-center gap-1">{job.categoryName}</span>}
        </div>

        {job.suitableMajors.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.suitableMajors.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-claude-surface-cream-strong text-claude-body"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                {m.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function JobDetail({ job, onBack }: { job: TrainingJob; onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-claude-md bg-claude-canvas border border-claude-hairline text-claude-ink hover:text-claude-primary transition-all mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回岗位列表
      </button>

      <div className="bg-macaron-mint/50 rounded-[24px] overflow-hidden"
        style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.03), inset 0 2px 8px rgba(255,255,255,0.7), 0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-claude-ink mb-2">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-claude-muted">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {siteDisplayName(job.site)}
                </span>
                {job.locationNames && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.locationNames}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {job.natureName || '社招'}
                </span>
                {job.categoryName && <span>{job.categoryName}</span>}
              </div>
              {job.departmentName && (
                <p className="text-sm text-claude-muted mt-1">{job.departmentName}</p>
              )}
            </div>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-claude-md bg-claude-primary text-white font-medium hover:bg-opacity-90 shrink-0"
            >
              <ExternalLink className="w-5 h-5" />
              查看原链接
            </a>
          </div>

          {job.suitableMajors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {job.suitableMajors.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-claude-surface-card border border-claude-hairline text-claude-body"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  {m.name}
                </span>
              ))}
            </div>
          )}

          {job.description && (
            <section className="mb-6">
              <h3 className="text-base font-semibold text-claude-ink mb-2">岗位职责</h3>
              <p className="text-claude-body text-sm leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </section>
          )}

          {job.requirement && (
            <section>
              <h3 className="text-base font-semibold text-claude-ink mb-2">任职要求</h3>
              <p className="text-claude-body text-sm leading-relaxed whitespace-pre-line">
                {job.requirement}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobLibrary() {
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TrainingJob | null>(null);
  const [keyword, setKeyword] = useState('');
  const [natureFilter, setNatureFilter] = useState<string>('全部');
  const [siteFilter, setSiteFilter] = useState<string>('全部');
  const [majorFilter, setMajorFilter] = useState<string>('全部');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchTrainingJobs();
        if (!cancelled) setJobs(rows);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const majors = useMemo(() => {
    const map = new Map<string, string>();
    for (const job of jobs) {
      for (const m of job.suitableMajors) {
        if (!map.has(m.id)) map.set(m.id, m.name);
      }
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [jobs]);

  const sites = useMemo(() => [...new Set(jobs.map((j) => j.site))].sort(), [jobs]);

  const natures = useMemo(() => {
    const set = new Set(jobs.map((j) => j.natureName).filter(Boolean));
    return [...set];
  }, [jobs]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return jobs.filter((job) => {
      if (natureFilter !== '全部' && job.natureName !== natureFilter) return false;
      if (siteFilter !== '全部' && job.site !== siteFilter) return false;
      if (majorFilter !== '全部' && !job.suitableMajors.some((m) => m.id === majorFilter)) {
        return false;
      }
      if (kw) {
        const haystack = `${job.title} ${job.description} ${job.requirement}`.toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [jobs, keyword, natureFilter, siteFilter, majorFilter]);

  if (selected) {
    return <JobDetail job={selected} onBack={() => setSelected(null)} />;
  }

  const activeFilters: { label: string; onClear: () => void }[] = [];
  if (natureFilter !== '全部') {
    activeFilters.push({ label: `实习/校招：${natureFilter}`, onClear: () => setNatureFilter('全部') });
  }
  if (siteFilter !== '全部') {
    activeFilters.push({ label: `站点：${siteDisplayName(siteFilter)}`, onClear: () => setSiteFilter('全部') });
  }
  if (majorFilter !== '全部') {
    const name = majors.find((m) => m.id === majorFilter)?.name ?? majorFilter;
    activeFilters.push({ label: `适合专业：${name}`, onClear: () => setMajorFilter('全部') });
  }
  if (keyword.trim()) {
    activeFilters.push({ label: `关键词：${keyword.trim()}`, onClear: () => setKeyword('') });
  }
  const clearAll = () => {
    setNatureFilter('全部');
    setSiteFilter('全部');
    setMajorFilter('全部');
    setKeyword('');
  };

  const filterClass = (active: boolean) =>
    `px-3 py-1.5 rounded-claude-md text-xs font-medium border transition-all ${
      active
        ? 'bg-claude-primary text-white border-claude-primary shadow-sm'
        : 'bg-white text-claude-body border-claude-hairline hover:border-claude-muted hover:bg-claude-surface-soft'
    }`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-muted" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索岗位 / JD 关键词…"
            className="w-full h-10 pl-9 pr-3 rounded-claude-md border border-claude-hairline bg-white text-sm text-claude-ink placeholder:text-claude-muted-soft focus:outline-none focus:ring-1 focus:ring-claude-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-claude-muted self-center mr-1">实习/校招</span>
            {['全部', ...natures].map((n) => (
              <button key={n} type="button" onClick={() => setNatureFilter(n)} className={filterClass(natureFilter === n)}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-claude-muted self-center mr-1">站点</span>
            {['全部', ...sites].map((s) => (
              <button key={s} type="button" onClick={() => setSiteFilter(s)} className={filterClass(siteFilter === s)}>
                {siteDisplayName(s)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-claude-muted self-center mr-1">适合专业</span>
            {['全部', ...majors.map((m) => m.id)].map((id) => {
              const name = id === '全部' ? '全部' : majors.find((m) => m.id === id)?.name ?? id;
              return (
                <button key={id} type="button" onClick={() => setMajorFilter(id)} className={filterClass(majorFilter === id)}>
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-claude-muted-soft">正在加载岗位库…</p>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-claude-muted">
          <p className="mb-2">没有匹配的岗位</p>
          <p className="text-sm text-claude-muted-soft">试试放宽筛选条件，或先运行 `npm run job:import` 导入数据</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <p className="text-sm text-claude-muted">
              共 <span className="font-semibold text-claude-ink">{filtered.length}</span> / {jobs.length} 条岗位
              {activeFilters.length > 0 && <span className="text-claude-primary">（已筛选）</span>}
            </p>
            {activeFilters.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={f.onClear}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-claude-primary/10 text-claude-primary border border-claude-primary/30 hover:bg-claude-primary/20"
              >
                {f.label}
                <span className="text-sm leading-none">×</span>
              </button>
            ))}
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs px-2.5 py-1 rounded-full text-claude-muted hover:text-claude-ink hover:bg-claude-surface-soft transition-colors"
              >
                清除筛选
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} onOpen={setSelected} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
