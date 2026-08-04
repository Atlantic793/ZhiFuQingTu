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
    <div className="min-h-screen flex items-center justify-center bg-claude-surface-soft">
      <div className="bg-white rounded-claude-xl border border-claude-hairline p-8 md:p-12 w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-claude-lg bg-claude-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">智</span>
          </div>
          <h1 className="text-2xl font-bold text-claude-ink">智赋青途</h1>
          <p className="text-claude-muted-soft mt-2">创建您的账户</p>
        </div>

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
            <label className="block text-sm font-medium text-claude-ink mb-2">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
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

          <div>
            <label className="block text-sm font-medium text-claude-ink mb-2">确认密码</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className="w-full px-4 py-3 pr-12 rounded-claude-md bg-claude-canvas border border-claude-hairline outline-none focus:ring-2 focus:ring-claude-primary/30 text-claude-ink"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-claude-muted-soft hover:text-claude-ink"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-claude-md bg-claude-primary text-white font-medium flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-60"
          >
            <span>{loading ? '注册中…' : '注册'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-claude-muted-soft">
            已有账户？{' '}
            <Link to="/login" className="text-claude-primary hover:underline">
              立即登录
            </Link>
          </p>
        </div>

        {showSuccess && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-claude-xl bg-white/90 p-6 backdrop-blur-sm">
            <div className="w-full max-w-xs text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-claude-success" />
              <h2 className="text-xl font-bold text-claude-ink">注册成功</h2>
              <p className="mt-2 text-sm text-claude-muted">账号已创建，请使用邮箱和密码登录</p>
              <button
                type="button"
                onClick={goLogin}
                className="mt-6 w-full rounded-claude-md bg-claude-primary py-3 font-medium text-white hover:bg-opacity-90"
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
