"use client";

import Link from "next/link";
import Image from "next/image";
import { TypedText } from "@/components/TypedText";

export default function AreYouSurePage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black text-white">
      {/* Rose Image - centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/assets/webflow/images/rose.png"
          alt=""
          width={500}
          height={500}
          className="h-auto w-[20vw] max-w-[400px] opacity-80"
          priority
        />
      </div>

      {/* Y/N Buttons */}
      <div className="relative z-10 flex gap-24 md:gap-32">
        <Link
          href="/denial/how-about-now"
          className="text-6xl font-bold text-white transition-colors hover:text-pink-400 md:text-8xl"
        >
          N
        </Link>
        <Link
          href="/denial/complete"
          className="text-6xl font-bold text-white transition-colors hover:text-pink-400 md:text-8xl"
        >
          Y
        </Link>
      </div>

      {/* Typed Text */}
      <div className="absolute bottom-12 left-6 right-6 text-center md:bottom-16 md:left-12 md:right-12">
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
          className="text-lg text-purple-400 md:text-xl lg:text-2xl"
        />
      </div>
    </main>
  );
}
