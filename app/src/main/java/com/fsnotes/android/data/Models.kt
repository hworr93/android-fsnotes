package com.fsnotes.android.data

enum class NoteFormat { MARKDOWN, TEXT }

enum class SortMode { UPDATED, CREATED, TITLE }

enum class ThemeMode { MATERIAL_YOU, AMOLED, SOLARIZED, SEPIA, LIGHT }

data class Note(
    val id: String,
    val title: String,
    val content: String,
    val folderId: String,
    val pinned: Boolean = false,
    val encrypted: Boolean = false,
    val locked: Boolean = false,
    val format: NoteFormat = NoteFormat.MARKDOWN,
    val tags: List<String> = emptyList(),
    val createdAt: Long,
    val updatedAt: Long,
)

data class Folder(
    val id: String,
    val name: String,
    val system: Boolean = false,
    val color: Long = 0xFFA8C7FA,
)

data class AppSettings(
    val theme: ThemeMode = ThemeMode.MATERIAL_YOU,
    val fontSize: Int = 16,
    val masterPin: String = "1234",
    val lineWrap: Boolean = true,
    val haptics: Boolean = true,
)

data class NotesState(
    val notes: List<Note> = emptyList(),
    val folders: List<Folder> = emptyList(),
    val settings: AppSettings = AppSettings(),
)