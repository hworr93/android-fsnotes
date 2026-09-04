import React, { useState, FormEvent } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { ThemeColors } from '../utils/theme';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, color: string) => void;
  theme: ThemeColors;
}

const COLOR_OPTIONS = [
  '#38bdf8', // sky
  '#a855f7', // purple
  '#34d399', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#6366f1', // indigo
  '#ef4444', // red
  '#14b8a6', // teal
];

export function NewFolderModal({ isOpen, onClose, onCreateFolder, theme }: Props) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateFolder(name.trim(), selectedColor);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`relative w-full max-w-sm rounded-3xl p-5 shadow-2xl z-10 border animate-in zoom-in-95 duration-150 ${theme.surface} ${theme.border}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className={`font-bold text-base ${theme.textPrimary}`}>New Folder</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-white/10 ${theme.textSecondary}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme.textMuted}`}>
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Ideas, Client X"
              autoFocus
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${theme.surfaceVariant} ${theme.border} ${theme.textPrimary}`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme.textMuted}`}>
              Folder Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 ${theme.textSecondary}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-50 transition-colors"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
