import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports } from "./index-B2NKaB20.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode);
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
export {
  Check as C,
  ImageUploadPicker as I,
  useScrollLock as u
};
