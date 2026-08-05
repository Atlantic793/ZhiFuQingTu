import { Link } from 'react-router-dom';
import { Cpu, Star, Briefcase, Users, Award, BookOpen } from 'lucide-react';

/* Claymorphism decorative shapes — CSS-simulated 3D plasticine blobs */
const ClayBlob = ({ className, color }: { className: string; color: string }) => (
  <div className={`absolute pointer-events-none ${className}`}
    style={{
      background: `radial-gradient(circle at 40% 35%, ${color} 0%, ${color}00 70%)`,
      boxShadow: 'inset 0 -8px 20px rgba(0,0,0,0.12), inset 0 4px 14px rgba(255,255,255,0.8), 0 6px 20px rgba(0,0,0,0.07)',
    }}
  />
);

const Home = () => {
  return (
    <div>
      {/* Hero — baby blue + clay blobs */}
      <section className="min-h-screen flex flex-col justify-center px-4 pt-16 pb-8 relative overflow-hidden">
        {/* Clay blobs — distinct macaron colors */}
        <ClayBlob color="#fcc8a8" className="top-[10%] -left-8 w-48 h-48 rounded-[60%_40%_50%_50%]" />
        <ClayBlob color="#f8e8a0" className="top-[20%] right-[10%] w-36 h-36 rounded-[50%_60%_40%_50%]" />
        <ClayBlob color="#d4b8e0" className="bottom-[15%] left-[20%] w-40 h-40 rounded-[45%_55%_55%_45%]" />
        <ClayBlob color="#a8e0c8" className="top-[40%] right-[25%] w-24 h-24 rounded-[55%_45%_40%_60%]" />

        <div className="max-w-6xl mx-auto w-full bg-white/10 backdrop-blur-sm rounded-[32px] p-8 md:p-20 text-center relative z-10"
          style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.06)' }}>
          <h1
            className="text-6xl md:text-8xl font-bold text-claude-ink tracking-tight mb-6"
            style={{ letterSpacing: '-2.5px', fontWeight: 500 }}
          >
            智赋青途
          </h1>
          <p className="text-xl md:text-2xl text-claude-muted mb-16 max-w-2xl mx-auto">
            人工智能赋能大学生职业发展平台
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-[24px] bg-white flex items-center justify-center mb-3"
                style={{ boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.04), inset 0 2px 6px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.04)' }}>
                <Users className="w-10 h-10 text-claude-ink" />
              </div>
              <span className="text-3xl font-bold text-claude-ink">5000+</span>
              <span className="text-sm text-claude-muted-soft mt-1">注册用户</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-[24px] bg-white flex items-center justify-center mb-3"
                style={{ boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.04), inset 0 2px 6px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.04)' }}>
                <BookOpen className="w-10 h-10 text-claude-ink" />
              </div>
              <span className="text-3xl font-bold text-claude-ink">120+</span>
              <span className="text-sm text-claude-muted-soft mt-1">精品课程</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-[24px] bg-white flex items-center justify-center mb-3"
                style={{ boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.04), inset 0 2px 6px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.04)' }}>
                <Award className="w-10 h-10 text-claude-ink" />
              </div>
              <span className="text-3xl font-bold text-claude-ink">98%</span>
              <span className="text-sm text-claude-muted-soft mt-1">好评率</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards — alternating layout, mint bg */}
      <section className="py-section px-4 relative overflow-hidden">
        <ClayBlob color="#a8d8ea" className="top-[5%] -right-4 w-44 h-44 rounded-[50%_55%_45%_50%]" />
        <ClayBlob color="#f8b8c8" className="bottom-[10%] left-[5%] w-32 h-32 rounded-[55%_40%_55%_45%]" />

        <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-sm rounded-[32px] p-8 md:p-16 relative z-10 flex flex-col items-center"
          style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.06)' }}>

          {/* Title with colored keyword */}
          <h2 className="text-4xl md:text-5xl font-bold text-claude-ink text-center mb-4 leading-tight"
            style={{ fontWeight: 500, letterSpacing: '-1px' }}>
            探索<span className="text-[#5fa895]">智能学习</span>的无限可能
          </h2>
          <p className="text-center text-claude-muted text-lg mb-16 max-w-[480px]" style={{ lineHeight: 1.6 }}>
            AI 驱动的学科探索、课程评分与职业实训，一站式助力你的成长之路
          </p>

          <div className="grid md:grid-cols-3 gap-3 w-full">
            <Link
              to="/agent"
              className="group rounded-[24px] p-8 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: '#fcc8a8', boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.05), inset 0 2px 8px rgba(255,255,255,0.7), 0 3px 14px rgba(0,0,0,0.06)' }}
            >
              <div className="w-14 h-14 rounded-[16px] bg-white/60 flex items-center justify-center mb-6"
                style={{ boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.6)' }}>
                <Cpu className="w-7 h-7 text-claude-ink" />
              </div>
              <h3 className="text-xl font-semibold text-claude-ink mb-3">多学科AI Agent</h3>
              <p className="text-claude-muted text-sm" style={{ lineHeight: 1.6 }}>
                自动推送高频AI工具组合，学术探究、创意领航、升学就业规划。
              </p>
            </Link>

            <Link
              to="/rating"
              className="group rounded-[24px] p-8 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: '#f8e8a0', boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.05), inset 0 2px 8px rgba(255,255,255,0.7), 0 3px 14px rgba(0,0,0,0.06)' }}
            >
              <div className="w-14 h-14 rounded-[16px] bg-white/60 flex items-center justify-center mb-6"
                style={{ boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.6)' }}>
                <Star className="w-7 h-7 text-claude-ink" />
              </div>
              <h3 className="text-xl font-semibold text-claude-ink mb-3">流动性评分体系</h3>
              <p className="text-claude-muted text-sm" style={{ lineHeight: 1.6 }}>
                学生评分、点赞、纠错，动态排行榜助力优质内容传播。
              </p>
            </Link>

            <Link
              to="/training"
              className="group rounded-[24px] p-8 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: '#f8b8c8', boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.05), inset 0 2px 8px rgba(255,255,255,0.7), 0 3px 14px rgba(0,0,0,0.06)' }}
            >
              <div className="w-14 h-14 rounded-[16px] bg-white/60 flex items-center justify-center mb-6"
                style={{ boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.6)' }}>
                <Briefcase className="w-7 h-7 text-claude-ink" />
              </div>
              <h3 className="text-xl font-semibold text-claude-ink mb-3">职业导向实训模块</h3>
              <p className="text-claude-muted text-sm" style={{ lineHeight: 1.6 }}>
                场景化学习与模拟任务挑战，掌握核心竞争力。
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-24" />

      {/* Trust + Footer — lavender bg + clay blobs */}
      <section className="py-section px-4 relative overflow-hidden">
        <ClayBlob color="#a8e0c8" className="top-[10%] left-[10%] w-36 h-36 rounded-[50%_45%_55%_50%]" />
        <ClayBlob color="#f8e8a0" className="bottom-[5%] right-[8%] w-28 h-28 rounded-[45%_55%_50%_50%]" />

        <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-sm rounded-[32px] p-8 md:p-16 text-center relative z-10"
          style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.06)' }}>
          <h2
            className="text-3xl font-bold text-claude-ink mb-4"
            style={{ fontWeight: 500, letterSpacing: '-1px' }}
          >
            合作伙伴
          </h2>
          <p className="text-claude-muted mb-12 max-w-xl mx-auto">
            与行业领先企业合作，为学生提供最前沿的职业发展资源
          </p>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <div className="text-2xl font-bold text-claude-muted">KPMG</div>
            <div className="text-2xl font-bold text-claude-muted">东方财富</div>
            <div className="text-2xl font-bold text-claude-muted">字节跳动</div>
            <div className="text-2xl font-bold text-claude-muted">腾讯</div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/40 text-center">
            <p className="text-claude-muted">智赋青途 - 人工智能赋能大学生职业发展平台</p>
            <p className="mt-2 text-claude-muted-soft text-sm">© 2024 ZhiFuQingTu. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
