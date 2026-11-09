export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string; // 'inbox' | 'archive' | 'trash' | custom folder id
  isPinned: boolean;
  isEncrypted: boolean;
  encryptedContent?: string; // encrypted or hidden when locked
  format: 'markdown' | 'txt' | 'rtf';
  tags: string[];
  createdAt: number;
  updatedAt: number;
  isLocked?: boolean; // currently locked in UI state
}

export interface Folder {
  id: string;
  name: string;
  icon?: string;
  isSystem?: boolean;
  color?: string;
}

export type SortBy = 'updated' | 'created' | 'title';
export type ThemeMode = 'material-you' | 'amoled' | 'solarized' | 'sepia' | 'light';
export type ViewDevice = 'phone' | 'tablet' | 'fullscreen';
export type EditorView = 'edit' | 'preview' | 'split';

export interface AppSettings {
  theme: ThemeMode;
  fontSize: number;
  fontFamily: 'sans' | 'mono' | 'serif';
  defaultFormat: 'markdown' | 'txt';
  lineWrap: boolean;
  masterPin: string;
  haptics: boolean;
  deviceFrame: ViewDevice;
}
