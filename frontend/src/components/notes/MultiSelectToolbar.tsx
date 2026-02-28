import React from 'react';
import { Archive, Trash2, X, Download, FileText, FileJson, FileType } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { Note } from '../../db/schema';
import {
  exportSelectedNotesAsTxt,
  exportSelectedNotesAsDoc,
  exportSelectedNotesAsJson,
} from '../../utils/noteExport';
import { showSuccessToast, showErrorToast } from '../../store/toastStore';

interface MultiSelectToolbarProps {
  count: number;
  selectedNotes: Note[];
  onArchive: () => void;
  onTrash: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function MultiSelectToolbar({ count, selectedNotes, onArchive, onTrash, onDelete, onClear }: MultiSelectToolbarProps) {
  const handleExportSelected = (format: 'txt' | 'doc' | 'json') => {
    try {
      if (format === 'txt') exportSelectedNotesAsTxt(selectedNotes);
      else if (format === 'doc') exportSelectedNotesAsDoc(selectedNotes);
      else exportSelectedNotesAsJson(selectedNotes);
      showSuccessToast(`Exported ${selectedNotes.length} note(s) as ${format.toUpperCase()}`);
    } catch {
      showErrorToast('Export failed. Please try again.');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-card animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
        <button onClick={onClear} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Clear selection">
          <X className="w-4 h-4" />
        </button>
        <span className="font-medium text-sm flex-1">{count} selected</span>
        <button
          onClick={onArchive}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm"
          aria-label="Archive selected notes"
        >
          <Archive className="w-4 h-4" />
          Archive
        </button>
        <button
          onClick={onTrash}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm"
          aria-label="Move selected notes to trash"
        >
          <Trash2 className="w-4 h-4" />
          Trash
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm"
              aria-label="Export selected notes"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Selected</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExportSelected('txt')}>
              <FileText className="w-4 h-4 mr-2" /> Export as TXT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportSelected('doc')}>
              <FileType className="w-4 h-4 mr-2" /> Export as WORD (DOC)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportSelected('json')}>
              <FileJson className="w-4 h-4 mr-2" /> Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
