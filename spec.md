# Specification

## Summary
**Goal:** Add TXT, WORD (DOC), and JSON export format options to the Routines export area, and add a Mic (speech-to-text) button inside the Routine Add/Edit form using the browser Web Speech API.

**Planned changes:**
- Add TXT, WORD (DOC as Word-compatible HTML), and JSON export format options in the existing Routines export area without removing or changing existing export behavior
- Implement/update `frontend/src/utils/routineExport.ts` with client-side export logic for all three formats, including profile, AM/PM time, title, and any other stored fields per routine item
- Name exported files as `routines_YYYY-MM-DD_HHMM.(txt|doc|json)` using the current local date/time
- Add a Mic button inside the Routine Add/Edit form next to the title or notes input, using the browser Web Speech API for speech-to-text
- Show live interim transcription while recognition is active; append final transcript to the active input field on stop
- Use or minimally extend the existing `useSpeechRecognition` hook
- If the browser does not support SpeechRecognition, hide the Mic button and show the inline message "Speech-to-text not supported on this browser." in the Routine Add/Edit form

**User-visible outcome:** Users can export their routines in TXT, WORD, or JSON formats directly from the Routines page, and can dictate text into the routine title or notes field using their microphone when adding or editing a routine.
