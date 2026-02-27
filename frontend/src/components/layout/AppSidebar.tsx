/**
 * Desktop sidebar navigation with icon + label nav items.
 * Active item is highlighted using the accent color CSS variable.
 */
import React from 'react';
import {
  Home,
  FileText,
  BarChart2,
  Calendar,
  Flame,
  Quote,
  Settings,
} from 'lucide-react';
import { TabId } from '../../App';

interface AppSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const NAV_ITEMS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
  { id: 'records', label: 'Records', icon: <BarChart2 className="w-4 h-4" /> },
  { id: 'routines', label: 'Routines', icon: <Calendar className="w-4 h-4" /> },
  { id: 'streak', label: 'Streak', icon: <Flame className="w-4 h-4" /> },
  { id: 'quotes', label: 'Quotes', icon: <Quote className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  return (
    <nav className="flex flex-col gap-1 p-3 pt-6">
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full text-left"
            style={
              isActive
                ? {
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    borderLeft: '3px solid var(--accent)',
                  }
                : {
                    color: 'var(--muted-foreground, #888)',
                    borderLeft: '3px solid transparent',
                  }
            }
          >
            <span style={isActive ? { color: 'var(--accent)' } : {}}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
