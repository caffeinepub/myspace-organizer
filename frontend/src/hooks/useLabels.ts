import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';
import type { Label } from '../db/schema';
import { showSuccessToast, showErrorToast } from '../store/toastStore';

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const all = await db.labels.toArray();
      setLabels(all);
    } catch {
      showErrorToast('Failed to load labels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createLabel = useCallback(async (name: string, color: string) => {
    try {
      const id = await db.labels.add({ name, color, createdAt: Date.now() });
      const created = await db.labels.get(id);
      if (created) setLabels(prev => [...prev, created]);
      showSuccessToast('Label created!');
    } catch {
      showErrorToast('Failed to create label');
    }
  }, []);

  const updateLabel = useCallback(async (label: Label) => {
    try {
      await db.labels.put(label);
      setLabels(prev => prev.map(l => l.id === label.id ? label : l));
      showSuccessToast('Label updated!');
    } catch {
      showErrorToast('Failed to update label');
    }
  }, []);

  const deleteLabel = useCallback(async (id: number) => {
    try {
      await db.labels.delete(id);
      setLabels(prev => prev.filter(l => l.id !== id));
      showSuccessToast('Label deleted');
    } catch {
      showErrorToast('Failed to delete label');
    }
  }, []);

  return { labels, loading, createLabel, updateLabel, deleteLabel, reload: load };
}
