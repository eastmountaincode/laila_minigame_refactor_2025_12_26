"use client";

import { useState, useEffect, useCallback } from "react";

const CLOSE_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='8' height='7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V6H5V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0V0z' fill='%23000'/%3E%3C/svg%3E")`;
const MINIMIZE_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='6' height='2' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23000' d='M0 0h6v2H0z'/%3E%3C/svg%3E")`;
const MAXIMIZE_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='9' height='9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h9v9H0V0zm1 2h7v6H1V2z' fill='%23000'/%3E%3C/svg%3E")`;

const WIN98_FONT = `"Pixelated MS Sans Serif", "MSW98UI", Arial, sans-serif`;

interface TenderOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TenderOSModal({ isOpen, onClose }: TenderOSModalProps) {
  const [loaded, setLoaded] = useState(false);

  // Reset loaded state when modal closes
  useEffect(() => {
    if (!isOpen) setLoaded(false);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <style>{`
        .win98-title-btn:active {
          box-shadow: inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px grey !important;
        }
      `}</style>

      {/* Win98-style window — fullscreen on mobile, large on desktop */}
      <div
        style={{
          background: "silver",
          boxShadow:
            "inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px grey, inset 2px 2px #fff",
          padding: 3,
          fontFamily: WIN98_FONT,
          fontSize: 11,
          WebkitFontSmoothing: "none",
          display: "flex",
          flexDirection: "column",
          /* 4:3 aspect ratio that fits within viewport with padding */
          width: "min(96vw, calc(96dvh * 4 / 3))",
          height: "min(96dvh, calc(96vw * 3 / 4))",
          maxWidth: "1200px",
          maxHeight: "900px",
        }}
        className=""
      >
        {/* Title bar */}
        <div
          style={{
            background: "linear-gradient(90deg, #000080, #1084d0)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 11,
            fontFamily: WIN98_FONT,
            padding: "3px 2px 3px 3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span style={{ letterSpacing: 0, marginLeft: 2 }}>Tender OS</span>
          <div style={{ display: "flex", gap: 2 }}>
            {/* Minimize */}
            <button
              className="win98-title-btn"
              style={{
                display: "block",
                background: "silver",
                boxShadow:
                  "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
                border: "none",
                minWidth: 16,
                minHeight: 14,
                padding: 0,
                cursor: "pointer",
                backgroundImage: MINIMIZE_ICON,
                backgroundPosition: "bottom 3px left 4px",
                backgroundRepeat: "no-repeat",
              }}
              aria-label="Minimize"
              tabIndex={-1}
            />
            {/* Maximize */}
            <button
              className="win98-title-btn"
              style={{
                display: "block",
                background: "silver",
                boxShadow:
                  "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
                border: "none",
                minWidth: 16,
                minHeight: 14,
                padding: 0,
                cursor: "pointer",
                backgroundImage: MAXIMIZE_ICON,
                backgroundPosition: "top 1px left 3px",
                backgroundRepeat: "no-repeat",
              }}
              aria-label="Maximize"
              tabIndex={-1}
            />
            {/* Close */}
            <button
              className="win98-title-btn"
              onClick={onClose}
              style={{
                display: "block",
                background: "silver",
                boxShadow:
                  "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
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
              tabIndex={0}
            />
          </div>
        </div>

        {/* Content area — iframe fills remaining space */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            background: "#000",
            position: "relative",
          }}
        >
          <iframe
            src="http://localhost:5173"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: loaded ? "block" : "none",
            }}
            allow="autoplay"
            title="Tender OS"
            onLoad={() => setLoaded(true)}
          />
          {!loaded && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontFamily: "monospace",
                fontSize: 14,
              }}
            >
              Loading Tender OS...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
