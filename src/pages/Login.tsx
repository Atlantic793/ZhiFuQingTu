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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-morandi-pink/20 via-morandi-blue/10 to-morandi-green/20">
      <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-morandi-pink to-morandi-blue flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">智</span>
          </div>
          <h1 className="text-2xl font-bold text-morandi-text">智赋青途</h1>
          <p className="text-morandi-text/60 mt-2">登录您的账户</p>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-100 text-green-700 text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-morandi-text mb-2">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="w-full px-4 py-3 rounded-xl bg-morandi-light border-none outline-none focus:ring-2 focus:ring-morandi-pink/50 text-morandi-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-morandi-text mb-2">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-morandi-light border-none outline-none focus:ring-2 focus:ring-morandi-pink/50 text-morandi-text"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-morandi-text/60 hover:text-morandi-text"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-morandi-pink text-white font-medium flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-60"
          >
            <span>{loading ? '登录中…' : '登录'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-morandi-text/60">
            还没有账户？{' '}
            <Link to="/register" className="text-morandi-pink hover:underline">
              立即注册
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-morandi-light/50">
          <p className="text-sm text-morandi-text/60 mb-1">内部测试账号（首次使用会自动在 Supabase 创建）：</p>
          <p className="text-sm text-morandi-text">邮箱: {TEST_ACCOUNT.email}</p>
          <p className="text-sm text-morandi-text mb-3">密码: {TEST_ACCOUNT.password}</p>
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
            className="w-full py-2.5 rounded-xl bg-white text-morandi-text text-sm font-medium border border-morandi-light hover:bg-morandi-pink/10 transition-colors disabled:opacity-60"
          >
            一键测试登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
