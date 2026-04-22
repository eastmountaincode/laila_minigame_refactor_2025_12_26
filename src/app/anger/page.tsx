"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";

export default function AngerPage() {
  const [flowerPos, setFlowerPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setIsDragging(true);
    el.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setFlowerPos({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <main className="relative min-h-dvh bg-black">
      {/* Text content */}
      <div className="p-6 md:p-16 md:pt-8">
        <div
          className="max-w-[90vw] font-pixel-alt text-[40px] italic leading-[30px] tracking-[0px] md:tracking-[0.5px] text-[#ffe883] md:max-w-[60vw] md:text-[45px] md:leading-[32px]"
        >
          <p>
            My mother taught me to survive from a very early age by her own
            example. Her silences also taught me isolation, fury, mistrust, self-
            rejection, and sadness. My survival lay in learning how to use the
            weapons she gave me, also, to fight against those things within
            myself, unnamed.
          </p>
          <p className="mt-8">
            <Link
              href="/anger/dont-touch-me"
              className="cursor-pointer text-[#ff0004] underline hover:text-[#ff6666]"
            >
              And survival is the greatest gift of love
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Flower image - draggable */}
      <div
        className="fixed select-none"
        style={
          flowerPos
            ? { left: flowerPos.x, top: flowerPos.y, cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }
            : { bottom: 0, right: 20, cursor: "grab", touchAction: "none" }
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Image
          src="/assets/webflow/images/picmix.com_1607078.png"
          alt=""
          width={700}
          height={400}
          className="h-auto w-[200px] md:w-[500px]"
          draggable={false}
          priority
          unoptimized
        />
      </div>
    </main>
  );
}
