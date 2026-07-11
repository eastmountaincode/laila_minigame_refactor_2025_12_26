"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { markPathwayComplete } from "@/lib/pathway-completion";
import { sounds } from "@/lib/sounds";

const CLOSE_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='8' height='7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V6H5V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0V0z' fill='%23000'/%3E%3C/svg%3E")`;
const HELP_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='6' height='9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23000' d='M0 1h2v2H0zM1 0h4v1H1zM4 1h2v2H4zM3 3h2v1H3zM2 4h2v2H2zM2 7h2v2H2z'/%3E%3C/svg%3E")`;
const MINIMIZE_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='6' height='2' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23000' d='M0 0h6v2H0z'/%3E%3C/svg%3E")`;
const MAXIMIZE_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='9' height='9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h9v9H0V0zm1 2h7v6H1V2z' fill='%23000'/%3E%3C/svg%3E")`;

const WIN98_FONT = `"Pixelated MS Sans Serif", "MSW98UI", Arial, sans-serif`;
const WIN95_FONT = `"Pixelated MS Sans Serif", Arial, sans-serif`;

interface TenderOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Below this width, scale iframe contents so win98 desktop has room
const SCALE_BREAKPOINT = 700;
const MIN_IFRAME_WIDTH = 800;
const TENDER_OS_SRC = "/win98-web/index.html?v=ie-home-2026-05-01";
type FinalEmailView = "main" | "confirm" | "complete";
type PinballMobileKey = "left" | "launch" | "right";
type PinballMobileAction = "down" | "up";

function PinballTouchButton({
  label,
  caption,
  keyId,
  wide = false,
  onKeyAction,
}: {
  label: string;
  caption?: string;
  keyId: PinballMobileKey;
  wide?: boolean;
  onKeyAction: (key: PinballMobileKey, action: PinballMobileAction) => void;
}) {
  const activePointer = useRef<number | null>(null);

  const releaseActivePointer = useCallback(() => {
    if (activePointer.current === null) return;

    activePointer.current = null;
    onKeyAction(keyId, "up");
  }, [keyId, onKeyAction]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) releaseActivePointer();
    };

    window.addEventListener("blur", releaseActivePointer);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("blur", releaseActivePointer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseActivePointer();
    };
  }, [releaseActivePointer]);

  const press = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (activePointer.current !== null) return;

    activePointer.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    onKeyAction(keyId, "down");
  };

  const release = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (activePointer.current !== event.pointerId) return;

    activePointer.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    onKeyAction(keyId, "up");
  };

  return (
    <button
      className={`pinball-mobile-key${wide ? " pinball-mobile-key-wide" : ""}`}
      type="button"
      tabIndex={-1}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={(event) => {
        if (activePointer.current === event.pointerId) {
          activePointer.current = null;
          onKeyAction(keyId, "up");
        }
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      aria-label={caption ? `${caption}: ${label}` : label === "/" ? "Forward slash" : label}
    >
      <span>{label}</span>
      {caption ? <span className="pinball-mobile-key-caption">{caption}</span> : null}
    </button>
  );
}

function PinballMobileControls({
  visible,
  onKeyAction,
}: {
  visible: boolean;
  onKeyAction: (key: PinballMobileKey, action: PinballMobileAction) => void;
}) {
  if (!visible) return null;

  return (
    <div
      className="pinball-mobile-controls"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <PinballTouchButton label="Z" keyId="left" onKeyAction={onKeyAction} />
      <PinballTouchButton label="Space" keyId="launch" wide onKeyAction={onKeyAction} />
      <PinballTouchButton
        label="/"
        keyId="right"
        onKeyAction={onKeyAction}
      />
    </div>
  );
}

function TenderFinalEmailDialog({
  isOpen,
  onClose,
  onDecline,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDecline: () => void;
  onComplete: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [popupView, setPopupView] = useState<FinalEmailView>("main");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;
    setPopupView("main");
    setStatus("idle");
    setErrorMessage("");
    setPosition({ x: 0, y: 0 });
  }, [isOpen]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (event: MouseEvent) => {
      setPosition({
        x: event.clientX - dragOffset.current.x,
        y: event.clientY - dragOffset.current.y,
      });
    };
    const onEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  const titleBarBtnStyle: CSSProperties = {
    display: "block",
    background: "silver",
    boxShadow:
      "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
    border: "none",
    minWidth: 16,
    minHeight: 14,
    padding: 0,
    cursor: "pointer",
    backgroundRepeat: "no-repeat",
  };

  const dialogBtnStyle: CSSProperties = {
    background: "silver",
    border: "none",
    boxShadow:
      "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
    padding: "0 12px",
    fontSize: 11,
    fontFamily: WIN95_FONT,
    WebkitFontSmoothing: "none",
    cursor: "pointer",
    minWidth: 75,
    minHeight: 23,
    color: "#222",
  };

  const inputStyle: CSSProperties = {
    background: "#fff",
    border: "none",
    boxShadow:
      "inset -1px -1px #fff, inset 1px 1px grey, inset -2px -2px #dfdfdf, inset 2px 2px #0a0a0a",
    padding: "3px 4px",
    fontSize: 11,
    fontFamily: WIN95_FONT,
    WebkitFontSmoothing: "none",
    color: "#222",
    width: "100%",
    height: 21,
    outline: "none",
    cursor: "text",
  };

  const playClick = () => {
    sounds.click();
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("input, button")) return;
    setIsDragging(true);
    dragOffset.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    playClick();

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pathway: "tender" }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "Failed to subscribe");
      }

      setPopupView("complete");
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMessage("Oops! Something went wrong while submitting the form.");
    }
  };

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[70] flex items-center justify-center"
      onClick={(event) => event.stopPropagation()}
    >
      <style>{`
        .win95-btn:active {
          box-shadow: inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px grey !important;
        }
        .win95-btn-default:active {
          box-shadow: inset 2px 2px #0a0a0a, inset -1px -1px #0a0a0a, inset -2px -2px #fff, inset 3px 3px grey, inset -3px -3px #dfdfdf !important;
        }
      `}</style>
      <div
        className="dreadful-dialog"
        style={{
          background: "silver",
          boxShadow:
            "inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px grey, inset 2px 2px #fff",
          padding: 3,
          minWidth: 300,
          fontFamily: WIN95_FONT,
          fontSize: 11,
          WebkitFontSmoothing: "none",
          userSelect: "none",
          cursor: isDragging ? "grabbing" : "grab",
          transform: `translate(${position.x}px, ${position.y}px)`,
          zIndex: 50,
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          className="dreadful-titlebar"
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
            {popupView === "confirm" ? "Wait!" : "Attention: You chose tender."}
          </span>
          <div style={{ display: "flex" }}>
            <button
              className="win95-btn"
              style={{
                ...titleBarBtnStyle,
                backgroundImage: HELP_ICON,
                backgroundPosition: "top 2px left 5px",
              }}
              aria-label="Help"
              tabIndex={-1}
            />
            <button
              className="win95-btn"
              style={{
                ...titleBarBtnStyle,
                backgroundImage: CLOSE_ICON,
                backgroundPosition: "top 3px left 4px",
                marginLeft: 2,
              }}
              onClick={() => {
                playClick();
                onClose();
              }}
              aria-label="Close"
              tabIndex={-1}
            />
          </div>
        </div>

        <div className="dreadful-body" style={{ margin: 8 }}>
          {popupView === "main" && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "8px 4px",
                }}
              >
                <img
                  src="/assets/win95/warning_icon.png"
                  alt=""
                  width={32}
                  height={32}
                  style={{ flexShrink: 0, imageRendering: "pixelated" }}
                />
                <p style={{ margin: 0, paddingTop: 6, color: "#222" }}>
                  Do you allow yourself to move tenderly through the world?
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: "4px 4px 0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <label style={{ color: "#222", whiteSpace: "nowrap" }}>
                    Email:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="enter your email"
                    required
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 6,
                    padding: "4px 0 4px",
                  }}
                >
                  <button
                    className="win95-btn win95-btn-default"
                    type="submit"
                    disabled={status === "loading"}
                    style={{
                      ...dialogBtnStyle,
                      boxShadow:
                        "inset -2px -2px #0a0a0a, inset 1px 1px #0a0a0a, inset 2px 2px #fff, inset -3px -3px grey, inset 3px 3px #dfdfdf",
                      opacity: status === "loading" ? 0.5 : 1,
                    }}
                  >
                    {status === "loading" ? "..." : "Yes"}
                  </button>
                  <button
                    className="win95-btn"
                    type="button"
                    onClick={() => {
                      playClick();
                      setPopupView("confirm");
                    }}
                    style={dialogBtnStyle}
                  >
                    No
                  </button>
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: 13,
                    lineHeight: 1.2,
                    margin: "8px auto 0",
                    textAlign: "center",
                  }}
                >
                  By submitting your email, you agree to receive emails from me now and
                  again. You may unsubscribe whenever you wish.
                </div>
              </form>

              {status === "error" && (
                <p style={{ color: "red", margin: "4px 4px 0", fontSize: 11 }}>
                  {errorMessage}
                </p>
              )}
            </>
          )}

          {popupView === "confirm" && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "8px 4px",
                }}
              >
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 6,
                  padding: "8px 0 4px",
                }}
              >
                <button
                  className="win95-btn win95-btn-default"
                  onClick={() => {
                    playClick();
                    setPopupView("main");
                  }}
                  style={{
                    ...dialogBtnStyle,
                    boxShadow:
                      "inset -2px -2px #0a0a0a, inset 1px 1px #0a0a0a, inset 2px 2px #fff, inset -3px -3px grey, inset 3px 3px #dfdfdf",
                  }}
                >
                  I want it
                </button>
                <button
                  className="win95-btn"
                  onClick={() => {
                    playClick();
                    onDecline();
                  }}
                  style={dialogBtnStyle}
                >
                  Don&apos;t want
                </button>
              </div>
            </>
          )}

          {popupView === "complete" && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "8px 4px",
                }}
              >
                <img
                  src="/assets/win95/warning_icon.png"
                  alt=""
                  width={32}
                  height={32}
                  style={{ flexShrink: 0, imageRendering: "pixelated" }}
                />
                <p style={{ margin: 0, paddingTop: 6, color: "#222" }}>
                  I&apos;ll see you in the next arrangement.
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
                <button
                  className="win95-btn win95-btn-default"
                  onClick={() => {
                    playClick();
                    onComplete();
                  }}
                  style={{
                    ...dialogBtnStyle,
                    boxShadow:
                      "inset -2px -2px #0a0a0a, inset 1px 1px #0a0a0a, inset 2px 2px #fff, inset -3px -3px grey, inset 3px 3px #dfdfdf",
                  }}
                >
                  OK
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function TenderOSModal({ isOpen, onClose }: TenderOSModalProps) {
  const [loaded, setLoaded] = useState(false);
  const [iframeScale, setIframeScale] = useState(1);
  const [finalEmailOpen, setFinalEmailOpen] = useState(false);
  const [pinballControlsVisible, setPinballControlsVisible] = useState(false);
  const tenderIframeRef = useRef<HTMLIFrameElement>(null);
  const finalEmailSourceRef = useRef<Window | null>(null);

  const handleClose = useCallback(() => {
    setLoaded(false);
    setFinalEmailOpen(false);
    setPinballControlsVisible(false);
    finalEmailSourceRef.current = null;
    onClose();
  }, [onClose]);

  const handleFinalEmailDecline = useCallback(() => {
    setFinalEmailOpen(false);
    finalEmailSourceRef.current?.postMessage(
      { type: "tender:close-befree" },
      window.location.origin
    );
    finalEmailSourceRef.current = null;
  }, []);

  const resumePinballAudio = useCallback(() => {
    try {
      const osDocument = tenderIframeRef.current?.contentDocument;
      const pinballIframe = osDocument?.querySelector<HTMLIFrameElement>(
        'iframe[src*="games/pinball/"]'
      );
      const pinballWindow = pinballIframe?.contentWindow as
        | (Window & {
            Module?: { SDL2?: { audioContext?: AudioContext } };
          })
        | null;
      const audioContext = pinballWindow?.Module?.SDL2?.audioContext;
      if (audioContext?.state === "suspended") {
        void audioContext.resume();
      }
    } catch (error) {
      console.warn("[tender-audio] Could not resume Pinball audio.", error);
    }
  }, []);

  const postPinballMobileKey = useCallback(
    (key: PinballMobileKey, action: PinballMobileAction) => {
      resumePinballAudio();
      tenderIframeRef.current?.contentWindow?.postMessage(
        { type: "tender:pinball-mobile-key", key, action },
        window.location.origin
      );
    },
    [resumePinballAudio]
  );

  useEffect(() => {
    if (!isOpen) return;
    const updateScale = () => {
      const w = window.innerWidth * 0.96;
      if (w < SCALE_BREAKPOINT) {
        setIframeScale(w / MIN_IFRAME_WIDTH);
      } else {
        setIframeScale(1);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen || !loaded) return;

    const osDocument = tenderIframeRef.current?.contentDocument;
    if (!osDocument) return;

    const handleTenderClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest) return;
      if (target.closest(".desktop .explorer-icon, .dialog-buttons button")) {
        sounds.click();
      }
    };

    osDocument.addEventListener("click", handleTenderClick, true);
    return () => osDocument.removeEventListener("click", handleTenderClick, true);
  }, [isOpen, loaded]);

  useEffect(() => {
    if (!isOpen) return;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "tender:pinball-mobile-controls") {
        setPinballControlsVisible(Boolean(event.data.visible));
        return;
      }

      if (event.data?.type === "tender:play-startup-sound") {
        void sounds.tenderStartup.play(event.data.soundUrl);
        return;
      }

      if (event.data?.type === "tender:play-system-sound") {
        const sourceWindow = event.source as Window | null;
        const requestId = event.data.requestId;
        const soundUrl = event.data.soundUrl;
        if (typeof soundUrl !== "string") return;

        void sounds.tenderSystem.play(soundUrl).finally(() => {
          if (!sourceWindow || typeof requestId !== "string") return;
          sourceWindow.postMessage(
            { type: "tender:system-sound-finished", requestId },
            event.origin
          );
        });
        return;
      }

      if (event.data?.type !== "tender:show-final-email-dialog") return;
      markPathwayComplete("tender");
      setFinalEmailOpen(true);
      const sourceWindow = event.source as Window | null;
      finalEmailSourceRef.current = sourceWindow;
      sourceWindow?.postMessage(
        { type: "tender:final-email-dialog-shown", id: event.data.id },
        event.origin
      );
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex cursor-default items-center justify-center"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <style>{`
        .win98-title-btn:active {
          box-shadow: inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px grey !important;
        }
        .pinball-mobile-controls {
          display: none;
        }
        @media (pointer: coarse), (max-width: 700px) {
          .pinball-mobile-controls {
            position: fixed;
            left: max(12px, env(safe-area-inset-left));
            right: max(12px, env(safe-area-inset-right));
            bottom: max(14px, env(safe-area-inset-bottom));
            z-index: 60;
            display: grid;
            grid-template-columns: 1fr minmax(132px, 1.85fr) 1fr;
            gap: 10px;
            pointer-events: auto;
            touch-action: none;
          }
          .pinball-mobile-key {
            min-height: 52px;
            border: 0;
            border-radius: 0;
            background: silver;
            color: #000;
            box-shadow: inset -2px -2px #0a0a0a, inset 1px 1px #fff, inset -3px -3px grey, inset 3px 3px #dfdfdf;
            font-family: ${WIN98_FONT};
            font-size: 16px;
            font-weight: bold;
            line-height: 1;
            letter-spacing: 0;
            -webkit-font-smoothing: none;
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
          }
          .pinball-mobile-key:active {
            box-shadow: inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px grey;
            padding-top: 2px;
            padding-left: 2px;
          }
          .pinball-mobile-key-caption {
            font-size: 9px;
            font-weight: normal;
            line-height: 1;
            text-transform: uppercase;
          }
          .pinball-mobile-key-wide {
            font-size: 15px;
          }
        }
      `}</style>

      {/* Win98-style window — fullscreen on mobile, large on desktop */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          cursor: "default",
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
              onClick={handleClose}
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
            ref={tenderIframeRef}
            src={TENDER_OS_SRC}
            style={{
              width: `${100 / iframeScale}%`,
              height: `${100 / iframeScale}%`,
              transform: `scale(${iframeScale})`,
              transformOrigin: "top left",
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
                background: "#000",
              }}
            />
          )}
        </div>
      </div>
      <PinballMobileControls
        visible={loaded && pinballControlsVisible}
        onKeyAction={postPinballMobileKey}
      />
      <TenderFinalEmailDialog
        isOpen={finalEmailOpen}
        onClose={() => setFinalEmailOpen(false)}
        onDecline={handleFinalEmailDecline}
        onComplete={handleClose}
      />
    </div>
  );
}
