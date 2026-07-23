import { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, ExternalLink, Trophy, Search } from 'lucide-react';
import { courses, comments, type Course } from '../data/mockData';

const Rating = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [showRankings, setShowRankings] = useState(false);

  const handleRatingClick = (score: number) => {
    setUserRating(score);
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    setNewComment('');
  };

  const sortedCourses = [...courses].sort((a, b) => b.rating - a.rating);

  return (
    <div className="pt-16">
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-morandi-text font-display mb-4">
          流动性评分系统
        </h1>
        <p className="text-morandi-text/70">
          为教学视频评分，分享学习心得，共建优质教程资源池
        </p>
      </section>

      <div className="flex items-center justify-between mb-8">
        <div className="relative">
          <Search className="w-5 h-5 text-morandi-text/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
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
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer card-soft"
            >
              <div className="relative">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full aspect-video object-cover"
                />
                <a
                  href={course.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-morandi-pink hover:text-white transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-morandi-text mb-2">{course.title}</h3>
                <p className="text-sm text-morandi-text/60 mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-morandi-text">{course.rating}</span>
                    <span className="text-sm text-morandi-text/50">({course.ratingCount})</span>
                  </div>
                  <button className="flex items-center gap-1 text-sm text-morandi-pink hover:underline">
                    <MessageCircle className="w-4 h-4" />
                    <span>{comments.length}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedCourse.coverImage}
                alt={selectedCourse.title}
                className="w-full aspect-video object-cover rounded-t-3xl"
              />
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-morandi-pink hover:text-white transition-colors"
              >
                <span className="text-xl font-bold">&times;</span>
              </button>
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
            <div className="p-6">
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
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-xl bg-morandi-light/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-morandi-text">{comment.userName}</span>
                        <span className="text-sm text-morandi-text/50">{comment.createdAt}</span>
                      </div>
                      <p className="text-morandi-text/80">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-sm text-morandi-text/60 hover:text-morandi-pink transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>点赞</span>
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
