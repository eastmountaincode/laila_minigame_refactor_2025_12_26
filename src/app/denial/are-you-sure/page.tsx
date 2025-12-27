"use client";

import Link from "next/link";
import { TypedText } from "@/components/TypedText";

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
          href="/denial/complete"
          className="y-button absolute font-[Pixeltimesnewroman,_sans-serif] text-[60px] text-white hover:text-pink-400 md:text-[100px]"
        >
          Y
        </Link>

        {/* Rose Image - relative so it gives the container size */}
        <img
          src="/assets/webflow/images/rose.png"
          alt=""
          className="rose-image"
          style={{ marginTop: ROSE_TOP, marginLeft: ROSE_LEFT }}
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
