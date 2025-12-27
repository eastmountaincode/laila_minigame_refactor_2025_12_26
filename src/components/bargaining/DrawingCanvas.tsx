"use client";

import { useRef, useState, useEffect, useCallback } from "react";

type DrawingCanvasProps = {
  onComplete: () => void;
};

// Drawing text - you can customize this with your own content
const DRAWING_TEXT =
  "What do you see when you look at yourself? Do you see someone worth fighting for? Worth waiting for? Worth believing in? Or do you see something dreadful waiting to happen? The answer is in your hands. Draw it out. Let it flow. Let it go. What are you willing to give? What are you willing to lose? The choice was always yours. ";

export function DrawingCanvas({ onComplete }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

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
        ctx.fillStyle = "#FF0000";
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
      setShowMessage(true);
    }
    setIsDrawing(false);
  };

  const handleDoubleClick = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setShowMessage(false);
    setShowInstructions(true);
    counterRef.current = 0;
  };

  const handleTryAgain = () => {
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
      setShowMessage(true);
    }
    setIsDrawing(false);
  };

  // Resize canvas to fill container
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

  return (
    <div className="fixed inset-0 bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-[Georgia] text-3xl italic text-red-500 md:text-4xl">
            show me what you look like
          </p>
          <p className="mt-4 text-sm text-white/60">
            {"{"} click and drag to draw {"}"}
          </p>
        </div>
      )}

      {/* "That's not good enough" message */}
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <img
              src="/assets/webflow/images/thats-not-good-enough-no-buttons.png"
              alt="That's not good enough"
              className="max-w-[80vw] md:max-w-[600px]"
            />
            <div className="flex gap-4">
              <button
                onClick={onComplete}
                className="bg-white/10 px-6 py-3 text-lg text-white transition-colors hover:bg-white/20"
              >
                I did my best
              </button>
              <button
                onClick={handleTryAgain}
                className="bg-white/10 px-6 py-3 text-lg text-white transition-colors hover:bg-white/20"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
