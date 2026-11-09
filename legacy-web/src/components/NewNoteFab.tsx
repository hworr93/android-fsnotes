import { useState } from 'react';
import { Plus, CheckSquare, Lock, FileText, X } from 'lucide-react';
import { ThemeColors } from '../utils/theme';
import { triggerHaptic } from '../utils/noteUtils';

interface Props {
  onNewNote: (type?: 'markdown' | 'checklist' | 'encrypted' | 'txt') => void;
  theme: ThemeColors;
}

export function NewNoteFab({ onNewNote, theme }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAction = (type: 'markdown' | 'checklist' | 'encrypted' | 'txt') => {
    triggerHaptic();
    onNewNote(type);
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-8 right-6 z-30 flex flex-col items-end select-none">
      {/* Expanded Speed Dial Options */}
      {isExpanded && (
        <div className="flex flex-col items-end gap-2.5 mb-3 animate-in fade-in slide-in-from-bottom-3 duration-150">
          {/* Encrypted Note Option */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs rounded-lg font-medium shadow-md bg-neutral-800 text-neutral-200">
              Encrypted Note
            </span>
            <button
              onClick={() => handleAction('encrypted')}
              className="w-11 h-11 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
              title="Create Encrypted Note"
            >
              <Lock className="w-5 h-5" />
            </button>
          </div>

          {/* Checklist Note Option */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs rounded-lg font-medium shadow-md bg-neutral-800 text-neutral-200">
              Task Checklist
            </span>
            <button
              onClick={() => handleAction('checklist')}
              className="w-11 h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
              title="Create Checklist Note"
            >
              <CheckSquare className="w-5 h-5" />
            </button>
          </div>

          {/* Plain Text Note Option */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs rounded-lg font-medium shadow-md bg-neutral-800 text-neutral-200">
              Plain Text (.txt)
            </span>
            <button
              onClick={() => handleAction('txt')}
              className="w-11 h-11 rounded-2xl bg-purple-500 hover:bg-purple-400 text-neutral-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
              title="Create Plain Text Note"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Material 3 FAB */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (isExpanded) {
              setIsExpanded(false);
            } else {
              handleAction('markdown');
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }}
          className={`h-14 px-5 rounded-2xl flex items-center gap-2.5 shadow-xl transition-all duration-200 active:scale-95 cursor-pointer ${theme.fabBg} ${theme.fabText}`}
          title="New Note (Right-click or hold for more options)"
          aria-label="Create Note"
        >
          <Plus className="w-6 h-6" />
          <span className="font-semibold text-sm tracking-tight">New note</span>
        </button>

        {/* Small chevron/toggle for speed dial on touch */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-9 h-14 rounded-xl flex items-center justify-center shadow-lg transition-colors border ${theme.border} ${theme.surfaceContainer} ${theme.textSecondary}`}
          title="More note creation types"
        >
          {isExpanded ? <X className="w-4 h-4" /> : <span className="text-xs font-bold">•••</span>}
        </button>
      </div>
    </div>
  );
}
