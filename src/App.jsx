import { Routes, Route, Navigate } from 'react-router-dom';
import { BaseRouter } from './components/BaseRouter.jsx';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SubjectsPage from './pages/SubjectsPage';
import TasksPage from './pages/TasksPage';
import ExamsPage from './pages/ExamsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import SchedulePage from './pages/SchedulePage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import SettingsPage from './pages/SettingsPage';
import { SettingsProvider } from './contexts/SettingsContext';

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BaseRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            {/* Javne poti */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Zaščitene poti */}
            <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
            <Route path="/subjects" element={<Protected><SubjectsPage /></Protected>} />
            <Route path="/tasks" element={<Protected><TasksPage /></Protected>} />
            <Route path="/schedule" element={<Protected><SchedulePage /></Protected>} />
            <Route path="/exams" element={<Protected><ExamsPage /></Protected>} />
            <Route path="/flashcards" element={<Protected><FlashcardsPage /></Protected>} />
            <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
            <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
            <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
            <Route path="/friends" element={<Protected><FriendsPage /></Protected>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BaseRouter>
  );
}
