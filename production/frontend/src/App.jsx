import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import AppLayout from './layouts/AppLayout';
import AuthPage from './pages/AuthPage';
import './styles/globals.css';

// ✅ OPTIMISED: lazy-load every page — JS for each page only downloads
// when the user navigates there for the first time.
const DashboardPage     = lazy(() => import('./pages/DashboardPage'));
const AnalyticsPage     = lazy(() => import('./pages/AnalyticsPage'));
const ChatPage          = lazy(() => import('./pages/ChatPage'));
const ProjectsPage      = lazy(() => import('./pages/ProjectsPage'));
const TeamPage          = lazy(() => import('./pages/TeamPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage      = lazy(() => import('./pages/SettingsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false },
  },
});

// Sudharshan AI chakra spinner — shown while lazy page chunks load
function ChakraSpinner({ size = 54, speed = '10s' }) {
  const spokes = Array.from({ length: 16 }, (_, i) => {
    const a = (i * 22.5 * Math.PI) / 180;
    return { id: i, x1: 50 + 21 * Math.cos(a), y1: 50 + 21 * Math.sin(a), x2: 50 + 43 * Math.cos(a), y2: 50 + 43 * Math.sin(a) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ display: 'block', animation: `plChakraSpin ${speed} linear infinite` }}>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#C97700" strokeWidth="3.5" />
      {spokes.map(s => (
        <line key={s.id} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke="#C97700" strokeWidth="2.5" strokeLinecap="round" />
      ))}
      {spokes.map((_, i) => {
        const a = (i * 22.5 * Math.PI) / 180;
        return <circle key={i} cx={50 + 44 * Math.cos(a)} cy={50 + 44 * Math.sin(a)} r="3" fill="#E8920A" />;
      })}
      <circle cx="50" cy="50" r="17" fill="#FFFDF5" stroke="#C97700" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="5.5" fill="#C97700" />
      <circle cx="50" cy="50" r="2.2" fill="#FFAA20" />
    </svg>
  );
}

function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', minHeight: '100vh',
      background: 'linear-gradient(155deg,#fffdf5,#fff8e5,#fef3d0)',
      flexDirection: 'column', gap: 20,
    }}>
      <ChakraSpinner size={60} speed="10s" />
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Cinzel,serif', fontSize: 15, fontWeight: 800,
          color: '#3D1F00', letterSpacing: '0.04em', marginBottom: 4,
        }}>
          Sudharshan <span style={{ color: '#C97700' }}>AI</span>
        </div>
        <div style={{ fontSize: 9, color: 'rgba(201,119,0,.5)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Cinzel,serif' }}>
          ॐ नमो भगवते वासुदेवाय
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@800&display=swap');
        @keyframes plChakraSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </AppLayout>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/analytics"     element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/chat"          element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/projects"      element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/projects/:id"  element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/team"          element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/settings"      element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*"              element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
