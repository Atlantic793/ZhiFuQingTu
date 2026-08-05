import { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import logoImg from '../logo/logo.png';

const NAV_ITEMS = [
  { to: '/agent', label: 'AI Agent' },
  { to: '/rating', label: '课程评分' },
  { to: '/training', label: '职业实训' },
] as const;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-claude-hairline">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Left: Logo + brand */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-[12px] ring-2 ring-claude-primary/20 shadow-lg overflow-hidden">
              <img src={logoImg} alt="智赋青途" className="w-full h-full object-cover scale-150" />
            </div>
            <span className="text-xl font-bold text-claude-ink">智赋青途</span>
          </Link>

          {/* Main nav menu — right after logo */}
          <div className="hidden md:flex items-center gap-4 ml-6">
            {NAV_ITEMS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium px-3 py-1.5 rounded-claude-md transition-all ${
                  isActive(to)
                    ? 'text-claude-ink bg-claude-surface-card'
                    : 'text-claude-ink hover:bg-claude-surface-soft hover:shadow-sm'
                }`}
                style={isActive(to) ? {
                  boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255,255,255,0.6), 0 2px 6px rgba(0,0,0,0.06)',
                } : undefined}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right: User area */}
          <div className="hidden md:flex items-center gap-4 ml-auto flex-shrink-0">
            {isLoggedIn ? (
              <div
                className="relative"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-claude-md hover:bg-claude-surface-soft transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-claude-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-claude-ink">{user?.nickname}</span>
                </button>
                <div
                  className={`absolute right-0 mt-2 w-40 bg-white rounded-claude-md border border-claude-hairline py-2 transition-all duration-200 origin-top-right ${
                    isUserMenuOpen
                      ? 'opacity-100 scale-100 visible'
                      : 'opacity-0 scale-95 invisible'
                  }`}
                >
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-claude-body hover:bg-claude-surface-soft flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>个人主页</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-claude-body hover:bg-claude-surface-soft flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-claude-ink hover:text-claude-muted transition-colors">
                  登录
                </Link>
                <Link
                  to="/register"
                  className="h-11 px-5 rounded-claude-md bg-claude-primary text-white text-sm font-semibold hover:bg-opacity-90 transition-colors inline-flex items-center"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6 text-claude-body" /> : <Menu className="w-6 h-6 text-claude-body" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {NAV_ITEMS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-sm font-medium transition-colors ${
                    isActive(to) ? 'text-claude-primary' : 'text-claude-ink hover:text-claude-muted'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-claude-body hover:text-claude-primary transition-colors font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-claude-ink hover:text-claude-muted transition-colors">
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-claude-md bg-claude-primary text-white font-medium hover:bg-opacity-90 transition-colors text-center"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
