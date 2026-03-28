import { c as createLucideIcon, r as reactExports, d as db, s as showErrorToast, a as showSuccessToast, j as jsxRuntimeExports, T as TriangleAlert, X, b as Trash2, P as Plus, D as Download, f as format, e as compressImage, g as generateThumbnail, h as Pencil, i as Paperclip, k as Type, I as Image$1, L as LoadingSpinner, U as Upload } from "./index-BHZPn8sh.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuItem, u as useSpeechRecognition, F as FileDown, M as MicOff, f as Mic, g as FilePreviewModal, S as Share2 } from "./FilePreviewModal-DGMlIFZv.js";
import { T as Tag, P as Pen, F as FileText, a as FileType, b as FileJson, c as Pin, S as Search } from "./tag-CXQxriOO.js";
import { C as Check, M as Modal, I as ImageUploadPicker } from "./Modal-CEVQ08Eh.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }],
  ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }],
  ["path", { d: "M10 12h4", key: "a56b0p" }]
];
const Archive = createLucideIcon("archive", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5", key: "1uzm8b" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const SquareCheckBig = createLucideIcon("square-check-big", __iconNode);
const DEFAULT_LABELS = [
  "Work",
  "Personal",
  "Ideas",
  "Fitness",
  "Health",
  "Tech",
  "Devotional"
];
function useLabels() {
  const [labels, setLabels] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const load = reactExports.useCallback(async () => {
    try {
      const all = await db.labels.toArray();
      const seen = /* @__PURE__ */ new Set();
      for (const label of all) {
        const key = label.name.toLowerCase();
        if (seen.has(key)) {
          if (label.id !== void 0) await db.labels.delete(label.id);
        } else {
          seen.add(key);
        }
      }
      const deduped = await db.labels.toArray();
      const existingNames = deduped.map((l) => l.name.toLowerCase());
      for (const name of DEFAULT_LABELS) {
        if (!existingNames.includes(name.toLowerCase())) {
          await db.labels.add({
            name,
            color: "#6366f1",
            createdAt: Date.now()
          });
        }
      }
      const final = await db.labels.toArray();
      setLabels(final);
    } catch {
      showErrorToast("Failed to load labels");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  const createLabel = reactExports.useCallback(async (name, color) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() === "all") return;
    const existing = await db.labels.toArray();
    const duplicate = existing.some(
      (l) => l.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) return;
    try {
      const id = await db.labels.add({
        name: trimmed,
        color: color ?? "#6366f1",
        createdAt: Date.now()
      });
      const created = await db.labels.get(id);
      if (created) setLabels((prev) => [...prev, created]);
      showSuccessToast("Label created!");
    } catch {
      showErrorToast("Failed to create label");
    }
  }, []);
  const updateLabel = reactExports.useCallback(async (label) => {
    if (label.name.toLowerCase() === "all") return;
    try {
      if (label.id !== void 0) {
        const stored = await db.labels.get(label.id);
        if (stored && stored.name.toLowerCase() === "all") return;
      }
      await db.labels.put(label);
      setLabels((prev) => prev.map((l) => l.id === label.id ? label : l));
      showSuccessToast("Label updated!");
    } catch {
      showErrorToast("Failed to update label");
    }
  }, []);
  const deleteLabel = reactExports.useCallback(
    async (id, onReassign) => {
      try {
        const label = await db.labels.get(id);
        if (!label) return;
        if (label.name.toLowerCase() === "all") return;
        if (onReassign) {
          await onReassign(label.name);
        } else {
          const allNotes = await db.notes.toArray();
          const affected = allNotes.filter(
            (n) => n.labels.includes(label.name)
          );
          for (const n of affected) {
            await db.notes.put({
              ...n,
              labels: n.labels.filter((l) => l !== label.name),
              updatedAt: Date.now()
            });
          }
        }
        await db.labels.delete(id);
        setLabels((prev) => prev.filter((l) => l.id !== id));
        showSuccessToast("Label deleted");
      } catch {
        showErrorToast("Failed to delete label");
      }
    },
    []
  );
  return {
    labels,
    loading,
    createLabel,
    updateLabel,
    deleteLabel,
    reload: load
  };
}
function useNotes() {
  const [notes, setNotes] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [labelFilter, setLabelFilter] = reactExports.useState("");
  const [view, setView] = reactExports.useState("all");
  const [selectedIds, setSelectedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const load = reactExports.useCallback(async () => {
    try {
      const all = await db.notes.toArray();
      all.sort((a, b) => b.updatedAt - a.updatedAt);
      setNotes(all);
    } catch {
      showErrorToast("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  const filtered = reactExports.useMemo(() => {
    let result = notes;
    if (view === "all")
      result = result.filter((n) => !n.archived && !n.trashed);
    else if (view === "archive")
      result = result.filter((n) => n.archived && !n.trashed);
    else if (view === "trash") result = result.filter((n) => n.trashed);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.checklistItems.some((i) => i.text.toLowerCase().includes(q)) || n.labels.some((l) => l.toLowerCase().includes(q))
      );
    }
    if (labelFilter) {
      result = result.filter((n) => n.labels.includes(labelFilter));
    }
    return [
      ...result.filter((n) => n.pinned),
      ...result.filter((n) => !n.pinned)
    ];
  }, [notes, view, search, labelFilter]);
  const createNote = reactExports.useCallback(
    async (note) => {
      try {
        const now = Date.now();
        const id = await db.notes.add({
          ...note,
          createdAt: now,
          updatedAt: now
        });
        const created = await db.notes.get(id);
        if (created) setNotes((prev) => [created, ...prev]);
        showSuccessToast("Note created!");
        return id;
      } catch {
        showErrorToast("Failed to create note");
        return null;
      }
    },
    []
  );
  const updateNote = reactExports.useCallback(async (note) => {
    try {
      const updated = { ...note, updatedAt: Date.now() };
      await db.notes.put(updated);
      setNotes((prev) => prev.map((n) => n.id === note.id ? updated : n));
      showSuccessToast("Note saved!");
    } catch {
      showErrorToast("Failed to save note");
    }
  }, []);
  const deleteNote = reactExports.useCallback(async (id) => {
    try {
      await db.notes.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showSuccessToast("Note deleted permanently");
    } catch {
      showErrorToast("Failed to delete note");
    }
  }, []);
  const trashNote = reactExports.useCallback(
    async (id) => {
      try {
        const note = notes.find((n) => n.id === id);
        if (!note) return;
        const updated = {
          ...note,
          trashed: true,
          archived: false,
          updatedAt: Date.now()
        };
        await db.notes.put(updated);
        setNotes((prev) => prev.map((n) => n.id === id ? updated : n));
        showSuccessToast("Note moved to trash");
      } catch {
        showErrorToast("Failed to trash note");
      }
    },
    [notes]
  );
  const restoreNote = reactExports.useCallback(
    async (id) => {
      try {
        const note = notes.find((n) => n.id === id);
        if (!note) return;
        const updated = {
          ...note,
          trashed: false,
          archived: false,
          updatedAt: Date.now()
        };
        await db.notes.put(updated);
        setNotes((prev) => prev.map((n) => n.id === id ? updated : n));
        showSuccessToast("Note restored!");
      } catch {
        showErrorToast("Failed to restore note");
      }
    },
    [notes]
  );
  const archiveNote = reactExports.useCallback(
    async (id) => {
      try {
        const note = notes.find((n) => n.id === id);
        if (!note) return;
        const updated = { ...note, archived: true, updatedAt: Date.now() };
        await db.notes.put(updated);
        setNotes((prev) => prev.map((n) => n.id === id ? updated : n));
        showSuccessToast("Note archived");
      } catch {
        showErrorToast("Failed to archive note");
      }
    },
    [notes]
  );
  const togglePin = reactExports.useCallback(
    async (id) => {
      try {
        const note = notes.find((n) => n.id === id);
        if (!note) return;
        const updated = {
          ...note,
          pinned: !note.pinned,
          updatedAt: Date.now()
        };
        await db.notes.put(updated);
        setNotes((prev) => prev.map((n) => n.id === id ? updated : n));
      } catch {
        showErrorToast("Failed to pin note");
      }
    },
    [notes]
  );
  const bulkAction = reactExports.useCallback(
    async (action, ids) => {
      try {
        for (const id of ids) {
          const note = notes.find((n) => n.id === id);
          if (!note) continue;
          if (action === "archive") {
            await db.notes.put({
              ...note,
              archived: true,
              updatedAt: Date.now()
            });
          } else if (action === "trash") {
            await db.notes.put({
              ...note,
              trashed: true,
              archived: false,
              updatedAt: Date.now()
            });
          } else if (action === "delete") {
            await db.notes.delete(id);
          }
        }
        await load();
        setSelectedIds(/* @__PURE__ */ new Set());
        showSuccessToast(
          `${ids.length} note(s) ${action === "delete" ? "deleted" : `${action}d`}`
        );
      } catch {
        showErrorToast("Bulk action failed");
      }
    },
    [notes, load]
  );
  const toggleSelect = reactExports.useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const clearSelection = reactExports.useCallback(() => setSelectedIds(/* @__PURE__ */ new Set()), []);
  const bulkReassignLabel = reactExports.useCallback(
    async (labelName) => {
      try {
        const allNotes = await db.notes.toArray();
        const affected = allNotes.filter((n) => n.labels.includes(labelName));
        for (const n of affected) {
          const updated = {
            ...n,
            labels: n.labels.filter((l) => l !== labelName),
            updatedAt: Date.now()
          };
          await db.notes.put(updated);
        }
        await load();
      } catch {
        showErrorToast("Failed to reassign notes");
      }
    },
    [load]
  );
  const emptyTrash = reactExports.useCallback(async () => {
    try {
      const allNotes = await db.notes.toArray();
      const trashed = allNotes.filter((n) => n.trashed);
      for (const n of trashed) {
        if (n.id !== void 0) {
          await db.notes.delete(n.id);
        }
      }
      setNotes((prev) => prev.filter((n) => !n.trashed));
      showSuccessToast("Trash emptied");
    } catch {
      showErrorToast("Failed to empty trash");
    }
  }, []);
  return {
    notes: filtered,
    allNotes: notes,
    loading,
    search,
    setSearch,
    labelFilter,
    setLabelFilter,
    view,
    setView,
    selectedIds,
    toggleSelect,
    clearSelection,
    createNote,
    updateNote,
    deleteNote,
    trashNote,
    restoreNote,
    archiveNote,
    togglePin,
    bulkAction,
    bulkReassignLabel,
    emptyTrash,
    reload: load
  };
}
function LabelManager({
  isOpen,
  onClose,
  onLabelsChanged
}) {
  const { labels, createLabel, updateLabel, deleteLabel } = useLabels();
  const { bulkReassignLabel } = useNotes();
  const [newLabelName, setNewLabelName] = reactExports.useState("");
  const [editingId, setEditingId] = reactExports.useState(null);
  const [editingName, setEditingName] = reactExports.useState("");
  const [confirmDeleteId, setConfirmDeleteId] = reactExports.useState(null);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  if (!isOpen) return null;
  const isReserved = (name) => name.trim().toLowerCase() === "all";
  const handleCreate = async () => {
    if (!newLabelName.trim()) return;
    if (isReserved(newLabelName)) return;
    await createLabel(newLabelName.trim());
    setNewLabelName("");
    onLabelsChanged == null ? void 0 : onLabelsChanged();
  };
  const handleStartEdit = (label) => {
    if (isReserved(label.name)) return;
    if (label.id === void 0) return;
    setEditingId(label.id);
    setEditingName(label.name);
  };
  const handleSaveEdit = async () => {
    if (!editingName.trim() || editingId === null) return;
    if (isReserved(editingName)) return;
    const label = labels.find((l) => l.id === editingId);
    if (!label) return;
    const oldName = label.name;
    const newName = editingName.trim();
    await updateLabel({ ...label, name: newName });
    setEditingId(null);
    setEditingName("");
    onLabelsChanged == null ? void 0 : onLabelsChanged({ type: "rename", oldName, newName });
  };
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };
  const handleRequestDelete = (id) => {
    setConfirmDeleteId(id);
  };
  const handleConfirmDelete = async () => {
    if (confirmDeleteId === null) return;
    setIsDeleting(true);
    try {
      await deleteLabel(confirmDeleteId, bulkReassignLabel);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
    onLabelsChanged == null ? void 0 : onLabelsChanged();
  };
  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };
  const confirmLabel = labels.find((l) => l.id === confirmDeleteId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", children: [
    confirmDeleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center bg-black/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 20, className: "text-destructive shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground", children: "Delete label?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mb-5", children: [
        "The label",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
          '"',
          confirmLabel == null ? void 0 : confirmLabel.name,
          '"'
        ] }),
        " ",
        "will be removed from all notes. This cannot be undone."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleCancelDelete,
            disabled: isDeleting,
            className: "px-4 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: handleConfirmDelete,
            disabled: isDeleting,
            className: "px-4 py-2 rounded-lg text-sm bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2",
            children: [
              isDeleting && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin" }),
              "Delete"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: 18, className: "text-accent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground", children: "Manage Labels" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "p-1 rounded-lg hover:bg-muted transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18, className: "text-muted-foreground" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3 max-h-80 overflow-y-auto", children: [
        labels.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No labels yet. Add one below." }),
        labels.map((label) => {
          const reserved = isReserved(label.name);
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 group", children: editingId === label.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: editingName,
                onChange: (e) => setEditingName(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                },
                className: "flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleSaveEdit,
                className: "p-1.5 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleCancelEdit,
                className: "p-1.5 rounded-lg hover:bg-muted transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14, className: "text-muted-foreground" })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm text-foreground", children: label.name }),
            !reserved && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleStartEdit(label),
                  className: "p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all",
                  title: "Rename label",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 14, className: "text-muted-foreground" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => label.id !== void 0 && handleRequestDelete(label.id),
                  className: "p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all",
                  title: "Delete label",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14, className: "text-destructive" })
                }
              )
            ] })
          ] }) }, label.id);
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: newLabelName,
            onChange: (e) => setNewLabelName(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && handleCreate(),
            placeholder: "New label name...",
            className: "flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleCreate,
            disabled: !newLabelName.trim() || isReserved(newLabelName),
            className: "px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 })
          }
        )
      ] }) })
    ] })
  ] });
}
function getTimestamp() {
  const now = /* @__PURE__ */ new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}_${hh}${min}`;
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function triggerDownload(content, filename, mimeType) {
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
function getNoteBody(note) {
  if (note.type === "checklist") {
    return note.checklistItems.map((i) => `${i.checked ? "[x]" : "[ ]"} ${i.text}`).join("\n");
  }
  return note.content || "";
}
function formatNoteForTxt(note) {
  const sep = "=".repeat(60);
  const lines = [
    sep,
    `Title: ${note.title || "(untitled)"}`,
    `Labels: ${(note.labels || []).join(", ") || "none"}`,
    `Pinned: ${note.pinned ? "Yes" : "No"}`,
    `Archived: ${note.archived ? "Yes" : "No"}`,
    `Trashed: ${note.trashed ? "Yes" : "No"}`,
    `Created: ${note.createdAt ? new Date(note.createdAt).toLocaleString() : "unknown"}`,
    `Updated: ${note.updatedAt ? new Date(note.updatedAt).toLocaleString() : "unknown"}`,
    "",
    getNoteBody(note),
    sep
  ];
  return lines.join("\n");
}
function formatNoteForDoc(note) {
  const rawBody = getNoteBody(note);
  const body = rawBody.replace(/\n/g, "<br/>");
  return `
    <div style="margin-bottom:32px; border-bottom:2px solid #ccc; padding-bottom:16px;">
      <h2 style="font-size:18pt; margin-bottom:4px;">${escapeHtml(note.title || "(untitled)")}</h2>
      <p><strong>Labels:</strong> ${escapeHtml((note.labels || []).join(", ") || "none")}</p>
      <p><strong>Pinned:</strong> ${note.pinned ? "Yes" : "No"} &nbsp;
         <strong>Archived:</strong> ${note.archived ? "Yes" : "No"} &nbsp;
         <strong>Trashed:</strong> ${note.trashed ? "Yes" : "No"}</p>
      <p><strong>Created:</strong> ${note.createdAt ? new Date(note.createdAt).toLocaleString() : "unknown"}</p>
      <p><strong>Updated:</strong> ${note.updatedAt ? new Date(note.updatedAt).toLocaleString() : "unknown"}</p>
      <div style="margin-top:12px; white-space:pre-wrap;">${body}</div>
    </div>`;
}
function exportAllNotesAsTxt(notes) {
  const content = notes.map(formatNoteForTxt).join("\n\n");
  triggerDownload(content, `notes_all_${getTimestamp()}.txt`, "text/plain");
}
function exportAllNotesAsDoc(notes) {
  const body = notes.map(formatNoteForDoc).join("");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Notes Export</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  triggerDownload(
    html,
    `notes_all_${getTimestamp()}.doc`,
    "application/msword"
  );
}
function exportAllNotesAsJson(notes) {
  const content = JSON.stringify(notes, null, 2);
  triggerDownload(
    content,
    `notes_all_${getTimestamp()}.json`,
    "application/json"
  );
}
function exportSelectedNotesAsTxt(notes) {
  const content = notes.map(formatNoteForTxt).join("\n\n");
  triggerDownload(
    content,
    `notes_selected_${getTimestamp()}.txt`,
    "text/plain"
  );
}
function exportSelectedNotesAsDoc(notes) {
  const body = notes.map(formatNoteForDoc).join("");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Notes Export</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  triggerDownload(
    html,
    `notes_selected_${getTimestamp()}.doc`,
    "application/msword"
  );
}
function exportSelectedNotesAsJson(notes) {
  const content = JSON.stringify(notes, null, 2);
  triggerDownload(
    content,
    `notes_selected_${getTimestamp()}.json`,
    "application/json"
  );
}
function exportNoteAsDoc(note) {
  const body = formatNoteForDoc(note);
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(note.title || "Note")}</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  const safeTitle = (note.title || "Note").replace(/[^a-z0-9]/gi, "_").substring(0, 40);
  const ts = getTimestamp();
  triggerDownload(html, `${safeTitle}_${ts}.doc`, "application/msword");
}
function MultiSelectToolbar({
  count,
  selectedNotes,
  onArchive,
  onTrash,
  onDelete: _onDelete,
  onClear
}) {
  const handleExportSelected = (format2) => {
    try {
      if (format2 === "txt") exportSelectedNotesAsTxt(selectedNotes);
      else if (format2 === "doc") exportSelectedNotesAsDoc(selectedNotes);
      else exportSelectedNotesAsJson(selectedNotes);
      showSuccessToast(
        `Exported ${selectedNotes.length} note(s) as ${format2.toUpperCase()}`
      );
    } catch {
      showErrorToast("Export failed. Please try again.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-card animate-slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onClear,
        className: "p-1.5 rounded-lg hover:bg-muted transition-colors",
        "aria-label": "Clear selection",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-sm flex-1", children: [
      count,
      " selected"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onArchive,
        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm",
        "aria-label": "Archive selected notes",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-4 h-4" }),
          "Archive"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onTrash,
        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm",
        "aria-label": "Move selected notes to trash",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }),
          "Trash"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm",
          "aria-label": "Export selected notes",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
            "Export"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { children: "Export Selected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleExportSelected("txt"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 mr-2" }),
          " Export as TXT"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleExportSelected("doc"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileType, { className: "w-4 h-4 mr-2" }),
          " Export as WORD (DOC)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleExportSelected("json"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileJson, { className: "w-4 h-4 mr-2" }),
          " Export as JSON"
        ] })
      ] })
    ] })
  ] }) });
}
function NoteCard({
  note,
  isSelected,
  onSelect,
  onClick,
  onPin,
  onArchive,
  onTrash,
  showActions = true,
  imageUrl
}) {
  const [thumbUrl, setThumbUrl] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let objectUrl = null;
    if (note.type === "image" && note.imageRefs && note.imageRefs.length > 0) {
      db.imageBlobs.toArray().then((blobs) => {
        const rec = blobs.find(
          (b) => b.key === note.imageRefs[0] && b.type === "thumbnail"
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
  const handlePin = (e) => {
    e.stopPropagation();
    if (note.id) onPin(note.id);
  };
  const handleArchive = (e) => {
    e.stopPropagation();
    if (note.id) onArchive(note.id);
  };
  const handleTrash = (e) => {
    e.stopPropagation();
    if (note.id) onTrash(note.id);
  };
  const handleSelect = (e) => {
    e.stopPropagation();
    if (note.id) onSelect(note.id);
  };
  const renderContent = () => {
    if (note.type === "checklist" && note.checklistItems && note.checklistItems.length > 0) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 mt-1", children: [
        note.checklistItems.slice(0, 3).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "li",
          {
            className: "flex items-center gap-1.5 text-xs text-muted-foreground",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center ${item.checked ? "bg-primary border-primary" : "border-muted-foreground"}`,
                  children: item.checked && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "svg",
                    {
                      width: "8",
                      height: "8",
                      viewBox: "0 0 8 8",
                      fill: "none",
                      "aria-hidden": "true",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("title", { children: "Checked" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "path",
                          {
                            d: "M1 4l2 2 4-4",
                            stroke: "white",
                            strokeWidth: "1.5",
                            strokeLinecap: "round",
                            strokeLinejoin: "round"
                          }
                        )
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: item.checked ? "line-through opacity-60" : "", children: item.text })
            ]
          },
          item.id
        )),
        note.checklistItems.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-xs text-muted-foreground/60 pl-4", children: [
          "+",
          note.checklistItems.length - 3,
          " more…"
        ] })
      ] });
    }
    if (note.content) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-3 break-words", children: note.content });
    }
    return null;
  };
  const displayImage = thumbUrl || imageUrl;
  return (
    // biome-ignore lint/a11y/useSemanticElements: note card uses div to allow nested interactive elements (menu, checkbox) which are invalid inside <button>
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        role: "button",
        className: `note-card relative rounded-xl border cursor-pointer transition-all duration-150 group
        ${isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/40"}
        ${note.pinned ? "shadow-md" : ""}
      `,
        onClick: handleCardClick,
        style: {
          background: note.color && note.color !== "default" ? note.color : "var(--card)"
        },
        tabIndex: 0,
        onKeyDown: (e) => {
          if (e.key === "Enter") onClick(note);
        },
        "aria-label": `Note: ${note.title || "Untitled"}${note.pinned ? ", pinned" : ""}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `absolute top-2 left-2 z-10 transition-opacity duration-150
          ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`,
              onClick: handleSelect,
              onKeyDown: (e) => e.key === "Enter" && handleSelect(e),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `w-5 h-5 rounded-full border-2 flex items-center justify-center
            ${isSelected ? "bg-primary border-primary" : "border-muted-foreground bg-card/80"}`,
                  children: isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary-foreground text-xs", children: "✓" })
                }
              )
            }
          ),
          note.pinned && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "w-3 h-3 text-primary fill-primary" }) }),
          displayImage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-32 overflow-hidden rounded-t-xl bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: displayImage,
              alt: note.title || "Note image",
              className: "w-full h-full object-cover block",
              loading: "lazy"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
            note.title && /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm text-foreground mb-1 break-words", children: note.title }),
            renderContent(),
            note.labels && note.labels.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: note.labels.slice(0, 3).map((label) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary",
                children: label
              },
              label
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground opacity-60", children: note.updatedAt ? new Date(note.updatedAt).toLocaleDateString(void 0, {
                month: "short",
                day: "numeric"
              }) : "" }),
              showActions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "w-6 h-6 flex items-center justify-center rounded opacity-70 hover:opacity-100 hover:bg-muted transition-all",
                    onClick: handlePin,
                    "aria-label": note.pinned ? "Unpin note" : "Pin note",
                    title: note.pinned ? "Unpin" : "Pin",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Pin,
                      {
                        className: `w-3.5 h-3.5 ${note.pinned ? "text-primary fill-primary" : "text-muted-foreground"}`
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "w-6 h-6 flex items-center justify-center rounded opacity-70 hover:opacity-100 hover:bg-muted transition-all",
                    onClick: handleArchive,
                    "aria-label": note.archived ? "Unarchive note" : "Archive note",
                    title: note.archived ? "Unarchive" : "Archive",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-3.5 h-3.5 text-muted-foreground" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "w-6 h-6 flex items-center justify-center rounded opacity-70 hover:opacity-100 hover:bg-muted transition-all",
                    onClick: handleTrash,
                    "aria-label": note.trashed ? "Delete note permanently" : "Move note to trash",
                    title: note.trashed ? "Delete" : "Trash",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-destructive" })
                  }
                )
              ] })
            ] })
          ] })
        ]
      }
    )
  );
}
function useImageStorage() {
  const saveImage = reactExports.useCallback(
    async (key, blob, type) => {
      try {
        const all = await db.imageBlobs.toArray();
        const existing = all.find((i) => i.key === key && i.type === type);
        if (existing == null ? void 0 : existing.id) await db.imageBlobs.delete(existing.id);
        await db.imageBlobs.add({ key, blob, type, createdAt: Date.now() });
      } catch {
        showErrorToast("Failed to save image");
      }
    },
    []
  );
  const getImageUrl = reactExports.useCallback(
    async (key, type) => {
      try {
        const all = await db.imageBlobs.toArray();
        const record = all.find((i) => i.key === key && i.type === type);
        if (!record) return null;
        return URL.createObjectURL(record.blob);
      } catch {
        return null;
      }
    },
    []
  );
  const deleteImage = reactExports.useCallback(async (key) => {
    try {
      const all = await db.imageBlobs.toArray();
      const toDelete = all.filter((i) => i.key === key);
      for (const item of toDelete) {
        if (item.id) await db.imageBlobs.delete(item.id);
      }
    } catch {
      showErrorToast("Failed to delete image");
    }
  }, []);
  return { saveImage, getImageUrl, deleteImage };
}
const PEN_COLORS = [
  { label: "Black", value: "#1a1a1a" },
  { label: "Red", value: "#e53e3e" },
  { label: "Blue", value: "#3182ce" },
  { label: "Green", value: "#38a169" },
  { label: "Orange", value: "#dd6b20" },
  { label: "Purple", value: "#805ad5" }
];
function SketchCanvas({
  isOpen,
  onClose,
  onSave,
  backgroundImageUrl
}) {
  const canvasRef = reactExports.useRef(null);
  const [isDrawing, setIsDrawing] = reactExports.useState(false);
  const [penColor, setPenColor] = reactExports.useState("#1a1a1a");
  const [penSize, setPenSize] = reactExports.useState(3);
  const [isEraser, setIsEraser] = reactExports.useState(false);
  const lastPos = reactExports.useRef(null);
  const bgImageRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    var _a;
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const draw2 = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (bgImageRef.current) {
        ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
    if (backgroundImageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        var _a2;
        bgImageRef.current = img;
        const maxW = ((_a2 = canvas.parentElement) == null ? void 0 : _a2.clientWidth) || 360;
        const ratio = img.naturalHeight / img.naturalWidth;
        canvas.width = maxW;
        canvas.height = maxW * ratio;
        draw2();
      };
      img.src = backgroundImageUrl;
    } else {
      bgImageRef.current = null;
      const maxW = ((_a = canvas.parentElement) == null ? void 0 : _a.clientWidth) || 360;
      canvas.width = maxW;
      canvas.height = Math.round(maxW * 0.6);
      draw2();
    }
  }, [isOpen, backgroundImageUrl]);
  const getPos = reactExports.useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    },
    []
  );
  const startDrawing = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      const pos = getPos(e);
      if (!pos) return;
      setIsDrawing(true);
      lastPos.current = pos;
    },
    [getPos]
  );
  const draw = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pos = getPos(e);
      if (!pos || !lastPos.current) return;
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = isEraser ? "#ffffff" : penColor;
      ctx.lineWidth = isEraser ? penSize * 4 : penSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      lastPos.current = pos;
    },
    [isDrawing, getPos, penColor, penSize, isEraser]
  );
  const stopDrawing = reactExports.useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);
  const handleClear = reactExports.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
    }
  }, []);
  const handleSave = reactExports.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  }, [onSave]);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed inset-0 z-[200] flex flex-col bg-black/90",
      "aria-label": "Sketch canvas",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onClose,
              className: "p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors",
              "aria-label": "Cancel sketch",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-medium text-sm", children: backgroundImageUrl ? "Draw on Image" : "Sketch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleSave,
              className: "px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity",
              "aria-label": "Save sketch",
              children: "Save"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "canvas",
          {
            ref: canvasRef,
            className: "touch-none rounded-lg shadow-xl block",
            style: {
              maxWidth: "100%",
              cursor: isEraser ? "cell" : "crosshair",
              background: "#fff"
            },
            onMouseDown: startDrawing,
            onMouseMove: draw,
            onMouseUp: stopDrawing,
            onMouseLeave: stopDrawing,
            onTouchStart: startDrawing,
            onTouchMove: draw,
            onTouchEnd: stopDrawing,
            "aria-label": "Drawing canvas"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-900 border-t border-gray-700 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mb-3 justify-center flex-wrap", children: PEN_COLORS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setPenColor(c.value);
                setIsEraser(false);
              },
              className: "transition-transform hover:scale-110",
              style: {
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: c.value,
                border: !isEraser && penColor === c.value ? "3px solid white" : "2px solid rgba(255,255,255,0.3)",
                transform: !isEraser && penColor === c.value ? "scale(1.2)" : void 0
              },
              "aria-label": `Use ${c.label} pen`,
              title: c.label
            },
            c.value
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setPenSize((s) => Math.max(1, s - 1)),
                  className: "p-1 rounded text-gray-300 hover:text-white",
                  "aria-label": "Decrease pen size",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "rounded-full bg-white transition-all",
                  style: {
                    width: penSize * 3,
                    height: penSize * 3,
                    minWidth: 4,
                    minHeight: 4
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setPenSize((s) => Math.min(20, s + 1)),
                  className: "p-1 rounded text-gray-300 hover:text-white",
                  "aria-label": "Increase pen size",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setIsEraser((v) => !v),
                className: `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isEraser ? "bg-white text-gray-900" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`,
                "aria-label": isEraser ? "Switch to pen" : "Switch to eraser",
                children: isEraser ? "✏️ Pen" : "⬜ Eraser"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleClear,
                className: "p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors",
                "aria-label": "Clear canvas",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
              }
            )
          ] })
        ] })
      ]
    }
  );
}
const NOTE_ATTACHMENTS_KEY = "noteAttachmentsById";
function saveNoteAttachments(noteKey, attachments) {
  try {
    const store = JSON.parse(
      localStorage.getItem(NOTE_ATTACHMENTS_KEY) || "{}"
    );
    store[noteKey] = attachments;
    localStorage.setItem(NOTE_ATTACHMENTS_KEY, JSON.stringify(store));
  } catch {
  }
}
function loadNoteAttachments(noteKey) {
  try {
    const store = JSON.parse(
      localStorage.getItem(NOTE_ATTACHMENTS_KEY) || "{}"
    );
    return store[noteKey] || [];
  } catch {
    return [];
  }
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a;
      return resolve((_a = e.target) == null ? void 0 : _a.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function getNoteStorageKey(note) {
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
  { label: "Gray", value: "#f5f5f5" }
];
function extractHashtags(text) {
  const matches = text.match(/#[\w]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}
function NoteModal({
  note,
  isOpen,
  onClose,
  onSave,
  onTrash,
  onArchive,
  onPin
}) {
  const { labels } = useLabels();
  const { saveImage, getImageUrl } = useImageStorage();
  const [title, setTitle] = reactExports.useState("");
  const [content, setContent] = reactExports.useState("");
  const [checklistItems, setChecklistItems] = reactExports.useState([]);
  const [color, setColor] = reactExports.useState("default");
  const [selectedLabels, setSelectedLabels] = reactExports.useState([]);
  const [reminderAt, setReminderAt] = reactExports.useState("");
  const [imageUrl, setImageUrl] = reactExports.useState(null);
  const [showColorPicker, setShowColorPicker] = reactExports.useState(false);
  const [showLabelPicker, setShowLabelPicker] = reactExports.useState(false);
  const [newCheckItem, setNewCheckItem] = reactExports.useState("");
  const [showImagePicker, setShowImagePicker] = reactExports.useState(false);
  const [imgNaturalAspect, setImgNaturalAspect] = reactExports.useState(null);
  const [showSketchCanvas, setShowSketchCanvas] = reactExports.useState(false);
  const [sketchBgUrl, setSketchBgUrl] = reactExports.useState(null);
  const [showInlineChecklist, setShowInlineChecklist] = reactExports.useState(false);
  const [attachedFiles, setAttachedFiles] = reactExports.useState([]);
  const [previewFile, setPreviewFile] = reactExports.useState(null);
  const [showFilePreview, setShowFilePreview] = reactExports.useState(false);
  const [showAttachPicker, setShowAttachPicker] = reactExports.useState(false);
  const attachCameraRef = reactExports.useRef(null);
  const attachGalleryRef = reactExports.useRef(null);
  const attachFileRef = reactExports.useRef(null);
  const [activeField, setActiveField] = reactExports.useState(
    "content"
  );
  const contentRef = reactExports.useRef(null);
  const titleRef = reactExports.useRef(null);
  const cameraInputRef = reactExports.useRef(null);
  const galleryInputRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  const uploadTriggerRef = reactExports.useRef(null);
  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();
  const lastTranscriptRef = reactExports.useRef("");
  const hashtags = reactExports.useMemo(() => extractHashtags(content), [content]);
  reactExports.useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setChecklistItems(note.checklistItems);
      setColor(note.color || "default");
      setSelectedLabels(note.labels);
      setReminderAt(
        note.reminderAt ? format(new Date(note.reminderAt), "yyyy-MM-dd'T'HH:mm") : ""
      );
      setImgNaturalAspect(null);
      setShowInlineChecklist(note.checklistItems.length > 0);
      if (note.type === "image" && note.imageRefs.length > 0) {
        getImageUrl(note.imageRefs[0], "full").then((url) => setImageUrl(url));
      } else {
        setImageUrl(null);
      }
      const storageKey = getNoteStorageKey(note);
      const stored = loadNoteAttachments(storageKey);
      const converted = stored.map((a) => ({
        key: a.key,
        name: a.name,
        mimeType: a.mimeType,
        url: a.dataUrl,
        size: a.size
      }));
      setAttachedFiles(converted);
    }
  }, [note, getImageUrl]);
  reactExports.useEffect(() => {
    if (!isOpen) {
      if (isListening) stopListening();
      resetTranscript();
      lastTranscriptRef.current = "";
      setShowImagePicker(false);
      setShowAttachPicker(false);
      setShowFilePreview(false);
      setPreviewFile(null);
      setShowSketchCanvas(false);
      setSketchBgUrl(null);
    }
  }, [isOpen, isListening, stopListening, resetTranscript]);
  reactExports.useEffect(() => {
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
        const sep = prev && !prev.endsWith(" ") && !prev.endsWith("\n") ? " " : "";
        return prev + sep + newPart.trim();
      });
    }
  }, [transcript, activeField]);
  const handleMicToggle = reactExports.useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      lastTranscriptRef.current = "";
      startListening();
    }
  }, [isListening, startListening, stopListening, resetTranscript]);
  const handleSketchSave = reactExports.useCallback(
    (dataUrl) => {
      if (!note) return;
      const key = `note-sketch-${note.id || Date.now()}-${Date.now()}`;
      const name = `sketch-${Date.now()}.png`;
      const stored = {
        key,
        name,
        mimeType: "image/png",
        dataUrl,
        size: dataUrl.length
      };
      setAttachedFiles((prev) => {
        const display = {
          key,
          name,
          mimeType: "image/png",
          url: dataUrl,
          size: dataUrl.length
        };
        const merged = [...prev, display];
        const storageKey = getNoteStorageKey(note);
        const allStored = loadNoteAttachments(storageKey);
        saveNoteAttachments(storageKey, [...allStored, stored]);
        return merged;
      });
      setShowSketchCanvas(false);
      setSketchBgUrl(null);
    },
    [note]
  );
  const handleAttachFiles = reactExports.useCallback(
    async (files) => {
      if (!files || files.length === 0 || !note) return;
      const newAttachments = [];
      const newDisplayFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const dataUrl = await fileToDataUrl(file);
          const key = `note-att-${note.id || Date.now()}-${Date.now()}-${i}`;
          const stored = {
            key,
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            dataUrl,
            size: file.size
          };
          newAttachments.push(stored);
          newDisplayFiles.push({
            key,
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            url: dataUrl,
            size: file.size
          });
        } catch {
          showErrorToast(`Failed to attach file: ${file.name}`);
        }
      }
      if (newAttachments.length > 0) {
        setAttachedFiles((prev) => {
          const merged = [...prev, ...newDisplayFiles];
          const storageKey = getNoteStorageKey(note);
          const allStored = loadNoteAttachments(storageKey);
          saveNoteAttachments(storageKey, [...allStored, ...newAttachments]);
          return merged;
        });
      }
    },
    [note]
  );
  const handleRemoveAttachment = reactExports.useCallback(
    (key) => {
      if (!note) return;
      setAttachedFiles((prev) => {
        const updated = prev.filter((f) => f.key !== key);
        const storageKey = getNoteStorageKey(note);
        const allStored = loadNoteAttachments(storageKey).filter(
          (s) => s.key !== key
        );
        saveNoteAttachments(storageKey, allStored);
        return updated;
      });
    },
    [note]
  );
  const handleOpenPreview = reactExports.useCallback((file) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  }, []);
  const handleAttachCameraChange = reactExports.useCallback(
    async (e) => {
      await handleAttachFiles(e.target.files);
      e.target.value = "";
    },
    [handleAttachFiles]
  );
  const handleAttachGalleryChange = reactExports.useCallback(
    async (e) => {
      await handleAttachFiles(e.target.files);
      e.target.value = "";
    },
    [handleAttachFiles]
  );
  const handleAttachFileChange = reactExports.useCallback(
    async (e) => {
      await handleAttachFiles(e.target.files);
      e.target.value = "";
    },
    [handleAttachFiles]
  );
  const handleSave = reactExports.useCallback(() => {
    if (!note) return;
    if (isListening) stopListening();
    const updated = {
      ...note,
      title,
      content,
      checklistItems,
      color,
      labels: selectedLabels,
      reminderAt: reminderAt ? new Date(reminderAt).getTime() : null
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
    stopListening
  ]);
  const handleExportDoc = reactExports.useCallback(() => {
    if (!note) return;
    const current = {
      ...note,
      title,
      content,
      checklistItems,
      labels: selectedLabels,
      reminderAt: reminderAt ? new Date(reminderAt).getTime() : null
    };
    exportNoteAsDoc(current);
  }, [note, title, content, checklistItems, color, selectedLabels, reminderAt]);
  const addCheckItem = reactExports.useCallback(() => {
    if (!newCheckItem.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        text: newCheckItem.trim(),
        checked: false
      }
    ]);
    setNewCheckItem("");
  }, [newCheckItem]);
  const toggleCheckItem = reactExports.useCallback((id) => {
    setChecklistItems(
      (prev) => prev.map((i) => i.id === id ? { ...i, checked: !i.checked } : i)
    );
  }, []);
  const removeCheckItem = reactExports.useCallback((id) => {
    setChecklistItems((prev) => prev.filter((i) => i.id !== id));
  }, []);
  const handleImageUpload = reactExports.useCallback(
    async (e) => {
      var _a;
      const file = (_a = e.target.files) == null ? void 0 : _a[0];
      if (!file || !note) return;
      e.target.value = "";
      try {
        const [compressed, thumbnail] = await Promise.all([
          compressImage(file),
          generateThumbnail(file)
        ]);
        const key = `note-${note.id || Date.now()}`;
        await saveImage(key, compressed, "full");
        await saveImage(key, thumbnail, "thumbnail");
        const url = URL.createObjectURL(compressed);
        setImageUrl(url);
        setImgNaturalAspect(null);
        const updated = {
          ...note,
          title,
          content,
          checklistItems,
          color,
          labels: selectedLabels,
          imageRefs: [key]
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
      onSave
    ]
  );
  const handleImageLoad = (e) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setImgNaturalAspect(img.naturalWidth / img.naturalHeight);
    }
  };
  if (!note) return null;
  const bgStyle = color !== "default" ? { backgroundColor: color } : {};
  const ChecklistEditor = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    checklistItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => toggleCheckItem(item.id),
          className: `w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors
            ${item.checked ? "bg-primary border-primary" : "border-muted-foreground"}`,
          "aria-label": `${item.checked ? "Uncheck" : "Check"} item: ${item.text}`,
          children: item.checked && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary-foreground text-[8px]", children: "✓" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: item.text,
          onChange: (e) => setChecklistItems(
            (prev) => prev.map(
              (i) => i.id === item.id ? { ...i, text: e.target.value } : i
            )
          ),
          className: `flex-1 bg-transparent text-sm outline-none ${item.checked ? "line-through text-muted-foreground" : ""}`,
          "aria-label": `Checklist item: ${item.text}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => removeCheckItem(item.id),
          className: "text-muted-foreground hover:text-destructive transition-colors",
          "aria-label": `Remove item: ${item.text}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-3 h-3" })
        }
      )
    ] }, item.id)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: newCheckItem,
          onChange: (e) => setNewCheckItem(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && addCheckItem(),
          placeholder: "List item",
          className: "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60",
          "aria-label": "Add new checklist item"
        }
      ),
      newCheckItem && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: addCheckItem,
          className: "text-primary text-xs",
          children: "Add"
        }
      )
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SketchCanvas,
      {
        isOpen: showSketchCanvas,
        onClose: () => {
          setShowSketchCanvas(false);
          setSketchBgUrl(null);
        },
        onSave: handleSketchSave,
        backgroundImageUrl: sketchBgUrl
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { isOpen, onClose: handleSave, size: "2xl", showClose: false, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: bgStyle, className: "bg-card rounded-xl -m-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "sticky top-0 z-30 flex flex-wrap items-center justify-between gap-y-2 px-4 pt-4 pb-3 rounded-t-xl bg-card backdrop-blur-sm shadow-sm min-h-[52px]",
          style: bgStyle,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-shrink-0 flex-wrap items-center gap-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    if (note.id) onPin(note.id);
                  },
                  className: `p-1.5 rounded-lg hover:bg-black/10 transition-colors ${note.pinned ? "text-primary" : "text-muted-foreground"}`,
                  "aria-label": note.pinned ? "Unpin note" : "Pin note",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowColorPicker(!showColorPicker),
                  className: "p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground",
                  "aria-label": "Change note color",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-4 h-4 rounded-full border-2 border-current",
                      style: {
                        backgroundColor: color !== "default" ? color : void 0
                      }
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowLabelPicker(!showLabelPicker),
                  className: "p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground text-xs font-medium",
                  "aria-label": "Manage labels",
                  children: "🏷️"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    if (note.id) onArchive(note.id);
                    onClose();
                  },
                  className: "p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground",
                  "aria-label": "Archive note",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: handleExportDoc,
                  className: "p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground",
                  "aria-label": "Export note as document",
                  title: "Export as .DOC",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-4 h-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-shrink-0 items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    if (note.id) onTrash(note.id);
                    onClose();
                  },
                  className: "p-1.5 rounded-lg hover:bg-black/10 transition-colors text-muted-foreground",
                  "aria-label": "Move to trash",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: handleSave,
                  className: "px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity",
                  "aria-label": "Save and close note",
                  children: "Done"
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-6 flex flex-col gap-3", children: [
        showColorPicker && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 p-2 bg-card/80 rounded-lg", children: NOTE_COLORS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setColor(c.value);
              setShowColorPicker(false);
            },
            className: `w-6 h-6 rounded-full border-2 transition-transform hover:scale-110
                    ${color === c.value ? "border-primary scale-110" : "border-border"}`,
            style: {
              backgroundColor: c.value === "default" ? void 0 : c.value
            },
            "aria-label": `Set color to ${c.label}`,
            title: c.label,
            children: c.value === "default" && /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3 mx-auto text-muted-foreground" })
          },
          c.value
        )) }),
        showLabelPicker && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 p-2 bg-card/80 rounded-lg", children: labels.map((label) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setSelectedLabels(
                (prev) => prev.includes(label.name) ? prev.filter((l) => l !== label.name) : [...prev, label.name]
              );
            },
            className: `text-xs px-2 py-1 rounded-full border transition-colors
                    ${selectedLabels.includes(label.name) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`,
            "aria-label": `${selectedLabels.includes(label.name) ? "Remove" : "Add"} label ${label.name}`,
            children: label.name
          },
          label.id
        )) }),
        selectedLabels.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: selectedLabels.map((lbl) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: "text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-medium",
            children: [
              "🏷️ ",
              lbl
            ]
          },
          lbl
        )) }),
        hashtags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: hashtags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full font-medium",
            style: {
              background: "rgba(59,130,246,0.12)",
              color: "#2563eb",
              border: "1px solid rgba(59,130,246,0.3)"
            },
            "aria-label": `Hashtag ${tag}`,
            children: tag
          },
          tag
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: titleRef,
            value: title,
            onChange: (e) => setTitle(e.target.value),
            onFocus: () => setActiveField("title"),
            placeholder: "Title",
            className: "w-full bg-transparent text-lg font-semibold placeholder:text-muted-foreground/60 outline-none",
            "aria-label": "Note title"
          }
        ),
        note.type === "text" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              ref: contentRef,
              value: content + (isListening && interimTranscript ? interimTranscript : ""),
              onChange: (e) => {
                const val = e.target.value;
                if (isListening && interimTranscript && val.endsWith(interimTranscript)) {
                  setContent(
                    val.slice(0, val.length - interimTranscript.length)
                  );
                } else {
                  setContent(val);
                }
              },
              onFocus: () => setActiveField("content"),
              placeholder: "Take a note... (use #hashtag to tag)",
              className: "w-full bg-transparent text-base placeholder:text-muted-foreground/60 outline-none resize-none min-h-[260px] pr-8",
              "aria-label": "Note content"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1 right-0 flex items-center", children: !speechSupported ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground italic", children: "Speech not supported" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleMicToggle,
              className: `p-1 rounded-lg transition-colors ${isListening ? "text-destructive hover:bg-destructive/10 animate-pulse" : "text-muted-foreground hover:bg-black/10"}`,
              "aria-label": isListening ? "Stop speech recognition" : "Start speech recognition",
              title: isListening ? "Stop dictation" : "Dictate note",
              children: isListening ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "w-3.5 h-3.5" })
            }
          ) })
        ] }),
        note.type === "text" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          isListening && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-primary flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" }),
            "Listening…",
            interimTranscript ? ` "${interimTranscript}"` : ""
          ] }),
          speechError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-destructive", children: speechError })
        ] }),
        note.type === "text" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowInlineChecklist((v) => !v),
              className: `flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${showInlineChecklist ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`,
              "aria-label": "Toggle checklist",
              "aria-expanded": showInlineChecklist,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "w-3.5 h-3.5" }),
                "Checklist",
                checklistItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5", children: checklistItems.length })
              ]
            }
          ),
          showInlineChecklist && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 pl-1", children: ChecklistEditor })
        ] }),
        note.type === "text" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setSketchBgUrl(null);
              setShowSketchCanvas(true);
            },
            className: "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground w-fit",
            "aria-label": "Open sketch canvas",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }),
              "Draw / Sketch"
            ]
          }
        ),
        note.type === "checklist" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: ChecklistEditor }),
        note.type === "image" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: cameraInputRef,
              type: "file",
              accept: "image/*",
              capture: "environment",
              className: "hidden",
              onChange: handleImageUpload,
              "aria-label": "Capture image with camera"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: galleryInputRef,
              type: "file",
              accept: "image/*",
              className: "hidden",
              onChange: handleImageUpload,
              "aria-label": "Select image from gallery"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: fileInputRef,
              type: "file",
              accept: "image/*",
              className: "hidden",
              onChange: handleImageUpload,
              "aria-label": "Upload image file"
            }
          ),
          imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: imageUrl,
                alt: title || "Note image",
                onLoad: handleImageLoad,
                className: "w-full h-auto rounded-xl block",
                style: imgNaturalAspect ? { aspectRatio: String(imgNaturalAspect) } : void 0
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setSketchBgUrl(imageUrl);
                  setShowSketchCanvas(true);
                },
                className: "absolute top-2 right-2 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors",
                "aria-label": "Draw on this image",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }),
                  "Draw"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-32 bg-muted/30 rounded-xl border-2 border-dashed border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "No image attached" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: uploadTriggerRef, className: "relative inline-block", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowImagePicker((v) => !v),
                  className: "text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground",
                  "aria-label": "Change image",
                  children: imageUrl ? "Change image" : "Add image"
                }
              ),
              showImagePicker && /* @__PURE__ */ jsxRuntimeExports.jsx(
                ImageUploadPicker,
                {
                  isOpen: showImagePicker,
                  onClose: () => setShowImagePicker(false),
                  onCameraClick: () => {
                    var _a;
                    setShowImagePicker(false);
                    (_a = cameraInputRef.current) == null ? void 0 : _a.click();
                  },
                  onGalleryClick: () => {
                    var _a;
                    setShowImagePicker(false);
                    (_a = galleryInputRef.current) == null ? void 0 : _a.click();
                  },
                  onFileClick: () => {
                    var _a;
                    setShowImagePicker(false);
                    (_a = fileInputRef.current) == null ? void 0 : _a.click();
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setSketchBgUrl(null);
                  setShowSketchCanvas(true);
                },
                className: "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground",
                "aria-label": "Open blank sketch canvas",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }),
                  "Sketch"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: content,
              onChange: (e) => setContent(e.target.value),
              placeholder: "Add a caption...",
              className: "w-full bg-transparent text-sm placeholder:text-muted-foreground/60 outline-none resize-none min-h-[60px]",
              "aria-label": "Image caption"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: attachCameraRef,
            type: "file",
            accept: "image/*",
            capture: "environment",
            multiple: true,
            className: "hidden",
            onChange: handleAttachCameraChange,
            "aria-label": "Capture photo with camera for attachment"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: attachGalleryRef,
            type: "file",
            accept: "*/*",
            multiple: true,
            className: "hidden",
            onChange: handleAttachGalleryChange,
            "aria-label": "Select files from gallery for attachment"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: attachFileRef,
            type: "file",
            accept: "*/*",
            multiple: true,
            className: "hidden",
            onChange: handleAttachFileChange,
            "aria-label": "Upload documents or files for attachment"
          }
        ),
        attachedFiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground font-medium uppercase tracking-wide", children: [
            "Attachments (",
            attachedFiles.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: attachedFiles.map((af) => {
            const isImg = af.mimeType.startsWith("image/");
            const isVid = af.mimeType.startsWith("video/");
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "relative group rounded-lg overflow-hidden border border-border/50 bg-muted/20",
                style: { maxWidth: isImg ? 120 : void 0 },
                children: [
                  isImg ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleOpenPreview(af),
                      className: "block w-full",
                      "aria-label": `Preview ${af.name}`,
                      title: af.name,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: af.url,
                          alt: af.name,
                          className: "w-full h-auto block",
                          style: { maxHeight: 100, objectFit: "contain" }
                        }
                      )
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleOpenPreview(af),
                      className: "flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-muted transition-colors w-full text-left",
                      "aria-label": `Preview or download ${af.name}`,
                      title: af.name,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none shrink-0", children: isVid ? "🎬" : af.mimeType === "application/pdf" ? "📄" : "📎" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[120px]", children: af.name })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleRemoveAttachment(af.key),
                      className: "absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-destructive",
                      "aria-label": `Remove attachment ${af.name}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-2.5 h-2.5" })
                    }
                  )
                ]
              },
              af.key
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowAttachPicker((v) => !v),
              className: "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground",
              "aria-label": "Add attachment",
              "aria-expanded": showAttachPicker,
              "data-ocid": "notes.upload_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3.5 h-3.5" }),
                "Add Attachment"
              ]
            }
          ),
          showAttachPicker && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  var _a;
                  setShowAttachPicker(false);
                  (_a = attachCameraRef.current) == null ? void 0 : _a.click();
                },
                className: "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground",
                "aria-label": "Open camera",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📷" }),
                  " Camera"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  var _a;
                  setShowAttachPicker(false);
                  (_a = attachFileRef.current) == null ? void 0 : _a.click();
                },
                className: "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground",
                "aria-label": "Add files",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📁" }),
                  " Add Files"
                ]
              }
            )
          ] })
        ] }),
        selectedLabels.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: selectedLabels.map((label) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary",
            children: label
          },
          label
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              className: "text-xs text-muted-foreground shrink-0",
              htmlFor: "note-reminder",
              children: "Reminder"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "note-reminder",
              type: "datetime-local",
              value: reminderAt,
              onChange: (e) => setReminderAt(e.target.value),
              className: "flex-1 bg-transparent text-xs outline-none border border-border/50 rounded-lg px-2 py-1 focus:border-primary transition-colors",
              "aria-label": "Set reminder"
            }
          ),
          reminderAt && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setReminderAt(""),
              className: "text-muted-foreground hover:text-destructive transition-colors",
              "aria-label": "Clear reminder",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
            }
          )
        ] }),
        note.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-[10px] text-muted-foreground/60 pt-1 border-t border-border/20", children: [
          note.createdAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Created: ",
            new Date(note.createdAt).toLocaleString()
          ] }),
          note.updatedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Updated: ",
            new Date(note.updatedAt).toLocaleString()
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilePreviewModal,
      {
        file: previewFile,
        isOpen: showFilePreview,
        onClose: () => {
          setShowFilePreview(false);
          setPreviewFile(null);
        }
      }
    )
  ] });
}
function QuickAddBar({ onAdd }) {
  const [expanded, setExpanded] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card rounded-xl border border-border/50 shadow-card mb-4", children: !expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: () => setExpanded(true),
      className: "w-full px-4 py-3 text-left text-sm text-muted-foreground hover:text-foreground transition-colors",
      "aria-label": "Take a note",
      children: "Take a note..."
    }
  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "Choose note type:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            onAdd("text");
            setExpanded(false);
          },
          className: "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:bg-muted transition-colors",
          "aria-label": "Create text note",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { className: "w-5 h-5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Text" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            onAdd("checklist");
            setExpanded(false);
          },
          className: "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:bg-muted transition-colors",
          "aria-label": "Create checklist note",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "w-5 h-5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Checklist" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            onAdd("image");
            setExpanded(false);
          },
          className: "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:bg-muted transition-colors",
          "aria-label": "Create image note",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { className: "w-5 h-5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Image" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setExpanded(false),
        className: "mt-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1",
        "aria-label": "Cancel",
        children: "Cancel"
      }
    )
  ] }) });
}
function generateNumericId() {
  return Date.now() + Math.floor(Math.random() * 1e4);
}
function makeNote(overrides) {
  return {
    id: overrides.id,
    type: overrides.type ?? "text",
    title: overrides.title ?? "",
    content: overrides.content ?? "",
    checklistItems: overrides.checklistItems ?? [],
    imageRefs: overrides.imageRefs ?? [],
    color: overrides.color ?? "default",
    labels: overrides.labels ?? [],
    pinned: overrides.pinned ?? false,
    archived: overrides.archived ?? false,
    trashed: overrides.trashed ?? false,
    reminderAt: overrides.reminderAt ?? null,
    createdAt: overrides.createdAt ?? Date.now(),
    updatedAt: overrides.updatedAt ?? Date.now()
  };
}
function parseJsonNotes(text, existingIds) {
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  return arr.map((item) => {
    const n = item;
    let id = typeof n.id === "number" ? n.id : generateNumericId();
    if (existingIds.has(id)) {
      id = generateNumericId();
    }
    existingIds.add(id);
    return makeNote({
      id,
      type: n.type ?? "text",
      title: typeof n.title === "string" ? n.title : "",
      content: typeof n.content === "string" ? n.content : "",
      checklistItems: Array.isArray(n.checklistItems) ? n.checklistItems : [],
      imageRefs: Array.isArray(n.imageRefs) ? n.imageRefs : [],
      color: typeof n.color === "string" ? n.color : "default",
      labels: Array.isArray(n.labels) ? n.labels : [],
      pinned: !!n.pinned,
      archived: !!n.archived,
      trashed: !!n.trashed,
      reminderAt: typeof n.reminderAt === "number" ? n.reminderAt : null,
      createdAt: typeof n.createdAt === "number" ? n.createdAt : Date.now(),
      updatedAt: typeof n.updatedAt === "number" ? n.updatedAt : Date.now()
    });
  });
}
function parseTxtNotes(text, existingIds) {
  const sep = "=".repeat(60);
  const blocks = text.split(sep).map((b) => b.trim()).filter(Boolean);
  if (blocks.length > 0 && blocks[0].startsWith("Title:")) {
    return blocks.map((block) => {
      const lines = block.split("\n");
      const get = (prefix) => {
        const line = lines.find((l) => l.startsWith(prefix));
        return line ? line.slice(prefix.length).trim() : "";
      };
      const emptyIdx = lines.findIndex((l) => l === "");
      const content = emptyIdx >= 0 ? lines.slice(emptyIdx + 1).join("\n").trim() : "";
      const labelsStr = get("Labels:");
      const labels = labelsStr && labelsStr !== "none" ? labelsStr.split(",").map((l) => l.trim()) : [];
      let id2 = generateNumericId();
      while (existingIds.has(id2)) id2 = generateNumericId();
      existingIds.add(id2);
      return makeNote({
        id: id2,
        title: get("Title:"),
        content,
        labels,
        pinned: get("Pinned:") === "Yes",
        archived: get("Archived:") === "Yes",
        trashed: get("Trashed:") === "Yes"
      });
    });
  }
  let id = generateNumericId();
  while (existingIds.has(id)) id = generateNumericId();
  existingIds.add(id);
  return [makeNote({ id, title: "Imported Note", content: text })];
}
function parseDocNotes(text, existingIds) {
  const stripped = text.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
  let id = generateNumericId();
  while (existingIds.has(id)) id = generateNumericId();
  existingIds.add(id);
  return [makeNote({ id, title: "Imported Note", content: stripped })];
}
async function importNotesFromFile(file, existingNotes) {
  var _a;
  const existingIds = new Set(
    existingNotes.map((n) => n.id).filter((id) => id !== void 0)
  );
  const ext = ((_a = file.name.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
  try {
    const text = await file.text();
    let notes = [];
    if (ext === "json") {
      notes = parseJsonNotes(text, existingIds);
    } else if (ext === "txt") {
      notes = parseTxtNotes(text, existingIds);
    } else if (ext === "doc" || ext === "docx") {
      notes = parseDocNotes(text, existingIds);
    } else {
      return {
        count: 0,
        error: "Unsupported file format. Please use .json, .txt, or .doc/.docx."
      };
    }
    if (notes.length === 0) {
      return { count: 0, error: "No notes found in the file." };
    }
    for (const note of notes) {
      const { id: _id, ...noteWithoutId } = note;
      await db.notes.add(noteWithoutId);
    }
    return { count: notes.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error during import.";
    return { count: 0, error: msg };
  }
}
function NotesPage({
  initialQuickAdd,
  onQuickAddHandled
}) {
  const {
    notes,
    allNotes,
    loading,
    search,
    setSearch,
    labelFilter,
    setLabelFilter,
    view,
    setView,
    selectedIds,
    toggleSelect,
    clearSelection,
    createNote,
    updateNote,
    trashNote,
    archiveNote,
    togglePin,
    bulkAction,
    restoreNote,
    deleteNote,
    reload
  } = useNotes();
  const { labels, reload: reloadLabels } = useLabels();
  const [selectedNote, setSelectedNote] = reactExports.useState(null);
  const [showLabelManager, setShowLabelManager] = reactExports.useState(false);
  const importInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (initialQuickAdd) {
      handleQuickAdd("text");
      onQuickAddHandled == null ? void 0 : onQuickAddHandled();
    }
  }, [initialQuickAdd]);
  const handleQuickAdd = reactExports.useCallback(
    async (type) => {
      const id = await createNote({
        type,
        title: "",
        content: "",
        checklistItems: [],
        imageRefs: [],
        color: "default",
        labels: [],
        pinned: false,
        archived: false,
        trashed: false,
        reminderAt: null
      });
      if (id) {
        setTimeout(async () => {
          const note = await db.notes.get(id);
          if (note) setSelectedNote(note);
        }, 100);
      }
    },
    [createNote]
  );
  const handleNoteClick = reactExports.useCallback(
    (note) => {
      if (selectedIds.size > 0) {
        if (note.id) toggleSelect(note.id);
      } else {
        setSelectedNote(note);
      }
    },
    [selectedIds.size, toggleSelect]
  );
  const handleSaveNote = reactExports.useCallback(
    async (note) => {
      await updateNote(note);
      setSelectedNote(null);
    },
    [updateNote]
  );
  const handleLabelsChanged = reactExports.useCallback(
    (change) => {
      reloadLabels();
      if ((change == null ? void 0 : change.type) === "rename" && labelFilter === change.oldName) {
        setLabelFilter(change.newName);
      }
    },
    [reloadLabels, labelFilter, setLabelFilter]
  );
  const handleExportAll = reactExports.useCallback(
    (format2) => {
      try {
        if (format2 === "txt") exportAllNotesAsTxt(allNotes);
        else if (format2 === "doc") exportAllNotesAsDoc(allNotes);
        else exportAllNotesAsJson(allNotes);
        showSuccessToast(
          `Exported ${allNotes.length} note(s) as ${format2.toUpperCase()}`
        );
      } catch {
        showErrorToast("Export failed. Please try again.");
      }
    },
    [allNotes]
  );
  const handleShare = reactExports.useCallback(async () => {
    if (!allNotes.length) {
      showErrorToast("No notes to share");
      return;
    }
    const text = allNotes.map((n) => `${n.title || "Untitled"}
${n.content || ""}`).join("\n\n---\n\n");
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Notes", text });
      } catch {
      }
    } else {
      await navigator.clipboard.writeText(text);
      showSuccessToast("Copied to clipboard");
    }
  }, [allNotes]);
  const handleImportClick = reactExports.useCallback(() => {
    var _a;
    (_a = importInputRef.current) == null ? void 0 : _a.click();
  }, []);
  const handleImportFile = reactExports.useCallback(
    async (e) => {
      var _a;
      const file = (_a = e.target.files) == null ? void 0 : _a[0];
      if (!file) return;
      e.target.value = "";
      const result = await importNotesFromFile(file, allNotes);
      if (result.error) {
        showErrorToast(`Import failed: ${result.error}`);
      } else {
        showSuccessToast(`Imported ${result.count} note(s) successfully`);
        reload();
      }
    },
    [allNotes, reload]
  );
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {});
  const isMultiSelect = selectedIds.size > 0;
  const selectedNotes = allNotes.filter(
    (n) => n.id !== void 0 && selectedIds.has(n.id)
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-0", children: [
      isMultiSelect && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MultiSelectToolbar,
        {
          count: selectedIds.size,
          selectedNotes,
          onArchive: () => bulkAction("archive", Array.from(selectedIds)),
          onTrash: () => bulkAction("trash", Array.from(selectedIds)),
          onDelete: () => bulkAction("delete", Array.from(selectedIds)),
          onClear: clearSelection
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          view === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleQuickAdd("text"),
              className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium",
              "aria-label": "Add new note",
              "data-ocid": "notes.primary_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
                "New Note"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleImportClick,
              className: "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground font-medium",
              "aria-label": "Import notes",
              title: "Import Notes",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Import" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: importInputRef,
              type: "file",
              accept: ".json,.txt,.doc,.docx",
              className: "hidden",
              onChange: handleImportFile
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                className: "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground font-medium",
                "aria-label": "Export all notes",
                title: "Export All Notes",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { children: "Export All Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleExportAll("txt"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 mr-2" }),
                " Export as TXT"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleExportAll("doc"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileType, { className: "w-4 h-4 mr-2" }),
                " Export as WORD (DOC)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleExportAll("json"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileJson, { className: "w-4 h-4 mr-2" }),
                " Export as JSON"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: handleShare, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-4 h-4 mr-2" }),
                " Share"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowLabelManager(true),
              className: "p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground",
              "aria-label": "Manage labels",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 bg-muted/50 rounded-xl p-1 mb-3", children: [
        { id: "all", label: "Notes", icon: null },
        { id: "archive", label: "Archive", icon: Archive },
        { id: "trash", label: "Trash", icon: Trash2 }
      ].map(({ id, label, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setView(id),
          className: `flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                ${view === id ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"}`,
          "aria-label": `${label} view`,
          "aria-current": view === id ? "page" : void 0,
          children: [
            Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3 h-3" }),
            label
          ]
        },
        id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search notes...",
            className: "w-full pl-9 pr-4 py-2 bg-muted/50 rounded-xl text-sm outline-none border border-border/50 focus:border-primary transition-colors",
            "aria-label": "Search notes"
          }
        ),
        search && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setSearch(""),
            className: "absolute right-3 top-1/2 -translate-y-1/2",
            "aria-label": "Clear search",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-muted-foreground" })
          }
        )
      ] }),
      labels.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 overflow-x-auto pb-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setLabelFilter(""),
            className: `shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors
                ${!labelFilter ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`,
            "aria-label": "Show all notes",
            children: "All"
          }
        ),
        labels.map((label) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setLabelFilter(labelFilter === label.name ? "" : label.name),
            className: `shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors
                  ${labelFilter === label.name ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`,
            "aria-label": `Filter by label ${label.name}`,
            children: label.name
          },
          label.id
        ))
      ] }),
      view === "all" && /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAddBar, { onAdd: handleQuickAdd }),
      notes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: "/assets/generated/notes-empty.dim_400x300.png",
            alt: "No notes",
            className: "w-48 mx-auto mb-4 opacity-60"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: view === "all" ? "No notes yet. Take your first note!" : view === "archive" ? "No archived notes" : "Trash is empty" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto min-h-0 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "masonry-grid masonry-grid-2 md:masonry-grid-3", children: notes.map((note) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        NoteCard,
        {
          note,
          isSelected: note.id ? selectedIds.has(note.id) : false,
          onSelect: toggleSelect,
          onClick: handleNoteClick,
          onPin: togglePin,
          onArchive: view === "trash" ? restoreNote : view === "archive" ? restoreNote : archiveNote,
          onTrash: view === "trash" ? deleteNote : trashNote,
          showActions: true
        },
        note.id
      )) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      NoteModal,
      {
        note: selectedNote,
        isOpen: !!selectedNote,
        onClose: () => setSelectedNote(null),
        onSave: handleSaveNote,
        onTrash: (id) => {
          trashNote(id);
          setSelectedNote(null);
        },
        onArchive: (id) => {
          archiveNote(id);
          setSelectedNote(null);
        },
        onPin: togglePin
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LabelManager,
      {
        isOpen: showLabelManager,
        onClose: () => setShowLabelManager(false),
        onLabelsChanged: handleLabelsChanged
      }
    )
  ] });
}
export {
  NotesPage
};
