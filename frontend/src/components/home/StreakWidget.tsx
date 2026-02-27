import React from 'react';
import { Flame, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useStreak } from '../../hooks/useStreak';

interface StreakWidgetProps {
  onNavigate: () => void;
}

export function StreakWidget({ onNavigate }: StreakWidgetProps) {
  const { streak, hasCheckedInToday } = useStreak();

  return (
    <button
      onClick={onNavigate}
      className="w-full bg-card rounded-xl border border-border/50 p-4 text-left hover:shadow-card-hover transition-all duration-150 active:scale-[0.98]"
      aria-label="Streak tracker widget, tap to open"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <span className="font-semibold text-sm">Streak</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-primary">{streak?.count ?? 0}</span>
        <span className="text-sm text-muted-foreground mb-1">days</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {streak?.lastCheckIn
            ? `Last: ${format(new Date(streak.lastCheckIn), 'MMM d, h:mm a')}`
            : 'No check-ins yet'
          }
        </span>
        {hasCheckedInToday && (
          <span className="text-xs text-green-500 font-medium">✓ Today</span>
        )}
      </div>
    </button>
  );
}
