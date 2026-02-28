import type { Note } from '../db/schema';
import { formatDateTime } from './dateFormatter';

/**
 * Sanitizes a string for use as a filename by removing/replacing invalid characters.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .trim()
    .slice(0, 100) || 'Note';
}

/**
 * Formats a timestamp as YYYY-MM-DD_HHMM for use in filenames.
 */
function formatFilenameDate(timestamp: number): string {
  const d = new Date(timestamp);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}_${hh}${min}`;
}

/**
 * Converts plain text with newlines to HTML paragraphs/line breaks.
 */
function textToHtml(text: string): string {
  return text
    .split('\n')
    .map(line => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || '&nbsp;'}</p>`)
    .join('');
}

/**
 * Exports a note as a Word-compatible .DOC file (HTML-based).
 * Includes title, labels, body, and created/updated timestamps.
 * Triggers a client-side download — no server calls.
 */
export function exportNoteAsDoc(note: Note): void {
  const titleText = note.title || 'Untitled Note';
  const labelsLine = note.labels.length > 0 ? note.labels.join(', ') : '';
  const createdStr = formatDateTime(note.createdAt);
  const updatedStr = formatDateTime(note.updatedAt);

  // Build checklist HTML if applicable
  let bodyHtml = '';
  if (note.type === 'checklist') {
    const items = note.checklistItems
      .map(item => {
        const checked = item.checked ? '☑' : '☐';
        const style = item.checked ? 'text-decoration: line-through; color: #888;' : '';
        return `<p style="${style}">${checked} ${item.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
      })
      .join('');
    bodyHtml = items || '<p>&nbsp;</p>';
  } else {
    bodyHtml = textToHtml(note.content);
  }

  const html = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta name=ProgId content=Word.Document>
  <meta name=Generator content="Microsoft Word 15">
  <meta name=Originator content="Microsoft Word 15">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: Calibri, Arial, sans-serif;
      font-size: 12pt;
      margin: 2cm;
      color: #1e293b;
    }
    h1 {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 4pt;
      color: #0f172a;
    }
    .labels {
      font-size: 9pt;
      color: #64748b;
      margin-bottom: 4pt;
    }
    .dates {
      font-size: 9pt;
      color: #94a3b8;
      margin-bottom: 16pt;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8pt;
    }
    p {
      margin: 0 0 6pt 0;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <h1>${titleText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
  ${labelsLine ? `<p class="labels">🏷️ ${labelsLine.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : ''}
  <p class="dates">
    Created: ${createdStr}${updatedStr && updatedStr !== createdStr ? `&nbsp;&nbsp;|&nbsp;&nbsp;Updated: ${updatedStr}` : ''}
  </p>
  ${bodyHtml}
</body>
</html>`.trim();

  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);

  const sanitizedTitle = sanitizeFilename(titleText);
  const dateStr = formatFilenameDate(note.updatedAt || note.createdAt || Date.now());
  const filename = `${sanitizedTitle}_${dateStr}.doc`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
