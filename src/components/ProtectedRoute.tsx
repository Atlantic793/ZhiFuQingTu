import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center text-claude-muted">
      正在恢复登录状态…
    </div>
  );
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isLoggedIn, isInitialized } = useAuthStore();

  if (!isInitialized) return <AuthLoading />;

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <>{children}</>;
};

/** 已登录用户访问登录/注册页时回到首页 */
export const GuestRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, isInitialized } = useAuthStore();

  if (!isInitialized) return <AuthLoading />;
  if (isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
