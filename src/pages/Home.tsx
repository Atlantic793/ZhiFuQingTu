import { Link } from 'react-router-dom';
import { Cpu, Star, Briefcase, Users, Award, BookOpen } from 'lucide-react';
const Home = () => {
 return (<div className="pt-16">
 <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-morandi-pink/20 via-morandi-blue/10 to-morandi-green/20"/>
 <div className="absolute top-20 left-10 w-64 h-64 bg-morandi-pink/20 rounded-full blur-3xl"/>
 <div className="absolute bottom-20 right-10 w-80 h-80 bg-morandi-blue/20 rounded-full blur-3xl"/>
 
 <div className="relative z-10 text-center px-4">
 <h1 className="text-4xl md:text-6xl font-bold text-morandi-text font-display mb-6 animate-slide-up">
 智赋青途
 </h1>
 <p className="text-lg md:text-xl text-morandi-text/70 mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
 人工智能赋能大学生职业发展平台
 </p>
 
 <div className="flex flex-wrap justify-center gap-8 mb-16">
 <div className="flex flex-col items-center">
 <div className="w-16 h-16 rounded-2xl bg-morandi-pink/20 flex items-center justify-center mb-2">
 <Users className="w-8 h-8 text-morandi-pink"/>
 </div>
 <span className="text-2xl font-bold text-morandi-text">5000+</span>
 <span className="text-sm text-morandi-text/60">注册用户</span>
 </div>
 <div className="flex flex-col items-center">
 <div className="w-16 h-16 rounded-2xl bg-morandi-blue/20 flex items-center justify-center mb-2">
 <BookOpen className="w-8 h-8 text-morandi-blue"/>
 </div>
 <span className="text-2xl font-bold text-morandi-text">120+</span>
 <span className="text-sm text-morandi-text/60">精品课程</span>
 </div>
 <div className="flex flex-col items-center">
 <div className="w-16 h-16 rounded-2xl bg-morandi-green/20 flex items-center justify-center mb-2">
 <Award className="w-8 h-8 text-morandi-green"/>
 </div>
 <span className="text-2xl font-bold text-morandi-text">98%</span>
 <span className="text-sm text-morandi-text/60">好评率</span>
 </div>
 </div>
 </div>
 </section>

 <section className="py-20 px-4">
 <div className="max-w-6xl mx-auto">
 <h2 className="text-3xl font-bold text-morandi-text text-center mb-12">核心功能模块</h2>
 
 <div className="grid md:grid-cols-3 gap-8">
 <Link to="/agent" className="bg-white rounded-3xl p-8 shadow-soft card-soft">
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-morandi-pink to-morandi-purple flex items-center justify-center mb-6">
 <Cpu className="w-8 h-8 text-white"/>
 </div>
 <h3 className="text-xl font-bold text-morandi-text mb-3">多学科AI Agent</h3>
 <p className="text-morandi-text/70">
 用户选择所在学院与专业后，平台自动推送该领域高频AI工具组合，帮助用户进行学术探究、创意领航、升学就业规划。
 </p>
 </Link>
 
 <Link to="/rating" className="bg-white rounded-3xl p-8 shadow-soft card-soft">
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-morandi-yellow to-morandi-green flex items-center justify-center mb-6">
 <Star className="w-8 h-8 text-white"/>
 </div>
 <h3 className="text-xl font-bold text-morandi-text mb-3">流动性评分体系</h3>
 <p className="text-morandi-text/70">
 构建教程资源池，由各专业学生对视频/文章进行评分、点赞、纠错，生成动态排行榜，助力优质内容传播。
 </p>
 </Link>
 
 <Link to="/training" className="bg-white rounded-3xl p-8 shadow-soft card-soft">
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-morandi-blue to-morandi-green flex items-center justify-center mb-6">
 <Briefcase className="w-8 h-8 text-white"/>
 </div>
 <h3 className="text-xl font-bold text-morandi-text mb-3">职业导向实训模块</h3>
 <p className="text-morandi-text/70">
 为用户提供场景化学习与模拟任务挑战，通过该模块学习相关课程，完成虚拟任务，掌握核心竞争力。
 </p>
 </Link>
 </div>
 </div>
 </section>

 <section className="py-20 px-4 bg-morandi-light/50">
 <div className="max-w-6xl mx-auto">
 <h2 className="text-3xl font-bold text-morandi-text text-center mb-12">合作伙伴</h2>
 <div className="flex flex-wrap justify-center gap-12 items-center">
 <div className="text-2xl font-bold text-morandi-text/50">KPMG</div>
 <div className="text-2xl font-bold text-morandi-text/50">东方财富</div>
 <div className="text-2xl font-bold text-morandi-text/50">字节跳动</div>
 <div className="text-2xl font-bold text-morandi-text/50">腾讯</div>
 </div>
 </div>
 </section>

 <footer className="py-8 px-4 bg-morandi-text text-white">
 <div className="max-w-6xl mx-auto text-center">
 <p className="text-white/80">智赋青途 - 人工智能赋能大学生职业发展平台</p>
 <p className="text-white/60 text-sm mt-2">© 2024 ZhiFuQingTu. All rights reserved.</p>
 </div>
 </footer>
 </div>);
};
export default Home;
