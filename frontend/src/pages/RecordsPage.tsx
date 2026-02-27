/**
 * Personal records tracking page with add/edit/delete functionality, category filtering,
 * and export. All timestamps displayed in "DD MMM YYYY, h:mm A" format.
 */
import React, { useState } from 'react';
import { useDataStore, Record } from '../store/dataStore';
import { formatDateTime } from '../utils/formatDateTime';
import { Plus, Trash2, Edit2, X, BarChart2, Download } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'Fitness', 'Health', 'Finance', 'Learning', 'Personal', 'Other'];

export default function RecordsPage() {
  const { records, addRecord, updateRecord, deleteRecord } = useDataStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [form, setForm] = useState({
    title: '',
    value: '',
    unit: '',
    category: 'Personal',
    notes: '',
  });

  const filtered =
    selectedCategory === 'All'
      ? records
      : records.filter((r) => r.category === selectedCategory);

  const resetForm = () => {
    setForm({ title: '', value: '', unit: '', category: 'Personal', notes: '' });
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.value.trim()) {
      toast.error('Title and value are required');
      return;
    }
    if (editingRecord) {
      updateRecord(editingRecord.id, form);
      toast.success('Record updated');
    } else {
      addRecord(form);
      toast.success('Record added');
    }
    resetForm();
  };

  const handleEdit = (record: Record) => {
    setForm({
      title: record.title,
      value: record.value,
      unit: record.unit,
      category: record.category,
      notes: record.notes,
    });
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteRecord(id);
    toast.success('Record deleted');
  };

  const handleExport = () => {
    const csv = [
      'Title,Value,Unit,Category,Notes,Created At',
      ...records.map(
        (r) =>
          `"${r.title}","${r.value}","${r.unit}","${r.category}","${r.notes}","${formatDateTime(r.createdAt)}"`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Records exported at ${formatDateTime(new Date())}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Records</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--accent)', color: 'var(--accent-text, #1a1a1a)' }}
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all border"
              style={
                isActive
                  ? {
                      background: 'var(--accent-soft)',
                      borderColor: 'var(--accent)',
                      color: 'var(--accent)',
                    }
                  : {
                      borderColor: 'var(--border)',
                      color: 'var(--muted-foreground)',
                    }
              }
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editingRecord ? 'Edit Record' : 'New Record'}</h3>
            <button onClick={resetForm} className="p-1 hover:bg-muted/50 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Morning Run"
                  className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Value *
                </label>
                <input
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder="e.g. 5.2"
                  className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Unit</label>
                <input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="e.g. km, kg, $"
                  className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes..."
                rows={2}
                className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg text-sm border border-border/50 hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'var(--accent)', color: 'var(--accent-text, #1a1a1a)' }}
              >
                {editingRecord ? 'Update' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <img
            src="/assets/generated/records-empty.dim_400x300.png"
            alt="No records"
            className="w-48 mx-auto mb-4 opacity-60"
          />
          <p className="text-muted-foreground font-medium">No records yet</p>
          <p className="text-sm text-muted-foreground">
            Start tracking your personal bests!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <div
              key={record.id}
              className="bg-card rounded-xl border border-border/50 p-4 flex items-start gap-3"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--accent-soft)' }}
              >
                <BarChart2 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{record.title}</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                      {record.value}
                      {record.unit && (
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {record.unit}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(record)}
                      className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
                {record.notes && (
                  <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    {record.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(record.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
