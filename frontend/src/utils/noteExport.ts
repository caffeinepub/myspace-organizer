import { Note } from '../db/schema';

function getTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}_${hh}${min}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getNoteBody(note: Note): string {
  if (note.type === 'checklist') {
    return note.checklistItems.map(i => `${i.checked ? '[x]' : '[ ]'} ${i.text}`).join('\n');
  }
  return note.content || '';
}

function formatNoteForTxt(note: Note): string {
  const sep = '='.repeat(60);
  const lines: string[] = [
    sep,
    `Title: ${note.title || '(untitled)'}`,
    `Labels: ${(note.labels || []).join(', ') || 'none'}`,
    `Pinned: ${note.pinned ? 'Yes' : 'No'}`,
    `Archived: ${note.archived ? 'Yes' : 'No'}`,
    `Trashed: ${note.trashed ? 'Yes' : 'No'}`,
    `Created: ${note.createdAt ? new Date(note.createdAt).toLocaleString() : 'unknown'}`,
    `Updated: ${note.updatedAt ? new Date(note.updatedAt).toLocaleString() : 'unknown'}`,
    '',
    getNoteBody(note),
    sep,
  ];
  return lines.join('\n');
}

function formatNoteForDoc(note: Note): string {
  const rawBody = getNoteBody(note);
  const body = rawBody.replace(/\n/g, '<br/>');
  return `
    <div style="margin-bottom:32px; border-bottom:2px solid #ccc; padding-bottom:16px;">
      <h2 style="font-size:18pt; margin-bottom:4px;">${escapeHtml(note.title || '(untitled)')}</h2>
      <p><strong>Labels:</strong> ${escapeHtml((note.labels || []).join(', ') || 'none')}</p>
      <p><strong>Pinned:</strong> ${note.pinned ? 'Yes' : 'No'} &nbsp;
         <strong>Archived:</strong> ${note.archived ? 'Yes' : 'No'} &nbsp;
         <strong>Trashed:</strong> ${note.trashed ? 'Yes' : 'No'}</p>
      <p><strong>Created:</strong> ${note.createdAt ? new Date(note.createdAt).toLocaleString() : 'unknown'}</p>
      <p><strong>Updated:</strong> ${note.updatedAt ? new Date(note.updatedAt).toLocaleString() : 'unknown'}</p>
      <div style="margin-top:12px; white-space:pre-wrap;">${body}</div>
    </div>`;
}

// ---- Export All Notes ----

export function exportAllNotesAsTxt(notes: Note[]) {
  const content = notes.map(formatNoteForTxt).join('\n\n');
  triggerDownload(content, `notes_all_${getTimestamp()}.txt`, 'text/plain');
}

export function exportAllNotesAsDoc(notes: Note[]) {
  const body = notes.map(formatNoteForDoc).join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Notes Export</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  triggerDownload(html, `notes_all_${getTimestamp()}.doc`, 'application/msword');
}

export function exportAllNotesAsJson(notes: Note[]) {
  const content = JSON.stringify(notes, null, 2);
  triggerDownload(content, `notes_all_${getTimestamp()}.json`, 'application/json');
}

// ---- Export Selected Notes ----

export function exportSelectedNotesAsTxt(notes: Note[]) {
  const content = notes.map(formatNoteForTxt).join('\n\n');
  triggerDownload(content, `notes_selected_${getTimestamp()}.txt`, 'text/plain');
}

export function exportSelectedNotesAsDoc(notes: Note[]) {
  const body = notes.map(formatNoteForDoc).join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Notes Export</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  triggerDownload(html, `notes_selected_${getTimestamp()}.doc`, 'application/msword');
}

export function exportSelectedNotesAsJson(notes: Note[]) {
  const content = JSON.stringify(notes, null, 2);
  triggerDownload(content, `notes_selected_${getTimestamp()}.json`, 'application/json');
}

// ---- Legacy single-note export (kept for backward compat) ----
export function exportNoteAsDoc(note: Note) {
  const body = formatNoteForDoc(note);
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(note.title || 'Note')}</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  const safeTitle = (note.title || 'Note').replace(/[^a-z0-9]/gi, '_').substring(0, 40);
  const ts = getTimestamp();
  triggerDownload(html, `${safeTitle}_${ts}.doc`, 'application/msword');
}
