import React from 'react';
import { Flame, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckInButtonProps {
  hasCheckedIn: boolean;
  onCheckIn: () => void;
  streakCount: number;
}

export function CheckInButton({ hasCheckedIn, onCheckIn, streakCount }: CheckInButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className={`text-6xl font-bold text-primary ${!hasCheckedIn ? 'streak-fire' : ''}`}>
          {streakCount}
        </div>
        <div className="text-center text-sm text-muted-foreground mt-1">day streak</div>
      </div>

      <Button
        onClick={onCheckIn}
        disabled={hasCheckedIn}
        size="lg"
        className={`
          gap-2 px-8 py-3 rounded-2xl font-semibold transition-all duration-200
          ${hasCheckedIn
            ? 'bg-green-500/20 text-green-500 border border-green-500/30 cursor-default'
            : 'bg-primary text-primary-foreground hover:scale-105 active:scale-95'
          }
        `}
        aria-label={hasCheckedIn ? 'Already checked in today' : 'Check in for today'}
      >
        {hasCheckedIn ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Checked In Today!
          </>
        ) : (
          <>
            <Flame className="w-5 h-5" />
            Check In Today
          </>
        )}
      </Button>
    </div>
  );
}
