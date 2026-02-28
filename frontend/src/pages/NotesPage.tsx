import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Archive, Trash2, Tag, X, Download, Upload, FileText, FileJson, FileType } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { useLabels } from '../hooks/useLabels';
import { NoteCard } from '../components/notes/NoteCard';
import { NoteModal } from '../components/notes/NoteModal';
import { QuickAddBar } from '../components/notes/QuickAddBar';
import { MultiSelectToolbar } from '../components/notes/MultiSelectToolbar';
import { LabelManager } from '../components/notes/LabelManager';
import type { Note } from '../db/schema';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { db } from '../db/db';
import {
  exportAllNotesAsTxt,
  exportAllNotesAsDoc,
  exportAllNotesAsJson,
} from '../utils/noteExport';
import { importNotesFromFile } from '../utils/noteImport';
import { showSuccessToast, showErrorToast } from '../store/toastStore';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface NotesPageProps {
  initialQuickAdd?: boolean;
  onQuickAddHandled?: () => void;
}

export function NotesPage({ initialQuickAdd, onQuickAddHandled }: NotesPageProps) {
  const {
    notes, allNotes, loading, search, setSearch, labelFilter, setLabelFilter,
    view, setView, selectedIds, toggleSelect, clearSelection,
    createNote, updateNote, trashNote, archiveNote, togglePin, bulkAction, restoreNote, deleteNote,
    reload,
  } = useNotes();
  const { labels, reload: reloadLabels } = useLabels();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Handle quick add triggered from home page
  useEffect(() => {
    if (initialQuickAdd) {
      handleQuickAdd('text');
      onQuickAddHandled?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuickAdd]);

  const handleQuickAdd = useCallback(async (type: Note['type']) => {
    const id = await createNote({
      type,
      title: '',
      content: '',
      checklistItems: [],
      imageRefs: [],
      color: 'default',
      labels: [],
      pinned: false,
      archived: false,
      trashed: false,
      reminderAt: null,
    });
    if (id) {
      setTimeout(async () => {
        const note = await db.notes.get(id);
        if (note) setSelectedNote(note);
      }, 100);
    }
  }, [createNote]);

  const handleNoteClick = useCallback((note: Note) => {
    if (selectedIds.size > 0) {
      if (note.id) toggleSelect(note.id);
    } else {
      setSelectedNote(note);
    }
  }, [selectedIds.size, toggleSelect]);

  const handleSaveNote = useCallback(async (note: Note) => {
    await updateNote(note);
    setSelectedNote(null);
  }, [updateNote]);

  const handleLabelsChanged = useCallback(
    (change?: { type: 'rename'; oldName: string; newName: string }) => {
      reloadLabels();
      if (change?.type === 'rename' && labelFilter === change.oldName) {
        setLabelFilter(change.newName);
      }
    },
    [reloadLabels, labelFilter, setLabelFilter]
  );

  // ---- Export All ----
  const handleExportAll = useCallback((format: 'txt' | 'doc' | 'json') => {
    try {
      if (format === 'txt') exportAllNotesAsTxt(allNotes);
      else if (format === 'doc') exportAllNotesAsDoc(allNotes);
      else exportAllNotesAsJson(allNotes);
      showSuccessToast(`Exported ${allNotes.length} note(s) as ${format.toUpperCase()}`);
    } catch {
      showErrorToast('Export failed. Please try again.');
    }
  }, [allNotes]);

  // ---- Import ----
  const handleImportClick = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-imported
    e.target.value = '';
    const result = await importNotesFromFile(file, allNotes);
    if (result.error) {
      showErrorToast(`Import failed: ${result.error}`);
    } else {
      showSuccessToast(`Imported ${result.count} note(s) successfully`);
      reload();
    }
  }, [allNotes, reload]);

  if (loading) return <LoadingSpinner />;

  const isMultiSelect = selectedIds.size > 0;
  const selectedNotes = allNotes.filter(n => n.id !== undefined && selectedIds.has(n.id as number));

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {isMultiSelect && (
        <MultiSelectToolbar
          count={selectedIds.size}
          selectedNotes={selectedNotes}
          onArchive={() => bulkAction('archive', Array.from(selectedIds))}
          onTrash={() => bulkAction('trash', Array.from(selectedIds))}
          onDelete={() => bulkAction('delete', Array.from(selectedIds))}
          onClear={clearSelection}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Notes</h1>
        <div className="flex items-center gap-1">
          {/* Import */}
          <button
            onClick={handleImportClick}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Import notes"
            title="Import Notes"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json,.txt,.doc,.docx"
            className="hidden"
            onChange={handleImportFile}
          />

          {/* Export All */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Export all notes"
                title="Export All Notes"
              >
                <Download className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export All Notes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExportAll('txt')}>
                <FileText className="w-4 h-4 mr-2" /> Export as TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll('doc')}>
                <FileType className="w-4 h-4 mr-2" /> Export as WORD (DOC)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll('json')}>
                <FileJson className="w-4 h-4 mr-2" /> Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Label manager */}
          <button
            onClick={() => setShowLabelManager(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Manage labels"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-3">
        {([
          { id: 'all', label: 'Notes', icon: null },
          { id: 'archive', label: 'Archive', icon: Archive },
          { id: 'trash', label: 'Trash', icon: Trash2 },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
              ${view === id ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label={`${label} view`}
            aria-current={view === id ? 'page' : undefined}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-9 pr-4 py-2 bg-muted/50 rounded-xl text-sm outline-none border border-border/50 focus:border-primary transition-colors"
          aria-label="Search notes"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Label filter */}
      {labels.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
          <button
            onClick={() => setLabelFilter('')}
            className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors
              ${!labelFilter ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
            aria-label="Show all notes"
          >
            All
          </button>
          {labels.map(label => (
            <button
              key={label.id}
              onClick={() => setLabelFilter(labelFilter === label.name ? '' : label.name)}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors
                ${labelFilter === label.name ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
              aria-label={`Filter by label ${label.name}`}
            >
              {label.name}
            </button>
          ))}
        </div>
      )}

      {/* Quick add bar - only in main view */}
      {view === 'all' && <QuickAddBar onAdd={handleQuickAdd} />}

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <img
            src="/assets/generated/notes-empty.dim_400x300.png"
            alt="No notes"
            className="w-48 mx-auto mb-4 opacity-60"
          />
          <p className="text-muted-foreground text-sm">
            {view === 'all' ? 'No notes yet. Take your first note!' :
             view === 'archive' ? 'No archived notes' : 'Trash is empty'}
          </p>
        </div>
      ) : (
        <div className="masonry-grid masonry-grid-2 md:masonry-grid-3">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={note.id ? selectedIds.has(note.id) : false}
              onSelect={toggleSelect}
              onClick={handleNoteClick}
              onPin={togglePin}
              onArchive={view === 'trash' ? restoreNote : view === 'archive' ? restoreNote : archiveNote}
              onTrash={view === 'trash' ? deleteNote : trashNote}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Note modal */}
      <NoteModal
        note={selectedNote}
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        onSave={handleSaveNote}
        onTrash={(id) => { trashNote(id); setSelectedNote(null); }}
        onArchive={(id) => { archiveNote(id); setSelectedNote(null); }}
        onPin={togglePin}
      />

      {/* Label manager modal */}
      <LabelManager
        isOpen={showLabelManager}
        onClose={() => setShowLabelManager(false)}
        onLabelsChanged={handleLabelsChanged}
      />
    </div>
  );
}
