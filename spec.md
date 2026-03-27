# MySpace Organizer

## Current State
RecordsPage is a basic list with inline edit, a small bottom-sheet view modal (sm:max-w-lg), no tags, no categories, no multi-file attachments, no timeline layout. Routines and Notes have a larger detail modal (max-w-4xl, 95vh), rich card UI, and full file attachment support.

## Requested Changes (Diff)

### Add
- Timeline-style vertical layout for the records list (date separators grouping records by day)
- Mood/type tag picker per record: options like Personal, Work, Health, Travel, Idea, Memory (colored badges)
- Pinned records section at top (star/pin button on each card)
- Large detail modal matching Routines/Notes perspective (max-w-4xl, 90vh, scrollable body)
- Multi-file attachment support in add/edit forms: Camera, Gallery, Files — using same 3-option picker pattern as Notes/Routines
- File preview in detail modal: images at natural ratio with fullscreen click, PDFs inline, videos with controls, others downloadable
- "Add New Record" button in header (same as Notes)
- Colored left-border accent on cards based on category/mood tag
- Word count indicator in add form
- In detail modal: show full content, date/time, tag badge, attached images/files

### Modify
- View modal: upgrade from small bottom-sheet to large centered modal matching Notes/Routines (max-w-4xl, up to 90vh)
- Record cards: show tag badge and attachment count indicator in list view

### Remove
- Nothing removed; all existing storage keys, schema, hooks, and handlers are preserved exactly

## Implementation Plan
1. Keep all existing state, hooks (useRecords, useSpeechRecognition, useRecordImages), storage keys, and export/import logic unchanged
2. Add `tag` field to new records (stored in localStorage under a separate `recordTagsById` key — no schema change to IndexedDB)
3. Add `pinnedRecords` set in localStorage (`recordPinnedIds`) — no schema change
4. Add multi-file attachment storage for records (same pattern as `routineMultiAttachmentsById`) under `recordMultiAttachmentsById` key
5. Enhance the card list: group by date (timeline separators), show tag badge and pin icon, left color border by tag
6. Upgrade view modal to max-w-4xl/90vh with full content, tag, datetime, files, images
7. Add 3-option file picker (Camera/Gallery/Files) to add form using existing ImageUploadPicker or inline inputs
8. Pin toggle button on each card
9. Word count in textarea
10. Validate, fix lint/type errors
