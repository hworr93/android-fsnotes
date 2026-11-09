package com.fsnotes.android.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.fsnotes.android.data.AppSettings
import com.fsnotes.android.data.Folder
import com.fsnotes.android.data.Note
import com.fsnotes.android.data.NoteFormat
import com.fsnotes.android.data.NoteRepository
import com.fsnotes.android.data.NotesState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class NoteViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = NoteRepository(application)
    private val _state = MutableStateFlow(repository.load())
    val state: StateFlow<NotesState> = _state.asStateFlow()

    fun updateNote(note: Note) = update {
        copy(notes = notes.map { if (it.id == note.id) note.copy(updatedAt = System.currentTimeMillis()) else it })
    }

    fun createNote(folderId: String, format: NoteFormat = NoteFormat.MARKDOWN, encrypted: Boolean = false) {
        val now = System.currentTimeMillis()
        val note = Note(
            id = "note-$now",
            title = when {
                encrypted -> "Confidential Protected Note"
                format == NoteFormat.TEXT -> "Quick Plain Text Note"
                else -> "Untitled Note"
            },
            content = when {
                encrypted -> "# Confidential Note\n\nThis note is protected with your master PIN.\n\n#private"
                format == NoteFormat.TEXT -> "Start writing here.\n"
                else -> "# New Note\n\nStart writing here...\n"
            },
            folderId = if (folderId == "trash" || folderId == "archive") "inbox" else folderId,
            encrypted = encrypted,
            locked = false,
            format = format,
            tags = extractTags(
                when {
                    encrypted -> "# Confidential Note\n\n#private"
                    format == NoteFormat.TEXT -> "Start writing here.\n"
                    else -> "# New Note\n\nStart writing here...\n"
                },
            ),
            createdAt = now,
            updatedAt = now,
        )
        update { copy(notes = listOf(note) + notes) }
    }

    fun deleteNote(note: Note) = update {
        copy(
            notes = if (note.folderId == "trash") notes.filterNot { it.id == note.id }
            else notes.map { if (it.id == note.id) it.copy(folderId = "trash") else it },
        )
    }

    fun duplicateNote(note: Note) {
        val now = System.currentTimeMillis()
        update {
            copy(
                notes = listOf(
                    note.copy(
                        id = "note-$now",
                        title = "${note.title} (Copy)",
                        createdAt = now,
                        updatedAt = now,
                        locked = false,
                    ),
                ) + notes,
            )
        }
    }

    fun moveNote(note: Note, folderId: String) =
        update { copy(notes = notes.map { if (it.id == note.id) it.copy(folderId = folderId) else it }) }

    fun togglePin(note: Note) = update {
        copy(notes = notes.map { if (it.id == note.id) it.copy(pinned = !it.pinned) else it })
    }

    fun toggleEncryption(note: Note) = update {
        copy(
            notes = notes.map {
                if (it.id == note.id) it.copy(encrypted = !it.encrypted, locked = !it.encrypted) else it
            },
        )
    }

    fun lockNote(note: Note) = update {
        copy(notes = notes.map { if (it.id == note.id) it.copy(locked = true) else it })
    }

    fun unlockNote(note: Note, pin: String): Boolean {
        val stored = state.value.settings.masterPin
        if (repository.hashPin(pin) != stored) return false
        update { copy(notes = notes.map { if (it.id == note.id) it.copy(locked = false) else it }) }
        return true
    }

    fun addFolder(name: String, color: Long) {
        val folder = Folder("folder-${System.currentTimeMillis()}", name, color = color)
        update { copy(folders = folders + folder) }
    }

    fun updateSettings(settings: AppSettings) = update {
        val normalizedPin = if (settings.masterPin.matches(Regex("[0-9a-f]{64}"))) {
            settings.masterPin
        } else {
            repository.hashPin(settings.masterPin)
        }
        copy(settings = settings.copy(masterPin = normalizedPin))
    }

    fun resetDefaults() {
        val defaults = repository.resetToDefaults()
        update { defaults }
    }

    fun replaceFromBackup(notes: List<Note>, folders: List<Folder>) =
        update { copy(notes = notes, folders = folders) }

    fun exportJson(): String {
        val exported = state.value
        return org.json.JSONObject().apply {
            put("app", "FSNotes for Android")
            put("version", 1)
            put("notes", org.json.JSONArray().apply {
                exported.notes.forEach { note ->
                    put(org.json.JSONObject().apply {
                        put("id", note.id)
                        put("title", note.title)
                        put("content", note.content)
                        put("folderId", note.folderId)
                        put("pinned", note.pinned)
                        put("encrypted", note.encrypted)
                        put("locked", note.locked)
                        put("format", note.format.name)
                        put("tags", org.json.JSONArray(note.tags))
                        put("createdAt", note.createdAt)
                        put("updatedAt", note.updatedAt)
                    })
                }
            })
            put("folders", org.json.JSONArray().apply {
                exported.folders.forEach { folder ->
                    put(org.json.JSONObject().apply {
                        put("id", folder.id)
                        put("name", folder.name)
                        put("system", folder.system)
                        put("color", folder.color)
                    })
                }
            })
        }.toString(2)
    }

    fun importJson(raw: String): Boolean {
        return runCatching {
            val root = org.json.JSONObject(raw)
            val notesArray = root.getJSONArray("notes")
            val foldersArray = root.optJSONArray("folders")
            val notes = buildList {
                for (index in 0 until notesArray.length()) {
                    val item = notesArray.getJSONObject(index)
                    add(
                        Note(
                            id = item.getString("id"),
                            title = item.optString("title"),
                            content = item.optString("content"),
                            folderId = item.optString("folderId", "inbox"),
                            pinned = item.optBoolean("pinned"),
                            encrypted = item.optBoolean("encrypted"),
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
            val folders = if (foldersArray == null) state.value.folders else buildList {
                for (index in 0 until foldersArray.length()) {
                    val item = foldersArray.getJSONObject(index)
                    add(
                        Folder(
                            id = item.getString("id"),
                            name = item.getString("name"),
                            system = item.optBoolean("system"),
                            color = item.optLong("color"),
                        ),
                    )
                }
            }
            replaceFromBackup(notes, folders)
            true
        }.getOrDefault(false)
    }

    private fun update(transform: NotesState.() -> NotesState) {
        val next = _state.value.transform()
        _state.value = next
        viewModelScope.launch { repository.save(next) }
    }
}

fun extractTags(content: String): List<String> =
    Regex("""(?:^|\s)#([A-Za-z0-9_-]+)""")
        .findAll(content)
        .map { it.groupValues[1].lowercase() }
        .filterNot { it.all(Char::isDigit) }
        .distinct()
        .toList()

fun noteStats(content: String): Triple<Int, Int, Int> {
    val trimmed = content.trim()
    val words = if (trimmed.isBlank()) 0 else trimmed.split(Regex("\\s+")).size
    return Triple(words, content.length, content.split("\n").size)
}

private fun org.json.JSONArray?.toStringList(): List<String> =
    if (this == null) emptyList() else buildList {
        for (index in 0 until length()) add(optString(index))
    }