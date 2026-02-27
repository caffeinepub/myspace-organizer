/**
 * Main application layout shell with responsive sidebar (desktop) and bottom tab bar (mobile).
 * Renders the header, navigation, and page content with glass-morphism styling.
 */
import React from 'react';
import { TabId } from '../../App';
import BottomTabBar from './BottomTabBar';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

interface AppLayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: React.ReactNode;
}

export default function AppLayout({ activeTab, onTabChange, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <AppHeader activeTab={activeTab} onTabChange={onTabChange} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - desktop only */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border/50 bg-card/50 backdrop-blur-sm">
          <AppSidebar activeTab={activeTab} onTabChange={onTabChange} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>
        </main>
      </div>

      {/* Bottom tab bar - mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  );
}
