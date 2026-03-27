const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CCnEiyuj.js","assets/index-CbAU3Ah_.css"])))=>i.map(i=>d[i]);
import { t as toDate, r as reactExports, d as db, s as showErrorToast, i as startOfDay, a as showSuccessToast, k as formatDateTime, R as React, j as jsxRuntimeExports, U as Upload, D as Download, P as Plus, X, I as Image$1, _ as __vitePreload } from "./index-CCnEiyuj.js";
import { u as useSpeechRecognition, D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuItem, M as MicOff, f as Mic } from "./useSpeechRecognition-BgkKGwzN.js";
import { F as FileText, a as FileType, b as FileJson, S as Search } from "./search-B8krYyu7.js";
function endOfDay(date) {
  const _date = toDate(date);
  _date.setHours(23, 59, 59, 999);
  return _date;
}
const RECORD_IMAGES_STORAGE_KEY = "recordImagesById";
function loadRecordImagesMap() {
  try {
    const raw = localStorage.getItem(RECORD_IMAGES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function saveRecordImagesMap(map) {
  try {
    localStorage.setItem(RECORD_IMAGES_STORAGE_KEY, JSON.stringify(map));
  } catch {
  }
}
function compressRecordImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_WIDTH = 1600;
      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round(height * MAX_WIDTH / width);
        width = MAX_WIDTH;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = objectUrl;
  });
}
function saveRecordImage(recordId, dataUrl) {
  const map = loadRecordImagesMap();
  map[String(recordId)] = dataUrl;
  saveRecordImagesMap(map);
}
function getRecordImage(recordId) {
  const map = loadRecordImagesMap();
  return map[String(recordId)] ?? null;
}
function useRecords() {
  const [records, setRecords] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [dateFrom, setDateFrom] = reactExports.useState("");
  const [dateTo, setDateTo] = reactExports.useState("");
  const load = reactExports.useCallback(async () => {
    try {
      const all = await db.records.toArray();
      all.sort((a, b) => b.createdAt - a.createdAt);
      setRecords(all);
    } catch {
      showErrorToast("Failed to load records");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  const filtered = reactExports.useMemo(() => {
    let result = records;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)
      );
    }
    if (dateFrom) {
      const from = startOfDay(new Date(dateFrom));
      result = result.filter((r) => new Date(r.createdAt) >= from);
    }
    if (dateTo) {
      const to = endOfDay(new Date(dateTo));
      result = result.filter((r) => new Date(r.createdAt) <= to);
    }
    return result;
  }, [records, search, dateFrom, dateTo]);
  const addRecord = reactExports.useCallback(async (title, content) => {
    try {
      const now = Date.now();
      const id = await db.records.add({
        title,
        content,
        createdAt: now,
        updatedAt: now
      });
      const newRecord = await db.records.get(id);
      if (newRecord) setRecords((prev) => [newRecord, ...prev]);
      showSuccessToast("Record saved!");
    } catch {
      showErrorToast("Failed to save record");
    }
  }, []);
  const updateRecord = reactExports.useCallback(async (record) => {
    try {
      const updated = { ...record, updatedAt: Date.now() };
      await db.records.put(updated);
      setRecords((prev) => prev.map((r) => r.id === record.id ? updated : r));
      showSuccessToast("Record updated!");
    } catch {
      showErrorToast("Failed to update record");
    }
  }, []);
  const deleteRecord = reactExports.useCallback(async (id) => {
    try {
      await db.records.delete(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showSuccessToast("Record deleted");
    } catch {
      showErrorToast("Failed to delete record");
    }
  }, []);
  const exportRecords = reactExports.useCallback(async () => {
    try {
      const all = await db.records.toArray();
      const json = JSON.stringify(all, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `records-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccessToast("Records exported!");
    } catch {
      showErrorToast("Failed to export records");
    }
  }, []);
  return {
    records: filtered,
    allRecords: records,
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
    exportRecords,
    reload: load
  };
}
function recordExportGetTimestamp() {
  const now = /* @__PURE__ */ new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}_${hh}${min}`;
}
function recordExportEscapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function recordExportTriggerDownload(content, filename, mimeType) {
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
function formatRecordForTxt(record) {
  const sep = "=".repeat(60);
  const lines = [
    sep,
    `Title: ${record.title || "(untitled)"}`,
    `Created: ${formatDateTime(record.createdAt)}`,
    `Updated: ${formatDateTime(record.updatedAt)}`,
    "",
    record.content || "",
    sep
  ];
  return lines.join("\n");
}
function formatRecordForDoc(record) {
  const body = (record.content || "").replace(/\n/g, "<br/>");
  return `
    <div style="margin-bottom:32px; border-bottom:2px solid #ccc; padding-bottom:16px;">
      <h2 style="font-size:18pt; margin-bottom:4px;">${recordExportEscapeHtml(record.title || "(untitled)")}</h2>
      <p><strong>Created:</strong> ${recordExportEscapeHtml(formatDateTime(record.createdAt))}</p>
      <p><strong>Updated:</strong> ${recordExportEscapeHtml(formatDateTime(record.updatedAt))}</p>
      <div style="margin-top:12px; white-space:pre-wrap;">${body}</div>
    </div>`;
}
function exportRecordsAsTxt(records) {
  const ts = recordExportGetTimestamp();
  const content = records.map(formatRecordForTxt).join("\n\n");
  recordExportTriggerDownload(content, `records_${ts}.txt`, "text/plain");
}
function exportRecordsAsDoc(records) {
  const ts = recordExportGetTimestamp();
  const body = records.map(formatRecordForDoc).join("");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Records Export</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  recordExportTriggerDownload(html, `records_${ts}.doc`, "application/msword");
}
function exportRecordsAsJson(records) {
  const ts = recordExportGetTimestamp();
  const content = JSON.stringify(records, null, 2);
  recordExportTriggerDownload(
    content,
    `records_${ts}.json`,
    "application/json"
  );
}
async function importRecordsFromFile(file, addRecord) {
  const text = await file.text();
  let count = 0;
  if (file.name.endsWith(".json")) {
    try {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : data.records ?? [];
      for (const r of arr) {
        const title = r.title ?? "Imported Record";
        const content = r.content ?? r.body ?? "";
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
function LoadingSpinner() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" }) });
}
function RecordsPage() {
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
    deleteRecord
  } = useRecords();
  reactExports.useEffect(() => {
    if (!loading) {
      console.log("[Records] storage key: records (IndexedDB db.records)");
      console.log("[Records] loaded:", allRecords.length);
    }
  }, [loading, allRecords.length]);
  const [showAdd, setShowAdd] = reactExports.useState(false);
  const [newTitle, setNewTitle] = reactExports.useState("");
  const [newContent, setNewContent] = reactExports.useState("");
  const [addImage, setAddImage] = reactExports.useState(null);
  const addImageInputRef = reactExports.useRef(null);
  const [addImageLoading, setAddImageLoading] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [editTitle, setEditTitle] = reactExports.useState("");
  const [editContent, setEditContent] = reactExports.useState("");
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [viewImageUrl, setViewImageUrl] = reactExports.useState(null);
  const importInputRef = reactExports.useRef(null);
  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();
  React.useEffect(() => {
    if (transcript) {
      setNewContent((prev) => prev + (prev ? " " : "") + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);
  const handleAddImageChange = reactExports.useCallback(
    async (e) => {
      var _a;
      const file = (_a = e.target.files) == null ? void 0 : _a[0];
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
    []
  );
  const handleViewRecord = reactExports.useCallback((record) => {
    setViewRecord(record);
    setViewImageUrl(null);
    if (record.id !== void 0) {
      const imgData = getRecordImage(record.id);
      if (imgData) setViewImageUrl(imgData);
    }
  }, []);
  const handleCloseView = () => {
    setViewRecord(null);
    setViewImageUrl(null);
  };
  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addRecord(newTitle.trim(), newContent.trim());
    if (addImage) {
      setTimeout(async () => {
        try {
          const { db: db2 } = await __vitePreload(async () => {
            const { db: db3 } = await import("./index-CCnEiyuj.js").then((n) => n.N);
            return { db: db3 };
          }, true ? __vite__mapDeps([0,1]) : void 0);
          const all = await db2.records.toArray();
          all.sort((a, b) => b.createdAt - a.createdAt);
          const newest = all[0];
          if (newest && newest.id !== void 0) {
            saveRecordImage(newest.id, addImage);
          }
        } catch {
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
  const handleEditSave = async () => {
    if (!editRecord || !editTitle.trim()) return;
    await updateRecord({
      ...editRecord,
      title: editTitle.trim(),
      content: editContent.trim()
    });
    setEditRecord(null);
  };
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
  const handleImportFile = async (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    e.target.value = "";
    try {
      const count = await importRecordsFromFile(file, addRecord);
      showSuccessToast(`Imported ${count} record${count !== 1 ? "s" : ""}`);
    } catch (err) {
      showErrorToast(
        `Import failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 pt-4 pb-2 gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground", children: "Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              var _a;
              return (_a = importInputRef.current) == null ? void 0 : _a.click();
            },
            className: "p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground",
            "aria-label": "Import records",
            title: "Import Records",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground",
              "aria-label": "Export all records",
              title: "Export All Records",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { children: "Export All Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: handleExportTxt, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 mr-2" }),
              " Export as TXT"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: handleExportDoc, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileType, { className: "w-4 h-4 mr-2" }),
              " Export as WORD (DOC)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: handleExportJson, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileJson, { className: "w-4 h-4 mr-2" }),
              " Export as JSON"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setShowAdd((v) => !v),
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
              "Add"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-2 flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[160px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Search,
          {
            size: 14,
            className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search records…",
            className: "w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          }
        ),
        search && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setSearch(""),
            className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 13 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "date",
          value: dateFrom,
          onChange: (e) => setDateFrom(e.target.value),
          className: "px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "date",
          value: dateTo,
          onChange: (e) => setDateTo(e.target.value),
          className: "px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        }
      ),
      (dateFrom || dateTo) && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setDateFrom("");
            setDateTo("");
          },
          className: "px-2 py-1.5 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground transition-colors",
          children: "Clear dates"
        }
      )
    ] }),
    showAdd && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-4 mb-3 p-4 rounded-xl border border-border bg-card shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: newTitle,
          onChange: (e) => setNewTitle(e.target.value),
          placeholder: "Title",
          className: "w-full mb-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: newContent + (isListening && interimTranscript ? ` ${interimTranscript}` : ""),
            onChange: (e) => setNewContent(e.target.value),
            placeholder: "Content…",
            rows: 4,
            className: "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          }
        ),
        speechSupported && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: isListening ? stopListening : startListening,
            className: `absolute bottom-2 right-2 p-1.5 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground hover:text-foreground"}`,
            title: isListening ? "Stop dictation" : "Dictate",
            children: isListening ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 14 })
          }
        )
      ] }),
      isListening && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-accent mt-1", children: "🎙 Listening… speak now" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: addImageInputRef,
            type: "file",
            accept: "image/*",
            capture: "environment",
            className: "hidden",
            onChange: handleAddImageChange
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              var _a;
              return (_a = addImageInputRef.current) == null ? void 0 : _a.click();
            },
            disabled: addImageLoading,
            className: "flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Image$1, { size: 13 }),
              addImageLoading ? "Processing…" : "Add Image"
            ]
          }
        ),
        addImage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: addImage,
              alt: "preview",
              className: "h-12 w-12 object-cover rounded-lg border border-border"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setAddImage(null),
              className: "absolute -top-1 -right-1 bg-background border border-border rounded-full p-0.5 text-muted-foreground hover:text-foreground",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 10 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleAdd,
            disabled: !newTitle.trim(),
            className: "px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity",
            children: "Save"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setShowAdd(false);
              setNewTitle("");
              setNewContent("");
              setAddImage(null);
              if (isListening) stopListening();
              resetTranscript();
            },
            className: "px-4 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted transition-colors",
            children: "Cancel"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-4 pb-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {}) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: "/assets/generated/records-empty.dim_400x300.png",
          alt: "No records",
          className: "w-48 opacity-60 mb-4",
          onError: (e) => {
            e.target.style.display = "none";
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: search || dateFrom || dateTo ? "No records match your filters." : "No records yet. Add your first record!" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: records.map((record) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "p-4 rounded-xl border border-border bg-card shadow-sm",
        children: (editRecord == null ? void 0 : editRecord.id) === record.id ? (
          /* ── inline edit ── */
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: editTitle,
                onChange: (e) => setEditTitle(e.target.value),
                className: "w-full mb-2 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: editContent,
                onChange: (e) => setEditContent(e.target.value),
                rows: 3,
                className: "w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: handleEditSave,
                  className: "px-3 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 transition-opacity",
                  children: "Save"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setEditRecord(null),
                  className: "px-3 py-1 rounded-lg border border-border bg-background text-xs text-foreground hover:bg-muted transition-colors",
                  children: "Cancel"
                }
              )
            ] })
          ] })
        ) : (
          /* ── view mode (list card) ── */
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "flex-1 text-left min-w-0",
                  onClick: () => handleViewRecord(record),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground text-sm leading-snug", children: record.title })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setEditRecord(record);
                      setEditTitle(record.title);
                      setEditContent(record.content);
                    },
                    className: "px-2 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => record.id !== void 0 && deleteRecord(record.id),
                    className: "px-2 py-0.5 rounded text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
                    children: "Delete"
                  }
                )
              ] })
            ] }),
            record.content && /* REQ-1: truncate body to 3 lines in list view */
            // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard navigation handled by the parent button above
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-3 cursor-pointer",
                onClick: () => handleViewRecord(record),
                children: record.content
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-2", children: formatDateTime(record.createdAt) })
          ] })
        )
      },
      record.id
    )) }) }),
    viewRecord && // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss is supplementary; close button provides keyboard access
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40",
        onClick: handleCloseView,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-xl max-h-[85vh] flex flex-col",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground text-base leading-snug flex-1 mr-2", children: viewRecord.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleCloseView,
                    className: "p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground",
                    "aria-label": "Close",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto px-5 py-4 flex-1 space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70", children: formatDateTime(viewRecord.createdAt) }),
                viewRecord.content && /* REQ-2: full content with preserved line breaks */
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground whitespace-pre-wrap leading-relaxed", children: viewRecord.content }),
                viewImageUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: viewImageUrl,
                    alt: "Attached",
                    className: "max-w-full h-auto rounded-xl border border-border"
                  }
                ) })
              ] })
            ]
          }
        )
      }
    )
  ] });
}
export {
  RecordsPage as default
};
