import React, { useState, useRef } from 'react';
import { Plus, GripVertical, Trash2, Pencil, Check, X, FileDown, ChevronDown, Upload, Mic, MicOff, Clock, Camera, ImageIcon } from 'lucide-react';
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
import {
  compressRoutineImage,
  saveRoutineImage,
  getRoutineImage,
  deleteRoutineImage,
} from '../hooks/useRoutineImages';

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

export default function RoutinesPage() {
  const { weekday, weekend, loading, addItem, updateItem, deleteItem, toggleComplete, reorderItems, reload } = useRoutines();
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<RoutineItem | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Form state
  const [formTime, setFormTime] = useState('08:00');
  const [formTitle, setFormTitle] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formIcon, setFormIcon] = useState('⭐');
  const [formDuration, setFormDuration] = useState('');

  // Image state for the form
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [formImageId, setFormImageId] = useState<string | undefined>(undefined);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  // File input refs for gallery and camera
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
  const items = profile?.items.slice().sort((a, b) => a.order - b.order) || [];

  // Filter out nulls to get a properly typed RoutineProfile[]
  const allProfiles: RoutineProfile[] = [weekday, weekend].filter((p): p is RoutineProfile => p !== null);

  const openAdd = () => {
    setEditingItem(null);
    setFormTime('08:00');
    setFormTitle('');
    setFormTag('');
    setFormIcon('⭐');
    setFormDuration('');
    setFormImagePreview(null);
    setFormImageId(undefined);
    resetTranscript();
    setShowForm(true);
  };

  const openEdit = (item: RoutineItem) => {
    setEditingItem(item);
    setFormTime(item.time);
    setFormTitle(item.title);
    setFormTag(item.tag || '');
    setFormIcon(item.icon || '⭐');
    setFormDuration(item.duration?.toString() || '');
    // Load existing image if any
    if (item.imageId) {
      const existing = getRoutineImage(item.imageId);
      setFormImagePreview(existing);
      setFormImageId(item.imageId);
    } else {
      setFormImagePreview(null);
      setFormImageId(undefined);
    }
    resetTranscript();
    setShowForm(true);
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showErrorToast('Please select a valid image file');
      return;
    }
    setIsCompressingImage(true);
    try {
      const dataUrl = await compressRoutineImage(file);
      // Generate a stable imageId for this item (reuse existing or create new)
      const imageId = formImageId || Math.random().toString(36).slice(2);
      saveRoutineImage(imageId, dataUrl);
      setFormImagePreview(dataUrl);
      setFormImageId(imageId);
    } catch {
      showErrorToast('Failed to process image');
    } finally {
      setIsCompressingImage(false);
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleImageFile(file);
    // Reset input so same file can be re-selected
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleCameraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleImageFile(file);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    if (formImageId) {
      deleteRoutineImage(formImageId);
    }
    setFormImagePreview(null);
    setFormImageId(undefined);
  };

  const handleSave = async () => {
    if (isListening) stopListening();
    if (!formTitle.trim()) { showErrorToast('Title is required'); return; }
    if (editingItem) {
      // If image was removed (had one before, now none), clean up old image
      if (editingItem.imageId && !formImageId) {
        deleteRoutineImage(editingItem.imageId);
      }
      await updateItem(activeProfileType, {
        ...editingItem,
        time: formTime,
        title: formTitle.trim(),
        tag: formTag.trim() || undefined,
        icon: formIcon,
        duration: formDuration ? parseInt(formDuration) : undefined,
        imageId: formImageId,
      });
    } else {
      const newItem: RoutineItem = {
        id: Math.random().toString(36).slice(2),
        time: formTime,
        title: formTitle.trim(),
        tag: formTag.trim() || undefined,
        icon: formIcon,
        duration: formDuration ? parseInt(formDuration) : undefined,
        completed: false,
        order: items.length,
        imageId: formImageId,
      };
      await addItem(activeProfileType, newItem);
    }
    setShowForm(false);
  };

  const handleDelete = async (itemId: string) => {
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
    reorderItems(activeProfileType, reordered);
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
            const itemImage = item.imageId ? getRoutineImage(item.imageId) : null;
            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-3 bg-card rounded-xl border border-border/50 p-3
                  transition-all duration-150 cursor-grab active:cursor-grabbing
                  ${item.completed ? 'opacity-60' : ''}
                  ${dragIndex === idx ? 'opacity-50 scale-[0.98]' : ''}
                `}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />

                <button
                  onClick={() => toggleComplete(activeProfileType, item.id)}
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200
                    ${item.completed ? 'bg-primary border-primary animate-check-bounce' : 'border-muted-foreground hover:border-primary'}`}
                  aria-label={`${item.completed ? 'Uncheck' : 'Complete'} ${item.title}`}
                >
                  {item.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {item.icon && <span className="text-sm">{item.icon}</span>}
                    <span className={`text-sm font-medium truncate ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{formatTime(item.time)}</span>
                    {item.duration && (
                      <span className="text-xs text-muted-foreground">· {item.duration}min</span>
                    )}
                    {item.tag && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{item.tag}</span>
                    )}
                  </div>
                </div>

                {/* Thumbnail preview on card */}
                {itemImage && (
                  <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-border/50">
                    <img
                      src={itemImage}
                      alt="Routine item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                  aria-label={`Edit ${item.title}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Hidden file inputs for image upload */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGalleryChange}
        aria-label="Upload image from gallery"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraChange}
        aria-label="Capture image from camera"
      />

      {/* Add/Edit Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingItem ? 'Edit Routine Item' : 'Add Routine Item'} size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Time</label>
            <Input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} aria-label="Time" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
            <div className="flex items-center gap-2">
              <Input
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. Morning Workout"
                aria-label="Title"
                className="flex-1"
              />
              {speechSupported ? (
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`shrink-0 p-2 rounded-lg border transition-colors ${
                    isListening
                      ? 'bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20'
                      : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  aria-label={isListening ? 'Stop speech recognition' : 'Start speech recognition'}
                  title={isListening ? 'Stop dictation' : 'Dictate title'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              ) : (
                <span className="text-xs text-muted-foreground shrink-0">Speech-to-text not supported on this browser.</span>
              )}
            </div>
            {/* Live interim transcription */}
            {isListening && (
              <p className="mt-1.5 text-xs text-muted-foreground italic min-h-[1.25rem]">
                {interimTranscript ? `"${interimTranscript}"` : 'Listening…'}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tag (optional)</label>
            <Input value={formTag} onChange={e => setFormTag(e.target.value)} placeholder="e.g. health, work" aria-label="Tag" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Duration (minutes, optional)</label>
            <Input type="number" value={formDuration} onChange={e => setFormDuration(e.target.value)} placeholder="30" aria-label="Duration in minutes" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setFormIcon(icon)}
                  className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all
                    ${formIcon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}`}
                  aria-label={`Select icon ${icon}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Image (optional)</label>
            {formImagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border/50">
                <img
                  src={formImagePreview}
                  alt="Routine item preview"
                  className="w-full max-h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background border border-border/50 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove image"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isCompressingImage}
                    className="p-1.5 rounded-lg bg-background/80 hover:bg-background border border-border/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    aria-label="Replace with gallery image"
                    title="Replace from gallery"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isCompressingImage}
                    className="p-1.5 rounded-lg bg-background/80 hover:bg-background border border-border/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    aria-label="Replace with camera photo"
                    title="Replace with camera"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isCompressingImage}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                  aria-label="Upload image from gallery"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Gallery</span>
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isCompressingImage}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                  aria-label="Capture image from camera"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-xs font-medium">Camera</span>
                </button>
              </div>
            )}
            {isCompressingImage && (
              <p className="mt-1.5 text-xs text-muted-foreground">Processing image…</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            {editingItem && (
              <Button variant="destructive" onClick={() => handleDelete(editingItem.id)} className="gap-1" aria-label="Delete routine item">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            )}
            <Button onClick={handleSave} className="flex-1" aria-label="Save routine item">
              {editingItem ? 'Update' : 'Add Item'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
