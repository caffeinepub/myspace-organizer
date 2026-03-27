import { Archive, MoreVertical, Pin, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { Note } from "../../db/schema";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onClick: (note: Note) => void;
  onPin: (id: number) => void;
  onArchive: (id: number) => void;
  onTrash: (id: number) => void;
  showActions?: boolean;
  imageUrl?: string | null;
}

export function NoteCard({
  note,
  isSelected,
  onSelect,
  onClick,
  onPin,
  onArchive,
  onTrash,
  showActions = true,
  imageUrl,
}: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCardClick = () => {
    onClick(note);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (note.id) onPin(note.id);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (note.id) onArchive(note.id);
  };

  const handleTrash = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (note.id) onTrash(note.id);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.id) onSelect(note.id);
  };

  const renderContent = () => {
    if (
      note.type === "checklist" &&
      note.checklistItems &&
      note.checklistItems.length > 0
    ) {
      return (
        <ul className="space-y-1 mt-1">
          {note.checklistItems.slice(0, 3).map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className={`w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center ${
                  item.checked
                    ? "bg-primary border-primary"
                    : "border-muted-foreground"
                }`}
              >
                {item.checked && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    aria-hidden="true"
                  >
                    <title>Checked</title>
                    <path
                      d="M1 4l2 2 4-4"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className={item.checked ? "line-through opacity-60" : ""}>
                {item.text}
              </span>
            </li>
          ))}
          {note.checklistItems.length > 3 && (
            <li className="text-xs text-muted-foreground/60 pl-4">
              +{note.checklistItems.length - 3} more…
            </li>
          )}
        </ul>
      );
    }

    if (note.content) {
      return (
        <p className="text-xs text-muted-foreground line-clamp-3 break-words">
          {note.content}
        </p>
      );
    }

    return null;
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: note card uses div to allow nested interactive elements (menu, checkbox) which are invalid inside <button>
    <div
      role="button"
      className={`note-card relative rounded-xl border cursor-pointer transition-all duration-150 group
        ${isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"}
        ${note.pinned ? "shadow-md" : ""}
      `}
      onClick={handleCardClick}
      style={{ background: "var(--card)" }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick(note);
      }}
      aria-label={`Note: ${note.title || "Untitled"}${note.pinned ? ", pinned" : ""}`}
    >
      {/* Selection checkbox */}
      <div
        className={`absolute top-2 left-2 z-10 transition-opacity duration-150
          ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        onClick={handleSelect}
        onKeyDown={(e) =>
          e.key === "Enter" && handleSelect(e as unknown as React.MouseEvent)
        }
      >
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
            ${isSelected ? "bg-primary border-primary" : "border-muted-foreground bg-card/80"}`}
        >
          {isSelected && (
            <span className="text-primary-foreground text-xs">✓</span>
          )}
        </div>
      </div>

      {/* Pin indicator */}
      {note.pinned && (
        <div className="absolute top-2 right-8 z-10">
          <Pin className="w-3 h-3 text-primary fill-primary" />
        </div>
      )}

      {/* Image — compact thumbnail height for summary card */}
      {imageUrl && (
        <div className="w-full h-32 overflow-hidden rounded-t-xl bg-muted/30">
          <img
            src={imageUrl}
            alt={note.title || "Note image"}
            className="w-full h-full object-cover block"
            loading="lazy"
          />
        </div>
      )}

      {/* Card body */}
      <div className="p-3">
        {note.title && (
          <h3 className="font-semibold text-sm text-foreground mb-1 break-words">
            {note.title}
          </h3>
        )}

        {/* Full content — no line-clamp, fully expanded */}
        {renderContent()}

        {/* Labels */}
        {note.labels && note.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.labels.slice(0, 3).map((label) => (
              <span
                key={label}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-muted-foreground opacity-60">
            {note.updatedAt
              ? new Date(note.updatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </span>

          {/* Context menu */}
          {showActions && (
            <div className="relative">
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                onClick={handleMenuToggle}
                aria-label="Note actions"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop — dismiss on click; keyboard users use Escape via parent handler */}
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                    onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
                  />
                  <div
                    className="absolute right-0 bottom-full mb-1 z-30 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[130px]"
                    role="menu"
                  >
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors text-left"
                      onClick={handlePin}
                      role="menuitem"
                    >
                      <Pin className="w-3 h-3" />
                      {note.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors text-left"
                      onClick={handleArchive}
                      role="menuitem"
                    >
                      <Archive className="w-3 h-3" />
                      {note.archived ? "Unarchive" : "Archive"}
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted transition-colors text-left text-destructive"
                      onClick={handleTrash}
                      role="menuitem"
                    >
                      <Trash2 className="w-3 h-3" />
                      {note.trashed ? "Delete" : "Trash"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
