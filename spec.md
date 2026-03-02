# Specification

## Summary
**Goal:** Fix image aspect ratio in the Notes view and add file upload functionality to the Routines section.

**Planned changes:**
- Remove fixed aspect ratio constraints (e.g., `aspect-video`, `aspect-square`) from image containers in NoteCard and NoteModal so images display at their natural dimensions
- Integrate the existing `ImageUploadPicker` component into RoutinesPage using the same UI, styling, trigger button, dropdown options (camera, gallery, file), and outside-click/Escape dismissal behavior as the Notes section
- Store and display uploaded images within routine items using the same logic as notes

**User-visible outcome:** Images in the Notes view no longer appear letterboxed or cropped — they display at their natural proportions. Routine items now have the same image upload capability as notes, with identical UI and behavior.
