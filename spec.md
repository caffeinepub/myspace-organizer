# Specification

## Summary
**Goal:** Add speech-to-text mic input and DOC export functionality to the Notes add/edit flow in MyOrganizer Pro.

**Planned changes:**
- Add a Mic button inside the NoteModal component (in the title and body input areas) that uses the browser's Web Speech API (SpeechRecognition / webkitSpeechRecognition) to perform live speech-to-text transcription
- Transcribed text is inserted/appended at the current cursor position in the active field (title or body) in real time
- Provide stop/pause and resume controls while recording is active
- Display an inline message "Speech-to-text not supported on this browser." on unsupported browsers instead of the Mic button
- No raw audio is stored; only the resulting text is saved via the existing note save flow
- Add an "Export as Document" option to the existing note actions area (NoteModal or NoteCard context menu) without altering existing controls
- Export generates a client-side .DOC (Word-compatible HTML) file containing the note title, body (line breaks preserved), labels/tags below the title, and created/updated date-time in the app's standard format
- Downloaded filename follows the pattern: `NoteTitle_YYYY-MM-DD_HHMM.doc`
- All new functionality is purely client-side with no server calls

**User-visible outcome:** Users can dictate notes using their microphone directly inside the note editor, and can export individual notes as .DOC files from the note actions area.
