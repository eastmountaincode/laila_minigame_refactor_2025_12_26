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
  const [showThisIsMe, setShowThisIsMe] = useState(false);
  const [showNotGoodEnough, setShowNotGoodEnough] = useState(false);
  const [showNotGoodEnoughButtons, setShowNotGoodEnoughButtons] = useState(false);
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
    <div className="fixed inset-0 bg-white">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair bg-white"
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

      {/* "This is what I look like" button */}
      {showThisIsMe && !showNotGoodEnough && (
        <button
          onClick={() => setShowNotGoodEnough(true)}
          className="fixed bottom-[3%] right-0 left-0 mx-auto cursor-pointer text-xl text-black"
          style={{
            backgroundImage: 'url(/assets/webflow/images/Screenshot-2023-11-19-at-14.00.16.png)',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '300px 50px',
            width: '400px',
            height: '100px',
            fontFamily: 'Pixeltimesnewroman, sans-serif',
            fontSize: '20px',
          }}
        >
          this is what i look like
        </button>
      )}

      {/* "That's not good enough" message */}
      {showNotGoodEnough && (
        <img
          src="/assets/webflow/images/thats-not-good-enough-no-buttons.png"
          alt="That's not good enough"
          className="absolute left-1/2 top-1/2 scale-120 -translate-x-1/2 -translate-y-1/2 md:w-auto md:max-w-[650px] md:scale-100"
        />
      )}

      {/* Buttons appear 1.5s after popup */}
      {showNotGoodEnoughButtons && (
        <div className="fixed bottom-[2%] left-0 right-0 mx-auto flex w-fit flex-col -space-y-10 md:flex-row md:space-y-0 md:gap-2">
          <button
            onClick={onComplete}
            className="cursor-pointer px-6 py-3 text-xl text-black"
            style={{
              backgroundImage: 'url(/assets/webflow/images/Screenshot-2023-11-19-at-14.00.16.png)',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '90%',
              width: '250px',
              height: '120px',
              fontFamily: 'Pixeltimesnewroman, sans-serif',
              fontSize: '25px',
            }}
          >
            I did my best
          </button>
          <button
            onClick={handleTryAgain}
            className="cursor-pointer px-6 py-3 text-xl text-black"
            style={{
              backgroundImage: 'url(/assets/webflow/images/Screenshot-2023-11-19-at-14.00.16.png)',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '90%',
              width: '250px',
              height: '120px',
              fontFamily: 'Pixeltimesnewroman, sans-serif',
              fontSize: '25px',
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
