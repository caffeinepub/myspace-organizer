import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Download, X, Pencil, Trash2, BookOpen, Calendar, Mic, MicOff, Image as ImageIcon } from 'lucide-react';
import { useRecords } from '../hooks/useRecords';
import { Modal } from '../components/common/Modal';
import type { Record } from '../db/schema';
import { formatDateTime } from '../utils/dateFormatter';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showErrorToast, showSuccessToast } from '../store/toastStore';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { exportRecordsAsTxt, exportRecordsAsDoc, exportRecordsAsJson } from '../utils/recordExport';
import { compressRecordImage, saveRecordImage } from '../hooks/useRecordImages';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export function RecordsPage() {
  const {
    records, loading, search, setSearch, dateFrom, setDateFrom, dateTo, setDateTo,
    addRecord, updateRecord, deleteRecord, exportRecords,
  } = useRecords();

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  // ---- NEW: image attachment state (Add form only) ----
  const [newRecordImagePreview, setNewRecordImagePreview] = useState<string | null>(null);
  const [newRecordImageDataUrl, setNewRecordImageDataUrl] = useState<string | null>(null);
  const [newRecordImageLoading, setNewRecordImageLoading] = useState(false);
  const recordImageInputRef = useRef<HTMLInputElement>(null);

  // ---- NEW: speech-to-text (Add form only) ----
  const {
    isSupported: recordSpeechSupported,
    isListening: recordSpeechListening,
    transcript: recordSpeechTranscript,
    interimTranscript: recordSpeechInterim,
    startListening: recordSpeechStart,
    stopListening: recordSpeechStop,
    resetTranscript: recordSpeechReset,
  } = useSpeechRecognition();

  // Append finalized speech transcript into formContent
  const prevRecordTranscriptRef = useRef('');
  useEffect(() => {
    if (recordSpeechTranscript && recordSpeechTranscript !== prevRecordTranscriptRef.current) {
      const newPart = recordSpeechTranscript.slice(prevRecordTranscriptRef.current.length);
      if (newPart) {
        setFormContent(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + newPart.trim());
      }
      prevRecordTranscriptRef.current = recordSpeechTranscript;
    }
  }, [recordSpeechTranscript]);

  const openAdd = () => {
    setEditingRecord(null);
    setFormTitle('');
    setFormContent('');
    setNewRecordImagePreview(null);
    setNewRecordImageDataUrl(null);
    prevRecordTranscriptRef.current = '';
    recordSpeechReset();
    setShowForm(true);
  };

  const openEdit = (record: Record) => {
    setEditingRecord(record);
    setFormTitle(record.title);
    setFormContent(record.content);
    setNewRecordImagePreview(null);
    setNewRecordImageDataUrl(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { showErrorToast('Title is required'); return; }
    if (editingRecord) {
      await updateRecord({ ...editingRecord, title: formTitle.trim(), content: formContent.trim() });
    } else {
      // Add record first, then attach image if present
      const prevCount = records.length;
      await addRecord(formTitle.trim(), formContent.trim());
      // After adding, save image under the new record's id if we have one
      if (newRecordImageDataUrl) {
        // We need the new record's id — reload from db after add
        // Use a small delay to let state settle, then find the newest record
        setTimeout(async () => {
          try {
            const { db } = await import('../db/db');
            const all = await db.records.toArray();
            all.sort((a, b) => b.createdAt - a.createdAt);
            const newest = all[0];
            if (newest && newest.id !== undefined) {
              saveRecordImage(newest.id, newRecordImageDataUrl);
            }
          } catch {
            // Image save failed silently — record itself was saved fine
          }
        }, 200);
      }
    }
    if (recordSpeechListening) recordSpeechStop();
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    await deleteRecord(id);
    setShowForm(false);
  };

  // ---- NEW: handle image file selection ----
  const handleRecordImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewRecordImageLoading(true);
    try {
      const dataUrl = await compressRecordImage(file);
      setNewRecordImageDataUrl(dataUrl);
      setNewRecordImagePreview(dataUrl);
    } catch {
      showErrorToast('Failed to process image');
    } finally {
      setNewRecordImageLoading(false);
      // Reset input so same file can be re-selected
      if (recordImageInputRef.current) recordImageInputRef.current.value = '';
    }
  };

  const handleRemoveNewRecordImage = () => {
    setNewRecordImagePreview(null);
    setNewRecordImageDataUrl(null);
    if (recordImageInputRef.current) recordImageInputRef.current.value = '';
  };

  // ---- NEW: toggle mic ----
  const handleRecordMicToggle = () => {
    if (recordSpeechListening) {
      recordSpeechStop();
    } else {
      prevRecordTranscriptRef.current = '';
      recordSpeechReset();
      recordSpeechStart();
    }
  };

  // ---- NEW: export handlers ----
  const handleExportRecordsTxt = () => {
    try {
      exportRecordsAsTxt(records);
      showSuccessToast('Exported as TXT');
    } catch {
      showErrorToast('Export failed');
    }
  };

  const handleExportRecordsDoc = () => {
    try {
      exportRecordsAsDoc(records);
      showSuccessToast('Exported as DOC');
    } catch {
      showErrorToast('Export failed');
    }
  };

  const handleExportRecordsJson = () => {
    try {
      exportRecordsAsJson(records);
      showSuccessToast('Exported as JSON');
    } catch {
      showErrorToast('Export failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Records</h1>
        <div className="flex gap-2">
          {/* Existing export button — unchanged */}
          <button
            onClick={exportRecords}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Export records as JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* NEW: additional export format dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground text-xs font-medium border border-border/50"
                aria-label="Export records in other formats"
              >
                Export
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportRecordsTxt}>
                Export as TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportRecordsDoc}>
                Export as DOC (Word)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportRecordsJson}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
      <Modal isOpen={showForm} onClose={() => { if (recordSpeechListening) recordSpeechStop(); setShowForm(false); }} title={editingRecord ? 'Edit Record' : 'New Record'} size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
            <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Record title" aria-label="Record title" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground">Content</label>
              {/* NEW: Mic button — Add form only */}
              {!editingRecord && (
                <div className="flex items-center gap-1.5">
                  {recordSpeechSupported ? (
                    <button
                      type="button"
                      onClick={handleRecordMicToggle}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                        recordSpeechListening
                          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                      aria-label={recordSpeechListening ? 'Stop dictation' : 'Start dictation'}
                    >
                      {recordSpeechListening ? (
                        <><MicOff className="w-3.5 h-3.5" /> Stop</>
                      ) : (
                        <><Mic className="w-3.5 h-3.5" /> Mic</>
                      )}
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">Speech-to-text not supported on this browser.</span>
                  )}
                </div>
              )}
            </div>
            <textarea
              value={formContent + (recordSpeechListening && recordSpeechInterim ? ' ' + recordSpeechInterim : '')}
              onChange={e => {
                // Only update formContent directly; strip interim if listening
                if (recordSpeechListening && recordSpeechInterim) {
                  const withoutInterim = e.target.value.replace(' ' + recordSpeechInterim, '');
                  setFormContent(withoutInterim);
                } else {
                  setFormContent(e.target.value);
                }
              }}
              placeholder={recordSpeechListening ? 'Listening...' : 'Write your log entry...'}
              className="w-full bg-muted/50 rounded-lg p-3 text-sm outline-none resize-none min-h-[120px] border border-border/50 focus:border-primary transition-colors"
              aria-label="Record content"
            />
            {recordSpeechListening && (
              <p className="text-[10px] text-primary mt-1 animate-pulse">● Listening — speak now…</p>
            )}
          </div>

          {/* NEW: Image attachment — Add form only */}
          {!editingRecord && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Image (optional)</label>
              <input
                ref={recordImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Select image for record"
                onChange={handleRecordImageSelect}
              />
              {newRecordImagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={newRecordImagePreview}
                    alt="Selected image preview"
                    className="w-24 h-24 object-cover rounded-lg border border-border/50"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveNewRecordImage}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => recordImageInputRef.current?.click()}
                  disabled={newRecordImageLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 hover:bg-muted transition-colors text-xs text-muted-foreground disabled:opacity-50"
                  aria-label="Add image to record"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  {newRecordImageLoading ? 'Processing…' : 'Add Image'}
                </button>
              )}
            </div>
          )}

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
