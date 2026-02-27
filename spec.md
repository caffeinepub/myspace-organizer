# Specification

## Summary
**Goal:** Make note labels/tags fully configurable by the user — allowing add, rename, and delete operations with persistence — without changing any existing Notes UI layout or other features.

**Planned changes:**
- Persist user-defined labels in the existing IndexedDB `labels` table (OrganizerDB); seed defaults (All, Welcome, Work, Personal, Ideas) on first run
- Extend the `useLabels` hook to expose `createLabel`, `updateLabel`, and `deleteLabel` operations; block modifications to the "All" label
- When a label is deleted, reassign all notes using that label to "All" with no data loss
- Update the `LabelManager` modal to support adding new labels, renaming existing labels (except "All"), and deleting labels (except "All") with a confirmation step
- Ensure the label filter bar on the Notes page reads labels dynamically so changes are reflected immediately without a page reload

**User-visible outcome:** Users can open the LabelManager modal to add new labels, rename existing ones, and delete unwanted ones. All changes persist across sessions, the filter bar updates instantly, and the "All" label always remains as the default.
