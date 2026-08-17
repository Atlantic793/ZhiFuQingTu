import { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TEST_ACCOUNT, useAuthStore } from '../store/authStore';
import logoImg from '../logo/logo.png';

const Login = () => {
  const location = useLocation();
  const registeredState = location.state as { registered?: boolean; email?: string; from?: string } | null;
  const redirectTo =
    registeredState?.from && registeredState.from.startsWith('/') && !registeredState.from.startsWith('//')
      ? registeredState.from
      : '/';
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
      navigate(redirectTo);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] relative overflow-hidden">
      {/* Clay blobs */}
      <div className="absolute top-[10%] -left-8 w-40 h-40 rounded-[55%_45%_50%_50%] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle at 40% 35%, #a8d8ea 0%, transparent 70%)', boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="absolute bottom-[15%] -right-6 w-36 h-36 rounded-[50%_55%_45%_50%] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle at 35% 30%, #d4b8e0 0%, transparent 70%)', boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="absolute top-[40%] -right-10 w-24 h-24 rounded-[45%_55%_55%_45%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 40% 35%, #fcc8a8 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="absolute bottom-[30%] -left-10 w-20 h-20 rounded-[55%_45%_40%_60%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 35% 30%, #a8e0c8 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="absolute top-[55%] left-[15%] w-14 h-14 rounded-[50%_55%_50%_45%] pointer-events-none opacity-35"
        style={{ background: 'radial-gradient(circle at 40% 35%, #f8e8a0 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />
      <div className="absolute top-[25%] right-[15%] w-12 h-12 rounded-[55%_45%_55%_45%] pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle at 35% 30%, #f8b8c8 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />

      <div className="bg-white rounded-[24px] p-8 md:p-12 w-full max-w-md relative z-10"
        style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.03), inset 0 2px 8px rgba(255,255,255,0.9), 0 4px 20px rgba(0,0,0,0.06)' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-[16px] ring-2 ring-claude-primary/20 shadow-lg overflow-hidden mx-auto mb-4">
            <img src={logoImg} alt="智赋青途" className="w-full h-full object-cover scale-150" />
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
              className="w-full h-11 px-4 rounded-[12px] bg-white border border-claude-hairline outline-none focus:border-claude-primary text-claude-ink transition-colors"
              style={{ boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.03), inset 0 1px 3px rgba(0,0,0,0.04)' }}
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
                className="w-full h-11 px-4 pr-12 rounded-[12px] bg-white border border-claude-hairline outline-none focus:border-claude-primary text-claude-ink transition-colors"
                style={{ boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.03), inset 0 1px 3px rgba(0,0,0,0.04)' }}
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
            className="w-full h-11 rounded-claude-md bg-claude-primary text-white font-medium flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-60"
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

        <div className="mt-6 p-4 rounded-[16px] bg-macaron-blue/50"
          style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.04)' }}>
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
                navigate(redirectTo);
              } else {
                setError(result.error);
              }
            }}
            className="w-full h-11 rounded-claude-md bg-white text-claude-ink text-sm font-medium border border-claude-hairline hover:bg-claude-surface-card transition-colors disabled:opacity-60 inline-flex items-center justify-center"
          >
            一键测试登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
