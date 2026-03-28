import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, X } from "./index-emf78c2L.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode);
function ImageUploadPicker({
  isOpen,
  onClose,
  onCameraClick,
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
      "aria-label": "Attachment options",
      className: "absolute z-50 mt-1 w-52 bg-card border border-border rounded-xl shadow-md overflow-hidden",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            role: "menuitem",
            onClick: () => handleOption(onCameraClick),
            className: "w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors text-left font-medium",
            "aria-label": "Open camera",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", children: "📷" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Camera" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/60" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            role: "menuitem",
            onClick: () => handleOption(onFileClick),
            className: "w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors text-left font-medium",
            "aria-label": "Add files",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", children: "📁" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add Files" })
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
  ImageUploadPicker as I,
  Modal as M
};
