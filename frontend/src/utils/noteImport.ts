import { db } from '../db/db';
import { Note } from '../db/schema';

function generateNumericId(): number {
  return Date.now() + Math.floor(Math.random() * 10000);
}

function makeNote(overrides: Partial<Note> & { id: number }): Note {
  return {
    id: overrides.id,
    type: overrides.type ?? 'text',
    title: overrides.title ?? '',
    content: overrides.content ?? '',
    checklistItems: overrides.checklistItems ?? [],
    imageRefs: overrides.imageRefs ?? [],
    color: overrides.color ?? 'default',
    labels: overrides.labels ?? [],
    pinned: overrides.pinned ?? false,
    archived: overrides.archived ?? false,
    trashed: overrides.trashed ?? false,
    reminderAt: overrides.reminderAt ?? null,
    createdAt: overrides.createdAt ?? Date.now(),
    updatedAt: overrides.updatedAt ?? Date.now(),
  };
}

function parseJsonNotes(text: string, existingIds: Set<number>): Note[] {
  const parsed = JSON.parse(text);
  const arr: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
  return arr.map((item: unknown) => {
    const n = item as Record<string, unknown>;
    let id = typeof n.id === 'number' ? (n.id as number) : generateNumericId();
    if (existingIds.has(id)) {
      id = generateNumericId();
    }
    existingIds.add(id);
    return makeNote({
      id,
      type: (n.type as Note['type']) ?? 'text',
      title: typeof n.title === 'string' ? n.title : '',
      content: typeof n.content === 'string' ? n.content : '',
      checklistItems: Array.isArray(n.checklistItems) ? (n.checklistItems as Note['checklistItems']) : [],
      imageRefs: Array.isArray(n.imageRefs) ? (n.imageRefs as string[]) : [],
      color: typeof n.color === 'string' ? n.color : 'default',
      labels: Array.isArray(n.labels) ? (n.labels as string[]) : [],
      pinned: !!n.pinned,
      archived: !!n.archived,
      trashed: !!n.trashed,
      reminderAt: typeof n.reminderAt === 'number' ? n.reminderAt : null,
      createdAt: typeof n.createdAt === 'number' ? n.createdAt : Date.now(),
      updatedAt: typeof n.updatedAt === 'number' ? n.updatedAt : Date.now(),
    });
  });
}

function parseTxtNotes(text: string, existingIds: Set<number>): Note[] {
  const sep = '='.repeat(60);
  const blocks = text.split(sep).map(b => b.trim()).filter(Boolean);

  if (blocks.length > 0 && blocks[0].startsWith('Title:')) {
    return blocks.map(block => {
      const lines = block.split('\n');
      const get = (prefix: string) => {
        const line = lines.find(l => l.startsWith(prefix));
        return line ? line.slice(prefix.length).trim() : '';
      };
      const emptyIdx = lines.findIndex(l => l === '');
      const content = emptyIdx >= 0 ? lines.slice(emptyIdx + 1).join('\n').trim() : '';
      const labelsStr = get('Labels:');
      const labels = labelsStr && labelsStr !== 'none' ? labelsStr.split(',').map(l => l.trim()) : [];
      let id = generateNumericId();
      while (existingIds.has(id)) id = generateNumericId();
      existingIds.add(id);
      return makeNote({
        id,
        title: get('Title:'),
        content,
        labels,
        pinned: get('Pinned:') === 'Yes',
        archived: get('Archived:') === 'Yes',
        trashed: get('Trashed:') === 'Yes',
      });
    });
  }

  // Fallback: single note
  let id = generateNumericId();
  while (existingIds.has(id)) id = generateNumericId();
  existingIds.add(id);
  return [makeNote({ id, title: 'Imported Note', content: text })];
}

function parseDocNotes(text: string, existingIds: Set<number>): Note[] {
  const stripped = text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
  let id = generateNumericId();
  while (existingIds.has(id)) id = generateNumericId();
  existingIds.add(id);
  return [makeNote({ id, title: 'Imported Note', content: stripped })];
}

export async function importNotesFromFile(
  file: File,
  existingNotes: Note[]
): Promise<{ count: number; error?: string }> {
  // Filter out undefined ids before building the set
  const existingIds = new Set<number>(
    existingNotes.map(n => n.id).filter((id): id is number => id !== undefined)
  );
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  try {
    const text = await file.text();
    let notes: Note[] = [];

    if (ext === 'json') {
      notes = parseJsonNotes(text, existingIds);
    } else if (ext === 'txt') {
      notes = parseTxtNotes(text, existingIds);
    } else if (ext === 'doc' || ext === 'docx') {
      notes = parseDocNotes(text, existingIds);
    } else {
      return { count: 0, error: 'Unsupported file format. Please use .json, .txt, or .doc/.docx.' };
    }

    if (notes.length === 0) {
      return { count: 0, error: 'No notes found in the file.' };
    }

    for (const note of notes) {
      // Strip the id so IndexedDB auto-assigns a fresh one (avoids key conflicts)
      const { id: _id, ...noteWithoutId } = note;
      void _id;
      await db.notes.add(noteWithoutId as Omit<Note, 'id'>);
    }

    return { count: notes.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error during import.';
    return { count: 0, error: msg };
  }
}
