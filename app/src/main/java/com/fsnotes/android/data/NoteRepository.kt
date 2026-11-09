package com.fsnotes.android.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Base64
import java.nio.charset.StandardCharsets
import java.security.KeyStore
import java.security.MessageDigest
import java.util.UUID
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import org.json.JSONArray
import org.json.JSONObject

class NoteRepository(context: Context) {
    private val preferences: SharedPreferences =
        context.getSharedPreferences("fsnotes_preferences", Context.MODE_PRIVATE)
    private val keyAlias = "fsnotes-note-content-key"

    fun load(): NotesState {
        val stored = preferences.getString(NOTES_KEY, null)
        val folders = preferences.getString(FOLDERS_KEY, null)
            ?.let(::decodeFolders)
            ?: defaultFolders()
        val settings = preferences.getString(SETTINGS_KEY, null)
            ?.let(::decodeSettings)
            ?: AppSettings(masterPin = hashPin("1234"))

        if (stored == null) {
            val initial = defaultNotes()
            save(NotesState(initial, folders, settings))
            return NotesState(initial, folders, settings)
        }

        return NotesState(decodeNotes(stored), folders, settings)
    }

    fun save(state: NotesState) {
        preferences.edit()
            .putString(NOTES_KEY, encodeNotes(state.notes))
            .putString(FOLDERS_KEY, encodeFolders(state.folders))
            .putString(SETTINGS_KEY, encodeSettings(state.settings))
            .apply()
    }

    fun resetToDefaults(): NotesState {
        preferences.edit().clear().apply()
        return load()
    }

    fun encrypt(content: String): String {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())
        val encrypted = cipher.doFinal(content.toByteArray(StandardCharsets.UTF_8))
        val payload = ByteArray(cipher.iv.size + encrypted.size)
        cipher.iv.copyInto(payload)
        encrypted.copyInto(payload, cipher.iv.size)
        return Base64.encodeToString(payload, Base64.NO_WRAP)
    }

    fun decrypt(payload: String): String {
        val bytes = Base64.decode(payload, Base64.NO_WRAP)
        val iv = bytes.copyOfRange(0, 12)
        val encrypted = bytes.copyOfRange(12, bytes.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(), GCMParameterSpec(128, iv))
        return String(cipher.doFinal(encrypted), StandardCharsets.UTF_8)
    }

    fun hashPin(pin: String): String =
        MessageDigest.getInstance("SHA-256")
            .digest(pin.toByteArray(StandardCharsets.UTF_8))
            .joinToString("") { "%02x".format(it) }

    private fun getOrCreateKey(): SecretKey {
        val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (keyStore.getKey(keyAlias, null) as? SecretKey)?.let { return it }
        return KeyGenerator.getInstance("AES", "AndroidKeyStore").apply {
            init(256)
        }.generateKey()
    }

    private fun encodeNotes(notes: List<Note>): String {
        val array = JSONArray()
        notes.forEach { note ->
            array.put(JSONObject().apply {
                put("id", note.id)
                put("title", note.title)
                put("content", if (note.encrypted) encrypt(note.content) else note.content)
                put("folderId", note.folderId)
                put("pinned", note.pinned)
                put("encrypted", note.encrypted)
                put("locked", note.locked)
                put("format", note.format.name)
                put("tags", JSONArray(note.tags))
                put("createdAt", note.createdAt)
                put("updatedAt", note.updatedAt)
            })
        }
        return array.toString()
    }

    private fun decodeNotes(raw: String): List<Note> {
        val array = JSONArray(raw)
        return buildList {
            for (index in 0 until array.length()) {
                val item = array.getJSONObject(index)
                val encrypted = item.optBoolean("encrypted")
                val persistedContent = item.optString("content")
                val content = if (encrypted) {
                    runCatching { decrypt(persistedContent) }.getOrDefault("")
                } else persistedContent
                add(
                    Note(
                        id = item.getString("id"),
                        title = item.optString("title"),
                        content = content,
                        folderId = item.optString("folderId", "inbox"),
                        pinned = item.optBoolean("pinned"),
                        encrypted = encrypted,
                        locked = item.optBoolean("locked"),
                        format = runCatching {
                            NoteFormat.valueOf(item.optString("format"))
                        }.getOrDefault(NoteFormat.MARKDOWN),
                        tags = item.optJSONArray("tags").toStringList(),
                        createdAt = item.optLong("createdAt"),
                        updatedAt = item.optLong("updatedAt"),
                    ),
                )
            }
        }
    }

    private fun encodeFolders(folders: List<Folder>): String {
        val array = JSONArray()
        folders.forEach { folder ->
            array.put(JSONObject().apply {
                put("id", folder.id)
                put("name", folder.name)
                put("system", folder.system)
                put("color", folder.color)
            })
        }
        return array.toString()
    }

    private fun decodeFolders(raw: String): List<Folder> {
        val array = JSONArray(raw)
        return buildList {
            for (index in 0 until array.length()) {
                val item = array.getJSONObject(index)
                add(
                    Folder(
                        id = item.getString("id"),
                        name = item.getString("name"),
                        system = item.optBoolean("system"),
                        color = item.optLong("color", 0xFFA8C7FAL),
                    ),
                )
            }
        }
    }

    private fun encodeSettings(settings: AppSettings): String =
        JSONObject().apply {
            put("theme", settings.theme.name)
            put("fontSize", settings.fontSize)
            put("masterPin", settings.masterPin)
            put("lineWrap", settings.lineWrap)
            put("haptics", settings.haptics)
        }.toString()

    private fun decodeSettings(raw: String): AppSettings {
        val item = JSONObject(raw)
        val storedPin = item.optString("masterPin")
        return AppSettings(
            theme = runCatching {
                ThemeMode.valueOf(item.optString("theme"))
            }.getOrDefault(ThemeMode.MATERIAL_YOU),
            fontSize = item.optInt("fontSize", 16),
            masterPin = storedPin.ifBlank { hashPin("1234") },
            lineWrap = item.optBoolean("lineWrap", true),
            haptics = item.optBoolean("haptics", true),
        )
    }

    private fun JSONArray?.toStringList(): List<String> =
        if (this == null) emptyList() else buildList {
            for (index in 0 until length()) add(optString(index))
        }

    private fun defaultFolders() = listOf(
        Folder("inbox", "Inbox / Notes", system = true),
        Folder("projects", "Projects", color = 0xFF38BDF8),
        Folder("dev", "Development", color = 0xFFA855F7),
        Folder("personal", "Personal", color = 0xFF34D399),
        Folder("archive", "Archive", system = true, color = 0xFFFFB74D),
        Folder("trash", "Trash", system = true, color = 0xFFF87171),
    )

    private fun defaultNotes() = listOf(
        Note(
            id = "welcome-fsnotes",
            title = "Welcome to FSNotes for Android",
            content = "# Welcome to FSNotes\n\nA private, plain-text notes space for Android.\n\n- [x] Material 3 Compose interface\n- [x] Local-first note storage\n- [x] Markdown and plain text editing\n- [x] Search, tags, folders, and pinned notes\n- [ ] WebDAV sync\n\n#welcome #android #markdown",
            folderId = "inbox",
            pinned = true,
            tags = listOf("welcome", "android", "markdown"),
            createdAt = System.currentTimeMillis() - 259_200_000,
            updatedAt = System.currentTimeMillis() - 7_200_000,
        ),
        Note(
            id = "sprint-roadmap",
            title = "Android Port: Feature Roadmap",
            content = "# Android Port Roadmap\n\n- [x] Material 3 UI shell\n- [x] Quick note creation\n- [x] Hashtag extraction and tag filtering\n- [x] Folder tree and trash\n- [x] Encrypted note storage\n- [ ] Cloud sync via WebDAV\n- [ ] Home screen widget\n\n#roadmap #tasks #android",
            folderId = "projects",
            pinned = true,
            tags = listOf("roadmap", "tasks", "android"),
            createdAt = System.currentTimeMillis() - 172_800_000,
            updatedAt = System.currentTimeMillis() - 21_600_000,
        ),
        Note(
            id = "kotlin-architecture",
            title = "FSNotes Architecture: Kotlin",
            content = "# Architecture Notes\n\nThe Android edition uses Jetpack Compose for UI, a local repository for offline persistence, and Android Keystore-backed AES-GCM for encrypted note content.\n\n#dev #kotlin #architecture",
            folderId = "dev",
            tags = listOf("dev", "kotlin", "architecture"),
            createdAt = System.currentTimeMillis() - 86_400_000,
            updatedAt = System.currentTimeMillis() - 43_200_000,
        ),
        Note(
            id = "private-vault",
            title = "Private Vault",
            content = "# Private Vault\n\nThis note is protected by the master PIN and encrypted with a device-backed key.\n\n#security #private #vault",
            folderId = "personal",
            encrypted = true,
            locked = true,
            tags = listOf("security", "private", "vault"),
            createdAt = System.currentTimeMillis() - 172_800_000,
            updatedAt = System.currentTimeMillis() - 86_400_000,
        ),
        Note(
            id = "quick-scratchpad",
            title = "Quick Scratchpad",
            content = "Call with the Android UX team:\n- Keep the drawer for folder-heavy workflows.\n- Support tablet dual-pane layout.\n- Add native share and document export.\n\n#scratchpad #meeting #notes",
            folderId = "inbox",
            format = NoteFormat.TEXT,
            tags = listOf("scratchpad", "meeting", "notes"),
            createdAt = System.currentTimeMillis() - 64_800_000,
            updatedAt = System.currentTimeMillis() - 3_600_000,
        ),
    )

    private companion object {
        const val NOTES_KEY = "notes"
        const val FOLDERS_KEY = "folders"
        const val SETTINGS_KEY = "settings"
    }
}

private fun String.toUuid(): String = if (isBlank()) UUID.randomUUID().toString() else this