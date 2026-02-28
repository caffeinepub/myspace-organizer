import { formatDateTime } from './dateFormatter';

// Concrete interface matching RecordEntry in RecordsPage — no index signature
// so it is compatible with the RecordEntry type used in the page.
export interface RecordExportItem {
  id?: number;
  title?: string;
  body?: string;
  content?: string;
  createdAt?: number | string | Date;
  tags?: string[];
  imageId?: string;
}

function getFilenameBase(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `records_${yyyy}-${mm}-${dd}_${hh}${min}`;
}

function getRecordTitle(record: RecordExportItem): string {
  return record.title || '';
}

function getRecordBody(record: RecordExportItem): string {
  return record.body || record.content || '';
}

function getRecordDate(record: RecordExportItem): string {
  const raw = record.createdAt;
  if (raw === undefined || raw === null) return '';
  return formatDateTime(raw as string | number | Date);
}

function getRecordTags(record: RecordExportItem): string[] {
  return Array.isArray(record.tags) ? record.tags : [];
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function exportRecordsAsTxt(records: RecordExportItem[]): void {
  const lines: string[] = [];
  lines.push('RECORDS EXPORT');
  lines.push('==============');
  lines.push('');

  records.forEach((record, index) => {
    lines.push(`Record ${index + 1}`);
    lines.push('----------');
    const title = getRecordTitle(record);
    if (title) lines.push(`Title: ${title}`);
    const body = getRecordBody(record);
    if (body) lines.push(`Details: ${body}`);
    const dateStr = getRecordDate(record);
    if (dateStr) lines.push(`Date: ${dateStr}`);
    const tags = getRecordTags(record);
    if (tags.length > 0) lines.push(`Tags: ${tags.join(', ')}`);
    lines.push('');
  });

  triggerDownload(lines.join('\n'), `${getFilenameBase()}.txt`, 'text/plain;charset=utf-8');
}

export function exportRecordsAsDoc(records: RecordExportItem[]): void {
  const rows = records.map((record, index) => {
    const title = getRecordTitle(record);
    const body = getRecordBody(record);
    const dateStr = getRecordDate(record);
    const tags = getRecordTags(record);

    let html = `<h2>Record ${index + 1}</h2>`;
    if (title) html += `<p><strong>Title:</strong> ${escapeHtml(title)}</p>`;
    if (body) html += `<p><strong>Details:</strong> ${escapeHtml(body).replace(/\n/g, '<br/>')}</p>`;
    if (dateStr) html += `<p><strong>Date:</strong> ${escapeHtml(dateStr)}</p>`;
    if (tags.length > 0) html += `<p><strong>Tags:</strong> ${escapeHtml(tags.join(', '))}</p>`;
    html += '<hr/>';
    return html;
  });

  const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"/><title>Records Export</title></head>
<body>
<h1>Records Export</h1>
${rows.join('\n')}
</body>
</html>`;

  triggerDownload(docHtml, `${getFilenameBase()}.doc`, 'application/msword');
}

export function exportRecordsAsJson(records: RecordExportItem[]): void {
  const data = records.map(record => {
    const out: Record<string, unknown> = {};
    const title = getRecordTitle(record);
    const body = getRecordBody(record);
    const dateStr = getRecordDate(record);
    const tags = getRecordTags(record);

    if (record.id !== undefined) out.id = record.id;
    if (title) out.title = title;
    if (body) out.body = body;
    if (dateStr) out.dateTime = dateStr;
    if (tags.length > 0) out.tags = tags;
    return out;
  });

  triggerDownload(JSON.stringify(data, null, 2), `${getFilenameBase()}.json`, 'application/json');
}
