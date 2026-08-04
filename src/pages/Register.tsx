import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Register = () => {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !nickname || !password || !confirmPassword) {
      setError('请填写完整信息');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少6位');
      return;
    }
    setLoading(true);
    const result = await register(email, nickname, password);
    setLoading(false);
    if (result.ok) {
      setShowSuccess(true);
    } else {
      setError(result.error);
    }
  };

  const goLogin = () => {
    navigate('/login', { state: { registered: true, email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kraken-canvas relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-kraken-half pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(113,50,245,0.16) 0%, rgba(113,50,245,0.03) 45%, transparent 65%)' }} />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-kraken-half pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(87,65,216,0.14) 0%, rgba(87,65,216,0.03) 40%, transparent 60%)' }} />

      <div className="bg-white rounded-kraken-xl p-8 md:p-12 w-full max-w-md relative z-10 shadow-kraken">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-kraken-lg bg-kraken-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">智</span>
          </div>
          <h1 className="text-2xl font-bold text-kraken-ink tracking-tight">智赋青途</h1>
          <p className="text-kraken-muted mt-2">创建您的账户</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-kraken bg-red-50 text-kraken-error border border-kraken-error/20 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-kraken-ink mb-2">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="w-full h-11 px-4 rounded-kraken-lg bg-white border border-kraken-border outline-none focus:border-kraken-primary text-kraken-ink transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-kraken-ink mb-2">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              className="w-full h-11 px-4 rounded-kraken-lg bg-white border border-kraken-border outline-none focus:border-kraken-primary text-kraken-ink transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-kraken-ink mb-2">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full h-11 px-4 pr-12 rounded-kraken-lg bg-white border border-kraken-border outline-none focus:border-kraken-primary text-kraken-ink transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kraken-muted hover:text-kraken-ink"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-kraken-ink mb-2">确认密码</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className="w-full h-11 px-4 pr-12 rounded-kraken-lg bg-white border border-kraken-border outline-none focus:border-kraken-primary text-kraken-ink transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kraken-muted hover:text-kraken-ink"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-kraken bg-kraken-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-kraken-primary-deep transition-colors disabled:opacity-60"
          >
            <span>{loading ? '注册中…' : '注册'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-kraken-muted">
            已有账户？{' '}
            <Link to="/login" className="text-kraken-primary font-medium hover:underline">
              立即登录
            </Link>
          </p>
        </div>

        {showSuccess && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-kraken-xl bg-white/95 p-6 backdrop-blur-sm">
            <div className="w-full max-w-xs text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-kraken-success" />
              <h2 className="text-xl font-bold text-kraken-ink">注册成功</h2>
              <p className="mt-2 text-sm text-kraken-neutral">账号已创建，请使用邮箱和密码登录</p>
              <button
                type="button"
                onClick={goLogin}
                className="mt-6 w-full h-11 rounded-kraken bg-kraken-primary font-semibold text-white hover:bg-kraken-primary-deep inline-flex items-center justify-center transition-colors"
              >
                去登录
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
