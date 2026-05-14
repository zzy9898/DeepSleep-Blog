import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { AuthProvider } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import CreatePost from './pages/CreatePost';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import GuestRoute from './routes/GuestRoute';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/auth"
              element={(
                <GuestRoute>
                  <AuthPage />
                </GuestRoute>
              )}
            />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/profile/:uid" element={<Profile />} />
            <Route
              path="/create"
              element={(
                <ProtectedRoute forbidAdmin>
                  <CreatePost />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/edit/:id"
              element={(
                <ProtectedRoute forbidAdmin>
                  <CreatePost />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )}
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
