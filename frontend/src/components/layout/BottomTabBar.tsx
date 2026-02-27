/**
 * Mobile bottom navigation tab bar with 5 primary tabs.
 * Active tab indicator uses the accent CSS variable for color.
 */
import React from 'react';
import { Home, FileText, BarChart2, Flame, Calendar } from 'lucide-react';
import { TabId } from '../../App';

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'notes', label: 'Notes', icon: <FileText className="w-5 h-5" /> },
  { id: 'records', label: 'Records', icon: <BarChart2 className="w-5 h-5" /> },
  { id: 'routines', label: 'Routines', icon: <Calendar className="w-5 h-5" /> },
  { id: 'streak', label: 'Streak', icon: <Flame className="w-5 h-5" /> },
];

export default function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <nav className="flex items-center bg-card/95 backdrop-blur-md border-t border-border/50 safe-area-bottom">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all duration-150"
            style={isActive ? { color: 'var(--accent)' } : { color: 'var(--muted-foreground, #888)' }}
          >
            {tab.icon}
            <span className="text-[10px] font-medium">{tab.label}</span>
            {isActive && (
              <span
                className="absolute bottom-0 w-8 h-0.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
