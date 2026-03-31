import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import {
  MIGRATION_SKIPPED_KEY,
  MigrationModal,
} from "./components/auth/MigrationModal";
import { PageSkeleton } from "./components/common/LoadingSpinner";
import { ToastContainer } from "./components/common/ToastContainer";
import { AppLayout } from "./components/layout/AppLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useSyncService } from "./hooks/useSyncService";
import { useUsernameAuth } from "./hooks/useUsernameAuth";
import { HomePage } from "./pages/HomePage";
import { QuotePage } from "./pages/QuotePage";
import { SettingsPage } from "./pages/SettingsPage";
import { StreakPage } from "./pages/StreakPage";
import { useAppStore } from "./store/appStore";
import { seedDatabase } from "./utils/seedData";
import { registerServiceWorker } from "./utils/serviceWorkerRegistration";

const NotesPage = lazy(() =>
  import("./pages/NotesPage").then((m) => ({ default: m.NotesPage })),
);
const RecordsPage = lazy(() => import("./pages/RecordsPage"));
const RoutinesPage = lazy(() => import("./pages/RoutinesPage"));

type TabId =
  | "home"
  | "routines"
  | "notes"
  | "records"
  | "settings"
  | "streak"
  | "quote";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [quickAddNoteOpen, setQuickAddNoteOpen] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const { initSettings } = useAppStore();
  const { identity } = useInternetIdentity();
  const { userId: upUserId } = useUsernameAuth();
  const { syncFromBackend, syncToBackend, hasMigrationData } = useSyncService();
  const prevIdentityRef = useRef<string | null>(null);
  const prevUpUserIdRef = useRef<string | null>(null);
  const autoSyncRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initSettings();
    seedDatabase();
    registerServiceWorker();
  }, [initSettings]);

  // Handle II login: sync from backend, check migration
  useEffect(() => {
    const principal =
      identity && !identity.getPrincipal().isAnonymous()
        ? identity.getPrincipal().toString()
        : null;

    if (principal && principal !== prevIdentityRef.current) {
      prevIdentityRef.current = principal;

      const skipped = localStorage.getItem(MIGRATION_SKIPPED_KEY);
      void (async () => {
        if (!skipped) {
          const hasLocal = await hasMigrationData();
          if (hasLocal) {
            setShowMigration(true);
            return;
          }
        }
        await syncFromBackend();
      })();
    }

    if (!principal) {
      prevIdentityRef.current = null;
    }
  }, [identity, syncFromBackend, hasMigrationData]);

  // Handle username/password login: sync from backend, check migration
  useEffect(() => {
    if (upUserId && upUserId !== prevUpUserIdRef.current) {
      prevUpUserIdRef.current = upUserId;

      const skipped = localStorage.getItem(MIGRATION_SKIPPED_KEY);
      void (async () => {
        if (!skipped) {
          const hasLocal = await hasMigrationData();
          if (hasLocal) {
            setShowMigration(true);
            return;
          }
        }
        await syncFromBackend();
      })();
    }

    if (!upUserId) {
      prevUpUserIdRef.current = null;
    }
  }, [upUserId, syncFromBackend, hasMigrationData]);

  // Auto-sync every 5 minutes when either auth method is logged in
  useEffect(() => {
    const isIILoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
    const isAnyLoggedIn = isIILoggedIn || !!upUserId;

    if (isAnyLoggedIn) {
      if (!autoSyncRef.current) {
        autoSyncRef.current = setInterval(
          () => {
            void syncToBackend();
          },
          5 * 60 * 1000,
        );
      }
    } else {
      if (autoSyncRef.current) {
        clearInterval(autoSyncRef.current);
        autoSyncRef.current = null;
      }
    }
    return () => {
      if (autoSyncRef.current) {
        clearInterval(autoSyncRef.current);
        autoSyncRef.current = null;
      }
    };
  }, [identity, upUserId, syncToBackend]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabId);
  };

  const handleQuickAddNote = () => {
    setActiveTab("notes");
    setQuickAddNoteOpen(true);
  };

  const navTab =
    activeTab === "streak" || activeTab === "quote" ? "home" : activeTab;

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomePage
            onNavigate={handleTabChange}
            onQuickAddNote={handleQuickAddNote}
          />
        );
      case "streak":
        return <StreakPage onBack={() => setActiveTab("home")} />;
      case "quote":
        return <QuotePage onBack={() => setActiveTab("home")} />;
      case "routines":
        return (
          <Suspense fallback={<PageSkeleton />}>
            <RoutinesPage />
          </Suspense>
        );
      case "notes":
        return (
          <Suspense fallback={<PageSkeleton />}>
            <NotesPage
              initialQuickAdd={quickAddNoteOpen}
              onQuickAddHandled={() => setQuickAddNoteOpen(false)}
            />
          </Suspense>
        );
      case "records":
        return (
          <Suspense fallback={<PageSkeleton />}>
            <RecordsPage />
          </Suspense>
        );
      case "settings":
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
      <div className="animate-fade-in">{renderPage()}</div>
      <ToastContainer />
      <MigrationModal
        isOpen={showMigration}
        onClose={() => setShowMigration(false)}
      />
    </AppLayout>
  );
}
