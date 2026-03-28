import React, { useEffect, useRef } from "react";

interface ImageUploadPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onCameraClick: () => void;
  onGalleryClick: () => void;
  onFileClick: () => void;
}

export function ImageUploadPicker({
  isOpen,
  onClose,
  onCameraClick,
  onFileClick,
}: ImageUploadPickerProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
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

  const handleOption = (callback: () => void) => {
    callback();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Attachment options"
      className="absolute z-50 mt-1 w-52 bg-card border border-border rounded-xl shadow-md overflow-hidden"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => handleOption(onCameraClick)}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors text-left font-medium"
        aria-label="Open camera"
      >
        <span className="text-base leading-none">📷</span>
        <span>Camera</span>
      </button>
      <div className="border-t border-border/60" />
      <button
        type="button"
        role="menuitem"
        onClick={() => handleOption(onFileClick)}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors text-left font-medium"
        aria-label="Add files"
      >
        <span className="text-base leading-none">📁</span>
        <span>Add Files</span>
      </button>
    </div>
  );
}
