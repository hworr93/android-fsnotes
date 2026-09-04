import { Note, Folder, AppSettings } from '../types';

export const INITIAL_FOLDERS: Folder[] = [
  { id: 'inbox', name: 'Inbox / Notes', isSystem: true, icon: 'Inbox' },
  { id: 'projects', name: 'Projects', isSystem: false, color: '#38bdf8' },
  { id: 'dev', name: 'Development', isSystem: false, color: '#a855f7' },
  { id: 'personal', name: 'Personal', isSystem: false, color: '#34d399' },
  { id: 'archive', name: 'Archive', isSystem: true, icon: 'Archive' },
  { id: 'trash', name: 'Trash', isSystem: true, icon: 'Trash2' },
];

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'material-you',
  fontSize: 16,
  fontFamily: 'sans',
  defaultFormat: 'markdown',
  lineWrap: true,
  masterPin: '1234',
  haptics: true,
  deviceFrame: 'phone',
};

export const INITIAL_NOTES: Note[] = [
  {
    id: 'welcome-fsnotes',
    title: 'Welcome to FSNotes for Android',
    content: `# Welcome to FSNotes for Android 📱✨

**FSNotes** is a modern, open-source plain-text notes manager ported directly from the acclaimed macOS/iOS version to **Android** with full **Material You (Material 3)** fidelity.

---

### 🚀 Key Features Ported to Android
- **Plain Text & Markdown First**: Your notes are raw Markdown files. No proprietary lock-in.
- **Interactive Checklists**: Tap checkboxes directly in preview or editor!
- **Fast Full-Text Search**: Instant search through titles, contents, and hashtags.
- **Hashtag System**: Type \`#android\`, \`#notes\`, \`#code\` anywhere in text; FSNotes automatically indexes them.
- **End-to-End Encryption**: Lock sensitive notes with your master PIN.
- **Material 3 UI**: Floating action buttons, bottom sheets, navigation drawer, and dynamic themes.
- **Split & Preview Modes**: Toggle between Live Markdown preview, Raw Edit, and Dual Pane.

---

### 📝 Markdown Formatting Demo

#### Code Highlighting
\`\`\`kotlin
// Kotlin Coroutines Note Syncing Engine
suspend fun syncNotesWithStorage(notes: List<Note>) = withContext(Dispatchers.IO) {
    val localFiles = fileRepository.getFiles()
    notes.forEach { note ->
        fileRepository.writeUtf8(note.filename, note.content)
    }
}
\`\`\`

#### Tables
| Format | Extension | Encryption | Status |
| :--- | :--- | :--- | :--- |
| **Markdown** | \`.md\` | Supported | ✅ Active |
| **Plain Text**| \`.txt\` | Supported | ✅ Active |
| **Rich Text** | \`.rtf\` | Supported | ✅ Active |

#### Tag Cloud
Explore tags by opening the drawer or tapping:
#welcome #android #markdown #productivity #fsnotes
`,
    folderId: 'inbox',
    isPinned: true,
    isEncrypted: false,
    format: 'markdown',
    tags: ['welcome', 'android', 'markdown', 'productivity', 'fsnotes'],
    createdAt: Date.now() - 3600000 * 24 * 3,
    updatedAt: Date.now() - 3600000 * 2,
    isLocked: false,
  },
  {
    id: 'sprint-roadmap',
    title: 'Android Port: Feature Roadmap & Tasks',
    content: `# Android Port Roadmap 🚀

Interactive checklist of FSNotes capabilities ported from iOS:

- [x] Material 3 UI shell with Navigation Drawer and TopAppBar
- [x] Floating Action Button with quick note creation
- [x] Real-time tag extraction and tag filtering (#tags)
- [x] Folder tree hierarchy (Inbox, Archive, Trash, Custom)
- [x] Pin notes to top with quick toggle
- [x] Note encryption with Master PIN lock screen
- [x] Dynamic theme engine (Material You, AMOLED Dark, Solarized, Sepia)
- [x] Export to standard Markdown (.md) and JSON backup
- [ ] Cloud sync via WebDAV / NextCloud
- [ ] Android Home Screen App Widget

Tap any checkbox above to toggle its completion state!

#roadmap #tasks #android #progress
`,
    folderId: 'projects',
    isPinned: true,
    isEncrypted: false,
    format: 'markdown',
    tags: ['roadmap', 'tasks', 'android', 'progress'],
    createdAt: Date.now() - 3600000 * 24 * 2,
    updatedAt: Date.now() - 3600000 * 6,
    isLocked: false,
  },
  {
    id: 'kotlin-vs-swift',
    title: 'FSNotes Architecture: Swift to Android Kotlin',
    content: `# Architecture Mapping: iOS Swift ➔ Android Kotlin

How FSNotes components map between iOS and Android:

### 1. Storage Engine
- **iOS**: \`FileManager\` with directory observer via \`DispatchSourceFileSystemObject\`
- **Android**: \`StorageAccessFramework\` (SAF) or app-specific internal storage with \`Room\` caching for lightning-fast search indexing.

### 2. UI Framework
- **iOS**: AppKit / UIKit / SwiftUI with custom \`NSTextStorage\` & \`UITextView\`
- **Android**: Jetpack Compose \`BasicTextField2\` with custom annotated string syntax highlighter and Material 3 \`Scaffold\`.

### 3. Encryption
- **iOS**: CommonCrypto AES-256-GCM
- **Android**: Android Jetpack Security (\`EncryptedFile\` / \`MasterKey\`) + AES-256.

\`\`\`kotlin
class NoteRepository(private val context: Context) {
    val allNotes: StateFlow<List<Note>> = noteDao.observeAllNotes()
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
}
\`\`\`

#dev #kotlin #swift #architecture
`,
    folderId: 'dev',
    isPinned: false,
    isEncrypted: false,
    format: 'markdown',
    tags: ['dev', 'kotlin', 'swift', 'architecture'],
    createdAt: Date.now() - 3600000 * 24 * 1,
    updatedAt: Date.now() - 3600000 * 12,
    isLocked: false,
  },
  {
    id: 'private-vault-sample',
    title: 'Encrypted Vault: Security Keys & Credentials',
    content: `# 🔒 Private Vault Note

> This note is protected with AES Master PIN encryption.

### Confidential Access Codes
- **Master Recovery Token**: \`FS-9842-ANDROID-SECURE-X\`
- **Server SSH Fingerprint**: \`SHA256:7mKq82b...fsnotes.app\`
- **Encrypted Backup Passphrase**: \`falcon-starlight-horizon-42\`

*FSNotes ensures your private data stays on your local device without unauthorized cloud transmission.*

#security #private #vault
`,
    folderId: 'personal',
    isPinned: false,
    isEncrypted: true,
    isLocked: true,
    format: 'markdown',
    tags: ['security', 'private', 'vault'],
    createdAt: Date.now() - 3600000 * 48,
    updatedAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'quick-scratchpad',
    title: 'Quick Scratchpad & Meeting Log',
    content: `Call with Android UX design team:
- Discussed bottom navigation vs navigation drawer: Material 3 drawer fits FSNotes folder structure best.
- Confirmed FAB placement at bottom right (16dp margin).
- Add support for tablet dual-pane layout when screen width is >= 768px.
- Implement Android share intent simulation so text can be copied or shared.

Next check-in: Thursday 10:00 AM PST.

#scratchpad #meeting #notes
`,
    folderId: 'inbox',
    isPinned: false,
    isEncrypted: false,
    format: 'txt',
    tags: ['scratchpad', 'meeting', 'notes'],
    createdAt: Date.now() - 3600000 * 18,
    updatedAt: Date.now() - 3600000 * 1,
    isLocked: false,
  }
];
