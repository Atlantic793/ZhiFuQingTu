import { useState } from 'react';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-kraken-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Left: Logo + brand */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-kraken bg-white flex items-center justify-center">
              <span className="text-kraken-primary font-bold text-lg">智</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">智赋青途</span>
          </Link>

          {/* Center: Main nav menu */}
          <div className="hidden md:flex items-center justify-center gap-8 flex-1">
            <Link to="/agent" className="text-sm font-medium text-white hover:text-white/70 transition-colors">
              AI Agent
            </Link>
            <Link to="/rating" className="text-sm font-medium text-white hover:text-white/70 transition-colors">
              课程评分
            </Link>
            <Link to="/training" className="text-sm font-medium text-white hover:text-white/70 transition-colors">
              职业实训
            </Link>
          </div>

          {/* Right: User area */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {isLoggedIn ? (
              <div
                className="relative"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-kraken hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{user?.nickname}</span>
                  <ChevronDown className="w-4 h-4 text-white/70" />
                </button>
                <div
                  className={`absolute right-0 mt-2 w-44 bg-white rounded-kraken-lg border border-kraken-border py-2 shadow-kraken transition-all duration-200 origin-top-right ${
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
                    className="w-full px-4 py-2.5 text-sm text-kraken-ink hover:bg-kraken-surface-soft flex items-center gap-3 transition-colors"
                  >
                    <User className="w-4 h-4 text-kraken-neutral" />
                    <span>个人主页</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-sm text-kraken-ink hover:bg-kraken-surface-soft flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-kraken-neutral" />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-white hover:text-white/70 transition-colors px-3 py-1.5">
                  登录
                </Link>
                <Link
                  to="/register"
                  className="h-9 px-5 rounded-kraken bg-white text-kraken-primary text-sm font-semibold hover:bg-white/90 transition-colors inline-flex items-center"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 ml-auto"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col gap-3">
              <Link to="/agent" className="text-sm font-medium text-white/90 hover:text-white transition-colors px-2">
                AI Agent
              </Link>
              <Link to="/rating" className="text-sm font-medium text-white/90 hover:text-white transition-colors px-2">
                课程评分
              </Link>
              <Link to="/training" className="text-sm font-medium text-white/90 hover:text-white transition-colors px-2">
                职业实训
              </Link>
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="text-sm font-medium text-white/90 hover:text-white transition-colors px-2">
                    个人主页
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white transition-colors font-medium flex items-center gap-2 px-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-white/90 hover:text-white transition-colors px-2">
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-kraken bg-white text-kraken-primary font-medium text-sm hover:bg-white/90 transition-colors text-center"
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
