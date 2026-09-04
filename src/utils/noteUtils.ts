import { Note } from '../types';

/**
 * Extracts hashtags like #tag or #todo from text, avoiding markdown headings (# Heading)
 */
export function extractTags(content: string): string[] {
  // Matches #word where # is preceded by whitespace or start of line, but not followed by space (headings)
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_\-]+)/g;
  const tags = new Set<string>();
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    // Exclude numeric hashes or header artifacts
    if (!/^\d+$/.test(tag) && tag.length > 0) {
      tags.add(tag);
    }
  }
  return Array.from(tags);
}

/**
 * Formats timestamps into friendly Android-like relative dates
 */
export function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Toggles a markdown checklist item at a specific occurrence index
 */
export function toggleMarkdownCheckbox(content: string, itemText: string, currentChecked: boolean): string {
  const uncheckedPattern = `- [ ] ${itemText}`;
  const checkedPattern = `- [x] ${itemText}`;
  const checkedPatternCap = `- [X] ${itemText}`;

  if (currentChecked) {
    // turn to unchecked
    if (content.includes(checkedPattern)) {
      return content.replace(checkedPattern, uncheckedPattern);
    }
    if (content.includes(checkedPatternCap)) {
      return content.replace(checkedPatternCap, uncheckedPattern);
    }
  } else {
    // turn to checked
    if (content.includes(uncheckedPattern)) {
      return content.replace(uncheckedPattern, checkedPattern);
    }
  }
  return content;
}

/**
 * Counts words, chars, lines, and reading time
 */
export function getNoteStats(content: string) {
  const trimmed = content.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const chars = content.length;
  const lines = content.split('\n').length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return { words, chars, lines, readingTimeMinutes };
}

/**
 * Triggers browser download for a single note as .md or .txt
 */
export function downloadNoteFile(note: Note) {
  const filename = `${note.title.replace(/[^a-z0-9_\-\s]/gi, '_') || 'Untitled'}.${note.format === 'txt' ? 'txt' : 'md'}`;
  const blob = new Blob([note.content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports all notes as a JSON backup
 */
export function exportBackup(notes: Note[], folders: unknown[]) {
  const backupData = {
    app: 'FSNotes for Android',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    notes,
    folders,
  };
  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fsnotes-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers native vibration haptic if available
 */
export function triggerHaptic(duration = 15) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // ignore
    }
  }
}
