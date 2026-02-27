import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import type { StreakData } from '../db/schema';
import { showSuccessToast, showErrorToast, showInfoToast } from '../store/toastStore';
import { isSameDay, isYesterday } from 'date-fns';

export function useStreak() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      let data = await db.streak.toCollection().first();
      if (!data) {
        const id = await db.streak.add({ count: 0, lastCheckIn: null, history: [] });
        data = await db.streak.get(id);
      }
      setStreak(data || null);
    } catch {
      showErrorToast('Failed to load streak data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const hasCheckedInToday = streak?.lastCheckIn
    ? isSameDay(new Date(streak.lastCheckIn), new Date())
    : false;

  const checkIn = useCallback(async () => {
    if (!streak) return;
    if (hasCheckedInToday) {
      showInfoToast('Already checked in today!');
      return;
    }
    try {
      const now = Date.now();
      const lastCheckIn = streak.lastCheckIn;
      let newCount = streak.count;

      if (lastCheckIn && isYesterday(new Date(lastCheckIn))) {
        newCount = streak.count + 1;
      } else if (!lastCheckIn) {
        newCount = 1;
      } else {
        // Streak broken
        newCount = 1;
      }

      const updated: StreakData = {
        ...streak,
        count: newCount,
        lastCheckIn: now,
        history: [...streak.history, now],
      };
      await db.streak.put(updated);
      setStreak(updated);
      showSuccessToast(`🔥 Day ${newCount} streak! Keep it up!`);
    } catch {
      showErrorToast('Failed to check in. Please try again.');
    }
  }, [streak, hasCheckedInToday]);

  return { streak, loading, hasCheckedInToday, checkIn, reload: load };
}
