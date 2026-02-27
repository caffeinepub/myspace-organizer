import { useCallback } from 'react';
import { db } from '../db/db';
import { showErrorToast } from '../store/toastStore';

export function useImageStorage() {
  const saveImage = useCallback(async (key: string, blob: Blob, type: 'full' | 'thumbnail'): Promise<void> => {
    try {
      // Remove existing with same key+type
      const all = await db.imageBlobs.toArray();
      const existing = all.find(i => i.key === key && i.type === type);
      if (existing?.id) await db.imageBlobs.delete(existing.id);
      await db.imageBlobs.add({ key, blob, type, createdAt: Date.now() });
    } catch {
      showErrorToast('Failed to save image');
    }
  }, []);

  const getImageUrl = useCallback(async (key: string, type: 'full' | 'thumbnail'): Promise<string | null> => {
    try {
      const all = await db.imageBlobs.toArray();
      const record = all.find(i => i.key === key && i.type === type);
      if (!record) return null;
      return URL.createObjectURL(record.blob);
    } catch {
      return null;
    }
  }, []);

  const deleteImage = useCallback(async (key: string): Promise<void> => {
    try {
      const all = await db.imageBlobs.toArray();
      const toDelete = all.filter(i => i.key === key);
      for (const item of toDelete) {
        if (item.id) await db.imageBlobs.delete(item.id);
      }
    } catch {
      showErrorToast('Failed to delete image');
    }
  }, []);

  return { saveImage, getImageUrl, deleteImage };
}
