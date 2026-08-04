import { Link } from 'react-router-dom';
import { Cpu, Star, Briefcase, Users, Award, BookOpen } from 'lucide-react';
const Home = () => {
 return (<div className="pt-16">
 <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
 <div className="absolute inset-0 bg-claude-canvas"/>
 <div className="absolute inset-4 rounded-claude-xl bg-gradient-to-br from-claude-primary/30 via-claude-primary/15 to-claude-surface-soft/40"/>

 <div className="relative z-10 text-center px-4">
 <h1 className="text-4xl md:text-6xl font-bold text-claude-ink font-display tracking-tight mb-6 animate-slide-up">
 智赋青途
 </h1>
 <p className="text-lg md:text-xl text-claude-muted mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
 人工智能赋能大学生职业发展平台
 </p>

 <div className="flex flex-wrap justify-center gap-8 mb-16">
 <div className="flex flex-col items-center">
 <div className="w-16 h-16 rounded-claude-lg bg-claude-surface-card flex items-center justify-center mb-2">
 <Users className="w-8 h-8 text-claude-ink"/>
 </div>
 <span className="text-2xl font-bold text-claude-ink">5000+</span>
 <span className="text-sm text-claude-muted-soft">注册用户</span>
 </div>
 <div className="flex flex-col items-center">
 <div className="w-16 h-16 rounded-claude-lg bg-claude-surface-card flex items-center justify-center mb-2">
 <BookOpen className="w-8 h-8 text-claude-ink"/>
 </div>
 <span className="text-2xl font-bold text-claude-ink">120+</span>
 <span className="text-sm text-claude-muted-soft">精品课程</span>
 </div>
 <div className="flex flex-col items-center">
 <div className="w-16 h-16 rounded-claude-lg bg-claude-surface-card flex items-center justify-center mb-2">
 <Award className="w-8 h-8 text-claude-ink"/>
 </div>
 <span className="text-2xl font-bold text-claude-ink">98%</span>
 <span className="text-sm text-claude-muted-soft">好评率</span>
 </div>
 </div>
 </div>
 </section>

 <section className="py-20 px-4">
 <div className="max-w-6xl mx-auto">
 <h2 className="text-3xl font-bold text-claude-ink text-center mb-12">核心功能模块</h2>

 <div className="grid md:grid-cols-3 gap-8">
 <Link to="/agent" className="bg-white rounded-claude-xl p-8 card-soft">
 <div className="w-16 h-16 rounded-claude-lg bg-claude-surface-card text-claude-ink flex items-center justify-center mb-6">
 <Cpu className="w-8 h-8"/>
 </div>
 <h3 className="text-xl font-bold text-claude-ink mb-3">多学科AI Agent</h3>
 <p className="text-claude-muted">
 用户选择所在学院与专业后，平台自动推送该领域高频AI工具组合，帮助用户进行学术探究、创意领航、升学就业规划。
 </p>
 </Link>

 <Link to="/rating" className="bg-white rounded-claude-xl p-8 card-soft">
 <div className="w-16 h-16 rounded-claude-lg bg-claude-surface-card text-claude-ink flex items-center justify-center mb-6">
 <Star className="w-8 h-8"/>
 </div>
 <h3 className="text-xl font-bold text-claude-ink mb-3">流动性评分体系</h3>
 <p className="text-claude-muted">
 构建教程资源池，由各专业学生对视频/文章进行评分、点赞、纠错，生成动态排行榜，助力优质内容传播。
 </p>
 </Link>

 <Link to="/training" className="bg-white rounded-claude-xl p-8 card-soft">
 <div className="w-16 h-16 rounded-claude-lg bg-claude-surface-card text-claude-ink flex items-center justify-center mb-6">
 <Briefcase className="w-8 h-8"/>
 </div>
 <h3 className="text-xl font-bold text-claude-ink mb-3">职业导向实训模块</h3>
 <p className="text-claude-muted">
 为用户提供场景化学习与模拟任务挑战，通过该模块学习相关课程，完成虚拟任务，掌握核心竞争力。
 </p>
 </Link>
 </div>
 </div>
 </section>

 <section className="py-20 px-4 bg-claude-surface-card">
 <div className="max-w-6xl mx-auto">
 <h2 className="text-3xl font-bold text-claude-ink text-center mb-12">合作伙伴</h2>
 <div className="flex flex-wrap justify-center gap-12 items-center">
 <div className="text-2xl font-bold text-claude-muted">KPMG</div>
 <div className="text-2xl font-bold text-claude-muted">东方财富</div>
 <div className="text-2xl font-bold text-claude-muted">字节跳动</div>
 <div className="text-2xl font-bold text-claude-muted">腾讯</div>
 </div>
 </div>
 </section>

 <footer className="py-4 px-4 bg-claude-surface-dark text-claude-on-dark-soft">
 <div className="max-w-6xl mx-auto text-center">
 <p>智赋青途 - 人工智能赋能大学生职业发展平台</p>
 <p className="mt-2">© 2024 ZhiFuQingTu. All rights reserved.</p>
 </div>
 </footer>
 </div>);
};
export default Home;
