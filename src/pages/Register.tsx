import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import logoImg from '../logo/logo.png';

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
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] relative overflow-hidden">
      {/* Clay blobs */}
      <div className="absolute top-[15%] -right-8 w-36 h-36 rounded-[50%_55%_45%_50%] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle at 40% 35%, #f8e8a0 0%, transparent 70%)', boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="absolute bottom-[10%] -left-6 w-40 h-40 rounded-[55%_45%_50%_50%] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle at 35% 30%, #fcc8a8 0%, transparent 70%)', boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="absolute top-[40%] -left-8 w-24 h-24 rounded-[45%_55%_55%_45%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 40% 35%, #a8d8ea 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="absolute bottom-[30%] -right-10 w-20 h-20 rounded-[55%_45%_40%_60%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 35% 30%, #f8b8c8 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="absolute top-[50%] right-[15%] w-14 h-14 rounded-[55%_45%_50%_50%] pointer-events-none opacity-35"
        style={{ background: 'radial-gradient(circle at 40% 35%, #d4b8e0 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />
      <div className="absolute bottom-[25%] left-[12%] w-12 h-12 rounded-[45%_55%_55%_45%] pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle at 35% 30%, #a8e0c8 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />

      <div className="bg-white rounded-[24px] p-8 md:p-12 w-full max-w-md relative z-10"
        style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.03), inset 0 2px 8px rgba(255,255,255,0.9), 0 4px 20px rgba(0,0,0,0.06)' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-[16px] ring-2 ring-claude-primary/20 shadow-lg overflow-hidden mx-auto mb-4">
            <img src={logoImg} alt="智赋青途" className="w-full h-full object-cover scale-150" />
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
              className="w-full h-11 px-4 rounded-[12px] bg-white border border-claude-hairline outline-none focus:border-claude-primary text-claude-ink transition-colors"
              style={{ boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.03), inset 0 1px 3px rgba(0,0,0,0.04)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-claude-ink mb-2">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
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

          <div>
            <label className="block text-sm font-medium text-claude-ink mb-2">确认密码</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className="w-full h-11 px-4 pr-12 rounded-[12px] bg-white border border-claude-hairline outline-none focus:border-claude-primary text-claude-ink transition-colors"
              style={{ boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.03), inset 0 1px 3px rgba(0,0,0,0.04)' }}
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
            className="w-full h-11 rounded-claude-md bg-claude-primary text-white font-medium flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-60"
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
                className="mt-6 w-full h-11 rounded-claude-md bg-claude-primary font-medium text-white hover:bg-opacity-90 inline-flex items-center justify-center"
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
