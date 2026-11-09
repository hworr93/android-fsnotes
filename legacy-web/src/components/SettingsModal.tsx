import React, { useRef, ChangeEvent } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Type,
  Shield,
  FileDown,
  FileUp,
  RotateCcw,
  X,
  Check,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { AppSettings, ThemeMode } from '../types';
import { THEME_CONFIG, ThemeColors } from '../utils/theme';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onExportBackup: () => void;
  onImportBackup: (data: unknown) => void;
  onResetDefaults: () => void;
  theme: ThemeColors;
}

const THEME_OPTIONS: { id: ThemeMode; label: string; previewColor: string }[] = [
  { id: 'material-you', label: 'Material You', previewColor: '#38bdf8' },
  { id: 'amoled', label: 'AMOLED Black', previewColor: '#000000' },
  { id: 'solarized', label: 'Solarized Dark', previewColor: '#002b36' },
  { id: 'sepia', label: 'Sepia Paper', previewColor: '#ebd5b3' },
  { id: 'light', label: 'Clean Light', previewColor: '#ffffff' },
];

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetDefaults,
  theme,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportBackup(json);
        onClose();
      } catch {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet / Dialog */}
      <div
        className={`relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl p-6 shadow-2xl z-10 border overflow-hidden animate-in zoom-in-95 duration-150 ${theme.surface} ${theme.border}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${theme.textPrimary}`}>Settings</h3>
              <p className={`text-xs ${theme.textSecondary}`}>
                Customize FSNotes Android preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-white/10 ${theme.textSecondary}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Section: Themes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Palette className="w-4 h-4" />
              <span>Color Themes</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEME_OPTIONS.map((t) => {
                const isSelected = settings.theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onUpdateSettings({ theme: t.id })}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/15 shadow-sm'
                        : `${theme.surfaceVariant} ${theme.border} hover:bg-white/5`
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: t.previewColor }}
                    />
                    <span className={`text-xs font-semibold truncate ${theme.textPrimary}`}>
                      {t.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Typography */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Type className="w-4 h-4" />
              <span>Typography & Sizing</span>
            </div>

            {/* Font Family */}
            <div className="flex gap-2">
              {[
                { id: 'sans', label: 'Roboto Sans', preview: 'Sans' },
                { id: 'mono', label: 'JetBrains Mono', preview: 'Mono' },
                { id: 'serif', label: 'Editorial Serif', preview: 'Serif' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdateSettings({ fontFamily: f.id as 'sans' | 'mono' | 'serif' })}
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    settings.fontFamily === f.id
                      ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                      : `${theme.surfaceVariant} ${theme.border} ${theme.textSecondary}`
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Font Size Slider */}
            <div className={`p-3.5 rounded-2xl border ${theme.surfaceVariant} ${theme.border}`}>
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <span className={theme.textPrimary}>Editor Font Size</span>
                <span className="font-mono text-sky-400">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min="13"
                max="22"
                step="1"
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Device Layout View */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Smartphone className="w-4 h-4" />
              <span>Android Form Factor</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'phone', label: 'Android Phone' },
                { id: 'tablet', label: 'Android Tablet' },
                { id: 'fullscreen', label: 'Fullscreen' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onUpdateSettings({ deviceFrame: m.id as 'phone' | 'tablet' | 'fullscreen' })}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                    settings.deviceFrame === m.id
                      ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                      : `${theme.surfaceVariant} ${theme.border} ${theme.textSecondary}`
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Security */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <Shield className="w-4 h-4" />
              <span>Master Security PIN</span>
            </div>
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${theme.surfaceVariant} ${theme.border}`}>
              <div>
                <p className={`text-xs font-medium ${theme.textPrimary}`}>Note Encryption PIN</p>
                <p className={`text-[11px] ${theme.textMuted}`}>Used to lock and unlock confidential notes</p>
              </div>
              <input
                type="password"
                maxLength={4}
                value={settings.masterPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  onUpdateSettings({ masterPin: val });
                }}
                className={`w-20 px-3 py-1.5 rounded-lg text-center font-mono text-sm border focus:outline-none focus:ring-2 focus:ring-sky-500 ${theme.surface} ${theme.border} ${theme.textPrimary}`}
              />
            </div>
          </div>

          {/* Section: Storage & Backup */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <FileDown className="w-4 h-4" />
              <span>Backup & Import</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={onExportBackup}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-colors hover:bg-white/5 ${theme.surfaceVariant} ${theme.border} ${theme.textPrimary}`}
              >
                <FileDown className="w-4 h-4 text-emerald-400" />
                <span>Export JSON Backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-colors hover:bg-white/5 ${theme.surfaceVariant} ${theme.border} ${theme.textPrimary}`}
              >
                <FileUp className="w-4 h-4 text-sky-400" />
                <span>Import Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <button
              onClick={() => {
                if (confirm('Reset all notes and folders to initial defaults?')) {
                  onResetDefaults();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs text-neutral-400 hover:text-red-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Notes</span>
            </button>
          </div>

          {/* About Section */}
          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${theme.surfaceContainer} ${theme.border} ${theme.textMuted}`}>
            <p className="font-semibold text-neutral-200">
              FSNotes for Android
            </p>
            <p className="leading-relaxed">
              Based on the open-source FSNotes project by Oleksandr Glushchenko. Designed for speed, privacy, and plain-text freedom using Android Material You design standards.
            </p>
            <a
              href="https://github.com/glushchenko/fsnotes"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sky-400 hover:underline pt-1"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
