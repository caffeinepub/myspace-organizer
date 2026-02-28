import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import type { RoutineProfile, RoutineItem } from '../db/schema';
import { showSuccessToast, showErrorToast } from '../store/toastStore';
import { getDay } from 'date-fns';
import { deleteRoutineImage } from './useRoutineImages';

export type ProfileType = 'weekday' | 'weekend';

export function getTodayProfile(): ProfileType {
  const day = getDay(new Date()); // 0=Sun, 6=Sat
  return day === 0 || day === 6 ? 'weekend' : 'weekday';
}

export function useRoutines() {
  const [weekday, setWeekday] = useState<RoutineProfile | null>(null);
  const [weekend, setWeekend] = useState<RoutineProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const all = await db.routines.toArray();
      const wd = all.find(r => r.profileType === 'weekday') || null;
      const we = all.find(r => r.profileType === 'weekend') || null;
      setWeekday(wd);
      setWeekend(we);
    } catch {
      showErrorToast('Failed to load routines');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getProfile = useCallback((type: ProfileType) => {
    return type === 'weekday' ? weekday : weekend;
  }, [weekday, weekend]);

  const saveProfile = useCallback(async (profile: RoutineProfile) => {
    try {
      if (profile.id) {
        await db.routines.put(profile);
      } else {
        const id = await db.routines.add(profile);
        profile = { ...profile, id };
      }
      if (profile.profileType === 'weekday') setWeekday(profile);
      else setWeekend(profile);
      showSuccessToast('Routine saved!');
    } catch {
      showErrorToast('Failed to save routine');
    }
  }, []);

  const addItem = useCallback(async (profileType: ProfileType, item: RoutineItem) => {
    const profile = profileType === 'weekday' ? weekday : weekend;
    if (!profile) return;
    const updated = { ...profile, items: [...profile.items, item] };
    await saveProfile(updated);
  }, [weekday, weekend, saveProfile]);

  const updateItem = useCallback(async (profileType: ProfileType, item: RoutineItem) => {
    const profile = profileType === 'weekday' ? weekday : weekend;
    if (!profile) return;
    const updated = { ...profile, items: profile.items.map(i => i.id === item.id ? item : i) };
    await saveProfile(updated);
  }, [weekday, weekend, saveProfile]);

  const deleteItem = useCallback(async (profileType: ProfileType, itemId: string) => {
    const profile = profileType === 'weekday' ? weekday : weekend;
    if (!profile) return;
    try {
      // Clean up any attached image for this item
      const item = profile.items.find(i => i.id === itemId);
      if (item?.imageId) {
        deleteRoutineImage(item.imageId);
      }
      const updated = { ...profile, items: profile.items.filter(i => i.id !== itemId) };
      await db.routines.put(updated);
      if (profileType === 'weekday') setWeekday(updated);
      else setWeekend(updated);
      showSuccessToast('Routine item deleted');
    } catch {
      showErrorToast('Failed to delete routine item');
    }
  }, [weekday, weekend]);

  const reorderItems = useCallback(async (profileType: ProfileType, items: RoutineItem[]) => {
    const profile = profileType === 'weekday' ? weekday : weekend;
    if (!profile) return;
    try {
      const updated = { ...profile, items };
      await db.routines.put(updated);
      if (profileType === 'weekday') setWeekday(updated);
      else setWeekend(updated);
    } catch {
      showErrorToast('Failed to reorder items');
    }
  }, [weekday, weekend]);

  const toggleComplete = useCallback(async (profileType: ProfileType, itemId: string) => {
    const profile = profileType === 'weekday' ? weekday : weekend;
    if (!profile) return;
    try {
      const updated = {
        ...profile,
        items: profile.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i),
      };
      await db.routines.put(updated);
      if (profileType === 'weekday') setWeekday(updated);
      else setWeekend(updated);
    } catch {
      showErrorToast('Failed to update item');
    }
  }, [weekday, weekend]);

  return { weekday, weekend, loading, getProfile, saveProfile, addItem, updateItem, deleteItem, reorderItems, toggleComplete, reload: load };
}
