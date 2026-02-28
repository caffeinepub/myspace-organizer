import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { StreakPage } from './pages/StreakPage';
import { QuotePage } from './pages/QuotePage';
import { SettingsPage } from './pages/SettingsPage';
import { ToastContainer } from './components/common/ToastContainer';
import { PageSkeleton } from './components/common/LoadingSpinner';
import { useAppStore } from './store/appStore';
import { seedDatabase } from './utils/seedData';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';

const NotesPage = lazy(() => import('./pages/NotesPage').then(m => ({ default: m.NotesPage })));
const RecordsPage = lazy(() => import('./pages/RecordsPage'));
const RoutinesPage = lazy(() => import('./pages/RoutinesPage'));

type TabId = 'home' | 'routines' | 'notes' | 'records' | 'settings' | 'streak' | 'quote';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [quickAddNoteOpen, setQuickAddNoteOpen] = useState(false);
  const { initSettings } = useAppStore();

  useEffect(() => {
    initSettings();
    seedDatabase();
    registerServiceWorker();
  }, [initSettings]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabId);
  };

  const handleQuickAddNote = () => {
    setActiveTab('notes');
    setQuickAddNoteOpen(true);
  };

  // Map sub-pages to their parent nav tab for sidebar/bottom bar highlighting
  const navTab = activeTab === 'streak' || activeTab === 'quote' ? 'home' : activeTab;

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleTabChange}
            onQuickAddNote={handleQuickAddNote}
          />
        );
      case 'streak':
        return <StreakPage onBack={() => setActiveTab('home')} />;
      case 'quote':
        return <QuotePage onBack={() => setActiveTab('home')} />;
      case 'routines':
        return (
          <Suspense fallback={<PageSkeleton />}>
            <RoutinesPage />
          </Suspense>
        );
      case 'notes':
        return (
          <Suspense fallback={<PageSkeleton />}>
            <NotesPage initialQuickAdd={quickAddNoteOpen} onQuickAddHandled={() => setQuickAddNoteOpen(false)} />
          </Suspense>
        );
      case 'records':
        return (
          <Suspense fallback={<PageSkeleton />}>
            <RecordsPage />
          </Suspense>
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <HomePage
            onNavigate={handleTabChange}
            onQuickAddNote={handleQuickAddNote}
          />
        );
    }
  };

  return (
    <AppLayout activeTab={navTab} onTabChange={handleTabChange}>
      <div className="animate-fade-in">
        {renderPage()}
      </div>
      <ToastContainer />
    </AppLayout>
  );
}
