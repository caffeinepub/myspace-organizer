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
  onGalleryClick,
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
      aria-label="Image upload options"
      className="absolute z-50 mt-1 w-52 bg-card border border-border rounded-xl shadow-md overflow-hidden"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => handleOption(onCameraClick)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
        aria-label="Open camera"
      >
        <span className="text-base leading-none">📷</span>
        <span>Open Camera</span>
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => handleOption(onGalleryClick)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
        aria-label="Select from gallery"
      >
        <span className="text-base leading-none">🖼</span>
        <span>Select from Gallery</span>
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => handleOption(onFileClick)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
        aria-label="Upload documents or files"
      >
        <span className="text-base leading-none">📁</span>
        <span>Upload Documents / Files</span>
      </button>
    </div>
  );
}
