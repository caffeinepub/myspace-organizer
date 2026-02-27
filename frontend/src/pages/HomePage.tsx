import React, { useState, useEffect } from 'react';
import { StreakWidget } from '../components/home/StreakWidget';
import { QuoteWidget } from '../components/home/QuoteWidget';
import { TodayRoutineWidget } from '../components/home/TodayRoutineWidget';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onQuickAddNote: () => void;
}

export function HomePage({ onNavigate, onQuickAddNote }: HomePageProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = format(now, 'EEEE, MMMM d');
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-xs text-muted-foreground">{dateStr}</p>
          <span className="text-xs text-muted-foreground opacity-40">·</span>
          <p className="text-xs font-medium text-primary">{timeStr}</p>
        </div>
        <h1 className="text-2xl font-bold mt-0.5">Hi Dev...💛</h1>
      </div>

      {/* Widgets grid */}
      <div className="space-y-3">
        <StreakWidget onNavigate={() => onNavigate('streak')} />
        <QuoteWidget onNavigate={() => onNavigate('quote')} />
        <TodayRoutineWidget onNavigate={() => onNavigate('routines')} />
      </div>

      {/* Quick add note FAB */}
      <button
        onClick={onQuickAddNote}
        className="fixed bottom-24 md:bottom-8 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-modal flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150 z-30"
        aria-label="Quick add note"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Footer */}
      <footer className="mt-12 pb-4 text-center">
        <p className="text-xs text-muted-foreground">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'myorganizer-pro')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
          {' '}· © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
