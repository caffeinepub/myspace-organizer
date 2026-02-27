import React, { useState, useRef, useCallback } from 'react';
import { Pin, Archive, Trash2, MoreVertical, CheckSquare, Image } from 'lucide-react';
import type { Note } from '../../db/schema';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onClick: (note: Note) => void;
  onPin: (id: number) => void;
  onArchive: (id: number) => void;
  onTrash: (id: number) => void;
  showActions?: boolean;
}

export function NoteCard({ note, isSelected, onSelect, onClick, onPin, onArchive, onTrash, showActions = true }: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLongPress = useCallback(() => {
    if (note.id) onSelect(note.id);
  }, [note.id, onSelect]);

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(handleLongPress, 500);
  }, [handleLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const cardStyle: React.CSSProperties = {};
  if (note.color && note.color !== 'default') {
    cardStyle.backgroundColor = note.color;
  }

  const textColor = note.color && note.color !== 'default' ? '#1e293b' : undefined;

  return (
    <div
      className={`
        note-card relative group
        ${isSelected ? 'ring-2 ring-primary' : ''}
        ${note.color && note.color !== 'default' ? 'border-transparent' : 'bg-card'}
      `}
      style={cardStyle}
      onClick={() => onClick(note)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(note)}
      aria-label={`Note: ${note.title || 'Untitled'}${note.pinned ? ', pinned' : ''}`}
    >
      {/* Selection checkbox */}
      <div
        className={`
          absolute top-2 left-2 z-10 transition-opacity duration-150
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
        onClick={(e) => { e.stopPropagation(); if (note.id) onSelect(note.id); }}
      >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
          ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground bg-card/80'}`}
        >
          {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
        </div>
      </div>

      {/* Pin indicator */}
      {note.pinned && (
        <Pin className="absolute top-2 right-2 w-3 h-3 text-primary rotate-45" />
      )}

      {/* Note type icon */}
      {note.type === 'checklist' && (
        <CheckSquare className="w-3 h-3 text-muted-foreground mb-1" style={{ color: textColor }} />
      )}
      {note.type === 'image' && (
        <Image className="w-3 h-3 text-muted-foreground mb-1" style={{ color: textColor }} />
      )}

      {/* Title */}
      {note.title && (
        <h3 className="font-semibold text-sm mb-1 line-clamp-2" style={{ color: textColor }}>
          {note.title}
        </h3>
      )}

      {/* Content */}
      {note.type === 'text' && note.content && (
        <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed" style={{ color: textColor ? '#475569' : undefined }}>
          {note.content}
        </p>
      )}

      {/* Checklist preview */}
      {note.type === 'checklist' && note.checklistItems.length > 0 && (
        <div className="space-y-0.5">
          {note.checklistItems.slice(0, 4).map(item => (
            <div key={item.id} className="flex items-center gap-1.5 text-xs">
              <div className={`w-3 h-3 rounded border shrink-0 flex items-center justify-center
                ${item.checked ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
              >
                {item.checked && <span className="text-primary-foreground text-[8px]">✓</span>}
              </div>
              <span className={item.checked ? 'line-through text-muted-foreground' : ''} style={{ color: textColor ? '#475569' : undefined }}>
                {item.text}
              </span>
            </div>
          ))}
          {note.checklistItems.length > 4 && (
            <p className="text-xs text-muted-foreground">+{note.checklistItems.length - 4} more</p>
          )}
        </div>
      )}

      {/* Labels */}
      {note.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.labels.slice(0, 3).map(label => (
            <span key={label} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Hover actions */}
      {showActions && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); if (note.id) onPin(note.id); }}
            className="p-1 rounded-lg bg-card/80 hover:bg-card shadow-xs"
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (note.id) onArchive(note.id); }}
            className="p-1 rounded-lg bg-card/80 hover:bg-card shadow-xs"
            aria-label="Archive note"
          >
            <Archive className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (note.id) onTrash(note.id); }}
            className="p-1 rounded-lg bg-card/80 hover:bg-card shadow-xs"
            aria-label="Move to trash"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
