"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { TypedText } from "@/components/denial/TypedText";

// Adjust these to move the entire Y/Rose/N group as one unit
// Desktop
const GROUP_TOP_DESKTOP = "45%";
const GROUP_LEFT_DESKTOP = "50%";
// Mobile
const GROUP_TOP_MOBILE = "55%";
const GROUP_LEFT_MOBILE = "65%";

// Desktop positioning (md and up)
const Y_TOP_DESKTOP = "-120px";
const Y_LEFT_DESKTOP = "-280px";
const N_TOP_DESKTOP = "120px";
const N_LEFT_DESKTOP = "240px";

// Mobile positioning
const Y_TOP_MOBILE = "-80px";
const Y_LEFT_MOBILE = "-120px";
const N_TOP_MOBILE = "100px";
const N_LEFT_MOBILE = "100px";

// Rose positioning (same for both)
const ROSE_TOP = "0px";
const ROSE_LEFT = "-60px";

// Rose image size (in pixels) - fixed sizes, not responsive to window
const ROSE_SIZE_MOBILE = 180;
const ROSE_SIZE_DESKTOP = 270;

export default function AreYouSurePage() {
  const yButtonRef = useRef<HTMLAnchorElement>(null);
  const yGlyphRef = useRef<HTMLSpanElement>(null);
  const ySpinRef = useRef<Animation | null>(null);
  const yInertiaRef = useRef<Animation | null>(null);
  const yRotationRef = useRef(0);
  const [roseOffset, setRoseOffset] = useState({ x: 0, y: 0 });
  const [isRoseDragging, setIsRoseDragging] = useState(false);
  const roseDragStart = useRef({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 });

  const getCurrentYRotation = (yGlyph: HTMLElement) => {
    const transform = getComputedStyle(yGlyph).transform;
    if (!transform || transform === "none") return yRotationRef.current;

    const matrix = new DOMMatrixReadOnly(transform);
    return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
  };

  const handleYMouseEnter = () => {
    const yGlyph = yGlyphRef.current;
    if (!yGlyph) return;

    if (yInertiaRef.current) {
      yRotationRef.current = getCurrentYRotation(yGlyph);
      yInertiaRef.current.cancel();
      yInertiaRef.current = null;
    }

    ySpinRef.current?.cancel();
    const from = yRotationRef.current;
    const to = from + 360;

    ySpinRef.current = yGlyph.animate(
      [
        { transform: `rotate(${from}deg)` },
        { transform: `rotate(${to}deg)` },
      ],
      {
        duration: 80,
        easing: "linear",
        iterations: Infinity,
        fill: "forwards",
      }
    );

    ySpinRef.current.onfinish = () => {
      ySpinRef.current = null;
    };
  };

  const handleYMouseLeave = () => {
    const yGlyph = yGlyphRef.current;
    const spin = ySpinRef.current;
    if (!yGlyph || !spin) return;

    yRotationRef.current = getCurrentYRotation(yGlyph);
    yGlyph.style.transform = `rotate(${yRotationRef.current}deg)`;
    spin.cancel();
    ySpinRef.current = null;

    const coastTo = yRotationRef.current + 240;
    yInertiaRef.current = yGlyph.animate(
      [
        { transform: `rotate(${yRotationRef.current}deg)` },
        { transform: `rotate(${coastTo}deg)` },
      ],
      {
        duration: 220,
        easing: "cubic-bezier(0.05, 0.72, 0.18, 1)",
        fill: "forwards",
      }
    );

    yInertiaRef.current.onfinish = () => {
      yRotationRef.current = coastTo;
      yGlyph.style.transform = `rotate(${coastTo}deg)`;
      yInertiaRef.current?.cancel();
      yInertiaRef.current = null;
    };
  };

  const handleRosePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    roseDragStart.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      offsetX: roseOffset.x,
      offsetY: roseOffset.y,
    };
    setIsRoseDragging(true);
  };

  const handleRosePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!isRoseDragging) return;

    setRoseOffset({
      x: roseDragStart.current.offsetX + e.clientX - roseDragStart.current.pointerX,
      y: roseDragStart.current.offsetY + e.clientY - roseDragStart.current.pointerY,
    });
  };

  const handleRosePointerEnd = (e: React.PointerEvent<HTMLImageElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsRoseDragging(false);
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      {/* Typed Text - top center */}
      <div className="fixed left-0 right-0 top-[120px] text-center md:top-[120px]">
        <TypedText
          strings={[
            "Wait! Are you sure yowua",
            "Wait! Are you sure you want this",
          ]}
          typeSpeed={75}
          backSpeed={50}
          backDelay={100}
          startDelay={500}
          loop={false}
          className="font-['Pixelated_Times_New_Roman',_sans-serif] text-[42px] italic text-[#f0a] md:text-[60px]"
        />
      </div>

      {/* Y / Rose / N Group - moves together */}
      <div className="yn-group fixed -translate-x-1/2 -translate-y-[-50%]">
        {/* Y Button */}
        <Link
          ref={yButtonRef}
          href="/denial/complete"
          className="y-button absolute inline-block font-[Pixeltimesnewroman,_sans-serif] text-[60px] leading-none text-white hover:text-pink-400 md:text-[100px]"
          onMouseEnter={handleYMouseEnter}
          onMouseLeave={handleYMouseLeave}
        >
          <span ref={yGlyphRef} className="y-glyph inline-block">
            Y
          </span>
        </Link>

        {/* Rose Image - relative so it gives the container size */}
        <img
          src="/assets/webflow/images/rose.png"
          alt=""
          className="rose-image"
          draggable={false}
          onPointerDown={handleRosePointerDown}
          onPointerMove={handleRosePointerMove}
          onPointerUp={handleRosePointerEnd}
          onPointerCancel={handleRosePointerEnd}
          style={{
            marginTop: ROSE_TOP,
            marginLeft: ROSE_LEFT,
            transform: `translate(${roseOffset.x}px, ${roseOffset.y}px)`,
            cursor: isRoseDragging ? "grabbing" : "grab",
            touchAction: "none",
            userSelect: "none",
          }}
        />

        {/* N Button */}
        <Link
          href="/denial/how-about-now"
          className="n-button absolute font-[Pixeltimesnewroman,_sans-serif] text-[60px] text-white hover:text-pink-400 md:text-[100px]"
        >
          N
        </Link>
      </div>

      {/* Styles for responsive positioning */}
      <style>{`
        .yn-group {
          top: ${GROUP_TOP_MOBILE};
          left: ${GROUP_LEFT_MOBILE};
        }
        .rose-image {
          width: ${ROSE_SIZE_MOBILE}px;
        }
        .y-button {
          top: ${Y_TOP_MOBILE};
          left: ${Y_LEFT_MOBILE};
          padding: 24px;
          margin: -24px 0 0 -24px;
        }
        .n-button {
          top: ${N_TOP_MOBILE};
          left: ${N_LEFT_MOBILE};
        }
        @media (min-width: 768px) {
          .yn-group {
            top: ${GROUP_TOP_DESKTOP};
            left: ${GROUP_LEFT_DESKTOP};
          }
          .rose-image {
            width: ${ROSE_SIZE_DESKTOP}px;
          }
          .y-button {
            top: ${Y_TOP_DESKTOP};
            left: ${Y_LEFT_DESKTOP};
            padding: 32px;
            margin: -32px 0 0 -32px;
          }
          .n-button {
            top: ${N_TOP_DESKTOP};
            left: ${N_LEFT_DESKTOP};
          }
        }
      `}</style>
    </main>
  );
}
