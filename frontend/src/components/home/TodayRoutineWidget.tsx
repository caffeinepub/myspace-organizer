import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { format, parse } from 'date-fns';
import { useRoutines, getTodayProfile } from '../../hooks/useRoutines';

interface TodayRoutineWidgetProps {
  onNavigate: () => void;
}

export function TodayRoutineWidget({ onNavigate }: TodayRoutineWidgetProps) {
  const { getProfile } = useRoutines();
  const todayType = getTodayProfile();
  const profile = getProfile(todayType);
  const items = profile?.items.slice(0, 4) || [];

  const formatTime = (time: string) => {
    try {
      return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
    } catch {
      return time;
    }
  };

  return (
    <button
      onClick={onNavigate}
      className="w-full bg-card rounded-xl border border-border/50 p-4 text-left hover:shadow-card-hover transition-all duration-150 active:scale-[0.98]"
      aria-label="Today's routine widget, tap to open"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-teal-500" />
          </div>
          <div>
            <span className="font-semibold text-sm">Today's Routine</span>
            <span className="ml-2 text-xs text-muted-foreground capitalize">({todayType})</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {items.length > 0 ? (
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground w-14 shrink-0">{formatTime(item.time)}</span>
              <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                {item.icon} {item.title}
              </span>
            </div>
          ))}
          {(profile?.items.length || 0) > 4 && (
            <p className="text-xs text-muted-foreground">+{(profile?.items.length || 0) - 4} more</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No routine set up yet</p>
      )}
    </button>
  );
}
