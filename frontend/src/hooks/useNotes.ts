import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../db/db';
import type { Note } from '../db/schema';
import { showSuccessToast, showErrorToast } from '../store/toastStore';

export type NotesView = 'all' | 'archive' | 'trash';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState<string>('');
  const [view, setView] = useState<NotesView>('all');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      const all = await db.notes.toArray();
      // Sort by updatedAt descending
      all.sort((a, b) => b.updatedAt - a.updatedAt);
      setNotes(all);
    } catch {
      showErrorToast('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = notes;
    if (view === 'all') result = result.filter(n => !n.archived && !n.trashed);
    else if (view === 'archive') result = result.filter(n => n.archived && !n.trashed);
    else if (view === 'trash') result = result.filter(n => n.trashed);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.checklistItems.some(i => i.text.toLowerCase().includes(q)) ||
        n.labels.some(l => l.toLowerCase().includes(q))
      );
    }
    if (labelFilter) {
      result = result.filter(n => n.labels.includes(labelFilter));
    }
    // Pinned first
    return [...result.filter(n => n.pinned), ...result.filter(n => !n.pinned)];
  }, [notes, view, search, labelFilter]);

  const createNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Date.now();
      const id = await db.notes.add({ ...note, createdAt: now, updatedAt: now });
      const created = await db.notes.get(id);
      if (created) setNotes(prev => [created, ...prev]);
      showSuccessToast('Note created!');
      return id;
    } catch {
      showErrorToast('Failed to create note');
      return null;
    }
  }, []);

  const updateNote = useCallback(async (note: Note) => {
    try {
      const updated = { ...note, updatedAt: Date.now() };
      await db.notes.put(updated);
      setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
      showSuccessToast('Note saved!');
    } catch {
      showErrorToast('Failed to save note');
    }
  }, []);

  const deleteNote = useCallback(async (id: number) => {
    try {
      await db.notes.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      showSuccessToast('Note deleted permanently');
    } catch {
      showErrorToast('Failed to delete note');
    }
  }, []);

  const trashNote = useCallback(async (id: number) => {
    try {
      const note = notes.find(n => n.id === id);
      if (!note) return;
      const updated = { ...note, trashed: true, archived: false, updatedAt: Date.now() };
      await db.notes.put(updated);
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      showSuccessToast('Note moved to trash');
    } catch {
      showErrorToast('Failed to trash note');
    }
  }, [notes]);

  const restoreNote = useCallback(async (id: number) => {
    try {
      const note = notes.find(n => n.id === id);
      if (!note) return;
      const updated = { ...note, trashed: false, archived: false, updatedAt: Date.now() };
      await db.notes.put(updated);
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      showSuccessToast('Note restored!');
    } catch {
      showErrorToast('Failed to restore note');
    }
  }, [notes]);

  const archiveNote = useCallback(async (id: number) => {
    try {
      const note = notes.find(n => n.id === id);
      if (!note) return;
      const updated = { ...note, archived: true, updatedAt: Date.now() };
      await db.notes.put(updated);
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      showSuccessToast('Note archived');
    } catch {
      showErrorToast('Failed to archive note');
    }
  }, [notes]);

  const togglePin = useCallback(async (id: number) => {
    try {
      const note = notes.find(n => n.id === id);
      if (!note) return;
      const updated = { ...note, pinned: !note.pinned, updatedAt: Date.now() };
      await db.notes.put(updated);
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
    } catch {
      showErrorToast('Failed to pin note');
    }
  }, [notes]);

  const bulkAction = useCallback(async (action: 'archive' | 'trash' | 'delete', ids: number[]) => {
    try {
      for (const id of ids) {
        const note = notes.find(n => n.id === id);
        if (!note) continue;
        if (action === 'archive') {
          await db.notes.put({ ...note, archived: true, updatedAt: Date.now() });
        } else if (action === 'trash') {
          await db.notes.put({ ...note, trashed: true, archived: false, updatedAt: Date.now() });
        } else if (action === 'delete') {
          await db.notes.delete(id);
        }
      }
      await load();
      setSelectedIds(new Set());
      showSuccessToast(`${ids.length} note(s) ${action === 'delete' ? 'deleted' : action + 'd'}`);
    } catch {
      showErrorToast('Bulk action failed');
    }
  }, [notes, load]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  return {
    notes: filtered,
    allNotes: notes,
    loading,
    search, setSearch,
    labelFilter, setLabelFilter,
    view, setView,
    selectedIds, toggleSelect, clearSelection,
    createNote, updateNote, deleteNote, trashNote, restoreNote, archiveNote, togglePin, bulkAction,
    reload: load,
  };
}
