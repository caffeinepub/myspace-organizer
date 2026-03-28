import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Edit2,
  FileDown,
  FileJson,
  FileText,
  FileType,
  Mic,
  MicOff,
  Paperclip,
  Pin,
  Plus,
  Search,
  Star,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FilePreviewModal } from "../components/common/FilePreviewModal";
import type { AttachedFile } from "../components/common/FilePreviewModal";
import type { Record as DbRecord } from "../db/schema";
import { getRecordImage } from "../hooks/useRecordImages";
import { useRecords } from "../hooks/useRecords";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { showErrorToast, showSuccessToast } from "../store/toastStore";
import { formatDateTime } from "../utils/dateFormatter";
import {
  exportRecordsAsDoc,
  exportRecordsAsJson,
  exportRecordsAsTxt,
} from "../utils/recordExport";

// ── Import helper ──────────────────────────────────────────────────────────────
async function importRecordsFromFile(
  file: File,
  addRecord: (title: string, content: string) => Promise<void>,
): Promise<number> {
  const text = await file.text();
  let count = 0;
  if (file.name.endsWith(".json")) {
    try {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : (data.records ?? []);
      for (const r of arr) {
        const title = (r.title as string) ?? "Imported Record";
        const content = (r.content as string) ?? (r.body as string) ?? "";
        await addRecord(title, content);
        count++;
      }
    } catch {
      throw new Error("Invalid JSON file");
    }
  } else {
    const blocks = text.split(/\n---+\n|\n\n/).filter((b) => b.trim());
    for (const block of blocks) {
      const lines = block.trim().split("\n");
      const title = lines[0].replace(/^#+\s*/, "").trim() || "Imported Record";
      const content = lines.slice(1).join("\n").trim();
      await addRecord(title, content);
      count++;
    }
  }
  return count;
}

// ── localStorage helpers ───────────────────────────────────────────────────────
const RECORD_TAGS_KEY = "recordTagsById";
const RECORD_PINNED_KEY = "recordPinnedIds";
const RECORD_MULTI_ATTACH_KEY = "recordMultiAttachmentsById";

interface RecordStoredAttachment {
  key: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  size: number;
}

function loadTagsById(): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem(RECORD_TAGS_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function saveTagsById(map: Record<number, string>) {
  localStorage.setItem(RECORD_TAGS_KEY, JSON.stringify(map));
}

function loadPinnedIds(): Set<number> {
  try {
    const arr = JSON.parse(localStorage.getItem(RECORD_PINNED_KEY) ?? "[]");
    return new Set<number>(arr);
  } catch {
    return new Set();
  }
}
function savePinnedIds(set: Set<number>) {
  localStorage.setItem(RECORD_PINNED_KEY, JSON.stringify([...set]));
}

function loadAttachmentsFor(id: number): RecordStoredAttachment[] {
  try {
    const all = JSON.parse(
      localStorage.getItem(RECORD_MULTI_ATTACH_KEY) ?? "{}",
    );
    return all[id] ?? [];
  } catch {
    return [];
  }
}
function saveAttachmentsFor(id: number, files: RecordStoredAttachment[]) {
  try {
    const all = JSON.parse(
      localStorage.getItem(RECORD_MULTI_ATTACH_KEY) ?? "{}",
    );
    all[id] = files;
    localStorage.setItem(RECORD_MULTI_ATTACH_KEY, JSON.stringify(all));
  } catch {
    // storage full — ignore
  }
}

// ── Tag config ─────────────────────────────────────────────────────────────────
const RECORD_TAGS = [
  "Personal",
  "Work",
  "Health",
  "Travel",
  "Idea",
  "Memory",
] as const;
type RecordTag = (typeof RECORD_TAGS)[number];

const TAG_COLORS: Record<RecordTag, { border: string; badge: string }> = {
  Personal: {
    border: "border-l-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  Work: {
    border: "border-l-indigo-400",
    badge:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  Health: {
    border: "border-l-green-400",
    badge:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  Travel: {
    border: "border-l-amber-400",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  Idea: {
    border: "border-l-purple-400",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  Memory: {
    border: "border-l-rose-400",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
};

// ── Date grouping ──────────────────────────────────────────────────────────────
function getDateLabel(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function groupByDate(
  records: DbRecord[],
): { label: string; items: DbRecord[] }[] {
  const groups: Map<string, DbRecord[]> = new Map();
  for (const r of records) {
    const label = getDateLabel(r.createdAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(r);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }));
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function RecordsPage() {
  const {
    records,
    allRecords,
    loading,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    addRecord,
    updateRecord,
    deleteRecord,
  } = useRecords();

  // debug logging
  useEffect(() => {
    if (!loading) {
      console.log("[Records] storage key: records (IndexedDB db.records)");
      console.log("[Records] loaded:", allRecords.length);
    }
  }, [loading, allRecords.length]);

  // ── local state ──────────────────────────────────────────────────────────────
  const [tagsById, setTagsById] = useState<Record<number, string>>(() =>
    loadTagsById(),
  );
  const [pinnedIds, setPinnedIds] = useState<Set<number>>(() =>
    loadPinnedIds(),
  );

  // ── add-form state ────────────────────────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState<string>("");
  const [addAttachments, setAddAttachments] = useState<
    RecordStoredAttachment[]
  >([]);
  const [showAddAttachPicker, setShowAddAttachPicker] = useState(false);
  const addAttachCameraRef = useRef<HTMLInputElement>(null);
  const addAttachGalleryRef = useRef<HTMLInputElement>(null);
  const addAttachFileRef = useRef<HTMLInputElement>(null);

  // ── edit state ────────────────────────────────────────────────────────────────
  const [editRecord, setEditRecord] = useState<DbRecord | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editAttachments, setEditAttachments] = useState<
    RecordStoredAttachment[]
  >([]);
  const [showEditAttachPicker, setShowEditAttachPicker] = useState(false);
  const editAttachCameraRef = useRef<HTMLInputElement>(null);
  const editAttachGalleryRef = useRef<HTMLInputElement>(null);
  const editAttachFileRef = useRef<HTMLInputElement>(null);

  // ── view state ────────────────────────────────────────────────────────────────
  const [viewRecord, setViewRecord] = useState<DbRecord | null>(null);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [viewAttachments, setViewAttachments] = useState<
    RecordStoredAttachment[]
  >([]);
  const [previewFile, setPreviewFile] = useState<AttachedFile | null>(null);

  // ── import ref ────────────────────────────────────────────────────────────────
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── speech ────────────────────────────────────────────────────────────────────
  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();
  const lastTranscriptRef = useRef("");

  React.useEffect(() => {
    if (!transcript) return;
    const newPart = transcript.slice(lastTranscriptRef.current.length);
    if (!newPart) return;
    lastTranscriptRef.current = transcript;
    setNewContent((prev) => prev + (prev ? " " : "") + newPart.trim());
  }, [transcript]);

  // ── helpers: tag / pin ────────────────────────────────────────────────────────
  const setTag = (id: number, tag: string) => {
    const next = { ...tagsById, [id]: tag };
    setTagsById(next);
    saveTagsById(next);
  };

  const togglePin = (id: number) => {
    const next = new Set(pinnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPinnedIds(next);
    savePinnedIds(next);
  };

  // ── attachment helpers ───────────────────────────────────────────────────────
  const handleAddAttachFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newAttachments: RecordStoredAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("read error"));
        reader.readAsDataURL(f);
      });
      newAttachments.push({
        key: `rec-add-${Date.now()}-${i}`,
        name: f.name,
        mimeType: f.type || "application/octet-stream",
        dataUrl,
        size: f.size,
      });
    }
    setAddAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  const handleAddAttachCameraChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await handleAddAttachFiles(e.target.files);
      if (e.target) e.target.value = "";
    },
    [handleAddAttachFiles],
  );

  const handleAddAttachGalleryChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await handleAddAttachFiles(e.target.files);
      if (e.target) e.target.value = "";
    },
    [handleAddAttachFiles],
  );

  const handleAddAttachFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await handleAddAttachFiles(e.target.files);
      if (e.target) e.target.value = "";
    },
    [handleAddAttachFiles],
  );

  const handleEditAttachFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newAttachments: RecordStoredAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("read error"));
        reader.readAsDataURL(f);
      });
      newAttachments.push({
        key: `rec-edit-${Date.now()}-${i}`,
        name: f.name,
        mimeType: f.type || "application/octet-stream",
        dataUrl,
        size: f.size,
      });
    }
    setEditAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  const handleEditAttachCameraChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await handleEditAttachFiles(e.target.files);
      if (e.target) e.target.value = "";
    },
    [handleEditAttachFiles],
  );

  const handleEditAttachGalleryChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await handleEditAttachFiles(e.target.files);
      if (e.target) e.target.value = "";
    },
    [handleEditAttachFiles],
  );

  const handleEditAttachFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await handleEditAttachFiles(e.target.files);
      if (e.target) e.target.value = "";
    },
    [handleEditAttachFiles],
  );

  // ── view record ────────────────────────────────────────────────────────────────
  const handleViewRecord = useCallback((record: DbRecord) => {
    setViewRecord(record);
    setViewImageUrl(null);
    if (record.id !== undefined) {
      const imgData = getRecordImage(record.id);
      if (imgData) setViewImageUrl(imgData);
      setViewAttachments(loadAttachmentsFor(record.id));
    }
  }, []);

  const handleCloseView = () => {
    setViewRecord(null);
    setViewImageUrl(null);
    setViewAttachments([]);
  };

  // ── add submit ────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addRecord(newTitle.trim(), newContent.trim());

    setTimeout(async () => {
      try {
        const { db } = await import("../db/db");
        const all = await db.records.toArray();
        all.sort((a, b) => b.createdAt - a.createdAt);
        const newest = all[0];
        if (newest && newest.id !== undefined) {
          if (newTag) setTag(newest.id, newTag);
          if (addAttachments.length > 0)
            saveAttachmentsFor(newest.id, addAttachments);
        }
      } catch {
        // silent
      }
    }, 200);

    setNewTitle("");
    setNewContent("");
    setNewTag("");
    setAddAttachments([]);
    setShowAdd(false);
    if (isListening) stopListening();
    resetTranscript();
    lastTranscriptRef.current = "";
  };

  // ── edit submit ────────────────────────────────────────────────────────────────
  const handleEditSave = async () => {
    if (!editRecord || !editTitle.trim()) return;
    await updateRecord({
      ...editRecord,
      title: editTitle.trim(),
      content: editContent.trim(),
    });
    if (editRecord.id !== undefined) {
      if (editTag) setTag(editRecord.id, editTag);
      if (editAttachments.length > 0) {
        saveAttachmentsFor(editRecord.id, editAttachments);
      }
    }
    setEditRecord(null);
  };

  // ── delete record ──────────────────────────────────────────────────────────────
  const handleDelete = (id: number) => {
    deleteRecord(id);
    // Clean up local state
    const nextTags = { ...tagsById };
    delete nextTags[id];
    setTagsById(nextTags);
    saveTagsById(nextTags);
    const nextPinned = new Set(pinnedIds);
    nextPinned.delete(id);
    setPinnedIds(nextPinned);
    savePinnedIds(nextPinned);
  };

  // ── export ────────────────────────────────────────────────────────────────────
  const exportList = allRecords.length > 0 ? allRecords : records;

  const handleExportTxt = () => {
    if (!exportList.length) {
      showErrorToast("No records to export");
      return;
    }
    exportRecordsAsTxt(exportList);
    showSuccessToast("Exported as TXT");
  };
  const handleExportDoc = () => {
    if (!exportList.length) {
      showErrorToast("No records to export");
      return;
    }
    exportRecordsAsDoc(exportList);
    showSuccessToast("Exported as DOC");
  };
  const handleExportJson = () => {
    if (!exportList.length) {
      showErrorToast("No records to export");
      return;
    }
    exportRecordsAsJson(exportList);
    showSuccessToast("Exported as JSON");
  };

  // ── import ────────────────────────────────────────────────────────────────────
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const count = await importRecordsFromFile(file, addRecord);
      showSuccessToast(`Imported ${count} record${count !== 1 ? "s" : ""}`);
    } catch (err) {
      showErrorToast(
        `Import failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  // ── sorted + grouped records ──────────────────────────────────────────────────
  const pinnedRecords = records.filter(
    (r) => r.id !== undefined && pinnedIds.has(r.id as number),
  );
  const unpinnedRecords = records.filter(
    (r) => r.id === undefined || !pinnedIds.has(r.id as number),
  );
  const timelineGroups = groupByDate(unpinnedRecords);

  // ── word count ────────────────────────────────────────────────────────────────
  const wordCount = newContent.trim()
    ? newContent.trim().split(/\s+/).length
    : 0;

  // ── file preview helper ───────────────────────────────────────────────────────
  const openFilePreview = (att: RecordStoredAttachment) => {
    setPreviewFile({
      key: att.key,
      name: att.name,
      mimeType: att.mimeType,
      url: att.dataUrl,
      size: att.size,
    });
  };

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full" data-ocid="records.page">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-2 flex-wrap">
        <h1 className="text-xl font-bold text-foreground">Records</h1>
        <div className="flex items-center gap-1">
          <input
            ref={importInputRef}
            type="file"
            accept=".json,.txt,.doc,.docx"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground font-medium"
            aria-label="Import records"
            title="Import Records"
            data-ocid="records.upload_button"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground font-medium"
                aria-label="Export all records"
                title="Export All Records"
                data-ocid="records.secondary_button"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export All Records</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportTxt}>
                <FileText className="w-4 h-4 mr-2" /> Export as TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportDoc}>
                <FileType className="w-4 h-4 mr-2" /> Export as WORD (DOC)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJson}>
                <FileJson className="w-4 h-4 mr-2" /> Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            data-ocid="records.primary_button"
          >
            <Plus size={15} />
            Add New
          </button>
        </div>
      </div>

      {/* ── Search & date filters ── */}
      <div className="px-4 pb-2 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            data-ocid="records.search_input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* ── Add form ── */}
      {showAdd && (
        <div className="mx-4 mb-3 p-4 rounded-xl border border-border bg-card shadow-sm">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            className="w-full mb-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            data-ocid="records.input"
          />

          {/* Tag selector */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Tag size={11} /> Category:
            </span>
            {RECORD_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setNewTag(newTag === t ? "" : t)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors border ${
                  newTag === t
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Textarea with word count */}
          <div className="relative mb-1">
            <textarea
              value={
                newContent +
                (isListening && interimTranscript
                  ? ` ${interimTranscript}`
                  : "")
              }
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your record, memory, or journal entry…"
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              data-ocid="records.textarea"
            />
            {speechSupported && (
              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    resetTranscript();
                    lastTranscriptRef.current = "";
                    startListening();
                  }
                }}
                className={`absolute bottom-2 right-2 p-1.5 rounded-lg transition-colors ${
                  isListening
                    ? "bg-red-100 text-red-600"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title={isListening ? "Stop dictation" : "Dictate"}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mb-2">
            {isListening && (
              <p className="text-xs text-accent">🎙 Listening… speak now</p>
            )}
            <p className="text-xs text-muted-foreground/60 ml-auto">
              {wordCount} words
            </p>
          </div>

          {/* Attachments — hidden inputs */}
          <input
            ref={addAttachCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handleAddAttachCameraChange}
          />
          <input
            ref={addAttachGalleryRef}
            type="file"
            accept="*/*"
            multiple
            className="hidden"
            onChange={handleAddAttachGalleryChange}
          />
          <input
            ref={addAttachFileRef}
            type="file"
            accept="*/*"
            multiple
            className="hidden"
            onChange={handleAddAttachFileChange}
          />

          {/* Attachment list */}
          {addAttachments.length > 0 && (
            <div className="space-y-2 mt-1">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                Attachments ({addAttachments.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {addAttachments.map((att, idx) => {
                  const isImg = att.mimeType.startsWith("image/");
                  const isVid = att.mimeType.startsWith("video/");
                  return (
                    <div
                      key={att.key}
                      className="relative group rounded-lg overflow-hidden border border-border/50 bg-muted/20"
                      style={{ maxWidth: isImg ? 120 : undefined }}
                    >
                      {isImg ? (
                        <button
                          type="button"
                          onClick={() => openFilePreview(att)}
                          className="block w-full"
                          aria-label={`Preview ${att.name}`}
                          title={att.name}
                        >
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-full h-auto block"
                            style={{ maxHeight: 100, objectFit: "contain" }}
                          />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openFilePreview(att)}
                          className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-muted transition-colors w-full text-left"
                          aria-label={`Preview or download ${att.name}`}
                          title={att.name}
                        >
                          <span className="text-base leading-none shrink-0">
                            {isVid
                              ? "🎬"
                              : att.mimeType === "application/pdf"
                                ? "📄"
                                : "📎"}
                          </span>
                          <span className="truncate max-w-[120px]">
                            {att.name}
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setAddAttachments((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-destructive"
                        aria-label={`Remove ${att.name}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Attachment inline picker */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => setShowAddAttachPicker((v) => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
              aria-label="Add attachment"
              aria-expanded={showAddAttachPicker}
            >
              <Paperclip size={13} />
              Add Attachment
            </button>
            {showAddAttachPicker && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAttachPicker(false);
                    addAttachCameraRef.current?.click();
                  }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                  aria-label="Open camera"
                >
                  <span>📷</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAttachPicker(false);
                    addAttachGalleryRef.current?.click();
                  }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                  aria-label="Select from gallery"
                >
                  <span>🖼</span> Gallery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAttachPicker(false);
                    addAttachFileRef.current?.click();
                  }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                  aria-label="Upload files"
                >
                  <span>📁</span> Files
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              data-ocid="records.submit_button"
            >
              Save Record
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setNewTitle("");
                setNewContent("");
                setNewTag("");
                setAddAttachments([]);
                if (isListening) stopListening();
                resetTranscript();
                lastTranscriptRef.current = "";
              }}
              className="px-4 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted transition-colors"
              data-ocid="records.cancel_button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Records list ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="records.empty_state"
          >
            <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-foreground/70 mb-1">
              No records yet
            </p>
            <p className="text-sm text-muted-foreground">
              {search || dateFrom || dateTo
                ? "No records match your filters."
                : "Start capturing your memories, journeys, and ideas!"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Pinned section */}
            {pinnedRecords.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-1.5 py-2">
                  <Pin size={12} className="text-amber-500" />
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                    Pinned
                  </span>
                </div>
                <div className="space-y-2">
                  {pinnedRecords.map((record, idx) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      tag={
                        record.id !== undefined
                          ? tagsById[record.id]
                          : undefined
                      }
                      isPinned={true}
                      attachmentCount={
                        record.id !== undefined
                          ? loadAttachmentsFor(record.id).length
                          : 0
                      }
                      onView={handleViewRecord}
                      onEdit={(r) => {
                        setEditRecord(r);
                        setEditTitle(r.title);
                        setEditContent(r.content);
                        setEditTag(
                          r.id !== undefined ? (tagsById[r.id] ?? "") : "",
                        );
                        setEditAttachments(
                          r.id !== undefined ? loadAttachmentsFor(r.id) : [],
                        );
                      }}
                      onDelete={handleDelete}
                      onTogglePin={togglePin}
                      dataOcidIndex={idx + 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Timeline groups */}
            {timelineGroups.map((group) => (
              <div key={group.label} className="mb-2">
                <div className="flex items-center gap-2 py-2 sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground/60">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "entry" : "entries"}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.items.map((record, idx) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      tag={
                        record.id !== undefined
                          ? tagsById[record.id]
                          : undefined
                      }
                      isPinned={false}
                      attachmentCount={
                        record.id !== undefined
                          ? loadAttachmentsFor(record.id).length
                          : 0
                      }
                      onView={handleViewRecord}
                      onEdit={(r) => {
                        setEditRecord(r);
                        setEditTitle(r.title);
                        setEditContent(r.content);
                        setEditTag(
                          r.id !== undefined ? (tagsById[r.id] ?? "") : "",
                        );
                        setEditAttachments(
                          r.id !== undefined ? loadAttachmentsFor(r.id) : [],
                        );
                      }}
                      onDelete={handleDelete}
                      onTogglePin={togglePin}
                      dataOcidIndex={idx + 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail View Modal ── */}
      {viewRecord && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss is supplementary
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40"
          onClick={handleCloseView}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop-propagation wrapper */}
          <div
            className="w-full md:max-w-4xl mx-0 md:mx-4 bg-card rounded-t-2xl md:rounded-2xl border border-border shadow-2xl flex flex-col"
            style={{ maxHeight: "95vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-border shrink-0 gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground text-base leading-snug">
                  {viewRecord.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDateTime(viewRecord.createdAt)}
                </p>
                {viewRecord.id !== undefined && tagsById[viewRecord.id] && (
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      TAG_COLORS[tagsById[viewRecord.id] as RecordTag]?.badge ??
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tagsById[viewRecord.id]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleCloseView();
                    setEditRecord(viewRecord);
                    setEditTitle(viewRecord.title);
                    setEditContent(viewRecord.content);
                    setEditTag(
                      viewRecord.id !== undefined
                        ? (tagsById[viewRecord.id] ?? "")
                        : "",
                    );
                    setEditAttachments(
                      viewRecord.id !== undefined
                        ? loadAttachmentsFor(viewRecord.id)
                        : [],
                    );
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                  title="Edit"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleCloseView}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto px-5 py-4 flex-1 space-y-4">
              {viewRecord.content && (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {viewRecord.content}
                </p>
              )}
              {viewImageUrl && (
                <div className="mt-2">
                  <img
                    src={viewImageUrl}
                    alt="Attached"
                    className="w-full h-auto object-contain rounded-xl border border-border"
                    style={{ maxHeight: "60vh" }}
                  />
                </div>
              )}
              {viewAttachments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Attachments ({viewAttachments.length})
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {viewAttachments.map((att) => (
                      <button
                        key={att.key}
                        type="button"
                        onClick={() => openFilePreview(att)}
                        className="aspect-square rounded-xl border border-border bg-muted overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        {att.mimeType.startsWith("image/") ? (
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
                            <Paperclip
                              size={18}
                              className="text-muted-foreground"
                            />
                            <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                              {att.name}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editRecord && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss is supplementary
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40"
          onClick={() => setEditRecord(null)}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop-propagation wrapper */}
          <div
            className="w-full md:max-w-4xl mx-0 md:mx-4 bg-card rounded-t-2xl md:rounded-2xl border border-border shadow-2xl flex flex-col"
            style={{ maxHeight: "95vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0 gap-2">
              <h2 className="font-semibold text-foreground text-base">
                Edit Record
              </h2>
              <button
                type="button"
                onClick={() => setEditRecord(null)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto px-5 py-4 flex-1 space-y-3">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Title"
              />
              {/* Tag selector */}
              <div className="flex flex-wrap gap-1.5">
                {RECORD_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditTag(editTag === t ? "" : t)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors border ${
                      editTag === t
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                placeholder="Content..."
              />
              {/* Attachments — hidden inputs */}
              <input
                ref={editAttachCameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={handleEditAttachCameraChange}
              />
              <input
                ref={editAttachGalleryRef}
                type="file"
                accept="*/*"
                multiple
                className="hidden"
                onChange={handleEditAttachGalleryChange}
              />
              <input
                ref={editAttachFileRef}
                type="file"
                accept="*/*"
                multiple
                className="hidden"
                onChange={handleEditAttachFileChange}
              />

              {/* Attachment list */}
              {editAttachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                    Attachments ({editAttachments.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editAttachments.map((att, idx) => {
                      const isImg = att.mimeType.startsWith("image/");
                      const isVid = att.mimeType.startsWith("video/");
                      return (
                        <div
                          key={att.key}
                          className="relative group rounded-lg overflow-hidden border border-border/50 bg-muted/20"
                          style={{ maxWidth: isImg ? 120 : undefined }}
                        >
                          {isImg ? (
                            <button
                              type="button"
                              onClick={() => openFilePreview(att)}
                              className="block w-full"
                              aria-label={`Preview ${att.name}`}
                              title={att.name}
                            >
                              <img
                                src={att.dataUrl}
                                alt={att.name}
                                className="w-full h-auto block"
                                style={{ maxHeight: 100, objectFit: "contain" }}
                              />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openFilePreview(att)}
                              className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-muted transition-colors w-full text-left"
                              aria-label={`Preview or download ${att.name}`}
                              title={att.name}
                            >
                              <span className="text-base leading-none shrink-0">
                                {isVid
                                  ? "🎬"
                                  : att.mimeType === "application/pdf"
                                    ? "📄"
                                    : "📎"}
                              </span>
                              <span className="truncate max-w-[120px]">
                                {att.name}
                              </span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setEditAttachments((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-destructive"
                            aria-label={`Remove ${att.name}`}
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add Attachment inline picker */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditAttachPicker((v) => !v)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                  aria-label="Add attachment"
                  aria-expanded={showEditAttachPicker}
                >
                  <Paperclip size={13} />
                  Add Attachment
                </button>
                {showEditAttachPicker && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditAttachPicker(false);
                        editAttachCameraRef.current?.click();
                      }}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                      aria-label="Open camera"
                    >
                      <span>📷</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditAttachPicker(false);
                        editAttachGalleryRef.current?.click();
                      }}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                      aria-label="Select from gallery"
                    >
                      <span>🖼</span> Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditAttachPicker(false);
                        editAttachFileRef.current?.click();
                      }}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
                      aria-label="Upload files"
                    >
                      <span>📁</span> Files
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-2 px-5 py-4 border-t border-border shrink-0">
              <button
                type="button"
                onClick={handleEditSave}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                data-ocid="records.save_button"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditRecord(null)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted transition-colors"
                data-ocid="records.cancel_button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── File preview modal ── */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}

// ── RecordCard component ───────────────────────────────────────────────────────
interface RecordCardProps {
  record: DbRecord;
  tag?: string;
  isPinned: boolean;
  attachmentCount: number;
  onView: (r: DbRecord) => void;
  onEdit: (r: DbRecord) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number) => void;
  dataOcidIndex: number;
}

function RecordCard({
  record,
  tag,
  isPinned,
  attachmentCount,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  dataOcidIndex,
}: RecordCardProps) {
  const tagColors = tag ? TAG_COLORS[tag as RecordTag] : null;

  return (
    <div
      className={`relative p-4 rounded-xl border border-border bg-card shadow-sm border-l-4 ${
        tagColors ? tagColors.border : "border-l-border"
      }`}
      data-ocid={`records.item.${dataOcidIndex}`}
    >
      {/* Top row: title + actions */}
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="flex-1 text-left min-w-0"
          onClick={() => onView(record)}
        >
          <h3 className="font-semibold text-foreground text-sm leading-snug">
            {record.title}
          </h3>
        </button>
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Pin/Star button */}
          <button
            type="button"
            onClick={() =>
              record.id !== undefined && onTogglePin(record.id as number)
            }
            className="p-1.5 rounded-lg transition-colors hover:bg-muted"
            title={isPinned ? "Unpin" : "Pin"}
          >
            <Star
              size={14}
              className={
                isPinned
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/50"
              }
            />
          </button>
          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(record)}
            className="p-1.5 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Edit"
            data-ocid={`records.edit_button.${dataOcidIndex}`}
          >
            <Edit2 size={13} />
          </button>
          {/* Delete */}
          <button
            type="button"
            onClick={() =>
              record.id !== undefined && onDelete(record.id as number)
            }
            className="p-1.5 rounded-lg transition-colors hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            title="Delete"
            data-ocid={`records.delete_button.${dataOcidIndex}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Content preview (3 lines) */}
      {record.content && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled by parent button
        <p
          className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-3 cursor-pointer"
          onClick={() => onView(record)}
        >
          {record.content}
        </p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-2 gap-2">
        <p className="text-xs text-muted-foreground/60">
          {formatDateTime(record.createdAt)}
        </p>
        <div className="flex items-center gap-1.5">
          {attachmentCount > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground/70">
              <Paperclip size={10} />
              {attachmentCount}
            </span>
          )}
          {tag && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                TAG_COLORS[tag as RecordTag]?.badge ??
                "bg-muted text-muted-foreground"
              }`}
            >
              {tag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
