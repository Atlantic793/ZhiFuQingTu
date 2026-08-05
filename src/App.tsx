import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Agent from './pages/Agent';
import Rating from './pages/Rating';
import Training from './pages/Training';
import Profile from './pages/Profile';

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
                <Agent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating"
            element={
              <ProtectedRoute>
                <Navbar />
                <Rating />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating/domains/:domainId"
            element={
              <ProtectedRoute>
                <Navbar />
                <Rating />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating/topics/:topicId"
            element={
              <ProtectedRoute>
                <Navbar />
                <Rating />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating/courses/:courseId"
            element={
              <ProtectedRoute>
                <Navbar />
                <Rating />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <Navbar />
                <Training />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Navbar />
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
