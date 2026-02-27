/**
 * Global application store using Zustand.
 * Manages theme (dark/light), accent color (with gold presets), font size, and background image.
 * Persists settings to localStorage and applies CSS custom properties to the document root.
 */
import { create } from 'zustand';

export interface AppSettings {
  darkMode: boolean;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  backgroundImage: string | null;
}

interface AppStore extends AppSettings {
  setDarkMode: (val: boolean) => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setBackgroundImage: (url: string | null) => void;
  applySettings: () => void;
}

const DEFAULT_ACCENT = '#D4AF37'; // Gold

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function darkenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.max(0, Math.round(rgb.r * (1 - amount)));
  const g = Math.max(0, Math.round(rgb.g * (1 - amount)));
  const b = Math.max(0, Math.round(rgb.b * (1 - amount)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const { r, g, b } = rgb;
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function applyAccent(color: string) {
  const root = document.documentElement;
  const accent2 = darkenHex(color, 0.15);
  const rgb = hexToRgb(color);
  const accentSoft = rgb
    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
    : 'rgba(212, 175, 55, 0.15)';

  root.style.setProperty('--accent', color);
  root.style.setProperty('--accent-2', accent2);
  root.style.setProperty('--accent-soft', accentSoft);

  // Determine text color for accent buttons based on luminance
  const luminance = getLuminance(color);
  const textColor = luminance > 0.35 ? '#1a1a1a' : '#ffffff';
  root.style.setProperty('--accent-text', textColor);
}

function applyTheme(darkMode: boolean) {
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function applyFontSize(size: 'small' | 'medium' | 'large') {
  const map = { small: '14px', medium: '16px', large: '18px' };
  document.documentElement.style.setProperty('--app-font-size', map[size]);
}

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem('appSettings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        darkMode: parsed.darkMode ?? false,
        accentColor: parsed.accentColor ?? DEFAULT_ACCENT,
        fontSize: parsed.fontSize ?? 'medium',
        backgroundImage: parsed.backgroundImage ?? null,
      };
    }
  } catch {
    // ignore
  }
  return {
    darkMode: false,
    accentColor: DEFAULT_ACCENT,
    fontSize: 'medium',
    backgroundImage: null,
  };
}

function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  } catch {
    // ignore
  }
}

const initialSettings = loadSettings();

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialSettings,

  setDarkMode: (val) => {
    set({ darkMode: val });
    applyTheme(val);
    saveSettings({ ...get(), darkMode: val });
  },

  setAccentColor: (color) => {
    set({ accentColor: color });
    applyAccent(color);
    saveSettings({ ...get(), accentColor: color });
  },

  setFontSize: (size) => {
    set({ fontSize: size });
    applyFontSize(size);
    saveSettings({ ...get(), fontSize: size });
  },

  setBackgroundImage: (url) => {
    set({ backgroundImage: url });
    if (url) {
      document.documentElement.style.setProperty('--app-bg-image', `url(${url})`);
    } else {
      document.documentElement.style.removeProperty('--app-bg-image');
    }
    saveSettings({ ...get(), backgroundImage: url });
  },

  applySettings: () => {
    const s = get();
    applyTheme(s.darkMode);
    applyAccent(s.accentColor);
    applyFontSize(s.fontSize);
    if (s.backgroundImage) {
      document.documentElement.style.setProperty('--app-bg-image', `url(${s.backgroundImage})`);
    }
  },
}));
