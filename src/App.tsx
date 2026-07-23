import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Agent from './pages/Agent';
import Rating from './pages/Rating';
import Training from './pages/Training';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <div className="min-h-screen bg-morandi-bg">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent"
          element={
            <ProtectedRoute>
              <Agent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rating"
          element={
            <ProtectedRoute>
              <Rating />
            </ProtectedRoute>
          }
        />
        <Route
          path="/training"
          element={
            <ProtectedRoute>
              <Training />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
