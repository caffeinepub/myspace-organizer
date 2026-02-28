import type { Record } from '../db/schema';
import { formatDateTime } from './dateFormatter';

function recordExportGetTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}_${hh}${min}`;
}

function recordExportEscapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function recordExportTriggerDownload(content: string, filename: string, mimeType: string) {
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

function formatRecordForTxt(record: Record): string {
  const sep = '='.repeat(60);
  const lines: string[] = [
    sep,
    `Title: ${record.title || '(untitled)'}`,
    `Created: ${formatDateTime(record.createdAt)}`,
    `Updated: ${formatDateTime(record.updatedAt)}`,
    '',
    record.content || '',
    sep,
  ];
  return lines.join('\n');
}

function formatRecordForDoc(record: Record): string {
  const body = (record.content || '').replace(/\n/g, '<br/>');
  return `
    <div style="margin-bottom:32px; border-bottom:2px solid #ccc; padding-bottom:16px;">
      <h2 style="font-size:18pt; margin-bottom:4px;">${recordExportEscapeHtml(record.title || '(untitled)')}</h2>
      <p><strong>Created:</strong> ${recordExportEscapeHtml(formatDateTime(record.createdAt))}</p>
      <p><strong>Updated:</strong> ${recordExportEscapeHtml(formatDateTime(record.updatedAt))}</p>
      <div style="margin-top:12px; white-space:pre-wrap;">${body}</div>
    </div>`;
}

export function exportRecordsAsTxt(records: Record[]) {
  const ts = recordExportGetTimestamp();
  const content = records.map(formatRecordForTxt).join('\n\n');
  recordExportTriggerDownload(content, `records_${ts}.txt`, 'text/plain');
}

export function exportRecordsAsDoc(records: Record[]) {
  const ts = recordExportGetTimestamp();
  const body = records.map(formatRecordForDoc).join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Records Export</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  recordExportTriggerDownload(html, `records_${ts}.doc`, 'application/msword');
}

export function exportRecordsAsJson(records: Record[]) {
  const ts = recordExportGetTimestamp();
  const content = JSON.stringify(records, null, 2);
  recordExportTriggerDownload(content, `records_${ts}.json`, 'application/json');
}
