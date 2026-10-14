import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
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
import { SparkIcon } from './components/icons';
import { SettingsProvider } from './contexts/SettingsContext';
import { isFirebaseConfigured } from './firebase';

function FirebaseSetupNotice() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-rp-iris/10 blur-3xl" />
      <section className="card relative w-full max-w-xl p-6 sm:p-8" aria-labelledby="setup-title">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rp-iris/10 text-rp-iris" aria-hidden="true"><SparkIcon className="h-6 w-6" /></div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-rp-iris">Še en korak</p>
        <h1 id="setup-title" className="mt-2 text-2xl font-semibold tracking-tight text-rp-text">Poveži Firebase, da zaženeš SmartStudy</h1>
        <p className="mt-3 text-sm leading-6 text-rp-subtle">Aplikacija se je uspešno naložila, vendar še nima Firebase nastavitev. Zato prijava in shranjevanje podatkov še nista na voljo.</p>
        <ol className="mt-6 space-y-3 text-sm leading-6 text-rp-subtle">
          <li><span className="mr-2 font-semibold text-rp-iris">1.</span>V terminalu, znotraj mape <code className="rounded bg-rp-overlay px-1.5 py-0.5 text-rp-text">Aplikacija</code>, zaženi <code className="rounded bg-rp-overlay px-1.5 py-0.5 text-rp-text">cp .env.example .env.local</code>.</li>
          <li><span className="mr-2 font-semibold text-rp-iris">2.</span>V `.env.local` vnesi konfiguracijo Web app iz Firebase Console → Project settings → Your apps.</li>
          <li><span className="mr-2 font-semibold text-rp-iris">3.</span>Omogoči prijavo z e-pošto in geslom ter objavi Firestore pravila z ukazom <code className="rounded bg-rp-overlay px-1.5 py-0.5 text-rp-text">firebase deploy --only firestore:rules</code>.</li>
          <li><span className="mr-2 font-semibold text-rp-iris">4.</span>Ustavi in znova zaženi razvojni strežnik.</li>
        </ol>
        <p className="mt-6 rounded-xl border border-rp-gold/15 bg-rp-gold/[.05] p-3 text-xs leading-5 text-rp-gold">Vrednosti iz Firebase so nastavitve brskalniške aplikacije. V `.env.local` nikoli ne dodajaj Admin SDK zasebnega ključa.</p>
      </section>
    </main>
  );
}

export default function App() {
  if (!isFirebaseConfigured) return <FirebaseSetupNotice />;

  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes – wrapped in Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <Layout>
                  <SubjectsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Layout>
                  <TasksPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <Layout>
                  <SchedulePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <Layout>
                  <ExamsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcards"
            element={
              <ProtectedRoute>
                <Layout>
                  <FlashcardsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChatPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <Layout>
                  <FriendsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
