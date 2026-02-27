import React from 'react';
import { BottomTabBar } from './BottomTabBar';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppLayout({ children, activeTab, onTabChange }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background app-bg">
      {/* Sidebar - desktop only */}
      <AppSidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-6">
          {children}
        </div>
      </main>

      {/* Bottom tab bar - mobile only */}
      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
