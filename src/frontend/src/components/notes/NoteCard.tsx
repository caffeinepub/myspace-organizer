import { Archive, Pin, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { db } from "../../db/db";
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
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (note.type === "image" && note.imageRefs && note.imageRefs.length > 0) {
      db.imageBlobs.toArray().then((blobs) => {
        const rec = blobs.find(
          (b) => b.key === note.imageRefs[0] && b.type === "thumbnail",
        );
        if (rec) {
          objectUrl = URL.createObjectURL(rec.blob);
          setThumbUrl(objectUrl);
        }
      });
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [note.type, note.imageRefs]);

  const handleCardClick = () => {
    onClick(note);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.id) onPin(note.id);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.id) onArchive(note.id);
  };

  const handleTrash = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const displayImage = thumbUrl || imageUrl;

  return (
    // biome-ignore lint/a11y/useSemanticElements: note card uses div to allow nested interactive elements (menu, checkbox) which are invalid inside <button>
    <div
      role="button"
      className={`note-card relative rounded-xl border cursor-pointer transition-all duration-150 group
        ${isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"}
        ${note.pinned ? "shadow-md" : ""}
      `}
      onClick={handleCardClick}
      style={{
        background:
          note.color && note.color !== "default" ? note.color : "var(--card)",
      }}
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
        <div className="absolute top-2 right-2 z-10">
          <Pin className="w-3 h-3 text-primary fill-primary" />
        </div>
      )}

      {/* Image — compact thumbnail height for summary card */}
      {displayImage && (
        <div className="w-full h-32 overflow-hidden rounded-t-xl bg-muted/30">
          <img
            src={displayImage}
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

        {/* Content summary — max 3 lines */}
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

          {/* Inline action buttons — always visible */}
          {showActions && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                className="w-6 h-6 flex items-center justify-center rounded opacity-70 hover:opacity-100 hover:bg-muted transition-all"
                onClick={handlePin}
                aria-label={note.pinned ? "Unpin note" : "Pin note"}
                title={note.pinned ? "Unpin" : "Pin"}
              >
                <Pin
                  className={`w-3.5 h-3.5 ${
                    note.pinned
                      ? "text-primary fill-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
              <button
                type="button"
                className="w-6 h-6 flex items-center justify-center rounded opacity-70 hover:opacity-100 hover:bg-muted transition-all"
                onClick={handleArchive}
                aria-label={note.archived ? "Unarchive note" : "Archive note"}
                title={note.archived ? "Unarchive" : "Archive"}
              >
                <Archive className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button
                type="button"
                className="w-6 h-6 flex items-center justify-center rounded opacity-70 hover:opacity-100 hover:bg-muted transition-all"
                onClick={handleTrash}
                aria-label={
                  note.trashed
                    ? "Delete note permanently"
                    : "Move note to trash"
                }
                title={note.trashed ? "Delete" : "Trash"}
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
