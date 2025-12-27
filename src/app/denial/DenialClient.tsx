"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ConsentModal } from "@/components/ConsentModal";
import { WebcamMotion } from "@/components/webcam";

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
  const [webcamActive, setWebcamActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, MODAL_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setShowModal(false);
    setWebcamActive(true);
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

      {/* Orchid Image - fixed at bottom right */}
      <div className="pointer-events-none fixed bottom-0 md:right-50 right-10 z-20">
        <img
          src="/assets/webflow/images/beautiful-orchid-free-png.webp"
          alt=""
          className="orchid-flower h-auto"
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
