import { useEffect, useState } from 'react';
import { Star, ThumbsUp, MessageCircle, ExternalLink, Trophy, Search, X, ArrowRight } from 'lucide-react';
import { comments, type Course, type Comment } from '../data/mockData';
import { fetchCourses } from '../services/catalogService';

interface CommentWithLikes extends Comment {
  likes: number;
  liked: boolean;
}

const Rating = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [showRankings, setShowRankings] = useState(false);
  const [courseComments, setCourseComments] = useState<CommentWithLikes[]>(
    comments.map((c) => ({ ...c, likes: Math.floor(Math.random() * 50), liked: false }))
  );
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchCourses();
        if (!cancelled) setCourses(rows);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRatingClick = (score: number) => {
    setUserRating(score);
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    const newCommentObj: CommentWithLikes = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: '我',
      content: newComment,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      likes: 0,
      liked: false,
    };
    setCourseComments((prev) => [newCommentObj, ...prev]);
    setNewComment('');
  };

  const handleLike = (commentId: string) => {
    setCourseComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likes: c.liked ? c.likes - 1 : c.likes + 1, liked: !c.liked }
          : c
      )
    );
  };

  const sortedCourses = [...courses].sort((a, b) => b.rating - a.rating);
  const visibleCourses = courses.filter(
    (c) =>
      !searchQuery.trim() ||
      c.title.includes(searchQuery.trim()) ||
      c.description.includes(searchQuery.trim())
  );

  return (
    <div className="pt-16">
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-morandi-text font-display mb-4">
          流动性评分系统
        </h1>
        <p className="text-morandi-text/70">
          为教学视频评分，分享学习心得，共建优质教程资源池
        </p>
        {loading && <p className="mt-3 text-sm text-morandi-text/50">正在加载课程编目…</p>}
      </section>

      <div className="flex items-center justify-between mb-8">
        <div className="relative">
          <Search className="w-5 h-5 text-morandi-text/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索课程..."
            className="pl-10 pr-4 py-3 rounded-xl bg-white shadow-soft border-none outline-none focus:ring-2 focus:ring-morandi-pink/50 text-morandi-text w-64"
          />
        </div>
        <button
          onClick={() => setShowRankings(!showRankings)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            showRankings
              ? 'bg-morandi-pink text-white'
              : 'bg-white text-morandi-text hover:bg-morandi-light shadow-soft'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>排行榜</span>
        </button>
      </div>

      {showRankings ? (
        <div className="bg-white rounded-3xl shadow-soft p-8 mb-8">
          <h2 className="text-xl font-bold text-morandi-text mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-morandi-yellow" />
            课程评分排行榜
          </h2>
          <div className="space-y-4">
            {sortedCourses.map((course, index) => (
              <div
                key={course.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-morandi-light/50 hover:bg-morandi-light transition-colors cursor-pointer"
                onClick={() => setSelectedCourse(course)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? 'bg-yellow-400 text-white'
                      : index === 1
                      ? 'bg-gray-400 text-white'
                      : index === 2
                      ? 'bg-orange-400 text-white'
                      : 'bg-morandi-light text-morandi-text'
                  }`}
                >
                  {index + 1}
                </div>
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-morandi-text">{course.title}</h3>
                  <p className="text-sm text-morandi-text/60">{course.ratingCount} 人评分</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-morandi-text">{course.rating}</span>
                </div>
                <div className="w-32 bg-morandi-light rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-morandi-pink to-morandi-yellow rounded-full"
                    style={{ width: `${(course.rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {visibleCourses.map((course) => (
            <div
              key={course.id}
              className="relative overflow-hidden cursor-pointer group rounded-2xl"
              onMouseEnter={() => setHoveredCourse(course.id)}
              onMouseLeave={() => setHoveredCourse(null)}
            >
              <div className="relative w-full aspect-[4/5]">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1050ms] group-hover:scale-105"
                />
                <div
                  className={`absolute left-0 right-0 bg-white/90 backdrop-blur-sm transition-all duration-[1050ms] ease-out ${
                    hoveredCourse === course.id
                      ? 'top-0 bottom-0'
                      : 'top-auto bottom-0 h-[45%]'
                  }`}
                  style={{
                    borderRadius: '1rem',
                    transition: 'height 1.05s ease-out, top 1.05s ease-out, background-color 1.05s ease-out'
                  }}
                >
                  <div className="p-5 h-full flex flex-col">
                    <div className={`transition-all duration-[750ms] ${
                      hoveredCourse === course.id ? 'opacity-100 mt-0' : 'opacity-100 mt-auto'
                    }`}>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">课程</span>
                        <span>2024-01-15</span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-lg mb-2">
                        {course.title}
                      </h3>
                      <p
                        className={`text-sm text-gray-600 mb-3 leading-relaxed transition-all duration-[750ms] ${
                          hoveredCourse === course.id ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'
                        }`}
                      >
                        {course.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourse(course);
                        }}
                        className={`px-4 py-2 rounded-full bg-green-400 text-gray-800 font-medium text-sm flex items-center gap-1 hover:bg-green-500 transition-all duration-[450ms] ${
                          hoveredCourse === course.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                      >
                        <span>了解更多</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-gray-700">{course.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden relative">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-morandi-pink hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <img
                src={selectedCourse.coverImage}
                alt={selectedCourse.title}
                className="w-full aspect-video object-cover rounded-t-3xl"
              />
              <a
                href={selectedCourse.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-morandi-pink text-white flex items-center gap-2 hover:bg-opacity-90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>观看视频</span>
              </a>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 225px)' }}>
              <h2 className="text-2xl font-bold text-morandi-text mb-2">{selectedCourse.title}</h2>
              <p className="text-morandi-text/70 mb-6">{selectedCourse.description}</p>

              <div className="mb-6">
                <h3 className="font-medium text-morandi-text mb-3">给课程评分</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= userRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-morandi-light'
                        }`}
                      />
                    </button>
                  ))}
                  {userRating > 0 && (
                    <span className="ml-4 font-bold text-morandi-text">{userRating} 星</span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-morandi-text mb-3">发表评论</h3>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="分享您的学习心得..."
                  className="w-full p-4 rounded-xl bg-morandi-light border-none outline-none focus:ring-2 focus:ring-morandi-pink/50 text-morandi-text resize-none h-24"
                />
                <button
                  onClick={handleSubmitComment}
                  className="mt-3 px-6 py-2 rounded-xl bg-morandi-pink text-white font-medium hover:bg-opacity-90 transition-colors"
                >
                  提交评论
                </button>
              </div>

              <div>
                <h3 className="font-medium text-morandi-text mb-3">评论区</h3>
                <div className="space-y-4">
                  {courseComments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-xl bg-morandi-light/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-morandi-text">{comment.userName}</span>
                        <span className="text-sm text-morandi-text/50">{comment.createdAt}</span>
                      </div>
                      <p className="text-morandi-text/80">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          onClick={() => handleLike(comment.id)}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            comment.liked ? 'text-morandi-pink' : 'text-morandi-text/60 hover:text-morandi-pink'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${comment.liked ? 'fill-current' : ''}`} />
                          <span>{comment.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-sm text-morandi-text/60 hover:text-morandi-blue transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>回复</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rating;
