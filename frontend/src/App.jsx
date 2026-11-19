import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DemoBanner from './components/DemoBanner';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import PlannerPage from './pages/PlannerPage';
import { checkHealth } from './api';
import { WifiOff } from 'lucide-react';

// Route-level code splitting
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const RouteDetailsPage = lazy(() => import('./pages/RouteDetailsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-3" role="status">
      <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-transit-textMuted font-medium">Loading page...</span>
    </div>
  );
}

export default function App() {
  const [meta, setMeta] = useState({ data_mode: 'official' });
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    checkHealth()
      .then((res) => {
        if (res?.meta) {
          setMeta(res.meta);
        }
      })
      .catch((err) => {
        console.warn('API health check error:', err);
      });
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-transit-bg text-transit-text selection:bg-teal selection:text-white">
        {/* Offline Status Bar */}
        {!isOnline && (
          <aside aria-label="Offline status" className="bg-[#64748B] text-white text-xs px-3 py-1.5 flex items-center justify-center gap-2 font-medium">
            <WifiOff className="w-3.5 h-3.5" />
            <span>You are currently offline. Timetable and prediction features may be limited.</span>
          </aside>
        )}

        {/* Top Provenance / Factual Data Line Banner */}
        <DemoBanner meta={meta} />

        {/* Main 56px Navigation */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<PlannerPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/route/:id" element={<RouteDetailsPage />} />
              <Route path="/routes/:id" element={<RouteDetailsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>

        {/* Persistent Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
