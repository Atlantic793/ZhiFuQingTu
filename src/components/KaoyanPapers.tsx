import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileQuestion, FileText, Images } from 'lucide-react';
import {
  fetchPapers,
  PAPER_SUBJECTS,
  type KaoyanPaper,
  type KaoyanSubject,
} from '../services/paperService';
import { SkeletonPathways } from './Skeleton';

function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function filterClass(active: boolean) {
  return active
    ? 'bg-claude-primary text-white border-claude-primary shadow-sm'
    : 'bg-white text-claude-body border-claude-hairline hover:border-claude-muted hover:bg-claude-surface-soft';
}

const KaoyanPapers = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<KaoyanPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [subjectFilter, setSubjectFilter] = useState<KaoyanSubject | 'all'>('all');
  // 专业课的二级分类（数据里出现过的类别动态生成，无固定枚举）
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');

  const handleSubjectFilter = (s: KaoyanSubject | 'all') => {
    setSubjectFilter(s);
    setCategoryFilter('all');
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchPapers();
        if (!cancelled) setPapers(rows);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const years = useMemo(() => {
    const set = new Set(papers.map((p) => p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [papers]);

  const filteredPapers = useMemo(
    () =>
      papers.filter(
        (p) =>
          (yearFilter === 'all' || p.year === yearFilter) &&
          (subjectFilter === 'all' || p.subject === subjectFilter) &&
          (categoryFilter === 'all' || p.category === categoryFilter)
      ),
    [papers, yearFilter, subjectFilter, categoryFilter],
  );

  // 专业课出现过的二级分类（去重），未标注类别的不展示筛选
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of papers) {
      if (p.subject === '专业课' && p.category) set.add(p.category);
    }
    return Array.from(set).sort();
  }, [papers]);

  if (loading) return <SkeletonPathways />;

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-claude-md bg-red-100 text-red-600 text-sm">{error}</div>
      )}

      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setYearFilter('all')}
            className={'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ' + filterClass(yearFilter === 'all')}
          >
            全部年份
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYearFilter(y)}
              className={'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ' + filterClass(yearFilter === y)}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSubjectFilter('all')}
            className={'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ' + filterClass(subjectFilter === 'all')}
          >
            全部科目
          </button>
          {PAPER_SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSubjectFilter(s)}
              className={'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ' + filterClass(subjectFilter === s)}
            >
              {s}
            </button>
          ))}
        </div>
        {subjectFilter === '专业课' && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ' + filterClass(categoryFilter === 'all')}
            >
              全部类别
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoryFilter(c)}
                className={'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ' + filterClass(categoryFilter === c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-claude-muted">
          共 {filteredPapers.length} / {papers.length} 份真题
          {filteredPapers.length !== papers.length && '（已筛选）'}
        </p>
      </div>

      {filteredPapers.length === 0 ? (
        <div className="text-center py-16 text-claude-muted">
          <FileQuestion className="w-10 h-10 mx-auto mb-3 text-claude-muted-soft" />
          <p>真题整理中，敬请期待</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {filteredPapers.map((paper) => (
            <button
              key={paper.id}
              type="button"
              onClick={() => navigate(`/pathways/papers/${paper.id}`)}
              className="bg-white rounded-[16px] p-5 flex flex-col gap-3 text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-[10px] bg-macaron-lavender/60 flex items-center justify-center flex-shrink-0">
                  {paper.filePaths.length > 0 ? (
                    <Images className="w-5 h-5 text-claude-body" />
                  ) : (
                    <FileText className="w-5 h-5 text-claude-body" />
                  )}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-macaron-mint/50 text-claude-body font-medium whitespace-nowrap">
                  {paper.year} · {paper.subject}{paper.category ? ` · ${paper.category}` : ''}
                </span>
              </div>
              <h3 className="font-medium text-claude-ink leading-snug">{paper.title}</h3>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-claude-muted">
                  {paper.filePaths.length > 0
                    ? `${paper.filePaths.length} 页${paper.fileSize > 0 ? ` · ${formatFileSize(paper.fileSize)}` : ''}`
                    : '文本内容'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-claude-sm bg-claude-accent-teal text-white text-xs font-medium hover:bg-opacity-90 transition-opacity">
                  <BookOpen className="w-3.5 h-3.5" />
                  阅读
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default KaoyanPapers;
