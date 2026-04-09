"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ConsentModal } from "@/components/denial/ConsentModal";
import { WebcamMotion } from "@/components/denial/webcam";
import { sounds, dragPad } from "@/lib/sounds";

// Adjust these values to match Webflow styling
const FONT_SIZE = "45px";
const LINE_HEIGHT = "0.73";
const LETTER_SPACING = "0.5px";
const TEXT_STROKE = "0px pink";

// Flower image size (in pixels)
const FLOWER_SIZE_MOBILE = 200;
const FLOWER_SIZE_DESKTOP = 300;

// Delay before showing the consent modal (in ms)
const MODAL_DELAY = 1500;

export function DenialClient() {
  const [showModal, setShowModal] = useState(false);
  const [webcamActive, setWebcamActive] = useState(true);
  const [flowerPos, setFlowerPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [blurAmount, setBlurAmount] = useState(0);
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const dragStartTime = useRef(0);

  // Canvas trail refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flowerImg = useRef<HTMLImageElement | null>(null);
  const trailPositions = useRef<{ x: number; y: number }[]>([]);
  const trailMax = useRef(0);
  const trailAnimFrame = useRef(0);
  const isReleasingTrail = useRef(false);
  const beginRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [beginPositions, setBeginPositions] = useState<DOMRect[]>([]);

  // Preload flower image for canvas drawing
  useEffect(() => {
    const img = new Image();
    img.src = "/assets/webflow/images/beautiful-orchid-free-png.webp";
    flowerImg.current = img;
  }, []);

  // Resize canvas to match window
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Draw trail on canvas — runs every frame
  const drawTrail = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = flowerImg.current;
    if (!canvas || !ctx || !img || !img.complete) {
      trailAnimFrame.current = requestAnimationFrame(drawTrail);
      return;
    }

    const dpr = window.devicePixelRatio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const positions = trailPositions.current;
    const flowerSize = window.innerWidth >= 768 ? FLOWER_SIZE_DESKTOP : FLOWER_SIZE_MOBILE;

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      ctx.drawImage(img, pos.x * dpr, pos.y * dpr, flowerSize * dpr, flowerSize * (img.naturalHeight / img.naturalWidth) * dpr);
    }

    trailAnimFrame.current = requestAnimationFrame(drawTrail);
  }, []);

  // Start/stop the render loop
  useEffect(() => {
    trailAnimFrame.current = requestAnimationFrame(drawTrail);
    return () => cancelAnimationFrame(trailAnimFrame.current);
  }, [drawTrail]);

  // Trail release animation — quickly remove positions
  useEffect(() => {
    if (isDragging) {
      isReleasingTrail.current = false;
      return;
    }
    if (trailPositions.current.length === 0) return;

    isReleasingTrail.current = true;
    // Remove trail positions quickly — match the blur snapback speed
    const remove = () => {
      if (!isReleasingTrail.current) return;
      const count = Math.max(Math.ceil(trailPositions.current.length * 0.04), 1);
      trailPositions.current = trailPositions.current.slice(count);
      if (trailPositions.current.length > 0) {
        requestAnimationFrame(remove);
      }
    };
    requestAnimationFrame(remove);
  }, [isDragging]);

  // Grow trail capacity slowly while dragging
  useEffect(() => {
    if (!isDragging) {
      trailMax.current = 0;
      return;
    }
    // Start with just 2 — barely noticeable
    trailMax.current = 2;
    const interval = setInterval(() => {
      // Slow ramp: starts subtle, accelerates
      const increment = trailMax.current < 10 ? 1 : trailMax.current < 30 ? 2 : 4;
      trailMax.current = Math.min(trailMax.current + increment, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, [isDragging]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
      sounds.chord();
    }, MODAL_DELAY);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isDragging) {
      dragPad.stop();
      // Snap blur back quickly
      const snapBack = () => {
        setBlurAmount((prev) => {
          if (prev <= 0.1) return 0;
          requestAnimationFrame(snapBack);
          return prev * 0.85;
        });
      };
      requestAnimationFrame(snapBack);
      return;
    }
    dragPad.start();
    dragStartTime.current = performance.now();
    lastTime.current = performance.now();

    const trackSpeed = (cx: number, cy: number) => {
      const now = performance.now();
      const dt = (now - lastTime.current) / 1000;
      if (dt > 0) {
        const dx = cx - lastPos.current.x;
        const dy = cy - lastPos.current.y;
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;
        dragPad.update(speed);
      }
      lastPos.current = { x: cx, y: cy };
      lastTime.current = now;

      // Blur starts building when the 3rd note appears (30s)
      const elapsed = (now - dragStartTime.current) / 1000;
      if (elapsed > 30) {
        const blurProgress = Math.min((elapsed - 30) / 20, 1);
        setBlurAmount(blurProgress * 12);
      }

      // Trail — stamp position into the array (no React state, just mutate ref)
      if (trailMax.current > 0 && !isReleasingTrail.current) {
        const pos = {
          x: cx - dragOffset.current.x,
          y: cy - dragOffset.current.y,
        };
        trailPositions.current.push(pos);
        if (trailPositions.current.length > trailMax.current) {
          trailPositions.current = trailPositions.current.slice(
            trailPositions.current.length - trailMax.current
          );
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      setFlowerPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
      trackSpeed(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      setFlowerPos({ x: touch.clientX - dragOffset.current.x, y: touch.clientY - dragOffset.current.y });
      trackSpeed(touch.clientX, touch.clientY);
    };
    const onEnd = () => setIsDragging(false);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    document.addEventListener("mouseleave", onEnd);
    window.addEventListener("blur", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
      document.removeEventListener("mouseleave", onEnd);
      window.removeEventListener("blur", onEnd);
    };
  }, [isDragging]);

  const handleFlowerMouseDown = (e: React.MouseEvent) => {
    lastPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (!flowerPos) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setFlowerPos({ x: rect.left, y: rect.top });
    } else {
      dragOffset.current = { x: e.clientX - flowerPos.x, y: e.clientY - flowerPos.y };
    }
  };

  const handleFlowerTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    lastPos.current = { x: touch.clientX, y: touch.clientY };
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setIsDragging(true);
    if (!flowerPos) {
      dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      setFlowerPos({ x: rect.left, y: rect.top });
    } else {
      dragOffset.current = { x: touch.clientX - flowerPos.x, y: touch.clientY - flowerPos.y };
    }
  };

  // Track "BEGIN" positions — appear while dragging, before blur starts
  useEffect(() => {
    if (!isDragging) {
      setBeginPositions([]);
      return;
    }
    // Small delay so the spans are rendered, then grab positions
    const timer = setTimeout(() => {
      const rects = beginRefs.current
        .filter((el): el is HTMLSpanElement => el !== null)
        .map((el) => el.getBoundingClientRect());
      setBeginPositions(rects);
    }, 100);
    return () => clearTimeout(timer);
  }, [isDragging]);

  const handleAccept = () => {
    setShowModal(false);
  };

  return (
    <main className="relative min-h-dvh bg-black text-white">
      <ConsentModal
        isOpen={showModal}
        onAccept={handleAccept}
      />

      {/* Everything except flower and modal gets blurred */}
      <div
        style={{
          filter: blurAmount > 0.1 ? `blur(${blurAmount}px)` : "none",
          transition: isDragging ? "none" : "filter 0.4s ease-out",
        }}
      >
      {/* Webcam motion effect - behind everything */}
      <div className="fixed inset-0 z-0">
        <WebcamMotion isActive={webcamActive} />
      </div>

      {/* Content Overlay - scrollable */}
      <div className="relative z-10 flex min-h-dvh flex-col p-4 pb-30 md:p-14 md:pb-30">
        {/* Pink Quote Text */}
        <div className="max-w-[80vw] md:max-w-[45vw]">
          <p
            className="font-['Pixelated_Times_New_Roman',_sans-serif] italic"
            style={{
              fontSize: FONT_SIZE,
              lineHeight: LINE_HEIGHT,
              letterSpacing: LETTER_SPACING,
              WebkitTextStroke: TEXT_STROKE,
              color: 'pink',
            }}
          >
            WHEN WE LIVE OUTSIDE OURSELVES, AND BY THAT I MEAN ON EXTERNAL
            DIRECTIVES ONLY RATHER THAN FROM OUR INTERNAL KNOWLEDGE AND NEEDS,
            WHEN WE LIVE AWAY FROM THOSE EROTIC GUIDES FROM WITHIN OURSELVES,
            THEN OUR LIVES ARE LIMITED BY EXTERNAL AND ALIEN FORMS, AND WE
            CONFORM TO THE NEEDS OF A STRUCTURE THAT IS NOT BASED ON HUMAN NEED,
            LET ALONE AN INDIVIDUAL&apos;S.
            <br />
            <br />
            BUT WHEN WE <span ref={(el) => { beginRefs.current[0] = el; }}>BEGIN</span> TO LIVE FROM WITHIN OUTWARD, IN TOUCH WITH THE
            POWER OF THE EROTIC WITHIN OURSELVES, AND ALLOWING THAT POWER TO
            INFORM AND ILLUMINATE OUR ACTIONS UPON THE WORLD AROUND US, THEN WE{" "}
            <span ref={(el) => { beginRefs.current[1] = el; }}>BEGIN</span> TO BE RESPONSIBLE TO OURSELVES IN THE DEEPEST SENSE. FOR AS WE{" "}
            <span ref={(el) => { beginRefs.current[2] = el; }}>BEGIN</span> TO RECOGNIZE OUR DEEPEST FEELINGS, WE <span ref={(el) => { beginRefs.current[3] = el; }}>BEGIN</span> TO GIVE UP, OF
            NECESSITY, BEING SATISFIED WITH SUFFERING AND SELF-NEGATION, AND
            WITH THE NUMBNESS WHICH SO OFTEN SEEMS LIKE THEIR ONLY ALTERNATIVE
            IN OUR SOCIETY.
            <br />
            <br />
            OUR ACTS AGAINST OPPRESSION BECOME INTEGRAL WITH SELF, MOTIVATED AND
            EMPOWERED FROM{" "}
            <Link
              href="/denial/present"
              className="text-[#f0a] underline decoration-2 underline-offset-4 hover:[text-shadow:_-1px_-1px_0_#fff,_1px_-1px_0_#fff,_-1px_1px_0_#fff,_1px_1px_0_#fff]"
            >
              WITHIN
            </Link>
            .
          </p>
        </div>

      </div>
      </div>{/* end blur wrapper */}

      {/* Unblurred "BEGIN" words floating on top */}
      {beginPositions.map((rect, i) => (
        <span
          key={i}
          className="pointer-events-none fixed font-['Pixelated_Times_New_Roman',_sans-serif] italic"
          style={{
            left: rect.left,
            top: rect.top,
            fontSize: FONT_SIZE,
            lineHeight: LINE_HEIGHT,
            letterSpacing: LETTER_SPACING,
            WebkitTextStroke: TEXT_STROKE,
            color: "pink",
            zIndex: 15,
          }}
        >
          BEGIN
        </span>
      ))}

      {/* Canvas trail — GPU-accelerated, no DOM thrashing */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 19 }}
      />

      {/* Orchid Image - draggable */}
      <div
        className={`z-20 ${!flowerPos ? "bottom-0 md:right-50 right-10" : ""}`}
        style={{
          position: "fixed",
          ...(flowerPos ? { left: flowerPos.x, top: flowerPos.y, bottom: "auto", right: "auto" } : {}),
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "none",
          width: "fit-content",
        }}
        onMouseDown={handleFlowerMouseDown}
        onTouchStart={handleFlowerTouchStart}
      >
        <img
          src="/assets/webflow/images/beautiful-orchid-free-png.webp"
          alt=""
          className="orchid-flower h-auto"
          draggable={false}
        />
        <style>{`
          .orchid-flower {
            width: ${FLOWER_SIZE_MOBILE}px;
            min-width: ${FLOWER_SIZE_MOBILE}px;
          }
          @media (min-width: 768px) {
            .orchid-flower {
              width: ${FLOWER_SIZE_DESKTOP}px;
              min-width: ${FLOWER_SIZE_DESKTOP}px;
            }
          }
        `}</style>
      </div>
    </main>
  );
}
