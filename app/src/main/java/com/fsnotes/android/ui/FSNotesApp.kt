package com.fsnotes.android.ui

import android.content.Intent
import android.graphics.Color as AndroidColor
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Sort
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Archive
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Backup
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckBox
import androidx.compose.material.icons.filled.CheckBoxOutlineBlank
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.CreateNewFolder
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.FormatBold
import androidx.compose.material.icons.filled.FormatItalic
import androidx.compose.material.icons.filled.FormatQuote
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Preview
import androidx.compose.material.icons.filled.PushPin
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Tag
import androidx.compose.material.icons.filled.TextFields
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Unarchive
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Badge
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.SheetState
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDrawerState
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.material3.rememberTopAppBarState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.fsnotes.android.data.AppSettings
import com.fsnotes.android.data.Folder
import com.fsnotes.android.data.Note
import com.fsnotes.android.data.NoteFormat
import com.fsnotes.android.data.SortMode
import com.fsnotes.android.data.ThemeMode
import kotlinx.coroutines.launch
import java.text.DateFormat
import java.util.Date

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FSNotesApp(viewModel: NoteViewModel = viewModel()) {
    val state by viewModel.state.collectAsState()
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    val haptics = LocalHapticFeedback.current

    var activeFolderId by rememberSaveable { mutableStateOf("inbox") }
    var activeTag by rememberSaveable { mutableStateOf<String?>(null) }
    var searchQuery by rememberSaveable { mutableStateOf("") }
    var sortMode by rememberSaveable { mutableStateOf(SortMode.UPDATED) }
    var selectedNoteId by rememberSaveable { mutableStateOf<String?>(null) }
    var showSettings by rememberSaveable { mutableStateOf(false) }
    var showNewFolder by rememberSaveable { mutableStateOf(false) }
    var showNewNoteMenu by rememberSaveable { mutableStateOf(false) }
    var actionNote by remember { mutableStateOf<Note?>(null) }
    var unlockNote by remember { mutableStateOf<Note?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    var exportContent by remember { mutableStateOf("") }

    val exportLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.CreateDocument("application/json"),
    ) { uri: Uri? ->
        if (uri != null) {
            context.contentResolver.openOutputStream(uri)
                ?.bufferedWriter()
                ?.use { it.write(exportContent) }
        }
    }

    val selectedNote = state.notes.firstOrNull { it.id == selectedNoteId }
    val folderName = state.folders.firstOrNull { it.id == activeFolderId }?.name
        ?: if (activeFolderId == "all") "All Notes" else "Notes"
    val tags = state.notes
        .filter { it.folderId != "trash" }
        .flatMap { it.tags.ifEmpty { extractTags(it.content) } }
        .groupingBy { it }
        .eachCount()
        .toList()
        .sortedByDescending { it.second }

    val filteredNotes = state.notes
        .filter { note ->
            val folderMatches = when {
                activeFolderId == "trash" -> note.folderId == "trash"
                activeFolderId == "all" -> note.folderId != "trash"
                else -> note.folderId == activeFolderId
            }
            val tagMatches = activeTag == null ||
                (note.tags.ifEmpty { extractTags(note.content) }).contains(activeTag)
            val query = searchQuery.trim().lowercase()
            val queryMatches = query.isBlank() ||
                note.title.lowercase().contains(query) ||
                note.content.lowercase().contains(query) ||
                note.tags.any { it.contains(query) }
            folderMatches && tagMatches && queryMatches
        }
        .sortedWith(
            compareByDescending<Note> { it.pinned }
                .thenByDescending {
                    when (sortMode) {
                        SortMode.UPDATED -> it.updatedAt
                        SortMode.CREATED -> it.createdAt
                        SortMode.TITLE -> 0L
                    }
                }
                .let { comparator ->
                    if (sortMode == SortMode.TITLE) compareByDescending<Note> { it.pinned }
                        .thenBy { it.title.lowercase() }
                    else comparator
                },
        )

    val isEditorOpen = selectedNote != null
    val useDarkTheme = state.settings.theme != ThemeMode.LIGHT && state.settings.theme != ThemeMode.SEPIA
    val colorScheme = when (state.settings.theme) {
        ThemeMode.AMOLED -> androidx.compose.material3.darkColorScheme(
            background = Color.Black,
            surface = Color(0xFF080808),
            surfaceVariant = Color(0xFF171717),
            primary = Color(0xFF8CC8FF),
            onPrimary = Color(0xFF003353),
            secondary = Color(0xFFB7C9E8),
        )
        ThemeMode.SOLARIZED -> androidx.compose.material3.darkColorScheme(
            background = Color(0xFF002B36),
            surface = Color(0xFF073642),
            surfaceVariant = Color(0xFF0B4551),
            primary = Color(0xFF2AA198),
            onPrimary = Color(0xFF002B36),
            secondary = Color(0xFF93A1A1),
        )
        ThemeMode.SEPIA -> androidx.compose.material3.lightColorScheme(
            background = Color(0xFFF4ECD8),
            surface = Color(0xFFFFF7E6),
            surfaceVariant = Color(0xFFEBD5B3),
            primary = Color(0xFF9F5822),
            onPrimary = Color.White,
            secondary = Color(0xFF765333),
        )
        ThemeMode.LIGHT -> androidx.compose.material3.lightColorScheme(
            primary = Color(0xFF0B57D0),
            surfaceVariant = Color(0xFFE9EEF7),
        )
        ThemeMode.MATERIAL_YOU -> if (useDarkTheme) {
            androidx.compose.material3.darkColorScheme(
                primary = Color(0xFFA8C7FA),
                onPrimary = Color(0xFF0B2942),
                secondary = Color(0xFFB5C8E8),
                background = Color(0xFF101114),
                surface = Color(0xFF191A1E),
                surfaceVariant = Color(0xFF2A2D34),
            )
        } else androidx.compose.material3.lightColorScheme()
    }

    LaunchedEffect(message) {
        message?.let {
            snackbar.showSnackbar(it)
            message = null
        }
    }

    androidx.compose.material3.MaterialTheme(
        colorScheme = colorScheme,
        typography = MaterialTheme.typography.copy(
            bodyLarge = MaterialTheme.typography.bodyLarge.copy(
                fontSize = state.settings.fontSize.sp,
            ),
        ),
    ) {
        ModalNavigationDrawer(
            drawerState = drawerState,
            drawerContent = {
                NavigationDrawerContent(
                    state = state,
                    activeFolderId = activeFolderId,
                    activeTag = activeTag,
                    tags = tags,
                    onSelectFolder = {
                        activeFolderId = it
                        activeTag = null
                        selectedNoteId = null
                        scope.launch { drawerState.close() }
                    },
                    onSelectTag = {
                        activeTag = if (activeTag == it) null else it
                        selectedNoteId = null
                        scope.launch { drawerState.close() }
                    },
                    onNewFolder = {
                        showNewFolder = true
                        scope.launch { drawerState.close() }
                    },
                    onSettings = {
                        showSettings = true
                        scope.launch { drawerState.close() }
                    },
                    onExport = {
                        exportContent = viewModel.exportJson()
                        exportLauncher.launch("fsnotes-backup.json")
                    },
                )
            },
        ) {
            Scaffold(
                modifier = Modifier.fillMaxSize(),
                contentWindowInsets = WindowInsets.safeDrawing,
                topBar = {
                    TopAppBar(
                        title = {
                            Column {
                                Text(
                                    text = if (isEditorOpen) selectedNote?.title ?: "Note" else folderName,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                )
                                if (!isEditorOpen) {
                                    Text(
                                        text = "${filteredNotes.size} ${if (filteredNotes.size == 1) "note" else "notes"}",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    )
                                }
                            }
                        },
                        navigationIcon = {
                            if (isEditorOpen) {
                                IconButton(onClick = { selectedNoteId = null }) {
                                    Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back to notes")
                                }
                            } else {
                                IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                    Icon(Icons.Default.GridView, "Open folders")
                                }
                            }
                        },
                        actions = {
                            if (isEditorOpen && selectedNote != null) {
                                IconButton(onClick = { viewModel.togglePin(selectedNote) }) {
                                    Icon(
                                        Icons.Default.PushPin,
                                        contentDescription = "Pin note",
                                        tint = if (selectedNote.pinned) MaterialTheme.colorScheme.primary
                                        else MaterialTheme.colorScheme.onSurfaceVariant,
                                    )
                                }
                                IconButton(onClick = { shareNote(context, selectedNote) }) {
                                    Icon(Icons.Default.Share, "Share note")
                                }
                            } else {
                                var showSort by remember { mutableStateOf(false) }
                                IconButton(onClick = { showSort = true }) {
                                    Icon(Icons.AutoMirrored.Filled.Sort, "Sort notes")
                                }
                                DropdownMenu(expanded = showSort, onDismissRequest = { showSort = false }) {
                                    DropdownMenuItem(
                                        text = { Text("Recently updated") },
                                        onClick = { sortMode = SortMode.UPDATED; showSort = false },
                                        leadingIcon = { if (sortMode == SortMode.UPDATED) Icon(Icons.Default.Check, null) },
                                    )
                                    DropdownMenuItem(
                                        text = { Text("Recently created") },
                                        onClick = { sortMode = SortMode.CREATED; showSort = false },
                                        leadingIcon = { if (sortMode == SortMode.CREATED) Icon(Icons.Default.Check, null) },
                                    )
                                    DropdownMenuItem(
                                        text = { Text("Title A–Z") },
                                        onClick = { sortMode = SortMode.TITLE; showSort = false },
                                        leadingIcon = { if (sortMode == SortMode.TITLE) Icon(Icons.Default.Check, null) },
                                    )
                                }
                            }
                        },
                    )
                },
                floatingActionButton = {
                    if (!isEditorOpen && activeFolderId != "trash") {
                        Box {
                            ExtendedFloatingActionButton(
                                text = { Text("New note") },
                                icon = { Icon(Icons.Default.Add, null) },
                                onClick = { showNewNoteMenu = true },
                            )
                            DropdownMenu(
                                expanded = showNewNoteMenu,
                                onDismissRequest = { showNewNoteMenu = false },
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Markdown note") },
                                    leadingIcon = { Icon(Icons.Default.Edit, null) },
                                    onClick = {
                                        viewModel.createNote(activeFolderId)
                                        selectedNoteId = viewModel.state.value.notes.firstOrNull()?.id
                                        showNewNoteMenu = false
                                    },
                                )
                                DropdownMenuItem(
                                    text = { Text("Plain text note") },
                                    leadingIcon = { Icon(Icons.Default.TextFields, null) },
                                    onClick = {
                                        viewModel.createNote(activeFolderId, NoteFormat.TEXT)
                                        selectedNoteId = viewModel.state.value.notes.firstOrNull()?.id
                                        showNewNoteMenu = false
                                    },
                                )
                                DropdownMenuItem(
                                    text = { Text("Encrypted note") },
                                    leadingIcon = { Icon(Icons.Default.Lock, null) },
                                    onClick = {
                                        viewModel.createNote(activeFolderId, encrypted = true)
                                        selectedNoteId = viewModel.state.value.notes.firstOrNull()?.id
                                        showNewNoteMenu = false
                                    },
                                )
                            }
                        }
                    }
                },
                snackbarHost = { SnackbarHost(snackbar) },
            ) { padding ->
                if (isEditorOpen && selectedNote != null) {
                    NoteEditor(
                        note = selectedNote,
                        settings = state.settings,
                        onChange = viewModel::updateNote,
                        onDelete = {
                            viewModel.deleteNote(selectedNote)
                            selectedNoteId = null
                            message = if (selectedNote.folderId == "trash") "Note permanently deleted" else "Moved to Trash"
                        },
                        onLock = {
                            viewModel.lockNote(selectedNote)
                            selectedNoteId = null
                            message = "Note locked"
                        },
                        modifier = Modifier
                            .padding(padding)
                            .fillMaxSize()
                            .imePadding(),
                    )
                } else {
                    NotesList(
                        notes = filteredNotes,
                        folders = state.folders,
                        searchQuery = searchQuery,
                        activeTag = activeTag,
                        onSearchChange = { searchQuery = it },
                        onClearTag = { activeTag = null },
                        onSelect = { note ->
                            if (note.encrypted && note.locked) unlockNote = note
                            else selectedNoteId = note.id
                        },
                        onActions = { actionNote = it },
                        modifier = Modifier.padding(padding),
                    )
                }
            }
        }
    }

    actionNote?.let { note ->
        NoteActionsSheet(
            note = note,
            folders = state.folders,
            onDismiss = { actionNote = null },
            onTogglePin = { viewModel.togglePin(note); actionNote = null },
            onToggleEncryption = { viewModel.toggleEncryption(note); actionNote = null },
            onDuplicate = { viewModel.duplicateNote(note); actionNote = null; message = "Note duplicated" },
            onMove = { folder ->
                viewModel.moveNote(note, folder.id)
                actionNote = null
                message = "Moved to ${folder.name}"
            },
            onDelete = {
                viewModel.deleteNote(note)
                actionNote = null
                message = if (note.folderId == "trash") "Note permanently deleted" else "Moved to Trash"
            },
            onShare = { shareNote(context, note); actionNote = null },
        )
    }

    unlockNote?.let { note ->
        UnlockDialog(
            onDismiss = { unlockNote = null },
            onUnlock = { pin ->
                if (viewModel.unlockNote(note, pin)) {
                    selectedNoteId = note.id
                    unlockNote = null
                    message = "Note unlocked"
                } else {
                    false
                }
            },
        )
    }

    if (showNewFolder) {
        NewFolderDialog(
            onDismiss = { showNewFolder = false },
            onCreate = { name ->
                viewModel.addFolder(name, 0xFF38BDF8)
                showNewFolder = false
                message = "Folder created"
            },
        )
    }

    val importLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument(),
    ) { uri: Uri? ->
        uri ?: return@rememberLauncherForActivityResult
        val raw = context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() }
        if (raw != null && viewModel.importJson(raw)) message = "Backup imported"
        else message = "That backup could not be read"
    }

    if (showSettings) {
        SettingsDialog(
            settings = state.settings,
            onDismiss = { showSettings = false },
            onUpdate = viewModel::updateSettings,
            onImport = { importLauncher.launch(arrayOf("application/json", "text/*")) },
            onReset = {
                viewModel.resetDefaults()
                showSettings = false
                message = "Sample notes restored"
            },
        )
    }
}

@Composable
private fun NotesList(
    notes: List<Note>,
    folders: List<Folder>,
    searchQuery: String,
    activeTag: String?,
    onSearchChange: (String) -> Unit,
    onClearTag: () -> Unit,
    onSelect: (Note) -> Unit,
    onActions: (Note) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
    ) {
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchChange,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            placeholder = { Text("Search notes, text, or tags") },
            leadingIcon = { Icon(Icons.Default.Search, null) },
            trailingIcon = if (searchQuery.isNotBlank()) {
                { IconButton(onClick = { onSearchChange("") }) { Icon(Icons.Default.Close, "Clear search") } }
            } else null,
            singleLine = true,
            shape = RoundedCornerShape(18.dp),
        )
        if (activeTag != null) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 2.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Filtering by", style = MaterialTheme.typography.labelMedium)
                AssistChip(
                    onClick = onClearTag,
                    label = { Text("#$activeTag") },
                    leadingIcon = { Icon(Icons.Default.Tag, null, Modifier.size(16.dp)) },
                    modifier = Modifier.padding(start = 8.dp),
                )
            }
        }
        if (notes.isEmpty()) {
            EmptyNotes(
                searching = searchQuery.isNotBlank(),
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            LazyColumn(
                contentPadding = androidx.compose.foundation.layout.PaddingValues(
                    start = 16.dp,
                    end = 16.dp,
                    top = 6.dp,
                    bottom = 112.dp,
                ),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(notes, key = { it.id }) { note ->
                    NoteCard(
                        note = note,
                        folder = folders.firstOrNull { it.id == note.folderId },
                        onClick = { onSelect(note) },
                        onActions = { onActions(note) },
                    )
                }
            }
        }
    }
}

@Composable
private fun NoteCard(
    note: Note,
    folder: Folder?,
    onClick: () -> Unit,
    onActions: () -> Unit,
) {
    val tags = note.tags.ifEmpty { extractTags(note.content) }
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = if (note.pinned) MaterialTheme.colorScheme.surfaceVariant
            else MaterialTheme.colorScheme.surface,
        ),
        border = if (note.pinned) BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.45f)) else null,
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = if (note.locked) "Locked note" else note.title.ifBlank { "Untitled note" },
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        if (note.pinned) {
                            Icon(
                                Icons.Default.PushPin,
                                contentDescription = "Pinned",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.padding(start = 6.dp).size(16.dp),
                            )
                        }
                    }
                    Text(
                        text = "${folder?.name ?: "Notes"}  •  ${relativeDate(note.updatedAt)}",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                if (note.encrypted) {
                    Icon(
                        if (note.locked) Icons.Default.Lock else Icons.Default.LockOpen,
                        contentDescription = "Encrypted",
                        tint = MaterialTheme.colorScheme.tertiary,
                        modifier = Modifier.size(18.dp),
                    )
                }
                IconButton(onClick = onActions) {
                    Icon(Icons.Default.MoreVert, "Note actions")
                }
            }
            Spacer(Modifier.height(8.dp))
            Text(
                text = if (note.locked) "Unlock this note with your master PIN to view its contents."
                else previewText(note.content),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
            )
            if (tags.isNotEmpty()) {
                Row(
                    modifier = Modifier
                        .padding(top = 12.dp)
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    tags.take(4).forEach { tag ->
                        Surface(
                            color = MaterialTheme.colorScheme.secondaryContainer,
                            shape = RoundedCornerShape(8.dp),
                        ) {
                            Text(
                                "#$tag",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSecondaryContainer,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyNotes(searching: Boolean, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Surface(
            modifier = Modifier.size(72.dp),
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.secondaryContainer,
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(Icons.Default.Book, null, Modifier.size(34.dp), tint = MaterialTheme.colorScheme.primary)
            }
        }
        Spacer(Modifier.height(18.dp))
        Text(if (searching) "No matching notes" else "No notes here", style = MaterialTheme.typography.titleLarge)
        Text(
            if (searching) "Try a different word or tag." else "Create a note to start writing.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun NavigationDrawerContent(
    state: com.fsnotes.android.data.NotesState,
    activeFolderId: String,
    activeTag: String?,
    tags: List<Pair<String, Int>>,
    onSelectFolder: (String) -> Unit,
    onSelectTag: (String) -> Unit,
    onNewFolder: () -> Unit,
    onSettings: () -> Unit,
    onExport: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxHeight()
            .width(320.dp)
            .background(MaterialTheme.colorScheme.surface)
            .windowInsetsPadding(WindowInsets.safeDrawing),
    ) {
        Column(modifier = Modifier.padding(24.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    modifier = Modifier.size(44.dp),
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.primary,
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Edit, null, tint = MaterialTheme.colorScheme.onPrimary)
                    }
                }
                Column(modifier = Modifier.padding(start = 12.dp)) {
                    Text("FSNotes", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("Android edition", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                }
            }
            Spacer(Modifier.height(18.dp))
            Surface(
                color = MaterialTheme.colorScheme.surfaceVariant,
                shape = RoundedCornerShape(14.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(Icons.Default.FolderOpen, null, tint = MaterialTheme.colorScheme.primary)
                    Text(
                        "${state.notes.count { it.folderId != "trash" }} notes stored locally",
                        modifier = Modifier.padding(start = 10.dp),
                        style = MaterialTheme.typography.labelLarge,
                    )
                }
            }
        }
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 12.dp),
        ) {
            item {
                Text(
                    "Folders",
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                DrawerItem(
                    label = "All notes",
                    icon = Icons.Default.Book,
                    selected = activeFolderId == "all" && activeTag == null,
                    count = state.notes.count { it.folderId != "trash" },
                    onClick = { onSelectFolder("all") },
                )
            }
            items(state.folders.filter { it.id == "inbox" }) { folder ->
                DrawerItem(folder, activeFolderId, activeTag, onSelectFolder)
            }
            item {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(start = 12.dp, top = 16.dp, bottom = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        "Collections",
                        modifier = Modifier.weight(1f),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    IconButton(onClick = onNewFolder) {
                        Icon(Icons.Default.CreateNewFolder, "New folder", Modifier.size(20.dp))
                    }
                }
            }
            items(state.folders.filter { !it.system }) { folder ->
                DrawerItem(folder, activeFolderId, activeTag, onSelectFolder)
            }
            item {
                Spacer(Modifier.height(16.dp))
                Text(
                    "System",
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            items(state.folders.filter { it.id == "archive" || it.id == "trash" }) { folder ->
                DrawerItem(folder, activeFolderId, activeTag, onSelectFolder)
            }
            item {
                Spacer(Modifier.height(18.dp))
                Divider()
                Text(
                    "Tags",
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 14.dp),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            items(tags.take(20)) { (tag, count) ->
                NavigationDrawerItem(
                    label = { Text("#$tag") },
                    selected = activeTag == tag,
                    onClick = { onSelectTag(tag) },
                    icon = { Icon(Icons.Default.Tag, null) },
                    badge = { Badge { Text(count.toString()) } },
                    modifier = Modifier.padding(vertical = 2.dp),
                    colors = NavigationDrawerItemDefaults.colors(
                        selectedContainerColor = MaterialTheme.colorScheme.secondaryContainer,
                    ),
                )
            }
        }
        Column(
            modifier = Modifier.padding(12.dp).windowInsetsPadding(WindowInsets.navigationBars),
        ) {
            NavigationDrawerItem(
                label = { Text("Export backup") },
                selected = false,
                onClick = onExport,
                icon = { Icon(Icons.Default.Backup, null) },
            )
            NavigationDrawerItem(
                label = { Text("Settings") },
                selected = false,
                onClick = onSettings,
                icon = { Icon(Icons.Default.Settings, null) },
            )
        }
    }
}

@Composable
private fun DrawerItem(
    folder: Folder,
    activeFolderId: String,
    activeTag: String?,
    onSelectFolder: (String) -> Unit,
) {
    val icon = when (folder.id) {
        "inbox" -> Icons.Default.Inbox
        "archive" -> Icons.Default.Archive
        "trash" -> Icons.Default.Delete
        else -> Icons.Default.Folder
    }
    NavigationDrawerItem(
        label = { Text(folder.name) },
        selected = activeFolderId == folder.id && activeTag == null,
        onClick = { onSelectFolder(folder.id) },
        icon = { Icon(icon, null, tint = Color(folder.color)) },
        modifier = Modifier.padding(vertical = 2.dp),
        colors = NavigationDrawerItemDefaults.colors(
            selectedContainerColor = MaterialTheme.colorScheme.secondaryContainer,
        ),
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NoteEditor(
    note: Note,
    settings: AppSettings,
    onChange: (Note) -> Unit,
    onDelete: () -> Unit,
    onLock: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var tab by rememberSaveable(note.id) { mutableStateOf(0) }
    Column(modifier = modifier.background(MaterialTheme.colorScheme.surface)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedTextField(
                value = note.title,
                onValueChange = { onChange(note.copy(title = it)) },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Note title") },
                singleLine = true,
                textStyle = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                shape = RoundedCornerShape(14.dp),
            )
            IconButton(onClick = onLock) {
                Icon(Icons.Default.Lock, "Lock note")
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, "Move to trash", tint = MaterialTheme.colorScheme.error)
            }
        }
        ScrollableTabRow(selectedTabIndex = tab, edgePadding = 16.dp) {
            Tab(selected = tab == 0, onClick = { tab = 0 }, text = { Text("Edit") }, icon = { Icon(Icons.Default.Edit, null) })
            Tab(selected = tab == 1, onClick = { tab = 1 }, text = { Text("Preview") }, icon = { Icon(Icons.Default.Visibility, null) })
        }
        if (tab == 0) {
            EditorToolbar(
                onInsert = { prefix, suffix ->
                    onChange(note.copy(content = note.content + prefix + suffix))
                },
            )
            TextField(
                value = note.content,
                onValueChange = { onChange(note.copy(content = it, tags = extractTags(it))) },
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(horizontal = 12.dp),
                placeholder = { Text("Write Markdown or plain text…") },
                textStyle = MaterialTheme.typography.bodyLarge.copy(
                    fontSize = settings.fontSize.sp,
                    fontFamily = FontFamily.Monospace,
                    lineHeight = (settings.fontSize + 8).sp,
                ),
                minLines = 12,
                maxLines = Int.MAX_VALUE,
                singleLine = false,
                colors = androidx.compose.material3.TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                ),
            )
        } else {
            MarkdownPreview(
                content = note.content,
                modifier = Modifier.weight(1f).fillMaxWidth().padding(20.dp),
                onToggle = { line, checked ->
                    val old = if (checked) "- [ ] $line" else "- [x] $line"
                    val new = if (checked) "- [x] $line" else "- [ ] $line"
                    onChange(note.copy(content = note.content.replaceFirst(old, new)))
                },
            )
        }
        val stats = noteStats(note.content)
        Row(
            modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surfaceVariant).padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text("${stats.first} words  •  ${stats.second} characters  •  ${stats.third} lines", style = MaterialTheme.typography.labelSmall)
            Text(if (note.format == NoteFormat.TEXT) "PLAIN TEXT" else "MARKDOWN", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
        }
    }
}

@Composable
private fun EditorToolbar(onInsert: (String, String) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 12.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = { onInsert("**bold**", "") }) { Icon(Icons.Default.FormatBold, "Bold") }
        IconButton(onClick = { onInsert("*italic*", "") }) { Icon(Icons.Default.FormatItalic, "Italic") }
        IconButton(onClick = { onInsert("### ", "") }) { Icon(Icons.Default.TextFields, "Heading") }
        IconButton(onClick = { onInsert("- [ ] ", "") }) { Icon(Icons.Default.CheckBoxOutlineBlank, "Checklist") }
        IconButton(onClick = { onInsert("> ", "") }) { Icon(Icons.Default.FormatQuote, "Quote") }
        IconButton(onClick = { onInsert("```\n", "\n```") }) { Icon(Icons.Default.Code, "Code block") }
    }
}

@Composable
private fun MarkdownPreview(
    content: String,
    modifier: Modifier = Modifier,
    onToggle: (String, Boolean) -> Unit = { _, _ -> },
) {
    LazyColumn(modifier = modifier) {
        items(content.split("\n")) { line ->
            when {
                line.startsWith("### ") -> Text(
                    line.removePrefix("### "),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 5.dp),
                )
                line.startsWith("## ") -> Text(
                    line.removePrefix("## "),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 6.dp),
                )
                line.startsWith("# ") -> Text(
                    line.removePrefix("# "),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(vertical = 8.dp),
                )
                line.matches(Regex("- \\[[ xX]\\] .*")) -> {
                    val checked = line.startsWith("- [x", ignoreCase = true)
                    val text = line.drop(6)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onToggle(text, !checked) }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(
                            if (checked) Icons.Default.CheckBox else Icons.Default.CheckBoxOutlineBlank,
                            null,
                            tint = MaterialTheme.colorScheme.primary,
                        )
                        Text(
                            text,
                            modifier = Modifier.padding(start = 10.dp),
                            textDecoration = if (checked) androidx.compose.ui.text.style.TextDecoration.LineThrough else null,
                        )
                    }
                }
                line.startsWith("> ") -> Text(
                    line.removePrefix("> "),
                    modifier = Modifier.padding(vertical = 5.dp).padding(start = 12.dp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                )
                line.startsWith("```") -> Spacer(Modifier.height(2.dp))
                line.startsWith("|") -> Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    shape = RoundedCornerShape(4.dp),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 1.dp),
                ) {
                    Text(line, fontFamily = FontFamily.Monospace, modifier = Modifier.padding(8.dp))
                }
                line.isBlank() -> Spacer(Modifier.height(8.dp))
                else -> Text(
                    renderInlineMarkdown(line),
                    modifier = Modifier.padding(vertical = 2.dp),
                    lineHeight = 24.sp,
                )
            }
        }
    }
}

@Composable
private fun renderInlineMarkdown(line: String): AnnotatedString {
    val builder = AnnotatedString.Builder()
    var cursor = 0
    val pattern = Regex("""(\*\*.*?\*\*|\*.*?\*|`.*?`)""")
    pattern.findAll(line).forEach { match ->
        builder.append(line.substring(cursor, match.range.first))
        val raw = match.value
        val clean = raw.trim('*', '`')
        val style = when {
            raw.startsWith("**") -> SpanStyle(fontWeight = FontWeight.Bold)
            raw.startsWith("*") -> SpanStyle(fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
            else -> SpanStyle(fontFamily = FontFamily.Monospace, color = MaterialTheme.colorScheme.primary)
        }
        builder.withStyle(style) { append(clean) }
        cursor = match.range.last + 1
    }
    builder.append(line.substring(cursor))
    return builder.toAnnotatedString()
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NoteActionsSheet(
    note: Note,
    folders: List<Folder>,
    onDismiss: () -> Unit,
    onTogglePin: () -> Unit,
    onToggleEncryption: () -> Unit,
    onDuplicate: () -> Unit,
    onMove: (Folder) -> Unit,
    onDelete: () -> Unit,
    onShare: () -> Unit,
) {
    var showFolders by remember { mutableStateOf(false) }
    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(modifier = Modifier.padding(bottom = 24.dp)) {
            Text(
                note.title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            DropdownAction(if (note.pinned) "Unpin note" else "Pin note", Icons.Default.PushPin, onTogglePin)
            DropdownAction(if (note.encrypted) "Remove encryption" else "Encrypt with master PIN", Icons.Default.Lock, onToggleEncryption)
            DropdownAction("Duplicate note", Icons.Default.ContentCopy, onDuplicate)
            DropdownAction("Share note", Icons.Default.Share, onShare)
            DropdownAction(if (showFolders) "Hide folders" else "Move to folder", Icons.Default.Folder, { showFolders = !showFolders })
            if (showFolders) {
                folders.filter { !it.system && it.id != note.folderId }.forEach { folder ->
                    DropdownAction(folder.name, Icons.Default.FolderOpen, { onMove(folder) })
                }
            }
            DropdownAction(if (note.folderId == "trash") "Delete permanently" else "Move to Trash", Icons.Default.Delete, onDelete, destructive = true)
        }
    }
}

@Composable
private fun DropdownAction(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    destructive: Boolean = false,
) {
    TextButton(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp),
    ) {
        Icon(icon, null, tint = if (destructive) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary)
        Text(
            label,
            modifier = Modifier.weight(1f).padding(start = 16.dp),
            color = if (destructive) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface,
        )
    }
}

@Composable
private fun UnlockDialog(
    onDismiss: () -> Unit,
    onUnlock: (String) -> Boolean,
) {
    var pin by remember { mutableStateOf("") }
    var incorrect by remember { mutableStateOf(false) }
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = { Icon(Icons.Default.Lock, null) },
        title = { Text("Unlock note") },
        text = {
            Column {
                Text("Enter your master PIN to decrypt this note on this device.")
                OutlinedTextField(
                    value = pin,
                    onValueChange = { pin = it; incorrect = false },
                    modifier = Modifier.fillMaxWidth().padding(top = 14.dp),
                    label = { Text("Master PIN") },
                    isError = incorrect,
                    supportingText = { if (incorrect) Text("That PIN is not correct.") },
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    singleLine = true,
                )
            }
        },
        confirmButton = {
            Button(onClick = { if (!onUnlock(pin)) incorrect = true }) { Text("Unlock") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}

@Composable
private fun NewFolderDialog(
    onDismiss: () -> Unit,
    onCreate: (String) -> Unit,
) {
    var name by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = { Icon(Icons.Default.CreateNewFolder, null) },
        title = { Text("New folder") },
        text = {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Folder name") },
                singleLine = true,
            )
        },
        confirmButton = {
            Button(onClick = { if (name.isNotBlank()) onCreate(name.trim()) }, enabled = name.isNotBlank()) {
                Text("Create")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}

@Composable
private fun SettingsDialog(
    settings: AppSettings,
    onDismiss: () -> Unit,
    onUpdate: (AppSettings) -> Unit,
    onImport: () -> Unit,
    onReset: () -> Unit,
) {
    var pin by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = { Icon(Icons.Default.Tune, null) },
        title = { Text("Settings") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text("Appearance", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    ThemeMode.entries.forEach { mode ->
                        FilterChip(
                            selected = settings.theme == mode,
                            onClick = { onUpdate(settings.copy(theme = mode)) },
                            label = { Text(mode.displayName()) },
                        )
                    }
                }
                Text("Editor size: ${settings.fontSize}sp")
                androidx.compose.material3.Slider(
                    value = settings.fontSize.toFloat(),
                    onValueChange = { onUpdate(settings.copy(fontSize = it.toInt())) },
                    valueRange = 12f..24f,
                    steps = 5,
                )
                OutlinedTextField(
                    value = pin,
                    onValueChange = { pin = it },
                    label = { Text("Master PIN") },
                    supportingText = { Text("Used to unlock encrypted notes. Default: 1234.") },
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    singleLine = true,
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    androidx.compose.material3.Switch(
                        checked = settings.haptics,
                        onCheckedChange = { onUpdate(settings.copy(haptics = it)) },
                    )
                    Text("Haptic feedback", modifier = Modifier.padding(start = 10.dp))
                }
                Divider()
                TextButton(onClick = onImport) {
                    Icon(Icons.Default.Unarchive, null)
                    Text("Import JSON backup", modifier = Modifier.padding(start = 10.dp))
                }
                TextButton(onClick = onReset) {
                    Icon(Icons.Default.Warning, null, tint = MaterialTheme.colorScheme.error)
                    Text("Restore sample notes", modifier = Modifier.padding(start = 10.dp), color = MaterialTheme.colorScheme.error)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (pin.isNotBlank()) onUpdate(settings.copy(masterPin = pin))
                    onDismiss()
                },
            ) { Text("Done") }
        },
    )
}

private fun ThemeMode.displayName() = when (this) {
    ThemeMode.MATERIAL_YOU -> "Material"
    ThemeMode.AMOLED -> "AMOLED"
    ThemeMode.SOLARIZED -> "Solarized"
    ThemeMode.SEPIA -> "Sepia"
    ThemeMode.LIGHT -> "Light"
}

private fun previewText(content: String): String =
    content.lines()
        .filterNot { it.trim().startsWith("#") || it.trim().startsWith("```") }
        .joinToString(" ")
        .replace(Regex("""[*_`>-]"""), "")
        .trim()
        .ifBlank { "Empty note" }

private fun relativeDate(timestamp: Long): String {
    val diff = System.currentTimeMillis() - timestamp
    return when {
        diff < 45_000 -> "Just now"
        diff < 3_600_000 -> "${diff / 60_000}m ago"
        diff < 86_400_000 -> "${diff / 3_600_000}h ago"
        diff < 604_800_000 -> "${diff / 86_400_000}d ago"
        else -> DateFormat.getDateInstance(DateFormat.MEDIUM).format(Date(timestamp))
    }
}

private fun shareNote(context: android.content.Context, note: Note) {
    context.startActivity(
        Intent.createChooser(
            Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TITLE, note.title)
                putExtra(Intent.EXTRA_TEXT, "${note.title}\n\n${note.content}")
            },
            "Share note",
        ),
    )
}
