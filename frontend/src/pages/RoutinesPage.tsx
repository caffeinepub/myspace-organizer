/**
 * Daily routines management page with add/edit/delete, day-of-week scheduling,
 * habit logging, and timeline view. Accent color applied to timeline markers and CTAs.
 * All timestamps displayed in "DD MMM YYYY, h:mm A" format.
 */
import React, { useState } from 'react';
import { useDataStore, RoutineItem } from '../store/dataStore';
import { formatDateTime } from '../utils/formatDateTime';
import { Plus, Trash2, Edit2, X, Check, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CATEGORIES = ['Wellness', 'Fitness', 'Learning', 'Work', 'Personal', 'Other'];

export default function RoutinesPage() {
  const { routines, habitLogs, addRoutine, updateRoutine, deleteRoutine, logHabit } =
    useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | null>(null);
  const [activeView, setActiveView] = useState<'today' | 'all'>('today');
  const [form, setForm] = useState({
    title: '',
    description: '',
    time: '08:00',
    days: [1, 2, 3, 4, 5] as number[],
    category: 'Personal',
    color: '#D4AF37',
    isActive: true,
  });

  const today = new Date().getDay();
  const todayRoutines = routines.filter((r) => r.isActive && r.days.includes(today));
  const displayRoutines = activeView === 'today' ? todayRoutines : routines;

  const isLoggedToday = (routineId: string) => {
    const todayStr = new Date().toDateString();
    return habitLogs.some(
      (log) =>
        log.routineId === routineId && new Date(log.completedAt).toDateString() === todayStr
    );
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      time: '08:00',
      days: [1, 2, 3, 4, 5],
      category: 'Personal',
      color: '#D4AF37',
      isActive: true,
    });
    setEditingRoutine(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (editingRoutine) {
      updateRoutine(editingRoutine.id, form);
      toast.success('Routine updated');
    } else {
      addRoutine(form);
      toast.success('Routine added');
    }
    resetForm();
  };

  const handleEdit = (routine: RoutineItem) => {
    setForm({
      title: routine.title,
      description: routine.description,
      time: routine.time,
      days: routine.days,
      category: routine.category,
      color: routine.color,
      isActive: routine.isActive,
    });
    setEditingRoutine(routine);
    setShowForm(true);
  };

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  };

  const handleLog = (routineId: string) => {
    if (isLoggedToday(routineId)) {
      toast.info('Already logged today!');
      return;
    }
    logHabit(routineId);
    toast.success('Habit logged! 🎉');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Routines</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--accent)', color: 'var(--accent-text, #1a1a1a)' }}
        >
          <Plus className="w-4 h-4" />
          Add Routine
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        {(['today', 'all'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
            style={
              activeView === view
                ? {
                    background: 'var(--accent-soft)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)',
                  }
                : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
            }
          >
            {view === 'today' ? "Today's" : 'All'} Routines
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editingRoutine ? 'Edit Routine' : 'New Routine'}</h3>
            <button onClick={resetForm} className="p-1 hover:bg-muted/50 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Morning Meditation"
                  className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Description
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
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
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Day selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Days</label>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map((day, idx) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className="w-10 h-10 rounded-full text-xs font-medium transition-all border"
                    style={
                      form.days.includes(idx)
                        ? {
                            background: 'var(--accent)',
                            color: 'var(--accent-text, #1a1a1a)',
                            borderColor: 'var(--accent)',
                          }
                        : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
                    }
                  >
                    {day}
                  </button>
                ))}
              </div>
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
                {editingRoutine ? 'Update' : 'Add Routine'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Routines Timeline */}
      {displayRoutines.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">
            {activeView === 'today' ? 'No routines for today' : 'No routines yet'}
          </p>
          <p className="text-sm">Add a routine to get started!</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-0.5"
            style={{ background: 'var(--accent-soft)' }}
          />
          <div className="space-y-4">
            {[...displayRoutines]
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((routine) => {
                const logged = isLoggedToday(routine.id);
                return (
                  <div key={routine.id} className="flex gap-4 relative">
                    {/* Timeline marker */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2"
                      style={{
                        background: logged ? 'var(--accent)' : 'var(--card)',
                        borderColor: 'var(--accent)',
                        color: logged ? 'var(--accent-text, #1a1a1a)' : 'var(--accent)',
                      }}
                    >
                      {logged ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 bg-card rounded-xl border border-border/50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{routine.title}</p>
                          {routine.description && (
                            <p className="text-sm text-muted-foreground">{routine.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                              {routine.time}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                            >
                              {routine.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Created: {formatDateTime(routine.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleLog(routine.id)}
                            disabled={logged}
                            className="px-2 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                            style={
                              logged
                                ? { background: 'var(--muted)', color: 'var(--muted-foreground)' }
                                : {
                                    background: 'var(--accent)',
                                    color: 'var(--accent-text, #1a1a1a)',
                                  }
                            }
                          >
                            {logged ? 'Done' : 'Log'}
                          </button>
                          <button
                            onClick={() => handleEdit(routine)}
                            className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => {
                              deleteRoutine(routine.id);
                              toast.success('Routine deleted');
                            }}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </div>
                      {/* Days indicator */}
                      <div className="flex gap-1 mt-2">
                        {DAYS.map((day, idx) => (
                          <span
                            key={day}
                            className="text-[10px] w-6 h-6 rounded-full flex items-center justify-center"
                            style={
                              routine.days.includes(idx)
                                ? {
                                    background: 'var(--accent)',
                                    color: 'var(--accent-text, #1a1a1a)',
                                  }
                                : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
                            }
                          >
                            {day[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Habit Logs */}
      {habitLogs.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <h3 className="font-semibold mb-3">Recent Habit Logs</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...habitLogs]
              .reverse()
              .slice(0, 10)
              .map((log) => {
                const routine = routines.find((r) => r.id === log.routineId);
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: 'var(--accent)' }}
                    />
                    <span className="text-sm font-medium flex-1">
                      {routine?.title ?? 'Unknown Routine'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(log.completedAt)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
