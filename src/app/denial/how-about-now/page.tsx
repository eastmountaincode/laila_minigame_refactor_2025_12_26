"use client";

import Link from "next/link";
import Image from "next/image";
import { TypedText } from "@/components/TypedText";

export default function HowAboutNowPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black text-white">
      {/* Purple Flower Image - centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/assets/webflow/images/picmix.com_1704987.png"
          alt=""
          width={500}
          height={500}
          className="h-auto w-[25vw] max-w-[400px] opacity-80"
          priority
        />
      </div>

      {/* "fine" Button */}
      <div className="relative z-10">
        <Link
          href="/denial/complete"
          className="text-4xl font-bold text-white transition-colors hover:text-purple-400 md:text-6xl"
        >
          fine
        </Link>
      </div>

      {/* Typed Text */}
      <div className="absolute bottom-12 left-6 right-6 text-center md:bottom-16 md:left-12 md:right-12">
        <TypedText
          strings={["Hmmm... how about now?"]}
          typeSpeed={75}
          startDelay={500}
          loop={false}
          className="text-lg text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] md:text-xl lg:text-2xl"
        />
      </div>
    </main>
  );
}
