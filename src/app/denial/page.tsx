"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ConsentModal } from "@/components/ConsentModal";
import { WebcamMotionDetection } from "@/components/WebcamMotionDetection";

export default function DenialPage() {
  const [showModal, setShowModal] = useState(true);
  const [webcamEnabled, setWebcamEnabled] = useState(false);

  const handleAccept = () => {
    setShowModal(false);
    setWebcamEnabled(true);
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      {/* Consent Modal */}
      <ConsentModal isOpen={showModal} onAccept={handleAccept} />

      {/* Webcam Motion Detection Background */}
      {webcamEnabled && <WebcamMotionDetection className="z-0" />}

      {/* Content Overlay */}
      <div className="pointer-events-none fixed inset-0 z-10">
        {/* Pink Quote Text */}
        <div className="absolute left-6 top-6 max-w-[80vw] md:left-12 md:top-12 md:max-w-[50vw]">
          <p className="text-sm leading-relaxed text-[#ffc0cb] md:text-base lg:text-lg">
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
              className="pointer-events-auto underline decoration-2 underline-offset-4 transition-colors hover:text-pink-300"
            >
              WITHIN
            </Link>
            .
          </p>
        </div>

        {/* Orchid Image */}
        <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12">
          <Image
            src="/assets/webflow/images/beautiful-orchid-free-png.webp"
            alt=""
            width={518}
            height={518}
            className="h-auto w-[40vw] max-w-[518px]"
            priority
          />
        </div>
      </div>
    </main>
  );
}


