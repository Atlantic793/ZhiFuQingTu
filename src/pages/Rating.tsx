import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ListOrdered,
  Search,
  Star,
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
import {
  fetchCourseReviews,
  fetchMyReview,
  isCourseFavorited,
  toggleCourseFavorite,
  upsertCourseReview,
} from '../services/ratingService';
import { useAuthStore } from '../store/authStore';
import type { CatalogTopic, Course, CourseReview, Subject } from '../types/catalog';
import { subjectIconMap } from '../utils/subjectIcons';
import { normalizeCoverUrl } from '../utils/media';

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
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-claude-md text-xs border border-claude-hairline ${
          !selectedId
            ? 'bg-claude-surface-cream-strong text-claude-ink'
            : 'bg-claude-surface-card text-claude-body hover:bg-claude-surface-soft'
        }`}
      >
        不限学科
      </button>
      {subjects.map((subject) => (
        <button
          key={subject.id}
          type="button"
          onClick={() => onSelect(subject.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-claude-md text-xs border border-claude-hairline transition-colors ${
            selectedId === subject.id
              ? 'bg-claude-surface-cream-strong text-claude-ink'
              : 'bg-claude-surface-card text-claude-body hover:bg-claude-surface-soft'
          }`}
        >
          {subjectIconMap[subject.icon]}
          {subject.name}
        </button>
      ))}
    </div>
  );
}

/** 首页 / 学科页：与 Agent 同一套学科芯片，下列出专题 */
function DomainList() {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<CatalogTopic[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(domainId ?? null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="mt-4">
      <header className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-claude-ink font-display mb-3">课程评分</h1>
        <p className="text-claude-muted max-w-2xl mx-auto">
          学科分类与智能体助手一致。先选学科，再进专题，最后到具体网课。源站口碑与真实 BV 后续接入。
        </p>
        {loading && <p className="mt-3 text-sm text-claude-muted-soft">正在加载目录…</p>}
      </header>

      <SubjectChipBar subjects={subjects} selectedId={selectedId} onSelect={handleSelect} />

      {selectedSubject && (
        <p className="text-sm text-claude-muted-soft mb-4 -mt-4">{selectedSubject.description}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleTopics.map((topic) => (
          <Link
            key={topic.id}
            to={`/rating/topics/${topic.id}`}
            className="relative aspect-square rounded-claude-lg overflow-hidden border border-claude-hairline transition-shadow group"
          >
            <img
              src={normalizeCoverUrl(topic.coverImage)}
              alt={topic.name}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:brightness-[0.85] transition-all duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white/90 backdrop-blur-md min-h-[5rem] flex items-center z-10">
              <h2 className="font-semibold text-claude-ink line-clamp-2 text-xl">{topic.name}</h2>
            </div>
            <div className="absolute inset-0 bg-white/[0.92] backdrop-blur-[2px] flex flex-col justify-start px-5 py-4 pb-14 overflow-y-auto translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-20 [transition:transform_0.5s_cubic-bezier(0.4,0,0.2,1),opacity_0.4s_ease]">
              <h2 className="font-semibold text-claude-ink text-xl mb-2">{topic.name}</h2>
              <p className="text-sm text-claude-muted leading-relaxed">{topic.description}</p>
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-claude-xl bg-claude-success text-white text-sm font-medium">
                  了解更多 <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {!loading && visibleTopics.length === 0 && (
        <p className="text-claude-muted-soft">
          {selectedId ? '该学科下暂无专题，可先选「不限学科」查看已有内容。' : '暂无专题，请确认已执行 rating migration。'}
        </p>
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

  const visible = courses
    .filter(
      (c) =>
        !searchQuery.trim() ||
        c.title.includes(searchQuery.trim()) ||
        c.description.includes(searchQuery.trim())
    )
    .sort((a, b) => (showRankings ? b.platformRating - a.platformRating : 0));

  return (
    <div className="mt-6">
      {!loading && domain && (
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

      {loading && <p className="text-sm text-claude-muted-soft mb-4">加载中…</p>}

      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {visible.map((course) => (
          <button
            key={course.id}
            type="button"
            onClick={() => navigate(`/rating/courses/${course.id}`)}
            className="rounded-[16px] text-left group bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.04)' }}
          >
            <div className="aspect-[16/10] overflow-hidden rounded-t-claude-lg relative bg-claude-canvas">
              <img
                src={normalizeCoverUrl(course.coverImage)}
                alt={course.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 text-white text-xs">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{course.platformRating.toFixed(1)}</span>
              </div>
            </div>
            <div className="border-t border-claude-hairline-soft mx-3" />
            <h3 className="text-[15px] font-medium text-claude-ink line-clamp-2 leading-[1.5] px-3 pb-3 pt-2 h-[3.25rem]">
              {course.title}
            </h3>
          </button>
        ))}
      </div>
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const c = await fetchCourseById(courseId);
    setCourse(c);
    if (!c) return;
    const [t, , revs] = await Promise.all([
      c.topicId ? fetchTopicById(c.topicId) : Promise.resolve(null),
      fetchSubjects(),
      fetchCourseReviews(courseId),
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

  const handleFavorite = async () => {
    if (!user || !course) return;
    try {
      const next = await toggleCourseFavorite(course.id, user.id);
      setFavorited(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : '收藏失败');
    }
  };

  if (loading) {
    return <p className="text-claude-muted-soft pt-4">加载课程详情…</p>;
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

  return (
    <div className="mt-6">
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
          <h1 className="text-2xl md:text-3xl font-bold text-claude-ink font-display mb-3">{course.title}</h1>
          {(course.ownerName || course.bvid) && (
            <p className="text-sm text-claude-muted-soft mb-3">
              {course.ownerName && <span>UP：{course.ownerName}</span>}
              {course.bvid && <span className="ml-3">BV：{course.bvid}</span>}
              {course.viewCount != null && (
                <span className="ml-3">播放 {course.viewCount.toLocaleString('zh-CN')}</span>
              )}
            </p>
          )}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-claude-muted-soft">平台评分</span>
              <Stars value={course.platformRating} />
              <strong className="text-claude-ink">{course.platformRating.toFixed(1)}</strong>
              <span className="text-claude-muted-soft">（{course.platformRatingCount}）</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-claude-muted-soft">
              源站口碑
              {course.replyCount != null && course.replyCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-claude-surface-soft text-claude-muted">
                  已取到 {course.replyCount.toLocaleString('zh-CN')} 条评论信号
                </span>
              )}
            </span>
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

          <section className="mb-8 p-5 rounded-claude-lg bg-claude-surface-card border border-dashed border-claude-hairline-soft">
            <h2 className="font-semibold text-claude-ink mb-2">源站口碑</h2>
            {course.sourceSummary ? (
              <div className="text-sm text-claude-muted whitespace-pre-wrap leading-relaxed">
                {course.sourceScore != null && (
                  <p className="mb-2 font-medium text-claude-ink">
                    源站口碑分：{Number(course.sourceScore).toFixed(1)}
                    <span className="ml-2 font-normal text-claude-muted-soft">
                      （统一量表 0–10 · 与平台评分独立 · 基于抽样）
                    </span>
                  </p>
                )}
                {course.sourceSummary}
              </div>
            ) : (
              <p className="text-sm text-claude-muted-soft">
                {course.replyCount
                  ? `已感知约 ${course.replyCount.toLocaleString('zh-CN')} 条评论信号。运行 npm run bili:summarize 可按统一量表生成摘要。`
                  : '框架占位：汇总 B 站评论/弹幕后展示优点、槽点与代表性原话。'}
              </p>
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
                <div key={r.id} className="p-4 rounded-claude-md bg-claude-surface-card">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="font-medium text-claude-ink">{r.userName}</span>
                    <Stars value={r.score} size="sm" />
                  </div>
                  {r.content && <p className="text-claude-muted text-sm">{r.content}</p>}
                  <p className="text-xs text-claude-muted-soft mt-2">
                    {new Date(r.createdAt).toLocaleString('zh-CN')}
                  </p>
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
  return (
    <div className="pt-16 relative overflow-hidden">
      {/* Clay blobs */}
      <div className="fixed top-24 right-8 w-32 h-32 rounded-[55%_45%_50%_50%] pointer-events-none opacity-35"
        style={{ background: 'radial-gradient(circle at 40% 35%, #fcc8a8 0%, transparent 70%)', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-20 left-6 w-28 h-28 rounded-[45%_55%_55%_45%] pointer-events-none opacity-35"
        style={{ background: 'radial-gradient(circle at 35% 30%, #a8e0c8 0%, transparent 70%)', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />

      {params.courseId ? (
        <CourseDetail />
      ) : params.topicId ? (
        <CourseList />
      ) : (
        <DomainList />
      )}
    </div>
  );
};

export default Rating;
