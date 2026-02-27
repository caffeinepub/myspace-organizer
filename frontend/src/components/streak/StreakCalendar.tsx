import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StreakCalendarProps {
  history: number[];
}

export function StreakCalendar({ history }: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfWeek = getDay(startOfMonth(currentMonth));
  const checkInDates = history.map(ts => new Date(ts));

  const isCheckedIn = (day: Date) => checkInDates.some(d => isSameDay(d, day));
  const isToday = (day: Date) => isSameDay(day, new Date());

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-semibold text-sm">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const checked = isCheckedIn(day);
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-xs font-medium
                transition-all duration-150
                ${checked ? 'bg-primary text-primary-foreground' : ''}
                ${today && !checked ? 'border-2 border-primary text-primary' : ''}
                ${!checked && !today ? 'text-muted-foreground' : ''}
              `}
              aria-label={`${format(day, 'MMM d')}${checked ? ', checked in' : ''}`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Checked in ({history.length} days)</span>
        </div>
      </div>
    </div>
  );
}
