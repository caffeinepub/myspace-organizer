const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-Bp53jmYJ.js","assets/index-TwKypv4f.css"])))=>i.map(i=>d[i]);
import { c as createLucideIcon, t as toDate, r as reactExports, d as db, s as showErrorToast, i as startOfDay, a as showSuccessToast, k as formatDateTime, R as React, j as jsxRuntimeExports, U as Upload, D as Download, P as Plus, X, B as BookOpen, _ as __vitePreload, b as Trash2 } from "./index-Bp53jmYJ.js";
import { u as useSpeechRecognition, D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuItem, M as MicOff, f as Mic, I as ImageUploadPicker, P as Paperclip, F as FilePreviewModal } from "./ImageUploadPicker-BhXSNZ7c.js";
import { u as useCamera } from "./useCamera-B3qtmFsF.js";
import { F as FileText, a as FileType, b as FileJson, S as Search, T as Tag, c as Pin, P as Pen } from "./tag-C7nhrmw_.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
      key: "1tc9qg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
];
const Star = createLucideIcon("star", __iconNode);
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
const RECORD_TAGS_KEY = "recordTagsById";
const RECORD_PINNED_KEY = "recordPinnedIds";
const RECORD_MULTI_ATTACH_KEY = "recordMultiAttachmentsById";
function loadTagsById() {
  try {
    return JSON.parse(localStorage.getItem(RECORD_TAGS_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function saveTagsById(map) {
  localStorage.setItem(RECORD_TAGS_KEY, JSON.stringify(map));
}
function loadPinnedIds() {
  try {
    const arr = JSON.parse(localStorage.getItem(RECORD_PINNED_KEY) ?? "[]");
    return new Set(arr);
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function savePinnedIds(set) {
  localStorage.setItem(RECORD_PINNED_KEY, JSON.stringify([...set]));
}
function loadAttachmentsFor(id) {
  try {
    const all = JSON.parse(
      localStorage.getItem(RECORD_MULTI_ATTACH_KEY) ?? "{}"
    );
    return all[id] ?? [];
  } catch {
    return [];
  }
}
function saveAttachmentsFor(id, files) {
  try {
    const all = JSON.parse(
      localStorage.getItem(RECORD_MULTI_ATTACH_KEY) ?? "{}"
    );
    all[id] = files;
    localStorage.setItem(RECORD_MULTI_ATTACH_KEY, JSON.stringify(all));
  } catch {
  }
}
const RECORD_TAGS = [
  "Personal",
  "Work",
  "Health",
  "Travel",
  "Idea",
  "Memory"
];
const TAG_COLORS = {
  Personal: {
    border: "border-l-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
  },
  Work: {
    border: "border-l-indigo-400",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
  },
  Health: {
    border: "border-l-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
  },
  Travel: {
    border: "border-l-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
  },
  Idea: {
    border: "border-l-purple-400",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
  },
  Memory: {
    border: "border-l-rose-400",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
  }
};
function getDateLabel(ts) {
  const d = new Date(ts);
  const today = /* @__PURE__ */ new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function groupByDate(records) {
  const groups = /* @__PURE__ */ new Map();
  for (const r of records) {
    const label = getDateLabel(r.createdAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(r);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items
  }));
}
function CameraModal({ onCapture, onClose }) {
  const {
    isActive,
    isLoading,
    error,
    startCamera,
    capturePhoto,
    videoRef,
    canvasRef
  } = useCamera({ facingMode: "environment" });
  reactExports.useEffect(() => {
    startCamera();
  }, []);
  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      onCapture(file);
      onClose();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-xl overflow-hidden w-full max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-black", style: { minHeight: 240 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "video",
        {
          ref: videoRef,
          autoPlay: true,
          playsInline: true,
          muted: true,
          className: "w-full h-auto",
          style: { minHeight: 240, display: "block" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "hidden" }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-sm", children: "Starting camera…" }) }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/70 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400 text-sm text-center", children: error.message }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: "flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleCapture,
          disabled: !isActive || isLoading,
          className: "flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50",
          children: "Capture"
        }
      )
    ] })
  ] }) });
}
function RecordsPage() {
  var _a;
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
  const [tagsById, setTagsById] = reactExports.useState(
    () => loadTagsById()
  );
  const [pinnedIds, setPinnedIds] = reactExports.useState(
    () => loadPinnedIds()
  );
  const [showAdd, setShowAdd] = reactExports.useState(false);
  const [newTitle, setNewTitle] = reactExports.useState("");
  const [newContent, setNewContent] = reactExports.useState("");
  const [newTag, setNewTag] = reactExports.useState("");
  const [addImage, setAddImage] = reactExports.useState(null);
  const [addImageLoading, setAddImageLoading] = reactExports.useState(false);
  const [addAttachments, setAddAttachments] = reactExports.useState([]);
  const [showAddImagePicker, setShowAddImagePicker] = reactExports.useState(false);
  const [showAddCameraModal, setShowAddCameraModal] = reactExports.useState(false);
  const addGalleryInputRef = reactExports.useRef(null);
  const addFileInputRef = reactExports.useRef(null);
  const addImagePickerAnchorRef = reactExports.useRef(null);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [editTitle, setEditTitle] = reactExports.useState("");
  const [editContent, setEditContent] = reactExports.useState("");
  const [editTag, setEditTag] = reactExports.useState("");
  const [editAttachments, setEditAttachments] = reactExports.useState([]);
  const [showEditImagePicker, setShowEditImagePicker] = reactExports.useState(false);
  const [showEditCameraModal, setShowEditCameraModal] = reactExports.useState(false);
  const editGalleryInputRef = reactExports.useRef(null);
  const editFileInputRef = reactExports.useRef(null);
  const editImagePickerAnchorRef = reactExports.useRef(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [viewImageUrl, setViewImageUrl] = reactExports.useState(null);
  const [viewAttachments, setViewAttachments] = reactExports.useState([]);
  const [previewFile, setPreviewFile] = reactExports.useState(null);
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
  const lastTranscriptRef = reactExports.useRef("");
  React.useEffect(() => {
    if (!transcript) return;
    const newPart = transcript.slice(lastTranscriptRef.current.length);
    if (!newPart) return;
    lastTranscriptRef.current = transcript;
    setNewContent((prev) => prev + (prev ? " " : "") + newPart.trim());
  }, [transcript]);
  const setTag = (id, tag) => {
    const next = { ...tagsById, [id]: tag };
    setTagsById(next);
    saveTagsById(next);
  };
  const togglePin = (id) => {
    const next = new Set(pinnedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPinnedIds(next);
    savePinnedIds(next);
  };
  const processImageFile = reactExports.useCallback(
    async (file, setImg, setLoading) => {
      setLoading(true);
      try {
        const dataUrl = await compressRecordImage(file);
        setImg(dataUrl);
      } catch {
        showErrorToast("Failed to process image");
      } finally {
        setLoading(false);
      }
    },
    []
  );
  const handleAddGalleryChange = reactExports.useCallback(
    async (e) => {
      var _a2;
      const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
      if (!file) return;
      await processImageFile(file, setAddImage, setAddImageLoading);
      if (e.target) e.target.value = "";
    },
    [processImageFile]
  );
  const handleAddFileChange = reactExports.useCallback(
    async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const newAttachments = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("read error"));
          reader.readAsDataURL(f);
        });
        newAttachments.push({
          key: `rec-add-${Date.now()}-${i}`,
          name: f.name,
          mimeType: f.type || "application/octet-stream",
          dataUrl,
          size: f.size
        });
      }
      setAddAttachments((prev) => [...prev, ...newAttachments]);
      if (e.target) e.target.value = "";
    },
    []
  );
  const handleAddCameraCapture = reactExports.useCallback(
    async (file) => {
      await processImageFile(file, setAddImage, setAddImageLoading);
    },
    [processImageFile]
  );
  const handleEditGalleryChange = reactExports.useCallback(
    async (e) => {
      var _a2;
      const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
      if (!file) return;
      const dataUrl = await compressRecordImage(file);
      setEditAttachments((prev) => [
        ...prev,
        {
          key: `rec-edit-${Date.now()}`,
          name: file.name,
          mimeType: file.type,
          dataUrl,
          size: file.size
        }
      ]);
      if (e.target) e.target.value = "";
    },
    []
  );
  const handleEditFileChange = reactExports.useCallback(
    async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const newAttachments = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("read error"));
          reader.readAsDataURL(f);
        });
        newAttachments.push({
          key: `rec-edit-${Date.now()}-${i}`,
          name: f.name,
          mimeType: f.type || "application/octet-stream",
          dataUrl,
          size: f.size
        });
      }
      setEditAttachments((prev) => [...prev, ...newAttachments]);
      if (e.target) e.target.value = "";
    },
    []
  );
  const handleEditCameraCapture = reactExports.useCallback(async (file) => {
    const dataUrl = await compressRecordImage(file);
    setEditAttachments((prev) => [
      ...prev,
      {
        key: `rec-edit-cam-${Date.now()}`,
        name: "camera-capture.jpg",
        mimeType: "image/jpeg",
        dataUrl,
        size: file.size
      }
    ]);
  }, []);
  const handleViewRecord = reactExports.useCallback((record) => {
    setViewRecord(record);
    setViewImageUrl(null);
    if (record.id !== void 0) {
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
  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await addRecord(newTitle.trim(), newContent.trim());
    setTimeout(async () => {
      try {
        const { db: db2 } = await __vitePreload(async () => {
          const { db: db3 } = await import("./index-Bp53jmYJ.js").then((n) => n.O);
          return { db: db3 };
        }, true ? __vite__mapDeps([0,1]) : void 0);
        const all = await db2.records.toArray();
        all.sort((a, b) => b.createdAt - a.createdAt);
        const newest = all[0];
        if (newest && newest.id !== void 0) {
          if (addImage) saveRecordImage(newest.id, addImage);
          if (newTag) setTag(newest.id, newTag);
          if (addAttachments.length > 0)
            saveAttachmentsFor(newest.id, addAttachments);
        }
      } catch {
      }
    }, 200);
    setNewTitle("");
    setNewContent("");
    setNewTag("");
    setAddImage(null);
    setAddAttachments([]);
    setShowAdd(false);
    if (isListening) stopListening();
    resetTranscript();
    lastTranscriptRef.current = "";
  };
  const handleEditSave = async () => {
    if (!editRecord || !editTitle.trim()) return;
    await updateRecord({
      ...editRecord,
      title: editTitle.trim(),
      content: editContent.trim()
    });
    if (editRecord.id !== void 0) {
      if (editTag) setTag(editRecord.id, editTag);
      if (editAttachments.length > 0) {
        saveAttachmentsFor(editRecord.id, editAttachments);
      }
    }
    setEditRecord(null);
  };
  const handleDelete = (id) => {
    deleteRecord(id);
    const nextTags = { ...tagsById };
    delete nextTags[id];
    setTagsById(nextTags);
    saveTagsById(nextTags);
    const nextPinned = new Set(pinnedIds);
    nextPinned.delete(id);
    setPinnedIds(nextPinned);
    savePinnedIds(nextPinned);
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
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
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
  const pinnedRecords = records.filter(
    (r) => r.id !== void 0 && pinnedIds.has(r.id)
  );
  const unpinnedRecords = records.filter(
    (r) => r.id === void 0 || !pinnedIds.has(r.id)
  );
  const timelineGroups = groupByDate(unpinnedRecords);
  const wordCount = newContent.trim() ? newContent.trim().split(/\s+/).length : 0;
  const openFilePreview = (att) => {
    setPreviewFile({
      key: att.key,
      name: att.name,
      mimeType: att.mimeType,
      url: att.dataUrl,
      size: att.size
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", "data-ocid": "records.page", children: [
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
              var _a2;
              return (_a2 = importInputRef.current) == null ? void 0 : _a2.click();
            },
            className: "p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground",
            "aria-label": "Import records",
            title: "Import Records",
            "data-ocid": "records.upload_button",
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
              "data-ocid": "records.secondary_button",
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
            "data-ocid": "records.primary_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
              "Add New"
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
            className: "w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent",
            "data-ocid": "records.search_input"
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
          className: "w-full mb-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent",
          "data-ocid": "records.input"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: 11 }),
          " Category:"
        ] }),
        RECORD_TAGS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setNewTag(newTag === t ? "" : t),
            className: `px-2 py-0.5 rounded-full text-xs font-medium transition-colors border ${newTag === t ? "border-accent bg-accent text-accent-foreground" : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"}`,
            children: t
          },
          t
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: newContent + (isListening && interimTranscript ? ` ${interimTranscript}` : ""),
            onChange: (e) => setNewContent(e.target.value),
            placeholder: "Write your record, memory, or journal entry…",
            rows: 4,
            className: "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none",
            "data-ocid": "records.textarea"
          }
        ),
        speechSupported && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              if (isListening) {
                stopListening();
              } else {
                resetTranscript();
                lastTranscriptRef.current = "";
                startListening();
              }
            },
            className: `absolute bottom-2 right-2 p-1.5 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground hover:text-foreground"}`,
            title: isListening ? "Stop dictation" : "Dictate",
            children: isListening ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 14 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        isListening && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-accent", children: "🎙 Listening… speak now" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground/60 ml-auto", children: [
          wordCount,
          " words"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", ref: addImagePickerAnchorRef, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowAddImagePicker((v) => !v),
              disabled: addImageLoading,
              className: "flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 13 }),
                addImageLoading ? "Processing…" : "Add Image"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: addGalleryInputRef,
              type: "file",
              accept: "image/*",
              className: "hidden",
              onChange: handleAddGalleryChange
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ImageUploadPicker,
            {
              isOpen: showAddImagePicker,
              onClose: () => setShowAddImagePicker(false),
              onCameraClick: () => setShowAddCameraModal(true),
              onGalleryClick: () => {
                var _a2;
                return (_a2 = addGalleryInputRef.current) == null ? void 0 : _a2.click();
              },
              onFileClick: () => {
                var _a2;
                return (_a2 = addGalleryInputRef.current) == null ? void 0 : _a2.click();
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: addFileInputRef,
              type: "file",
              accept: "*/*",
              multiple: true,
              className: "hidden",
              onChange: handleAddFileChange
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                var _a2;
                return (_a2 = addFileInputRef.current) == null ? void 0 : _a2.click();
              },
              className: "flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 13 }),
                " Attach Files"
              ]
            }
          )
        ] }),
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
        ] }),
        addAttachments.map((att, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          att.mimeType.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: att.dataUrl,
              alt: att.name,
              className: "h-12 w-12 object-cover rounded-lg border border-border"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-lg border border-border bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 16, className: "text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setAddAttachments(
                (prev) => prev.filter((_, i) => i !== idx)
              ),
              className: "absolute -top-1 -right-1 bg-background border border-border rounded-full p-0.5 text-muted-foreground hover:text-foreground",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 10 })
            }
          )
        ] }, att.key))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleAdd,
            disabled: !newTitle.trim(),
            className: "px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity",
            "data-ocid": "records.submit_button",
            children: "Save Record"
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
              setNewTag("");
              setAddImage(null);
              setAddAttachments([]);
              if (isListening) stopListening();
              resetTranscript();
              lastTranscriptRef.current = "";
            },
            className: "px-4 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted transition-colors",
            "data-ocid": "records.cancel_button",
            children: "Cancel"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-4 pb-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" }) }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-16 text-center",
        "data-ocid": "records.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-10 h-10 text-muted-foreground/50" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground/70 mb-1", children: "No records yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: search || dateFrom || dateTo ? "No records match your filters." : "Start capturing your memories, journeys, and ideas!" })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      pinnedRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { size: 12, className: "text-amber-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-amber-600 uppercase tracking-wide", children: "Pinned" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: pinnedRecords.map((record, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          RecordCard,
          {
            record,
            tag: record.id !== void 0 ? tagsById[record.id] : void 0,
            isPinned: true,
            attachmentCount: record.id !== void 0 ? loadAttachmentsFor(record.id).length : 0,
            editRecord,
            editTitle,
            editContent,
            editTag,
            editAttachments,
            showEditImagePicker,
            showEditCameraModal,
            editGalleryInputRef,
            editFileInputRef,
            editImagePickerAnchorRef,
            onView: handleViewRecord,
            onEdit: (r) => {
              setEditRecord(r);
              setEditTitle(r.title);
              setEditContent(r.content);
              setEditTag(
                r.id !== void 0 ? tagsById[r.id] ?? "" : ""
              );
              setEditAttachments(
                r.id !== void 0 ? loadAttachmentsFor(r.id) : []
              );
            },
            onDelete: handleDelete,
            onTogglePin: togglePin,
            onEditTitleChange: setEditTitle,
            onEditContentChange: setEditContent,
            onEditTagChange: setEditTag,
            onEditSave: handleEditSave,
            onEditCancel: () => setEditRecord(null),
            onSetShowEditImagePicker: setShowEditImagePicker,
            onSetShowEditCameraModal: setShowEditCameraModal,
            onEditGalleryChange: handleEditGalleryChange,
            onEditFileChange: handleEditFileChange,
            onRemoveEditAttachment: (i) => setEditAttachments(
              (prev) => prev.filter((_, pi) => pi !== i)
            ),
            dataOcidIndex: idx + 1
          },
          record.id
        )) })
      ] }),
      timelineGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-2 sticky top-0 z-10 bg-background/90 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: group.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground/60", children: [
            group.items.length,
            " ",
            group.items.length === 1 ? "entry" : "entries"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: group.items.map((record, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          RecordCard,
          {
            record,
            tag: record.id !== void 0 ? tagsById[record.id] : void 0,
            isPinned: false,
            attachmentCount: record.id !== void 0 ? loadAttachmentsFor(record.id).length : 0,
            editRecord,
            editTitle,
            editContent,
            editTag,
            editAttachments,
            showEditImagePicker,
            showEditCameraModal,
            editGalleryInputRef,
            editFileInputRef,
            editImagePickerAnchorRef,
            onView: handleViewRecord,
            onEdit: (r) => {
              setEditRecord(r);
              setEditTitle(r.title);
              setEditContent(r.content);
              setEditTag(
                r.id !== void 0 ? tagsById[r.id] ?? "" : ""
              );
              setEditAttachments(
                r.id !== void 0 ? loadAttachmentsFor(r.id) : []
              );
            },
            onDelete: handleDelete,
            onTogglePin: togglePin,
            onEditTitleChange: setEditTitle,
            onEditContentChange: setEditContent,
            onEditTagChange: setEditTag,
            onEditSave: handleEditSave,
            onEditCancel: () => setEditRecord(null),
            onSetShowEditImagePicker: setShowEditImagePicker,
            onSetShowEditCameraModal: setShowEditCameraModal,
            onEditGalleryChange: handleEditGalleryChange,
            onEditFileChange: handleEditFileChange,
            onRemoveEditAttachment: (i) => setEditAttachments(
              (prev) => prev.filter((_, pi) => pi !== i)
            ),
            dataOcidIndex: idx + 1
          },
          record.id
        )) })
      ] }, group.label))
    ] }) }),
    viewRecord && // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss is supplementary
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40",
        onClick: handleCloseView,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "w-full md:max-w-4xl mx-0 md:mx-4 bg-card rounded-t-2xl md:rounded-2xl border border-border shadow-2xl flex flex-col",
            style: { maxHeight: "95vh" },
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between px-5 pt-5 pb-3 border-b border-border shrink-0 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground text-base leading-snug", children: viewRecord.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: formatDateTime(viewRecord.createdAt) }),
                  viewRecord.id !== void 0 && tagsById[viewRecord.id] && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${((_a = TAG_COLORS[tagsById[viewRecord.id]]) == null ? void 0 : _a.badge) ?? "bg-muted text-muted-foreground"}`,
                      children: tagsById[viewRecord.id]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        handleCloseView();
                        setEditRecord(viewRecord);
                        setEditTitle(viewRecord.title);
                        setEditContent(viewRecord.content);
                        setEditTag(
                          viewRecord.id !== void 0 ? tagsById[viewRecord.id] ?? "" : ""
                        );
                        setEditAttachments(
                          viewRecord.id !== void 0 ? loadAttachmentsFor(viewRecord.id) : []
                        );
                      },
                      className: "p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground",
                      title: "Edit",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 15 })
                    }
                  ),
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
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto px-5 py-4 flex-1 space-y-4", children: [
                viewRecord.content && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground whitespace-pre-wrap leading-relaxed", children: viewRecord.content }),
                viewImageUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: viewImageUrl,
                    alt: "Attached",
                    className: "w-full h-auto object-contain rounded-xl border border-border",
                    style: { maxHeight: "60vh" }
                  }
                ) }),
                viewAttachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: [
                    "Attachments (",
                    viewAttachments.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 gap-2", children: viewAttachments.map((att) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => openFilePreview(att),
                      className: "aspect-square rounded-xl border border-border bg-muted overflow-hidden hover:opacity-80 transition-opacity",
                      children: att.mimeType.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: att.dataUrl,
                          alt: att.name,
                          className: "w-full h-full object-cover"
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center gap-1 p-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Paperclip,
                          {
                            size: 18,
                            className: "text-muted-foreground"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground truncate w-full text-center", children: att.name })
                      ] })
                    },
                    att.key
                  )) })
                ] })
              ] })
            ]
          }
        )
      }
    ),
    showAddCameraModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CameraModal,
      {
        onCapture: handleAddCameraCapture,
        onClose: () => setShowAddCameraModal(false)
      }
    ),
    showEditCameraModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CameraModal,
      {
        onCapture: handleEditCameraCapture,
        onClose: () => setShowEditCameraModal(false)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilePreviewModal,
      {
        file: previewFile,
        isOpen: !!previewFile,
        onClose: () => setPreviewFile(null)
      }
    )
  ] });
}
function RecordCard({
  record,
  tag,
  isPinned,
  attachmentCount,
  editRecord,
  editTitle,
  editContent,
  editTag,
  editAttachments,
  showEditImagePicker,
  showEditCameraModal: _showEditCameraModal,
  editGalleryInputRef,
  editFileInputRef,
  editImagePickerAnchorRef,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onEditTitleChange,
  onEditContentChange,
  onEditTagChange,
  onEditSave,
  onEditCancel,
  onSetShowEditImagePicker,
  onSetShowEditCameraModal,
  onEditGalleryChange,
  onEditFileChange,
  onRemoveEditAttachment,
  dataOcidIndex
}) {
  var _a;
  const isEditing = (editRecord == null ? void 0 : editRecord.id) === record.id;
  const tagColors = tag ? TAG_COLORS[tag] : null;
  if (isEditing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "p-4 rounded-xl border border-border bg-card shadow-sm border-l-4 border-l-accent",
        "data-ocid": `records.item.${dataOcidIndex}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: editTitle,
              onChange: (e) => onEditTitleChange(e.target.value),
              className: "w-full mb-2 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent",
              placeholder: "Title"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mb-2", children: RECORD_TAGS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => onEditTagChange(editTag === t ? "" : t),
              className: `px-2 py-0.5 rounded-full text-xs font-medium transition-colors border ${editTag === t ? "border-accent bg-accent text-accent-foreground" : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"}`,
              children: t
            },
            t
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: editContent,
              onChange: (e) => onEditContentChange(e.target.value),
              rows: 3,
              className: "w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", ref: editImagePickerAnchorRef, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => onSetShowEditImagePicker(!showEditImagePicker),
                  className: "flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 13 }),
                    " Add Image"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: editGalleryInputRef,
                  type: "file",
                  accept: "image/*",
                  className: "hidden",
                  onChange: onEditGalleryChange
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ImageUploadPicker,
                {
                  isOpen: showEditImagePicker,
                  onClose: () => onSetShowEditImagePicker(false),
                  onCameraClick: () => onSetShowEditCameraModal(true),
                  onGalleryClick: () => {
                    var _a2;
                    return (_a2 = editGalleryInputRef.current) == null ? void 0 : _a2.click();
                  },
                  onFileClick: () => {
                    var _a2;
                    return (_a2 = editGalleryInputRef.current) == null ? void 0 : _a2.click();
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: editFileInputRef,
                type: "file",
                accept: "*/*",
                multiple: true,
                className: "hidden",
                onChange: onEditFileChange
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  var _a2;
                  return (_a2 = editFileInputRef.current) == null ? void 0 : _a2.click();
                },
                className: "flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 13 }),
                  " Attach Files"
                ]
              }
            ),
            editAttachments.map((att, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              att.mimeType.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: att.dataUrl,
                  alt: att.name,
                  className: "h-10 w-10 object-cover rounded-lg border border-border"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-lg border border-border bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 14, className: "text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => onRemoveEditAttachment(idx),
                  className: "absolute -top-1 -right-1 bg-background border border-border rounded-full p-0.5 text-muted-foreground hover:text-foreground",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 10 })
                }
              )
            ] }, att.key))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onEditSave,
                className: "px-3 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 transition-opacity",
                "data-ocid": "records.save_button",
                children: "Save"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onEditCancel,
                className: "px-3 py-1 rounded-lg border border-border bg-background text-xs text-foreground hover:bg-muted transition-colors",
                "data-ocid": "records.cancel_button",
                children: "Cancel"
              }
            )
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `relative p-4 rounded-xl border border-border bg-card shadow-sm border-l-4 ${tagColors ? tagColors.border : "border-l-border"}`,
      "data-ocid": `records.item.${dataOcidIndex}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "flex-1 text-left min-w-0",
              onClick: () => onView(record),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground text-sm leading-snug", children: record.title })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => record.id !== void 0 && onTogglePin(record.id),
                className: "p-1.5 rounded-lg transition-colors hover:bg-muted",
                title: isPinned ? "Unpin" : "Pin",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Star,
                  {
                    size: 14,
                    className: isPinned ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => onEdit(record),
                className: "p-1.5 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground",
                title: "Edit",
                "data-ocid": `records.edit_button.${dataOcidIndex}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 13 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => record.id !== void 0 && onDelete(record.id),
                className: "p-1.5 rounded-lg transition-colors hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
                title: "Delete",
                "data-ocid": `records.delete_button.${dataOcidIndex}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
              }
            )
          ] })
        ] }),
        record.content && // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled by parent button
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-3 cursor-pointer",
            onClick: () => onView(record),
            children: record.content
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60", children: formatDateTime(record.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            attachmentCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-[11px] text-muted-foreground/70", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 10 }),
              attachmentCount
            ] }),
            tag && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `px-2 py-0.5 rounded-full text-[11px] font-medium ${((_a = TAG_COLORS[tag]) == null ? void 0 : _a.badge) ?? "bg-muted text-muted-foreground"}`,
                children: tag
              }
            )
          ] })
        ] })
      ]
    }
  );
}
export {
  RecordsPage as default
};
