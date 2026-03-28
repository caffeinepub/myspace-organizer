import { format } from "date-fns";
import {
  Archive,
  FileDown,
  Mic,
  MicOff,
  Minus,
  Paperclip,
  Pin,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Note, NoteChecklistItem } from "../../db/schema";
import { useImageStorage } from "../../hooks/useImageStorage";
import { useLabels } from "../../hooks/useLabels";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { showErrorToast } from "../../store/toastStore";
import { compressImage, generateThumbnail } from "../../utils/imageCompression";
import { exportNoteAsDoc } from "../../utils/noteExport";
import { FilePreviewModal } from "../common/FilePreviewModal";
import type { AttachedFile } from "../common/FilePreviewModal";
import { ImageUploadPicker } from "../common/ImageUploadPicker";
import { Modal } from "../common/Modal";

// ── Note-attachment storage helpers (localStorage, separate from imageRefs) ──────
const NOTE_ATTACHMENTS_KEY = "noteAttachmentsById";

interface StoredAttachment {
  key: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  size: number;
}

function saveNoteAttachments(
  noteKey: string,
  attachments: StoredAttachment[],
): void {
  try {
    const store = JSON.parse(
      localStorage.getItem(NOTE_ATTACHMENTS_KEY) || "{}",
    );
    store[noteKey] = attachments;
    localStorage.setItem(NOTE_ATTACHMENTS_KEY, JSON.stringify(store));
  } catch {
    // ignore storage errors silently
  }
}

function loadNoteAttachments(noteKey: string): StoredAttachment[] {
  try {
    const store = JSON.parse(
      localStorage.getItem(NOTE_ATTACHMENTS_KEY) || "{}",
    );
    return store[noteKey] || [];
  } catch {
    return [];
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getNoteStorageKey(note: Note): string {
  return `note-attach-${note.id || Date.now()}`;
}

const NOTE_COLORS = [
  { label: "Default", value: "default" },
  { label: "Yellow", value: "#fff9c4" },
  { label: "Green", value: "#e8f5e9" },
  { label: "Blue", value: "#e3f2fd" },
  { label: "Pink", value: "#fce4ec" },
  { label: "Purple", value: "#f3e5f5" },
  { label: "Orange", value: "#fff3e0" },
  { label: "Teal", value: "#e0f2f1" },
  { label: "Red", value: "#ffebee" },
  { label: "Indigo", value: "#e8eaf6" },
  { label: "Brown", value: "#efebe9" },
  { label: "Gray", value: "#f5f5f5" },
];

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  onTrash: (id: number) => void;
  onArchive: (id: number) => void;
  onPin: (id: number) => void;
}

export function NoteModal({
  note,
  isOpen,
  onClose,
  onSave,
  onTrash,
  onArchive,
  onPin,
}: NoteModalProps) {
  const { labels } = useLabels();
  const { saveImage, getImageUrl } = useImageStorage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [checklistItems, setChecklistItems] = useState<NoteChecklistItem[]>([]);
  const [color, setColor] = useState("default");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [reminderAt, setReminderAt] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imgNaturalAspect, setImgNaturalAspect] = useState<number | null>(null);

  // ── Multi-file attachment state (additive — does not touch imageRefs or save logic) ──
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showAttachPicker, setShowAttachPicker] = useState(false);

  // File input refs for attachment upload
  const attachCameraRef = useRef<HTMLInputElement>(null);
  const attachGalleryRef = useRef<HTMLInputElement>(null);
  const attachFileRef = useRef<HTMLInputElement>(null);

  // Track which field is "active" for speech insertion: 'title' | 'content'
  const [activeField, setActiveField] = useState<"title" | "content">(
    "content",
  );
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Hidden file input refs for the three upload options
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ref for the upload trigger button (for picker positioning)
  const uploadTriggerRef = useRef<HTMLDivElement>(null);

  // Speech recognition
  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Track the last transcript length we've already appended, to avoid double-appending
  const lastTranscriptRef = useRef("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setChecklistItems(note.checklistItems);
      setColor(note.color || "default");
      setSelectedLabels(note.labels);
      setReminderAt(
        note.reminderAt
          ? format(new Date(note.reminderAt), "yyyy-MM-dd'T'HH:mm")
          : "",
      );
      setImgNaturalAspect(null);
      // Load image if image note
      if (note.type === "image" && note.imageRefs.length > 0) {
        getImageUrl(note.imageRefs[0], "full").then((url) => setImageUrl(url));
      } else {
        setImageUrl(null);
      }
      // Load multi-file attachments from localStorage
      const storageKey = getNoteStorageKey(note);
      const stored = loadNoteAttachments(storageKey);
      const converted: AttachedFile[] = stored.map((a) => ({
        key: a.key,
        name: a.name,
        mimeType: a.mimeType,
        url: a.dataUrl,
        size: a.size,
      }));
      setAttachedFiles(converted);
    }
  }, [note, getImageUrl]);

  // When modal closes/opens, stop listening and reset
  useEffect(() => {
    if (!isOpen) {
      if (isListening) stopListening();
      resetTranscript();
      lastTranscriptRef.current = "";
      setShowImagePicker(false);
      setShowAttachPicker(false);
      setShowFilePreview(false);
      setPreviewFile(null);
    }
  }, [isOpen, isListening, stopListening, resetTranscript]);

  // Append new transcript text to the active field
  useEffect(() => {
    if (!transcript) return;
    const newPart = transcript.slice(lastTranscriptRef.current.length);
    if (!newPart) return;
    lastTranscriptRef.current = transcript;

    if (activeField === "title") {
      setTitle((prev) => {
        const sep = prev && !prev.endsWith(" ") ? " " : "";
        return prev + sep + newPart.trim();
      });
    } else {
      setContent((prev) => {
        const sep =
          prev && !prev.endsWith(" ") && !prev.endsWith("\n") ? " " : "";
        return prev + sep + newPart.trim();
      });
    }
  }, [transcript, activeField]);

  const handleMicToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      lastTranscriptRef.current = "";
      startListening();
    }
  }, [isListening, startListening, stopListening, resetTranscript]);

  // ── Multi-file attachment handlers (additive) ────────────────────────────────
  const handleAttachFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !note) return;
      const newAttachments: StoredAttachment[] = [];
      const newDisplayFiles: AttachedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const dataUrl = await fileToDataUrl(file);
          const key = `note-att-${note.id || Date.now()}-${Date.now()}-${i}`;
          const stored: StoredAttachment = {
            key,
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            dataUrl,
            size: file.size,
          };
          newAttachments.push(stored);
          newDisplayFiles.push({
            key,
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            url: dataUrl,
            size: file.size,
          });
        } catch {
          showErrorToast(`Failed to attach file: ${file.name}`);
        }
      }
      if (newAttachments.length > 0) {
        setAttachedFiles((prev) => {
          const merged = [...prev, ...newDisplayFiles];
          // Persist to localStorage under note's storage key
          const storageKey = getNoteStorageKey(note);
          const allStored = loadNoteAttachments(storageKey);
          saveNoteAttachments(storageKey, [...allStored, ...newAttachments]);
          return merged;
        });
      }
    },
    [note],
  );

  const handleRemoveAttachment = useCallback(
    (key: string) => {
      if (!note) return;
      setAttachedFiles((prev) => {
        const updated = prev.filter((f) => f.key !== key);
        const storageKey = getNoteStorageKey(note);
        const allStored = loadNoteAttachments(storageKey).filter(
          (s) => s.key !== key,
        );
        saveNoteAttachments(storageKey, allStored);
        return updated;
      });
    },
    [note],
  );

  const handleOpenPreview = useCallback((file: AttachedFile) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  }, []);

  const handleAttachCameraChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await handleAttachFiles(e.target.files);
      e.target.value = "";
    },
    [handleAttachFiles],
  );

  const handleAttachGalleryChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await handleAttachFiles(e.target.files);
      e.target.value = "";
    },
    [handleAttachFiles],
  );

  const handleAttachFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await handleAttachFiles(e.target.files);
      e.target.value = "";
    },
    [handleAttachFiles],
  );

  const handleSave = useCallback(() => {
    if (!note) return;
    if (isListening) stopListening();
    const updated: Note = {
      ...note,
      title,
      content,
      checklistItems,
      color,
      labels: selectedLabels,
      reminderAt: reminderAt ? new Date(reminderAt).getTime() : null,
    };
    onSave(updated);
    onClose();
  }, [
    note,
    title,
    content,
    checklistItems,
    color,
    selectedLabels,
    reminderAt,
    onSave,
    onClose,
    isListening,
    stopListening,
  ]);

  const handleExportDoc = useCallback(() => {
    if (!note) return;
    const current: Note = {
      ...note,
      title,
      content,
      checklistItems,
      color,
      labels: selectedLabels,
      reminderAt: reminderAt ? new Date(reminderAt).getTime() : null,
    };
    exportNoteAsDoc(current);
  }, [note, title, content, checklistItems, color, selectedLabels, reminderAt]);

  const addCheckItem = useCallback(() => {
    if (!newCheckItem.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        text: newCheckItem.trim(),
        checked: false,
      },
    ]);
    setNewCheckItem("");
  }, [newCheckItem]);

  const toggleCheckItem = useCallback((id: string) => {
    setChecklistItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    );
  }, []);

  const removeCheckItem = useCallback((id: string) => {
    setChecklistItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !note) return;
      // Reset input value so the same file can be re-selected
      e.target.value = "";
      try {
        const [compressed, thumbnail] = await Promise.all([
          compressImage(file),
          generateThumbnail(file),
        ]);
        const key = `note-${note.id || Date.now()}`;
        await saveImage(key, compressed, "full");
        await saveImage(key, thumbnail, "thumbnail");
        const url = URL.createObjectURL(compressed);
        setImageUrl(url);
        setImgNaturalAspect(null);
        // Update imageRefs
        const updated: Note = {
          ...note,
          title,
          content,
          checklistItems,
          color,
          labels: selectedLabels,
          imageRefs: [key],
        };
        onSave(updated);
      } catch {
        showErrorToast("Failed to upload image");
      }
    },
    [
      note,
      title,
      content,
      checklistItems,
      color,
      selectedLabels,
      saveImage,
      onSave,
    ],
  );

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setImgNaturalAspect(img.naturalWidth / img.naturalHeight);
    }
  };

  if (!note) return null;

  const bgStyle: React.CSSProperties =
    color !== "default" ? { backgroundColor: color } : {};

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleSave} size="2xl" showClose={false}>
        {/* Outer wrapper fills the modal padding area and applies note color */}
        <div style={bgStyle} className="bg-card rounded-xl -m-4">
          {/* Sticky header toolbar — z-30 ensures it always renders above image content on mobile */}
          <div
            className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-y-2 px-4 pt-4 pb-3 rounded-t-xl bg-card backdrop-blur-sm shadow-sm min-h-[52px]"
            style={bgStyle}
          >
            {/* Left group: Pin, Color, Label, Archive, Export — wraps on narrow screens */}
            <div className="flex flex-shrink-0 flex-wrap items-center gap-1 min-w-0">
              <button
                type="button"
                onClick={() => {
                  if (note.id) onPin(note.id);
                }}
                className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${note.pinned ? "text-primary" : "text-muted-foreground"}`}
                aria-label={note.pinned ? "Unpin note" : "Pin note"}
              >
                <Pin className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground"
                aria-label="Change note color"
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-current"
                  style={{
                    backgroundColor: color !== "default" ? color : undefined,
                  }}
                />
              </button>
              <button
                type="button"
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground text-xs font-medium"
                aria-label="Manage labels"
              >
                🏷️
              </button>
              <button
                type="button"
                onClick={() => {
                  if (note.id) onArchive(note.id);
                  onClose();
                }}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground"
                aria-label="Archive note"
              >
                <Archive className="w-4 h-4" />
              </button>
              {/* Export as Document button */}
              <button
                type="button"
                onClick={handleExportDoc}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground"
                aria-label="Export note as document"
                title="Export as .DOC"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
            {/* Right group: Trash + Done — always flex-shrink-0 so they never disappear */}
            <div className="flex flex-shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (note.id) onTrash(note.id);
                  onClose();
                }}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground"
                aria-label="Move to trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                aria-label="Save and close note"
              >
                Done
              </button>
            </div>
          </div>

          {/* Scrollable content body */}
          <div className="px-5 pb-6 flex flex-col gap-3">
            {/* Color picker */}
            {showColorPicker && (
              <div className="flex flex-wrap gap-2 p-2 bg-card/80 rounded-lg">
                {NOTE_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => {
                      setColor(c.value);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110
                    ${color === c.value ? "border-primary scale-110" : "border-border"}`}
                    style={{
                      backgroundColor:
                        c.value === "default" ? undefined : c.value,
                    }}
                    aria-label={`Set color to ${c.label}`}
                    title={c.label}
                  >
                    {c.value === "default" && (
                      <X className="w-3 h-3 mx-auto text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Label picker */}
            {showLabelPicker && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-card/80 rounded-lg">
                {labels.map((label) => (
                  <button
                    type="button"
                    key={label.id}
                    onClick={() => {
                      setSelectedLabels((prev) =>
                        prev.includes(label.name)
                          ? prev.filter((l) => l !== label.name)
                          : [...prev, label.name],
                      );
                    }}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors
                    ${
                      selectedLabels.includes(label.name)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    }`}
                    aria-label={`${selectedLabels.includes(label.name) ? "Remove" : "Add"} label ${label.name}`}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            )}

            {/* Title */}
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setActiveField("title")}
              placeholder="Title"
              className="w-full bg-transparent text-lg font-semibold placeholder:text-muted-foreground/60 outline-none"
              aria-label="Note title"
            />

            {/* Content based on type */}
            {note.type === "text" && (
              <div className="relative">
                <textarea
                  ref={contentRef}
                  value={
                    content +
                    (isListening && interimTranscript ? interimTranscript : "")
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (
                      isListening &&
                      interimTranscript &&
                      val.endsWith(interimTranscript)
                    ) {
                      setContent(
                        val.slice(0, val.length - interimTranscript.length),
                      );
                    } else {
                      setContent(val);
                    }
                  }}
                  onFocus={() => setActiveField("content")}
                  placeholder="Take a note..."
                  className="w-full bg-transparent text-base placeholder:text-muted-foreground/60 outline-none resize-none min-h-[260px] pr-8"
                  aria-label="Note content"
                />
                {/* Mic button — bottom-right of textarea */}
                <div className="absolute bottom-1 right-0 flex items-center">
                  {!speechSupported ? (
                    <span className="text-[10px] text-muted-foreground italic">
                      Speech not supported
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMicToggle}
                      className={`p-1 rounded-lg transition-colors ${
                        isListening
                          ? "text-destructive hover:bg-destructive/10 animate-pulse"
                          : "text-muted-foreground hover:bg-black/10"
                      }`}
                      aria-label={
                        isListening
                          ? "Stop speech recognition"
                          : "Start speech recognition"
                      }
                      title={isListening ? "Stop dictation" : "Dictate note"}
                    >
                      {isListening ? (
                        <MicOff className="w-3.5 h-3.5" />
                      ) : (
                        <Mic className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Speech status / error for text notes */}
            {note.type === "text" && (
              <>
                {isListening && (
                  <p className="text-[10px] text-primary flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    Listening…
                    {interimTranscript ? ` "${interimTranscript}"` : ""}
                  </p>
                )}
                {speechError && (
                  <p className="text-[10px] text-destructive">{speechError}</p>
                )}
              </>
            )}

            {note.type === "checklist" && (
              <div className="space-y-2">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCheckItem(item.id)}
                      className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors
                      ${item.checked ? "bg-primary border-primary" : "border-muted-foreground"}`}
                      aria-label={`${item.checked ? "Uncheck" : "Check"} item: ${item.text}`}
                    >
                      {item.checked && (
                        <span className="text-primary-foreground text-[8px]">
                          ✓
                        </span>
                      )}
                    </button>
                    <input
                      value={item.text}
                      onChange={(e) =>
                        setChecklistItems((prev) =>
                          prev.map((i) =>
                            i.id === item.id
                              ? { ...i, text: e.target.value }
                              : i,
                          ),
                        )
                      }
                      className={`flex-1 bg-transparent text-sm outline-none ${item.checked ? "line-through text-muted-foreground" : ""}`}
                      aria-label={`Checklist item: ${item.text}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeCheckItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remove item: ${item.text}`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCheckItem()}
                    placeholder="List item"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    aria-label="Add new checklist item"
                  />
                  {newCheckItem && (
                    <button
                      type="button"
                      onClick={addCheckItem}
                      className="text-primary text-xs"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            )}

            {note.type === "image" && (
              <div className="space-y-3">
                {/* Hidden file inputs for the three upload options */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                  aria-label="Capture image with camera"
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  aria-label="Select image from gallery"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  aria-label="Upload image file"
                />

                {/* Image display — natural aspect ratio */}
                {imageUrl ? (
                  <div className="relative w-full">
                    <img
                      src={imageUrl}
                      alt={title || "Note image"}
                      onLoad={handleImageLoad}
                      className="w-full h-auto rounded-xl block"
                      style={
                        imgNaturalAspect
                          ? { aspectRatio: String(imgNaturalAspect) }
                          : undefined
                      }
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-muted/30 rounded-xl border-2 border-dashed border-border/50">
                    <span className="text-sm text-muted-foreground">
                      No image attached
                    </span>
                  </div>
                )}

                {/* Upload picker trigger */}
                <div ref={uploadTriggerRef} className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowImagePicker((v) => !v)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                    aria-label="Change image"
                  >
                    {imageUrl ? "Change image" : "Add image"}
                  </button>
                  {showImagePicker && (
                    <ImageUploadPicker
                      isOpen={showImagePicker}
                      onClose={() => setShowImagePicker(false)}
                      onCameraClick={() => {
                        setShowImagePicker(false);
                        cameraInputRef.current?.click();
                      }}
                      onGalleryClick={() => {
                        setShowImagePicker(false);
                        galleryInputRef.current?.click();
                      }}
                      onFileClick={() => {
                        setShowImagePicker(false);
                        fileInputRef.current?.click();
                      }}
                    />
                  )}
                </div>

                {/* Optional caption */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full bg-transparent text-sm placeholder:text-muted-foreground/60 outline-none resize-none min-h-[60px]"
                  aria-label="Image caption"
                />
              </div>
            )}

            {/* ── Multi-file attachments section (additive) ──────────────────── */}
            {/* Hidden file inputs */}
            <input
              ref={attachCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleAttachCameraChange}
              aria-label="Capture photo with camera for attachment"
            />
            <input
              ref={attachGalleryRef}
              type="file"
              accept="*/*"
              multiple
              className="hidden"
              onChange={handleAttachGalleryChange}
              aria-label="Select files from gallery for attachment"
            />
            <input
              ref={attachFileRef}
              type="file"
              accept="*/*"
              multiple
              className="hidden"
              onChange={handleAttachFileChange}
              aria-label="Upload documents or files for attachment"
            />

            {/* Attachment list */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                  Attachments ({attachedFiles.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((af) => {
                    const isImg = af.mimeType.startsWith("image/");
                    const isVid = af.mimeType.startsWith("video/");
                    return (
                      <div
                        key={af.key}
                        className="relative group rounded-lg overflow-hidden border border-border/50 bg-muted/20"
                        style={{ maxWidth: isImg ? 120 : undefined }}
                      >
                        {isImg ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(af)}
                            className="block w-full"
                            aria-label={`Preview ${af.name}`}
                            title={af.name}
                          >
                            <img
                              src={af.url}
                              alt={af.name}
                              className="w-full h-auto block"
                              style={{ maxHeight: 100, objectFit: "contain" }}
                            />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(af)}
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-muted transition-colors w-full text-left"
                            aria-label={`Preview or download ${af.name}`}
                            title={af.name}
                          >
                            <span className="text-base leading-none shrink-0">
                              {isVid
                                ? "🎬"
                                : af.mimeType === "application/pdf"
                                  ? "📄"
                                  : "📎"}
                            </span>
                            <span className="truncate max-w-[120px]">
                              {af.name}
                            </span>
                          </button>
                        )}
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(af.key)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-destructive"
                          aria-label={`Remove attachment ${af.name}`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add attachment button + inline picker (no absolute positioning) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAttachPicker((v) => !v)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                aria-label="Add attachment"
                aria-expanded={showAttachPicker}
                data-ocid="notes.upload_button"
              >
                <Paperclip className="w-3.5 h-3.5" />
                Add Attachment
              </button>
              {showAttachPicker && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachPicker(false);
                      attachCameraRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                    aria-label="Open camera"
                  >
                    <span>📷</span> Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachPicker(false);
                      attachGalleryRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                    aria-label="Select from gallery"
                  >
                    <span>🖼</span> Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachPicker(false);
                      attachFileRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                    aria-label="Upload files"
                  >
                    <span>📁</span> Files
                  </button>
                </>
              )}
            </div>

            {/* Selected labels display */}
            {selectedLabels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedLabels.map((label) => (
                  <span
                    key={label}
                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Reminder */}
            <div className="flex items-center gap-2">
              <label
                className="text-xs text-muted-foreground shrink-0"
                htmlFor="note-reminder"
              >
                Reminder
              </label>
              <input
                id="note-reminder"
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className="flex-1 bg-transparent text-xs outline-none border border-border/50 rounded-lg px-2 py-1 focus:border-primary transition-colors"
                aria-label="Set reminder"
              />
              {reminderAt && (
                <button
                  type="button"
                  onClick={() => setReminderAt("")}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Clear reminder"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Timestamps */}
            {note.id && (
              <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground/60 pt-1 border-t border-border/20">
                {note.createdAt && (
                  <span>
                    Created: {new Date(note.createdAt).toLocaleString()}
                  </span>
                )}
                {note.updatedAt && (
                  <span>
                    Updated: {new Date(note.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* File preview modal — fullscreen, outside the note modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={showFilePreview}
        onClose={() => {
          setShowFilePreview(false);
          setPreviewFile(null);
        }}
      />
    </>
  );
}
