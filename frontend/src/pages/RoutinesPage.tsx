import React, { useState } from 'react';
import { Plus, GripVertical, Check, Pencil, Trash2, Clock } from 'lucide-react';
import { useRoutines, getTodayProfile, type ProfileType } from '../hooks/useRoutines';
import { Modal } from '../components/common/Modal';
import type { RoutineItem } from '../db/schema';
import { format, parse } from 'date-fns';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { showErrorToast } from '../store/toastStore';

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

export function RoutinesPage() {
  const { weekday, weekend, loading, addItem, updateItem, deleteItem, toggleComplete, reorderItems } = useRoutines();
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

  const todayType = getTodayProfile();
  const activeProfileType: ProfileType = activeTab === 'today' ? todayType : (activeTab as ProfileType);
  const profile = activeProfileType === 'weekday' ? weekday : weekend;
  const items = profile?.items.slice().sort((a, b) => a.order - b.order) || [];

  const openAdd = () => {
    setEditingItem(null);
    setFormTime('08:00');
    setFormTitle('');
    setFormTag('');
    setFormIcon('⭐');
    setFormDuration('');
    setShowForm(true);
  };

  const openEdit = (item: RoutineItem) => {
    setEditingItem(item);
    setFormTime(item.time);
    setFormTitle(item.title);
    setFormTag(item.tag || '');
    setFormIcon(item.icon || '⭐');
    setFormDuration(item.duration?.toString() || '');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) { showErrorToast('Title is required'); return; }
    if (editingItem) {
      await updateItem(activeProfileType, {
        ...editingItem,
        time: formTime,
        title: formTitle.trim(),
        tag: formTag.trim() || undefined,
        icon: formIcon,
        duration: formDuration ? parseInt(formDuration) : undefined,
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Routines</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          aria-label="Add routine item"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
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
          {items.map((item, idx) => (
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

              <button
                onClick={() => openEdit(item)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label={`Edit ${item.title}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingItem ? 'Edit Routine Item' : 'Add Routine Item'} size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Time</label>
            <Input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} aria-label="Time" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
            <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Morning Workout" aria-label="Title" />
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
