import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Search,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import type {
  InterviewCategory,
  InterviewExperience,
  InterviewQuestion,
} from '../types/interview';
import {
  INTERVIEW_CATEGORY_COLORS,
  INTERVIEW_CATEGORY_LABELS,
  INTERVIEW_DIFFICULTY_LABELS,
} from '../types/interview';
import { fetchInterviewExperiences, fetchInterviewQuestions } from '../services/interviewService';
import { streamInterviewAnswer } from '../services/interviewAnswer';

type InterviewTab = 'experiences' | 'questions';

function isMianjingTitle(text: string) {
  return /面经/.test(text);
}

function stripMianjingIndex(title: string) {
  return title.replace(/^\d+\.\s*/, '').trim();
}

const pillClass = (active: boolean) =>
  `px-3 py-1.5 rounded-claude-md text-xs font-medium border transition-all ${
    active
      ? 'bg-claude-primary text-white border-claude-primary shadow-sm'
      : 'bg-white text-claude-body border-claude-hairline hover:border-claude-muted hover:bg-claude-surface-soft'
  }`;

function ExperienceCard({ item, onOpen }: { item: InterviewExperience; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full text-left rounded-[16px] overflow-hidden bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.04)' }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-medium text-claude-ink leading-snug group-hover:text-claude-primary transition-colors">
            {item.title}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-claude-muted mb-3">
          <span className="inline-flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            {item.company || '通用'}
          </span>
          {item.careerName && (
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="w-4 h-4" />
              {item.careerName}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            {item.likeCount}
          </span>
        </div>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-claude-surface-cream-strong text-claude-body"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function ExperienceDetail({
  item,
  relatedQuestions,
  onBack,
}: {
  item: InterviewExperience;
  relatedQuestions: InterviewQuestion[];
  onBack: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-claude-md bg-claude-canvas border border-claude-hairline text-claude-ink hover:text-claude-primary transition-all mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回经验列表
      </button>

      <div className="bg-macaron-mint/50 rounded-[24px] overflow-hidden"
        style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.03), inset 0 2px 8px rgba(255,255,255,0.7), 0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-claude-ink mb-2">{item.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-claude-muted">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {item.company || '通用'}
                </span>
                {item.careerName && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {item.careerName}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {item.likeCount}
                </span>
              </div>
            </div>
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-claude-md bg-claude-primary text-white font-medium hover:bg-opacity-90 shrink-0"
              >
                <ExternalLink className="w-5 h-5" />
                查看来源
              </a>
            )}
          </div>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-claude-surface-card border border-claude-hairline text-claude-body"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {item.content ? (
            <p className="text-claude-body text-sm leading-relaxed whitespace-pre-line">
              {item.content}
            </p>
          ) : (
            <p className="text-sm text-claude-muted">这篇是面经索引。具体题目在下面，点开可生成参考答案。</p>
          )}

          {item.author && (
            <p className="text-xs text-claude-muted mt-6">
              整理：{item.author}
              {item.source && item.source !== 'curated' && ` · 来源：${item.source}`}
            </p>
          )}
        </div>
      </div>

      {relatedQuestions.length > 0 && (
        <div className="mt-8 space-y-3">
          <p className="text-sm font-medium text-claude-ink">{relatedQuestions.length} 道相关题目</p>
          {relatedQuestions.map((q) => (
            <ExperienceQuestionRow key={q.id} item={q} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExperienceQuestionRow({ item }: { item: InterviewQuestion }) {
  const [open, setOpen] = useState(false);
  return (
    <QuestionCard item={item} expanded={open} onToggle={() => setOpen((v) => !v)} />
  );
}

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

export default function InterviewLibrary() {
  const [tab, setTab] = useState<InterviewTab>('experiences');
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [careerFilter, setCareerFilter] = useState('全部');
  const [companyFilter, setCompanyFilter] = useState('全部');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [difficultyFilter, setDifficultyFilter] = useState('全部');
  const [selectedExperience, setSelectedExperience] = useState<InterviewExperience | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rows, questionsRows] = await Promise.all([
          fetchInterviewExperiences(),
          fetchInterviewQuestions(),
        ]);
        if (cancelled) return;
        setExperiences(rows);
        setQuestions(questionsRows);
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
    for (const item of [...experiences, ...questions]) {
      if (item.careerName) set.add(item.careerName);
    }
    return [...set].sort();
  }, [experiences, questions]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const item of [...experiences, ...questions]) {
      if (item.company) set.add(item.company);
    }
    return [...set].sort();
  }, [experiences, questions]);

  const filteredExperiences = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return experiences.filter((item) => {
      if (careerFilter !== '全部' && item.careerName !== careerFilter) return false;
      if (companyFilter !== '全部' && item.company !== companyFilter) return false;
      if (kw) {
        const haystack = `${item.title} ${item.content} ${item.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [experiences, keyword, careerFilter, companyFilter]);

  const filteredQuestions = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return questions.filter((item) => {
      if (isMianjingTitle(item.question)) return false;
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

  const mianjingAsExperiences = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return questions
      .filter((item) => isMianjingTitle(item.question))
      .filter((item) => {
        if (careerFilter !== '全部' && item.careerName !== careerFilter) return false;
        if (companyFilter !== '全部' && item.company !== companyFilter) return false;
        if (kw && !`${item.question} ${item.company}`.toLowerCase().includes(kw)) return false;
        return true;
      })
      .map((item): InterviewExperience => ({
        id: item.id,
        careerName: item.careerName,
        company: item.company,
        title: stripMianjingIndex(item.question),
        tags: item.tags,
        content: '',
        source: item.source,
        sourceUrl: '',
        author: '',
        likeCount: 0,
        collectedAt: item.createdAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
  }, [questions, keyword, careerFilter, companyFilter]);

  const experienceList = useMemo(
    () => [...filteredExperiences, ...mianjingAsExperiences],
    [filteredExperiences, mianjingAsExperiences],
  );

  if (selectedExperience) {
    const related = questions.filter(
      (q) =>
        !isMianjingTitle(q.question) &&
        selectedExperience.company &&
        q.company === selectedExperience.company,
    );
    return (
      <ExperienceDetail
        item={selectedExperience}
        relatedQuestions={related}
        onBack={() => setSelectedExperience(null)}
      />
    );
  }

  const activeFilters: { label: string; onClear: () => void }[] = [];
  if (careerFilter !== '全部') activeFilters.push({ label: `岗位：${careerFilter}`, onClear: () => setCareerFilter('全部') });
  if (companyFilter !== '全部') activeFilters.push({ label: `公司：${companyFilter}`, onClear: () => setCompanyFilter('全部') });
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
      {/* 子 tab：面试经验 / 面试题库 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => { setTab('experiences'); setKeyword(''); setCareerFilter('全部'); setCompanyFilter('全部'); setCategoryFilter('全部'); setDifficultyFilter('全部'); }}
          className={pillClass(tab === 'experiences')}
        >
          面试经验
        </button>
        <button
          type="button"
          onClick={() => { setTab('questions'); setKeyword(''); setCareerFilter('全部'); setCompanyFilter('全部'); setCategoryFilter('全部'); setDifficultyFilter('全部'); }}
          className={pillClass(tab === 'questions')}
        >
          面试题库
        </button>
      </div>

      {loading ? (
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
                placeholder={tab === 'experiences' ? '搜索经验 / 关键词…' : '搜索题目 / 关键词…'}
                className="w-full h-10 pl-9 pr-3 rounded-claude-md border border-claude-hairline bg-white text-sm text-claude-ink placeholder:text-claude-muted-soft focus:outline-none focus:ring-1 focus:ring-claude-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
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
              {tab === 'questions' && (
                <>
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
                </>
              )}
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

          {tab === 'questions' && (
            <p className="text-xs text-claude-muted mb-4">
              按公司收成面经：先点公司标题，再点里面的题目。参考答案由本站 AI 生成。
            </p>
          )}

          {tab === 'experiences' ? (
            experienceList.length === 0 ? (
              <div className="py-16 text-center text-claude-muted">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-claude-muted-soft" />
                <p className="mb-2">暂无匹配的面试经验</p>
                <p className="text-sm text-claude-muted-soft">面试经验正在整理中，敬请期待。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {experienceList.map((item) => (
                  <ExperienceCard key={item.id} item={item} onOpen={() => setSelectedExperience(item)} />
                ))}
              </div>
            )
          ) : questionGroups.length === 0 ? (
            <div className="py-16 text-center text-claude-muted">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-claude-muted-soft" />
              <p className="mb-2">暂无匹配的面试题</p>
              <p className="text-sm text-claude-muted-soft">面试题库正在整理中，敬请期待。</p>
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
