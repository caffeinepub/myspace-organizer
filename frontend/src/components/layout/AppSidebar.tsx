import React from 'react';
import { Home, Calendar, StickyNote, BookOpen, Settings, Flame } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'routines', label: 'Routines', icon: Calendar },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'records', label: 'Records', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  return (
    <aside
      className="hidden md:flex flex-col w-56 bg-sidebar border-r border-sidebar-border shrink-0"
      aria-label="Sidebar navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Flame className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <div className="font-bold text-sm text-sidebar-foreground">MyOrganizer</div>
          <div className="text-[10px] text-muted-foreground">Pro</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Main navigation">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }
              `}
              aria-label={`${label}${isActive ? ', currently active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'myorganizer-pro')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </aside>
  );
}
