/**
 * Local data store for notes, records, routines, streaks, and quotes using Zustand.
 * Persists all data to localStorage. Provides CRUD operations for each data type.
 * All timestamps are stored as ISO strings.
 */
import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NoteType = 'text' | 'checklist' | 'image';
export type NoteColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'brown';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  checklistItems?: ChecklistItem[];
  imageUrl?: string;
  color: NoteColor;
  labels: string[];
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  reminderTime?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Record {
  id: string;
  title: string;
  value: string;
  unit: string;
  category: string;
  notes: string;
  createdAt: string; // ISO string
}

export interface RoutineItem {
  id: string;
  title: string;
  description: string;
  time: string; // HH:MM
  days: number[]; // 0=Sun, 6=Sat
  isActive: boolean;
  category: string;
  color: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface HabitLog {
  id: string;
  routineId: string;
  completedAt: string; // ISO string
  note: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null; // ISO string
  checkIns: string[]; // ISO strings
  totalCheckIns: number;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  isFavorite: boolean;
  createdAt: string; // ISO string
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // ISO string
  createdAt: string; // ISO string
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface DataStore {
  notes: Note[];
  records: Record[];
  routines: RoutineItem[];
  habitLogs: HabitLog[];
  streak: StreakData;
  quotes: Quote[];
  todos: Todo[];
  labels: string[];

  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  trashNote: (id: string) => void;
  archiveNote: (id: string) => void;
  restoreNote: (id: string) => void;
  pinNote: (id: string, pinned: boolean) => void;

  // Records
  addRecord: (record: Omit<Record, 'id' | 'createdAt'>) => Record;
  updateRecord: (id: string, updates: Partial<Record>) => void;
  deleteRecord: (id: string) => void;

  // Routines
  addRoutine: (routine: Omit<RoutineItem, 'id' | 'createdAt' | 'updatedAt'>) => RoutineItem;
  updateRoutine: (id: string, updates: Partial<RoutineItem>) => void;
  deleteRoutine: (id: string) => void;
  logHabit: (routineId: string, note?: string) => void;

  // Streak
  checkIn: () => void;

  // Quotes
  addQuote: (quote: Omit<Quote, 'id' | 'createdAt'>) => Quote;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;

  // Todos
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => Todo;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;

  // Labels
  addLabel: (label: string) => void;
  deleteLabel: (label: string) => void;

  // Import/Export
  exportData: () => string;
  importData: (json: string) => void;
  clearAllData: () => void;
  seedData: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadData<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T;
  } catch {
    // ignore
  }
  return fallback;
}

function saveData<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const defaultStreak: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCheckIn: null,
  checkIns: [],
  totalCheckIns: 0,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDataStore = create<DataStore>((set, get) => ({
  notes: loadData<Note[]>('notes', []),
  records: loadData<Record[]>('records', []),
  routines: loadData<RoutineItem[]>('routines', []),
  habitLogs: loadData<HabitLog[]>('habitLogs', []),
  streak: loadData<StreakData>('streak', defaultStreak),
  quotes: loadData<Quote[]>('quotes', []),
  todos: loadData<Todo[]>('todos', []),
  labels: loadData<string[]>('labels', ['Personal', 'Work', 'Ideas', 'Important']),

  // ── Notes ──────────────────────────────────────────────────────────────────

  addNote: (noteData) => {
    const now = new Date().toISOString();
    const note: Note = {
      ...noteData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => {
      const notes = [note, ...s.notes];
      saveData('notes', notes);
      return { notes };
    });
    return note;
  },

  updateNote: (id, updates) => {
    set((s) => {
      const notes = s.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      );
      saveData('notes', notes);
      return { notes };
    });
  },

  deleteNote: (id) => {
    set((s) => {
      const notes = s.notes.filter((n) => n.id !== id);
      saveData('notes', notes);
      return { notes };
    });
  },

  trashNote: (id) => {
    set((s) => {
      const notes = s.notes.map((n) =>
        n.id === id ? { ...n, isTrashed: true, updatedAt: new Date().toISOString() } : n
      );
      saveData('notes', notes);
      return { notes };
    });
  },

  archiveNote: (id) => {
    set((s) => {
      const notes = s.notes.map((n) =>
        n.id === id
          ? { ...n, isArchived: !n.isArchived, updatedAt: new Date().toISOString() }
          : n
      );
      saveData('notes', notes);
      return { notes };
    });
  },

  restoreNote: (id) => {
    set((s) => {
      const notes = s.notes.map((n) =>
        n.id === id
          ? { ...n, isTrashed: false, isArchived: false, updatedAt: new Date().toISOString() }
          : n
      );
      saveData('notes', notes);
      return { notes };
    });
  },

  pinNote: (id, pinned) => {
    set((s) => {
      const notes = s.notes.map((n) =>
        n.id === id ? { ...n, isPinned: pinned, updatedAt: new Date().toISOString() } : n
      );
      saveData('notes', notes);
      return { notes };
    });
  },

  // ── Records ────────────────────────────────────────────────────────────────

  addRecord: (recordData) => {
    const record: Record = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((s) => {
      const records = [record, ...s.records];
      saveData('records', records);
      return { records };
    });
    return record;
  },

  updateRecord: (id, updates) => {
    set((s) => {
      const records = s.records.map((r) => (r.id === id ? { ...r, ...updates } : r));
      saveData('records', records);
      return { records };
    });
  },

  deleteRecord: (id) => {
    set((s) => {
      const records = s.records.filter((r) => r.id !== id);
      saveData('records', records);
      return { records };
    });
  },

  // ── Routines ───────────────────────────────────────────────────────────────

  addRoutine: (routineData) => {
    const now = new Date().toISOString();
    const routine: RoutineItem = {
      ...routineData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => {
      const routines = [...s.routines, routine];
      saveData('routines', routines);
      return { routines };
    });
    return routine;
  },

  updateRoutine: (id, updates) => {
    set((s) => {
      const routines = s.routines.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      );
      saveData('routines', routines);
      return { routines };
    });
  },

  deleteRoutine: (id) => {
    set((s) => {
      const routines = s.routines.filter((r) => r.id !== id);
      saveData('routines', routines);
      return { routines };
    });
  },

  logHabit: (routineId, note = '') => {
    const log: HabitLog = {
      id: generateId(),
      routineId,
      completedAt: new Date().toISOString(),
      note,
    };
    set((s) => {
      const habitLogs = [log, ...s.habitLogs];
      saveData('habitLogs', habitLogs);
      return { habitLogs };
    });
  },

  // ── Streak ─────────────────────────────────────────────────────────────────

  checkIn: () => {
    set((s) => {
      const now = new Date();
      const todayStr = now.toDateString();
      const lastCheckIn = s.streak.lastCheckIn;

      // Prevent double check-in on same day
      if (lastCheckIn && new Date(lastCheckIn).toDateString() === todayStr) {
        return s;
      }

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday =
        lastCheckIn && new Date(lastCheckIn).toDateString() === yesterday.toDateString();

      const newStreak = wasYesterday ? s.streak.currentStreak + 1 : 1;
      const newLongest = Math.max(newStreak, s.streak.longestStreak);
      const nowIso = now.toISOString();

      const streak: StreakData = {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastCheckIn: nowIso,
        checkIns: [...s.streak.checkIns, nowIso],
        totalCheckIns: s.streak.totalCheckIns + 1,
      };
      saveData('streak', streak);
      return { streak };
    });
  },

  // ── Quotes ─────────────────────────────────────────────────────────────────

  addQuote: (quoteData) => {
    const quote: Quote = {
      ...quoteData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((s) => {
      const quotes = [quote, ...s.quotes];
      saveData('quotes', quotes);
      return { quotes };
    });
    return quote;
  },

  updateQuote: (id, updates) => {
    set((s) => {
      const quotes = s.quotes.map((q) => (q.id === id ? { ...q, ...updates } : q));
      saveData('quotes', quotes);
      return { quotes };
    });
  },

  deleteQuote: (id) => {
    set((s) => {
      const quotes = s.quotes.filter((q) => q.id !== id);
      saveData('quotes', quotes);
      return { quotes };
    });
  },

  // ── Todos ──────────────────────────────────────────────────────────────────

  addTodo: (todoData) => {
    const todo: Todo = {
      ...todoData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((s) => {
      const todos = [todo, ...s.todos];
      saveData('todos', todos);
      return { todos };
    });
    return todo;
  },

  updateTodo: (id, updates) => {
    set((s) => {
      const todos = s.todos.map((t) => (t.id === id ? { ...t, ...updates } : t));
      saveData('todos', todos);
      return { todos };
    });
  },

  deleteTodo: (id) => {
    set((s) => {
      const todos = s.todos.filter((t) => t.id !== id);
      saveData('todos', todos);
      return { todos };
    });
  },

  // ── Labels ─────────────────────────────────────────────────────────────────

  addLabel: (label) => {
    set((s) => {
      if (s.labels.includes(label)) return s;
      const labels = [...s.labels, label];
      saveData('labels', labels);
      return { labels };
    });
  },

  deleteLabel: (label) => {
    set((s) => {
      const labels = s.labels.filter((l) => l !== label);
      saveData('labels', labels);
      return { labels };
    });
  },

  // ── Import/Export ──────────────────────────────────────────────────────────

  exportData: () => {
    const s = get();
    return JSON.stringify(
      {
        notes: s.notes,
        records: s.records,
        routines: s.routines,
        habitLogs: s.habitLogs,
        streak: s.streak,
        quotes: s.quotes,
        todos: s.todos,
        labels: s.labels,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  },

  importData: (json) => {
    const data = JSON.parse(json);
    const newState: Partial<DataStore> = {};
    if (data.notes) { newState.notes = data.notes; saveData('notes', data.notes); }
    if (data.records) { newState.records = data.records; saveData('records', data.records); }
    if (data.routines) { newState.routines = data.routines; saveData('routines', data.routines); }
    if (data.habitLogs) { newState.habitLogs = data.habitLogs; saveData('habitLogs', data.habitLogs); }
    if (data.streak) { newState.streak = data.streak; saveData('streak', data.streak); }
    if (data.quotes) { newState.quotes = data.quotes; saveData('quotes', data.quotes); }
    if (data.todos) { newState.todos = data.todos; saveData('todos', data.todos); }
    if (data.labels) { newState.labels = data.labels; saveData('labels', data.labels); }
    set(newState as DataStore);
  },

  clearAllData: () => {
    const empty: Partial<DataStore> = {
      notes: [],
      records: [],
      routines: [],
      habitLogs: [],
      streak: defaultStreak,
      quotes: [],
      todos: [],
      labels: ['Personal', 'Work', 'Ideas', 'Important'],
    };
    ['notes', 'records', 'routines', 'habitLogs', 'streak', 'quotes', 'todos', 'labels'].forEach(
      (k) => localStorage.removeItem(k)
    );
    set(empty as DataStore);
  },

  seedData: () => {
    const s = get();
    if (s.notes.length > 0 || s.records.length > 0) return; // already seeded

    const now = new Date().toISOString();

    // Seed notes
    const seedNotes: Note[] = [
      {
        id: generateId(),
        type: 'text',
        title: 'Welcome to Your Organizer!',
        content:
          'This is your personal organizer. Use it to keep notes, track records, build routines, and maintain streaks.',
        color: 'default',
        labels: ['Personal'],
        isPinned: true,
        isArchived: false,
        isTrashed: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        type: 'checklist',
        title: 'Getting Started',
        content: '',
        checklistItems: [
          { id: generateId(), text: 'Create your first note', checked: true },
          { id: generateId(), text: 'Set up a daily routine', checked: false },
          { id: generateId(), text: 'Start a streak', checked: false },
          { id: generateId(), text: 'Add a personal record', checked: false },
        ],
        color: 'green',
        labels: ['Personal'],
        isPinned: false,
        isArchived: false,
        isTrashed: false,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Seed records
    const seedRecords: Record[] = [
      {
        id: generateId(),
        title: 'Morning Run',
        value: '5.2',
        unit: 'km',
        category: 'Fitness',
        notes: 'Personal best!',
        createdAt: now,
      },
    ];

    // Seed routines
    const seedRoutines: RoutineItem[] = [
      {
        id: generateId(),
        title: 'Morning Meditation',
        description: '10 minutes of mindfulness',
        time: '07:00',
        days: [1, 2, 3, 4, 5],
        isActive: true,
        category: 'Wellness',
        color: '#D4AF37',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        title: 'Evening Walk',
        description: '30 minute walk',
        time: '18:00',
        days: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        category: 'Fitness',
        color: '#D4AF37',
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Seed quotes
    const seedQuotes: Quote[] = [
      {
        id: generateId(),
        text: 'The secret of getting ahead is getting started.',
        author: 'Mark Twain',
        isFavorite: true,
        createdAt: now,
      },
      {
        id: generateId(),
        text: 'It does not matter how slowly you go as long as you do not stop.',
        author: 'Confucius',
        isFavorite: false,
        createdAt: now,
      },
    ];

    saveData('notes', seedNotes);
    saveData('records', seedRecords);
    saveData('routines', seedRoutines);
    saveData('quotes', seedQuotes);

    set({
      notes: seedNotes,
      records: seedRecords,
      routines: seedRoutines,
      quotes: seedQuotes,
    });
  },
}));
