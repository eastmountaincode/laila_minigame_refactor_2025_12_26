"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ConsentModal } from "@/components/denial/ConsentModal";
import { WebcamMotion } from "@/components/denial/webcam";
import { sounds } from "@/lib/sounds";

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
  const dragOffset = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
      sounds.chord();
    }, MODAL_DELAY);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => {
      setFlowerPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      setFlowerPos({ x: touch.clientX - dragOffset.current.x, y: touch.clientY - dragOffset.current.y });
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

  const handleFlowerMouseDown = (e: React.MouseEvent) => {
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
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setIsDragging(true);
    if (!flowerPos) {
      dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      setFlowerPos({ x: rect.left, y: rect.top });
    } else {
      dragOffset.current = { x: touch.clientX - flowerPos.x, y: touch.clientY - flowerPos.y };
    }
  };

  const handleAccept = () => {
    setShowModal(false);
  };

  return (
    <main className="relative min-h-dvh bg-black text-white">
      {/* Webcam motion effect - behind everything */}
      <div className="fixed inset-0 z-0">
        <WebcamMotion isActive={webcamActive} />
      </div>

      <ConsentModal
        isOpen={showModal}
        onAccept={handleAccept}
      />

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
            BUT WHEN WE BEGIN TO LIVE FROM WITHIN OUTWARD, IN TOUCH WITH THE
            POWER OF THE EROTIC WITHIN OURSELVES, AND ALLOWING THAT POWER TO
            INFORM AND ILLUMINATE OUR ACTIONS UPON THE WORLD AROUND US, THEN WE
            BEGIN TO BE RESPONSIBLE TO OURSELVES IN THE DEEPEST SENSE. FOR AS WE
            BEGIN TO RECOGNIZE OUR DEEPEST FEELINGS, WE BEGIN TO GIVE UP, OF
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

      {/* Orchid Image - draggable */}
      <div
        className={`z-20 ${!flowerPos ? "bottom-0 md:right-50 right-10" : ""}`}
        style={{
          position: "fixed",
          ...(flowerPos ? { left: flowerPos.x, top: flowerPos.y, bottom: "auto", right: "auto" } : {}),
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "none",
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
          }
          @media (min-width: 768px) {
            .orchid-flower {
              width: ${FLOWER_SIZE_DESKTOP}px;
            }
          }
        `}</style>
      </div>
    </main>
  );
}
