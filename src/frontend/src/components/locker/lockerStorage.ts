export interface LockerEntry {
  id: string;
  type: "password" | "email" | "note" | "file";
  title: string;
  username?: string;
  password?: string;
  url?: string;
  email?: string;
  content?: string;
  attachments?: Array<{ name: string; dataUrl: string; mimeType: string }>;
  createdAt: string;
  updatedAt: string;
}

export const LOCKER_CREDS_KEY = "locker_credentials";
export const LOCKER_ENTRIES_KEY = "locker_entries";
export const LOCKER_SETTINGS_KEY = "locker_settings";

export function hashPin(pin: string, password: string): string {
  return btoa(`${pin}:${password}`);
}

export function hasCredentials(): boolean {
  return !!localStorage.getItem(LOCKER_CREDS_KEY);
}

export function saveCredentials(pin: string, password: string): void {
  localStorage.setItem(LOCKER_CREDS_KEY, hashPin(pin, password));
}

export function verifyCredentials(pin: string, password: string): boolean {
  const stored = localStorage.getItem(LOCKER_CREDS_KEY);
  if (!stored) return false;
  return stored === hashPin(pin, password);
}

export function getEntries(): LockerEntry[] {
  try {
    const raw = localStorage.getItem(LOCKER_ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: LockerEntry[]): void {
  localStorage.setItem(LOCKER_ENTRIES_KEY, JSON.stringify(entries));
}

export function getSettings(): { timeoutMinutes: number } {
  try {
    const raw = localStorage.getItem(LOCKER_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { timeoutMinutes: 5 };
  } catch {
    return { timeoutMinutes: 5 };
  }
}

export function saveSettings(settings: { timeoutMinutes: number }): void {
  localStorage.setItem(LOCKER_SETTINGS_KEY, JSON.stringify(settings));
}
