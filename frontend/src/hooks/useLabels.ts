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

  const createLabel = useCallback(async (name: string, color?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Prevent creating a label named "All" (reserved)
    if (trimmed.toLowerCase() === 'all') return;
    // Prevent duplicates (case-insensitive)
    const existing = await db.labels.toArray();
    const duplicate = existing.some(l => l.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) return;
    try {
      const id = await db.labels.add({ name: trimmed, color: color ?? '#6366f1', createdAt: Date.now() });
      const created = await db.labels.get(id);
      if (created) setLabels(prev => [...prev, created]);
      showSuccessToast('Label created!');
    } catch {
      showErrorToast('Failed to create label');
    }
  }, []);

  const updateLabel = useCallback(async (label: Label) => {
    // Guard: never rename a label whose current name is "All"
    if (label.name.toLowerCase() === 'all') return;
    try {
      // Also check the stored label to be safe
      if (label.id !== undefined) {
        const stored = await db.labels.get(label.id);
        if (stored && stored.name.toLowerCase() === 'all') return;
      }
      await db.labels.put(label);
      setLabels(prev => prev.map(l => l.id === label.id ? label : l));
      showSuccessToast('Label updated!');
    } catch {
      showErrorToast('Failed to update label');
    }
  }, []);

  /**
   * Deletes a label by numeric id.
   * Accepts an optional callback to reassign notes that used this label
   * (pass bulkReassignLabel from useNotes).
   */
  const deleteLabel = useCallback(async (id: number, onReassign?: (labelName: string) => Promise<void>) => {
    try {
      const label = await db.labels.get(id);
      if (!label) return;
      // Guard: never delete a label named "All"
      if (label.name.toLowerCase() === 'all') return;
      // Reassign notes that used this label before removing it
      if (onReassign) {
        await onReassign(label.name);
      } else {
        // Fallback: directly remove the label from all notes
        const allNotes = await db.notes.toArray();
        const affected = allNotes.filter(n => n.labels.includes(label.name));
        for (const n of affected) {
          await db.notes.put({ ...n, labels: n.labels.filter(l => l !== label.name), updatedAt: Date.now() });
        }
      }
      await db.labels.delete(id);
      setLabels(prev => prev.filter(l => l.id !== id));
      showSuccessToast('Label deleted');
    } catch {
      showErrorToast('Failed to delete label');
    }
  }, []);

  return { labels, loading, createLabel, updateLabel, deleteLabel, reload: load };
}
