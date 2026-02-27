import React, { useState, useEffect, useCallback } from 'react';
import { Pin, Archive, Trash2, Bell, X, Plus, Minus, Image as ImageIcon } from 'lucide-react';
import { Modal } from '../common/Modal';
import type { Note, NoteChecklistItem } from '../../db/schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useLabels } from '../../hooks/useLabels';
import { useImageStorage } from '../../hooks/useImageStorage';
import { compressImage, generateThumbnail } from '../../utils/imageCompression';
import { showErrorToast } from '../../store/toastStore';
import { format } from 'date-fns';

const NOTE_COLORS = [
  { label: 'Default', value: 'default' },
  { label: 'Yellow', value: '#fff9c4' },
  { label: 'Green', value: '#e8f5e9' },
  { label: 'Blue', value: '#e3f2fd' },
  { label: 'Pink', value: '#fce4ec' },
  { label: 'Purple', value: '#f3e5f5' },
  { label: 'Orange', value: '#fff3e0' },
  { label: 'Teal', value: '#e0f2f1' },
  { label: 'Red', value: '#ffebee' },
  { label: 'Indigo', value: '#e8eaf6' },
  { label: 'Brown', value: '#efebe9' },
  { label: 'Gray', value: '#f5f5f5' },
];

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  onTrash: (id: number) => void;
  onArchive: (id: number) => void;
  onPin: (id: number) => void;
}

export function NoteModal({ note, isOpen, onClose, onSave, onTrash, onArchive, onPin }: NoteModalProps) {
  const { labels } = useLabels();
  const { saveImage, getImageUrl } = useImageStorage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [checklistItems, setChecklistItems] = useState<NoteChecklistItem[]>([]);
  const [color, setColor] = useState('default');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [reminderAt, setReminderAt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setChecklistItems(note.checklistItems);
      setColor(note.color || 'default');
      setSelectedLabels(note.labels);
      setReminderAt(note.reminderAt ? format(new Date(note.reminderAt), "yyyy-MM-dd'T'HH:mm") : '');
      // Load image if image note
      if (note.type === 'image' && note.imageRefs.length > 0) {
        getImageUrl(note.imageRefs[0], 'full').then(url => setImageUrl(url));
      }
    }
  }, [note, getImageUrl]);

  const handleSave = useCallback(() => {
    if (!note) return;
    const updated: Note = {
      ...note,
      title,
      content,
      checklistItems,
      color,
      labels: selectedLabels,
      reminderAt: reminderAt ? new Date(reminderAt).getTime() : null,
    };
    onSave(updated);
    onClose();
  }, [note, title, content, checklistItems, color, selectedLabels, reminderAt, onSave, onClose]);

  const addCheckItem = useCallback(() => {
    if (!newCheckItem.trim()) return;
    setChecklistItems(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      text: newCheckItem.trim(),
      checked: false,
    }]);
    setNewCheckItem('');
  }, [newCheckItem]);

  const toggleCheckItem = useCallback((id: string) => {
    setChecklistItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  }, []);

  const removeCheckItem = useCallback((id: string) => {
    setChecklistItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !note) return;
    try {
      const [compressed, thumbnail] = await Promise.all([
        compressImage(file),
        generateThumbnail(file),
      ]);
      const key = `note-${note.id || Date.now()}`;
      await saveImage(key, compressed, 'full');
      await saveImage(key, thumbnail, 'thumbnail');
      const url = URL.createObjectURL(compressed);
      setImageUrl(url);
      // Update imageRefs
      const updated: Note = { ...note, title, content, checklistItems, color, labels: selectedLabels, imageRefs: [key] };
      onSave(updated);
    } catch {
      showErrorToast('Failed to upload image');
    }
  }, [note, title, content, checklistItems, color, selectedLabels, saveImage, onSave]);

  if (!note) return null;

  const bgStyle: React.CSSProperties = color !== 'default' ? { backgroundColor: color } : {};

  return (
    <Modal isOpen={isOpen} onClose={handleSave} size="lg" showClose={false}>
      <div style={bgStyle} className="rounded-xl -m-4 p-4">
        {/* Header actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => { if (note.id) onPin(note.id); }}
              className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${note.pinned ? 'text-primary' : 'text-muted-foreground'}`}
              aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
            >
              <Pin className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground"
              aria-label="Change note color"
            >
              <div className="w-4 h-4 rounded-full border-2 border-current" style={{ backgroundColor: color !== 'default' ? color : undefined }} />
            </button>
            <button
              onClick={() => setShowLabelPicker(!showLabelPicker)}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground text-xs font-medium"
              aria-label="Manage labels"
            >
              🏷️
            </button>
            <button
              onClick={() => { if (note.id) onArchive(note.id); onClose(); }}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground"
              aria-label="Archive note"
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { if (note.id) onTrash(note.id); onClose(); }}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground"
              aria-label="Move to trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
              aria-label="Save and close note"
            >
              Done
            </button>
          </div>
        </div>

        {/* Color picker */}
        {showColorPicker && (
          <div className="flex flex-wrap gap-2 mb-3 p-2 bg-card/80 rounded-lg">
            {NOTE_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => { setColor(c.value); setShowColorPicker(false); }}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110
                  ${color === c.value ? 'border-primary scale-110' : 'border-border'}`}
                style={{ backgroundColor: c.value === 'default' ? undefined : c.value }}
                aria-label={`Set color to ${c.label}`}
                title={c.label}
              >
                {c.value === 'default' && <X className="w-3 h-3 mx-auto text-muted-foreground" />}
              </button>
            ))}
          </div>
        )}

        {/* Label picker */}
        {showLabelPicker && (
          <div className="flex flex-wrap gap-1.5 mb-3 p-2 bg-card/80 rounded-lg">
            {labels.map(label => (
              <button
                key={label.id}
                onClick={() => {
                  setSelectedLabels(prev =>
                    prev.includes(label.name)
                      ? prev.filter(l => l !== label.name)
                      : [...prev, label.name]
                  );
                }}
                className={`text-xs px-2 py-1 rounded-full border transition-colors
                  ${selectedLabels.includes(label.name)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted'
                  }`}
                aria-label={`${selectedLabels.includes(label.name) ? 'Remove' : 'Add'} label ${label.name}`}
              >
                {label.name}
              </button>
            ))}
          </div>
        )}

        {/* Title */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-transparent text-base font-semibold placeholder:text-muted-foreground/60 outline-none mb-2"
          aria-label="Note title"
        />

        {/* Content based on type */}
        {note.type === 'text' && (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Take a note..."
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground/60 outline-none resize-none min-h-[120px]"
            aria-label="Note content"
          />
        )}

        {note.type === 'checklist' && (
          <div className="space-y-2">
            {checklistItems.map(item => (
              <div key={item.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleCheckItem(item.id)}
                  className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors
                    ${item.checked ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
                  aria-label={`${item.checked ? 'Uncheck' : 'Check'} item: ${item.text}`}
                >
                  {item.checked && <span className="text-primary-foreground text-[8px]">✓</span>}
                </button>
                <input
                  value={item.text}
                  onChange={e => setChecklistItems(prev => prev.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))}
                  className={`flex-1 bg-transparent text-sm outline-none ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                  aria-label={`Checklist item: ${item.text}`}
                />
                <button
                  onClick={() => removeCheckItem(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove item: ${item.text}`}
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={newCheckItem}
                onChange={e => setNewCheckItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                placeholder="List item"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                aria-label="Add new checklist item"
              />
              {newCheckItem && (
                <button onClick={addCheckItem} className="text-primary text-xs">Add</button>
              )}
            </div>
          </div>
        )}

        {note.type === 'image' && (
          <div className="space-y-3">
            {imageUrl ? (
              <img src={imageUrl} alt="Note image" className="w-full rounded-lg object-cover max-h-64" />
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Tap to add image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} aria-label="Upload image" />
              </label>
            )}
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Add a caption..."
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground/60 outline-none resize-none"
              aria-label="Image caption"
            />
          </div>
        )}

        {/* Reminder */}
        <div className="mt-3 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="datetime-local"
            value={reminderAt}
            onChange={e => setReminderAt(e.target.value)}
            className="text-xs bg-transparent text-muted-foreground outline-none"
            aria-label="Set reminder"
          />
        </div>

        {/* Labels display */}
        {selectedLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedLabels.map(label => (
              <span key={label} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
