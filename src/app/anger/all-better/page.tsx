"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AllBetterPage() {
  const router = useRouter();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isOverTarget, setIsOverTarget] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const targetRef = useRef<HTMLDivElement>(null);
  const vesselRef = useRef<HTMLDivElement>(null);

  const checkOverlap = (vesselX: number, vesselY: number) => {
    if (!targetRef.current || !vesselRef.current) return false;

    const target = targetRef.current.getBoundingClientRect();
    const vessel = vesselRef.current.getBoundingClientRect();

    const vesselCenterX = vesselX + vessel.width / 2;
    const vesselCenterY = vesselY + vessel.height / 2;

    return (
      vesselCenterX >= target.left &&
      vesselCenterX <= target.right &&
      vesselCenterY >= target.top &&
      vesselCenterY <= target.bottom
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = vesselRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    setPosition({ x: newX, y: newY });
    setIsOverTarget(checkOverlap(newX, newY));
  };

  const handleMouseUp = () => {
    if (isOverTarget) {
      router.push("/anger/complete");
    }
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    const rect = vesselRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.current.x;
    const newY = touch.clientY - dragOffset.current.y;

    setPosition({ x: newX, y: newY });
    setIsOverTarget(checkOverlap(newX, newY));
  };

  const handleTouchEnd = () => {
    if (isOverTarget) {
      router.push("/anger/complete");
    }
    setIsDragging(false);
  };

  return (
    <main
      className="relative h-dvh overflow-hidden bg-black p-8 px-24"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Content */}
      <div className="flex h-full flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
        {/* Target - angry natsuki */}
        <div ref={targetRef} className="flex items-center justify-center">
          <Image
            src="/assets/webflow/images/angry-natsuki.png"
            alt=""
            width={350}
            height={350}
            className="h-auto w-[200px] md:w-[350px]"
            unoptimized
          />
        </div>

        {/* Text */}
        <div className="px-4 font-pixel text-[24px] text-white md:text-[60px] leading-[1]">
          <p>Hmmm, you haven&apos;t made it better.</p>
        </div>
      </div>

      {/* Draggable vessel */}
      <div
        ref={vesselRef}
        className="fixed w-[100px] md:w-[200px] cursor-grab select-none touch-none active:cursor-grabbing"
        style={{
          left: position.x || "auto",
          top: position.y || "auto",
          right: position.x ? "auto" : "20px",
          bottom: position.y ? "auto" : "20px",
          transform: isOverTarget ? "scaleY(-1)" : "none",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <Image
          src="/assets/webflow/images/picmix.com_2164255.png"
          alt=""
          width={200}
          height={200}
          className="h-auto w-[100px] md:w-[200px]"
          draggable={false}
          unoptimized
        />
      </div>
    </main>
  );
}
