import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('请填写邮箱和密码');
      setLoading(false);
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('邮箱或密码错误');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-morandi-pink/20 via-morandi-blue/20 to-morandi-green/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-morandi-pink to-morandi-blue flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-morandi-text font-display">智赋青途</h1>
            <p className="text-morandi-text/60 mt-2">AI赋能教育新体验</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-morandi-text mb-2">邮箱</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-morandi-text/50 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-morandi-light/50 border border-morandi-light focus:border-morandi-pink focus:bg-white outline-none transition-all text-morandi-text"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-morandi-text mb-2">密码</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-morandi-text/50 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-morandi-light/50 border border-morandi-light focus:border-morandi-pink focus:bg-white outline-none transition-all text-morandi-text"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-morandi-text/50 hover:text-morandi-pink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-morandi-coral/20 text-morandi-coral text-sm flex items-center gap-2">
                <span className="text-xl">&times;</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-morandi-pink to-morandi-blue text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>登录</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-morandi-text/60 text-sm">
              还没有账号？
              <Link to="/register" className="text-morandi-pink font-medium hover:underline ml-1">
                立即注册
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-morandi-light">
            <p className="text-center text-morandi-text/40 text-xs">
              测试账号：test@example.com / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
