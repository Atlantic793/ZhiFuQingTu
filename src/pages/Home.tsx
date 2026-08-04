import { Link } from 'react-router-dom';
import { Cpu, Star, Briefcase, Users, Award, BookOpen, ArrowRight } from 'lucide-react';

const StatItem = ({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="w-14 h-14 rounded-kraken-lg bg-kraken-primary-subtle flex items-center justify-center mb-3">
      <Icon className="w-7 h-7 text-kraken-primary" />
    </div>
    <span className="text-3xl font-bold text-kraken-ink tracking-tight">{value}</span>
    <span className="text-sm text-kraken-neutral mt-1">{label}</span>
  </div>
);

const FeatureCard = ({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <Link
    to={to}
    className="group rounded-kraken-xl p-8 bg-white shadow-kraken transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
  >
    <div className="w-12 h-12 rounded-kraken-lg bg-kraken-primary-subtle flex items-center justify-center mb-6">
      <Icon className="w-6 h-6 text-kraken-primary" />
    </div>
    <h3 className="text-xl font-bold text-kraken-ink mb-3 tracking-tight">{title}</h3>
    <p className="text-kraken-neutral leading-relaxed">{description}</p>
    <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-kraken-primary group-hover:gap-2.5 transition-all">
      了解更多 <ArrowRight className="w-4 h-4" />
    </div>
  </Link>
);

const Home = () => {
  return (
    <div>
      {/* Hero — light purple-gray background, left-right layout */}
      <section className="min-h-screen flex items-center px-4 pt-16 pb-8 bg-kraken-canvas relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-kraken-half pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(113,50,245,0.22) 0%, rgba(113,50,245,0.08) 40%, transparent 65%)' }} />
        <div className="absolute -bottom-16 -left-16 w-[320px] h-[320px] rounded-kraken-half pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(87,65,216,0.2) 0%, rgba(87,65,216,0.06) 35%, transparent 60%)' }} />
        <div className="absolute top-1/3 left-[55%] w-[200px] h-[200px] rounded-kraken-half pointer-events-none"
          style={{ background: 'radial-gradient(circle at 40% 35%, rgba(113,50,245,0.25) 0%, transparent 55%)' }} />

        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center py-16 md:py-24 relative z-10">
          {/* Left content */}
          <div className="text-center md:text-left">
            <h1
              className="text-5xl md:text-6xl font-bold text-kraken-ink mb-6 leading-tight"
              style={{ letterSpacing: '-1px', lineHeight: '1.17' }}
            >
              人工智能赋能
              <br />
              <span className="text-kraken-primary">大学生职业发展</span>
            </h1>
            <p className="text-lg text-kraken-neutral mb-10 max-w-lg mx-auto md:mx-0" style={{ lineHeight: '1.38' }}>
              AI 驱动的学科探索、课程评分与职业实训，一站式助力你的成长之路
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                to="/agent"
                className="h-12 px-8 rounded-kraken bg-kraken-primary text-white font-semibold inline-flex items-center gap-2 hover:bg-kraken-primary-deep transition-colors"
              >
                开始探索 <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/rating"
                className="h-12 px-8 rounded-kraken border border-kraken-primary-dark text-kraken-primary-dark font-semibold inline-flex items-center hover:bg-kraken-primary-subtle transition-colors"
              >
                课程评分
              </Link>
            </div>
          </div>

          {/* Right: stats grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-kraken-xl p-8 shadow-kraken flex flex-col items-center text-center">
              <Users className="w-8 h-8 text-kraken-primary mb-3" />
              <span className="text-3xl font-bold text-kraken-ink tracking-tight">5000+</span>
              <span className="text-sm text-kraken-neutral mt-1">注册用户</span>
            </div>
            <div className="bg-white rounded-kraken-xl p-8 shadow-kraken flex flex-col items-center text-center">
              <BookOpen className="w-8 h-8 text-kraken-primary mb-3" />
              <span className="text-3xl font-bold text-kraken-ink tracking-tight">120+</span>
              <span className="text-sm text-kraken-neutral mt-1">精品课程</span>
            </div>
            <div className="bg-white rounded-kraken-xl p-8 shadow-kraken flex flex-col items-center text-center">
              <Award className="w-8 h-8 text-kraken-primary mb-3" />
              <span className="text-3xl font-bold text-kraken-ink tracking-tight">98%</span>
              <span className="text-sm text-kraken-neutral mt-1">好评率</span>
            </div>
            <div className="bg-white rounded-kraken-xl p-8 shadow-kraken flex flex-col items-center text-center">
              <Star className="w-8 h-8 text-kraken-success mb-3" />
              <span className="text-3xl font-bold text-kraken-ink tracking-tight">4.8</span>
              <span className="text-sm text-kraken-neutral mt-1">用户评分</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-4 py-20 md:py-28 bg-kraken-canvas">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-kraken-ink mb-4"
              style={{ letterSpacing: '-0.5px', lineHeight: '1.22' }}
            >
              探索<span className="text-kraken-primary">智能学习</span>的无限可能
            </h2>
            <p className="text-lg text-kraken-neutral max-w-xl mx-auto" style={{ lineHeight: '1.38' }}>
              AI 驱动的学科探索、课程评分与职业实训，一站式助力你的成长之路
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              to="/agent"
              icon={Cpu}
              title="多学科AI Agent"
              description="自动推送高频AI工具组合，学术探究、创意领航、升学就业规划。"
            />
            <FeatureCard
              to="/rating"
              icon={Star}
              title="流动性评分体系"
              description="学生评分、点赞、纠错，动态排行榜助力优质内容传播。"
            />
            <FeatureCard
              to="/training"
              icon={Briefcase}
              title="职业导向实训模块"
              description="场景化学习与模拟任务挑战，掌握核心竞争力。"
            />
          </div>
        </div>
      </section>

      {/* Partners + Footer */}
      <section className="px-4 py-20 md:py-28 bg-kraken-canvas">
        <div className="max-w-6xl mx-auto bg-white rounded-kraken-xl p-8 md:p-16 text-center shadow-kraken">
          <h2
            className="text-3xl font-bold text-kraken-ink mb-4"
            style={{ letterSpacing: '-0.5px' }}
          >
            合作伙伴
          </h2>
          <p className="text-kraken-neutral mb-12 max-w-xl mx-auto">
            与行业领先企业合作，为学生提供最前沿的职业发展资源
          </p>
          <div className="flex flex-wrap justify-center gap-12 items-center">
            <span className="text-2xl font-bold text-kraken-muted">KPMG</span>
            <span className="text-2xl font-bold text-kraken-muted">东方财富</span>
            <span className="text-2xl font-bold text-kraken-muted">字节跳动</span>
            <span className="text-2xl font-bold text-kraken-muted">腾讯</span>
          </div>

          <div className="mt-16 pt-8 border-t border-kraken-border text-center">
            <p className="text-kraken-neutral">智赋青途 - 人工智能赋能大学生职业发展平台</p>
            <p className="mt-2 text-kraken-muted text-sm">© 2024 ZhiFuQingTu. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
