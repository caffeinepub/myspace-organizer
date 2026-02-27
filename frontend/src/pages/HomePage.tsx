/**
 * Home page dashboard showing streak widget, quick stats, recent notes, todos, and a FAB for quick note creation.
 * Navigates to other pages via the onNavigate callback.
 */
import React, { useState } from 'react';
import { TabId } from '../App';
import { useDataStore } from '../store/dataStore';
import { formatDateTime } from '../utils/formatDateTime';
import { Plus, Flame, FileText, BarChart2, Calendar, CheckSquare, Quote } from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: TabId, options?: { quickAdd?: boolean }) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { streak, notes, records, routines, todos, quotes, addTodo, updateTodo, deleteTodo } =
    useDataStore();
  const [newTodo, setNewTodo] = useState('');

  const activeNotes = notes.filter((n) => !n.isTrashed && !n.isArchived);
  const todayRoutines = routines.filter((r) => {
    const day = new Date().getDay();
    return r.isActive && r.days.includes(day);
  });
  const pendingTodos = todos.filter((t) => !t.completed);
  const randomQuote = quotes.length > 0 ? quotes[Math.floor(Math.random() * quotes.length)] : null;

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    addTodo({ text: newTodo.trim(), completed: false });
    setNewTodo('');
  };

  return (
    <div className="space-y-6">
      {/* Streak Banner */}
      <div
        className="rounded-2xl p-5 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--accent-soft), var(--accent-soft))',
          border: '1px solid var(--accent)',
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-text, #1a1a1a)',
              boxShadow: '0 0 20px var(--accent-soft)',
            }}
          >
            {streak.currentStreak}
          </div>
        </div>
        <p className="font-bold text-lg" style={{ color: 'var(--accent)' }}>
          Day Streak 🔥
        </p>
        {streak.lastCheckIn && (
          <p className="text-xs text-muted-foreground mt-1">
            Last check-in: {formatDateTime(streak.lastCheckIn)}
          </p>
        )}
        <button
          onClick={() => onNavigate('streak')}
          className="mt-3 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-text, #1a1a1a)',
          }}
        >
          View Streak
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Notes', value: activeNotes.length, icon: <FileText className="w-4 h-4" />, tab: 'notes' as TabId },
          { label: 'Records', value: records.length, icon: <BarChart2 className="w-4 h-4" />, tab: 'records' as TabId },
          { label: "Today's Routines", value: todayRoutines.length, icon: <Calendar className="w-4 h-4" />, tab: 'routines' as TabId },
          { label: 'Pending Todos', value: pendingTodos.length, icon: <CheckSquare className="w-4 h-4" />, tab: 'notes' as TabId },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => onNavigate(stat.tab)}
            className="bg-card rounded-xl p-4 text-left border border-border/50 hover:border-[var(--accent)] transition-colors"
          >
            <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--accent)' }}>
              {stat.icon}
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Quick Todo */}
      <div className="bg-card rounded-xl border border-border/50 p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CheckSquare className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          Quick Todos
        </h3>
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-3">
          <input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a todo..."
            className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--accent)', color: 'var(--accent-text, #1a1a1a)' }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {todos.slice(0, 8).map((todo) => (
            <div key={todo.id} className="flex items-center gap-2 group">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => updateTodo(todo.id, { completed: !todo.completed })}
                className="rounded"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span
                className={`flex-1 text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
              >
                {todo.text}
              </span>
              <span className="text-[10px] text-muted-foreground hidden group-hover:block">
                {formatDateTime(todo.createdAt)}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-destructive text-xs transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          {todos.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">No todos yet</p>
          )}
        </div>
      </div>

      {/* Quote of the Day */}
      {randomQuote && (
        <div
          className="rounded-xl p-4 border"
          style={{ borderColor: 'var(--accent-soft)', background: 'var(--accent-soft)' }}
        >
          <div className="flex items-start gap-2">
            <Quote className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
            <div>
              <p className="text-sm italic">"{randomQuote.text}"</p>
              {randomQuote.author && (
                <p className="text-xs text-muted-foreground mt-1">— {randomQuote.author}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Notes */}
      {activeNotes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Recent Notes
            </h3>
            <button
              onClick={() => onNavigate('notes')}
              className="text-xs font-medium"
              style={{ color: 'var(--accent)' }}
            >
              View all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeNotes.slice(0, 4).map((note) => (
              <div
                key={note.id}
                className="bg-card rounded-xl border border-border/50 p-3 cursor-pointer hover:border-[var(--accent)] transition-colors"
                onClick={() => onNavigate('notes')}
              >
                {note.title && <p className="font-medium text-sm mb-1 truncate">{note.title}</p>}
                {note.content && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">
                  {formatDateTime(note.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => onNavigate('notes', { quickAdd: true })}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
        style={{ background: 'var(--accent)', color: 'var(--accent-text, #1a1a1a)' }}
        aria-label="Quick add note"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-4 pb-2">
        <p>
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'unknown-app')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
            style={{ color: 'var(--accent)' }}
          >
            caffeine.ai
          </a>{' '}
          © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
