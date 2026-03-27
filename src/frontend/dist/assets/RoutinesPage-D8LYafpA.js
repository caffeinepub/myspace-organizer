import { c as createLucideIcon, r as reactExports, d as db, u as useRoutines, R as React, l as getTodayProfile, s as showErrorToast, j as jsxRuntimeExports, L as LoadingSpinner, U as Upload, P as Plus, C as Clock, b as Trash2, m as Input, X, I as Image, B as Button, a as showSuccessToast, f as format, p as parse } from "./index-CGQz-NW1.js";
import { u as useSpeechRecognition, D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuItem, M as MicOff, f as Mic } from "./useSpeechRecognition-p7w1MrCl.js";
import { F as FileDown, C as Check, M as Modal, I as ImageUploadPicker, P as Paperclip, a as FilePreviewModal } from "./Modal-C9DWvTN1.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }],
  ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }],
  ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
  ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]
];
const GripVertical = createLucideIcon("grip-vertical", __iconNode$1);
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
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode);
const useCamera = (config = {}) => {
  const {
    facingMode = "environment",
    width = 1920,
    height = 1080,
    quality = 0.8,
    format: format2 = "image/jpeg"
  } = config;
  const [isActive, setIsActive] = reactExports.useState(false);
  const [isSupported, setIsSupported] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [currentFacingMode, setCurrentFacingMode] = reactExports.useState(facingMode);
  const videoRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const isMountedRef = reactExports.useRef(true);
  reactExports.useEffect(() => {
    var _a;
    const supported = !!((_a = navigator.mediaDevices) == null ? void 0 : _a.getUserMedia);
    setIsSupported(supported);
  }, []);
  reactExports.useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);
  const cleanup = reactExports.useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);
  const createMediaStream = reactExports.useCallback(
    async (facing) => {
      try {
        const constraints = {
          video: {
            facingMode: facing,
            width: { ideal: width },
            height: { ideal: height }
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMountedRef.current) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
          return null;
        }
        return stream;
      } catch (err) {
        let errorType = "unknown";
        let errorMessage = "Failed to access camera";
        if (err.name === "NotAllowedError") {
          errorType = "permission";
          errorMessage = "Camera permission denied";
        } else if (err.name === "NotFoundError") {
          errorType = "not-found";
          errorMessage = "No camera device found";
        } else if (err.name === "NotSupportedError") {
          errorType = "not-supported";
          errorMessage = "Camera is not supported";
        }
        throw { type: errorType, message: errorMessage };
      }
    },
    [width, height]
  );
  const setupVideo = reactExports.useCallback(async (stream) => {
    if (!videoRef.current) return false;
    const video = videoRef.current;
    video.srcObject = stream;
    return new Promise((resolve) => {
      const onLoadedMetadata = () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("error", onError);
        video.play().catch((err) => {
          console.warn("Video autoplay failed:", err);
        });
        resolve(true);
      };
      const onError = () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("error", onError);
        resolve(false);
      };
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("error", onError);
      if (video.readyState >= 1) {
        onLoadedMetadata();
      }
    });
  }, []);
  const startCamera = reactExports.useCallback(async () => {
    if (isSupported === false || isLoading) {
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      cleanup();
      const stream = await createMediaStream(currentFacingMode);
      if (!stream) return false;
      streamRef.current = stream;
      const success = await setupVideo(stream);
      if (success && isMountedRef.current) {
        setIsActive(true);
        return true;
      }
      cleanup();
      return false;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
      }
      cleanup();
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    isSupported,
    isLoading,
    currentFacingMode,
    cleanup,
    createMediaStream,
    setupVideo
  ]);
  const stopCamera = reactExports.useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    cleanup();
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (isMountedRef.current) {
      setIsLoading(false);
    }
  }, [isLoading, cleanup]);
  const switchCamera = reactExports.useCallback(
    async (newFacingMode) => {
      if (isSupported === false || isLoading) {
        return false;
      }
      const targetFacingMode = newFacingMode || (currentFacingMode === "user" ? "environment" : "user");
      setIsLoading(true);
      setError(null);
      try {
        cleanup();
        setCurrentFacingMode(targetFacingMode);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const stream = await createMediaStream(targetFacingMode);
        if (!stream) return false;
        streamRef.current = stream;
        const success = await setupVideo(stream);
        if (success && isMountedRef.current) {
          setIsActive(true);
          return true;
        }
        cleanup();
        return false;
      } catch (err) {
        if (isMountedRef.current) {
          setError(err);
        }
        cleanup();
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [
      isSupported,
      isLoading,
      currentFacingMode,
      cleanup,
      createMediaStream,
      setupVideo
    ]
  );
  const retry = reactExports.useCallback(async () => {
    if (isLoading) return false;
    setError(null);
    await stopCamera();
    await new Promise((resolve) => setTimeout(resolve, 200));
    return startCamera();
  }, [isLoading, stopCamera, startCamera]);
  const capturePhoto = reactExports.useCallback(() => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current || !isActive) {
        resolve(null);
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      if (currentFacingMode === "user") {
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0);
      } else {
        ctx.drawImage(video, 0, 0);
      }
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const extension = format2.split("/")[1];
            const file = new File([blob], `photo_${Date.now()}.${extension}`, {
              type: format2
            });
            resolve(file);
          } else {
            resolve(null);
          }
        },
        format2,
        quality
      );
    });
  }, [isActive, format2, quality, currentFacingMode]);
  return {
    // State
    isActive,
    isSupported,
    error,
    isLoading,
    currentFacingMode,
    // Actions
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,
    // Refs for components
    videoRef,
    canvasRef
  };
};
function getTimestamp() {
  const now = /* @__PURE__ */ new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}_${hh}${min}`;
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
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function formatTimeAmPm(time) {
  try {
    const [hStr, mStr] = time.split(":");
    const h = Number.parseInt(hStr, 10);
    const m = Number.parseInt(mStr, 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return time;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  } catch {
    return time;
  }
}
function profileLabel(profileType) {
  if (profileType === "weekday") return "Weekdays";
  if (profileType === "weekend") return "Weekends";
  return profileType;
}
function formatItemForTxt(item, pType) {
  const lines = [
    `  - Title: ${item.title || "(untitled)"}`,
    `    Profile: ${profileLabel(pType)}`,
    `    Time: ${formatTimeAmPm(item.time || "")}`
  ];
  if (item.tag) lines.push(`    Tag: ${item.tag}`);
  if (item.icon) lines.push(`    Icon: ${item.icon}`);
  if (item.duration !== void 0)
    lines.push(`    Duration: ${item.duration} min`);
  return lines.join("\n");
}
function formatProfileForTxt(profile) {
  const sep = "=".repeat(60);
  const pLabel = profileLabel(profile.profileType);
  const items = (profile.items || []).map((item) => formatItemForTxt(item, profile.profileType)).join("\n");
  return [
    sep,
    `Profile: ${pLabel}`,
    `Items (${(profile.items || []).length}):`,
    items || "  (none)",
    sep
  ].join("\n");
}
function formatItemForDoc(item, pType) {
  const tag = item.tag ? `<p><strong>Tag:</strong> ${escapeHtml(item.tag)}</p>` : "";
  const icon = item.icon ? `<p><strong>Icon:</strong> ${escapeHtml(item.icon)}</p>` : "";
  const duration = item.duration !== void 0 ? `<p><strong>Duration:</strong> ${item.duration} min</p>` : "";
  return `
    <div style="margin-left:16px; margin-bottom:12px; border-left:3px solid #ccc; padding-left:8px;">
      <strong>${escapeHtml(item.title || "(untitled)")}</strong>
      <p><strong>Profile:</strong> ${escapeHtml(profileLabel(pType))} &nbsp; <strong>Time:</strong> ${escapeHtml(formatTimeAmPm(item.time || ""))}</p>
      ${tag}${icon}${duration}
    </div>`;
}
function formatProfileForDoc(profile) {
  const pLabel = profileLabel(profile.profileType);
  const items = (profile.items || []).map((item) => formatItemForDoc(item, profile.profileType)).join("");
  return `
    <div style="margin-bottom:32px; border-bottom:2px solid #ccc; padding-bottom:16px;">
      <h2 style="font-size:16pt;">Profile: ${escapeHtml(pLabel)}</h2>
      ${items || "<p><em>(no items)</em></p>"}
    </div>`;
}
function exportAllRoutinesAsTxt(profiles) {
  const content = profiles.map(formatProfileForTxt).join("\n\n");
  triggerDownload(content, `routines_${getTimestamp()}.txt`, "text/plain");
}
function exportAllRoutinesAsDoc(profiles) {
  const body = profiles.map(formatProfileForDoc).join("");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Routines Export</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  triggerDownload(html, `routines_${getTimestamp()}.doc`, "application/msword");
}
function exportAllRoutinesAsJson(profiles) {
  const content = JSON.stringify(profiles, null, 2);
  triggerDownload(
    content,
    `routines_${getTimestamp()}.json`,
    "application/json"
  );
}
function exportSelectedRoutinesAsTxt(profiles) {
  const content = profiles.map(formatProfileForTxt).join("\n\n");
  triggerDownload(content, `routines_${getTimestamp()}.txt`, "text/plain");
}
function exportSelectedRoutinesAsDoc(profiles) {
  const body = profiles.map(formatProfileForDoc).join("");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Routines Export</title></head>
<body style="font-family:Arial,sans-serif; font-size:12pt;">${body}</body></html>`;
  triggerDownload(html, `routines_${getTimestamp()}.doc`, "application/msword");
}
function exportSelectedRoutinesAsJson(profiles) {
  const content = JSON.stringify(profiles, null, 2);
  triggerDownload(
    content,
    `routines_${getTimestamp()}.json`,
    "application/json"
  );
}
function generateStringId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function makeRoutineItem(overrides) {
  return {
    id: overrides.id,
    time: overrides.time,
    title: overrides.title,
    tag: overrides.tag,
    icon: overrides.icon,
    duration: overrides.duration,
    completed: overrides.completed ?? false,
    order: overrides.order ?? 0
  };
}
function parseJsonRoutines(text) {
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  return arr.map((item) => {
    const p = item;
    const profileType = p.profileType === "weekend" ? "weekend" : "weekday";
    const items = Array.isArray(p.items) ? p.items.map(
      (ri, idx) => makeRoutineItem({
        id: typeof ri.id === "string" ? ri.id : generateStringId(),
        title: typeof ri.title === "string" ? ri.title : "",
        time: typeof ri.time === "string" ? ri.time : "08:00",
        tag: typeof ri.tag === "string" ? ri.tag : void 0,
        icon: typeof ri.icon === "string" ? ri.icon : void 0,
        duration: typeof ri.duration === "number" ? ri.duration : void 0,
        completed: !!ri.completed,
        order: typeof ri.order === "number" ? ri.order : idx
      })
    ) : [];
    return { profileType, items };
  });
}
function parseTxtRoutines(text) {
  const sep = "=".repeat(60);
  const blocks = text.split(sep).map((b) => b.trim()).filter(Boolean);
  if (blocks.length > 0 && blocks[0].startsWith("Profile:")) {
    return blocks.map((block) => {
      var _a;
      const lines = block.split("\n");
      const profileTypeRaw = ((_a = lines[0]) == null ? void 0 : _a.replace("Profile:", "").trim()) || "weekday";
      const profileType = profileTypeRaw === "weekend" ? "weekend" : "weekday";
      const items = [];
      let currentTitle = "";
      let currentTime = "08:00";
      let currentTag;
      let inItem = false;
      for (const line of lines.slice(2)) {
        const trimmed = line.trim();
        if (trimmed.startsWith("- Title:")) {
          if (inItem) {
            items.push(
              makeRoutineItem({
                id: generateStringId(),
                title: currentTitle,
                time: currentTime,
                tag: currentTag,
                order: items.length
              })
            );
          }
          currentTitle = trimmed.replace("- Title:", "").trim();
          currentTime = "08:00";
          currentTag = void 0;
          inItem = true;
        } else if (trimmed.startsWith("Time:") && inItem) {
          currentTime = trimmed.replace("Time:", "").trim();
        } else if (trimmed.startsWith("Tag:") && inItem) {
          currentTag = trimmed.replace("Tag:", "").trim();
        }
      }
      if (inItem) {
        items.push(
          makeRoutineItem({
            id: generateStringId(),
            title: currentTitle,
            time: currentTime,
            tag: currentTag,
            order: items.length
          })
        );
      }
      return { profileType, items };
    });
  }
  return [
    {
      profileType: "weekday",
      items: [
        makeRoutineItem({
          id: generateStringId(),
          title: "Imported Routine",
          time: "08:00",
          order: 0
        })
      ]
    }
  ];
}
function parseDocRoutines(text) {
  const stripped = text.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
  const title = stripped.substring(0, 100).split("\n")[0] || "Imported Routine";
  return [
    {
      profileType: "weekday",
      items: [
        makeRoutineItem({
          id: generateStringId(),
          title,
          time: "08:00",
          order: 0
        })
      ]
    }
  ];
}
async function importRoutinesFromFile(file, existingProfiles) {
  var _a;
  const ext = ((_a = file.name.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
  try {
    const text = await file.text();
    let profiles = [];
    if (ext === "json") {
      profiles = parseJsonRoutines(text);
    } else if (ext === "txt") {
      profiles = parseTxtRoutines(text);
    } else if (ext === "doc" || ext === "docx") {
      profiles = parseDocRoutines(text);
    } else {
      return {
        count: 0,
        error: "Unsupported file format. Please use .json, .txt, or .doc/.docx."
      };
    }
    if (profiles.length === 0) {
      return { count: 0, error: "No routines found in the file." };
    }
    let totalItems = 0;
    for (const profile of profiles) {
      const existing = existingProfiles.find(
        (p) => p.profileType === profile.profileType
      );
      if (existing && existing.id !== void 0) {
        const existingItemIds = new Set(existing.items.map((i) => i.id));
        const newItems = profile.items.map((item, idx) => {
          const newId = existingItemIds.has(item.id) ? generateStringId() : item.id;
          return { ...item, id: newId, order: existing.items.length + idx };
        });
        const merged = {
          ...existing,
          items: [...existing.items, ...newItems]
        };
        await db.routines.put(merged);
        totalItems += newItems.length;
      } else {
        const { id: _id, ...profileWithoutId } = profile;
        await db.routines.add(profileWithoutId);
        totalItems += profile.items.length;
      }
    }
    return { count: totalItems };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error during import.";
    return { count: 0, error: msg };
  }
}
const ROUTINE_MULTI_ATTACH_KEY = "routineMultiAttachmentsById";
function saveRoutineAttachments(itemId, attachments) {
  try {
    const store = JSON.parse(
      localStorage.getItem(ROUTINE_MULTI_ATTACH_KEY) || "{}"
    );
    store[itemId] = attachments;
    localStorage.setItem(ROUTINE_MULTI_ATTACH_KEY, JSON.stringify(store));
  } catch {
  }
}
function loadRoutineAttachments(itemId) {
  try {
    const store = JSON.parse(
      localStorage.getItem(ROUTINE_MULTI_ATTACH_KEY) || "{}"
    );
    return store[itemId] || [];
  } catch {
    return [];
  }
}
function deleteRoutineItemAttachments(itemId) {
  try {
    const store = JSON.parse(
      localStorage.getItem(ROUTINE_MULTI_ATTACH_KEY) || "{}"
    );
    delete store[itemId];
    localStorage.setItem(ROUTINE_MULTI_ATTACH_KEY, JSON.stringify(store));
  } catch {
  }
}
function routineFileToDataUrl(file) {
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
const ROUTINE_IMAGES_KEY = "routineImagesById";
function saveRoutineImage(id, dataUrl) {
  try {
    const store = JSON.parse(localStorage.getItem(ROUTINE_IMAGES_KEY) || "{}");
    store[id] = dataUrl;
    localStorage.setItem(ROUTINE_IMAGES_KEY, JSON.stringify(store));
  } catch {
  }
}
function getRoutineImage(id) {
  try {
    const store = JSON.parse(localStorage.getItem(ROUTINE_IMAGES_KEY) || "{}");
    return store[id] ?? null;
  } catch {
    return null;
  }
}
function deleteRoutineImage(id) {
  try {
    const store = JSON.parse(localStorage.getItem(ROUTINE_IMAGES_KEY) || "{}");
    delete store[id];
    localStorage.setItem(ROUTINE_IMAGES_KEY, JSON.stringify(store));
  } catch {
  }
}
function compressImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a;
      const img = new window.Image();
      img.onload = () => {
        const MAX = 1200;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > MAX || h > MAX) {
          if (w > h) {
            h = Math.round(h * MAX / w);
            w = MAX;
          } else {
            w = Math.round(w * MAX / h);
            h = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = (_a = e.target) == null ? void 0 : _a.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
const TABS = [
  { id: "today", label: "Today (Auto)" },
  { id: "weekday", label: "Weekdays" },
  { id: "weekend", label: "Weekends" }
];
const ICONS = [
  "🌅",
  "💪",
  "🥗",
  "💻",
  "🍱",
  "🚶",
  "📚",
  "☕",
  "🧘",
  "🥞",
  "🎨",
  "👥",
  "📋",
  "🏃",
  "🎯",
  "📖",
  "🎵",
  "🌙",
  "⭐",
  "🔥"
];
function formatTime(time) {
  try {
    return format(parse(time, "HH:mm", /* @__PURE__ */ new Date()), "h:mm a");
  } catch {
    return time;
  }
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
  } = useCamera({
    facingMode: "environment"
  });
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
function RoutinesPage() {
  const {
    weekday,
    weekend,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleComplete,
    reorderItems,
    reload
  } = useRoutines();
  const [activeTab, setActiveTab] = reactExports.useState("today");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editingItem, setEditingItem] = reactExports.useState(
    null
  );
  const [dragIndex, setDragIndex] = reactExports.useState(null);
  const [formTime, setFormTime] = reactExports.useState("08:00");
  const [formTitle, setFormTitle] = reactExports.useState("");
  const [formTag, setFormTag] = reactExports.useState("");
  const [formIcon, setFormIcon] = reactExports.useState("⭐");
  const [formDuration, setFormDuration] = reactExports.useState("");
  const [formImageId, setFormImageId] = reactExports.useState(void 0);
  const [formImagePreview, setFormImagePreview] = reactExports.useState(null);
  const [formImgNaturalAspect, setFormImgNaturalAspect] = reactExports.useState(null);
  const [showImagePicker, setShowImagePicker] = reactExports.useState(false);
  const [showCameraModal, setShowCameraModal] = reactExports.useState(false);
  const galleryInputRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  const [formAttachments, setFormAttachments] = reactExports.useState([]);
  const [showAttachPicker, setShowAttachPicker] = reactExports.useState(false);
  const [previewFile, setPreviewFile] = reactExports.useState(null);
  const [showFilePreview, setShowFilePreview] = reactExports.useState(false);
  const attachCameraRef = reactExports.useRef(null);
  const attachGalleryRef = reactExports.useRef(null);
  const attachFileRef = reactExports.useRef(null);
  const importInputRef = reactExports.useRef(null);
  const [isImporting, setIsImporting] = reactExports.useState(false);
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
      setFormTitle((prev) => {
        const separator = prev && !prev.endsWith(" ") ? " " : "";
        return prev + separator + transcript;
      });
      resetTranscript();
    }
  }, [transcript, resetTranscript]);
  React.useEffect(() => {
    if (!showForm && isListening) {
      stopListening();
    }
  }, [showForm, isListening, stopListening]);
  const todayType = getTodayProfile();
  const activeProfileType = activeTab === "today" ? todayType : activeTab;
  const profile = activeProfileType === "weekday" ? weekday : weekend;
  const items = (profile == null ? void 0 : profile.items.slice().sort((a, b) => a.order - b.order)) || [];
  const allProfiles = [weekday, weekend].filter(
    (p) => p !== null
  );
  const openAdd = () => {
    setEditingItem(null);
    setFormTime("08:00");
    setFormTitle("");
    setFormTag("");
    setFormIcon("⭐");
    setFormDuration("");
    setFormImageId(void 0);
    setFormImagePreview(null);
    setFormImgNaturalAspect(null);
    setShowImagePicker(false);
    setFormAttachments([]);
    setShowAttachPicker(false);
    resetTranscript();
    setShowForm(true);
  };
  const openEdit = (item) => {
    var _a;
    setEditingItem(item);
    setFormTime(item.time);
    setFormTitle(item.title);
    setFormTag(item.tag || "");
    setFormIcon(item.icon || "⭐");
    setFormDuration(((_a = item.duration) == null ? void 0 : _a.toString()) || "");
    setFormImageId(item.imageId);
    setFormImagePreview(item.imageId ? getRoutineImage(item.imageId) : null);
    setFormImgNaturalAspect(null);
    setShowImagePicker(false);
    setShowAttachPicker(false);
    if (item.id) {
      const stored = loadRoutineAttachments(item.id);
      setFormAttachments(
        stored.map((a) => ({
          key: a.key,
          name: a.name,
          mimeType: a.mimeType,
          url: a.dataUrl,
          size: a.size
        }))
      );
    } else {
      setFormAttachments([]);
    }
    resetTranscript();
    setShowForm(true);
  };
  const handleSave = async () => {
    if (isListening) stopListening();
    if (!formTitle.trim()) {
      showErrorToast("Title is required");
      return;
    }
    const baseItem = {
      time: formTime,
      title: formTitle.trim(),
      tag: formTag.trim() || void 0,
      icon: formIcon,
      duration: formDuration ? Number.parseInt(formDuration) : void 0,
      imageId: formImageId
    };
    if (editingItem) {
      await updateItem(activeProfileType, {
        ...editingItem,
        ...baseItem
      });
      const storedAttachments = formAttachments.map(
        (af) => ({
          key: af.key,
          name: af.name,
          mimeType: af.mimeType,
          dataUrl: af.url,
          size: af.size || 0
        })
      );
      saveRoutineAttachments(editingItem.id, storedAttachments);
    } else {
      const newId = Math.random().toString(36).slice(2);
      const newItem = {
        id: newId,
        completed: false,
        order: items.length,
        ...baseItem
      };
      await addItem(activeProfileType, newItem);
      const storedAttachments = formAttachments.map(
        (af) => ({
          key: af.key,
          name: af.name,
          mimeType: af.mimeType,
          dataUrl: af.url,
          size: af.size || 0
        })
      );
      saveRoutineAttachments(newId, storedAttachments);
    }
    setShowForm(false);
  };
  const handleDelete = async (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (item == null ? void 0 : item.imageId) {
      deleteRoutineImage(item.imageId);
    }
    deleteRoutineItemAttachments(itemId);
    await deleteItem(activeProfileType, itemId);
    setShowForm(false);
  };
  const handleDragStart = (idx) => setDragIndex(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const newItems = [...items];
    const [moved] = newItems.splice(dragIndex, 1);
    newItems.splice(idx, 0, moved);
    const reordered = newItems.map((item, i) => ({ ...item, order: i }));
    reorderItems(activeProfileType, reordered);
    setDragIndex(idx);
  };
  const handleDragEnd = () => setDragIndex(null);
  const handleImportClick = () => {
    var _a;
    (_a = importInputRef.current) == null ? void 0 : _a.click();
  };
  const handleImportFile = async (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const result = await importRoutinesFromFile(file, allProfiles);
      if (result.error) {
        showErrorToast(result.error);
      } else {
        showSuccessToast(`Imported ${result.count} routine item(s)`);
        await reload();
      }
    } catch {
      showErrorToast("Import failed");
    } finally {
      setIsImporting(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };
  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  const handleImageFile = reactExports.useCallback(async (file) => {
    try {
      const dataUrl = await compressImageToDataUrl(file);
      const imageId = `routine_img_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      saveRoutineImage(imageId, dataUrl);
      setFormImageId(imageId);
      setFormImagePreview(dataUrl);
      setFormImgNaturalAspect(null);
    } catch {
      showErrorToast("Failed to process image");
    }
  }, []);
  const handlePickerCamera = reactExports.useCallback(() => {
    setShowCameraModal(true);
  }, []);
  const handlePickerGallery = reactExports.useCallback(() => {
    var _a;
    (_a = galleryInputRef.current) == null ? void 0 : _a.click();
  }, []);
  const handlePickerFile = reactExports.useCallback(() => {
    var _a;
    (_a = fileInputRef.current) == null ? void 0 : _a.click();
  }, []);
  const handleFileInputChange = async (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (file) await handleImageFile(file);
    e.target.value = "";
  };
  const handleRemoveImage = () => {
    if (formImageId) {
      deleteRoutineImage(formImageId);
    }
    setFormImageId(void 0);
    setFormImagePreview(null);
    setFormImgNaturalAspect(null);
  };
  const handleFormImageLoad = (e) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setFormImgNaturalAspect(img.naturalWidth / img.naturalHeight);
    }
  };
  const handleRoutineAttachFiles = reactExports.useCallback(
    async (files) => {
      if (!files || files.length === 0) return;
      const newFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const dataUrl = await routineFileToDataUrl(file);
          const key = `routine-att-${Date.now()}-${i}`;
          newFiles.push({
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
      if (newFiles.length > 0) {
        setFormAttachments((prev) => [...prev, ...newFiles]);
      }
    },
    []
  );
  const handleRemoveRoutineAttachment = reactExports.useCallback((key) => {
    setFormAttachments((prev) => prev.filter((f) => f.key !== key));
  }, []);
  const handleOpenRoutineFilePreview = reactExports.useCallback((file) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  }, []);
  const handleAttachCameraChange = reactExports.useCallback(
    async (e) => {
      await handleRoutineAttachFiles(e.target.files);
      e.target.value = "";
    },
    [handleRoutineAttachFiles]
  );
  const handleAttachGalleryChange = reactExports.useCallback(
    async (e) => {
      await handleRoutineAttachFiles(e.target.files);
      e.target.value = "";
    },
    [handleRoutineAttachFiles]
  );
  const handleAttachFileChange = reactExports.useCallback(
    async (e) => {
      await handleRoutineAttachFiles(e.target.files);
      e.target.value = "";
    },
    [handleRoutineAttachFiles]
  );
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 max-w-lg mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Routines" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: importInputRef,
            type: "file",
            accept: ".json,.txt,.doc,.docx",
            className: "hidden",
            onChange: handleImportFile,
            "aria-label": "Import routines file"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleImportClick,
            disabled: isImporting,
            className: "p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50",
            "aria-label": "Import routines",
            title: "Import Routines",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground",
              "aria-label": "Export routines",
              title: "Export Routines",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-4 h-4" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-52", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { children: "Export All Profiles" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              DropdownMenuItem,
              {
                onClick: () => exportAllRoutinesAsTxt(allProfiles),
                children: "Export as TXT"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              DropdownMenuItem,
              {
                onClick: () => exportAllRoutinesAsDoc(allProfiles),
                children: "Export as WORD (DOC)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              DropdownMenuItem,
              {
                onClick: () => exportAllRoutinesAsJson(allProfiles),
                children: "Export as JSON"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { children: "Export Active Profile" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              DropdownMenuItem,
              {
                onClick: () => profile && exportSelectedRoutinesAsTxt([profile]),
                disabled: !profile,
                children: "Export as TXT"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              DropdownMenuItem,
              {
                onClick: () => profile && exportSelectedRoutinesAsDoc([profile]),
                disabled: !profile,
                children: "Export as WORD (DOC)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              DropdownMenuItem,
              {
                onClick: () => profile && exportSelectedRoutinesAsJson([profile]),
                disabled: !profile,
                children: "Export as JSON"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: openAdd,
            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity",
            "aria-label": "Add routine item",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
              " Add"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 bg-muted/50 rounded-xl p-1 mb-4", children: TABS.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setActiveTab(tab.id),
        className: `flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
              ${activeTab === tab.id ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"}`,
        "aria-label": `${tab.label} tab`,
        "aria-current": activeTab === tab.id ? "page" : void 0,
        children: [
          tab.label,
          tab.id === "today" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-[10px] text-muted-foreground capitalize", children: [
            "(",
            todayType,
            ")"
          ] })
        ]
      },
      tab.id
    )) }),
    items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-12 h-12 text-muted-foreground/30 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No routine items yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: 'Tap "Add" to create your first routine' })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((item, idx) => {
      const itemImageUrl = item.imageId ? getRoutineImage(item.imageId) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          draggable: true,
          onDragStart: () => handleDragStart(idx),
          onDragOver: (e) => handleDragOver(e, idx),
          onDragEnd: handleDragEnd,
          className: `
                  flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 cursor-grab active:cursor-grabbing
                  ${item.completed ? "opacity-60 bg-muted/30 border-border/50" : "bg-card border-border hover:border-primary/30"}
                  ${dragIndex === idx ? "opacity-50 scale-95" : ""}
                `,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-muted-foreground/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => toggleComplete(activeProfileType, item.id),
                className: `mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors
                    ${item.completed ? "bg-primary border-primary" : "border-muted-foreground hover:border-primary"}`,
                "aria-label": item.completed ? "Mark incomplete" : "Mark complete",
                children: item.completed && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 text-primary-foreground" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                item.icon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", children: item.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `text-sm font-medium truncate ${item.completed ? "line-through text-muted-foreground" : ""}`,
                    children: item.title
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatTime(item.time) }),
                item.tag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary", children: item.tag }),
                item.duration && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                  item.duration,
                  "m"
                ] })
              ] }),
              itemImageUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 w-full overflow-hidden rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: itemImageUrl,
                  alt: item.title,
                  className: "w-full h-auto object-contain max-h-40"
                }
              ) }),
              (() => {
                const itemAttachments = loadRoutineAttachments(item.id);
                if (!itemAttachments.length) return null;
                return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: itemAttachments.map((af) => {
                  const displayFile = {
                    key: af.key,
                    name: af.name,
                    mimeType: af.mimeType,
                    url: af.dataUrl,
                    size: af.size
                  };
                  const isImg = af.mimeType.startsWith("image/");
                  const isVid = af.mimeType.startsWith("video/");
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setPreviewFile(displayFile);
                        setShowFilePreview(true);
                      },
                      className: "rounded overflow-hidden border border-border/40 bg-muted/20",
                      title: af.name,
                      "aria-label": `View attachment ${af.name}`,
                      children: isImg ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: af.dataUrl,
                          alt: af.name,
                          className: "h-12 w-auto object-contain block",
                          style: { maxWidth: 80 }
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground", children: [
                        isVid ? "🎬" : af.mimeType === "application/pdf" ? "📄" : "📎",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[60px]", children: af.name })
                      ] })
                    },
                    af.key
                  );
                }) });
              })()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => openEdit(item),
                  className: "p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground",
                  "aria-label": `Edit ${item.title}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleDelete(item.id),
                  className: "p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive",
                  "aria-label": `Delete ${item.title}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                }
              )
            ] })
          ]
        },
        item.id
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { isOpen: showForm, onClose: () => setShowForm(false), size: "md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: editingItem ? "Edit Routine Item" : "Add Routine Item" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "time",
            value: formTime,
            onChange: (e) => setFormTime(e.target.value),
            className: "text-sm",
            "aria-label": "Routine time"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Title *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: formTitle + (isListening && interimTranscript ? interimTranscript : ""),
              onChange: (e) => {
                const val = e.target.value;
                if (isListening && interimTranscript && val.endsWith(interimTranscript)) {
                  setFormTitle(
                    val.slice(0, val.length - interimTranscript.length)
                  );
                } else {
                  setFormTitle(val);
                }
              },
              placeholder: "e.g. Morning meditation",
              className: "flex-1 text-sm",
              "aria-label": "Routine title"
            }
          ),
          speechSupported && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleToggleMic,
              className: `p-2 rounded-lg transition-colors ${isListening ? "text-destructive hover:bg-destructive/10 animate-pulse" : "text-muted-foreground hover:bg-muted"}`,
              "aria-label": isListening ? "Stop dictation" : "Dictate title",
              children: isListening ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "w-4 h-4" })
            }
          )
        ] }),
        isListening && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-primary mt-0.5 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" }),
          "Listening…"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Tag (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: formTag,
            onChange: (e) => setFormTag(e.target.value),
            placeholder: "e.g. Health, Work",
            className: "text-sm",
            "aria-label": "Routine tag"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Icon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: ICONS.map((icon) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setFormIcon(icon),
            className: `w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors
                    ${formIcon === icon ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-muted"}`,
            "aria-label": `Select icon ${icon}`,
            children: icon
          },
          icon
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Duration (minutes, optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            value: formDuration,
            onChange: (e) => setFormDuration(e.target.value),
            placeholder: "e.g. 30",
            min: "1",
            className: "text-sm",
            "aria-label": "Routine duration in minutes"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Image (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: galleryInputRef,
            type: "file",
            accept: "image/*",
            className: "hidden",
            onChange: handleFileInputChange,
            "aria-label": "Select image from gallery"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: "image/jpeg,image/png,image/webp,application/pdf",
            className: "hidden",
            onChange: handleFileInputChange,
            "aria-label": "Upload image file"
          }
        ),
        formImagePreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full overflow-hidden rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: formImagePreview,
              alt: "Routine preview",
              className: "w-full h-auto object-contain bg-muted/20",
              style: formImgNaturalAspect ? { aspectRatio: String(formImgNaturalAspect) } : void 0,
              onLoad: handleFormImageLoad
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleRemoveImage,
              className: "text-xs text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1",
              "aria-label": "Remove image",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }),
                " Remove image"
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowImagePicker((prev) => !prev),
              className: "flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors text-sm text-muted-foreground w-full justify-center",
              "aria-label": "Add image",
              "aria-expanded": showImagePicker,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add Image" })
              ]
            }
          ),
          showImagePicker && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ImageUploadPicker,
            {
              isOpen: showImagePicker,
              onClose: () => setShowImagePicker(false),
              onCameraClick: handlePickerCamera,
              onGalleryClick: handlePickerGallery,
              onFileClick: handlePickerFile
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-1 block", children: "Attachments (optional)" }),
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
            "aria-label": "Capture photo with camera"
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
            "aria-label": "Select files from gallery"
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
            "aria-label": "Upload documents or files"
          }
        ),
        formAttachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: formAttachments.map((af) => {
          const isImg = af.mimeType.startsWith("image/");
          const isVid = af.mimeType.startsWith("video/");
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "relative group rounded-lg overflow-hidden border border-border/50 bg-muted/20",
              style: { maxWidth: isImg ? 100 : void 0 },
              children: [
                isImg ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleOpenRoutineFilePreview(af),
                    className: "block w-full",
                    "aria-label": `Preview ${af.name}`,
                    title: af.name,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: af.url,
                        alt: af.name,
                        className: "w-full h-auto block",
                        style: { maxHeight: 80, objectFit: "contain" }
                      }
                    )
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleOpenRoutineFilePreview(af),
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
                    onClick: () => handleRemoveRoutineAttachment(af.key),
                    className: "absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive",
                    "aria-label": `Remove ${af.name}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-2.5 h-2.5" })
                  }
                )
              ]
            },
            af.key
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowAttachPicker((prev) => !prev),
              className: "flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors text-sm text-muted-foreground",
              "aria-label": "Add attachment",
              "aria-expanded": showAttachPicker,
              "data-ocid": "routines.upload_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add Attachment" })
              ]
            }
          ),
          showAttachPicker && /* @__PURE__ */ jsxRuntimeExports.jsx(
            ImageUploadPicker,
            {
              isOpen: showAttachPicker,
              onClose: () => setShowAttachPicker(false),
              onCameraClick: () => {
                var _a;
                setShowAttachPicker(false);
                (_a = attachCameraRef.current) == null ? void 0 : _a.click();
              },
              onGalleryClick: () => {
                var _a;
                setShowAttachPicker(false);
                (_a = attachGalleryRef.current) == null ? void 0 : _a.click();
              },
              onFileClick: () => {
                var _a;
                setShowAttachPicker(false);
                (_a = attachFileRef.current) == null ? void 0 : _a.click();
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: editingItem && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "destructive",
            size: "sm",
            onClick: () => handleDelete(editingItem.id),
            "aria-label": "Delete routine item",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 mr-1" }),
              " Delete"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setShowForm(false),
              "aria-label": "Cancel",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              onClick: handleSave,
              disabled: !formTitle.trim(),
              "aria-label": editingItem ? "Update routine item" : "Add routine item",
              children: editingItem ? "Update" : "Add"
            }
          )
        ] })
      ] })
    ] }) }),
    showCameraModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CameraModal,
      {
        onCapture: handleImageFile,
        onClose: () => setShowCameraModal(false)
      }
    ),
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
export {
  RoutinesPage as default
};
