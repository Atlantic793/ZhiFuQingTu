import { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-claude-hairline">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Left: Logo + brand */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-[12px] bg-claude-primary flex items-center justify-center"
              style={{ boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.1)' }}>
              <span className="text-white font-bold text-lg">智</span>
            </div>
            <span className="text-xl font-bold text-claude-ink">智赋青途</span>
          </Link>

          {/* Center: Main nav menu */}
          <div className="hidden md:flex items-center justify-center gap-8 flex-1">
            <Link to="/agent" className="text-sm font-medium text-claude-ink hover:text-claude-muted transition-colors">
              AI Agent
            </Link>
            <Link to="/rating" className="text-sm font-medium text-claude-ink hover:text-claude-muted transition-colors">
              课程评分
            </Link>
            <Link to="/training" className="text-sm font-medium text-claude-ink hover:text-claude-muted transition-colors">
              职业实训
            </Link>
          </div>

          {/* Right: User area */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-claude-md hover:bg-claude-surface-soft transition-colors"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-claude-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-claude-ink">{user?.nickname}</span>
                </button>
                <div className={`absolute right-0 mt-2 w-40 bg-white rounded-claude-md border border-claude-hairline py-2 ${isUserMenuOpen ? 'block' : 'hidden'}`}>
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
              <Link to="/agent" className="text-sm font-medium text-claude-ink hover:text-claude-muted transition-colors">
                AI Agent
              </Link>
              <Link to="/rating" className="text-sm font-medium text-claude-ink hover:text-claude-muted transition-colors">
                课程评分
              </Link>
              <Link to="/training" className="text-sm font-medium text-claude-ink hover:text-claude-muted transition-colors">
                职业实训
              </Link>
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
