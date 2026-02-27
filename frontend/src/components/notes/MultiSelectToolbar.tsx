import React from 'react';
import { Archive, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MultiSelectToolbarProps {
  count: number;
  onArchive: () => void;
  onTrash: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function MultiSelectToolbar({ count, onArchive, onTrash, onDelete, onClear }: MultiSelectToolbarProps) {
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
      </div>
    </div>
  );
}
