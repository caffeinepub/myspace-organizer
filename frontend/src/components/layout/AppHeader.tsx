/**
 * Application header with app title/logo and quick settings toggle.
 * Shows the current page title and a settings shortcut button.
 */
import React from 'react';
import { Settings, Sparkles } from 'lucide-react';
import { TabId } from '../../App';

interface AppHeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const PAGE_TITLES: Record<TabId, string> = {
  home: 'My Organizer',
  notes: 'Notes',
  records: 'Records',
  routines: 'Routines',
  streak: 'Streak',
  quotes: 'Quotes',
  settings: 'Settings',
};

export default function AppHeader({ activeTab, onTabChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
        >
          <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <span style={{ color: 'var(--accent)' }}>{PAGE_TITLES[activeTab]}</span>
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className="p-2 rounded-lg hover:bg-muted/60 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
