import React, { MouseEvent } from 'react';
import { Pin, Lock, MoreVertical } from 'lucide-react';
import { Note } from '../types';
import { ThemeColors } from '../utils/theme';
import { formatRelativeDate } from '../utils/noteUtils';

export interface NoteCardProps {
  key?: React.Key;
  note: Note;
  isSelected: boolean;
  onSelect: (note: Note) => void;
  onOpenActions: (note: Note) => void;
  onTogglePin: (noteId: string, e?: MouseEvent) => void;
  onTagClick?: (tag: string, e?: MouseEvent) => void;
  theme: ThemeColors;
}

export function NoteCard({
  note,
  isSelected,
  onSelect,
  onOpenActions,
  onTogglePin,
  onTagClick,
  theme,
}: NoteCardProps) {
  // Generate preview snippet
  const snippet = note.isLocked
    ? '🔒 Protected Note — Tap to unlock'
    : note.content
        .replace(/^#+\s+/gm, '') // strip markdown headings
        .replace(/\[x\]|\[ \]/g, '') // strip checkboxes
        .replace(/```[\s\S]*?```/g, '[Code snippet]')
        .trim()
        .slice(0, 110) || 'Empty note';

  return (
    <div
      id={`note-card-${note.id}`}
      onClick={() => onSelect(note)}
      className={`group relative p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer select-none ${
        isSelected
          ? `${theme.cardActive} border-sky-500/60 shadow-md ring-1 ring-sky-500/30`
          : `${theme.surface} ${theme.border} hover:border-white/20 hover:bg-white/5`
      }`}
    >
      {/* Top row: Title and Status Icons */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {note.isPinned && (
            <Pin className="w-3.5 h-3.5 text-sky-400 shrink-0 fill-sky-400/20" />
          )}
          {note.isEncrypted && (
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <h3
            className={`font-semibold text-sm leading-snug truncate ${
              note.isPinned ? 'text-sky-300' : theme.textPrimary
            }`}
          >
            {note.title || 'Untitled Note'}
          </h3>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-1">
          <button
            onClick={(e) => onTogglePin(note.id, e)}
            className={`p-1 rounded-full opacity-60 hover:opacity-100 hover:bg-white/10 transition-opacity ${
              note.isPinned ? 'text-sky-400 !opacity-100' : theme.textMuted
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-sky-400/30' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenActions(note);
            }}
            className={`p-1 rounded-full opacity-60 hover:opacity-100 hover:bg-white/10 transition-opacity ${theme.textMuted}`}
            title="Note actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Snippet */}
      <p
        className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
          note.isLocked ? 'italic text-amber-400/90 font-medium' : theme.textSecondary
        }`}
      >
        {snippet}
      </p>

      {/* Bottom Metadata: Date, Tags, Format */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[11px]">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className={`shrink-0 font-medium ${theme.textMuted}`}>
            {formatRelativeDate(note.updatedAt)}
          </span>

          {/* Tags */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTagClick) onTagClick(tag, e);
                }}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-colors ${theme.surfaceVariant} ${theme.textSecondary} hover:text-sky-300`}
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className={`text-[10px] ${theme.textMuted}`}>
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Format Badge */}
        <span
          className={`shrink-0 uppercase text-[9px] font-bold px-1.5 py-0.5 rounded ${theme.surfaceVariant} ${theme.textMuted}`}
        >
          {note.format === 'txt' ? 'TXT' : 'MD'}
        </span>
      </div>
    </div>
  );
}
