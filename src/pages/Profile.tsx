import { useState } from 'react';
import { User, Calendar, MapPin, Mail, Github, Trophy, BookOpen, Star, TrendingUp, Award, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Profile = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const userStats = {
    coursesCompleted: 24,
    certifications: 8,
    avgRating: 4.8,
    totalReviews: 156,
    learningDays: 180,
    streak: 15
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 h-48"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-morandi-pink to-morandi-blue flex items-center justify-center ring-4 ring-white shadow-lg">
                <User className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-white">
                <span className="text-white text-sm">+</span>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mt-4">{user?.nickname || '测试用户'}</h1>
            <p className="text-gray-500">@{user?.email?.split('@')[0] || 'testuser'}</p>
            
            <p className="text-gray-600 mt-3 text-sm">
              热爱学习，追求卓越。致力于成为全栈工程师，探索人工智能的无限可能。
            </p>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>北京</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>加入于 2024年1月</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Github className="w-4 h-4" />
                <span>github.com/testuser</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{userStats.coursesCompleted}</div>
                  <div className="text-sm text-gray-500">已完成课程</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{userStats.certifications}</div>
                  <div className="text-sm text-gray-500">获得证书</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{userStats.avgRating}</div>
                  <div className="text-sm text-gray-500">平均评分</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{userStats.totalReviews}</div>
                  <div className="text-sm text-gray-500">发表评论</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{userStats.learningDays}</div>
                  <div className="text-sm text-gray-500">学习天数</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{userStats.streak}</div>
                  <div className="text-sm text-gray-500">连续学习</div>
                </div>
              </div>
            </div>
            
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-morandi-pink text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                概览
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'achievements' 
                    ? 'border-morandi-pink text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                成就
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'activity' 
                    ? 'border-morandi-pink text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                活动记录
              </button>
            </div>
            
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">最近学习</h3>
                  <div className="space-y-3">
                    {['人工智能导论', '数据结构与算法', '机器学习实战', 'Python编程入门'].map((course, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-morandi-pink/20 to-morandi-blue/20 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-morandi-pink" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{course}</div>
                          <div className="text-sm text-gray-500">进行中 · {Math.floor(Math.random() * 60 + 20)}%</div>
                        </div>
                        <div className="text-sm text-gray-400">{Math.floor(Math.random() * 5 + 1)}小时前</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">学习进度</h3>
                  <div className="space-y-4">
                    {[
                      { subject: '计算机科学', progress: 75 },
                      { subject: '数学', progress: 60 },
                      { subject: '物理', progress: 45 },
                      { subject: '经济学', progress: 30 },
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{item.subject}</span>
                          <span className="text-gray-500">{item.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-morandi-pink to-morandi-blue h-2 rounded-full transition-all duration-500"
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">成就徽章</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        item.unlocked 
                          ? 'border-morandi-pink/50 bg-morandi-pink/5' 
                          : 'border-gray-200 bg-gray-50 opacity-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                        item.unlocked 
                          ? 'bg-gradient-to-br from-morandi-pink to-morandi-blue' 
                          : 'bg-gray-300'
                      }`}>
                        <item.icon className={`w-6 h-6 ${item.unlocked ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div className={`font-medium mb-1 ${item.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'activity' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">活动时间线</h3>
                <div className="space-y-4">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.type === 'completed' ? 'bg-green-100 text-green-600' :
                        item.type === 'review' ? 'bg-blue-100 text-blue-600' :
                        item.type === 'certified' ? 'bg-yellow-100 text-yellow-600' :
                        item.type === 'started' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {item.type === 'completed' && <CheckCircle className="w-5 h-5" />}
                        {item.type === 'review' && <Star className="w-5 h-5" />}
                        {item.type === 'certified' && <Award className="w-5 h-5" />}
                        {item.type === 'started' && <BookOpen className="w-5 h-5" />}
                        {item.type === 'quiz' && <TrendingUp className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-600">{item.detail}</div>
                        <div className="text-xs text-gray-400 mt-1">{item.time}</div>
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

export default Profile;