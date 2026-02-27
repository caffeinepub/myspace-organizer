import React, { useState } from 'react';
import { Search, Plus, Download, X, Pencil, Trash2, BookOpen, Calendar } from 'lucide-react';
import { useRecords } from '../hooks/useRecords';
import { Modal } from '../components/common/Modal';
import type { Record } from '../db/schema';
import { formatDateTime } from '../utils/dateFormatter';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showErrorToast } from '../store/toastStore';

export function RecordsPage() {
  const {
    records, loading, search, setSearch, dateFrom, setDateFrom, dateTo, setDateTo,
    addRecord, updateRecord, deleteRecord, exportRecords,
  } = useRecords();

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  const openAdd = () => {
    setEditingRecord(null);
    setFormTitle('');
    setFormContent('');
    setShowForm(true);
  };

  const openEdit = (record: Record) => {
    setEditingRecord(record);
    setFormTitle(record.title);
    setFormContent(record.content);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { showErrorToast('Title is required'); return; }
    if (editingRecord) {
      await updateRecord({ ...editingRecord, title: formTitle.trim(), content: formContent.trim() });
    } else {
      await addRecord(formTitle.trim(), formContent.trim());
    }
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    await deleteRecord(id);
    setShowForm(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Records</h1>
        <div className="flex gap-2">
          <button
            onClick={exportRecords}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Export records as JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            aria-label="Add new record"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search records..."
          className="w-full pl-9 pr-4 py-2 bg-muted/50 rounded-xl text-sm outline-none border border-border/50 focus:border-primary transition-colors"
          aria-label="Search records"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Clear search">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Date filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="text-[10px] text-muted-foreground mb-1 block">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="w-full bg-muted/50 rounded-lg p-2 text-xs border border-border/50 outline-none"
            aria-label="Filter from date"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-muted-foreground mb-1 block">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="w-full bg-muted/50 rounded-lg p-2 text-xs border border-border/50 outline-none"
            aria-label="Filter to date"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); }}
            className="self-end p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Clear date filter"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Records list */}
      {records.length === 0 ? (
        <div className="text-center py-12">
          <img
            src="/assets/generated/records-empty.dim_400x300.png"
            alt="No records"
            className="w-48 mx-auto mb-4 opacity-60"
          />
          <p className="text-muted-foreground text-sm">No records yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Tap "Add" to log your first entry</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <div
              key={record.id}
              className="bg-card rounded-xl border border-border/50 p-4 hover:shadow-card transition-all duration-150 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{record.title}</h3>
                  {record.content && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{record.content}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <Calendar className="w-3 h-3 text-muted-foreground/60" />
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(record.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(record)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    aria-label={`Edit record: ${record.title}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => record.id && handleDelete(record.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    aria-label={`Delete record: ${record.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingRecord ? 'Edit Record' : 'New Record'} size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
            <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Record title" aria-label="Record title" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Content</label>
            <textarea
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              placeholder="Write your log entry..."
              className="w-full bg-muted/50 rounded-lg p-3 text-sm outline-none resize-none min-h-[120px] border border-border/50 focus:border-primary transition-colors"
              aria-label="Record content"
            />
          </div>
          <div className="flex gap-2">
            {editingRecord && (
              <Button variant="destructive" onClick={() => editingRecord.id && handleDelete(editingRecord.id)} className="gap-1" aria-label="Delete record">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            )}
            <Button onClick={handleSave} className="flex-1" aria-label="Save record">
              {editingRecord ? 'Update' : 'Save Record'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
