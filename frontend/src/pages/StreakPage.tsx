import React from 'react';
import { ArrowLeft, Flame } from 'lucide-react';
import { useStreak } from '../hooks/useStreak';
import { CheckInButton } from '../components/streak/CheckInButton';
import { StreakCalendar } from '../components/streak/StreakCalendar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDateTime } from '../utils/dateFormatter';

interface StreakPageProps {
  onBack: () => void;
}

export function StreakPage({ onBack }: StreakPageProps) {
  const { streak, loading, hasCheckedInToday, checkIn } = useStreak();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Go back">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold">Streak Tracker</h1>
      </div>

      {/* Main streak display */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 mb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Flame className="w-6 h-6 text-orange-500" />
          <span className="text-sm font-medium text-muted-foreground">Current Streak</span>
        </div>
        <CheckInButton
          hasCheckedIn={hasCheckedInToday}
          onCheckIn={checkIn}
          streakCount={streak?.count ?? 0}
        />
        {streak?.lastCheckIn && (
          <p className="text-xs text-muted-foreground mt-4">
            Last check-in: {formatDateTime(streak.lastCheckIn)}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
          <div className="text-2xl font-bold text-primary">{streak?.count ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-1">Current Streak</div>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
          <div className="text-2xl font-bold text-primary">{streak?.history.length ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Check-ins</div>
        </div>
      </div>

      {/* Calendar */}
      <StreakCalendar history={streak?.history ?? []} />
    </div>
  );
}
