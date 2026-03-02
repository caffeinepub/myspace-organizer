import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Plus, GripVertical, Trash2, Pencil, Check, X, FileDown, Upload,
  Mic, MicOff, Clock, Image as ImageIcon,
} from 'lucide-react';
import { useRoutines, getTodayProfile, type ProfileType } from '../hooks/useRoutines';
import { Modal } from '../components/common/Modal';
import type { RoutineItem, RoutineProfile } from '../db/schema';
import { format, parse } from 'date-fns';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showErrorToast, showSuccessToast } from '../store/toastStore';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  exportAllRoutinesAsTxt,
  exportAllRoutinesAsDoc,
  exportAllRoutinesAsJson,
  exportSelectedRoutinesAsTxt,
  exportSelectedRoutinesAsDoc,
  exportSelectedRoutinesAsJson,
} from '../utils/routineExport';
import { importRoutinesFromFile } from '../utils/routineImport';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ImageUploadPicker } from '../components/common/ImageUploadPicker';
import { useCamera } from '../camera/useCamera';

// ─── Image storage helpers (localStorage) ─────────────────────────────────────
const ROUTINE_IMAGES_KEY = 'routineImagesById';

function saveRoutineImage(id: string, dataUrl: string): void {
  try {
    const store = JSON.parse(localStorage.getItem(ROUTINE_IMAGES_KEY) || '{}');
    store[id] = dataUrl;
    localStorage.setItem(ROUTINE_IMAGES_KEY, JSON.stringify(store));
  } catch {
    // ignore storage errors
  }
}

function getRoutineImage(id: string): string | null {
  try {
    const store = JSON.parse(localStorage.getItem(ROUTINE_IMAGES_KEY) || '{}');
    return store[id] ?? null;
  } catch {
    return null;
  }
}

function deleteRoutineImage(id: string): void {
  try {
    const store = JSON.parse(localStorage.getItem(ROUTINE_IMAGES_KEY) || '{}');
    delete store[id];
    localStorage.setItem(ROUTINE_IMAGES_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX = 1200;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round((h * MAX) / w); w = MAX; }
          else { w = Math.round((w * MAX) / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Extended RoutineItem with optional imageId ────────────────────────────────
interface RoutineItemWithImage extends RoutineItem {
  imageId?: string;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'today', label: 'Today (Auto)' },
  { id: 'weekday', label: 'Weekdays' },
  { id: 'weekend', label: 'Weekends' },
] as const;

type TabId = typeof TABS[number]['id'];

const ICONS = ['🌅', '💪', '🥗', '💻', '🍱', '🚶', '📚', '☕', '🧘', '🥞', '🎨', '👥', '📋', '🏃', '🎯', '📖', '🎵', '🌙', '⭐', '🔥'];

function formatTime(time: string): string {
  try {
    return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
  } catch {
    return time;
  }
}

// ─── Camera sub-component ─────────────────────────────────────────────────────
interface CameraModalProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const { isActive, isLoading, error, startCamera, capturePhoto, videoRef, canvasRef } = useCamera({
    facingMode: 'environment',
  });

  useEffect(() => {
    startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      onCapture(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="bg-card rounded-xl overflow-hidden w-full max-w-sm">
        <div className="relative bg-black" style={{ minHeight: 240 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
            style={{ minHeight: 240, display: 'block' }}
          />
          <canvas ref={canvasRef} className="hidden" />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-white text-sm">Starting camera…</span>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4">
              <span className="text-red-400 text-sm text-center">{error.message}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCapture}
            disabled={!isActive || isLoading}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Capture
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoutinesPage() {
  const {
    weekday, weekend, loading,
    addItem, updateItem, deleteItem,
    toggleComplete, reorderItems, reload,
  } = useRoutines();

  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<RoutineItemWithImage | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Form state
  const [formTime, setFormTime] = useState('08:00');
  const [formTitle, setFormTitle] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formIcon, setFormIcon] = useState('⭐');
  const [formDuration, setFormDuration] = useState('');
  const [formImageId, setFormImageId] = useState<string | undefined>(undefined);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [formImgNaturalAspect, setFormImgNaturalAspect] = useState<number | null>(null);

  // Image upload picker state
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // File input refs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import state
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

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

  // Append finalized transcript to title field
  React.useEffect(() => {
    if (transcript) {
      setFormTitle(prev => {
        const separator = prev && !prev.endsWith(' ') ? ' ' : '';
        return prev + separator + transcript;
      });
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Stop listening when form closes
  React.useEffect(() => {
    if (!showForm && isListening) {
      stopListening();
    }
  }, [showForm, isListening, stopListening]);

  const todayType = getTodayProfile();
  const activeProfileType: ProfileType = activeTab === 'today' ? todayType : (activeTab as ProfileType);
  const profile = activeProfileType === 'weekday' ? weekday : weekend;
  const items = (profile?.items.slice().sort((a, b) => a.order - b.order) || []) as RoutineItemWithImage[];

  // Filter out nulls to get a properly typed RoutineProfile[]
  const allProfiles: RoutineProfile[] = [weekday, weekend].filter((p): p is RoutineProfile => p !== null);

  const openAdd = () => {
    setEditingItem(null);
    setFormTime('08:00');
    setFormTitle('');
    setFormTag('');
    setFormIcon('⭐');
    setFormDuration('');
    setFormImageId(undefined);
    setFormImagePreview(null);
    setFormImgNaturalAspect(null);
    setShowImagePicker(false);
    resetTranscript();
    setShowForm(true);
  };

  const openEdit = (item: RoutineItemWithImage) => {
    setEditingItem(item);
    setFormTime(item.time);
    setFormTitle(item.title);
    setFormTag(item.tag || '');
    setFormIcon(item.icon || '⭐');
    setFormDuration(item.duration?.toString() || '');
    setFormImageId(item.imageId);
    setFormImagePreview(item.imageId ? getRoutineImage(item.imageId) : null);
    setFormImgNaturalAspect(null);
    setShowImagePicker(false);
    resetTranscript();
    setShowForm(true);
  };

  const handleSave = async () => {
    if (isListening) stopListening();
    if (!formTitle.trim()) { showErrorToast('Title is required'); return; }

    const baseItem = {
      time: formTime,
      title: formTitle.trim(),
      tag: formTag.trim() || undefined,
      icon: formIcon,
      duration: formDuration ? parseInt(formDuration) : undefined,
      imageId: formImageId,
    };

    if (editingItem) {
      await updateItem(activeProfileType, {
        ...editingItem,
        ...baseItem,
      } as RoutineItem);
    } else {
      const newItem: RoutineItemWithImage = {
        id: Math.random().toString(36).slice(2),
        completed: false,
        order: items.length,
        ...baseItem,
      };
      await addItem(activeProfileType, newItem as RoutineItem);
    }
    setShowForm(false);
  };

  const handleDelete = async (itemId: string) => {
    // Clean up image if any
    const item = items.find((i) => i.id === itemId);
    if (item?.imageId) {
      deleteRoutineImage(item.imageId);
    }
    await deleteItem(activeProfileType, itemId);
    setShowForm(false);
  };

  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const newItems = [...items];
    const [moved] = newItems.splice(dragIndex, 1);
    newItems.splice(idx, 0, moved);
    const reordered = newItems.map((item, i) => ({ ...item, order: i }));
    reorderItems(activeProfileType, reordered as RoutineItem[]);
    setDragIndex(idx);
  };
  const handleDragEnd = () => setDragIndex(null);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const result = await importRoutinesFromFile(file, allProfiles);
      if (result.error) {
        showErrorToast(result.error);
      } else {
        showSuccessToast(`Imported ${result.count} routine item(s)`);
        await reload();
      }
    } catch {
      showErrorToast('Import failed');
    } finally {
      setIsImporting(false);
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ── Image upload handlers ──────────────────────────────────────────────────
  const handleImageFile = useCallback(async (file: File) => {
    try {
      const dataUrl = await compressImageToDataUrl(file);
      const imageId = `routine_img_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      saveRoutineImage(imageId, dataUrl);
      setFormImageId(imageId);
      setFormImagePreview(dataUrl);
      setFormImgNaturalAspect(null);
    } catch {
      showErrorToast('Failed to process image');
    }
  }, []);

  const handlePickerCamera = useCallback(() => {
    setShowCameraModal(true);
  }, []);

  const handlePickerGallery = useCallback(() => {
    galleryInputRef.current?.click();
  }, []);

  const handlePickerFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleImageFile(file);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    if (formImageId) {
      deleteRoutineImage(formImageId);
    }
    setFormImageId(undefined);
    setFormImagePreview(null);
    setFormImgNaturalAspect(null);
  };

  const handleFormImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setFormImgNaturalAspect(img.naturalWidth / img.naturalHeight);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Routines</h1>
        <div className="flex items-center gap-2">
          {/* Import — same style as Notes */}
          <input
            ref={importInputRef}
            type="file"
            accept=".json,.txt,.doc,.docx"
            className="hidden"
            onChange={handleImportFile}
            aria-label="Import routines file"
          />
          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50"
            aria-label="Import routines"
            title="Import Routines"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Export dropdown — same style as Notes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Export routines"
                title="Export Routines"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Export All Profiles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportAllRoutinesAsTxt(allProfiles)}>
                Export as TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAllRoutinesAsDoc(allProfiles)}>
                Export as WORD (DOC)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAllRoutinesAsJson(allProfiles)}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Export Active Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => profile && exportSelectedRoutinesAsTxt([profile])} disabled={!profile}>
                Export as TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => profile && exportSelectedRoutinesAsDoc([profile])} disabled={!profile}>
                Export as WORD (DOC)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => profile && exportSelectedRoutinesAsJson([profile])} disabled={!profile}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add button */}
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            aria-label="Add routine item"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
              ${activeTab === tab.id ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label={`${tab.label} tab`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
            {tab.id === 'today' && (
              <span className="ml-1 text-[10px] text-muted-foreground capitalize">({todayType})</span>
            )}
          </button>
        ))}
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No routine items yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Tap "Add" to create your first routine</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => {
            const itemImageUrl = item.imageId ? getRoutineImage(item.imageId) : null;
            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 cursor-grab active:cursor-grabbing
                  ${item.completed ? 'opacity-60 bg-muted/30 border-border/50' : 'bg-card border-border hover:border-primary/30'}
                  ${dragIndex === idx ? 'opacity-50 scale-95' : ''}
                `}
              >
                {/* Drag handle */}
                <div className="mt-1 text-muted-foreground/40">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Complete toggle */}
                <button
                  onClick={() => toggleComplete(activeProfileType, item.id)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
                    ${item.completed ? 'bg-primary border-primary' : 'border-muted-foreground hover:border-primary'}`}
                  aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {item.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {item.icon && <span className="text-base leading-none">{item.icon}</span>}
                    <span className={`text-sm font-medium truncate ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{formatTime(item.time)}</span>
                    {item.tag && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{item.tag}</span>
                    )}
                    {item.duration && (
                      <span className="text-[10px] text-muted-foreground">{item.duration}m</span>
                    )}
                  </div>
                  {/* Thumbnail image */}
                  {itemImageUrl && (
                    <div className="mt-2 w-full overflow-hidden rounded-lg">
                      <img
                        src={itemImageUrl}
                        alt={item.title}
                        className="w-full h-auto object-contain max-h-40"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    aria-label={`Edit ${item.title}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} size="md">
        <div className="space-y-4">
          <h2 className="text-base font-semibold">
            {editingItem ? 'Edit Routine Item' : 'Add Routine Item'}
          </h2>

          {/* Time */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
            <Input
              type="time"
              value={formTime}
              onChange={e => setFormTime(e.target.value)}
              className="text-sm"
              aria-label="Routine time"
            />
          </div>

          {/* Title with mic */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
            <div className="flex items-center gap-2">
              <Input
                value={formTitle + (isListening && interimTranscript ? interimTranscript : '')}
                onChange={e => {
                  const val = e.target.value;
                  if (isListening && interimTranscript && val.endsWith(interimTranscript)) {
                    setFormTitle(val.slice(0, val.length - interimTranscript.length));
                  } else {
                    setFormTitle(val);
                  }
                }}
                placeholder="e.g. Morning meditation"
                className="flex-1 text-sm"
                aria-label="Routine title"
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening
                      ? 'text-destructive hover:bg-destructive/10 animate-pulse'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  aria-label={isListening ? 'Stop dictation' : 'Dictate title'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>
            {isListening && (
              <p className="text-[10px] text-primary mt-0.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                Listening…
              </p>
            )}
          </div>

          {/* Tag */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tag (optional)</label>
            <Input
              value={formTag}
              onChange={e => setFormTag(e.target.value)}
              placeholder="e.g. Health, Work"
              className="text-sm"
              aria-label="Routine tag"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormIcon(icon)}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors
                    ${formIcon === icon ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-muted'}`}
                  aria-label={`Select icon ${icon}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Duration (minutes, optional)</label>
            <Input
              type="number"
              value={formDuration}
              onChange={e => setFormDuration(e.target.value)}
              placeholder="e.g. 30"
              min="1"
              className="text-sm"
              aria-label="Routine duration in minutes"
            />
          </div>

          {/* Image upload — identical to notes section */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Image (optional)</label>

            {/* Hidden file inputs */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
              aria-label="Select image from gallery"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileInputChange}
              aria-label="Upload image file"
            />

            {formImagePreview ? (
              <div className="space-y-2">
                <div className="w-full overflow-hidden rounded-lg">
                  <img
                    src={formImagePreview}
                    alt="Routine preview"
                    className="w-full h-auto object-contain bg-muted/20"
                    style={formImgNaturalAspect ? { aspectRatio: String(formImgNaturalAspect) } : undefined}
                    onLoad={handleFormImageLoad}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" /> Remove image
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowImagePicker(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors text-sm text-muted-foreground w-full justify-center"
                  aria-label="Add image"
                  aria-expanded={showImagePicker}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Add Image</span>
                </button>
                {showImagePicker && (
                  <ImageUploadPicker
                    isOpen={showImagePicker}
                    onClose={() => setShowImagePicker(false)}
                    onCameraClick={handlePickerCamera}
                    onGalleryClick={handlePickerGallery}
                    onFileClick={handlePickerFile}
                  />
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {editingItem && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(editingItem.id)}
                  aria-label="Delete routine item"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!formTitle.trim()}
                aria-label={editingItem ? 'Update routine item' : 'Add routine item'}
              >
                {editingItem ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Camera modal */}
      {showCameraModal && (
        <CameraModal
          onCapture={handleImageFile}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
}
