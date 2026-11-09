import {
  Pin,
  Lock,
  Unlock,
  Copy,
  FolderInput,
  Download,
  Share2,
  Trash2,
  X,
  FileCode,
  Calendar,
  Check
} from 'lucide-react';
import { Note, Folder } from '../types';
import { ThemeColors } from '../utils/theme';
import { formatRelativeDate } from '../utils/noteUtils';
import { useState } from 'react';

interface Props {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onTogglePin: (noteId: string) => void;
  onToggleEncrypt: (note: Note) => void;
  onDuplicateNote: (note: Note) => void;
  onMoveNote: (noteId: string, folderId: string) => void;
  onDownloadNote: (note: Note) => void;
  onShareNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  theme: ThemeColors;
}

export function BottomSheet({
  note,
  isOpen,
  onClose,
  folders,
  onTogglePin,
  onToggleEncrypt,
  onDuplicateNote,
  onMoveNote,
  onDownloadNote,
  onShareNote,
  onDeleteNote,
  theme,
}: Props) {
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  if (!isOpen || !note) return null;

  const currentFolder = folders.find((f) => f.id === note.folderId)?.name || 'Inbox';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          setShowFolderPicker(false);
          onClose();
        }}
      />

      {/* Sheet Container (Material 3 Bottom Sheet) */}
      <div
        className={`relative w-full max-w-lg rounded-t-3xl p-5 shadow-2xl z-10 border-t animate-in slide-in-from-bottom duration-200 ${theme.surface} ${theme.border}`}
      >
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-neutral-500/40 rounded-full mx-auto mb-4" />

        {/* Header: Note Info */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className={`font-bold text-base truncate ${theme.textPrimary}`}>
              {note.title || 'Untitled Note'}
            </h3>
            <p className={`text-xs mt-0.5 ${theme.textSecondary}`}>
              In <span className="font-medium text-sky-400">{currentFolder}</span> • Updated {formatRelativeDate(note.updatedAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-white/10 ${theme.textSecondary}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Folder Picker Sub-view */}
        {showFolderPicker ? (
          <div className="py-3 space-y-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                Select Destination Folder
              </span>
              <button
                onClick={() => setShowFolderPicker(false)}
                className="text-xs text-sky-400 font-medium"
              >
                Cancel
              </button>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onMoveNote(note.id, folder.id);
                    setShowFolderPicker(false);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm transition-colors ${
                    note.folderId === folder.id
                      ? `${theme.cardActive} font-semibold ${theme.textPrimary}`
                      : `hover:bg-white/5 ${theme.textSecondary}`
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: folder.color || '#38bdf8' }}
                    />
                    <span>{folder.name}</span>
                  </div>
                  {note.folderId === folder.id && (
                    <Check className="w-4 h-4 text-sky-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Main Action Buttons Grid */
          <div className="py-3 space-y-1">
            {/* Pin / Unpin */}
            <button
              onClick={() => {
                onTogglePin(note.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-sm hover:bg-white/5 transition-colors ${theme.textPrimary}`}
            >
              <Pin className={`w-4 h-4 text-sky-400 ${note.isPinned ? 'fill-sky-400' : ''}`} />
              <span>{note.isPinned ? 'Unpin from Top' : 'Pin to Top'}</span>
            </button>

            {/* Move to Folder */}
            <button
              onClick={() => setShowFolderPicker(true)}
              className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-sm hover:bg-white/5 transition-colors ${theme.textPrimary}`}
            >
              <FolderInput className="w-4 h-4 text-amber-400" />
              <span>Move to Folder...</span>
            </button>

            {/* Encrypt / Lock */}
            <button
              onClick={() => {
                onToggleEncrypt(note);
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-sm hover:bg-white/5 transition-colors ${theme.textPrimary}`}
            >
              {note.isEncrypted ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>Remove Encryption</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Lock with Master PIN</span>
                </>
              )}
            </button>

            {/* Duplicate */}
            <button
              onClick={() => {
                onDuplicateNote(note);
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-sm hover:bg-white/5 transition-colors ${theme.textPrimary}`}
            >
              <Copy className="w-4 h-4 text-purple-400" />
              <span>Duplicate Note</span>
            </button>

            {/* Download File */}
            <button
              onClick={() => {
                onDownloadNote(note);
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-sm hover:bg-white/5 transition-colors ${theme.textPrimary}`}
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Download File (.{note.format === 'txt' ? 'txt' : 'md'})</span>
            </button>

            {/* Share */}
            <button
              onClick={() => {
                onShareNote(note);
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-sm hover:bg-white/5 transition-colors ${theme.textPrimary}`}
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Share Note Text</span>
            </button>

            <div className={`my-1 border-t ${theme.border}`} />

            {/* Delete */}
            <button
              onClick={() => {
                onDeleteNote(note.id);
                onClose();
              }}
              className="w-full flex items-center gap-3.5 p-3 rounded-2xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Move to Trash</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
