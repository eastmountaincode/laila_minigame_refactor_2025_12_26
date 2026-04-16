"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDevMode } from "@/components/DevModeProvider";

import { sounds } from "@/lib/sounds";
const playClick = sounds.click;

// Drawing text - you can customize this with your own content
const DRAWING_TEXT = "Flash flood you drown. But it's the ocean inside of my head. I feed the mountain. My affirmations are avalanches. And it's so not me to want it to bleed. But there's something sweet. There's a ledger they'll make with your name. Will I do anything? I'll do anything. Apologize. I never wanted to scare you. A winded sigh. Dry hurricanes all around the truth. And it's so not me to want it to bleed. But there's something sweet. There's a ledger they'll make with your name. Will I do anything? I'll do anything. ";

export function DrawingCanvas() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showThisIsMe, setShowThisIsMe] = useState(false);
  const [showNotGoodEnough, setShowNotGoodEnough] = useState(false);
  const [showNotGoodEnoughButtons, setShowNotGoodEnoughButtons] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const devMode = useDevMode();

  // Draggable state for "not good enough" dialog
  const [dialogPos, setDialogPos] = useState({ x: 0, y: 0 });
  const [isDraggingDialog, setIsDraggingDialog] = useState(false);
  const dialogDragOffset = useRef({ x: 0, y: 0 });

  const handleDialogMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDraggingDialog(true);
    dialogDragOffset.current = { x: e.clientX - dialogPos.x, y: e.clientY - dialogPos.y };
  };

  const handleDialogTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const touch = e.touches[0];
    setIsDraggingDialog(true);
    dialogDragOffset.current = { x: touch.clientX - dialogPos.x, y: touch.clientY - dialogPos.y };
  };

  useEffect(() => {
    if (!isDraggingDialog) return;

    const onMouseMove = (e: MouseEvent) => {
      setDialogPos({ x: e.clientX - dialogDragOffset.current.x, y: e.clientY - dialogDragOffset.current.y });
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      setDialogPos({ x: touch.clientX - dialogDragOffset.current.x, y: touch.clientY - dialogDragOffset.current.y });
    };
    const onEnd = () => setIsDraggingDialog(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDraggingDialog]);

  const positionRef = useRef({ x: 0, y: 0 });
  const counterRef = useRef(0);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas?.getContext("2d") ?? null;
  }, []);

  const distance = (pt1: { x: number; y: number }, pt2: { x: number; y: number }) => {
    const xs = pt2.x - pt1.x;
    const ys = pt2.y - pt1.y;
    return Math.sqrt(xs * xs + ys * ys);
  };

  const textWidth = useCallback(
    (char: string, fontSize: number) => {
      const ctx = getContext();
      if (!ctx) return 0;
      ctx.font = `${fontSize}px Georgia`;
      return ctx.measureText(char).width;
    },
    [getContext]
  );

  const draw = useCallback(
    (mouseX: number, mouseY: number) => {
      const ctx = getContext();
      if (!ctx || !isDrawing) return;

      const position = positionRef.current;
      const d = distance(position, { x: mouseX, y: mouseY });
      const minFontSize = 3;
      const fontSize = minFontSize + d / 2;
      const letter = DRAWING_TEXT[counterRef.current];
      const stepSize = textWidth(letter, fontSize);

      if (d > stepSize) {
        const angle = Math.atan2(mouseY - position.y, mouseX - position.x);

        ctx.font = `${fontSize}px Georgia`;
        ctx.fillStyle = "#000000";
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);
        ctx.fillText(letter, 0, 0);
        ctx.restore();

        counterRef.current = (counterRef.current + 1) % DRAWING_TEXT.length;
        position.x = position.x + Math.cos(angle) * stepSize;
        position.y = position.y + Math.sin(angle) * stepSize;

        if (!hasDrawn) {
          setHasDrawn(true);
        }
      }
    },
    [getContext, isDrawing, textWidth, hasDrawn]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDrawing(true);
    setShowInstructions(false);
    positionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    draw(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = () => {
    if (isDrawing && hasDrawn) {
      setShowThisIsMe(true);
    }
    setIsDrawing(false);
  };

  const handleDoubleClick = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setShowThisIsMe(false);
    setShowNotGoodEnough(false);
    setShowInstructions(true);
    counterRef.current = 0;
  };


  const handleCamera = useCallback(() => {
    const srcCanvas = canvasRef.current;
    if (!srcCanvas) return;

    const w = srcCanvas.width;
    const h = srcCanvas.height;
    const border = 12;
    const bottomBar = 48;
    const totalW = w + border * 2;
    const totalH = h + border + bottomBar;

    const out = document.createElement("canvas");
    out.width = totalW;
    out.height = totalH;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    // White frame background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, totalW, totalH);

    // Draw the artwork
    ctx.drawImage(srcCanvas, border, border, w, h);

    // Border line around the artwork
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(border - 0.5, border - 0.5, w + 1, h + 1);

    // Bottom bar text
    ctx.fillStyle = "#000";
    ctx.font = '16px "Pixelated MS Sans Serif", Arial, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("I'll Do Anything", totalW / 2, h + border + bottomBar / 2);

    out.toBlob(async (blob) => {
      if (!blob) return;

      // Detect mobile / in-app browser — use share sheet there
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile && navigator.share && navigator.canShare) {
        const file = new File([blob], "ill-do-anything.png", { type: "image/png" });
        const shareData = { files: [file] };
        try {
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return;
          }
        } catch {
          // User cancelled or share failed — fall through
        }
      }

      // Desktop: direct download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "ill-do-anything.png";
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, "image/png");
  }, []);

  const handleTryAgain = () => {
    setShowNotGoodEnoughButtons(false);
    handleDoubleClick();
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDrawing(true);
    setShowInstructions(false);
    positionRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    draw(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchEnd = () => {
    if (isDrawing && hasDrawn) {
      setShowThisIsMe(true);
    }
    setIsDrawing(false);
  };

  // Resize both canvases to fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Show buttons 1.5 seconds after "not good enough" popup appears
  useEffect(() => {
    if (showNotGoodEnough && !showNotGoodEnoughButtons) {
      const timer = setTimeout(() => {
        setShowNotGoodEnoughButtons(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showNotGoodEnough, showNotGoodEnoughButtons]);

  return (
    <div className="fixed inset-0" style={{ backgroundColor: "#fff" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        style={{ backgroundColor: "transparent" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <p
            style={{
              fontFamily: '"Apple Chancery", cursive',
              fontSize: '40px',
              color: '#FF0000'
            }}
          >
            show me what you look like
          </p>
          <p
            className="mt-2"
            style={{
              fontFamily: '"Apple Chancery", cursive',
              fontSize: '40px',
              color: '#FF0000'
            }}
          >
            {"{"}click and drag to draw{"}"}
          </p>
        </div>
      )}

      {/* "This is what I look like" + camera buttons */}
      {showThisIsMe && !showNotGoodEnough && (
        <div className="fixed bottom-[10%] left-1/2 -translate-x-1/2 flex gap-2 md:bottom-[3%]" style={{ whiteSpace: "nowrap" }}>
          <button
            onClick={() => { playClick(); setShowThisIsMe(false); setTimeout(() => setShowNotGoodEnough(true), 2300); }}
            className="win95-btn cursor-pointer"
            style={{
              background: "silver",
              border: "none",
              boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
              padding: "4px 20px",
              fontSize: 11,
              fontFamily: '"Pixelated MS Sans Serif", Arial, sans-serif',
              WebkitFontSmoothing: "none",
              minHeight: 23,
              color: "#222",
              outline: "1px dotted #000",
              outlineOffset: "-4px",
            }}
          >
            this is what i look like
          </button>
          <button
            onClick={() => { playClick(); handleDoubleClick(); }}
            className="win95-btn cursor-pointer"
            style={{
              background: "silver",
              border: "none",
              boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
              padding: "4px 12px",
              fontSize: 11,
              fontFamily: '"Pixelated MS Sans Serif", Arial, sans-serif',
              WebkitFontSmoothing: "none",
              minHeight: 23,
              color: "#222",
            }}
          >
            reset
          </button>
          <button
            onClick={() => { playClick(); handleCamera(); }}
            className="win95-btn cursor-pointer"
            style={{
              background: "silver",
              border: "none",
              boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
              padding: "4px 8px",
              minHeight: 23,
              minWidth: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            aria-label="Camera"
          >
            <img
              src="/assets/win95/camera.png"
              alt="Camera"
              style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, imageRendering: "pixelated" }}
            />
          </button>
        </div>
      )}

      {/* "That's not good enough" Win95 dialog */}
      {showNotGoodEnough && (
        <div
          className="absolute left-1/2 top-1/2 z-20"
          style={{
            transform: `translate(calc(-50% + ${dialogPos.x}px), calc(-50% + ${dialogPos.y}px))`,
          }}
        >
          <div
            style={{
              background: "silver",
              boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px grey, inset 2px 2px #fff",
              padding: 3,
              minWidth: 280,
              fontFamily: '"Pixelated MS Sans Serif", Arial, sans-serif',
              fontSize: 11,
              WebkitFontSmoothing: "none",
              userSelect: "none",
              cursor: isDraggingDialog ? "grabbing" : "grab",
            }}
            onMouseDown={handleDialogMouseDown}
            onTouchStart={handleDialogTouchStart}
          >
            {/* Title bar */}
            <div
              style={{
                background: "linear-gradient(90deg, navy, #1084d0)",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 11,
                fontFamily: '"Pixelated MS Sans Serif", Arial, sans-serif',
                padding: "3px 2px 3px 3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ letterSpacing: 0, marginRight: 24 }}>&nbsp;</span>
              <button
                className="win95-btn"
                style={{
                  display: "block",
                  background: "silver",
                  boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
                  border: "none",
                  minWidth: 16,
                  minHeight: 14,
                  padding: 0,
                  cursor: "pointer",
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg width='8' height='7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V6H5V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0V0z' fill='%23000'/%3E%3C/svg%3E")`,
                  backgroundPosition: "top 3px left 4px",
                  backgroundRepeat: "no-repeat",
                }}
                aria-label="Close"
                tabIndex={-1}
              />
            </div>

            {/* Body */}
            <div style={{ margin: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "8px 4px" }}>
                <img
                  src="/assets/win95/error_icon.png"
                  alt=""
                  width={32}
                  height={32}
                  style={{ flexShrink: 0, imageRendering: "pixelated" }}
                />
                <p style={{ margin: 0, paddingTop: 6, color: "#222", fontWeight: "bold" }}>
                  That&apos;s not good enough.
                </p>
              </div>

              {showNotGoodEnoughButtons && (
                <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "8px 0 4px" }}>
                  <button
                    onClick={() => { playClick(); router.push("/bargaining/treat"); }}
                    className="win95-btn cursor-pointer"
                    style={{
                      background: "silver",
                      border: "none",
                      boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
                      padding: "0 12px",
                      fontSize: 11,
                      fontFamily: '"Pixelated MS Sans Serif", Arial, sans-serif',
                      WebkitFontSmoothing: "none",
                      minWidth: 75,
                      minHeight: 23,
                      color: "#222",
                    }}
                  >
                    I did my best
                  </button>
                  <button
                    onClick={() => { playClick(); handleTryAgain(); }}
                    className="win95-btn cursor-pointer"
                    style={{
                      background: "silver",
                      border: "none",
                      boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
                      padding: "0 12px",
                      fontSize: 11,
                      fontFamily: '"Pixelated MS Sans Serif", Arial, sans-serif',
                      WebkitFontSmoothing: "none",
                      minWidth: 75,
                      minHeight: 23,
                      color: "#222",
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => { playClick(); handleCamera(); }}
                    className="win95-btn cursor-pointer"
                    style={{
                      background: "silver",
                      border: "none",
                      boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
                      padding: "0 6px",
                      minHeight: 23,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    aria-label="Save image"
                  >
                    <img
                      src="/assets/win95/camera.png"
                      alt="Camera"
                      style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, imageRendering: "pixelated" }}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
