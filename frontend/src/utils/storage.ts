// localStorage utilities - ONLY for small settings (theme, accent, font)
const SETTINGS_KEYS = {
  THEME: 'organizer_theme',
  ACCENT: 'organizer_accent',
  FONT: 'organizer_font',
} as const;

export function getTheme(): 'light' | 'dark' {
  return (localStorage.getItem(SETTINGS_KEYS.THEME) as 'light' | 'dark') || 'light';
}

export function setTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(SETTINGS_KEYS.THEME, theme);
}

export function getAccentColor(): string {
  return localStorage.getItem(SETTINGS_KEYS.ACCENT) || 'amber';
}

export function setAccentColor(color: string): void {
  localStorage.setItem(SETTINGS_KEYS.ACCENT, color);
}

export function getFontFamily(): string {
  return localStorage.getItem(SETTINGS_KEYS.FONT) || 'Inter';
}

export function setFontFamily(font: string): void {
  localStorage.setItem(SETTINGS_KEYS.FONT, font);
}
