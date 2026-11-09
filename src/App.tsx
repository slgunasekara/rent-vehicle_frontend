import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from './store';
import { clearFavorites, loadFavorites } from './store/favoritesSlice';
import { forceLogout, loadMe } from './store/authSlice';
import ErrorBoundary from './components/common/ErrorBoundary';
import AutoTranslate from './i18n/AutoTranslate';
import AppRoutes from './router/index';

const BuddyChat = lazy(() => import('./components/chat/BuddyChat'));

export default function App() {
  const d = useAppDispatch();
  const userId = useAppSelector((s) => s.auth.user?.id);
  useEffect(() => { if (userId) void d(loadFavorites()); else d(clearFavorites()); }, [userId, d]);
  useEffect(() => {
    d(loadMe());
    const h = () => d(forceLogout());
    window.addEventListener('fv:logout', h);
    return () => window.removeEventListener('fv:logout', h);
  }, [d]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', background: '#041f41', color: '#fff' } }} />
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
      <Suspense fallback={null}><BuddyChat /></Suspense>
      <AutoTranslate />
    </BrowserRouter>
  );
}
