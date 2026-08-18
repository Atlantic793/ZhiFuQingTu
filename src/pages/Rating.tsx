import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ListOrdered,
  MessageCircle,
  Plus,
  Quote,
  Search,
  Star,
  ThumbsUp,
  Trash2,
  Trophy,
} from 'lucide-react';
import {
  fetchCourseById,
  fetchCourses,
  fetchCoursesByTopic,
  fetchSubjects,
  fetchTopicById,
  fetchTopics,
} from '../services/catalogService';
import { recommendCoursesBatch } from '../services/recommendCourse';
import { createSubject, createTopic } from '../services/catalogAdmin';
import { parseSourceSummary } from '../utils/sourceSummary';
import {
  createCourseReviewReply,
  deleteCourseReview,
  deleteCourseReviewReply,
  fetchCourseReviews,
  fetchMyReview,
  isCourseFavorited,
  toggleCourseFavorite,
  toggleCourseReviewLike,
  toggleCourseReviewReplyLike,
  upsertCourseReview,
} from '../services/ratingService';
import type { CatalogTopic, Course, CourseReply, CourseReview, Subject } from '../types/catalog';
import { subjectIconMap } from '../utils/subjectIcons';
import { normalizeCoverUrl } from '../utils/media';
import CourseChat from '../components/CourseChat';
import DraggableCard from '../components/DraggableCard';
import {
  SkeletonTopicGrid,
  SkeletonCourseList,
  SkeletonCourseDetail,
} from '../components/Skeleton';
import { isAdminEmail, useAuthStore } from '../store/authStore';

function Stars({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${cls} ${n <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-claude-hairline'}`}
        />
      ))}
    </span>
  );
}

function SubjectChipBar({
  subjects,
  selectedId,
  onSelect,
}: {
  subjects: Subject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="mb-8">
      {/* 装饰面板 — 单行横向滑动，避免学科换行堆叠 */}
      <div
        className="relative rounded-claude-lg pl-4 pr-4 pt-3 pb-2"
        style={{
          background: 'linear-gradient(180deg, #e8e0d2 0%, #ddd5c4 100%)',
          boxShadow: 'inset 0 -3px 10px rgba(0,0,0,0.08), inset 0 2px 6px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex flex-nowrap items-end gap-1 overflow-x-auto overflow-y-hidden pb-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
          {/* "不限学科" 标签 */}
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`relative shrink-0 px-4 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              !selectedId
                ? 'bg-white text-claude-primary z-10'
                : 'bg-claude-surface-card/80 text-claude-muted hover:text-claude-ink hover:bg-claude-surface-cream-strong'
            }`}
            style={
              !selectedId
                ? {
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                    borderBottomLeftRadius: '0',
                    borderBottomRightRadius: '0',
                    boxShadow:
                      '0 -2px 8px rgba(0,0,0,0.06), 0 -1px 2px rgba(0,0,0,0.04), inset 0 1px 3px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.03), 0 2px 0 #fff',
                    transform: 'translateY(-2px)',
                  }
                : {
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                    borderBottomLeftRadius: '0',
                    borderBottomRightRadius: '0',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)',
                  }
            }
            onMouseEnter={(e) => {
              if (selectedId) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.filter = 'brightness(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedId) {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.filter = '';
              }
            }}
          >
            不限学科
          </button>

          {subjects.map((subject) => {
            const isSelected = selectedId === subject.id;
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => onSelect(subject.id)}
                className={`relative inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-white text-claude-primary z-10'
                    : 'bg-claude-surface-card/80 text-claude-muted hover:text-claude-ink hover:bg-claude-surface-cream-strong'
                }`}
                style={
                  isSelected
                    ? {
                        borderTopLeftRadius: '12px',
                        borderTopRightRadius: '12px',
                        borderBottomLeftRadius: '0',
                        borderBottomRightRadius: '0',
                        boxShadow:
                          '0 -2px 8px rgba(0,0,0,0.06), 0 -1px 2px rgba(0,0,0,0.04), inset 0 1px 3px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.03), 0 2px 0 #fff',
                        transform: 'translateY(-2px)',
                      }
                    : {
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        borderBottomLeftRadius: '0',
                        borderBottomRightRadius: '0',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)',
                      }
                }
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.filter = 'brightness(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.filter = '';
                  }
                }}
              >
                {subjectIconMap[subject.icon]}
                {subject.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** 首页 / 学科页：与 Agent 同一套学科芯片，下列出专题 */
function DomainList() {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canManageCatalog = isAdminEmail(user?.email);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<CatalogTopic[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(domainId ?? null);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<'none' | 'subject' | 'topic'>('none');
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formHint, setFormHint] = useState('');

  const reload = async () => {
    const [d, t] = await Promise.all([fetchSubjects(), fetchTopics()]);
    setSubjects(d);
    setTopics(t);
  };

  useEffect(() => {
    setSelectedId(domainId ?? null);
  }, [domainId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [d, t] = await Promise.all([fetchSubjects(), fetchTopics()]);
        if (!cancelled) {
          setSubjects(d);
          setTopics(t);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSubject = subjects.find((s) => s.id === selectedId) ?? null;

  const visibleTopics = useMemo(
    () => (selectedId ? topics.filter((t) => t.domainId === selectedId) : topics),
    [topics, selectedId]
  );

  const handleSelect = (id: string | null) => {
    setSelectedId(id);
    if (id) navigate(`/rating/domains/${id}`, { replace: true });
    else navigate('/rating', { replace: true });
  };

  const handleCreateSubject = async () => {
    setFormError('');
    setFormHint('');
    if (!subjectName.trim()) {
      setFormError('请填写学科名称');
      return;
    }
    setSaving(true);
    try {
      const subject = await createSubject({
        name: subjectName.trim(),
        description: subjectDesc.trim(),
        icon: 'Cpu',
      });
      await reload();
      setSubjectName('');
      setSubjectDesc('');
      setFormHint(`已创建学科「${subject.name}」`);
      setPanel('none');
      handleSelect(subject.id);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '创建失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTopic = async () => {
    setFormError('');
    setFormHint('');
    if (!selectedId) {
      setFormError('请先在上方选中一个学科，再新增类别');
      return;
    }
    if (!topicName.trim()) {
      setFormError('请填写类别名称');
      return;
    }
    setSaving(true);
    try {
      const topic = await createTopic({
        domainId: selectedId,
        name: topicName.trim(),
        description: topicDesc.trim(),
      });
      await reload();
      setTopicName('');
      setTopicDesc('');
      setFormHint(`已创建类别「${topic.name}」`);
      setPanel('none');
      navigate(`/rating/topics/${topic.id}`);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '创建失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 pb-20">
      {loading ? (
        <SkeletonTopicGrid />
      ) : (
        <>
          <SubjectChipBar subjects={subjects} selectedId={selectedId} onSelect={handleSelect} />

          {selectedSubject && (
            <p className="text-sm text-claude-muted-soft mb-4 -mt-4">{selectedSubject.description}</p>
          )}

          {canManageCatalog && (
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              type="button"
              onClick={() => {
                setPanel((p) => (p === 'subject' ? 'none' : 'subject'));
                setFormError('');
                setFormHint('');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-claude-md text-sm font-medium bg-claude-canvas border border-claude-hairline text-claude-ink hover:text-claude-primary"
            >
              <Plus className="w-4 h-4" />
              新增学科
            </button>
            <button
              type="button"
              onClick={() => {
                setPanel((p) => (p === 'topic' ? 'none' : 'topic'));
                setFormError('');
                setFormHint('');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-claude-md text-sm font-medium bg-claude-canvas border border-claude-hairline text-claude-ink hover:text-claude-primary"
            >
              <Plus className="w-4 h-4" />
              新增类别
            </button>
          </div>
          )}

          {panel === 'subject' && (
            <div className="mb-6 p-4 rounded-claude-lg border border-claude-hairline bg-claude-surface-card space-y-3">
              <p className="text-sm font-medium text-claude-ink">新增学科专区</p>
              <input
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="学科名称，例如：人工智能"
                className="w-full px-4 py-2.5 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-ink"
              />
              <input
                value={subjectDesc}
                onChange={(e) => setSubjectDesc(e.target.value)}
                placeholder="一句话介绍（可选）"
                className="w-full px-4 py-2.5 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-ink"
              />
              <button
                type="button"
                disabled={saving}
                onClick={handleCreateSubject}
                className="h-10 px-5 rounded-claude-md bg-claude-primary text-claude-on-primary text-sm font-medium disabled:opacity-60"
              >
                {saving ? '创建中…' : '创建学科'}
              </button>
            </div>
          )}

          {panel === 'topic' && (
            <div className="mb-6 p-4 rounded-claude-lg border border-claude-hairline bg-claude-surface-card space-y-3">
              <p className="text-sm font-medium text-claude-ink">
                在「{selectedSubject?.name || '请先选中学科'}」下新增类别
              </p>
              <input
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="类别名称，例如：深度学习"
                className="w-full px-4 py-2.5 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-ink"
              />
              <input
                value={topicDesc}
                onChange={(e) => setTopicDesc(e.target.value)}
                placeholder="类别简介（可选）"
                className="w-full px-4 py-2.5 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-ink"
              />
              <button
                type="button"
                disabled={saving || !selectedId}
                onClick={handleCreateTopic}
                className="h-10 px-5 rounded-claude-md bg-claude-primary text-claude-on-primary text-sm font-medium disabled:opacity-60"
              >
                {saving ? '创建中…' : '创建类别'}
              </button>
            </div>
          )}

          {(formError || formHint) && (
            <p className={`text-sm mb-4 ${formError ? 'text-red-500' : 'text-claude-primary'}`}>
              {formError || formHint}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {visibleTopics.map((topic) => (
              <DraggableCard key={topic.id} className="aspect-square">
                <Link
                  to={`/rating/topics/${topic.id}`}
                  className="relative block w-full h-full rounded-claude-lg overflow-hidden group"
                  style={{
                    boxShadow: '0 4px 24px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)';
                  }}
                >
                  <img
                    src={normalizeCoverUrl(topic.coverImage)}
                    alt={topic.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-contain group-hover:brightness-[0.85] transition-all duration-500 bg-claude-canvas"
                  />
                  <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white/90 backdrop-blur-md min-h-[5rem] flex items-center z-10">
                    <h2 className="font-semibold text-claude-ink line-clamp-2 text-xl">{topic.name}</h2>
                  </div>
                  <div className="absolute inset-0 bg-white/[0.92] backdrop-blur-[2px] flex flex-col translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-20 [transition:transform_0.5s_cubic-bezier(0.4,0,0.2,1),opacity_0.4s_ease]">
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 pt-4">
                      <h2 className="font-semibold text-claude-ink text-xl mb-2">{topic.name}</h2>
                      <p className="text-sm text-claude-muted leading-relaxed break-words">{topic.description}</p>
                    </div>
                    <div className="flex-shrink-0 px-5 pt-3 pb-4 bg-gradient-to-t from-white/[0.92] via-white/[0.92] to-transparent">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-claude-xl bg-claude-success text-white text-sm font-medium">
                        了解更多 <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </DraggableCard>
            ))}
          </div>
          {visibleTopics.length === 0 && (
            <p className="text-claude-muted-soft">
              {selectedId ? '该学科下暂无专题，可点「新增类别」创建。' : '暂无专题，请确认已执行 rating migration。'}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function CourseList() {
  const { topicId = '' } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<CatalogTopic | null>(null);
  const [domain, setDomain] = useState<Subject | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRankings, setShowRankings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRecommend, setShowRecommend] = useState(false);
  const [recommendUrl, setRecommendUrl] = useState('');
  const [recommending, setRecommending] = useState(false);
  const [recommendError, setRecommendError] = useState('');
  const [recommendHint, setRecommendHint] = useState('');

  const reloadCourses = async () => {
    const rows = await fetchCoursesByTopic(topicId);
    setCourses(rows);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, rows, domains] = await Promise.all([
          fetchTopicById(topicId),
          fetchCoursesByTopic(topicId),
          fetchSubjects(),
        ]);
        if (!cancelled) {
          setTopic(t);
          setCourses(rows);
          setDomain(t ? domains.find((d) => d.id === t.domainId) ?? null : null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  const handleRecommend = async () => {
    setRecommendError('');
    setRecommendHint('');
    const text = recommendUrl.trim();
    if (!text) {
      setRecommendError('请粘贴一个或多个 B 站链接 / BV 号（可用换行或空格分隔）');
      return;
    }
    setRecommending(true);
    try {
      const { items, bvids } = await recommendCoursesBatch({
        topicId,
        text,
        onProgress: (done, total, current) => {
          if (current) setRecommendHint(`正在处理 ${done + 1}/${total}：${current}`);
        },
      });
      await reloadCourses();
      const ok = items.filter((i) => i.ok && !i.error);
      const failed = items.filter((i) => i.error);
      const created = ok.filter((i) => !i.existed);
      const existed = ok.filter((i) => i.existed);
      setRecommendHint(
        `完成 ${bvids.length} 条：新增 ${created.length}，已存在 ${existed.length}` +
          (failed.length ? `，失败 ${failed.length}` : '')
      );
      if (failed.length) {
        setRecommendError(failed.map((f) => `${f.bvid}: ${f.error}`).join('；'));
      } else {
        setRecommendUrl('');
      }
      if (created.length === 1 && !failed.length) {
        setTimeout(() => {
          setShowRecommend(false);
          navigate(`/rating/courses/${created[0].courseId}`);
        }, 500);
      } else if (ok.length === 1 && existed.length === 1 && !failed.length) {
        setTimeout(() => {
          setShowRecommend(false);
          navigate(`/rating/courses/${existed[0].courseId}`);
        }, 500);
      }
    } catch (e) {
      setRecommendError(e instanceof Error ? e.message : '推荐失败');
    } finally {
      setRecommending(false);
    }
  };

  const visible = courses
    .filter(
      (c) =>
        !searchQuery.trim() ||
        c.title.includes(searchQuery.trim()) ||
        c.description.includes(searchQuery.trim())
    )
    .sort((a, b) => (showRankings ? b.platformRating - a.platformRating : 0));

  return (
    <div className="mt-6 pb-20">
      {loading ? (
        <SkeletonCourseList />
      ) : (
        <>
          {domain && (
            <button
              type="button"
              onClick={() => navigate(`/rating/domains/${domain.id}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-claude-md bg-claude-canvas border border-claude-hairline text-claude-ink hover:text-claude-primary transition-all mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              返回{domain.name}
            </button>
          )}
          <header className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-claude-ink font-display mb-2">
              {topic?.name || '课程列表'}
            </h1>
            <p className="text-claude-muted">{topic?.description}</p>
          </header>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-claude-muted-soft absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索本专题课程…"
                className="pl-10 pr-4 py-3 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-ink w-64"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRecommend((v) => !v);
                  setRecommendError('');
                  setRecommendHint('');
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-claude-md font-medium transition-all bg-claude-primary text-claude-on-primary hover:bg-opacity-90"
              >
                <Plus className="w-5 h-5" />
                推荐课程
              </button>
              <button
                type="button"
                onClick={() => setShowRankings((v) => !v)}
                className={`flex items-center gap-2 px-5 py-3 rounded-claude-md font-medium transition-all ${
                  showRankings
                    ? 'bg-claude-primary text-claude-on-primary'
                    : 'bg-claude-canvas text-claude-ink hover:bg-claude-surface-soft border border-claude-hairline'
                }`}
              >
                <Trophy className="w-5 h-5" />
                按平台评分排序
              </button>
            </div>
          </div>

          {showRecommend && (
            <div className="mb-6 p-4 rounded-claude-lg border border-claude-hairline bg-claude-surface-card">
              <p className="text-sm text-claude-muted mb-3">
                推荐到「{topic?.name || '本专题'}」。可一次粘贴多个 BV / 链接（换行、空格或逗号分隔），将逐个入库并尽量生成源站口碑。
              </p>
              <textarea
                value={recommendUrl}
                onChange={(e) => setRecommendUrl(e.target.value)}
                placeholder={'例如：\nBV1xxxxx\nhttps://www.bilibili.com/video/BV1yyyyy/\nBV1zzzzz'}
                rows={5}
                className="w-full px-4 py-3 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-ink resize-y mb-3"
                disabled={recommending}
              />
              <button
                type="button"
                disabled={recommending}
                onClick={handleRecommend}
                className="h-11 px-6 rounded-claude-md bg-claude-primary text-claude-on-primary font-medium disabled:opacity-60"
              >
                {recommending ? '提交中…' : '批量提交推荐'}
              </button>
              {recommendError && <p className="text-sm text-red-500 mt-2">{recommendError}</p>}
              {recommendHint && <p className="text-sm text-claude-primary mt-2">{recommendHint}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visible.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => navigate(`/rating/courses/${course.id}`)}
                className="rounded-[16px] text-left group bg-white transition-shadow cursor-pointer"
                style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 4px 24px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)' }}
              >
                <div className="aspect-[16/10] overflow-hidden rounded-t-claude-lg relative bg-claude-canvas">
                  <img
                    src={normalizeCoverUrl(course.coverImage)}
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300 bg-claude-canvas"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 text-white text-xs">
                    {course.sourceScore != null ? (
                      <>
                        <span className="opacity-90">源站</span>
                        <span className="font-semibold">{Number(course.sourceScore).toFixed(1)}</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{course.platformRating.toFixed(1)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="border-t border-claude-hairline-soft mx-3" />
                <h3 className="text-[15px] font-medium text-claude-ink line-clamp-2 leading-[1.5] px-3 pt-2">
                  {course.title}
                </h3>
                <p className="text-xs text-claude-muted-soft px-3 pb-3 pt-1">
                  贡献者：{course.contributorName || '开发团队'}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CourseDetail() {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [topic, setTopic] = useState<CatalogTopic | null>(null);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [score, setScore] = useState(0);
  const [content, setContent] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [likingReplyId, setLikingReplyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const c = await fetchCourseById(courseId);
    setCourse(c);
    if (!c) return;
    const [t, , revs] = await Promise.all([
      c.topicId ? fetchTopicById(c.topicId) : Promise.resolve(null),
      fetchSubjects(),
      fetchCourseReviews(courseId, user?.id),
    ]);
    setTopic(t);
    setReviews(revs);
    if (user) {
      const [mine, fav] = await Promise.all([
        fetchMyReview(courseId, user.id),
        isCourseFavorited(courseId, user.id),
      ]);
      if (mine) {
        setScore(mine.score);
        setContent(mine.content);
      }
      setFavorited(fav);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user?.id]);

  const handleSubmit = async () => {
    if (!user || !course) return;
    if (score < 1) {
      setError('请先选择 1–5 星评分');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await upsertCourseReview({
        courseId: course.id,
        userId: user.id,
        score,
        content,
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败（请确认已执行 rating migration）');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!user) return;
    setDeleting(true);
    setError('');
    try {
      await deleteCourseReview(reviewId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const handleFavorite = async () => {
    if (!user || !course) return;
    try {
      const next = await toggleCourseFavorite(course.id, user.id);
      setFavorited(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : '收藏失败');
    }
  };

  const handleLike = async (review: CourseReview) => {
    if (!user) {
      setError('请先登录后再点赞');
      return;
    }
    if (likingId) return;
    setLikingId(review.id);
    setError('');
    try {
      const nowLiked = await toggleCourseReviewLike(review.id, user.id);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? {
                ...r,
                likedByMe: nowLiked,
                likeCount: r.likeCount + (nowLiked ? 1 : -1),
              }
            : r
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : '点赞失败');
    } finally {
      setLikingId(null);
    }
  };

  const handleReplySubmit = async (review: CourseReview) => {
    const text = (replyTexts[review.id] ?? '').trim();
    if (!user || !text) return;
    setSendingReplyId(review.id);
    setError('');
    try {
      await createCourseReviewReply(review.id, user.id, text);
      setReplyTexts((prev) => ({ ...prev, [review.id]: '' }));
      setReplyingTo(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : '回复失败');
    } finally {
      setSendingReplyId(null);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!user) return;
    setDeletingReplyId(replyId);
    setError('');
    try {
      await deleteCourseReviewReply(replyId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除回复失败');
    } finally {
      setDeletingReplyId(null);
    }
  };

  const handleReplyLike = async (reviewId: string, reply: CourseReply) => {
    if (!user) {
      setError('请先登录后再点赞');
      return;
    }
    if (likingReplyId) return;
    setLikingReplyId(reply.id);
    setError('');
    try {
      const nowLiked = await toggleCourseReviewReplyLike(reply.id, user.id);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                replies: r.replies.map((rp) =>
                  rp.id === reply.id
                    ? {
                        ...rp,
                        likedByMe: nowLiked,
                        likeCount: rp.likeCount + (nowLiked ? 1 : -1),
                      }
                    : rp
                ),
              }
            : r
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : '点赞失败');
    } finally {
      setLikingReplyId(null);
    }
  };

  if (loading) {
    return <SkeletonCourseDetail />;
  }
  if (!course) {
    return (
      <div className="pt-4">
        <p className="text-claude-muted mb-4">未找到该课程</p>
        <Link to="/rating" className="text-claude-primary">
          返回目录
        </Link>
      </div>
    );
  }

  const hasRealLink = Boolean(course.bvid);
  const sourceParsed = parseSourceSummary(course.sourceSummary, course.sourceScore);

  return (
    <div className="mt-6 max-w-4xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(topic ? `/rating/topics/${topic.id}` : '/rating')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-claude-md bg-claude-canvas border border-claude-hairline text-claude-ink hover:text-claude-primary transition-all mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        返回{topic?.name || '专题'}
      </button>

      <div className="bg-claude-canvas rounded-claude-xl border border-claude-hairline overflow-hidden mb-8">
        <div className="relative">
          <img
            src={normalizeCoverUrl(course.coverImage)}
            alt={course.title}
            referrerPolicy="no-referrer"
            className="w-full aspect-video object-cover bg-claude-canvas"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={handleFavorite}
              className="px-4 py-2 rounded-full bg-white/95 text-claude-ink flex items-center gap-2 text-sm font-medium"
            >
              {favorited ? <BookmarkCheck className="w-4 h-4 text-claude-primary" /> : <Bookmark className="w-4 h-4" />}
              {favorited ? '已收藏' : '收藏'}
            </button>
            {hasRealLink ? (
              <a
                href={course.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-claude-primary text-claude-on-primary flex items-center gap-2 text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                观看视频
              </a>
            ) : (
              <span className="px-4 py-2 rounded-full bg-black/50 text-white text-sm">BV 占位 · 暂无真实链接</span>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* 源站口碑分置顶 — 产品特色 */}
          <div className="mb-5 rounded-claude-lg border border-claude-hairline bg-gradient-to-br from-[#f7f1e6] to-[#efe6d6] px-5 py-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-claude-muted uppercase mb-1">源站口碑分</p>
              {course.sourceScore != null ? (
                <p className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-bold text-claude-ink tabular-nums font-display leading-none">
                    {Number(course.sourceScore).toFixed(1)}
                  </span>
                  <span className="text-claude-muted text-sm">/ 10</span>
                </p>
              ) : (
                <p className="text-2xl font-semibold text-claude-muted-soft">暂无</p>
              )}
            </div>
            <p className="text-xs text-claude-muted max-w-xs leading-relaxed">
              基于 B 站评论/弹幕抽样的统一量表评分，与站内平台评分相互独立，是本站课程口碑的核心参考。
            </p>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-claude-ink font-display mb-3">{course.title}</h1>
          <p className="text-sm text-claude-muted-soft mb-3 flex flex-wrap gap-x-3 gap-y-1">
            <span>贡献者：{course.contributorName || '开发团队'}</span>
            {course.ownerName && <span>UP：{course.ownerName}</span>}
            {course.bvid && <span>BV：{course.bvid}</span>}
            {course.viewCount != null && (
              <span>播放 {course.viewCount.toLocaleString('zh-CN')}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-claude-muted-soft">平台评分</span>
              <Stars value={course.platformRating} />
              <strong className="text-claude-ink">{course.platformRating.toFixed(1)}</strong>
              <span className="text-claude-muted-soft">（{course.platformRatingCount}）</span>
            </span>
            {course.replyCount != null && course.replyCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-claude-muted-soft">
                源站评论信号
                <span className="px-2 py-0.5 rounded-md bg-claude-surface-soft text-claude-muted">
                  约 {course.replyCount.toLocaleString('zh-CN')} 条
                </span>
              </span>
            )}
          </div>

          <section className="mb-8">
            <h2 className="font-semibold text-claude-ink mb-2">简介</h2>
            <p className="text-claude-muted leading-relaxed">{course.intro || course.description}</p>
          </section>

          <section className="mb-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="font-semibold text-claude-ink flex items-center gap-2">
                <ListOrdered className="w-5 h-5" />
                课程目录
              </h2>
              <span className="text-xs text-claude-muted-soft">
                共 {course.chapters.length || 0} 集
                {course.chapters.length > 8 ? ' · 可滚动查看全部' : ''}
              </span>
            </div>
            <ol className="max-h-[32rem] overflow-y-auto overscroll-contain space-y-2 pr-1 rounded-claude-lg border border-claude-hairline-soft p-2 bg-claude-canvas">
              {(course.chapters.length ? course.chapters : [{ cid: '0', title: '暂无目录', page: 1 }]).map(
                (ch) => (
                  <li
                    key={`${ch.cid}-${ch.page}`}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-claude-md bg-claude-surface-card text-sm"
                  >
                    <span className="text-claude-ink min-w-0">
                      <span className="text-claude-muted-soft mr-2 tabular-nums">P{ch.page}</span>
                      {ch.title}
                    </span>
                    {ch.duration != null && ch.duration > 0 && (
                      <span className="text-claude-muted-soft flex-shrink-0 tabular-nums">
                        {Math.max(1, Math.round(ch.duration / 60))} 分钟
                      </span>
                    )}
                  </li>
                )
              )}
            </ol>
          </section>

          <section className="mb-8 overflow-hidden rounded-claude-xl border border-claude-hairline bg-claude-canvas">
            <div className="px-5 py-4 border-b border-claude-hairline-soft bg-gradient-to-r from-[#f3ebe0] to-transparent">
              <h2 className="font-semibold text-claude-ink font-display tracking-wide">源站口碑摘要</h2>
              <p className="text-xs text-claude-muted mt-1">评论 / 弹幕抽样 · 统一量表 · 与平台评分独立</p>
            </div>

            {!course.sourceSummary ? (
              <p className="px-5 py-6 text-sm text-claude-muted-soft">
                {course.replyCount
                  ? `已感知约 ${course.replyCount.toLocaleString('zh-CN')} 条评论信号，摘要尚未生成。`
                  : '暂无源站口碑摘要。'}
              </p>
            ) : (
              <div className="p-5 space-y-5">
                {sourceParsed.dimensions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-claude-muted mb-3 tracking-wide">五维拆解</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {sourceParsed.dimensions.map((d) => (
                        <div
                          key={d.key}
                          className="rounded-claude-md bg-claude-surface-card border border-claude-hairline-soft px-3 py-2.5 text-center"
                        >
                          <p className="text-[11px] text-claude-muted mb-1">{d.label}</p>
                          <p className="text-lg font-semibold text-claude-ink tabular-nums font-display">
                            {d.value.toFixed(1)}
                          </p>
                          <div className="mt-1.5 h-1 rounded-full bg-claude-surface-soft overflow-hidden">
                            <div
                              className="h-full rounded-full bg-claude-primary/80"
                              style={{ width: `${Math.min(100, (d.value / 10) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sourceParsed.highlights.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-claude-muted mb-3 tracking-wide">关键结论</p>
                    <ul className="space-y-2.5">
                      {sourceParsed.highlights.map((line, i) => (
                        <li key={i} className="flex gap-3 text-sm text-claude-ink leading-relaxed">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-claude-primary flex-shrink-0" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sourceParsed.quotes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-claude-muted mb-3 tracking-wide">代表性好评</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {sourceParsed.quotes.map((q, i) => (
                        <blockquote
                          key={i}
                          className="relative rounded-claude-md bg-claude-surface-card border border-claude-hairline-soft p-3.5"
                        >
                          <Quote className="w-4 h-4 text-claude-muted-soft mb-2 opacity-60" />
                          <p className="text-sm text-claude-ink leading-relaxed">{q.text}</p>
                          {q.like != null && (
                            <p className="mt-2 text-[11px] text-claude-muted-soft">赞 {q.like}</p>
                          )}
                        </blockquote>
                      ))}
                    </div>
                  </div>
                )}

                {!sourceParsed.dimensions.length &&
                  !sourceParsed.highlights.length &&
                  !sourceParsed.quotes.length && (
                    <div className="text-sm text-claude-muted whitespace-pre-wrap leading-relaxed">
                      {sourceParsed.rawFallback}
                    </div>
                  )}

                {sourceParsed.disclaimer && (
                  <p className="text-[11px] text-claude-muted-soft leading-relaxed border-t border-claude-hairline-soft pt-3">
                    {sourceParsed.disclaimer}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-claude-ink mb-3">我的平台评价</h2>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setScore(n)} className="transition-transform hover:scale-110">
                  <Star
                    className={`w-8 h-8 ${n <= score ? 'text-yellow-400 fill-yellow-400' : 'text-claude-hairline'}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的学习心得（可留空只打分）…"
              className="w-full p-4 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-ink resize-none h-24 mb-3"
            />
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="h-11 px-6 rounded-claude-md bg-claude-primary text-claude-on-primary font-medium hover:bg-opacity-90 disabled:opacity-60 inline-flex items-center"
            >
              {saving ? '提交中…' : '提交评价'}
            </button>
          </section>

          <section>
            <h2 className="font-semibold text-claude-ink mb-3">平台评价（{reviews.length}）</h2>
            <div className="space-y-3">
              {reviews.length === 0 && (
                <p className="text-sm text-claude-muted-soft">还没有评价。若提交失败，请确认已在 Supabase 执行最新 migration。</p>
              )}
              {reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-claude-md bg-claude-surface-card group">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="font-medium text-claude-ink">{r.userName}</span>
                    <div className="flex items-center gap-2">
                      <Stars value={r.score} size="sm" />
                      {user && r.userId === user.id && (
                        <button
                          type="button"
                          disabled={deleting}
                          onClick={() => handleDelete(r.id)}
                          className="p-1 rounded-md text-claude-muted-soft hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
                          title="删除我的评价"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {r.content && <p className="text-claude-muted text-sm">{r.content}</p>}

                  {r.replies.length > 0 && (
                    <div className="mt-3 rounded-claude-md bg-claude-surface-soft/60 px-3 divide-y divide-claude-hairline-soft">
                      {r.replies
                        .slice(0, expandedReplies[r.id] ? undefined : 3)
                        .map((reply) => (
                        <div key={reply.id} className="group/reply py-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm break-words min-w-0">
                              <span className="font-medium text-claude-ink mr-1.5">{reply.userName}</span>
                              <span className="text-claude-muted">{reply.content}</span>
                            </p>
                            {user && reply.userId === user.id && (
                              <button
                                type="button"
                                disabled={deletingReplyId === reply.id}
                                onClick={() => handleDeleteReply(reply.id)}
                                className="p-1 rounded-md text-claude-muted-soft hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover/reply:opacity-100 disabled:opacity-40 shrink-0"
                                title="删除我的回复"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-claude-muted-soft">
                              {new Date(reply.createdAt).toLocaleString('zh-CN')}
                            </p>
                            <button
                              type="button"
                              disabled={likingReplyId === reply.id}
                              onClick={() => handleReplyLike(r.id, reply)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                                reply.likedByMe
                                  ? 'bg-claude-primary/10 text-claude-primary'
                                  : 'text-claude-muted-soft hover:text-claude-primary hover:bg-claude-primary/5'
                              }`}
                              title={reply.likedByMe ? '取消点赞' : '点赞'}
                            >
                              <ThumbsUp className={`w-3 h-3 ${reply.likedByMe ? 'fill-current' : ''}`} />
                              <span className="tabular-nums">{reply.likeCount}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      {r.replies.length > 3 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReplies((prev) => ({ ...prev, [r.id]: !prev[r.id] }))
                          }
                          className="w-full py-2 inline-flex items-center justify-center gap-1 text-xs text-claude-muted hover:text-claude-primary transition-colors"
                        >
                          {expandedReplies[r.id] ? (
                            <>
                              收起
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              展开剩余 {r.replies.length - 3} 条回复
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {replyingTo === r.id && (
                    <div className="mt-3">
                      <textarea
                        value={replyTexts[r.id] ?? ''}
                        onChange={(e) =>
                          setReplyTexts((prev) => ({ ...prev, [r.id]: e.target.value }))
                        }
                        placeholder={`回复 ${r.userName}…`}
                        className="w-full p-3 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-ink resize-none h-20 text-sm"
                      />
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="px-3 py-1.5 rounded-claude-md text-xs text-claude-muted hover:bg-claude-surface-soft transition-colors"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          disabled={sendingReplyId === r.id || !(replyTexts[r.id] ?? '').trim()}
                          onClick={() => handleReplySubmit(r)}
                          className="px-4 py-1.5 rounded-claude-md bg-claude-primary text-claude-on-primary text-xs font-medium hover:bg-opacity-90 disabled:opacity-60"
                        >
                          {sendingReplyId === r.id ? '发送中…' : '发送'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-claude-muted-soft">
                      {new Date(r.createdAt).toLocaleString('zh-CN')}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setReplyingTo((cur) => (cur === r.id ? null : r.id))}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          replyingTo === r.id
                            ? 'bg-claude-primary/10 text-claude-primary'
                            : 'text-claude-muted-soft hover:text-claude-primary hover:bg-claude-primary/5'
                        }`}
                        title={replyingTo === r.id ? '收起回复框' : '回复'}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        回复{r.replies.length > 0 ? ` ${r.replies.length}` : ''}
                      </button>
                      <button
                        type="button"
                        disabled={likingId === r.id}
                        onClick={() => handleLike(r)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                          r.likedByMe
                            ? 'bg-claude-primary/10 text-claude-primary'
                            : 'text-claude-muted-soft hover:text-claude-primary hover:bg-claude-primary/5'
                        }`}
                        title={r.likedByMe ? '取消点赞' : '点赞'}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${r.likedByMe ? 'fill-current' : ''}`} />
                        <span className="tabular-nums">{r.likeCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/** 全站排行入口（可选）：从 /rating 也可扩展；当前专题内排序已覆盖 */
export function RatingRankingsPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetchCourses().then(setCourses);
  }, []);

  const sorted = [...courses].sort((a, b) => b.platformRating - a.platformRating).slice(0, 20);

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/rating')}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-claude-md bg-claude-canvas border border-claude-hairline text-claude-ink hover:text-claude-primary transition-all mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        返回课程评分
      </button>
      <h1 className="text-2xl font-bold text-claude-ink mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-claude-accent-amber" />
        平台评分排行榜
      </h1>
      <div className="space-y-3">
        {sorted.map((course, index) => (
          <button
            key={course.id}
            type="button"
            onClick={() => navigate(`/rating/courses/${course.id}`)}
            className="w-full flex items-center gap-4 p-4 rounded-claude-lg bg-claude-surface-card border border-claude-hairline text-left"
          >
            <span className="w-8 text-center font-bold">{index + 1}</span>
            <span className="flex-1 truncate">{course.title}</span>
            <span className="font-semibold">{course.platformRating.toFixed(1)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const Rating = () => {
  const params = useParams();
  const isCourseDetail = Boolean(params.courseId);

  return (
    <div className="pt-16 relative">
      {/* Clay blobs */}
      <div className="fixed top-16 right-8 w-32 h-32 rounded-[55%_45%_50%_50%] pointer-events-none opacity-55"
        style={{ background: 'radial-gradient(circle at 40% 35%, #fcc8a8 0%, transparent 70%)', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-20 left-6 w-28 h-28 rounded-[45%_55%_55%_45%] pointer-events-none opacity-55"
        style={{ background: 'radial-gradient(circle at 35% 30%, #a8e0c8 0%, transparent 70%)', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-1/3 left-4 w-24 h-24 rounded-[50%_55%_45%_50%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 45% 40%, #a8d8ea 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-1/3 right-4 w-20 h-20 rounded-[55%_45%_40%_60%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 40% 30%, #d4b8e0 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-[55%] left-[30%] w-16 h-16 rounded-[50%_55%_45%_50%] pointer-events-none opacity-35"
        style={{ background: 'radial-gradient(circle at 40% 35%, #f8e8a0 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-[20%] right-[25%] w-20 h-20 rounded-[55%_45%_55%_45%] pointer-events-none opacity-35"
        style={{ background: 'radial-gradient(circle at 35% 40%, #f8b8c8 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />

      <div className={`${isCourseDetail ? 'w-full' : 'max-w-[calc(100%-24rem)]'} min-w-0 pl-4 sm:pl-6 lg:pl-8`}>
        {params.courseId ? (
          <CourseDetail />
        ) : params.topicId ? (
          <CourseList />
        ) : (
          <DomainList />
        )}
      </div>

      {!isCourseDetail && (
        <aside className="hidden lg:block fixed top-16 right-4 w-80 h-[calc(100vh-4rem)] pt-4">
          <CourseChat />
        </aside>
      )}
    </div>
  );
};

export default Rating;
