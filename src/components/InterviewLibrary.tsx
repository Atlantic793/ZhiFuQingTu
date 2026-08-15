import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Search,
  Sparkles,
} from 'lucide-react';
import type {
  InterviewCategory,
  InterviewQuestion,
} from '../types/interview';
import {
  INTERVIEW_CATEGORY_COLORS,
  INTERVIEW_CATEGORY_LABELS,
  INTERVIEW_DIFFICULTY_LABELS,
} from '../types/interview';
import { fetchInterviewQuestions, fetchUniversalInterviewQuestions } from '../services/interviewService';
import { streamInterviewAnswer } from '../services/interviewAnswer';
import { filterRecruitPortals, type RecruitPortal } from '../data/recruitPortals';
import { careers as catalogCareers } from '../data/mockData';

type InterviewTab = 'experiences' | 'questions' | 'portals';

function parseInterviewTab(raw: string | null): InterviewTab {
  if (raw === 'questions' || raw === 'portals') return raw;
  return 'experiences';
}

function isMianjingTitle(text: string) {
  return /面经/.test(text);
}

const pillClass = (active: boolean) =>
  `px-3 py-1.5 rounded-claude-md text-xs font-medium border transition-all ${
    active
      ? 'bg-claude-primary text-white border-claude-primary shadow-sm'
      : 'bg-white text-claude-body border-claude-hairline hover:border-claude-muted hover:bg-claude-surface-soft'
  }`;

function QuestionCard({
  item,
  expanded,
  onToggle,
}: {
  item: InterviewQuestion;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [answer, setAnswer] = useState('');
  const [answerError, setAnswerError] = useState('');
  const categoryColor = INTERVIEW_CATEGORY_COLORS[item.category] ?? '#e5e0d5';

  const handleGenerate = async () => {
    setGenerating(true);
    setAnswerError('');
    setAnswer('');
    try {
      await streamInterviewAnswer(
        {
          question: item.question,
          careerName: item.careerName || undefined,
          context: [item.company, INTERVIEW_CATEGORY_LABELS[item.category], item.tags.join('、')]
            .filter(Boolean)
            .join(' · '),
        },
        {
          onDelta: (text) => setAnswer((prev) => prev + text),
        }
      );
    } catch (e) {
      setAnswerError(e instanceof Error ? e.message : '生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rounded-[16px] overflow-hidden bg-white transition-all"
      style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.04)' }}>
      <button type="button" onClick={onToggle} className="w-full text-left p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-claude-ink leading-snug flex-1">
            {item.question}
          </h3>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-claude-muted-soft shrink-0 mt-0.5" />
          ) : (
            <ChevronDown className="w-5 h-5 text-claude-muted-soft shrink-0 mt-0.5" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-claude-pill text-xs font-medium"
            style={{ backgroundColor: `${categoryColor}55`, color: '#4a4a4a' }}
          >
            {INTERVIEW_CATEGORY_LABELS[item.category] ?? item.category}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-claude-surface-card border border-claude-hairline text-claude-muted">
            {INTERVIEW_DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty}
          </span>
          {item.company && (
            <span className="inline-flex items-center gap-1 text-xs text-claude-muted">
              <Building2 className="w-3.5 h-3.5" />
              {item.company}
            </span>
          )}
          {item.careerName && (
            <span className="inline-flex items-center gap-1 text-xs text-claude-muted">
              <GraduationCap className="w-3.5 h-3.5" />
              {item.careerName}
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1">
          {item.answerHint && (
            <div className="rounded-claude-lg bg-claude-surface-soft p-4">
              <p className="text-xs font-medium text-claude-muted mb-1">参考答案</p>
              <p className="text-sm text-claude-body leading-relaxed whitespace-pre-line">{item.answerHint}</p>
            </div>
          )}

          {!item.answerHint && !generating && !answer && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-claude-muted">
                <Lightbulb className="w-3.5 h-3.5 inline mr-1" />
                暂无预置答案，可让 AI 生成参考答案供复习参考。
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-claude-md bg-claude-primary text-white text-sm font-medium hover:bg-opacity-90"
              >
                <Sparkles className="w-4 h-4" />
                AI 生成参考答案
              </button>
            </div>
          )}

          {generating && (
            <div className="rounded-claude-lg bg-claude-surface-soft p-4">
              <p className="text-xs text-claude-muted mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-claude-primary animate-pulse" />
                正在生成参考答案…
              </p>
              {answer && <p className="text-sm text-claude-body leading-relaxed whitespace-pre-line">{answer}</p>}
            </div>
          )}

          {!generating && answer && (
            <div className="rounded-claude-lg bg-claude-surface-soft p-4">
              <p className="text-xs font-medium text-claude-muted mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-claude-primary" />
                AI 参考答案（仅供参考，请结合自身经历调整）
              </p>
              <p className="text-sm text-claude-body leading-relaxed whitespace-pre-line">{answer}</p>
            </div>
          )}

          {answerError && <p className="text-sm text-red-600 mt-2">{answerError}</p>}
        </div>
      )}
    </div>
  );
}

function QuestionGroup({
  title,
  items,
  expanded,
  onToggle,
  expandedQuestionId,
  onToggleQuestion,
}: {
  title: string;
  items: InterviewQuestion[];
  expanded: boolean;
  onToggle: () => void;
  expandedQuestionId: string | null;
  onToggleQuestion: (id: string) => void;
}) {
  return (
    <div
      className="rounded-[16px] overflow-hidden bg-white"
      style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.04)' }}
    >
      <button type="button" onClick={onToggle} className="w-full text-left p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium text-claude-ink leading-snug">{title}</h3>
            <p className="text-xs text-claude-muted mt-1">{items.length} 道题</p>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-claude-muted-soft shrink-0 mt-0.5" />
          ) : (
            <ChevronDown className="w-5 h-5 text-claude-muted-soft shrink-0 mt-0.5" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {items.map((item) => (
            <QuestionCard
              key={item.id}
              item={item}
              expanded={expandedQuestionId === item.id}
              onToggle={() => onToggleQuestion(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PortalLink({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        primary
          ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-claude-md bg-claude-primary text-white text-xs font-medium hover:opacity-90'
          : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-claude-md bg-white border border-claude-hairline text-claude-body text-xs font-medium hover:bg-claude-surface-soft'
      }
    >
      {label}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

function RecruitPortals() {
  const [q, setQ] = useState('');
  const [career, setCareer] = useState('全部');
  const filtered = useMemo(
    () => filterRecruitPortals(q, career === '全部' ? '' : career),
    [q, career],
  );
  const boards = filtered.filter((item) => item.kind === 'board');
  const companies = filtered.filter((item) => item.kind === 'company');

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-claude-ink">招聘入口</h2>
        <p className="text-sm text-claude-muted mt-1">
          公开实习/校招信息站，加上站内岗位常见企业的招聘页。网址会变，以打开后的页面为准。
        </p>
      </div>

      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-muted-soft" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜公司 / 信息站…"
          className="w-full pl-10 pr-4 py-2.5 rounded-claude-lg text-sm bg-white border border-claude-hairline text-claude-ink placeholder:text-claude-muted-soft focus:outline-none focus:border-claude-primary transition-colors"
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-xs text-claude-muted self-center mr-1">岗位</span>
        {['全部', ...catalogCareers.map((c) => c.name)].map((name) => (
          <button key={name} type="button" onClick={() => setCareer(name)} className={pillClass(career === name)}>
            {name}
          </button>
        ))}
      </div>
      <p className="text-xs text-claude-muted mb-4">
        {boards.length} 个信息站 · {companies.length} 家企业
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-claude-muted">
          <Search className="w-10 h-10 mx-auto mb-3 text-claude-muted-soft" />
          <p>没有匹配的入口</p>
        </div>
      ) : (
        <div className="space-y-8 pb-20">
          {boards.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-claude-muted mb-3">公开信息站</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {boards.map((item) => (
                  <RecruitPortalCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
          {companies.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-claude-muted mb-3">企业招聘页</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {companies.map((item) => (
                  <RecruitPortalCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function RecruitPortalCard({ item }: { item: RecruitPortal }) {
  return (
    <div
      className="rounded-[16px] bg-white p-4"
      style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.04)' }}
    >
      <div className="mb-3">
        <h3 className="font-medium text-claude-ink">{item.name}</h3>
        <p className="text-xs text-claude-muted mt-0.5">{item.blurb}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <PortalLink href={item.jobsUrl} label={item.jobsLabel} primary />
        {item.internUrl && (
          <PortalLink href={item.internUrl} label={item.internLabel ?? '校园/实习'} />
        )}
      </div>
    </div>
  );
}

export default function InterviewLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseInterviewTab(searchParams.get('sub'));
  const setTab = (next: InterviewTab) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('tab', 'interviews');
      if (next === 'experiences') p.delete('sub');
      else p.set('sub', next);
      return p;
    }, { replace: true });
  };
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [careerFilter, setCareerFilter] = useState('全部');
  const [companyFilter, setCompanyFilter] = useState('全部');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [difficultyFilter, setDifficultyFilter] = useState('全部');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);
  const universalQuestions = useMemo(() => fetchUniversalInterviewQuestions(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const questionsRows = await fetchInterviewQuestions();
        if (!cancelled) setQuestions(questionsRows);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const careers = useMemo(() => {
    const set = new Set<string>();
    for (const item of questions) {
      if (item.careerName && item.careerName !== '通用') set.add(item.careerName);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'zh'));
  }, [questions]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const item of questions) {
      if (item.company && !isMianjingTitle(item.question)) set.add(item.company);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'zh'));
  }, [questions]);

  const filteredUniversal = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return universalQuestions.filter((item) => {
      if (categoryFilter !== '全部' && item.category !== categoryFilter) return false;
      if (difficultyFilter !== '全部' && item.difficulty !== difficultyFilter) return false;
      if (kw) {
        const haystack = `${item.question} ${item.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [universalQuestions, keyword, categoryFilter, difficultyFilter]);

  const filteredQuestions = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return questions.filter((item) => {
      if (isMianjingTitle(item.question)) return false;
      if (item.careerName === '通用') return false;
      if (careerFilter !== '全部' && item.careerName !== careerFilter) return false;
      if (companyFilter !== '全部' && item.company !== companyFilter) return false;
      if (categoryFilter !== '全部' && item.category !== categoryFilter) return false;
      if (difficultyFilter !== '全部' && item.difficulty !== difficultyFilter) return false;
      if (kw) {
        const haystack = `${item.question} ${item.answerHint} ${item.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [questions, keyword, careerFilter, companyFilter, categoryFilter, difficultyFilter]);

  const questionGroups = useMemo(() => {
    const map = new Map<string, InterviewQuestion[]>();
    for (const item of filteredQuestions) {
      const key = item.company || '未分类';
      const list = map.get(key);
      if (list) list.push(item);
      else map.set(key, [item]);
    }
    return [...map.entries()]
      .map(([company, items]) => ({ key: company, title: `${company}面经`, items }))
      .sort((a, b) => a.title.localeCompare(b.title, 'zh'));
  }, [filteredQuestions]);

  const activeFilters: { label: string; onClear: () => void }[] = [];
  if (tab === 'questions' && careerFilter !== '全部') {
    activeFilters.push({ label: `岗位：${careerFilter}`, onClear: () => setCareerFilter('全部') });
  }
  if (tab === 'questions' && companyFilter !== '全部') {
    activeFilters.push({ label: `公司：${companyFilter}`, onClear: () => setCompanyFilter('全部') });
  }
  if (categoryFilter !== '全部') activeFilters.push({ label: `分类：${categoryFilter}`, onClear: () => setCategoryFilter('全部') });
  if (difficultyFilter !== '全部') activeFilters.push({ label: `难度：${difficultyFilter}`, onClear: () => setDifficultyFilter('全部') });
  if (keyword.trim()) activeFilters.push({ label: `关键词：${keyword.trim()}`, onClear: () => setKeyword('') });
  const clearAll = () => {
    setCareerFilter('全部');
    setCompanyFilter('全部');
    setCategoryFilter('全部');
    setDifficultyFilter('全部');
    setKeyword('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => { setTab('experiences'); setKeyword(''); setCareerFilter('全部'); setCompanyFilter('全部'); setCategoryFilter('全部'); setDifficultyFilter('全部'); }}
          className={pillClass(tab === 'experiences')}
        >
          通用面试经验
        </button>
        <button
          type="button"
          onClick={() => { setTab('questions'); setKeyword(''); setCareerFilter('全部'); setCompanyFilter('全部'); setCategoryFilter('全部'); setDifficultyFilter('全部'); }}
          className={pillClass(tab === 'questions')}
        >
          面试题库
        </button>
        <button
          type="button"
          onClick={() => { setTab('portals'); setKeyword(''); setCareerFilter('全部'); setCompanyFilter('全部'); setCategoryFilter('全部'); setDifficultyFilter('全部'); }}
          className={pillClass(tab === 'portals')}
        >
          招聘入口
        </button>
      </div>

      {tab === 'portals' ? (
        <RecruitPortals />
      ) : loading && tab === 'questions' ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-[16px] bg-claude-surface-card animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-muted" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={tab === 'experiences' ? '搜索心态 / 规划 / 协作…' : '搜索题目 / 关键词…'}
                className="w-full h-10 pl-9 pr-3 rounded-claude-md border border-claude-hairline bg-white text-sm text-claude-ink placeholder:text-claude-muted-soft focus:outline-none focus:ring-1 focus:ring-claude-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              {tab === 'questions' && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-claude-muted self-center mr-1">岗位</span>
                    {['全部', ...careers].map((c) => (
                      <button key={c} type="button" onClick={() => setCareerFilter(c)} className={pillClass(careerFilter === c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-claude-muted self-center mr-1">公司</span>
                    {['全部', ...companies].map((c) => (
                      <button key={c} type="button" onClick={() => setCompanyFilter(c)} className={pillClass(companyFilter === c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-claude-muted self-center mr-1">分类</span>
                {['全部', ...Object.entries(INTERVIEW_CATEGORY_LABELS).map(([key]) => key)].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategoryFilter(c)}
                    className={pillClass(categoryFilter === c)}
                  >
                    {c === '全部' ? c : INTERVIEW_CATEGORY_LABELS[c as InterviewCategory]}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-claude-muted self-center mr-1">难度</span>
                {['全部', 'easy', 'medium', 'hard'].map((d) => (
                  <button key={d} type="button" onClick={() => setDifficultyFilter(d)} className={pillClass(difficultyFilter === d)}>
                    {d === '全部' ? d : INTERVIEW_DIFFICULTY_LABELS[d as keyof typeof INTERVIEW_DIFFICULTY_LABELS]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
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
              <button
                type="button"
                onClick={clearAll}
                className="text-xs px-2.5 py-1 rounded-full text-claude-muted hover:text-claude-ink hover:bg-claude-surface-soft transition-colors"
              >
                清除筛选
              </button>
            </div>
          )}

          {tab === 'experiences' && (
            <p className="text-xs text-claude-muted mb-4">
              各岗 HR / 行为面都会问的心态、规划、协作题。点开后可用 AI 生成参考答案。
            </p>
          )}
          {tab === 'questions' && (
            <p className="text-xs text-claude-muted mb-4">
              按公司收成题组。参考答案由本站 AI 生成。
            </p>
          )}

          {tab === 'experiences' ? (
            filteredUniversal.length === 0 ? (
              <div className="py-16 text-center text-claude-muted">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-claude-muted-soft" />
                <p>没有匹配的通用题</p>
              </div>
            ) : (
              <div className="space-y-3 pb-20">
                {filteredUniversal.map((item) => (
                  <QuestionCard
                    key={item.id}
                    item={item}
                    expanded={expandedQuestionId === item.id}
                    onToggle={() => setExpandedQuestionId((prev) => (prev === item.id ? null : item.id))}
                  />
                ))}
              </div>
            )
          ) : questionGroups.length === 0 ? (
            <div className="py-16 text-center text-claude-muted">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-claude-muted-soft" />
              <p className="mb-2">暂无匹配的面试题</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questionGroups.map((group) => (
                <QuestionGroup
                  key={group.key}
                  title={group.title}
                  items={group.items}
                  expanded={expandedGroupKey === group.key}
                  onToggle={() => setExpandedGroupKey((prev) => (prev === group.key ? null : group.key))}
                  expandedQuestionId={expandedQuestionId}
                  onToggleQuestion={(id) => setExpandedQuestionId((prev) => (prev === id ? null : id))}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
