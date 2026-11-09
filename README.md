# FSNotes for Android

Native Kotlin/Jetpack Compose conversion of [hworr93/android-fsnotes](https://github.com/hworr93/android-fsnotes).

## What is included

- Offline-first notes stored in app-private storage
- Material 3 Compose interface with Material You, AMOLED, Solarized, Sepia, and Light themes
- Markdown and plain-text editing with a lightweight preview
- Search across titles, content, and hashtags
- Inbox, custom folders, Archive, Trash, pinned notes, duplicate, move, and share actions
- JSON backup import/export through Android's document picker
- AES-GCM encrypted note content backed by Android Keystore
- Master PIN unlock flow for encrypted notes
- Native share sheet and edge-to-edge Android layout

## Open in Android Studio

Open this directory as the project root. Android Studio will sync the Gradle project and install the required Android SDK components if they are not already present.

The sample encrypted note uses `1234` as the initial master PIN. Change it from Settings before storing real private notes.

## Build from a machine with the Android SDK

```bash
gradle assembleDebug
```

The equivalent explicit module command is `gradle :app:assembleDebug`.

An Android SDK platform and build tools must be installed for APK builds. Android Studio can install the required components during project sync.