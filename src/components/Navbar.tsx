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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-morandi-pink to-morandi-blue flex items-center justify-center">
              <span className="text-white font-bold text-lg">智</span>
            </div>
            <span className="text-xl font-bold text-morandi-text">智赋青途</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/agent" className="text-morandi-text hover:text-morandi-pink transition-colors font-medium">
              AI Agent
            </Link>
            <Link to="/rating" className="text-morandi-text hover:text-morandi-pink transition-colors font-medium">
              课程评分
            </Link>
            <Link to="/training" className="text-morandi-text hover:text-morandi-pink transition-colors font-medium">
              职业实训
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-morandi-light transition-colors"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-morandi-pink flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-morandi-text">{user?.nickname}</span>
                </button>
                <div className={`absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg py-2 ${isUserMenuOpen ? 'block' : 'hidden'}`}>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-morandi-text hover:bg-morandi-light flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>个人主页</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-morandi-text hover:bg-morandi-light flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-morandi-text hover:text-morandi-pink transition-colors font-medium">
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-morandi-pink text-white font-medium hover:bg-opacity-90 transition-colors"
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
            {isMenuOpen ? <X className="w-6 h-6 text-morandi-text" /> : <Menu className="w-6 h-6 text-morandi-text" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link to="/agent" className="text-morandi-text hover:text-morandi-pink transition-colors font-medium">
                AI Agent
              </Link>
              <Link to="/rating" className="text-morandi-text hover:text-morandi-pink transition-colors font-medium">
                课程评分
              </Link>
              <Link to="/training" className="text-morandi-text hover:text-morandi-pink transition-colors font-medium">
                职业实训
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-morandi-text hover:text-morandi-pink transition-colors font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              ) : (
                <>
                  <Link to="/login" className="text-morandi-text hover:text-morandi-pink transition-colors font-medium">
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl bg-morandi-pink text-white font-medium hover:bg-opacity-90 transition-colors text-center"
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
