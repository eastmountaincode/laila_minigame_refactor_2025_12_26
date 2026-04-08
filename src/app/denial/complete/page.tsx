"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type PopupView = "main" | "confirm";

export default function CompletePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [popupView, setPopupView] = useState<PopupView>("main");

  // Draggable state
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

      // Redirect to i-love-you page on success
      router.push("/denial/i-love-you");
    } catch {
      setStatus("error");
      setErrorMessage("Oops! Something went wrong while submitting the form.");
    }
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking on input or button
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't drag if touching input or button
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('input') || target.closest('button')) {
      return;
    }
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    dragOffset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragOffset.current.x,
      y: touch.clientY - dragOffset.current.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add global listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black">
      {/* Animated GIF Background */}
      <div className="absolute inset-0 select-none">
        <Image
          src="/assets/webflow/images/cropped-picmix.gif"
          alt=""
          width={1486}
          height={1000}
          className="h-full w-full object-contain object-[center_20%] md:object-cover md:object-center"
          unoptimized
          priority
          draggable={false}
        />
      </div>

      {/* Dialog Box - draggable container */}
      <div
        className="relative z-10 w-[80vw] max-w-[320px] cursor-grab select-none active:cursor-grabbing md:w-auto md:max-w-[550px]"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Dialog background image */}
        <Image
          src="/assets/webflow/images/yellow-triangle-pop-up.png"
          alt=""
          width={1790}
          height={400}
          className="h-auto w-full md:h-[170px] md:object-fill"
          unoptimized
          priority
          draggable={false}
        />

        {popupView === "main" ? (
          <>
            {/* Title bar text - positioned relative to dialog */}
            <div
              className="absolute left-0 right-0 md:top-[1%] top-[0%] text-center font-pixel text-[12px] text-white md:text-[20px]"
            >
              Attention: You chose denial.
            </div>

            <div
              className="absolute left-0 right-0 text-center font-pixel text-[10px] text-black md:text-[18px]"
              style={{ top: "24%" }}
            >
              Are you a cartographer of your own inner world?
            </div>

            {/* Form with input and button side by side on mobile */}
            <form
              id="email-form"
              onSubmit={handleSubmit}
              className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 md:flex-col md:gap-2"
              style={{ top: "45%" }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email"
                required
                className="w-[90px] cursor-text border-none bg-white px-1 py-0 font-pixel-alt text-[10px] text-black placeholder:text-[10px] md:w-[250px] md:text-[18px] md:placeholder:text-[24px]"
                style={{ outline: "2px dotted #cc0000" }}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="h-[22px] w-[70px] cursor-pointer bg-[url('/assets/webflow/images/Screenshot-2023-11-19-at-14.00.16.png')] bg-contain bg-center bg-no-repeat font-pixel text-[11px] text-black disabled:opacity-50 md:h-[35px] md:w-[120px] md:text-[20px]"
                >
                  {status === "loading" ? "..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => setPopupView("confirm")}
                  className="h-[22px] w-[70px] cursor-pointer bg-[url('/assets/webflow/images/Screenshot-2023-11-19-at-14.00.16.png')] bg-contain bg-center bg-no-repeat font-pixel text-[11px] text-black md:h-[35px] md:w-[120px] md:text-[20px]"
                >
                  No
                </button>
              </div>
            </form>

            {status === "error" && (
              <div className="absolute left-1/2 -translate-x-1/2 font-pixel text-red-600" style={{ top: "150%", fontSize: "24px" }}>
                {errorMessage}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Confirmation popup content */}
            <div
              className="absolute left-0 right-0 md:top-[1%] top-[0%] text-center font-pixel text-[12px] text-white md:text-[20px]"
            >
              Wait!
            </div>

            <div
              className="absolute left-0 right-0 text-center font-pixel text-[10px] text-black md:text-[18px]"
              style={{ top: "24%" }}
            >
              Are you sure you don&apos;t want my gift?
            </div>

            {/* Yes/No buttons */}
            <div
              className="absolute left-1/2 flex -translate-x-1/2 gap-2"
              style={{ top: "50%" }}
            >
              <button
                type="button"
                onClick={() => setPopupView("main")}
                className="h-[22px] w-[70px] cursor-pointer bg-[url('/assets/webflow/images/Screenshot-2023-11-19-at-14.00.16.png')] bg-contain bg-center bg-no-repeat font-pixel text-[11px] text-black md:h-[35px] md:w-[120px] md:text-[20px]"
              >
                I want it
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="h-[22px] w-[70px] cursor-pointer bg-[url('/assets/webflow/images/Screenshot-2023-11-19-at-14.00.16.png')] bg-contain bg-center bg-no-repeat font-pixel text-[11px] text-black md:h-[35px] md:w-[120px] md:text-[20px]"
              >
                Don&apos;t want
              </button>
            </div>
          </>
        )}
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
