import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import Home from './pages/Home';

// 路由级代码分割：除首页外的页面按需加载，缩小首屏 bundle
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Agent = lazy(() => import('./pages/Agent'));
const Rating = lazy(() => import('./pages/Rating'));
const Training = lazy(() => import('./pages/Training'));
const Pathways = lazy(() => import('./pages/Pathways'));
const PaperReader = lazy(() => import('./pages/PaperReader'));
const Profile = lazy(() => import('./pages/Profile'));

// 页面 chunk 加载中的占位；Navbar 保持可见，也避免整屏白屏跳动
function PageFallback() {
  return (
    <div className="min-h-[70vh] grid place-items-center" role="status" aria-busy="true">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-[3px] border-[#e5e5e5] border-t-[#b8a4ed] animate-spin" />
        <span className="text-sm text-[#6a6a6a]">加载中…</span>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-[#fafafa]">
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Suspense fallback={<PageFallback />}>
                  <Login />
                </Suspense>
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Suspense fallback={<PageFallback />}>
                  <Register />
                </Suspense>
              </GuestRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navbar />
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent"
            element={
              <ProtectedRoute>
                <Navbar />
                <Suspense fallback={<PageFallback />}>
                  <Agent />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating"
            element={
              <ProtectedRoute>
                <Navbar />
                <Suspense fallback={<PageFallback />}>
                  <Rating />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating/domains/:domainId"
            element={
              <ProtectedRoute>
                <Navbar />
                <Suspense fallback={<PageFallback />}>
                  <Rating />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating/topics/:topicId"
            element={
              <ProtectedRoute>
                <Navbar />
                <Suspense fallback={<PageFallback />}>
                  <Rating />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating/courses/:courseId"
            element={
              <ProtectedRoute>
                <Navbar />
                <Suspense fallback={<PageFallback />}>
                  <Rating />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <Navbar />
                <Suspense fallback={<PageFallback />}>
                  <Training />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pathways"
            element={
              <ProtectedRoute>
                <Navbar />
                <Suspense fallback={<PageFallback />}>
                  <Pathways />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pathways/papers/:paperId"
            element={
              <ProtectedRoute>
                <Navbar />
                <Suspense fallback={<PageFallback />}>
                  <PaperReader />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Navbar />
                <Suspense fallback={<PageFallback />}>
                  <Profile />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
