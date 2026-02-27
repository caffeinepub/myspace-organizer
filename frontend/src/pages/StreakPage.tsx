/**
 * Streak tracking page showing current streak, longest streak, check-in history,
 * and a check-in button. Uses accent color for the streak ring and CTA button.
 * Displays all timestamps in "DD MMM YYYY, h:mm A" format.
 */
import React from 'react';
import { useDataStore } from '../store/dataStore';
import { formatDateTime } from '../utils/formatDateTime';
import { Flame, Trophy, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StreakPage() {
  const { streak, checkIn } = useDataStore();

  const today = new Date().toDateString();
  const alreadyCheckedIn =
    streak.lastCheckIn !== null &&
    new Date(streak.lastCheckIn).toDateString() === today;

  const handleCheckIn = () => {
    if (alreadyCheckedIn) {
      toast.info('Already checked in today!');
      return;
    }
    checkIn();
    toast.success('Check-in recorded! Keep it up! 🔥');
  };

  // Compute ring progress (max 30 days for display)
  const progress = Math.min(streak.currentStreak / 30, 1);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Daily Streak</h1>

      {/* Streak Ring */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flame className="w-6 h-6 mb-1" style={{ color: 'var(--accent)' }} />
            <span className="text-3xl font-bold">{streak.currentStreak}</span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>

        {/* Check-in button */}
        <button
          onClick={handleCheckIn}
          disabled={alreadyCheckedIn}
          className="px-8 py-3 rounded-full font-semibold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{
            background: alreadyCheckedIn ? 'var(--muted)' : 'var(--accent)',
            color: alreadyCheckedIn ? 'var(--muted-foreground)' : 'var(--accent-text, #1a1a1a)',
          }}
        >
          {alreadyCheckedIn ? '✓ Checked In Today' : 'Check In Now'}
        </button>

        {streak.lastCheckIn && (
          <p className="text-sm text-muted-foreground">
            Last check-in: <span className="font-medium">{formatDateTime(streak.lastCheckIn)}</span>
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
          <Flame className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--accent)' }} />
          <p className="text-2xl font-bold">{streak.currentStreak}</p>
          <p className="text-xs text-muted-foreground">Current</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
          <Trophy className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--accent)' }} />
          <p className="text-2xl font-bold">{streak.longestStreak}</p>
          <p className="text-xs text-muted-foreground">Longest</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
          <CheckCircle className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--accent)' }} />
          <p className="text-2xl font-bold">{streak.totalCheckIns}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Check-in History */}
      {streak.checkIns.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            Check-in History
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...streak.checkIns].reverse().map((checkInTs, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: 'var(--accent)' }}
                />
                <span className="text-sm">{formatDateTime(checkInTs)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {streak.checkIns.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Flame className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No check-ins yet</p>
          <p className="text-sm">Start your streak by checking in today!</p>
        </div>
      )}
    </div>
  );
}
