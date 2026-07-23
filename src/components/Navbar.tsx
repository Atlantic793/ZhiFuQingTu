import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout } = useAuthStore();

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/agent', label: 'AI Agent' },
    { path: '/rating', label: '课程评分' },
    { path: '/training', label: '职业实训' },
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-soft z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-morandi-pink to-morandi-blue flex items-center justify-center transition-transform group-hover:scale-110">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-morandi-text font-display">智赋青途</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-morandi-pink text-white shadow-md'
                    : 'text-morandi-text hover:bg-morandi-light'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-morandi-light transition-colors"
                >
                  <img
                    src={user?.avatar}
                    alt={user?.nickname}
                    className="w-8 h-8 rounded-full object-cover border-2 border-morandi-pink"
                  />
                  <span className="text-morandi-text font-medium">{user?.nickname}</span>
                  <ChevronDown className={`w-4 h-4 text-morandi-text transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-morandi-light py-2 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-morandi-text hover:bg-morandi-light flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>退出登录</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-morandi-pink to-morandi-blue text-white font-medium hover:shadow-md transition-all"
              >
                登录
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-morandi-light transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-morandi-text" />
            ) : (
              <Menu className="w-6 h-6 text-morandi-text" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-morandi-light animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-morandi-pink text-white'
                    : 'text-morandi-text hover:bg-morandi-light'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="mt-4 pt-4 border-t border-morandi-light">
                <div className="flex items-center gap-3 px-4 py-2">
                  <img
                    src={user?.avatar}
                    alt={user?.nickname}
                    className="w-8 h-8 rounded-full object-cover border-2 border-morandi-pink"
                  />
                  <span className="text-morandi-text font-medium">{user?.nickname}</span>
                </div>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full px-4 py-3 text-left text-morandi-text hover:bg-morandi-light flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="block mt-4 mx-4 px-4 py-3 rounded-xl bg-gradient-to-r from-morandi-pink to-morandi-blue text-white font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                登录
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
