import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Plus, X, Calendar, Tag, FileDown, FileText, FileJson, Mic, MicOff, Image, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime } from '../utils/dateFormatter';
import { exportRecordsAsTxt, exportRecordsAsDoc, exportRecordsAsJson } from '../utils/recordExport';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecordEntry {
  id: number;
  title: string;
  body: string;
  createdAt: number;
  tags: string[];
  imageId?: string;
}

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

const DB_NAME = 'myorganizer_records';
const DB_VERSION = 2;
const STORE_RECORDS = 'records';
const STORE_IMAGES = 'record_images';

function openRecordsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        db.createObjectStore(STORE_RECORDS, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAllRecords(): Promise<RecordEntry[]> {
  const db = await openRecordsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECORDS, 'readonly');
    const req = tx.objectStore(STORE_RECORDS).getAll();
    req.onsuccess = () => resolve(req.result as RecordEntry[]);
    req.onerror = () => reject(req.error);
  });
}

async function dbSaveRecord(record: Omit<RecordEntry, 'id'> & { id?: number }): Promise<number> {
  const db = await openRecordsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECORDS, 'readwrite');
    const store = tx.objectStore(STORE_RECORDS);
    const req = record.id !== undefined ? store.put(record) : store.add(record);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

async function dbDeleteRecord(id: number): Promise<void> {
  const db = await openRecordsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECORDS, 'readwrite');
    tx.objectStore(STORE_RECORDS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbSaveImage(id: string, dataUrl: string): Promise<void> {
  const db = await openRecordsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_IMAGES, 'readwrite');
    tx.objectStore(STORE_IMAGES).put({ id, dataUrl });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGetImage(id: string): Promise<string | null> {
  const db = await openRecordsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_IMAGES, 'readonly');
    const req = tx.objectStore(STORE_IMAGES).get(id);
    req.onsuccess = () => resolve(req.result ? req.result.dataUrl : null);
    req.onerror = () => reject(req.error);
  });
}

async function dbDeleteImage(id: string): Promise<void> {
  const db = await openRecordsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_IMAGES, 'readwrite');
    tx.objectStore(STORE_IMAGES).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Image compression ────────────────────────────────────────────────────────

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX_W = 1600;
      let w = img.width;
      let h = img.height;
      if (w > MAX_W) {
        h = Math.round((h * MAX_W) / w);
        w = MAX_W;
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No canvas context')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(dataUrl);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ─── RecordImageThumb ─────────────────────────────────────────────────────────

function RecordImageThumb({ imageId }: { imageId: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    dbGetImage(imageId).then(url => { if (!cancelled) setSrc(url); });
    return () => { cancelled = true; };
  }, [imageId]);
  if (!src) return null;
  return (
    <img
      src={src}
      alt="Record attachment"
      className="mt-2 rounded max-h-32 max-w-full object-contain border border-border"
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTag, setFilterTag] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<RecordEntry | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formTags, setFormTags] = useState('');

  // Image state
  const [pendingImageDataUrl, setPendingImageDataUrl] = useState<string | null>(null);
  const [existingImageId, setExistingImageId] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Speech recognition
  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Track which field mic is targeting: 'title' | 'body'
  const [micTarget, setMicTarget] = useState<'title' | 'body'>('body');
  const prevTranscriptRef = useRef('');

  // Append new transcript text to the targeted field
  useEffect(() => {
    if (!transcript) return;
    const newPart = transcript.slice(prevTranscriptRef.current.length);
    if (!newPart) return;
    prevTranscriptRef.current = transcript;
    if (micTarget === 'title') {
      setFormTitle(prev => prev + newPart);
    } else {
      setFormBody(prev => prev + newPart);
    }
  }, [transcript, micTarget]);

  // Load records on mount
  useEffect(() => {
    dbGetAllRecords().then(setRecords).catch(console.error);
  }, []);

  const refreshRecords = useCallback(() => {
    dbGetAllRecords().then(setRecords).catch(console.error);
  }, []);

  // ── Modal helpers ──────────────────────────────────────────────────────────

  function openAddModal() {
    setEditRecord(null);
    setFormTitle('');
    setFormBody('');
    setFormTags('');
    setPendingImageDataUrl(null);
    setExistingImageId(null);
    setRemoveImage(false);
    resetTranscript();
    prevTranscriptRef.current = '';
    setModalOpen(true);
  }

  function openEditModal(record: RecordEntry) {
    setEditRecord(record);
    setFormTitle(record.title);
    setFormBody(record.body);
    setFormTags(record.tags.join(', '));
    setPendingImageDataUrl(null);
    setExistingImageId(record.imageId || null);
    setRemoveImage(false);
    resetTranscript();
    prevTranscriptRef.current = '';
    setModalOpen(true);
  }

  function closeModal() {
    if (isListening) stopListening();
    setModalOpen(false);
    setEditRecord(null);
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    const title = formTitle.trim();
    const body = formBody.trim();
    if (!title && !body) return;

    const tags = formTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    let imageId: string | undefined = editRecord?.imageId;

    // Handle image changes
    if (removeImage && imageId) {
      await dbDeleteImage(imageId);
      imageId = undefined;
    }
    if (pendingImageDataUrl) {
      const newId = `rec_img_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      await dbSaveImage(newId, pendingImageDataUrl);
      // Remove old image if replacing
      if (imageId) await dbDeleteImage(imageId);
      imageId = newId;
    }

    const record: Omit<RecordEntry, 'id'> & { id?: number } = {
      title,
      body,
      createdAt: editRecord ? editRecord.createdAt : Date.now(),
      tags,
      imageId,
    };
    if (editRecord) record.id = editRecord.id;

    await dbSaveRecord(record);
    refreshRecords();
    closeModal();
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(record: RecordEntry) {
    if (record.imageId) await dbDeleteImage(record.imageId).catch(() => {});
    await dbDeleteRecord(record.id);
    refreshRecords();
  }

  // ── Image picker ───────────────────────────────────────────────────────────

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setPendingImageDataUrl(dataUrl);
      setRemoveImage(false);
    } catch {
      // ignore
    }
    e.target.value = '';
  }

  function handleRemoveImage() {
    if (existingImageId) setRemoveImage(true);
    setPendingImageDataUrl(null);
    setExistingImageId(null);
  }

  // ── Mic toggle ─────────────────────────────────────────────────────────────

  function toggleMic(target: 'title' | 'body') {
    if (isListening) {
      stopListening();
    } else {
      setMicTarget(target);
      prevTranscriptRef.current = transcript;
      startListening();
    }
  }

  // ── Export ─────────────────────────────────────────────────────────────────

  function handleExportTxt() { exportRecordsAsTxt(records); }
  function handleExportDoc() { exportRecordsAsDoc(records); }
  function handleExportJson() { exportRecordsAsJson(records); }

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.body.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q));

    const matchDate =
      !filterDate ||
      new Date(r.createdAt).toISOString().startsWith(filterDate);

    const matchTag =
      !filterTag ||
      r.tags.some(t => t.toLowerCase().includes(filterTag.toLowerCase()));

    return matchSearch && matchDate && matchTag;
  });

  const sortedFiltered = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

  // ── Render ─────────────────────────────────────────────────────────────────

  const showImagePreview = pendingImageDataUrl || (existingImageId && !removeImage);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-lg font-semibold">Records</h1>
        <div className="flex items-center gap-2">
          {/* Export buttons */}
          <Button variant="ghost" size="sm" onClick={handleExportTxt} title="Export as TXT">
            <FileText className="w-4 h-4 mr-1" />
            TXT
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportDoc} title="Export as Word DOC">
            <FileDown className="w-4 h-4 mr-1" />
            DOC
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportJson} title="Export as JSON">
            <FileJson className="w-4 h-4 mr-1" />
            JSON
          </Button>
          <Button size="sm" onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-border">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Search records…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            className="pl-8 h-8 text-sm w-40"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
        </div>
        <div className="relative">
          <Tag className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-sm w-32"
            placeholder="Tag filter…"
            value={filterTag}
            onChange={e => setFilterTag(e.target.value)}
          />
        </div>
      </div>

      {/* Records list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {sortedFiltered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <img src="/assets/generated/records-empty.dim_400x300.png" alt="No records" className="w-48 opacity-60 mb-4" />
            <p className="text-sm">No records yet. Add your first record!</p>
          </div>
        )}
        {sortedFiltered.map(record => (
          <div
            key={record.id}
            className="rounded-lg border border-border bg-card p-3 cursor-pointer hover:bg-accent/10 transition-colors"
            onClick={() => openEditModal(record)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {record.title && (
                  <p className="font-medium text-sm truncate">{record.title}</p>
                )}
                {record.body && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{record.body}</p>
                )}
                {record.imageId && (
                  <RecordImageThumb imageId={record.imageId} />
                )}
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">{formatDateTime(record.createdAt)}</span>
                  {record.tags.map(tag => (
                    <span key={tag} className="text-xs bg-accent/20 text-accent-foreground rounded px-1.5 py-0.5">{tag}</span>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-7 w-7"
                onClick={e => { e.stopPropagation(); handleDelete(record); }}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="font-semibold">{editRecord ? 'Edit Record' : 'New Record'}</h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {/* Title field */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  {speechSupported ? (
                    <button
                      type="button"
                      onClick={() => toggleMic('title')}
                      className={`ml-auto p-1 rounded transition-colors ${isListening && micTarget === 'title' ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
                      title={isListening && micTarget === 'title' ? 'Stop dictation' : 'Dictate title'}
                    >
                      {isListening && micTarget === 'title' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  ) : null}
                </div>
                <Input
                  placeholder="Record title…"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                />
                {isListening && micTarget === 'title' && interimTranscript && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{interimTranscript}</p>
                )}
              </div>

              {/* Body field */}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-medium text-muted-foreground">Details</label>
                  {speechSupported ? (
                    <button
                      type="button"
                      onClick={() => toggleMic('body')}
                      className={`ml-auto p-1 rounded transition-colors ${isListening && micTarget === 'body' ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
                      title={isListening && micTarget === 'body' ? 'Stop dictation' : 'Dictate details'}
                    >
                      {isListening && micTarget === 'body' ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  ) : null}
                </div>
                <Textarea
                  placeholder="Record details…"
                  value={formBody}
                  onChange={e => setFormBody(e.target.value)}
                  rows={4}
                />
                {isListening && micTarget === 'body' && interimTranscript && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{interimTranscript}</p>
                )}
              </div>

              {/* Speech not supported message */}
              {!speechSupported && (
                <p className="text-xs text-muted-foreground">Speech-to-text not supported on this browser.</p>
              )}

              {/* Tags field */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Tags (comma-separated)</label>
                <Input
                  placeholder="e.g. work, health, idea"
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                />
              </div>

              {/* Image section */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Image</label>
                {showImagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={pendingImageDataUrl || ''}
                      alt="Attachment preview"
                      className="rounded max-h-40 max-w-full object-contain border border-border"
                      style={{ display: pendingImageDataUrl ? 'block' : 'none' }}
                    />
                    {!pendingImageDataUrl && existingImageId && !removeImage && (
                      <ExistingImagePreview imageId={existingImageId} />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 text-destructive hover:bg-background"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-3 py-2 transition-colors"
                  >
                    <Image className="w-3.5 h-3.5" />
                    Add Image
                  </button>
                )}
                {showImagePreview && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Image className="w-3 h-3" /> Replace
                  </button>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={closeModal}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component to load and show existing image from IndexedDB
function ExistingImagePreview({ imageId }: { imageId: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    dbGetImage(imageId).then(url => { if (!cancelled) setSrc(url); });
    return () => { cancelled = true; };
  }, [imageId]);
  if (!src) return null;
  return (
    <img
      src={src}
      alt="Attachment preview"
      className="rounded max-h-40 max-w-full object-contain border border-border"
    />
  );
}
