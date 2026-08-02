import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Agent from './pages/Agent';
import Rating from './pages/Rating';
import Training from './pages/Training';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-morandi-light">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Home />
                </div>
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                  <Rating />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating/domains/:domainId"
            element={
              <ProtectedRoute>
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                  <Rating />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating/topics/:topicId"
            element={
              <ProtectedRoute>
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                  <Rating />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rating/courses/:courseId"
            element={
              <ProtectedRoute>
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                  <Rating />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Training />
                </div>
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
