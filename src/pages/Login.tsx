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
    <div className="min-h-screen flex items-center justify-center bg-claude-surface-soft">
      <div className="bg-white rounded-claude-xl border border-claude-hairline p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-claude-lg bg-claude-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">智</span>
          </div>
          <h1 className="text-2xl font-bold text-claude-ink">智赋青途</h1>
          <p className="text-claude-muted-soft mt-2">登录您的账户</p>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-claude-md bg-green-50 text-claude-success border border-claude-success/20 text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-claude-md bg-red-50 text-claude-error border border-claude-error/20 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-claude-ink mb-2">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="w-full px-4 py-3 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-ink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-claude-ink mb-2">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-3 pr-12 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-ink"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-claude-muted-soft hover:text-claude-ink"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-claude-md bg-claude-primary text-white font-medium flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-60"
          >
            <span>{loading ? '登录中…' : '登录'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-claude-muted-soft">
            还没有账户？{' '}
            <Link to="/register" className="text-claude-primary hover:underline">
              立即注册
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 rounded-claude-lg bg-claude-surface-card">
          <p className="text-sm text-claude-muted-soft mb-1">内部测试账号（首次使用会自动在 Supabase 创建）：</p>
          <p className="text-sm text-claude-ink">邮箱: {TEST_ACCOUNT.email}</p>
          <p className="text-sm text-claude-ink mb-3">密码: {TEST_ACCOUNT.password}</p>
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
            className="w-full py-2.5 rounded-claude-md bg-white text-claude-ink text-sm font-medium border border-claude-hairline hover:bg-claude-primary/10 transition-colors disabled:opacity-60"
          >
            一键测试登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
