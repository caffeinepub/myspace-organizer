import { Table, clearAllStores } from './idb';
import type { Note, RoutineProfile, Record, StreakData, QuoteData, Label, ImageBlob, AppSettings } from './schema';

class OrganizerDB {
  notes = new Table<Note>('notes');
  routines = new Table<RoutineProfile>('routines');
  records = new Table<Record>('records');
  streak = new Table<StreakData>('streak');
  quotes = new Table<QuoteData>('quotes');
  labels = new Table<Label>('labels');
  imageBlobs = new Table<ImageBlob>('imageBlobs');
  settings = new Table<AppSettings>('settings');

  async clearAll(): Promise<void> {
    await clearAllStores();
  }
}

export const db = new OrganizerDB();
