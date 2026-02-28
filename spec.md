# Specification

## Summary
**Goal:** Add image upload and camera capture functionality to routine items in the Routines page.

**Planned changes:**
- Add two image input options to each routine item's add/edit UI: one for gallery/file upload and one for camera capture.
- Compress selected images using the existing `compressImage` utility and store them in IndexedDB via the existing `useImageStorage` hook.
- Display a thumbnail preview of the attached image on the routine item card.
- Allow the attached image to be removed or replaced.
- Leave all existing routine features (drag-to-reorder, time/icon fields, speech recognition, import/export, weekday/weekend/today tabs, complete toggle, add/edit/delete) fully unchanged.

**User-visible outcome:** Users can attach a photo to any routine item either by choosing from their gallery or taking a camera photo. A thumbnail of the attached image appears on the routine card and can be removed or replaced at any time.
