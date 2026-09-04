import {
  Folder as FolderIcon,
  Inbox,
  Archive,
  Trash2,
  Tag,
  Plus,
  Settings,
  Download,
  BookOpen,
  FileText,
  X,
  HardDrive
} from 'lucide-react';
import { Folder } from '../types';
import { ThemeColors } from '../utils/theme';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  activeFolderId: string; // 'all' or folderId
  onSelectFolder: (folderId: string) => void;
  tags: { tag: string; count: number }[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  totalNotesCount: number;
  onOpenNewFolder: () => void;
  onOpenSettings: () => void;
  onExportBackup: () => void;
  theme: ThemeColors;
}

export function NavigationDrawer({
  isOpen,
  onClose,
  folders,
  activeFolderId,
  onSelectFolder,
  tags,
  activeTag,
  onSelectTag,
  totalNotesCount,
  onOpenNewFolder,
  onOpenSettings,
  onExportBackup,
  theme,
}: Props) {
  if (!isOpen) return null;

  const systemFolders = folders.filter((f) => f.isSystem);
  const userFolders = folders.filter((f) => !f.isSystem);

  const getFolderIcon = (id: string) => {
    switch (id) {
      case 'inbox':
        return <Inbox className="w-4 h-4 text-sky-400" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-amber-400" />;
      case 'trash':
        return <Trash2 className="w-4 h-4 text-red-400" />;
      default:
        return <FolderIcon className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel (Material 3 standard navigation drawer) */}
      <div
        className={`relative w-80 max-w-[85vw] h-full flex flex-col z-10 shadow-2xl transition-transform animate-in slide-in-from-left duration-200 border-r ${theme.surface} ${theme.border}`}
      >
        {/* Header */}
        <div className={`p-5 pb-4 border-b ${theme.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`font-bold text-base tracking-tight ${theme.textPrimary}`}>
                  FSNotes
                </h2>
                <span className="text-xs text-sky-400 font-medium">Android Edition</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full hover:bg-white/10 ${theme.textSecondary}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Storage & Notes status chip */}
          <div className={`mt-4 p-2.5 rounded-xl flex items-center justify-between text-xs ${theme.surfaceVariant} ${theme.textSecondary}`}>
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              <span>Storage</span>
            </div>
            <span className="font-semibold text-sky-400">{totalNotesCount} Notes (Local SAF)</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Folders Section */}
          <div className="space-y-1">
            <div className={`px-3 text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>
              Folders
            </div>

            {/* All Notes item */}
            <button
              onClick={() => {
                onSelectFolder('all');
                onSelectTag(null);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeFolderId === 'all' && !activeTag
                  ? `${theme.cardActive} font-semibold ${theme.textPrimary}`
                  : `hover:bg-white/5 ${theme.textSecondary}`
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>All Notes</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${theme.surfaceVariant}`}>
                {totalNotesCount}
              </span>
            </button>

            {/* System folders: Inbox */}
            {systemFolders
              .filter((f) => f.id === 'inbox')
              .map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onSelectFolder(folder.id);
                    onSelectTag(null);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    activeFolderId === folder.id && !activeTag
                      ? `${theme.cardActive} font-semibold ${theme.textPrimary}`
                      : `hover:bg-white/5 ${theme.textSecondary}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getFolderIcon(folder.id)}
                    <span>{folder.name}</span>
                  </div>
                </button>
              ))}

            {/* User Custom Folders */}
            <div className="pt-2 pb-1">
              <div className="flex items-center justify-between px-3 py-1">
                <span className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                  Projects & Categories
                </span>
                <button
                  onClick={() => {
                    onOpenNewFolder();
                    onClose();
                  }}
                  className="p-1 rounded-md hover:bg-white/10 text-sky-400"
                  title="Create new folder"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {userFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onSelectFolder(folder.id);
                    onSelectTag(null);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    activeFolderId === folder.id && !activeTag
                      ? `${theme.cardActive} font-semibold ${theme.textPrimary}`
                      : `hover:bg-white/5 ${theme.textSecondary}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FolderIcon
                      className="w-4 h-4"
                      style={{ color: folder.color || '#38bdf8' }}
                    />
                    <span>{folder.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* System folders: Archive & Trash */}
            {systemFolders
              .filter((f) => f.id !== 'inbox')
              .map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onSelectFolder(folder.id);
                    onSelectTag(null);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    activeFolderId === folder.id && !activeTag
                      ? `${theme.cardActive} font-semibold ${theme.textPrimary}`
                      : `hover:bg-white/5 ${theme.textSecondary}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getFolderIcon(folder.id)}
                    <span>{folder.name}</span>
                  </div>
                </button>
              ))}
          </div>

          {/* Tags Section */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between px-3">
              <span className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                Tags
              </span>
              {activeTag && (
                <button
                  onClick={() => onSelectTag(null)}
                  className="text-xs text-sky-400 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            {tags.length === 0 ? (
              <div className={`px-3 py-2 text-xs italic ${theme.textMuted}`}>
                No tags found. Type #hashtag in any note.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 px-3">
                {tags.map(({ tag, count }) => {
                  const isSelected = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        onSelectTag(isSelected ? null : tag);
                        onClose();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
                        isSelected
                          ? 'bg-sky-500 text-white font-medium shadow-xs'
                          : `${theme.surfaceVariant} ${theme.textSecondary} hover:bg-white/10`
                      }`}
                    >
                      <Tag className="w-3 h-3 opacity-70" />
                      <span>#{tag}</span>
                      <span className="text-[10px] opacity-75 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-3 border-t space-y-1 ${theme.border}`}>
          <button
            onClick={() => {
              onExportBackup();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-white/10 ${theme.textSecondary}`}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-white/10 ${theme.textSecondary}`}
          >
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>Settings & Themes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
