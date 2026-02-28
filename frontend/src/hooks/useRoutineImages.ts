/**
 * Manages routine item image attachments in a separate localStorage key.
 * Uses the key 'routineImagesById' so existing routine data is untouched.
 * Images are stored as base64 data URLs, keyed by routine item ID.
 */

const ROUTINE_IMAGES_STORAGE_KEY = 'routineImagesById';

function loadRoutineImagesMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ROUTINE_IMAGES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveRoutineImagesMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(ROUTINE_IMAGES_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage quota exceeded or unavailable — silently ignore
  }
}

/**
 * Compresses an image File to max 1200px width at ~0.75 JPEG quality.
 * Returns a base64 data URL string.
 */
export function compressRoutineImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_WIDTH = 1200;
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
}

/** Save a compressed image data URL for a given routine item ID. */
export function saveRoutineImage(itemId: string, dataUrl: string): void {
  const map = loadRoutineImagesMap();
  map[itemId] = dataUrl;
  saveRoutineImagesMap(map);
}

/** Retrieve the image data URL for a given routine item ID, or null if none. */
export function getRoutineImage(itemId: string): string | null {
  const map = loadRoutineImagesMap();
  return map[itemId] ?? null;
}

/** Delete the image attachment for a given routine item ID. */
export function deleteRoutineImage(itemId: string): void {
  const map = loadRoutineImagesMap();
  delete map[itemId];
  saveRoutineImagesMap(map);
}
