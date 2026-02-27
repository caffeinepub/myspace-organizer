import { create } from 'zustand';
import { getTheme, setTheme, getAccentColor, setAccentColor, getFontFamily, setFontFamily } from '../utils/storage';

const ACCENT_PRESETS: Record<string, { primary: string; ring: string }> = {
  amber: { primary: '0.72 0.18 55', ring: '0.72 0.18 55' },
  teal: { primary: '0.65 0.15 180', ring: '0.65 0.15 180' },
  violet: { primary: '0.60 0.20 280', ring: '0.60 0.20 280' },
  rose: { primary: '0.65 0.22 15', ring: '0.65 0.22 15' },
  emerald: { primary: '0.65 0.18 145', ring: '0.65 0.18 145' },
  sky: { primary: '0.65 0.15 220', ring: '0.65 0.15 220' },
  yellow: { primary: '0.85 0.20 95', ring: '0.85 0.20 95' },
  gold: { primary: '0.75 0.19 70', ring: '0.75 0.19 70' },
  'golden-yellow': { primary: '0.80 0.22 80', ring: '0.80 0.22 80' },
};

function applyTheme(theme: 'light' | 'dark'): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function applyAccent(accent: string): void {
  const preset = ACCENT_PRESETS[accent] || ACCENT_PRESETS.amber;
  document.documentElement.style.setProperty('--primary', preset.primary);
  document.documentElement.style.setProperty('--ring', preset.ring);
  document.documentElement.style.setProperty('--accent', preset.primary);
  document.documentElement.style.setProperty('--app-accent', `oklch(${preset.primary})`);
}

function applyFont(font: string): void {
  document.documentElement.style.setProperty('--app-font', `'${font}', sans-serif`);
}

interface AppState {
  theme: 'light' | 'dark';
  accentColor: string;
  fontFamily: string;
  accentPresets: typeof ACCENT_PRESETS;
  setThemeMode: (theme: 'light' | 'dark') => void;
  setAccent: (accent: string) => void;
  setFont: (font: string) => void;
  initSettings: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  accentColor: 'amber',
  fontFamily: 'Inter',
  accentPresets: ACCENT_PRESETS,

  setThemeMode: (theme) => {
    setTheme(theme);
    applyTheme(theme);
    set({ theme });
  },

  setAccent: (accent) => {
    setAccentColor(accent);
    applyAccent(accent);
    set({ accentColor: accent });
  },

  setFont: (font) => {
    setFontFamily(font);
    applyFont(font);
    set({ fontFamily: font });
  },

  initSettings: () => {
    const theme = getTheme();
    const accent = getAccentColor();
    const font = getFontFamily();
    applyTheme(theme);
    applyAccent(accent);
    applyFont(font);
    set({ theme, accentColor: accent, fontFamily: font });
  },
}));
