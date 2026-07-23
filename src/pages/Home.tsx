import { Link } from 'react-router-dom';
import { Bot, Star, Briefcase, ArrowRight, Sparkles, BookOpen, Users, TrendingUp } from 'lucide-react';
const Home = () => {

  const modules = [
    {
      id: 'agent',
      title: '多学科AI Agent',
      description: '选择所在学科后，平台自动推送该领域专属AI工具组合，帮助您进行学术探究、创赛领航、升学就业规划',
      icon: Bot,
      color: 'from-morandi-blue to-morandi-pink',
      bgColor: 'bg-morandi-blue/10',
    },
    {
      id: 'rating',
      title: '流动性评分系统',
      description: '构建教程资源池，由各专业学生对视频/文章进行评分、点赞、纠错，生成动态排行榜',
      icon: Star,
      color: 'from-morandi-yellow to-morandi-coral',
      bgColor: 'bg-morandi-yellow/10',
    },
    {
      id: 'training',
      title: '职业导向实训模块',
      description: '为用户提供场景化学习与模拟任务挑战，通过该模块学习相关课程，掌握核心竞争力',
      icon: Briefcase,
      color: 'from-morandi-green to-morandi-blue',
      bgColor: 'bg-morandi-green/10',
    },
  ];

  const stats = [
    { icon: BookOpen, value: '100+', label: '优质课程' },
    { icon: Users, value: '5000+', label: '活跃用户' },
    { icon: TrendingUp, value: '98%', label: '好评率' },
  ];

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-morandi-pink/30 via-morandi-blue/20 to-morandi-green/20 rounded-3xl p-8 md:p-16 mb-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-morandi-pink/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-morandi-blue/20 rounded-full blur-3xl" />
        
        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-soft mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-morandi-pink" />
            <span className="text-sm font-medium text-morandi-text">AI赋能教育新体验</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-morandi-text font-display mb-6 animate-slide-up">
            智赋青途
          </h1>
          <p className="text-lg md:text-xl text-morandi-text/80 max-w-3xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            融合AI技术与教育理念，为高校学生提供个性化学习体验、教学质量反馈和职业技能培养
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/agent"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-morandi-pink to-morandi-blue text-white font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              开始学习
            </Link>
            <Link
              to="/training"
              className="px-8 py-4 rounded-xl bg-white/80 backdrop-blur-sm text-morandi-text font-medium hover:bg-white hover:shadow-lg transition-all"
            >
              探索课程
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mb-16">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-soft text-center card-soft animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-morandi-pink/20 to-morandi-blue/20 flex items-center justify-center">
              <stat.icon className="w-7 h-7 text-morandi-pink" />
            </div>
            <div className="text-3xl font-bold text-morandi-text mb-2">{stat.value}</div>
            <div className="text-morandi-text/60">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-morandi-text font-display mb-4">核心功能模块</h2>
          <p className="text-morandi-text/70">选择适合您的学习路径，开启AI赋能之旅</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <Link
              key={module.id}
              to={`/${module.id}`}
              className={`${module.bgColor} rounded-3xl p-8 card-soft group animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                <module.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-morandi-text mb-4 font-display">
                {module.title}
              </h3>
              <p className="text-morandi-text/70 mb-6 leading-relaxed">
                {module.description}
              </p>
              <div className="flex items-center gap-2 text-morandi-pink font-medium group-hover:gap-3 transition-all">
                <span>开始探索</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-morandi-pink/10 via-morandi-blue/10 to-morandi-green/10 rounded-3xl p-8 md:p-12 mb-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-morandi-text font-display mb-4">
              为什么选择我们？
            </h2>
            <p className="text-morandi-text/70 mb-6">
              我们致力于打造一个全新的学习生态，让AI技术真正服务于每一位学习者。
            </p>
            <ul className="space-y-3">
              {['个性化AI学习助手', '真实的教学质量反馈', '职业导向的技能培养', '创新的学习体验'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-morandi-pink/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-morandi-pink">{i + 1}</span>
                  </div>
                  <span className="text-morandi-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="w-full aspect-square rounded-2xl overflow-hidden">
              <img
                src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20education%20technology%20AI%20learning%20soft%20morandi%20colors%20minimal%20illustration&image_size=square_hd"
                alt="教育科技"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-morandi-green/30 rounded-full blur-2xl" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-morandi-pink/30 rounded-full blur-xl" />
          </div>
        </div>
      </section>

      <footer className="mt-8 text-center py-8 border-t border-morandi-light">
        <p className="text-morandi-text/50 text-sm">
          © 2024 智赋青途 - AI赋能教育平台
        </p>
      </footer>
    </div>
  );
};

export default Home;
