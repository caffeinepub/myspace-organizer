import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SketchCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  backgroundImageUrl?: string | null;
}

const PEN_COLORS = [
  { label: "Black", value: "#1a1a1a" },
  { label: "Red", value: "#e53e3e" },
  { label: "Blue", value: "#3182ce" },
  { label: "Green", value: "#38a169" },
  { label: "Orange", value: "#dd6b20" },
  { label: "Purple", value: "#805ad5" },
];

export function SketchCanvas({
  isOpen,
  onClose,
  onSave,
  backgroundImageUrl,
}: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#1a1a1a");
  const [penSize, setPenSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  // Load background image and draw it on canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (bgImageRef.current) {
        ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    if (backgroundImageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        bgImageRef.current = img;
        const maxW = canvas.parentElement?.clientWidth || 360;
        const ratio = img.naturalHeight / img.naturalWidth;
        canvas.width = maxW;
        canvas.height = maxW * ratio;
        draw();
      };
      img.src = backgroundImageUrl;
    } else {
      bgImageRef.current = null;
      const maxW = canvas.parentElement?.clientWidth || 360;
      canvas.width = maxW;
      canvas.height = Math.round(maxW * 0.6);
      draw();
    }
  }, [isOpen, backgroundImageUrl]);

  const getPos = useCallback(
    (
      e: React.MouseEvent | React.TouchEvent,
    ): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const pos = getPos(e);
      if (!pos) return;
      setIsDrawing(true);
      lastPos.current = pos;
    },
    [getPos],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pos = getPos(e);
      if (!pos || !lastPos.current) return;

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = isEraser ? "#ffffff" : penColor;
      ctx.lineWidth = isEraser ? penSize * 4 : penSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      lastPos.current = pos;
    },
    [isDrawing, getPos, penColor, penSize, isEraser],
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  }, [onSave]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/90"
      aria-label="Sketch canvas"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          aria-label="Cancel sketch"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-white font-medium text-sm">
          {backgroundImageUrl ? "Draw on Image" : "Sketch"}
        </span>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          aria-label="Save sketch"
        >
          Save
        </button>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          className="touch-none rounded-lg shadow-xl block"
          style={{
            maxWidth: "100%",
            cursor: isEraser ? "cell" : "crosshair",
            background: "#fff",
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label="Drawing canvas"
        />
      </div>

      {/* Bottom toolbar */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-3">
        {/* Color row */}
        <div className="flex items-center gap-2 mb-3 justify-center flex-wrap">
          {PEN_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                setPenColor(c.value);
                setIsEraser(false);
              }}
              className="transition-transform hover:scale-110"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: c.value,
                border:
                  !isEraser && penColor === c.value
                    ? "3px solid white"
                    : "2px solid rgba(255,255,255,0.3)",
                transform:
                  !isEraser && penColor === c.value ? "scale(1.2)" : undefined,
              }}
              aria-label={`Use ${c.label} pen`}
              title={c.label}
            />
          ))}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-3">
          {/* Pen size */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPenSize((s) => Math.max(1, s - 1))}
              className="p-1 rounded text-gray-300 hover:text-white"
              aria-label="Decrease pen size"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div
              className="rounded-full bg-white transition-all"
              style={{
                width: penSize * 3,
                height: penSize * 3,
                minWidth: 4,
                minHeight: 4,
              }}
            />
            <button
              type="button"
              onClick={() => setPenSize((s) => Math.min(20, s + 1))}
              className="p-1 rounded text-gray-300 hover:text-white"
              aria-label="Increase pen size"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Eraser toggle */}
          <button
            type="button"
            onClick={() => setIsEraser((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isEraser
                ? "bg-white text-gray-900"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            aria-label={isEraser ? "Switch to pen" : "Switch to eraser"}
          >
            {isEraser ? "\u270f\ufe0f Pen" : "\u2b1c Eraser"}
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
            aria-label="Clear canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
