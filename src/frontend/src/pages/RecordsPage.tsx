import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  FileJson,
  FileText,
  FileType,
  Image as ImageIcon,
  Mic,
  MicOff,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
import React, { useState, useRef, useCallback, useEffect } from "react";
import type { Record } from "../db/schema";
import {
  compressRecordImage,
  getRecordImage,
  saveRecordImage,
} from "../hooks/useRecordImages";
import { useRecords } from "../hooks/useRecords";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { showErrorToast, showSuccessToast } from "../store/toastStore";
import { formatDateTime } from "../utils/dateFormatter";
import {
  exportRecordsAsDoc,
  exportRecordsAsJson,
  exportRecordsAsTxt,
} from "../utils/recordExport";

// ── record import helper ──────────────────────────────────────────────────────
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
    // TXT / DOC fallback: split on blank lines or "---"
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

// ── LoadingSpinner ────────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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

  // ── debug logging on mount / when records load ──────────────────────────────
  useEffect(() => {
    if (!loading) {
      console.log("[Records] storage key: records (IndexedDB db.records)");
      console.log("[Records] loaded:", allRecords.length);
    }
  }, [loading, allRecords.length]);

  // ── add-form state ──────────────────────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [addImage, setAddImage] = useState<string | null>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const [addImageLoading, setAddImageLoading] = useState(false);

  // ── edit state ──────────────────────────────────────────────────────────────
  const [editRecord, setEditRecord] = useState<Record | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // ── view (open) state ───────────────────────────────────────────────────────
  const [viewRecord, setViewRecord] = useState<Record | null>(null);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

  // ── import ref ──────────────────────────────────────────────────────────────
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── speech recognition (add form only) ─────────────────────────────────────
  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Append speech transcript to newContent
  React.useEffect(() => {
    if (transcript) {
      setNewContent((prev) => prev + (prev ? " " : "") + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // ── image helpers ───────────────────────────────────────────────────────────
  const handleAddImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setAddImageLoading(true);
      try {
        const dataUrl = await compressRecordImage(file);
        setAddImage(dataUrl);
      } catch {
        showErrorToast("Failed to process image");
      } finally {
        setAddImageLoading(false);
        if (addImageInputRef.current) addImageInputRef.current.value = "";
      }
    },
    [],
  );

  // ── open record view ────────────────────────────────────────────────────────
  const handleViewRecord = useCallback((record: Record) => {
    setViewRecord(record);
    setViewImageUrl(null);
    if (record.id !== undefined) {
      const imgData = getRecordImage(record.id);
      if (imgData) setViewImageUrl(imgData);
    }
  }, []);

  const handleCloseView = () => {
    setViewRecord(null);
    setViewImageUrl(null);
  };

  // ── submit add ──────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addRecord(newTitle.trim(), newContent.trim());

    // Save image if present — find the newest record after add
    if (addImage) {
      setTimeout(async () => {
        try {
          const { db } = await import("../db/db");
          const all = await db.records.toArray();
          all.sort((a, b) => b.createdAt - a.createdAt);
          const newest = all[0];
          if (newest && newest.id !== undefined) {
            saveRecordImage(newest.id, addImage);
          }
        } catch {
          // Image save failed silently
        }
      }, 200);
    }

    setNewTitle("");
    setNewContent("");
    setAddImage(null);
    setShowAdd(false);
    if (isListening) stopListening();
    resetTranscript();
  };

  // ── submit edit ─────────────────────────────────────────────────────────────
  const handleEditSave = async () => {
    if (!editRecord || !editTitle.trim()) return;
    await updateRecord({
      ...editRecord,
      title: editTitle.trim(),
      content: editContent.trim(),
    });
    setEditRecord(null);
  };

  // ── export handlers ─────────────────────────────────────────────────────────
  // Use allRecords (unfiltered) for export so all data is exported
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

  // ── import handler ──────────────────────────────────────────────────────────
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

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-2 flex-wrap">
        <h1 className="text-xl font-bold text-foreground">Records</h1>

        <div className="flex items-center gap-1">
          {/* Import button — same style as Notes (icon-only) */}
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
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Import records"
            title="Import Records"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Export dropdown — same style as Notes (icon-only trigger) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Export all records"
                title="Export All Records"
              >
                <Download className="w-4 h-4" />
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

          {/* Add button */}
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Add
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
          />
          <div className="relative">
            <textarea
              value={
                newContent +
                (isListening && interimTranscript
                  ? ` ${interimTranscript}`
                  : "")
              }
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Content…"
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
            {speechSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`absolute bottom-2 right-2 p-1.5 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                title={isListening ? "Stop dictation" : "Dictate"}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            )}
          </div>
          {isListening && (
            <p className="text-xs text-accent mt-1">🎙 Listening… speak now</p>
          )}

          {/* Image attachment — capture="environment" enables camera on mobile */}
          <div className="flex items-center gap-2 mt-2">
            <input
              ref={addImageInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleAddImageChange}
            />
            <button
              type="button"
              onClick={() => addImageInputRef.current?.click()}
              disabled={addImageLoading}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <ImageIcon size={13} />
              {addImageLoading ? "Processing…" : "Add Image"}
            </button>
            {addImage && (
              <div className="relative">
                <img
                  src={addImage}
                  alt="preview"
                  className="h-12 w-12 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => setAddImage(null)}
                  className="absolute -top-1 -right-1 bg-background border border-border rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X size={10} />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setNewTitle("");
                setNewContent("");
                setAddImage(null);
                if (isListening) stopListening();
                resetTranscript();
              }}
              className="px-4 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Records list ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <LoadingSpinner />
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <img
              src="/assets/generated/records-empty.dim_400x300.png"
              alt="No records"
              className="w-48 opacity-60 mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <p className="text-muted-foreground text-sm">
              {search || dateFrom || dateTo
                ? "No records match your filters."
                : "No records yet. Add your first record!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-xl border border-border bg-card shadow-sm"
              >
                {editRecord?.id === record.id ? (
                  /* ── inline edit ── */
                  <div>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full mb-2 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={handleEditSave}
                        className="px-3 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditRecord(null)}
                        className="px-3 py-1 rounded-lg border border-border bg-background text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── view mode (list card) ── */
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        className="flex-1 text-left min-w-0"
                        onClick={() => handleViewRecord(record)}
                      >
                        <h3 className="font-semibold text-foreground text-sm leading-snug">
                          {record.title}
                        </h3>
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditRecord(record);
                            setEditTitle(record.title);
                            setEditContent(record.content);
                          }}
                          className="px-2 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            record.id !== undefined &&
                            deleteRecord(record.id as number)
                          }
                          className="px-2 py-0.5 rounded text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {record.content && (
                      /* REQ-1: truncate body to 3 lines in list view */
                      // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard navigation handled by the parent button above
                      <p
                        className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-3 cursor-pointer"
                        onClick={() => handleViewRecord(record)}
                      >
                        {record.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      {formatDateTime(record.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── View Record overlay ── */}
      {viewRecord && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss is supplementary; close button provides keyboard access
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={handleCloseView}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop-propagation wrapper, keyboard dismiss handled by close button */}
          <div
            className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* View header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
              <h2 className="font-semibold text-foreground text-base leading-snug flex-1 mr-2">
                {viewRecord.title}
              </h2>
              <button
                type="button"
                onClick={handleCloseView}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            {/* View body — scrollable */}
            <div className="overflow-y-auto px-5 py-4 flex-1 space-y-3">
              <p className="text-xs text-muted-foreground/70">
                {formatDateTime(viewRecord.createdAt)}
              </p>
              {viewRecord.content && (
                /* REQ-2: full content with preserved line breaks */
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {viewRecord.content}
                </p>
              )}
              {/* REQ-2: show attached image if present */}
              {viewImageUrl && (
                <div className="mt-2">
                  <img
                    src={viewImageUrl}
                    alt="Attached"
                    className="max-w-full h-auto rounded-xl border border-border"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
