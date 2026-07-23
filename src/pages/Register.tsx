import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Lock, Eye, EyeOff, ArrowRight, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Register = () => {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !nickname || !password || !confirmPassword) {
      setError('请填写所有字段');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少6位');
      setLoading(false);
      return;
    }

    const success = await register(email, nickname, password);
    if (success) {
      navigate('/');
    } else {
      setError('该邮箱已被注册');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-morandi-pink/20 via-morandi-blue/20 to-morandi-green/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-morandi-green to-morandi-blue flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-morandi-text font-display">智赋青途</h1>
            <p className="text-morandi-text/60 mt-2">创建您的学习账户</p>
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
              <label className="block text-sm font-medium text-morandi-text mb-2">昵称</label>
              <div className="relative">
                <User className="w-5 h-5 text-morandi-text/50 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="请输入昵称"
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
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-morandi-light/50 border border-morandi-light focus:border-morandi-pink focus:bg-white outline-none transition-all text-morandi-text"
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

            <div>
              <label className="block text-sm font-medium text-morandi-text mb-2">确认密码</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-morandi-text/50 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密码"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-morandi-light/50 border border-morandi-light focus:border-morandi-pink focus:bg-white outline-none transition-all text-morandi-text"
                />
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-morandi-green to-morandi-blue text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>注册</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-morandi-text/60 text-sm">
              已有账号？
              <Link to="/login" className="text-morandi-pink font-medium hover:underline ml-1">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
