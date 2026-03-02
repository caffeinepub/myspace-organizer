import { RoutineItem, RoutineProfile } from '../db/schema';

function getTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}_${hh}${min}`;
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTimeAmPm(time: string): string {
  try {
    const [hStr, mStr] = time.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return time;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  } catch {
    return time;
  }
}

function profileLabel(profileType: string): string {
  if (profileType === 'weekday') return 'Weekdays';
  if (profileType === 'weekend') return 'Weekends';
  return profileType;
}

function formatItemForTxt(item: RoutineItem, pType: string): string {
  const lines: string[] = [
    `  - Title: ${item.title || '(untitled)'}`,
    `    Profile: ${profileLabel(pType)}`,
    `    Time: ${formatTimeAmPm(item.time || '')}`,
  ];
  if (item.tag) lines.push(`    Tag: ${item.tag}`);
  if (item.icon) lines.push(`    Icon: ${item.icon}`);
  if (item.duration !== undefined) lines.push(`    Duration: ${item.duration} min`);
  return lines.join('\n');
}

function formatProfileForTxt(profile: RoutineProfile): string {
  const sep = '='.repeat(60);
  const pLabel = profileLabel(profile.profileType);
  const items = (profile.items || []).map(item => formatItemForTxt(item, profile.profileType)).join('\n');
  return [
    sep,
    `Profile: ${pLabel}`,
    `Items (${(profile.items || []).length}):`,
    items || '  (none)',
    sep,
  ].join('\n');
}

function formatItemForDoc(item: RoutineItem, pType: string): string {
  const tag = item.tag ? `<p><strong>Tag:</strong> ${escapeHtml(item.tag)}</p>` : '';
  const icon = item.icon ? `<p><strong>Icon:</strong> ${escapeHtml(item.icon)}</p>` : '';
  const duration = item.duration !== undefined ? `<p><strong>Duration:</strong> ${item.duration} min</p>` : '';
  return `
    <div style="margin-left:16px; margin-bottom:12px; border-left:3px solid #ccc; padding-left:8px;">
      <strong>${escapeHtml(item.title || '(untitled)')}</strong>
      <p><strong>Profile:</strong> ${escapeHtml(profileLabel(pType))} &nbsp; <strong>Time:</strong> ${escapeHtml(formatTimeAmPm(item.time || ''))}</p>
      ${tag}${icon}${duration}
    </div>`;
}

function formatProfileForDoc(profile: RoutineProfile): string {
  const pLabel = profileLabel(profile.profileType);
  const items = (profile.items || []).map(item => formatItemForDoc(item, profile.profileType)).join('');
  return `
    <div style="margin-bottom:32px; border-bottom:2px solid #ccc; padding-bottom:16px;">
      <h2 style="font-size:16pt;">Profile: ${escapeHtml(pLabel)}</h2>
      ${items || '<p><em>(no items)</em></p>'}
    </div>`;
}

// ---- Export All Routines ----

export function exportAllRoutinesAsTxt(profiles: RoutineProfile[]) {
  const content = profiles.map(formatProfileForTxt).join('\n\n');
  triggerDownload(content, `routines_${getTimestamp()}.txt`, 'text/plain');
}

export function exportAllRoutinesAsDoc(profiles: RoutineProfile[]) {
  const body = profiles.map(formatProfileForDoc).join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Routines Export</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  triggerDownload(html, `routines_${getTimestamp()}.doc`, 'application/msword');
}

export function exportAllRoutinesAsJson(profiles: RoutineProfile[]) {
  const content = JSON.stringify(profiles, null, 2);
  triggerDownload(content, `routines_${getTimestamp()}.json`, 'application/json');
}

// ---- Export Selected Routines (active profile) ----

export function exportSelectedRoutinesAsTxt(profiles: RoutineProfile[]) {
  const content = profiles.map(formatProfileForTxt).join('\n\n');
  triggerDownload(content, `routines_${getTimestamp()}.txt`, 'text/plain');
}

export function exportSelectedRoutinesAsDoc(profiles: RoutineProfile[]) {
  const body = profiles.map(formatProfileForDoc).join('');
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Routines Export</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  triggerDownload(html, `routines_${getTimestamp()}.doc`, 'application/msword');
}

export function exportSelectedRoutinesAsJson(profiles: RoutineProfile[]) {
  const content = JSON.stringify(profiles, null, 2);
  triggerDownload(content, `routines_${getTimestamp()}.json`, 'application/json');
}
