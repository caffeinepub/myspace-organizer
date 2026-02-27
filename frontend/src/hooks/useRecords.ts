import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../db/db';
import type { Record } from '../db/schema';
import { showSuccessToast, showErrorToast } from '../store/toastStore';
import { startOfDay, endOfDay } from 'date-fns';

export function useRecords() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const load = useCallback(async () => {
    try {
      const all = await db.records.toArray();
      // Sort by createdAt descending
      all.sort((a, b) => b.createdAt - a.createdAt);
      setRecords(all);
    } catch {
      showErrorToast('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = records;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)
      );
    }
    if (dateFrom) {
      const from = startOfDay(new Date(dateFrom));
      result = result.filter(r => new Date(r.createdAt) >= from);
    }
    if (dateTo) {
      const to = endOfDay(new Date(dateTo));
      result = result.filter(r => new Date(r.createdAt) <= to);
    }
    return result;
  }, [records, search, dateFrom, dateTo]);

  const addRecord = useCallback(async (title: string, content: string) => {
    try {
      const now = Date.now();
      const id = await db.records.add({ title, content, createdAt: now, updatedAt: now });
      const newRecord = await db.records.get(id);
      if (newRecord) setRecords(prev => [newRecord, ...prev]);
      showSuccessToast('Record saved!');
    } catch {
      showErrorToast('Failed to save record');
    }
  }, []);

  const updateRecord = useCallback(async (record: Record) => {
    try {
      const updated = { ...record, updatedAt: Date.now() };
      await db.records.put(updated);
      setRecords(prev => prev.map(r => r.id === record.id ? updated : r));
      showSuccessToast('Record updated!');
    } catch {
      showErrorToast('Failed to update record');
    }
  }, []);

  const deleteRecord = useCallback(async (id: number) => {
    try {
      await db.records.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      showSuccessToast('Record deleted');
    } catch {
      showErrorToast('Failed to delete record');
    }
  }, []);

  const exportRecords = useCallback(async () => {
    try {
      const all = await db.records.toArray();
      const json = JSON.stringify(all, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `records-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccessToast('Records exported!');
    } catch {
      showErrorToast('Failed to export records');
    }
  }, []);

  return {
    records: filtered,
    allRecords: records,
    loading,
    search, setSearch,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    addRecord, updateRecord, deleteRecord, exportRecords,
    reload: load,
  };
}
