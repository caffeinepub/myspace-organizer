/**
 * Root application component managing tab-based navigation, app initialization,
 * and global layout. Applies saved settings on mount and seeds initial data.
 */
import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { useDataStore } from './store/dataStore';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import StreakPage from './pages/StreakPage';
import RoutinesPage from './pages/RoutinesPage';
import SettingsPage from './pages/SettingsPage';
import QuotePage from './pages/QuotePage';
import { NotesPage } from './pages/NotesPage';
import RecordsPage from './pages/RecordsPage';
import { Toaster } from '@/components/ui/sonner';

export type TabId = 'home' | 'notes' | 'records' | 'routines' | 'streak' | 'quotes' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [notesQuickAdd, setNotesQuickAdd] = useState(false);
  const applySettings = useAppStore((s) => s.applySettings);
  const seedData = useDataStore((s) => s.seedData);

  useEffect(() => {
    applySettings();
    seedData();

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, [applySettings, seedData]);

  const handleNavigate = (tab: TabId, options?: { quickAdd?: boolean }) => {
    setActiveTab(tab);
    if (tab === 'notes' && options?.quickAdd) {
      setNotesQuickAdd(true);
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'notes':
        return (
          <NotesPage
            initialQuickAdd={notesQuickAdd}
            onQuickAddHandled={() => setNotesQuickAdd(false)}
          />
        );
      case 'records':
        return <RecordsPage />;
      case 'routines':
        return <RoutinesPage />;
      case 'streak':
        return <StreakPage />;
      case 'quotes':
        return <QuotePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <AppLayout activeTab={activeTab} onTabChange={handleNavigate}>
        {renderPage()}
      </AppLayout>
      <Toaster richColors position="top-center" />
    </>
  );
}
