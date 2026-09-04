import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  CheckSquare,
  Code,
  Quote,
  Link as LinkIcon,
  Table as TableIcon,
  Calendar,
  Hash,
  Eye,
  Edit3,
  Columns,
  Pin,
  Lock,
  Unlock,
  Share2,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Note, EditorView, AppSettings } from '../types';
import { ThemeColors } from '../utils/theme';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getNoteStats, toggleMarkdownCheckbox, triggerHaptic } from '../utils/noteUtils';

interface Props {
  note: Note;
  onUpdateNote: (updated: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
  onLockNote?: () => void;
  onShareNote?: (note: Note) => void;
  settings: AppSettings;
  theme: ThemeColors;
  isTabletView?: boolean;
}

export function NoteEditor({
  note,
  onUpdateNote,
  onDeleteNote,
  onLockNote,
  onShareNote,
  settings,
  theme,
  isTabletView = false,
}: Props) {
  const [editorView, setEditorView] = useState<EditorView>(
    isTabletView ? 'split' : 'edit'
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync editorView if screen size or tablet mode toggles
  useEffect(() => {
    if (isTabletView && editorView === 'edit') {
      setEditorView('split');
    }
  }, [isTabletView, editorView]);

  const stats = getNoteStats(note.content);

  // Handle inserting formatting into textarea
  const insertFormatting = useCallback((prefix: string, suffix: string = '', defaultPlaceholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    triggerHaptic();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = note.content;
    const selected = currentText.substring(start, end) || defaultPlaceholder;

    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);

    onUpdateNote({ content: newContent, updatedAt: Date.now() });

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selected.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  }, [note.content, onUpdateNote]);

  // Insert line prefix (like header or checklist)
  const insertLinePrefix = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    triggerHaptic();
    const start = textarea.selectionStart;
    const currentText = note.content;

    // Find start of current line
    const lineStart = currentText.lastIndexOf('\n', start - 1) + 1;
    const newContent = currentText.substring(0, lineStart) + prefix + currentText.substring(lineStart);

    onUpdateNote({ content: newContent, updatedAt: Date.now() });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 10);
  }, [note.content, onUpdateNote]);

  // Checkbox toggle in rendered view
  const handleToggleCheckbox = (itemText: string, newCheckedState: boolean) => {
    triggerHaptic();
    const newContent = toggleMarkdownCheckbox(note.content, itemText, !newCheckedState);
    onUpdateNote({ content: newContent, updatedAt: Date.now() });

    // Check if all checkboxes in note are now checked
    if (newCheckedState && !newContent.includes('- [ ]')) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // ignore
      }
    }
  };

  const fontClass =
    settings.fontFamily === 'mono'
      ? 'font-mono'
      : settings.fontFamily === 'serif'
        ? 'font-serif'
        : 'font-sans';

  return (
    <div
      id="android-note-editor"
      className={`w-full h-full flex flex-col overflow-hidden select-text ${theme.surface}`}
    >
      {/* Editor Sub-Header Toolbar */}
      <div
        className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 ${theme.border} ${theme.surfaceContainer}`}
      >
        {/* Title Input */}
        <div className="flex-1 min-w-[180px]">
          <input
            type="text"
            value={note.title}
            onChange={(e) => onUpdateNote({ title: e.target.value, updatedAt: Date.now() })}
            placeholder="Note title..."
            className={`w-full font-bold text-base md:text-lg bg-transparent border-none focus:outline-none focus:ring-0 ${theme.textPrimary}`}
          />
        </div>

        {/* View Mode Switcher (Edit, Split, Preview) */}
        <div className="flex items-center gap-1">
          <div className={`flex items-center p-0.5 rounded-xl border ${theme.border} ${theme.surfaceVariant}`}>
            <button
              onClick={() => setEditorView('edit')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                editorView === 'edit'
                  ? 'bg-sky-500 text-white font-medium shadow-xs'
                  : `${theme.textSecondary} hover:text-white`
              }`}
              title="Raw Editor"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setEditorView('split')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                editorView === 'split'
                  ? 'bg-sky-500 text-white font-medium shadow-xs'
                  : `${theme.textSecondary} hover:text-white`
              }`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setEditorView('preview')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                editorView === 'preview'
                  ? 'bg-sky-500 text-white font-medium shadow-xs'
                  : `${theme.textSecondary} hover:text-white`
              }`}
              title="Markdown Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Pin Button */}
          <button
            onClick={() => onUpdateNote({ isPinned: !note.isPinned, updatedAt: Date.now() })}
            className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
              note.isPinned ? 'text-sky-400' : theme.textMuted
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-sky-400/30' : ''}`} />
          </button>

          {/* Encrypt / Lock Toggle */}
          {note.isEncrypted && (
            <button
              onClick={onLockNote}
              className="p-2 rounded-lg text-amber-400 hover:bg-white/10 transition-colors"
              title="Lock this note"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Share */}
          {onShareNote && (
            <button
              onClick={() => onShareNote(note)}
              className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${theme.textSecondary}`}
              title="Share note text"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => onDeleteNote(note.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
            title="Move to Trash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Markdown Formatting Toolbar (Only in Edit or Split mode) */}
      {editorView !== 'preview' && (
        <div
          className={`px-3 py-1.5 border-b flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 select-none ${theme.border} ${theme.surfaceVariant}`}
        >
          <button
            onClick={() => insertFormatting('**', '**', 'bold text')}
            className={`p-1.5 rounded-md hover:bg-white/10 ${theme.textSecondary}`}
            title="Bold (**text**)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*', 'italic text')}
            className={`p-1.5 rounded-md hover:bg-white/10 ${theme.textSecondary}`}
            title="Italic (*text*)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertLinePrefix('### ')}
            className={`p-1.5 rounded-md hover:bg-white/10 ${theme.textSecondary}`}
            title="Heading 3 (### )"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertLinePrefix('- [ ] ')}
            className={`p-1.5 rounded-md hover:bg-white/10 text-sky-400`}
            title="Task Checklist (- [ ] )"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('```\n', '\n```', 'code block')}
            className={`p-1.5 rounded-md hover:bg-white/10 ${theme.textSecondary}`}
            title="Code Block (```)"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertLinePrefix('> ')}
            className={`p-1.5 rounded-md hover:bg-white/10 ${theme.textSecondary}`}
            title="Blockquote (> )"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('[', '](https://example.com)', 'link title')}
            className={`p-1.5 rounded-md hover:bg-white/10 ${theme.textSecondary}`}
            title="Link [text](url)"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              insertFormatting(
                '\n| Header 1 | Header 2 |\n| :--- | :--- |\n| Cell 1 | Cell 2 |\n',
                ''
              )
            }
            className={`p-1.5 rounded-md hover:bg-white/10 ${theme.textSecondary}`}
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              insertFormatting(`*${new Date().toLocaleDateString()}* `)
            }
            className={`p-1.5 rounded-md hover:bg-white/10 ${theme.textSecondary}`}
            title="Insert Today's Date"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('#')}
            className={`p-1.5 rounded-md hover:bg-white/10 text-purple-400`}
            title="Add Hashtag (#tag)"
          >
            <Hash className="w-4 h-4" />
          </button>

          <div className="ml-auto text-xs opacity-60 font-mono pr-1">
            {stats.words} words
          </div>
        </div>
      )}

      {/* Editor Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Textarea */}
        {editorView !== 'preview' && (
          <div
            className={`h-full flex flex-col p-4 overflow-y-auto ${
              editorView === 'split' ? 'w-1/2 border-r ' + theme.border : 'w-full'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={note.content}
              onChange={(e) => onUpdateNote({ content: e.target.value, updatedAt: Date.now() })}
              placeholder="Write Markdown or plain text here..."
              style={{ fontSize: `${settings.fontSize}px` }}
              className={`w-full flex-1 bg-transparent border-none resize-none focus:outline-none focus:ring-0 leading-relaxed ${fontClass} ${
                settings.lineWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'
              } ${theme.textPrimary}`}
              spellCheck={false}
            />
          </div>
        )}

        {/* Rendered Preview Pane */}
        {editorView !== 'edit' && (
          <div
            className={`h-full p-5 overflow-y-auto ${
              editorView === 'split' ? 'w-1/2' : 'w-full'
            } ${theme.surfaceContainer}`}
          >
            <MarkdownRenderer
              content={note.content}
              theme={theme}
              fontSize={settings.fontSize}
              fontFamily={settings.fontFamily}
              onToggleCheckbox={handleToggleCheckbox}
            />
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div
        className={`h-7 px-4 border-t flex items-center justify-between text-[11px] select-none shrink-0 ${theme.border} ${theme.surfaceContainer} ${theme.textMuted}`}
      >
        <div className="flex items-center gap-3">
          <span>{stats.words} words</span>
          <span>•</span>
          <span>{stats.chars} characters</span>
          <span>•</span>
          <span>{stats.lines} lines</span>
        </div>
        <div className="flex items-center gap-2">
          <span>~{stats.readingTimeMinutes} min read</span>
          <span>•</span>
          <span className="uppercase font-semibold text-sky-400">
            {note.format === 'txt' ? 'Plain Text' : 'Markdown'}
          </span>
        </div>
      </div>
    </div>
  );
}
