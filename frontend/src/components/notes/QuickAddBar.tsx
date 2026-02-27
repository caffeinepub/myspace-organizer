import React, { useState } from 'react';
import { Type, CheckSquare, Image, Plus } from 'lucide-react';
import type { Note } from '../../db/schema';

interface QuickAddBarProps {
  onAdd: (type: Note['type']) => void;
}

export function QuickAddBar({ onAdd }: QuickAddBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card mb-4">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full px-4 py-3 text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Take a note"
        >
          Take a note...
        </button>
      ) : (
        <div className="p-3">
          <p className="text-sm text-muted-foreground mb-3">Choose note type:</p>
          <div className="flex gap-2">
            <button
              onClick={() => { onAdd('text'); setExpanded(false); }}
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              aria-label="Create text note"
            >
              <Type className="w-5 h-5 text-primary" />
              <span className="text-xs">Text</span>
            </button>
            <button
              onClick={() => { onAdd('checklist'); setExpanded(false); }}
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              aria-label="Create checklist note"
            >
              <CheckSquare className="w-5 h-5 text-primary" />
              <span className="text-xs">Checklist</span>
            </button>
            <button
              onClick={() => { onAdd('image'); setExpanded(false); }}
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              aria-label="Create image note"
            >
              <Image className="w-5 h-5 text-primary" />
              <span className="text-xs">Image</span>
            </button>
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            aria-label="Cancel"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
