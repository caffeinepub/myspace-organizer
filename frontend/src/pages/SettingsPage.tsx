/**
 * Settings page for theme (dark/light), accent color (gold presets), font size,
 * data export/import, and clear all data. Gold accent presets default to #D4AF37.
 * Export/import messages include formatted timestamps.
 */
import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { useDataStore } from '../store/dataStore';
import { formatDateTime } from '../utils/formatDateTime';
import { Moon, Sun, Download, Upload, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

const GOLD_PRESETS = [
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Golden Yellow', hex: '#FFC300' },
  { name: 'Amber Gold', hex: '#FFB000' },
  { name: 'Deep Gold', hex: '#B8860B' },
  { name: 'Warm Yellow', hex: '#FFD54A' },
];

const OTHER_PRESETS = [
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Sky Blue', hex: '#0EA5E9' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Slate', hex: '#64748B' },
];

export default function SettingsPage() {
  const { darkMode, accentColor, fontSize, setDarkMode, setAccentColor, setFontSize } =
    useAppStore();
  const { exportData, importData, clearAllData } = useDataStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organizer-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Data exported at ${formatDateTime(new Date())}`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string;
        importData(json);
        toast.success(`Data imported at ${formatDateTime(new Date())}`);
      } catch {
        toast.error('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    toast.success('All data cleared');
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Appearance */}
      <section className="bg-card rounded-xl border border-border/50 p-4 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Appearance
        </h2>

        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            ) : (
              <Sun className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            )}
            <div>
              <p className="font-medium text-sm">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Toggle light/dark theme</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{ background: darkMode ? 'var(--accent)' : 'var(--muted)' }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: darkMode ? 'translateX(24px)' : 'translateX(0)' }}
            />
          </button>
        </div>

        {/* Font Size */}
        <div>
          <p className="font-medium text-sm mb-2">Font Size</p>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize"
                style={
                  fontSize === size
                    ? {
                        background: 'var(--accent-soft)',
                        borderColor: 'var(--accent)',
                        color: 'var(--accent)',
                      }
                    : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
                }
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Accent Color */}
      <section className="bg-card rounded-xl border border-border/50 p-4 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Accent Color
        </h2>

        {/* Gold Presets */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">✨ Gold Collection</p>
          <div className="grid grid-cols-5 gap-2">
            {GOLD_PRESETS.map((preset) => {
              const isActive = accentColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.hex}
                  onClick={() => setAccentColor(preset.hex)}
                  className="flex flex-col items-center gap-1.5 group"
                  title={preset.name}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center shadow-sm"
                    style={{
                      background: preset.hex,
                      borderColor: isActive ? '#1a1a1a' : 'transparent',
                      boxShadow: isActive
                        ? `0 0 0 3px ${preset.hex}40`
                        : '0 1px 3px rgba(0,0,0,0.2)',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    {isActive && <Check className="w-4 h-4 text-black" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Other Presets */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Other Colors</p>
          <div className="grid grid-cols-5 gap-2">
            {OTHER_PRESETS.map((preset) => {
              const isActive = accentColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.hex}
                  onClick={() => setAccentColor(preset.hex)}
                  className="flex flex-col items-center gap-1.5 group"
                  title={preset.name}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center shadow-sm"
                    style={{
                      background: preset.hex,
                      borderColor: isActive ? 'white' : 'transparent',
                      boxShadow: isActive
                        ? `0 0 0 3px ${preset.hex}40`
                        : '0 1px 3px rgba(0,0,0,0.2)',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    {isActive && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom color input */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Custom:</label>
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-border/50 cursor-pointer bg-transparent"
          />
          <span className="text-sm text-muted-foreground font-mono">{accentColor}</span>
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Data Management
        </h2>

        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors text-left"
        >
          <Download className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <div>
            <p className="font-medium text-sm">Export Data</p>
            <p className="text-xs text-muted-foreground">Download all your data as JSON</p>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors text-left"
        >
          <Upload className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <div>
            <p className="font-medium text-sm">Import Data</p>
            <p className="text-xs text-muted-foreground">Restore from a backup JSON file</p>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-destructive/30 hover:bg-destructive/10 transition-colors text-left"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-sm text-destructive">Clear All Data</p>
              <p className="text-xs text-muted-foreground">Permanently delete all your data</p>
            </div>
          </button>
        ) : (
          <div className="border border-destructive/30 rounded-lg p-4">
            <p className="text-sm font-medium text-destructive mb-3">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-lg text-sm border border-border/50 hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        )}
      </section>

      {/* About */}
      <section className="bg-card rounded-xl border border-border/50 p-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
          About
        </h2>
        <p className="text-sm text-muted-foreground">
          Personal Organizer — your all-in-one productivity companion.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'unknown-app')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: 'var(--accent)' }}
          >
            caffeine.ai
          </a>{' '}
          © {new Date().getFullYear()}
        </p>
      </section>
    </div>
  );
}
