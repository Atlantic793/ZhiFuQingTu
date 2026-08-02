import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
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
          className={`${cls} ${n <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-morandi-light'}`}
        />
      ))}
    </span>
  );
}

function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-morandi-text/60 mb-6">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-morandi-pink transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-morandi-text font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
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
        className={`px-3 py-1.5 rounded-lg text-xs ${
          !selectedId ? 'bg-morandi-blue/20 text-morandi-text' : 'bg-morandi-light text-morandi-text/70'
        }`}
      >
        不限学科
      </button>
      {subjects.map((subject) => (
        <button
          key={subject.id}
          type="button"
          onClick={() => onSelect(subject.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
            selectedId === subject.id
              ? 'text-morandi-text'
              : 'bg-morandi-light text-morandi-text/70 hover:bg-morandi-light/80'
          }`}
          style={{
            backgroundColor: selectedId === subject.id ? `${subject.color}35` : undefined,
          }}
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
    <div>
      <Breadcrumb
        items={[
          { label: '课程评分', to: selectedId ? '/rating' : undefined },
          ...(selectedSubject ? [{ label: selectedSubject.name }] : []),
        ]}
      />
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-morandi-text font-display mb-3">课程评分</h1>
        <p className="text-morandi-text/70 max-w-2xl">
          学科分类与智能体助手一致。先选学科，再进专题，最后到具体网课。源站口碑与真实 BV 后续接入。
        </p>
        {loading && <p className="mt-3 text-sm text-morandi-text/50">正在加载目录…</p>}
      </header>

      <SubjectChipBar subjects={subjects} selectedId={selectedId} onSelect={handleSelect} />

      {selectedSubject && (
        <p className="text-sm text-morandi-text/55 mb-4 -mt-4">{selectedSubject.description}</p>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {visibleTopics.map((topic) => (
          <Link
            key={topic.id}
            to={`/rating/topics/${topic.id}`}
            className="flex gap-4 p-4 rounded-2xl bg-white shadow-soft hover:shadow-md transition-shadow"
          >
            <img
              src={normalizeCoverUrl(topic.coverImage)}
              alt={topic.name}
              referrerPolicy="no-referrer"
              className="w-28 h-20 rounded-xl object-cover flex-shrink-0 bg-morandi-light"
            />
            <div className="min-w-0">
              <h2 className="font-semibold text-morandi-text mb-1 truncate">{topic.name}</h2>
              <p className="text-sm text-morandi-text/60 line-clamp-2">{topic.description}</p>
            </div>
          </Link>
        ))}
      </div>
      {!loading && visibleTopics.length === 0 && (
        <p className="text-morandi-text/60">
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
    <div>
      <Breadcrumb
        items={[
          { label: '课程评分', to: '/rating' },
          {
            label: domain?.name || '领域',
            to: domain ? `/rating/domains/${domain.id}` : '/rating',
          },
          { label: topic?.name || '专题' },
        ]}
      />
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-morandi-text font-display mb-2">
          {topic?.name || '课程列表'}
        </h1>
        <p className="text-morandi-text/70">{topic?.description}</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="relative">
          <Search className="w-5 h-5 text-morandi-text/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索本专题课程…"
            className="pl-10 pr-4 py-3 rounded-xl bg-white shadow-soft border-none outline-none focus:ring-2 focus:ring-morandi-pink/50 text-morandi-text w-64"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowRankings((v) => !v)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
            showRankings
              ? 'bg-morandi-pink text-white'
              : 'bg-white text-morandi-text hover:bg-morandi-light shadow-soft'
          }`}
        >
          <Trophy className="w-5 h-5" />
          按平台评分排序
        </button>
      </div>

      {loading && <p className="text-sm text-morandi-text/50 mb-4">加载中…</p>}

      <div className="space-y-3">
        {visible.map((course, index) => (
          <button
            key={course.id}
            type="button"
            onClick={() => navigate(`/rating/courses/${course.id}`)}
            className="opacity-0 animate-card-enter w-full flex items-center gap-4 p-4 rounded-2xl bg-white shadow-soft hover:shadow-md transition-shadow text-left"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            {showRankings && (
              <div className="w-8 h-8 rounded-full bg-morandi-light flex items-center justify-center font-bold text-sm text-morandi-text">
                {index + 1}
              </div>
            )}
            <img
              src={normalizeCoverUrl(course.coverImage)}
              alt={course.title}
              referrerPolicy="no-referrer"
              className="w-20 h-14 rounded-lg object-cover flex-shrink-0 bg-morandi-light"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-morandi-text truncate">{course.title}</h3>
              <p className="text-sm text-morandi-text/55 truncate">{course.intro || course.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-morandi-text">{course.platformRating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-morandi-text/50">{course.platformRatingCount} 人评</p>
            </div>
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
  const [domain, setDomain] = useState<Subject | null>(null);
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
    const [t, domains, revs] = await Promise.all([
      c.topicId ? fetchTopicById(c.topicId) : Promise.resolve(null),
      fetchSubjects(),
      fetchCourseReviews(courseId),
    ]);
    setTopic(t);
    setDomain(t ? domains.find((d) => d.id === t.domainId) ?? null : null);
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
    return <p className="text-morandi-text/60 pt-4">加载课程详情…</p>;
  }
  if (!course) {
    return (
      <div className="pt-4">
        <p className="text-morandi-text/70 mb-4">未找到该课程</p>
        <Link to="/rating" className="text-morandi-pink">
          返回目录
        </Link>
      </div>
    );
  }

  const hasRealLink = Boolean(course.bvid);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: '课程评分', to: '/rating' },
          {
            label: domain?.name || '领域',
            to: domain ? `/rating/domains/${domain.id}` : '/rating',
          },
          {
            label: topic?.name || '专题',
            to: topic ? `/rating/topics/${topic.id}` : '/rating',
          },
          { label: course.title },
        ]}
      />

      <button
        type="button"
        onClick={() => navigate(topic ? `/rating/topics/${topic.id}` : '/rating')}
        className="inline-flex items-center gap-1 text-sm text-morandi-text/60 hover:text-morandi-pink mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        返回专题
      </button>

      <div className="bg-white rounded-3xl shadow-soft overflow-hidden mb-8">
        <div className="relative">
          <img
            src={normalizeCoverUrl(course.coverImage)}
            alt={course.title}
            referrerPolicy="no-referrer"
            className="w-full aspect-video object-cover bg-morandi-light"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={handleFavorite}
              className="px-4 py-2 rounded-full bg-white/95 text-morandi-text flex items-center gap-2 text-sm font-medium"
            >
              {favorited ? <BookmarkCheck className="w-4 h-4 text-morandi-pink" /> : <Bookmark className="w-4 h-4" />}
              {favorited ? '已收藏' : '收藏'}
            </button>
            {hasRealLink ? (
              <a
                href={course.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-morandi-pink text-white flex items-center gap-2 text-sm font-medium"
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
          <h1 className="text-2xl md:text-3xl font-bold text-morandi-text font-display mb-3">{course.title}</h1>
          {(course.ownerName || course.bvid) && (
            <p className="text-sm text-morandi-text/55 mb-3">
              {course.ownerName && <span>UP：{course.ownerName}</span>}
              {course.bvid && <span className="ml-3">BV：{course.bvid}</span>}
              {course.viewCount != null && (
                <span className="ml-3">播放 {course.viewCount.toLocaleString('zh-CN')}</span>
              )}
            </p>
          )}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-morandi-text/50">平台评分</span>
              <Stars value={course.platformRating} />
              <strong className="text-morandi-text">{course.platformRating.toFixed(1)}</strong>
              <span className="text-morandi-text/45">（{course.platformRatingCount}）</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-morandi-text/50">
              源站口碑
              {course.replyCount != null && course.replyCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-morandi-light text-morandi-text/70">
                  已取到 {course.replyCount.toLocaleString('zh-CN')} 条评论信号
                </span>
              )}
            </span>
          </div>

          <section className="mb-8">
            <h2 className="font-semibold text-morandi-text mb-2">简介</h2>
            <p className="text-morandi-text/75 leading-relaxed">{course.intro || course.description}</p>
          </section>

          <section className="mb-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="font-semibold text-morandi-text flex items-center gap-2">
                <ListOrdered className="w-5 h-5" />
                课程目录
              </h2>
              <span className="text-xs text-morandi-text/50">
                共 {course.chapters.length || 0} 集
                {course.chapters.length > 8 ? ' · 可滚动查看全部' : ''}
              </span>
            </div>
            <ol className="max-h-[32rem] overflow-y-auto overscroll-contain space-y-2 pr-1 rounded-xl border border-morandi-text/10 p-2 bg-white">
              {(course.chapters.length ? course.chapters : [{ cid: '0', title: '暂无目录', page: 1 }]).map(
                (ch) => (
                  <li
                    key={`${ch.cid}-${ch.page}`}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-morandi-light/60 text-sm"
                  >
                    <span className="text-morandi-text min-w-0">
                      <span className="text-morandi-text/45 mr-2 tabular-nums">P{ch.page}</span>
                      {ch.title}
                    </span>
                    {ch.duration != null && ch.duration > 0 && (
                      <span className="text-morandi-text/45 flex-shrink-0 tabular-nums">
                        {Math.max(1, Math.round(ch.duration / 60))} 分钟
                      </span>
                    )}
                  </li>
                )
              )}
            </ol>
          </section>

          <section className="mb-8 p-5 rounded-2xl bg-morandi-light/40 border border-dashed border-morandi-text/15">
            <h2 className="font-semibold text-morandi-text mb-2">源站口碑</h2>
            {course.sourceSummary ? (
              <div className="text-sm text-morandi-text/80 whitespace-pre-wrap leading-relaxed">
                {course.sourceScore != null && (
                  <p className="mb-2 font-medium text-morandi-text">
                    源站口碑分：{Number(course.sourceScore).toFixed(1)}
                    <span className="ml-2 font-normal text-morandi-text/50">
                      （统一量表 0–10 · 与平台评分独立 · 基于抽样）
                    </span>
                  </p>
                )}
                {course.sourceSummary}
              </div>
            ) : (
              <p className="text-sm text-morandi-text/60">
                {course.replyCount
                  ? `已感知约 ${course.replyCount.toLocaleString('zh-CN')} 条评论信号。运行 npm run bili:summarize 可按统一量表生成摘要。`
                  : '框架占位：汇总 B 站评论/弹幕后展示优点、槽点与代表性原话。'}
              </p>
            )}
          </section>

          <section className="mb-8">
            <h2 className="font-semibold text-morandi-text mb-3">我的平台评价</h2>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setScore(n)} className="transition-transform hover:scale-110">
                  <Star
                    className={`w-8 h-8 ${n <= score ? 'text-yellow-400 fill-yellow-400' : 'text-morandi-light'}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的学习心得（可留空只打分）…"
              className="w-full p-4 rounded-xl bg-morandi-light border-none outline-none focus:ring-2 focus:ring-morandi-pink/50 text-morandi-text resize-none h-24 mb-3"
            />
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="px-6 py-2 rounded-xl bg-morandi-pink text-white font-medium hover:bg-opacity-90 disabled:opacity-60"
            >
              {saving ? '提交中…' : '提交评价'}
            </button>
          </section>

          <section>
            <h2 className="font-semibold text-morandi-text mb-3">平台评价（{reviews.length}）</h2>
            <div className="space-y-3">
              {reviews.length === 0 && (
                <p className="text-sm text-morandi-text/55">还没有评价。若提交失败，请确认已在 Supabase 执行最新 migration。</p>
              )}
              {reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-morandi-light/50">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="font-medium text-morandi-text">{r.userName}</span>
                    <Stars value={r.score} size="sm" />
                  </div>
                  {r.content && <p className="text-morandi-text/80 text-sm">{r.content}</p>}
                  <p className="text-xs text-morandi-text/45 mt-2">
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
      <Breadcrumb items={[{ label: '课程评分', to: '/rating' }, { label: '排行榜' }]} />
      <h1 className="text-2xl font-bold text-morandi-text mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-morandi-yellow" />
        平台评分排行榜
      </h1>
      <div className="space-y-3">
        {sorted.map((course, index) => (
          <button
            key={course.id}
            type="button"
            onClick={() => navigate(`/rating/courses/${course.id}`)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white shadow-soft text-left"
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
    <div className="pt-16">
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
