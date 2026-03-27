import { useCallback, useEffect, useState } from "react";
import { db } from "../db/db";
import type { Label } from "../db/schema";
import { showErrorToast, showSuccessToast } from "../store/toastStore";

const DEFAULT_LABELS = [
  "Work",
  "Personal",
  "Ideas",
  "Fitness",
  "Health",
  "Tech",
  "Devotional",
];

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const all = await db.labels.toArray();

      // Step 1: Remove duplicates — keep only the first occurrence of each name (case-insensitive)
      const seen = new Set<string>();
      for (const label of all) {
        const key = label.name.toLowerCase();
        if (seen.has(key)) {
          // duplicate — delete it
          if (label.id !== undefined) await db.labels.delete(label.id);
        } else {
          seen.add(key);
        }
      }

      // Step 2: Refresh after dedup
      const deduped = await db.labels.toArray();
      const existingNames = deduped.map((l) => l.name.toLowerCase());

      // Step 3: Add any missing DEFAULT_LABELS
      for (const name of DEFAULT_LABELS) {
        if (!existingNames.includes(name.toLowerCase())) {
          await db.labels.add({
            name,
            color: "#6366f1",
            createdAt: Date.now(),
          });
        }
      }

      const final = await db.labels.toArray();
      setLabels(final);
    } catch {
      showErrorToast("Failed to load labels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createLabel = useCallback(async (name: string, color?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Prevent creating a label named "All" (reserved)
    if (trimmed.toLowerCase() === "all") return;
    // Prevent duplicates (case-insensitive)
    const existing = await db.labels.toArray();
    const duplicate = existing.some(
      (l) => l.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) return;
    try {
      const id = await db.labels.add({
        name: trimmed,
        color: color ?? "#6366f1",
        createdAt: Date.now(),
      });
      const created = await db.labels.get(id);
      if (created) setLabels((prev) => [...prev, created]);
      showSuccessToast("Label created!");
    } catch {
      showErrorToast("Failed to create label");
    }
  }, []);

  const updateLabel = useCallback(async (label: Label) => {
    // Guard: never rename a label whose current name is "All"
    if (label.name.toLowerCase() === "all") return;
    try {
      // Also check the stored label to be safe
      if (label.id !== undefined) {
        const stored = await db.labels.get(label.id);
        if (stored && stored.name.toLowerCase() === "all") return;
      }
      await db.labels.put(label);
      setLabels((prev) => prev.map((l) => (l.id === label.id ? label : l)));
      showSuccessToast("Label updated!");
    } catch {
      showErrorToast("Failed to update label");
    }
  }, []);

  const deleteLabel = useCallback(
    async (id: number, onReassign?: (labelName: string) => Promise<void>) => {
      try {
        const label = await db.labels.get(id);
        if (!label) return;
        // Guard: never delete a label named "All"
        if (label.name.toLowerCase() === "all") return;
        // Reassign notes that used this label before removing it
        if (onReassign) {
          await onReassign(label.name);
        } else {
          // Fallback: directly remove the label from all notes
          const allNotes = await db.notes.toArray();
          const affected = allNotes.filter((n) =>
            n.labels.includes(label.name),
          );
          for (const n of affected) {
            await db.notes.put({
              ...n,
              labels: n.labels.filter((l) => l !== label.name),
              updatedAt: Date.now(),
            });
          }
        }
        await db.labels.delete(id);
        setLabels((prev) => prev.filter((l) => l.id !== id));
        showSuccessToast("Label deleted");
      } catch {
        showErrorToast("Failed to delete label");
      }
    },
    [],
  );

  return {
    labels,
    loading,
    createLabel,
    updateLabel,
    deleteLabel,
    reload: load,
  };
}
