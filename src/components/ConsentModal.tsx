"use client";

import { useState, useRef, useEffect } from "react";

/* Pixel-art SVG icons extracted from 98.css */
const CLOSE_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='8' height='7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V6H5V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0V0z' fill='%23000'/%3E%3C/svg%3E")`;
const HELP_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='6' height='9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23000' d='M0 1h2v2H0zM1 0h4v1H1zM4 1h2v2H4zM3 3h2v1H3zM2 4h2v2H2zM2 7h2v2H2z'/%3E%3C/svg%3E")`;

const WIN95_FONT = `"Pixelated MS Sans Serif", Arial, sans-serif`;

const playClick = () => {
  new Audio("/assets/win95/click.mp3").play().catch(() => {});
};

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  title?: string;
}

export function ConsentModal({
  isOpen,
  onAccept,
  title = "Do you want to contend?",
}: ConsentModalProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    dragOffset.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      setPosition({ x: touch.clientX - dragOffset.current.x, y: touch.clientY - dragOffset.current.y });
    };
    const onEnd = () => setIsDragging(false);

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
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-none">
      {/* 98.css font face */}
      <style>{`
        @font-face {
          font-family: "Pixelated MS Sans Serif";
          font-style: normal;
          font-weight: 400;
          src: url("/assets/win95/ms_sans_serif.woff2") format("woff2"),
               url("/assets/win95/ms_sans_serif.woff") format("woff");
        }
        @font-face {
          font-family: "Pixelated MS Sans Serif";
          font-style: normal;
          font-weight: 700;
          src: url("/assets/win95/ms_sans_serif_bold.woff2") format("woff2"),
               url("/assets/win95/ms_sans_serif_bold.woff") format("woff");
        }
        .win95-btn:active {
          box-shadow: inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px grey !important;
        }
      `}</style>

      {/* Window */}
      <div
        style={{
          background: "silver",
          boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px grey, inset 2px 2px #fff",
          padding: 3,
          minWidth: 280,
          fontFamily: WIN95_FONT,
          fontSize: 11,
          WebkitFontSmoothing: "none",
          userSelect: "none",
          cursor: isDragging ? "grabbing" : "grab",
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Title bar */}
        <div
          style={{
            background: "linear-gradient(90deg, navy, #1084d0)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 11,
            fontFamily: WIN95_FONT,
            padding: "3px 2px 3px 3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ letterSpacing: 0, marginRight: 24 }}>denial</span>
          <div style={{ display: "flex" }}>
            {/* Help button */}
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
                backgroundImage: HELP_ICON,
                backgroundPosition: "top 2px left 5px",
                backgroundRepeat: "no-repeat",
              }}
              aria-label="Help"
              tabIndex={-1}
              onClick={playClick}
            />
            {/* Close button */}
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
                backgroundImage: CLOSE_ICON,
                backgroundPosition: "top 3px left 4px",
                backgroundRepeat: "no-repeat",
                marginLeft: 2,
              }}
              aria-label="Close"
              tabIndex={-1}
              onClick={playClick}
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ margin: 8 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "8px 4px" }}>
            {/* Random Win95 icon */}
            <img
              src="/assets/win95/dialog_icon.png"
              alt=""
              width={32}
              height={32}
              style={{ flexShrink: 0, imageRendering: "pixelated" }}
            />
            <p style={{ margin: 0, paddingTop: 6, color: "#222" }}>{title}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "8px 0 4px" }}>
            <button
              className="win95-btn"
              onClick={() => { playClick(); onAccept(); }}
              style={{
                background: "silver",
                border: "none",
                boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
                padding: "0 12px",
                fontSize: 11,
                fontFamily: WIN95_FONT,
                WebkitFontSmoothing: "none",
                cursor: "pointer",
                minWidth: 75,
                minHeight: 23,
                color: "#222",
              }}
            >
              OK
            </button>
            <button
              className="win95-btn"
              onClick={() => { playClick(); onAccept(); }}
              style={{
                background: "silver",
                border: "none",
                boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
                padding: "0 12px",
                fontSize: 11,
                fontFamily: WIN95_FONT,
                WebkitFontSmoothing: "none",
                cursor: "pointer",
                minWidth: 75,
                minHeight: 23,
                color: "#222",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
