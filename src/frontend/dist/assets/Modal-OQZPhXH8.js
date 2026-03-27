import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, X } from "./index-Bp53jmYJ.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M12 18v-6", key: "17g6i2" }],
  ["path", { d: "m9 15 3 3 3-3", key: "1npd3o" }]
];
const FileDown = createLucideIcon("file-down", __iconNode);
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
  Modal as M
};
