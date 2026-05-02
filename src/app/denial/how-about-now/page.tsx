"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { TypedText } from "@/components/denial/TypedText";

// ===========================================
// FLOWER POSITION - ADJUST THESE VALUES
// ===========================================

// Desktop (md and above - 768px+)
const FLOWER_TOP_DESKTOP = "125px";
const FLOWER_RIGHT_DESKTOP = "55px";
const FLOWER_SIZE_DESKTOP = "350px";

// Mobile (below 768px)
const FLOWER_TOP_MOBILE = "80px";
const FLOWER_RIGHT_MOBILE = "20px";
const FLOWER_SIZE_MOBILE = "300px";

// ===========================================

export default function HowAboutNowPage() {
  const [showFine, setShowFine] = useState(false);
  const [flowerOffset, setFlowerOffset] = useState({ x: 0, y: 0 });
  const [isFlowerDragging, setIsFlowerDragging] = useState(false);
  const flowerDragStart = useRef({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setShowFine(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleFlowerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    flowerDragStart.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      offsetX: flowerOffset.x,
      offsetY: flowerOffset.y,
    };
    setIsFlowerDragging(true);
  };

  const handleFlowerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isFlowerDragging) return;

    setFlowerOffset({
      x: flowerDragStart.current.offsetX + e.clientX - flowerDragStart.current.pointerX,
      y: flowerDragStart.current.offsetY + e.clientY - flowerDragStart.current.pointerY,
    });
  };

  const handleFlowerPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsFlowerDragging(false);
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black text-white">
      {/* Purple Flower Image - positioned top-right */}
      {/* Mobile flower */}
      <div
        className="absolute md:hidden"
        onPointerDown={handleFlowerPointerDown}
        onPointerMove={handleFlowerPointerMove}
        onPointerUp={handleFlowerPointerEnd}
        onPointerCancel={handleFlowerPointerEnd}
        style={{
          top: FLOWER_TOP_MOBILE,
          right: FLOWER_RIGHT_MOBILE,
          transform: `translate(${flowerOffset.x}px, ${flowerOffset.y}px)`,
          cursor: isFlowerDragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <Image
          src="/assets/webflow/images/picmix.com_1704987.png"
          alt=""
          width={500}
          height={500}
          className="h-auto opacity-80"
          style={{
            width: FLOWER_SIZE_MOBILE,
          }}
          priority
          unoptimized
          draggable={false}
        />
      </div>

      {/* Desktop flower */}
      <div
        className="absolute hidden md:block"
        onPointerDown={handleFlowerPointerDown}
        onPointerMove={handleFlowerPointerMove}
        onPointerUp={handleFlowerPointerEnd}
        onPointerCancel={handleFlowerPointerEnd}
        style={{
          top: FLOWER_TOP_DESKTOP,
          right: FLOWER_RIGHT_DESKTOP,
          transform: `translate(${flowerOffset.x}px, ${flowerOffset.y}px)`,
          cursor: isFlowerDragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <Image
          src="/assets/webflow/images/picmix.com_1704987.png"
          alt=""
          width={500}
          height={500}
          className="h-auto opacity-80"
          style={{
            width: FLOWER_SIZE_DESKTOP,
          }}
          priority
          unoptimized
          draggable={false}
        />
      </div>

      {/* Typed Text - positioned in middle area */}
      <div className="absolute left-0 right-0 top-[200px] text-center">
        <TypedText
          strings={["Hmmm... how about now?"]}
          typeSpeed={75}
          startDelay={2500}
          loop={false}
          className="font-pixel-alt text-[60px] italic text-[#84ff00] md:text-[60px]"
        />
      </div>

      {/* "fine" Button - positioned at bottom */}
      {showFine && (
        <div className="absolute bottom-[13%] left-[10%] z-10 text-center">
          <Link
            href="/denial/complete"
            className="font-pixel text-[40px] text-white hover:text-purple-400"
          >
            fine
          </Link>
        </div>
      )}
    </main>
  );
}
