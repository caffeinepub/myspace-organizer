import React, { useState } from 'react';
import { Moon, Sun, Palette, Type, HardDrive, Download, Upload, Trash2, AlertTriangle, Image } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { db } from '../db/db';
import { compressImage } from '../utils/imageCompression';
import { validateImportData } from '../utils/dataValidation';
import { showSuccessToast, showErrorToast, showInfoToast } from '../store/toastStore';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const FONT_OPTIONS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'Source Sans 3',
  'JetBrains Mono',
  'Castellar',
];

const FONT_FAMILY_MAP: Record<string, string> = {
  'Inter': 'Inter, sans-serif',
  'Poppins': 'Poppins, sans-serif',
  'Roboto': 'Roboto, sans-serif',
  'Open Sans': 'Open Sans, sans-serif',
  'Montserrat': 'Montserrat, sans-serif',
  'Lato': 'Lato, sans-serif',
  'Nunito': 'Nunito, sans-serif',
  'Playfair Display': 'Playfair Display, serif',
  'Merriweather': 'Merriweather, serif',
  'Source Sans 3': 'Source Sans 3, sans-serif',
  'JetBrains Mono': 'JetBrains Mono, monospace',
  'Castellar': 'Castellar, "Cinzel Decorative", Cinzel, serif',
};

const ACCENT_OPTIONS = [
  { id: 'amber', label: 'Amber', color: '#f59e0b' },
  { id: 'teal', label: 'Teal', color: '#14b8a6' },
  { id: 'violet', label: 'Violet', color: '#8b5cf6' },
  { id: 'rose', label: 'Rose', color: '#f43f5e' },
  { id: 'emerald', label: 'Emerald', color: '#10b981' },
  { id: 'sky', label: 'Sky', color: '#0ea5e9' },
  { id: 'yellow', label: 'Yellow', color: '#facc15' },
  { id: 'gold', label: 'Gold', color: '#d4a017' },
  { id: 'golden-yellow', label: 'Golden', color: '#f0b429' },
];

export function SettingsPage() {
  const { theme, accentColor, fontFamily, setThemeMode, setAccent, setFont } = useAppStore();
  const [storageInfo, setStorageInfo] = useState<{ used: number; quota: number } | null>(null);
  const [clearStep, setClearStep] = useState(0);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  useEffect(() => {
    // Load storage info
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({ usage, quota }) => {
        setStorageInfo({ used: usage || 0, quota: quota || 0 });
      });
    }
    // Load bg image
    db.settings.toArray().then(settings => {
      const bg = settings.find(s => s.key === 'bgImage');
      if (bg) setBgImageUrl(bg.value);
    });
  }, []);

  const storagePercent = storageInfo ? Math.round((storageInfo.used / storageInfo.quota) * 100) : 0;
  const storageMB = storageInfo ? (storageInfo.used / 1024 / 1024).toFixed(1) : '0';
  const quotaMB = storageInfo ? (storageInfo.quota / 1024 / 1024).toFixed(0) : '0';

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1920, 0.7);
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        // Store in IndexedDB settings
        const all = await db.settings.toArray();
        const existing = all.find(s => s.key === 'bgImage');
        if (existing?.id) {
          await db.settings.put({ ...existing, value: dataUrl });
        } else {
          await db.settings.add({ key: 'bgImage', value: dataUrl });
        }
        setBgImageUrl(dataUrl);
        document.documentElement.style.setProperty('--app-bg-image', `url("${dataUrl}")`);
        showSuccessToast('Background image updated!');
      };
      reader.readAsDataURL(compressed);
    } catch {
      showErrorToast('Failed to upload background image');
    }
  };

  const removeBgImage = async () => {
    try {
      const all = await db.settings.toArray();
      const existing = all.find(s => s.key === 'bgImage');
      if (existing?.id) await db.settings.delete(existing.id);
      setBgImageUrl(null);
      document.documentElement.style.setProperty('--app-bg-image', 'none');
      showSuccessToast('Background image removed');
    } catch {
      showErrorToast('Failed to remove background image');
    }
  };

  const handleExport = async () => {
    try {
      const [notes, routines, records, streak, quotes, labels] = await Promise.all([
        db.notes.toArray(),
        db.routines.toArray(),
        db.records.toArray(),
        db.streak.toArray(),
        db.quotes.toArray(),
        db.labels.toArray(),
      ]);
      const data = { notes, routines, records, streak, quotes, labels, exportedAt: new Date().toISOString() };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `myorganizer-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccessToast('Data exported successfully!');
    } catch {
      showErrorToast('Failed to export data');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImportFile(file); setShowImportConfirm(true); }
  };

  const handleImportConfirm = async () => {
    if (!importFile) return;
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      const validation = validateImportData(data);
      if (!validation.valid) {
        showErrorToast(`Invalid file: ${validation.errors.join(', ')}`);
        return;
      }
      // Clear and reimport
      await db.clearAll();
      if (data.notes?.length) await db.notes.bulkAdd(data.notes.map((n: Record<string, unknown>) => { const { id: _, ...rest } = n; return rest; }));
      if (data.routines?.length) await db.routines.bulkAdd(data.routines.map((r: Record<string, unknown>) => { const { id: _, ...rest } = r; return rest; }));
      if (data.records?.length) await db.records.bulkAdd(data.records.map((r: Record<string, unknown>) => { const { id: _, ...rest } = r; return rest; }));
      if (data.streak?.length) await db.streak.bulkAdd(data.streak.map((s: Record<string, unknown>) => { const { id: _, ...rest } = s; return rest; }));
      if (data.quotes?.length) await db.quotes.bulkAdd(data.quotes.map((q: Record<string, unknown>) => { const { id: _, ...rest } = q; return rest; }));
      if (data.labels?.length) await db.labels.bulkAdd(data.labels.map((l: Record<string, unknown>) => { const { id: _, ...rest } = l; return rest; }));
      showSuccessToast('Data imported successfully! Refresh to see changes.');
      setShowImportConfirm(false);
      setImportFile(null);
    } catch {
      showErrorToast('Failed to import data. Invalid file format.');
    }
  };

  const handleClearAll = async () => {
    if (clearStep === 0) { setClearStep(1); return; }
    if (clearStep === 1) { setClearStep(2); return; }
    if (clearConfirmText !== 'DELETE ALL') {
      showErrorToast('Please type "DELETE ALL" to confirm');
      return;
    }
    try {
      await db.clearAll();
      showSuccessToast('All data cleared. Refresh to start fresh.');
      setClearStep(0);
      setClearConfirmText('');
    } catch {
      showErrorToast('Failed to clear data');
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-8">
      <h1 className="text-xl font-bold mb-6">Settings</h1>

      {/* Theme */}
      <section className="bg-card rounded-xl border border-border/50 p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" /> Appearance
        </h2>

        {/* Dark/Light toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-foreground">Choose light or dark mode</p>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${theme === 'light' ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground'}`}
              aria-label="Light mode"
              aria-pressed={theme === 'light'}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${theme === 'dark' ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground'}`}
              aria-label="Dark mode"
              aria-pressed={theme === 'dark'}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
          </div>
        </div>

        {/* Accent color */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Accent Color</p>
          <div className="flex gap-2 flex-wrap">
            {ACCENT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setAccent(opt.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
                  ${accentColor === opt.id ? 'border-primary' : 'border-transparent hover:border-border'}`}
                aria-label={`Set accent color to ${opt.label}`}
                aria-pressed={accentColor === opt.id}
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: opt.color }} />
                <span className="text-[10px] text-muted-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font */}
        <div>
          <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> Font Family
          </p>
          <select
            value={fontFamily}
            onChange={e => setFont(e.target.value)}
            className="w-full bg-muted/50 rounded-lg p-2 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
            aria-label="Font family"
            style={{ fontFamily: FONT_FAMILY_MAP[fontFamily] || fontFamily }}
          >
            {FONT_OPTIONS.map(font => (
              <option
                key={font}
                value={font}
                style={{ fontFamily: FONT_FAMILY_MAP[font] || font }}
              >
                {font}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Background image */}
      <section className="bg-card rounded-xl border border-border/50 p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Image className="w-4 h-4 text-primary" /> Background Image
        </h2>
        {bgImageUrl ? (
          <div className="space-y-2">
            <img src={bgImageUrl} alt="Background" className="w-full h-24 object-cover rounded-lg" />
            <Button variant="outline" onClick={removeBgImage} size="sm" className="w-full" aria-label="Remove background image">
              Remove Background
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <Image className="w-6 h-6 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Upload background image</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} aria-label="Upload background image" />
          </label>
        )}
      </section>

      {/* Storage */}
      <section className="bg-card rounded-xl border border-border/50 p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" /> Storage
        </h2>
        {storageInfo ? (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{storageMB} MB used</span>
              <span>{storagePercent}% of {quotaMB} MB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${storagePercent > 80 ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
            {storagePercent > 80 && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-xs text-destructive">Storage is nearly full. Consider exporting and clearing old data.</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Storage info unavailable</p>
        )}
      </section>

      {/* Data management */}
      <section className="bg-card rounded-xl border border-border/50 p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3">Data Management</h2>
        <div className="space-y-2">
          <Button onClick={handleExport} variant="outline" className="w-full gap-2" aria-label="Export all data">
            <Download className="w-4 h-4" /> Export All Data
          </Button>
          <label className="block">
            <Button variant="outline" className="w-full gap-2 cursor-pointer" asChild aria-label="Import data">
              <span>
                <Upload className="w-4 h-4" /> Import Data
                <input type="file" accept=".json" className="hidden" onChange={handleImportFile} aria-label="Select import file" />
              </span>
            </Button>
          </label>
        </div>
      </section>

      {/* Import confirm */}
      {showImportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border/50 p-6 max-w-sm w-full">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
            <h3 className="font-semibold text-center mb-2">Import Data?</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              This will overwrite all existing data. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowImportConfirm(false); setImportFile(null); }} className="flex-1" aria-label="Cancel import">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleImportConfirm} className="flex-1" aria-label="Confirm import">
                Import
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Danger zone */}
      <section className="bg-card rounded-xl border border-destructive/30 p-4">
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2 text-destructive">
          <Trash2 className="w-4 h-4" /> Danger Zone
        </h2>
        {clearStep === 0 && (
          <Button variant="destructive" onClick={handleClearAll} className="w-full gap-2" aria-label="Clear all data">
            <Trash2 className="w-4 h-4" /> Clear All Data
          </Button>
        )}
        {clearStep === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Are you sure? This will permanently delete all your notes, routines, records, and settings.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setClearStep(0)} className="flex-1" aria-label="Cancel clear">Cancel</Button>
              <Button variant="destructive" onClick={handleClearAll} className="flex-1" aria-label="Continue clear">Continue</Button>
            </div>
          </div>
        )}
        {clearStep === 2 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Type <strong>DELETE ALL</strong> to confirm permanent deletion.</p>
            <input
              type="text"
              value={clearConfirmText}
              onChange={e => setClearConfirmText(e.target.value)}
              placeholder="DELETE ALL"
              className="w-full bg-muted/50 rounded-lg p-2 text-sm border border-border/50 outline-none focus:border-destructive transition-colors"
              aria-label="Confirm deletion text"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setClearStep(0); setClearConfirmText(''); }} className="flex-1" aria-label="Cancel clear">Cancel</Button>
              <Button variant="destructive" onClick={handleClearAll} className="flex-1" aria-label="Confirm delete all">Delete All</Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
