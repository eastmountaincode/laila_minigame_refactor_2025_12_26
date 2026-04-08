"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const WIN95_FONT = `"Pixelated MS Sans Serif", Arial, sans-serif`;

const CLOSE_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='8' height='7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V6H5V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0V0z' fill='%23000'/%3E%3C/svg%3E")`;
const HELP_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='6' height='9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23000' d='M0 1h2v2H0zM1 0h4v1H1zM4 1h2v2H4zM3 3h2v1H3zM2 4h2v2H2zM2 7h2v2H2z'/%3E%3C/svg%3E")`;

const playClick = () => {
  new Audio("/assets/win95/click.mp3").play().catch(() => {});
};

type PopupView = "main" | "confirm";

export default function AngerCompletePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [popupView, setPopupView] = useState<PopupView>("main");

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      router.push("/denial/i-love-you");
    } catch {
      setStatus("error");
      setErrorMessage("Oops! Something went wrong while submitting the form.");
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("input, button")) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("input, button")) return;
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

  const titleBarBtnStyle: React.CSSProperties = {
    display: "block",
    background: "silver",
    boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
    border: "none",
    minWidth: 16,
    minHeight: 14,
    padding: 0,
    cursor: "pointer",
    backgroundRepeat: "no-repeat",
  };

  const dialogBtnStyle: React.CSSProperties = {
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
  };

  const inputStyle: React.CSSProperties = {
    background: "#fff",
    border: "none",
    boxShadow: "inset -1px -1px #fff, inset 1px 1px grey, inset -2px -2px #dfdfdf, inset 2px 2px #0a0a0a",
    padding: "3px 4px",
    fontSize: 11,
    fontFamily: WIN95_FONT,
    WebkitFontSmoothing: "none",
    color: "#222",
    width: "100%",
    height: 21,
    outline: "none",
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black">
      <style>{`
        .win95-btn:active {
          box-shadow: inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px grey !important;
        }
        .win95-btn-default:active {
          box-shadow: inset 2px 2px #0a0a0a, inset -1px -1px #0a0a0a, inset -2px -2px #fff, inset 3px 3px grey, inset -3px -3px #dfdfdf !important;
        }
      `}</style>

      {/* Animated GIF Background */}
      <div className="absolute inset-0 select-none">
        <Image
          src="/assets/webflow/images/anger-picmix-crop.gif"
          alt=""
          width={1486}
          height={1000}
          className="h-full w-full object-contain object-[center_20%] md:object-cover md:object-center"
          unoptimized
          priority
          draggable={false}
        />
      </div>

      {/* Win95 Dialog */}
      <div
        style={{
          background: "silver",
          boxShadow: "inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px grey, inset 2px 2px #fff",
          padding: 3,
          minWidth: 300,
          fontFamily: WIN95_FONT,
          fontSize: 11,
          WebkitFontSmoothing: "none",
          userSelect: "none",
          cursor: isDragging ? "grabbing" : "grab",
          transform: `translate(${position.x}px, ${position.y}px)`,
          zIndex: 10,
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
          <span style={{ letterSpacing: 0, marginRight: 24 }}>
            {popupView === "main" ? "Attention: You chose anger." : "Wait!"}
          </span>
          <div style={{ display: "flex" }}>
            <button
              className="win95-btn"
              style={{ ...titleBarBtnStyle, backgroundImage: HELP_ICON, backgroundPosition: "top 2px left 5px" }}
              aria-label="Help"
              tabIndex={-1}
            />
            <button
              className="win95-btn"
              style={{ ...titleBarBtnStyle, backgroundImage: CLOSE_ICON, backgroundPosition: "top 3px left 4px", marginLeft: 2 }}
              aria-label="Close"
              tabIndex={-1}
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ margin: 8 }}>
          {popupView === "main" ? (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "8px 4px" }}>
                <img
                  src="/assets/win95/warning_icon.png"
                  alt=""
                  width={32}
                  height={32}
                  style={{ flexShrink: 0, imageRendering: "pixelated" }}
                />
                <p style={{ margin: 0, paddingTop: 6, color: "#222" }}>
                  When was the last time you forged your own tools?
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: "4px 4px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <label style={{ color: "#222", whiteSpace: "nowrap" }}>Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="enter your email"
                    required
                    style={{ ...inputStyle, cursor: "text" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "4px 0 4px" }}>
                  <button
                    className="win95-btn win95-btn-default"
                    type="submit"
                    disabled={status === "loading"}
                    onClick={playClick}
                    style={{
                      ...dialogBtnStyle,
                      boxShadow: "inset -2px -2px #0a0a0a, inset 1px 1px #0a0a0a, inset 2px 2px #fff, inset -3px -3px grey, inset 3px 3px #dfdfdf",
                      opacity: status === "loading" ? 0.5 : 1,
                    }}
                  >
                    {status === "loading" ? "..." : "Submit"}
                  </button>
                  <button
                    className="win95-btn"
                    type="button"
                    onClick={() => { playClick(); setPopupView("confirm"); }}
                    style={dialogBtnStyle}
                  >
                    Never
                  </button>
                </div>
              </form>

              {status === "error" && (
                <p style={{ color: "red", margin: "4px 4px 0", fontSize: 11 }}>{errorMessage}</p>
              )}
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "8px 4px" }}>
                <img
                  src="/assets/win95/warning_icon.png"
                  alt=""
                  width={32}
                  height={32}
                  style={{ flexShrink: 0, imageRendering: "pixelated" }}
                />
                <p style={{ margin: 0, paddingTop: 6, color: "#222" }}>
                  Are you sure you don&apos;t want my gift?
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "8px 0 4px" }}>
                <button
                  className="win95-btn win95-btn-default"
                  onClick={() => { playClick(); setPopupView("main"); }}
                  style={{
                    ...dialogBtnStyle,
                    boxShadow: "inset -2px -2px #0a0a0a, inset 1px 1px #0a0a0a, inset 2px 2px #fff, inset -3px -3px grey, inset 3px 3px #dfdfdf",
                  }}
                >
                  I want it
                </button>
                <button
                  className="win95-btn"
                  onClick={() => { playClick(); router.push("/"); }}
                  style={dialogBtnStyle}
                >
                  Don&apos;t want
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Home icon */}
      <Link href="/" className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center">
        <Image
          src="/assets/webflow/images/home_gif.gif"
          alt="Home"
          width={96}
          height={96}
          className="w-12 md:w-14 h-auto"
          unoptimized
        />
        <span className="text-white text-sm md:text-md -mt-3 ml-1 tracking-[0.1em]" style={{ fontFamily: '"Pixelated MS Sans Serif", Arial, sans-serif', WebkitFontSmoothing: "none" }}>HOME</span>
      </Link>
    </main>
  );
}
