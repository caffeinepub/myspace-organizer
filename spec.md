# Specification

## Summary
**Goal:** Add three new features exclusively to the Records section: multiple export formats (TXT, DOC, JSON), microphone/speech-to-text input in the Add/Edit modal, and image attachment support in the Add/Edit modal.

**Planned changes:**
- Create a `recordExport` utility that exports records as TXT, DOC (Word-compatible HTML), and JSON files with filenames following the pattern `records_YYYY-MM-DD_HHMM.(txt/doc/json)`, using the existing `dateFormatter` utility for date/time formatting; all exports are client-side only
- Add TXT and DOC export buttons to the existing Records Import/Export area in `RecordsPage.tsx`, alongside the existing JSON export, without changing any other UI layout or styling
- Add a mic button inside the Record Add/Edit modal that uses the existing `useSpeechRecognition` hook to start/stop speech recognition, show live/interim transcription, and append final text to the active input field; show an inline fallback message on unsupported browsers
- Add an optional `imageId` field to the Record TypeScript interface/schema to support linking a stored image to a record
- Add an "Add Image" button inside the Record Add/Edit modal that opens a file picker, compresses the selected image client-side using the existing `imageCompression` utility (max 1600px, ~0.7 quality), stores it in IndexedDB via the existing `useImageStorage` hook, and displays a thumbnail in the record view; allow removing or replacing the image while editing

**User-visible outcome:** Users can export their records in TXT, DOC, or JSON format directly from the Records page, dictate text into a record using their microphone, and attach a compressed image to any record that displays as a thumbnail — all working offline with no server requests.
