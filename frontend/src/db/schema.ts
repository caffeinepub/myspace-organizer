export interface NoteChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Note {
  id?: number;
  type: 'text' | 'checklist' | 'image';
  title: string;
  content: string;
  checklistItems: NoteChecklistItem[];
  imageRefs: string[]; // keys into imageBlobs table
  color: string;
  labels: string[];
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  reminderAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface RoutineItem {
  id: string;
  time: string; // "HH:MM" 24h
  title: string;
  tag?: string;
  icon?: string;
  duration?: number; // minutes
  completed: boolean;
  order: number;
  imageId?: string; // optional reference to a stored image in routineImagesById localStorage
}

export interface RoutineProfile {
  id?: number;
  profileType: 'weekday' | 'weekend';
  items: RoutineItem[];
}

export interface Record {
  id?: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface StreakData {
  id?: number;
  count: number;
  lastCheckIn: number | null;
  history: number[]; // array of timestamps
}

export interface QuoteData {
  id?: number;
  text: string;
  author?: string;
  alignment: 'left' | 'center' | 'right';
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  backgroundBlur: boolean;
  isActive: boolean;
  rotateMode: 'none' | 'shuffle' | 'daily';
  quoteList: Array<{ text: string; author?: string }>;
  lastRotated?: number;
}

export interface Label {
  id?: number;
  name: string;
  color: string;
  createdAt: number;
}

export interface ImageBlob {
  id?: number;
  key: string;
  blob: Blob;
  type: 'full' | 'thumbnail';
  createdAt: number;
}

export interface AppSettings {
  id?: number;
  key: string;
  value: string;
}
