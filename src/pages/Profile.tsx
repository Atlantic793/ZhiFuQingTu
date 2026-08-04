import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Calendar,
  MapPin,
  Mail,
  Github,
  Trophy,
  BookOpen,
  Star,
  TrendingUp,
  Award,
  CheckCircle,
  Pencil,
  Camera,
  X,
  Bookmark,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { formatGithubDisplay, uploadAvatar } from '../services/profileService';
import { fetchCourseById } from '../services/catalogService';
import { fetchMyFavoriteCourseIds, fetchMyReviews } from '../services/ratingService';
import type { Course, CourseReview } from '../types/catalog';

const Profile = () => {
  const { user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [github, setGithub] = useState('');
  const [bio, setBio] = useState('');
  const [myReviews, setMyReviews] = useState<(CourseReview & { courseTitle?: string })[]>([]);
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) return;
    setNickname(user.nickname);
    setAddress(user.address ?? '');
    setGithub(user.github ?? '');
    setBio(user.bio ?? '');
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [reviews, favIds] = await Promise.all([
        fetchMyReviews(user.id),
        fetchMyFavoriteCourseIds(user.id),
      ]);
      if (cancelled) return;
      const withTitles = await Promise.all(
        reviews.map(async (r) => {
          const course = await fetchCourseById(r.courseId);
          return { ...r, courseTitle: course?.title };
        })
      );
      const favCourses = (
        await Promise.all(favIds.map((id) => fetchCourseById(id)))
      ).filter((c): c is Course => !!c);
      if (!cancelled) {
        setMyReviews(withTitles);
        setFavoriteCourses(favCourses);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const avgRating = useMemo(() => {
    if (!myReviews.length) return 0;
    const sum = myReviews.reduce((acc, r) => acc + r.score, 0);
    return Math.round((sum / myReviews.length) * 10) / 10;
  }, [myReviews]);

  const userStats = {
    coursesCompleted: 24,
    certifications: 8,
    avgRating,
    totalReviews: myReviews.length,
    favorites: favoriteCourses.length,
    learningDays: 180,
    streak: 15,
  };

  const recentActivity = [
    { id: 1, type: 'completed', title: '完成课程', detail: '人工智能导论', time: '2小时前' },
    { id: 2, type: 'review', title: '发表评论', detail: '数据结构与算法', time: '5小时前' },
    { id: 3, type: 'certified', title: '获得证书', detail: 'Python编程入门', time: '1天前' },
    { id: 4, type: 'started', title: '开始学习', detail: '机器学习实战', time: '2天前' },
    { id: 5, type: 'quiz', title: '完成测验', detail: '职业实训 - 金融科技', time: '3天前' },
  ];

  const achievements = [
    { id: 1, icon: Trophy, title: '学习达人', description: '连续学习30天', unlocked: true },
    { id: 2, icon: Star, title: '优秀学员', description: '获得5星评价', unlocked: true },
    { id: 3, icon: BookOpen, title: '知识渊博', description: '完成50门课程', unlocked: false },
    { id: 4, icon: TrendingUp, title: '进步神速', description: '一周内完成5门课程', unlocked: true },
    { id: 5, icon: Award, title: '全能选手', description: '完成所有学科课程', unlocked: false },
    { id: 6, icon: CheckCircle, title: '认证专家', description: '获得10个证书', unlocked: false },
  ];

  const githubDisplay = formatGithubDisplay(user?.github);
  const joinedLabel = formatJoinedAt(user?.created_at);

  const startEditing = () => {
    if (!user) return;
    setNickname(user.nickname);
    setAddress(user.address ?? '');
    setGithub(user.github ?? '');
    setBio(user.bio ?? '');
    setError('');
    setSuccess('');
    setEditing(true);
  };

  const cancelEditing = () => {
    if (!user) return;
    setNickname(user.nickname);
    setAddress(user.address ?? '');
    setGithub(user.github ?? '');
    setBio(user.bio ?? '');
    setError('');
    setEditing(false);
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      setError('昵称不能为空');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    const result = await updateProfile({
      nickname,
      address,
      github,
      bio,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditing(false);
    setSuccess('资料已保存');
  };

  const handleAvatarPick = () => {
    setError('');
    setSuccess('');
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;

    setUploadingAvatar(true);
    setError('');
    setSuccess('');
    try {
      const avatarUrl = await uploadAvatar(user.id, file);
      const result = await updateProfile({ avatar_url: avatarUrl });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess('头像已更新');
    } catch (err) {
      setError(err instanceof Error ? err.message : '头像上传失败');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-claude-surface-card">
      <div className="bg-claude-surface-dark h-48"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-72 flex-shrink-0">
            <div className="relative w-32">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-claude-primary to-claude-accent-teal flex items-center justify-center ring-4 ring-white shadow-lg overflow-hidden">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
              <button
                type="button"
                onClick={handleAvatarPick}
                disabled={uploadingAvatar}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-claude-success hover:bg-claude-success/90 disabled:opacity-60 rounded-full flex items-center justify-center ring-4 ring-white transition-colors"
                title="更换头像"
                aria-label="更换头像"
              >
                {uploadingAvatar ? (
                  <span className="text-white text-xs">...</span>
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {!editing ? (
              <>
                <div className="flex items-start justify-between gap-3 mt-4">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-claude-ink truncate">
                      {user?.nickname || '用户'}
                    </h1>
                    <p className="text-claude-muted truncate">
                      @{user?.email?.split('@')[0] || 'user'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startEditing}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-claude-md border border-claude-hairline bg-white text-claude-ink hover:bg-claude-surface-card"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    编辑
                  </button>
                </div>

                <p className="text-claude-body mt-3 text-sm whitespace-pre-wrap">
                  {user?.bio?.trim() || '还没有填写个人简介。'}
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-claude-muted">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{user?.address?.trim() || '未填写地址'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-claude-muted">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-claude-muted">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{joinedLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-claude-muted">
                    <Github className="w-4 h-4 shrink-0" />
                    {githubDisplay ? (
                      <a
                        href={
                          githubDisplay.startsWith('http')
                            ? githubDisplay
                            : `https://${githubDisplay}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:text-claude-ink underline-offset-2 hover:underline"
                      >
                        {githubDisplay.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span>未填写 GitHub</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-4 space-y-3 bg-white rounded-claude-lg border border-claude-hairline p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-claude-ink">编辑资料</h2>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="p-1 rounded-claude-md text-claude-muted-soft hover:text-claude-body hover:bg-claude-surface-card"
                    aria-label="取消编辑"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-claude-muted mb-1">昵称</label>
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={40}
                    className="w-full px-3 py-2 rounded-claude-md bg-claude-surface-card border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-sm"
                    placeholder="你的昵称"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-claude-muted mb-1">地址</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    maxLength={80}
                    className="w-full px-3 py-2 rounded-claude-md bg-claude-surface-card border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-sm"
                    placeholder="例如：北京"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-claude-muted mb-1">GitHub</label>
                  <input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    maxLength={120}
                    className="w-full px-3 py-2 rounded-claude-md bg-claude-surface-card border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-sm"
                    placeholder="用户名或完整链接"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-claude-muted mb-1">简介</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                    rows={4}
                    className="w-full px-3 py-2 rounded-claude-md bg-claude-surface-card border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-sm resize-none"
                    placeholder="介绍一下自己"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-3 py-2 rounded-claude-md bg-claude-primary text-white text-sm disabled:opacity-60"
                  >
                    {saving ? '保存中…' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="px-3 py-2 rounded-claude-md border border-claude-hairline text-sm text-claude-body hover:bg-claude-surface-card disabled:opacity-60"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {(error || success) && (
              <div
                className={`mt-3 p-3 rounded-claude-lg text-sm ${
                  error ? 'bg-red-50 text-claude-error' : 'bg-green-50 text-claude-success'
                }`}
              >
                {error || success}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-claude-lg border border-claude-hairline p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-claude-surface-card rounded-claude-md">
                  <div className="text-2xl font-bold text-claude-ink">{userStats.coursesCompleted}</div>
                  <div className="text-sm text-claude-muted">已完成课程</div>
                </div>
                <div className="text-center p-4 bg-claude-surface-card rounded-claude-md">
                  <div className="text-2xl font-bold text-claude-ink">{userStats.certifications}</div>
                  <div className="text-sm text-claude-muted">获得证书</div>
                </div>
                <div className="text-center p-4 bg-claude-surface-card rounded-claude-md">
                  <div className="text-2xl font-bold text-claude-ink">
                    {userStats.avgRating > 0 ? userStats.avgRating : '—'}
                  </div>
                  <div className="text-sm text-claude-muted">我的均分</div>
                </div>
                <div className="text-center p-4 bg-claude-surface-card rounded-claude-md">
                  <div className="text-2xl font-bold text-claude-ink">{userStats.totalReviews}</div>
                  <div className="text-sm text-claude-muted">课程评价</div>
                </div>
                <div className="text-center p-4 bg-claude-surface-card rounded-claude-md">
                  <div className="text-2xl font-bold text-claude-ink">{userStats.favorites}</div>
                  <div className="text-sm text-claude-muted">收藏课程</div>
                </div>
                <div className="text-center p-4 bg-claude-surface-card rounded-claude-md">
                  <div className="text-2xl font-bold text-claude-success">{userStats.streak}</div>
                  <div className="text-sm text-claude-muted">连续学习</div>
                </div>
              </div>
            </div>

            <div className="flex border-b border-claude-hairline mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-claude-primary text-claude-ink'
                    : 'border-transparent text-claude-muted hover:text-claude-ink'
                }`}
              >
                概览
              </button>
              <button
                onClick={() => setActiveTab('ratings')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'ratings'
                    ? 'border-claude-primary text-claude-ink'
                    : 'border-transparent text-claude-muted hover:text-claude-ink'
                }`}
              >
                评价与收藏
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'achievements'
                    ? 'border-claude-primary text-claude-ink'
                    : 'border-transparent text-claude-muted hover:text-claude-ink'
                }`}
              >
                成就
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'activity'
                    ? 'border-claude-primary text-claude-ink'
                    : 'border-transparent text-claude-muted hover:text-claude-ink'
                }`}
              >
                活动记录
              </button>
            </div>

            {activeTab === 'ratings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-claude-lg border border-claude-hairline p-6">
                  <h3 className="text-lg font-semibold text-claude-ink mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    我的课程评价
                  </h3>
                  {myReviews.length === 0 ? (
                    <p className="text-sm text-claude-muted">
                      还没有评价。去{' '}
                      <Link to="/rating" className="text-claude-primary hover:underline">
                        课程评分
                      </Link>{' '}
                      给一门课打分吧。
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {myReviews.map((r) => (
                        <Link
                          key={r.id}
                          to={`/rating/courses/${r.courseId}`}
                          className="block p-3 rounded-claude-md hover:bg-claude-surface-card transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-claude-ink">
                              {r.courseTitle || `课程 ${r.courseId}`}
                            </span>
                            <span className="text-sm text-yellow-600 font-semibold">{r.score} 星</span>
                          </div>
                          {r.content && <p className="text-sm text-claude-body line-clamp-2">{r.content}</p>}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-claude-lg border border-claude-hairline p-6">
                  <h3 className="text-lg font-semibold text-claude-ink mb-4 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-claude-primary" />
                    我的收藏
                  </h3>
                  {favoriteCourses.length === 0 ? (
                    <p className="text-sm text-claude-muted">暂无收藏课程</p>
                  ) : (
                    <div className="space-y-3">
                      {favoriteCourses.map((c) => (
                        <Link
                          key={c.id}
                          to={`/rating/courses/${c.id}`}
                          className="flex items-center gap-3 p-3 rounded-claude-md hover:bg-claude-surface-card transition-colors"
                        >
                          <img
                            src={c.coverImage}
                            alt={c.title}
                            referrerPolicy="no-referrer"
                            className="w-14 h-10 rounded object-cover bg-claude-surface-soft"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-claude-ink truncate">{c.title}</div>
                            <div className="text-sm text-claude-muted">
                              平台分 {c.platformRating.toFixed(1)}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-claude-lg border border-claude-hairline p-6">
                  <h3 className="text-lg font-semibold text-claude-ink mb-4">最近学习</h3>
                  <div className="space-y-3">
                    {['人工智能导论', '数据结构与算法', '机器学习实战', 'Python编程入门'].map(
                      (course, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 hover:bg-claude-surface-card rounded-claude-md transition-colors"
                        >
                          <div className="w-12 h-12 rounded-claude-md bg-gradient-to-br from-claude-primary/20 to-claude-accent-teal/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-claude-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-claude-ink">{course}</div>
                            <div className="text-sm text-claude-muted">
                              进行中 · {Math.floor(Math.random() * 60 + 20)}%
                            </div>
                          </div>
                          <div className="text-sm text-claude-muted-soft">
                            {Math.floor(Math.random() * 5 + 1)}小时前
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-claude-lg border border-claude-hairline p-6">
                  <h3 className="text-lg font-semibold text-claude-ink mb-4">学习进度</h3>
                  <div className="space-y-4">
                    {[
                      { subject: '计算机科学', progress: 75 },
                      { subject: '数学', progress: 60 },
                      { subject: '物理', progress: 45 },
                      { subject: '经济学', progress: 30 },
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-claude-ink">{item.subject}</span>
                          <span className="text-claude-muted">{item.progress}%</span>
                        </div>
                        <div className="w-full bg-claude-hairline rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-claude-primary to-claude-accent-teal h-2 rounded-full transition-all duration-500"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="bg-white rounded-claude-lg border border-claude-hairline p-6">
                <h3 className="text-lg font-semibold text-claude-ink mb-4">成就徽章</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-claude-lg border-2 transition-all ${
                        item.unlocked
                          ? 'border-claude-primary/50 bg-claude-primary/5'
                          : 'border-claude-hairline bg-claude-surface-card opacity-50'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                          item.unlocked
                            ? 'bg-gradient-to-br from-claude-primary to-claude-accent-teal'
                            : 'bg-claude-hairline'
                        }`}
                      >
                        <item.icon
                          className={`w-6 h-6 ${item.unlocked ? 'text-white' : 'text-claude-muted'}`}
                        />
                      </div>
                      <div
                        className={`font-medium mb-1 ${item.unlocked ? 'text-claude-ink' : 'text-claude-muted'}`}
                      >
                        {item.title}
                      </div>
                      <div className="text-sm text-claude-muted">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white rounded-claude-lg border border-claude-hairline p-6">
                <h3 className="text-lg font-semibold text-claude-ink mb-4">活动时间线</h3>
                <div className="space-y-4">
                  {recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 hover:bg-claude-surface-card rounded-claude-md transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.type === 'completed'
                            ? 'bg-green-50 text-claude-success'
                            : item.type === 'review'
                              ? 'bg-blue-50 text-claude-accent-teal'
                              : item.type === 'certified'
                                ? 'bg-yellow-100 text-yellow-600'
                                : item.type === 'started'
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-amber-50 text-claude-accent-amber'
                        }`}
                      >
                        {item.type === 'completed' && <CheckCircle className="w-5 h-5" />}
                        {item.type === 'review' && <Star className="w-5 h-5" />}
                        {item.type === 'certified' && <Award className="w-5 h-5" />}
                        {item.type === 'started' && <BookOpen className="w-5 h-5" />}
                        {item.type === 'quiz' && <TrendingUp className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-claude-ink">{item.title}</div>
                        <div className="text-sm text-claude-body">{item.detail}</div>
                        <div className="text-xs text-claude-muted-soft mt-1">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function formatJoinedAt(iso: string | null | undefined): string {
  if (!iso) return '加入时间未知';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '加入时间未知';
  return `加入于 ${date.getFullYear()}年${date.getMonth() + 1}月`;
}

export default Profile;
