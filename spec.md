# Specification

## Summary
**Goal:** Enhance the Records section with three new export formats (TXT, DOC, JSON), optional image attachment in the Add Record form, and a speech-to-text mic button in the Add Record form.

**Planned changes:**
- Add a new `recordExport.ts` utility with client-side export functions for TXT, DOC (Word-compatible HTML), and JSON formats, following existing export utility patterns
- Add three export buttons (TXT, DOC, JSON) in the Records section UI alongside any existing export controls, with filenames formatted as `records_YYYY-MM-DD_HHMM.ext` and date/time displayed as "28 Feb 2026, 3:45 AM"
- Add an "Add Image" button in the Add Record form only, compressing selected images client-side (max 1600px width, JPEG quality 0.7) and storing them under a new separate storage key (`recordImagesById`) keyed by record ID
- Show a small thumbnail preview of the selected image inside the Add Record form
- Add a Mic button in the Add Record form only, using the browser Web Speech API to append live transcription into the existing text input field; show an inline message "Speech-to-text not supported on this browser." if the API is unavailable

**User-visible outcome:** Users can export their records in TXT, DOC, or JSON format, optionally attach and preview an image when adding a new record, and use speech-to-text to dictate into the record text field — all without affecting any existing Records functionality.
