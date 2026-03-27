import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, D as Download, X } from "./index-CGQz-NW1.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M12 18v-6", key: "17g6i2" }],
  ["path", { d: "m9 15 3 3 3-3", key: "1npd3o" }]
];
const FileDown = createLucideIcon("file-down", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M13.234 20.252 21 12.3", key: "1cbrk9" }],
  [
    "path",
    {
      d: "m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486",
      key: "1pkts6"
    }
  ]
];
const Paperclip = createLucideIcon("paperclip", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
];
const RotateCcw = createLucideIcon("rotate-ccw", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
  ["line", { x1: "11", x2: "11", y1: "8", y2: "14", key: "1vmskp" }],
  ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }]
];
const ZoomIn = createLucideIcon("zoom-in", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
  ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }]
];
const ZoomOut = createLucideIcon("zoom-out", __iconNode);
function isImageMime(mime) {
  return mime.startsWith("image/");
}
function isVideoMime(mime) {
  return mime.startsWith("video/");
}
function isPdfMime(mime) {
  return mime === "application/pdf";
}
function FilePreviewModal({
  file,
  isOpen,
  onClose
}) {
  const [zoom, setZoom] = reactExports.useState(1);
  const imgRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    setZoom(1);
  }, [file]);
  reactExports.useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);
  reactExports.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const handleDownload = reactExports.useCallback(() => {
    if (!file) return;
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    a.click();
  }, [file]);
  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const resetZoom = () => setZoom(1);
  if (!isOpen || !file) return null;
  const isImage = isImageMime(file.mimeType);
  const isVideo = isVideoMime(file.mimeType);
  const isPdf = isPdfMime(file.mimeType);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed inset-0 z-[200] bg-black/90 flex flex-col",
      "aria-label": `Preview: ${file.name}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 bg-black/60 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-white text-sm font-medium truncate max-w-[60vw]",
              title: file.name,
              children: file.name
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            isImage && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: zoomOut,
                  className: "p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors",
                  "aria-label": "Zoom out",
                  title: "Zoom out",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/70 text-xs min-w-[3rem] text-center", children: [
                Math.round(zoom * 100),
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: zoomIn,
                  className: "p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors",
                  "aria-label": "Zoom in",
                  title: "Zoom in",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: resetZoom,
                  className: "p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors",
                  "aria-label": "Reset zoom",
                  title: "Reset zoom",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleDownload,
                className: "p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors",
                "aria-label": "Download file",
                title: "Download",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onClose,
                className: "p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors",
                "aria-label": "Close preview",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-auto flex items-center justify-center p-2", children: [
          isImage && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "transition-transform origin-center",
              style: { transform: `scale(${zoom})` },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  ref: imgRef,
                  src: file.url,
                  alt: file.name,
                  className: "block max-w-full h-auto rounded",
                  style: { maxHeight: "calc(90vh - 80px)" },
                  draggable: false
                }
              )
            }
          ),
          isVideo && // biome-ignore lint/a11y/useMediaCaption: preview modal for user's own uploaded files; captions not applicable
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "video",
            {
              src: file.url,
              controls: true,
              autoPlay: false,
              className: "max-w-full max-h-[calc(90vh-80px)] rounded"
            }
          ),
          isPdf && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "iframe",
            {
              src: file.url,
              title: file.name,
              className: "w-full rounded",
              style: {
                height: "calc(90vh - 80px)",
                minWidth: "min(100%, 800px)"
              }
            }
          ),
          !isImage && !isVideo && !isPdf && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 p-8 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: "📄" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white font-medium mb-1", children: file.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-sm", children: "Preview not available for this file type" }),
              file.size && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/40 text-xs mt-1", children: [
                (file.size / 1024).toFixed(1),
                " KB"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: handleDownload,
                className: "flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors",
                "aria-label": "Download file",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
                  "Download File"
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function ImageUploadPicker({
  isOpen,
  onClose,
  onCameraClick,
  onGalleryClick,
  onFileClick
}) {
  const menuRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const handleOption = (callback) => {
    callback();
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: menuRef,
      role: "menu",
      "aria-label": "Image upload options",
      className: "absolute z-50 mt-1 w-52 bg-card border border-border rounded-xl shadow-md overflow-hidden",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            role: "menuitem",
            onClick: () => handleOption(onCameraClick),
            className: "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left",
            "aria-label": "Open camera",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", children: "📷" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Open Camera" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            role: "menuitem",
            onClick: () => handleOption(onGalleryClick),
            className: "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left",
            "aria-label": "Select from gallery",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", children: "🖼" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Select from Gallery" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            role: "menuitem",
            onClick: () => handleOption(onFileClick),
            className: "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left",
            "aria-label": "Upload documents or files",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", children: "📁" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Upload Documents / Files" })
            ]
          }
        )
      ]
    }
  );
}
function useScrollLock(isLocked) {
  const scrollY = reactExports.useRef(0);
  reactExports.useEffect(() => {
    if (isLocked) {
      scrollY.current = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY.current}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY.current);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isLocked]);
}
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true
}) {
  useScrollLock(isOpen);
  const firstFocusRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);
  reactExports.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        var _a;
        return (_a = firstFocusRef.current) == null ? void 0 : _a.focus();
      }, 50);
    }
  }, [isOpen]);
  if (!isOpen) return null;
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    "2xl": "max-w-5xl",
    full: "max-w-full mx-4"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-end md:items-center justify-center",
      "aria-label": title || "Dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
            onClick: onClose,
            onKeyDown: (e) => e.key === "Escape" && onClose(),
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `
          relative w-full ${sizeClasses[size]} bg-card rounded-t-2xl md:rounded-2xl
          shadow-modal border border-border/50 animate-slide-up
          max-h-[96vh] overflow-y-auto
        `,
            children: [
              (title || showClose) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border/50 sticky top-0 bg-card z-10", children: [
                title && /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-base", children: title }),
                showClose && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    ref: firstFocusRef,
                    onClick: onClose,
                    className: "ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors",
                    "aria-label": "Close dialog",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children })
            ]
          }
        )
      ]
    }
  );
}
export {
  Check as C,
  FileDown as F,
  ImageUploadPicker as I,
  Modal as M,
  Paperclip as P,
  FilePreviewModal as a
};
