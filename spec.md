# Specification

## Summary
**Goal:** Fix two bugs in the Notes section: labels not updating instantly in the filter bar after add/rename, and "Delete permanently" / "Empty Trash" not immediately removing notes from the UI and IndexedDB.

**Planned changes:**
- After adding or renaming a label in LabelManager, synchronously refresh the labels state in NotesPage so the filter bar updates immediately without a page refresh.
- If the currently active filter label was renamed, keep it selected and display the new name instantly.
- Fix "Delete permanently" in the Trash view to immediately remove the note from both the UI list and IndexedDB, with no reappearance on refresh.
- Fix "Empty Trash" (if present) to immediately delete all trashed notes from IndexedDB and clear the UI list, resetting any trash count badges to zero instantly.

**User-visible outcome:** Users can add or rename labels and see the changes reflected in the Notes filter bar immediately. Permanently deleting individual notes or emptying the trash in the Trash view removes them from the UI and storage instantly, with no stale data after a page refresh.
