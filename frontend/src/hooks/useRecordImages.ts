/**
 * Manages record image attachments in a separate localStorage key.
 * Uses the key 'recordImagesById' so existing record data is untouched.
 * Images are stored as base64 data URLs, keyed by record ID.
 */

const RECORD_IMAGES_STORAGE_KEY = 'recordImagesById';

function loadRecordImagesMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(RECORD_IMAGES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveRecordImagesMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(RECORD_IMAGES_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage quota exceeded or unavailable — silently ignore
  }
}

/**
 * Compresses an image File to max 1600px width at ~0.7 JPEG quality.
 * Returns a base64 data URL string.
 */
export function compressRecordImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_WIDTH = 1600;
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
}

/** Save a compressed image data URL for a given record ID. */
export function saveRecordImage(recordId: number | string, dataUrl: string): void {
  const map = loadRecordImagesMap();
  map[String(recordId)] = dataUrl;
  saveRecordImagesMap(map);
}

/** Retrieve the image data URL for a given record ID, or null if none. */
export function getRecordImage(recordId: number | string): string | null {
  const map = loadRecordImagesMap();
  return map[String(recordId)] ?? null;
}

/** Delete the image attachment for a given record ID. */
export function deleteRecordImage(recordId: number | string): void {
  const map = loadRecordImagesMap();
  delete map[String(recordId)];
  saveRecordImagesMap(map);
}
