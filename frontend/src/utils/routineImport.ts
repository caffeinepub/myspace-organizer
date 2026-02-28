import { db } from '../db/db';
import { RoutineItem, RoutineProfile } from '../db/schema';

function generateStringId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeRoutineItem(overrides: {
  id: string;
  title: string;
  time: string;
  tag?: string;
  icon?: string;
  duration?: number;
  completed?: boolean;
  order?: number;
  imageId?: string;
}): RoutineItem {
  return {
    id: overrides.id,
    time: overrides.time,
    title: overrides.title,
    tag: overrides.tag,
    icon: overrides.icon,
    duration: overrides.duration,
    completed: overrides.completed ?? false,
    order: overrides.order ?? 0,
    imageId: overrides.imageId,
  };
}

function parseJsonRoutines(text: string): RoutineProfile[] {
  const parsed = JSON.parse(text);
  const arr: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
  return arr.map((item: unknown) => {
    const p = item as Record<string, unknown>;
    const profileType: 'weekday' | 'weekend' =
      p.profileType === 'weekend' ? 'weekend' : 'weekday';
    const items: RoutineItem[] = Array.isArray(p.items)
      ? (p.items as Record<string, unknown>[]).map((ri, idx) =>
          makeRoutineItem({
            id: typeof ri.id === 'string' ? ri.id : generateStringId(),
            title: typeof ri.title === 'string' ? ri.title : '',
            time: typeof ri.time === 'string' ? ri.time : '08:00',
            tag: typeof ri.tag === 'string' ? ri.tag : undefined,
            icon: typeof ri.icon === 'string' ? ri.icon : undefined,
            duration: typeof ri.duration === 'number' ? ri.duration : undefined,
            completed: !!ri.completed,
            order: typeof ri.order === 'number' ? ri.order : idx,
            // imageId is preserved from JSON if present, but the actual image blob
            // must already exist in localStorage for the reference to be valid
            imageId: typeof ri.imageId === 'string' ? ri.imageId : undefined,
          })
        )
      : [];
    return { profileType, items } as RoutineProfile;
  });
}

function parseTxtRoutines(text: string): RoutineProfile[] {
  const sep = '='.repeat(60);
  const blocks = text.split(sep).map(b => b.trim()).filter(Boolean);

  if (blocks.length > 0 && blocks[0].startsWith('Profile:')) {
    return blocks.map(block => {
      const lines = block.split('\n');
      const profileTypeRaw = lines[0]?.replace('Profile:', '').trim() || 'weekday';
      const profileType: 'weekday' | 'weekend' =
        profileTypeRaw === 'weekend' ? 'weekend' : 'weekday';
      const items: RoutineItem[] = [];
      let currentTitle = '';
      let currentTime = '08:00';
      let currentTag: string | undefined;
      let inItem = false;

      for (const line of lines.slice(2)) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- Title:')) {
          if (inItem) {
            items.push(makeRoutineItem({
              id: generateStringId(),
              title: currentTitle,
              time: currentTime,
              tag: currentTag,
              order: items.length,
              // imageId is not preserved from TXT format
            }));
          }
          currentTitle = trimmed.replace('- Title:', '').trim();
          currentTime = '08:00';
          currentTag = undefined;
          inItem = true;
        } else if (trimmed.startsWith('Time:') && inItem) {
          currentTime = trimmed.replace('Time:', '').trim();
        } else if (trimmed.startsWith('Tag:') && inItem) {
          currentTag = trimmed.replace('Tag:', '').trim();
        }
      }
      if (inItem) {
        items.push(makeRoutineItem({
          id: generateStringId(),
          title: currentTitle,
          time: currentTime,
          tag: currentTag,
          order: items.length,
        }));
      }

      return { profileType, items } as RoutineProfile;
    });
  }

  // Fallback: single item
  return [{
    profileType: 'weekday',
    items: [makeRoutineItem({
      id: generateStringId(),
      title: 'Imported Routine',
      time: '08:00',
      order: 0,
    })],
  } as RoutineProfile];
}

function parseDocRoutines(text: string): RoutineProfile[] {
  const stripped = text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
  const title = stripped.substring(0, 100).split('\n')[0] || 'Imported Routine';
  return [{
    profileType: 'weekday',
    items: [makeRoutineItem({
      id: generateStringId(),
      title,
      time: '08:00',
      order: 0,
    })],
  } as RoutineProfile];
}

export async function importRoutinesFromFile(
  file: File,
  existingProfiles: RoutineProfile[]
): Promise<{ count: number; error?: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  try {
    const text = await file.text();
    let profiles: RoutineProfile[] = [];

    if (ext === 'json') {
      profiles = parseJsonRoutines(text);
    } else if (ext === 'txt') {
      profiles = parseTxtRoutines(text);
    } else if (ext === 'doc' || ext === 'docx') {
      profiles = parseDocRoutines(text);
    } else {
      return { count: 0, error: 'Unsupported file format. Please use .json, .txt, or .doc/.docx.' };
    }

    if (profiles.length === 0) {
      return { count: 0, error: 'No routines found in the file.' };
    }

    let totalItems = 0;
    for (const profile of profiles) {
      const existing = existingProfiles.find(p => p.profileType === profile.profileType);
      if (existing && existing.id !== undefined) {
        // Merge items into existing profile, ensuring no duplicate string ids
        const existingItemIds = new Set(existing.items.map(i => i.id));
        const newItems: RoutineItem[] = profile.items.map((item, idx) => {
          const newId = existingItemIds.has(item.id) ? generateStringId() : item.id;
          return { ...item, id: newId, order: existing.items.length + idx };
        });
        const merged: RoutineProfile = {
          ...existing,
          items: [...existing.items, ...newItems],
        };
        await db.routines.put(merged);
        totalItems += newItems.length;
      } else {
        // Add as new profile (strip id so IndexedDB auto-assigns)
        const { id: _id, ...profileWithoutId } = profile;
        void _id;
        await db.routines.add(profileWithoutId as Omit<RoutineProfile, 'id'>);
        totalItems += profile.items.length;
      }
    }

    return { count: totalItems };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error during import.';
    return { count: 0, error: msg };
  }
}
