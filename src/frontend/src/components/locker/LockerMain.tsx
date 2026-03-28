import {
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  File,
  Lock,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { LockerEntryForm } from "./LockerEntryForm";
import type { LockerEntry } from "./lockerStorage";
import {
  LOCKER_CREDS_KEY,
  getEntries,
  getSettings,
  saveEntries,
  saveSettings,
  verifyCredentials,
} from "./lockerStorage";

function hasPasswordSet(): boolean {
  const stored = localStorage.getItem(LOCKER_CREDS_KEY);
  if (!stored) return false;
  try {
    const decoded = atob(stored);
    const colonIdx = decoded.indexOf(":");
    const pwd = decoded.slice(colonIdx + 1);
    return pwd.length > 0;
  } catch {
    return false;
  }
}

interface Props {
  onLock: () => void;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  password: "🔑",
  email: "📧",
  note: "📝",
  file: "📁",
};

const TYPE_LABELS: Record<string, string> = {
  password: "Password",
  email: "Email",
  note: "Secure Note",
  file: "File/Camera",
};

const TIMEOUT_OPTIONS = [1, 5, 10, 15, 30];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getExportTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}_${hh}${min}`;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function entriesToTxt(entries: LockerEntry[]): string {
  return entries
    .map((e, i) => {
      const lines = [
        `--- Entry ${i + 1} ---`,
        `Title: ${e.title}`,
        `Type: ${TYPE_LABELS[e.type] ?? e.type}`,
        `Created: ${formatDate(e.createdAt)}`,
      ];
      if (e.username) lines.push(`Username: ${e.username}`);
      if (e.email) lines.push(`Email: ${e.email}`);
      if (e.password) lines.push(`Password: ${e.password}`);
      if (e.url) lines.push(`URL: ${e.url}`);
      if (e.content) lines.push(`Note:\n${e.content}`);
      if (e.attachments && e.attachments.length > 0) {
        lines.push(
          `Attachments: ${e.attachments.map((a) => a.name).join(", ")}`,
        );
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

function entriesToHtml(entries: LockerEntry[]): string {
  const rows = entries
    .map(
      (e) => `
    <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #ccc;">
      <h3 style="margin:0 0 8px;">${e.title} <span style="font-weight:normal;font-size:13px;color:#666;">(${TYPE_LABELS[e.type] ?? e.type})</span></h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px;">
        <tr><td style="color:#888;width:120px;">Created</td><td>${formatDate(e.createdAt)}</td></tr>
        ${e.username ? `<tr><td style="color:#888;">Username</td><td>${e.username}</td></tr>` : ""}
        ${e.email ? `<tr><td style="color:#888;">Email</td><td>${e.email}</td></tr>` : ""}
        ${e.password ? `<tr><td style="color:#888;">Password</td><td>${e.password}</td></tr>` : ""}
        ${e.url ? `<tr><td style="color:#888;">URL</td><td><a href="${e.url}">${e.url}</a></td></tr>` : ""}
        ${e.content ? `<tr><td style="color:#888;vertical-align:top;">Note</td><td style="white-space:pre-wrap;">${e.content}</td></tr>` : ""}
        ${e.attachments && e.attachments.length > 0 ? `<tr><td style="color:#888;">Attachments</td><td>${e.attachments.map((a) => a.name).join(", ")}</td></tr>` : ""}
      </table>
    </div>`,
    )
    .join("");
  return `<html><head><meta charset="utf-8"><title>Locker Export</title></head><body style="font-family:sans-serif;max-width:700px;margin:40px auto;">
<h2 style="margin-bottom:24px;">My Locker — Exported ${new Date().toLocaleDateString()}</h2>
${rows}
</body></html>`;
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: { entry: LockerEntry; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="bg-muted/30 border border-border/50 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="text-lg shrink-0">{TYPE_ICONS[entry.type]}</span>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium break-words"
            style={{ wordBreak: "break-word" }}
          >
            {entry.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {TYPE_LABELS[entry.type]} · {formatDate(entry.createdAt)}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Edit entry"
            data-ocid="locker.entry.edit_button"
          >
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
            aria-label="Delete entry"
            data-ocid="locker.entry.delete_button"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/30 space-y-2">
          {entry.username && (
            <div>
              <p className="text-[11px] text-muted-foreground">Username</p>
              <p
                className="text-sm break-all"
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              >
                {entry.username}
              </p>
            </div>
          )}
          {entry.email && (
            <div>
              <p className="text-[11px] text-muted-foreground">Email</p>
              <p
                className="text-sm break-all"
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              >
                {entry.email}
              </p>
            </div>
          )}
          {entry.password && (
            <div>
              <p className="text-[11px] text-muted-foreground">Password</p>
              <div className="flex items-center gap-2">
                <p
                  className="text-sm font-mono break-all"
                  style={{ wordBreak: "break-all" }}
                >
                  {showPwd ? entry.password : "••••••••"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Toggle password"
                >
                  {showPwd ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
          {entry.url && (
            <div>
              <p className="text-[11px] text-muted-foreground">URL</p>
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary block hover:underline"
                style={{ wordBreak: "break-all", overflowWrap: "break-word" }}
              >
                {entry.url}
              </a>
            </div>
          )}
          {entry.content && (
            <div>
              <p className="text-[11px] text-muted-foreground">Note</p>
              <p
                className="text-sm whitespace-pre-wrap"
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              >
                {entry.content}
              </p>
            </div>
          )}
          {entry.attachments && entry.attachments.length > 0 && (
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">
                Attachments
              </p>
              <div className="flex flex-wrap gap-2">
                {entry.attachments.map((att, attIdx) =>
                  att.mimeType.startsWith("image/") ? (
                    <img
                      key={`${att.name}-${attIdx}`}
                      src={att.dataUrl}
                      alt={att.name}
                      className="h-16 w-auto rounded object-contain bg-muted"
                    />
                  ) : (
                    <a
                      key={`${att.name}-${attIdx}`}
                      href={att.dataUrl}
                      download={att.name}
                      className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                    >
                      <File className="w-3 h-3 shrink-0" />{" "}
                      <span className="break-all">{att.name}</span>
                    </a>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type ExportStep =
  | { kind: "idle" }
  | { kind: "chooseSecurity"; format: "txt" | "json" | "doc" }
  | { kind: "pinPrompt"; format: "txt" | "json" | "doc" }
  | { kind: "importPinPrompt"; data: string };

export function LockerMain({ onLock }: Props) {
  const [entries, setEntries] = useState<LockerEntry[]>(getEntries);
  const [settings, setSettings] = useState(getSettings);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LockerEntry | undefined>(
    undefined,
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | undefined>(
    undefined,
  );
  const [deletePin, setDeletePin] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Export/Import state
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportStep, setExportStep] = useState<ExportStep>({ kind: "idle" });
  const [exportPin, setExportPin] = useState("");
  const [exportPassword, setExportPassword] = useState("");
  const [exportError, setExportError] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleSave = (entry: LockerEntry) => {
    const updated = editingEntry
      ? entries.map((e) => (e.id === entry.id ? entry : e))
      : [...entries, entry];
    saveEntries(updated);
    setEntries(updated);
    setShowForm(false);
    setEditingEntry(undefined);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
    setDeletePin("");
    setDeletePassword("");
    setDeleteError("");
  };

  const confirmDelete = () => {
    if (!deletePin) {
      setDeleteError("Please enter your PIN.");
      return;
    }
    if (!verifyCredentials(deletePin, deletePassword)) {
      setDeleteError("Incorrect PIN or password.");
      return;
    }
    const updated = entries.filter((e) => e.id !== deleteConfirmId);
    saveEntries(updated);
    setEntries(updated);
    setDeleteConfirmId(undefined);
    setDeletePin("");
    setDeletePassword("");
    setDeleteError("");
  };

  const handleTimeoutChange = (minutes: number) => {
    const s = { timeoutMinutes: minutes };
    saveSettings(s);
    setSettings(s);
  };

  // --- Export logic ---
  const startExport = (format: "txt" | "json" | "doc") => {
    setShowExportDropdown(false);
    setExportPin("");
    setExportPassword("");
    setExportError("");
    setExportStep({ kind: "chooseSecurity", format });
  };

  const doExport = (format: "txt" | "json" | "doc", encrypted: boolean) => {
    const ts = getExportTimestamp();
    if (format === "txt") {
      const content = encrypted
        ? `ENCRYPTED:\n${btoa(JSON.stringify(entries))}`
        : entriesToTxt(entries);
      downloadFile(content, `locker_${ts}.txt`, "text/plain");
    } else if (format === "json") {
      const obj = encrypted
        ? { encrypted: true, data: btoa(JSON.stringify(entries)) }
        : entries;
      downloadFile(
        JSON.stringify(obj, null, 2),
        `locker_${ts}.json`,
        "application/json",
      );
    } else {
      const html = entriesToHtml(entries);
      downloadFile(html, `locker_${ts}.doc`, "application/msword");
    }
    setExportStep({ kind: "idle" });
  };

  const handleChooseSecurity = (encrypted: boolean) => {
    if (exportStep.kind !== "chooseSecurity") return;
    const { format } = exportStep;
    if (encrypted) {
      setExportStep({ kind: "pinPrompt", format });
    } else {
      doExport(format, false);
    }
  };

  const handleExportPinConfirm = () => {
    if (exportStep.kind !== "pinPrompt") return;
    if (!exportPin) {
      setExportError("Please enter your PIN.");
      return;
    }
    if (!verifyCredentials(exportPin, exportPassword)) {
      setExportError("Incorrect PIN or password.");
      return;
    }
    doExport(exportStep.format, true);
    setExportPin("");
    setExportPassword("");
    setExportError("");
  };

  // --- Import logic ---
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = "";

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "json") {
      setImportMessage(
        "TXT/Word files cannot be re-imported. Please use JSON format for import.",
      );
      setTimeout(() => setImportMessage(""), 5000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const parsed = JSON.parse(text);
        if (parsed && parsed.encrypted === true && parsed.data) {
          // Ask for PIN to decrypt
          setExportPin("");
          setExportPassword("");
          setExportError("");
          setExportStep({ kind: "importPinPrompt", data: parsed.data });
        } else if (Array.isArray(parsed)) {
          mergeImportedEntries(parsed);
        } else {
          setImportMessage("Invalid file format.");
          setTimeout(() => setImportMessage(""), 4000);
        }
      } catch {
        setImportMessage("Failed to parse file.");
        setTimeout(() => setImportMessage(""), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleImportPinConfirm = () => {
    if (exportStep.kind !== "importPinPrompt") return;
    if (!exportPin) {
      setExportError("Please enter your PIN.");
      return;
    }
    if (!verifyCredentials(exportPin, exportPassword)) {
      setExportError("Incorrect PIN or password.");
      return;
    }
    try {
      const decoded = JSON.parse(atob(exportStep.data)) as LockerEntry[];
      mergeImportedEntries(decoded);
      setExportStep({ kind: "idle" });
      setExportPin("");
      setExportPassword("");
      setExportError("");
    } catch {
      setExportError("Failed to decrypt file.");
    }
  };

  const mergeImportedEntries = (imported: LockerEntry[]) => {
    const fresh = imported.map((e) => ({
      ...e,
      id: crypto.randomUUID(),
    }));
    const merged = [...entries, ...fresh];
    saveEntries(merged);
    setEntries(merged);
    setExportStep({ kind: "idle" });
    setImportMessage(
      `${fresh.length} entr${fresh.length === 1 ? "y" : "ies"} imported.`,
    );
    setTimeout(() => setImportMessage(""), 4000);
  };

  if (showForm) {
    return (
      <div className="flex items-start justify-center w-full">
        <LockerEntryForm
          entry={editingEntry}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingEntry(undefined);
          }}
        />
      </div>
    );
  }

  const isExportModalOpen =
    exportStep.kind === "chooseSecurity" ||
    exportStep.kind === "pinPrompt" ||
    exportStep.kind === "importPinPrompt";

  return (
    <div
      className="bg-card rounded-xl sm:rounded-2xl border border-border/50 w-full max-w-lg flex flex-col overflow-hidden"
      style={{
        maxHeight: "calc(100dvh - 2rem)",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header — sticky so it never scrolls away */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0 sticky top-0 z-10 bg-card">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary shrink-0" /> My Locker
        </h2>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Import button */}
          <button
            type="button"
            onClick={() => importFileRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1.5 bg-muted rounded-lg text-xs font-medium border border-border/50 hover:bg-muted/80 transition-colors"
            aria-label="Import locker entries"
            data-ocid="locker.upload_button"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <input
            ref={importFileRef}
            type="file"
            accept=".txt,.json,.doc,.docx"
            className="hidden"
            onChange={handleImportFile}
            aria-label="Import file picker"
          />

          {/* Export button with dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportDropdown((v) => !v)}
              className="flex items-center gap-1 px-2 py-1.5 bg-muted rounded-lg text-xs font-medium border border-border/50 hover:bg-muted/80 transition-colors"
              aria-label="Export locker entries"
              data-ocid="locker.button"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 shrink-0" />
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border/50 rounded-xl shadow-lg z-20 min-w-[110px] py-1">
                {(["txt", "json", "doc"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => startExport(fmt)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors"
                  >
                    {fmt === "txt" && "TXT"}
                    {fmt === "json" && "JSON"}
                    {fmt === "doc" && "Word (.doc)"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={settings.timeoutMinutes}
            onChange={(e) => handleTimeoutChange(Number(e.target.value))}
            className="text-xs bg-muted/50 rounded-lg px-2 py-1.5 border border-border/50 outline-none"
            aria-label="Auto-lock timeout"
            data-ocid="locker.select"
          >
            {TIMEOUT_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onLock}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-xs font-medium border border-border/50 hover:bg-muted/80 transition-colors"
            aria-label="Lock locker"
            data-ocid="locker.toggle"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </div>

      {/* Import message */}
      {importMessage && (
        <div
          className="mx-3 mt-2 px-3 py-2 bg-primary/10 text-primary text-xs rounded-lg border border-primary/20"
          data-ocid="locker.success_state"
        >
          {importMessage}
        </div>
      )}

      {/* Entries list — scrollable area */}
      <div
        className="overflow-y-auto flex-1 p-3 sm:p-4 space-y-2"
        style={{ overscrollBehavior: "contain" }}
      >
        <button
          type="button"
          onClick={() => {
            setEditingEntry(undefined);
            setShowForm(true);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl border border-primary/30 text-sm font-medium hover:bg-primary/20 transition-colors mb-3"
          data-ocid="locker.primary_button"
        >
          <Plus className="w-4 h-4" /> Add Entry
        </button>

        {entries.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="locker.empty_state"
          >
            <Lock className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No entries yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add passwords, emails, notes, and files to your locker.
            </p>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div key={entry.id} data-ocid={`locker.item.${idx + 1}`}>
              <EntryCard
                entry={entry}
                onEdit={() => {
                  setEditingEntry(entry);
                  setShowForm(true);
                }}
                onDelete={() => handleDelete(entry.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Delete PIN Confirm Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border/50 p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-destructive" />
              <h3 className="font-semibold text-base">Confirm Delete</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Enter your Locker PIN to confirm deletion. This cannot be undone.
            </p>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="del-pin"
                  className="text-xs font-medium block mb-1"
                >
                  PIN
                </label>
                <input
                  id="del-pin"
                  type="number"
                  value={deletePin}
                  onChange={(e) => {
                    setDeletePin(e.target.value.slice(0, 6));
                    setDeleteError("");
                  }}
                  placeholder="Enter PIN"
                  inputMode="numeric"
                  className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && confirmDelete()}
                />
              </div>
              {hasPasswordSet() && (
                <div>
                  <label
                    htmlFor="del-pwd"
                    className="text-xs font-medium block mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="del-pwd"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError("");
                    }}
                    placeholder="Enter password"
                    className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && confirmDelete()}
                  />
                </div>
              )}
            </div>
            {deleteError && (
              <p className="mt-3 text-xs text-destructive p-2 bg-destructive/10 rounded-lg">
                {deleteError}
              </p>
            )}
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(undefined)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border/50 text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export / Import PIN Dialog */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border/50 p-6 max-w-sm w-full shadow-xl">
            {exportStep.kind === "chooseSecurity" && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Download className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-base">Export as</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  Choose whether to export your data as plain text or encrypted
                  (base64). Encrypted exports require your PIN to import.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleChooseSecurity(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border/50 text-sm hover:bg-muted transition-colors font-medium"
                    data-ocid="locker.cancel_button"
                  >
                    Plain
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChooseSecurity(true)}
                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    data-ocid="locker.confirm_button"
                  >
                    Encrypted
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setExportStep({ kind: "idle" })}
                  className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </>
            )}

            {(exportStep.kind === "pinPrompt" ||
              exportStep.kind === "importPinPrompt") && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-base">
                    {exportStep.kind === "pinPrompt"
                      ? "Confirm PIN to Encrypt"
                      : "Enter PIN to Decrypt"}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {exportStep.kind === "pinPrompt"
                    ? "Verify your Locker PIN before exporting encrypted data."
                    : "This file is encrypted. Enter your Locker PIN to import it."}
                </p>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="exp-pin"
                      className="text-xs font-medium block mb-1"
                    >
                      PIN
                    </label>
                    <input
                      id="exp-pin"
                      type="number"
                      value={exportPin}
                      onChange={(e) => {
                        setExportPin(e.target.value.slice(0, 6));
                        setExportError("");
                      }}
                      placeholder="Enter PIN"
                      inputMode="numeric"
                      className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (exportStep.kind === "pinPrompt"
                          ? handleExportPinConfirm()
                          : handleImportPinConfirm())
                      }
                    />
                  </div>
                  {hasPasswordSet() && (
                    <div>
                      <label
                        htmlFor="exp-pwd"
                        className="text-xs font-medium block mb-1"
                      >
                        Password
                      </label>
                      <input
                        id="exp-pwd"
                        type="password"
                        value={exportPassword}
                        onChange={(e) => {
                          setExportPassword(e.target.value);
                          setExportError("");
                        }}
                        placeholder="Enter password"
                        className="w-full bg-muted/50 rounded-lg p-2.5 text-sm border border-border/50 outline-none focus:border-primary transition-colors"
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (exportStep.kind === "pinPrompt"
                            ? handleExportPinConfirm()
                            : handleImportPinConfirm())
                        }
                      />
                    </div>
                  )}
                </div>
                {exportError && (
                  <p className="mt-3 text-xs text-destructive p-2 bg-destructive/10 rounded-lg">
                    {exportError}
                  </p>
                )}
                <div className="flex gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setExportStep({ kind: "idle" });
                      setExportPin("");
                      setExportPassword("");
                      setExportError("");
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border/50 text-sm hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={
                      exportStep.kind === "pinPrompt"
                        ? handleExportPinConfirm
                        : handleImportPinConfirm
                    }
                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    {exportStep.kind === "pinPrompt" ? "Export" : "Import"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
