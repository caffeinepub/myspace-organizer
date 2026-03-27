import { Download, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from "react";

export interface AttachedFile {
  /** Unique key used for storage (e.g. "note-123-0") */
  key: string;
  /** Original file name */
  name: string;
  /** MIME type, e.g. "image/jpeg" */
  mimeType: string;
  /** Object URL or data URL for display */
  url: string;
  /** File size in bytes (optional) */
  size?: number;
}

interface FilePreviewModalProps {
  file: AttachedFile | null;
  isOpen: boolean;
  onClose: () => void;
}

function isImageMime(mime: string) {
  return mime.startsWith("image/");
}
function isVideoMime(mime: string) {
  return mime.startsWith("video/");
}
function isPdfMime(mime: string) {
  return mime === "application/pdf";
}

export function FilePreviewModal({
  file,
  isOpen,
  onClose,
}: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset zoom when file changes (use whole file object as dep to satisfy exhaustive deps)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset only on file identity change
  useEffect(() => {
    setZoom(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleDownload = useCallback(() => {
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

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex flex-col"
      aria-label={`Preview: ${file.name}`}
    >
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 shrink-0">
        <span
          className="text-white text-sm font-medium truncate max-w-[60vw]"
          title={file.name}
        >
          {file.name}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {isImage && (
            <>
              <button
                type="button"
                onClick={zoomOut}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-white/70 text-xs min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Download file"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content area — scrollable */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-2">
        {isImage && (
          <div
            className="transition-transform origin-center"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              ref={imgRef}
              src={file.url}
              alt={file.name}
              className="block max-w-full h-auto rounded"
              style={{ maxHeight: "calc(90vh - 80px)" }}
              draggable={false}
            />
          </div>
        )}

        {isVideo && (
          // biome-ignore lint/a11y/useMediaCaption: preview modal for user's own uploaded files; captions not applicable
          <video
            src={file.url}
            controls
            autoPlay={false}
            className="max-w-full max-h-[calc(90vh-80px)] rounded"
          />
        )}

        {isPdf && (
          <iframe
            src={file.url}
            title={file.name}
            className="w-full rounded"
            style={{
              height: "calc(90vh - 80px)",
              minWidth: "min(100%, 800px)",
            }}
          />
        )}

        {!isImage && !isVideo && !isPdf && (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <span className="text-3xl">📄</span>
            </div>
            <div>
              <p className="text-white font-medium mb-1">{file.name}</p>
              <p className="text-white/60 text-sm">
                Preview not available for this file type
              </p>
              {file.size && (
                <p className="text-white/40 text-xs mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors"
              aria-label="Download file"
            >
              <Download className="w-4 h-4" />
              Download File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
