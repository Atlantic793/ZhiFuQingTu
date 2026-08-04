import { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TEST_ACCOUNT, useAuthStore } from '../store/authStore';

const Login = () => {
  const location = useLocation();
  const registeredState = location.state as { registered?: boolean; email?: string } | null;
  const [email, setEmail] = useState(registeredState?.email ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(
    registeredState?.registered ? '注册成功，请登录' : ''
  );
  const [loading, setLoading] = useState(false);
  const { login, loginWithTestAccount } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !password) {
      setError('请填写完整信息');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kraken-canvas relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-kraken-half pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(113,50,245,0.18) 0%, rgba(113,50,245,0.04) 45%, transparent 65%)' }} />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-kraken-half pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(87,65,216,0.15) 0%, rgba(87,65,216,0.03) 40%, transparent 60%)' }} />

      <div className="bg-white rounded-kraken-xl p-8 md:p-12 w-full max-w-md relative z-10 shadow-kraken">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-kraken-lg bg-kraken-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">智</span>
          </div>
          <h1 className="text-2xl font-bold text-kraken-ink tracking-tight">智赋青途</h1>
          <p className="text-kraken-muted mt-2">登录您的账户</p>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-kraken bg-kraken-success-subtle text-kraken-success-dark border border-kraken-success/20 text-sm">
            {success}
          </div>
        )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-kraken bg-kraken-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-kraken-primary-deep transition-colors disabled:opacity-60"
          >
            <span>{loading ? '登录中…' : '登录'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-kraken-muted">
            还没有账户？{' '}
            <Link to="/register" className="text-kraken-primary font-medium hover:underline">
              立即注册
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 rounded-kraken-xl bg-kraken-primary-subtle">
          <p className="text-sm text-kraken-neutral mb-1">内部测试账号（首次使用会自动在 Supabase 创建）：</p>
          <p className="text-sm text-kraken-ink">邮箱: {TEST_ACCOUNT.email}</p>
          <p className="text-sm text-kraken-ink mb-3">密码: {TEST_ACCOUNT.password}</p>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setError('');
              setSuccess('');
              setLoading(true);
              const result = await loginWithTestAccount();
              setLoading(false);
              if (result.ok) {
                navigate('/');
              } else {
                setError(result.error);
              }
            }}
            className="w-full h-11 rounded-kraken bg-white text-kraken-ink text-sm font-medium border border-kraken-border hover:bg-kraken-surface-soft transition-colors disabled:opacity-60 inline-flex items-center justify-center"
          >
            一键测试登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
