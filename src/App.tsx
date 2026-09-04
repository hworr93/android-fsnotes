import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Note, Folder, AppSettings, SortBy, ViewDevice } from './types';
import { INITIAL_NOTES, INITIAL_FOLDERS, INITIAL_SETTINGS } from './data/initialNotes';
import { THEME_CONFIG } from './utils/theme';
import {
  extractTags,
  downloadNoteFile,
  exportBackup,
  triggerHaptic,
} from './utils/noteUtils';
import { AndroidFrame } from './components/AndroidFrame';
import { TopAppBar } from './components/TopAppBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { NoteCard } from './components/NoteCard';
import { NoteEditor } from './components/NoteEditor';
import { NewNoteFab } from './components/NewNoteFab';
import { BottomSheet } from './components/BottomSheet';
import { EncryptionModal } from './components/EncryptionModal';
import { NewFolderModal } from './components/NewFolderModal';
import { SettingsModal } from './components/SettingsModal';
import { FileText, Inbox, Plus, Sparkles, Check } from 'lucide-react';

export default function App() {
  // Load State from LocalStorage or Defaults
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('fsnotes_android_notes');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_NOTES;
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem('fsnotes_android_folders');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_FOLDERS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('fsnotes_android_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SETTINGS;
  });

  // Navigation & Filter States
  const [activeFolderId, setActiveFolderId] = useState<string>('inbox');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    INITIAL_NOTES[0].id
  );

  // Dialog & Sheet States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [actionTargetNote, setActionTargetNote] = useState<Note | null>(null);
  const [isEncryptionModalOpen, setIsEncryptionModalOpen] = useState(false);
  const [pendingUnlockNote, setPendingUnlockNote] = useState<Note | null>(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to LocalStorage whenever notes, folders, or settings change
  useEffect(() => {
    try {
      localStorage.setItem('fsnotes_android_notes', JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('fsnotes_android_folders', JSON.stringify(folders));
    } catch {
      // ignore
    }
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem('fsnotes_android_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Show temporary toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  }, []);

  // Theme object
  const theme = THEME_CONFIG[settings.theme] || THEME_CONFIG['material-you'];

  // Extracted unique tags across active notes (excluding trash)
  const tagsList = useMemo(() => {
    const tagCountMap: Record<string, number> = {};
    notes
      .filter((n) => n.folderId !== 'trash')
      .forEach((note) => {
        const extracted = extractTags(note.content);
        extracted.forEach((t) => {
          tagCountMap[t] = (tagCountMap[t] || 0) + 1;
        });
      });

    return Object.entries(tagCountMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [notes]);

  // Filtered and Sorted Notes
  const filteredNotes = useMemo(() => {
    let list = notes.filter((n) => {
      // Folder filtering
      if (activeFolderId === 'trash') {
        if (n.folderId !== 'trash') return false;
      } else {
        if (n.folderId === 'trash') return false;
        if (activeFolderId !== 'all' && n.folderId !== activeFolderId) return false;
      }

      // Tag filtering
      if (activeTag) {
        const noteTags = extractTags(n.content);
        if (!noteTags.includes(activeTag.toLowerCase())) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesContent = n.content.toLowerCase().includes(q);
        const matchesTag = n.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesTag) return false;
      }

      return true;
    });

    // Sorting: Pinned notes always on top, then by chosen sort criteria
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'created') {
        return b.createdAt - a.createdAt;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // default: updated
      return b.updatedAt - a.updatedAt;
    });
  }, [notes, activeFolderId, activeTag, searchQuery, sortBy]);

  // Active note currently selected
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Note Selection / Unlock Handler
  const handleSelectNote = (note: Note) => {
    triggerHaptic();
    if (note.isEncrypted && note.isLocked) {
      setPendingUnlockNote(note);
      setIsEncryptionModalOpen(true);
      return;
    }
    setSelectedNoteId(note.id);
  };

  // Create Note Handler
  const handleCreateNote = (type: 'markdown' | 'checklist' | 'encrypted' | 'txt' = 'markdown') => {
    triggerHaptic();
    const id = `note-${Date.now()}`;
    let title = 'Untitled Note';
    let content = '';
    let isEncrypted = false;
    let format: 'markdown' | 'txt' = settings.defaultFormat;

    if (type === 'checklist') {
      title = 'New Task Checklist';
      content = `# New Task Checklist\n\n- [ ] Task item 1\n- [ ] Task item 2\n- [ ] Task item 3\n\n#tasks`;
    } else if (type === 'encrypted') {
      title = 'Confidential Protected Note';
      content = `# 🔒 Confidential Note\n\nThis note is protected with your Master Security PIN.\n\n#private`;
      isEncrypted = true;
    } else if (type === 'txt') {
      title = 'Quick Plain Text Note';
      content = `Quick scratchpad note.\n`;
      format = 'txt';
    } else {
      content = `# New Note\n\nStart writing here...\n`;
    }

    const folderForNewNote =
      activeFolderId === 'trash' || activeFolderId === 'archive' || activeFolderId === 'all'
        ? 'inbox'
        : activeFolderId;

    const newNote: Note = {
      id,
      title,
      content,
      folderId: folderForNewNote,
      isPinned: false,
      isEncrypted,
      format,
      tags: extractTags(content),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isLocked: false,
    };

    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(id);
    showToast('New note created');
  };

  // Update Note Handler
  const handleUpdateNote = (updated: Partial<Note>) => {
    if (!selectedNoteId) return;

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNoteId) {
          const content = updated.content !== undefined ? updated.content : n.content;
          const tags = extractTags(content);

          // If title was not explicitly edited, auto-derive from first header line if available
          let derivedTitle = updated.title !== undefined ? updated.title : n.title;
          if (!derivedTitle && content) {
            const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
            if (firstLine) derivedTitle = firstLine.slice(0, 40);
          }

          return {
            ...n,
            ...updated,
            title: derivedTitle,
            tags,
            updatedAt: Date.now(),
          };
        }
        return n;
      })
    );
  };

  // Delete Note Handler
  const handleDeleteNote = (noteId: string) => {
    triggerHaptic();
    const target = notes.find((n) => n.id === noteId);
    if (!target) return;

    if (target.folderId === 'trash') {
      // Permanently Delete
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
      showToast('Note permanently deleted');
    } else {
      // Move to Trash
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, folderId: 'trash', updatedAt: Date.now() } : n
        )
      );
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
      showToast('Moved to Trash');
    }
  };

  // Toggle Pin
  const handleTogglePin = (noteId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerHaptic();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n
      )
    );
  };

  // Toggle Encrypt on a note
  const handleToggleEncrypt = (note: Note) => {
    triggerHaptic();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id
          ? {
              ...n,
              isEncrypted: !n.isEncrypted,
              isLocked: !n.isEncrypted, // lock immediately if turning on
              updatedAt: Date.now(),
            }
          : n
      )
    );
    showToast(
      note.isEncrypted ? 'Encryption removed from note' : 'Note locked with Master PIN'
    );
  };

  // Lock an active note
  const handleLockActiveNote = () => {
    if (!selectedNoteId) return;
    triggerHaptic();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNoteId ? { ...n, isLocked: true } : n
      )
    );
    setSelectedNoteId(null);
    showToast('Note locked');
  };

  // Unlock Note verification success
  const handleUnlockSuccess = () => {
    if (!pendingUnlockNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === pendingUnlockNote.id ? { ...n, isLocked: false } : n
      )
    );
    setSelectedNoteId(pendingUnlockNote.id);
    setPendingUnlockNote(null);
    setIsEncryptionModalOpen(false);
    showToast('Note unlocked');
  };

  // Duplicate Note
  const handleDuplicateNote = (note: Note) => {
    triggerHaptic();
    const copy: Note = {
      ...note,
      id: `note-${Date.now()}`,
      title: `${note.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [copy, ...prev]);
    setSelectedNoteId(copy.id);
    showToast('Note duplicated');
  };

  // Move Note to Folder
  const handleMoveNote = (noteId: string, folderId: string) => {
    triggerHaptic();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, folderId, updatedAt: Date.now() } : n
      )
    );
    const targetFolder = folders.find((f) => f.id === folderId)?.name || 'Folder';
    showToast(`Moved to ${targetFolder}`);
  };

  // Share Note Text
  const handleShareNote = async (note: Note) => {
    triggerHaptic();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content,
        });
        return;
      } catch {
        // Fall back to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
      showToast('Copied note to clipboard');
    }
  };

  // Create Folder
  const handleCreateFolder = (name: string, color: string) => {
    triggerHaptic();
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      color,
      isSystem: false,
    };
    setFolders((prev) => [...prev, newFolder]);
    setActiveFolderId(newFolder.id);
    showToast(`Folder "${name}" created`);
  };

  // Import Backup JSON
  const handleImportBackup = (data: any) => {
    if (data && Array.isArray(data.notes)) {
      setNotes(data.notes);
      if (Array.isArray(data.folders)) {
        setFolders(data.folders);
      }
      showToast(`Imported ${data.notes.length} notes successfully`);
    } else {
      alert('Invalid backup structure.');
    }
  };

  // Reset to initial sample data
  const handleResetDefaults = () => {
    setNotes(INITIAL_NOTES);
    setFolders(INITIAL_FOLDERS);
    setSettings(INITIAL_SETTINGS);
    setActiveFolderId('inbox');
    setSelectedNoteId(INITIAL_NOTES[0].id);
    showToast('Reset to initial sample notes');
  };

  // Active Title for Top Bar
  const currentTitle = useMemo(() => {
    if (activeTag) return `#${activeTag}`;
    if (activeFolderId === 'all') return 'All Notes';
    return folders.find((f) => f.id === activeFolderId)?.name || 'Notes';
  }, [activeFolderId, activeTag, folders]);

  const isTablet = settings.deviceFrame === 'tablet';

  return (
    <AndroidFrame
      deviceFrame={settings.deviceFrame}
      theme={theme}
      onBackGesture={() => {
        if (selectedNoteId && !isTablet) {
          setSelectedNoteId(null);
        } else if (isDrawerOpen) {
          setIsDrawerOpen(false);
        }
      }}
      onHomeGesture={() => {
        setSelectedNoteId(null);
        setIsDrawerOpen(false);
      }}
    >
      {/* Top App Bar */}
      <TopAppBar
        title={currentTitle}
        count={filteredNotes.length}
        isEditorOpen={Boolean(selectedNoteId && !isTablet)}
        onBackFromEditor={() => setSelectedNoteId(null)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        deviceFrame={settings.deviceFrame}
        onDeviceFrameChange={(frame: ViewDevice) =>
          setSettings((prev) => ({ ...prev, deviceFrame: frame }))
        }
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenNewFolder={() => setIsNewFolderModalOpen(true)}
        onExportBackup={() => exportBackup(notes, folders)}
        theme={theme}
      />

      {/* Main Content Area: Phone view toggles list/editor; Tablet view shows dual-pane! */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Notes List (Hidden on phone when editor is open) */}
        {(!selectedNoteId || isTablet) && (
          <div
            className={`h-full flex flex-col overflow-y-auto ${
              isTablet
                ? 'w-80 lg:w-96 border-r ' + theme.border
                : 'w-full'
            }`}
          >
            {/* Active Tag Filter Banner */}
            {activeTag && (
              <div className="p-3 pb-0 flex items-center justify-between">
                <span className="text-xs text-sky-400 font-medium">
                  Filtering by tag: <span className="font-bold">#{activeTag}</span>
                </span>
                <button
                  onClick={() => setActiveTag(null)}
                  className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredNotes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
                <div className="w-16 h-16 rounded-3xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 opacity-80" />
                </div>
                <h4 className={`font-semibold text-base ${theme.textPrimary}`}>
                  No notes found
                </h4>
                <p className={`text-xs mt-1.5 max-w-xs leading-relaxed ${theme.textMuted}`}>
                  {searchQuery
                    ? `No notes matching "${searchQuery}".`
                    : activeFolderId === 'trash'
                      ? 'Trash is empty.'
                      : 'Create your first plain-text or markdown note.'}
                </p>
                {activeFolderId !== 'trash' && (
                  <button
                    onClick={() => handleCreateNote('markdown')}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-md transition-all active:scale-95"
                  >
                    + Create Note
                  </button>
                )}
              </div>
            ) : (
              /* Notes Cards List */
              <div className="p-3.5 space-y-2.5 pb-24">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isSelected={selectedNoteId === note.id}
                    onSelect={handleSelectNote}
                    onOpenActions={(target) => {
                      setActionTargetNote(target);
                      setIsBottomSheetOpen(true);
                    }}
                    onTogglePin={handleTogglePin}
                    onTagClick={(tag) => setActiveTag(tag)}
                    theme={theme}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Column: Note Editor */}
        {selectedNoteId && activeNote ? (
          <div className="flex-1 h-full overflow-hidden">
            <NoteEditor
              note={activeNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onLockNote={handleLockActiveNote}
              onShareNote={handleShareNote}
              settings={settings}
              theme={theme}
              isTabletView={isTablet}
            />
          </div>
        ) : isTablet ? (
          /* Tablet Empty Editor Prompt */
          <div
            className={`flex-1 h-full flex flex-col items-center justify-center p-8 text-center select-none ${theme.surfaceContainer}`}
          >
            <div className="w-16 h-16 rounded-3xl bg-neutral-800/80 text-sky-400 flex items-center justify-center mb-4 shadow-md">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className={`font-semibold text-lg ${theme.textPrimary}`}>
              FSNotes for Android
            </h3>
            <p className={`text-xs mt-1 max-w-sm ${theme.textMuted}`}>
              Select a note on the left or tap the Floating Action Button below to start writing.
            </p>
          </div>
        ) : null}
      </div>

      {/* Android Floating Action Button (Only visible on notes list) */}
      {(!selectedNoteId || isTablet) && activeFolderId !== 'trash' && (
        <NewNoteFab onNewNote={handleCreateNote} theme={theme} />
      )}

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        folders={folders}
        activeFolderId={activeFolderId}
        onSelectFolder={(folderId) => {
          setActiveFolderId(folderId);
          if (!isTablet) setSelectedNoteId(null);
        }}
        tags={tagsList}
        activeTag={activeTag}
        onSelectTag={(tag) => {
          setActiveTag(tag);
          if (!isTablet) setSelectedNoteId(null);
        }}
        totalNotesCount={notes.filter((n) => n.folderId !== 'trash').length}
        onOpenNewFolder={() => setIsNewFolderModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onExportBackup={() => exportBackup(notes, folders)}
        theme={theme}
      />

      {/* Android Bottom Sheet for Note Actions */}
      <BottomSheet
        note={actionTargetNote}
        isOpen={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setActionTargetNote(null);
        }}
        folders={folders}
        onTogglePin={handleTogglePin}
        onToggleEncrypt={handleToggleEncrypt}
        onDuplicateNote={handleDuplicateNote}
        onMoveNote={handleMoveNote}
        onDownloadNote={downloadNoteFile}
        onShareNote={handleShareNote}
        onDeleteNote={handleDeleteNote}
        theme={theme}
      />

      {/* Master PIN Unlock Modal */}
      <EncryptionModal
        isOpen={isEncryptionModalOpen}
        onClose={() => {
          setIsEncryptionModalOpen(false);
          setPendingUnlockNote(null);
        }}
        onUnlockSuccess={handleUnlockSuccess}
        masterPin={settings.masterPin}
        theme={theme}
      />

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
        theme={theme}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) =>
          setSettings((prev) => ({ ...prev, ...newSettings }))
        }
        onExportBackup={() => exportBackup(notes, folders)}
        onImportBackup={handleImportBackup}
        onResetDefaults={handleResetDefaults}
        theme={theme}
      />

      {/* Android Toast Snackbar */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-4 py-2 rounded-full bg-neutral-800 text-neutral-100 text-xs font-medium shadow-2xl border border-neutral-700/80 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-sky-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </AndroidFrame>
  );
}
