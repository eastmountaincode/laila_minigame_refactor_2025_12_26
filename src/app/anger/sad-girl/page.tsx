"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SadGirlPage() {
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowArrow(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-black p-8 px-24">
      <div className="flex flex-col items-center gap-8 md:flex-row md:gap-8">
        {/* Clickable gif with arrow text */}
        <div className="relative">
          <Link href="/anger/all-better">
            <Image
              src="/assets/webflow/images/natsuki-annoyed.gif"
              alt=""
              width={300}
              height={300}
              className="h-auto w-[200px] cursor-pointer md:w-[300px]"
              unoptimized
            />
          </Link>
          {/* Arrow text positioned relative to image - desktop */}
          {showArrow && (
            <div
              className="absolute left-full hidden whitespace-nowrap font-pixel text-[24px] text-white md:block"
              style={{ top: "22%", marginLeft: "-10px" }}
            >
              &lt;--- click to calm down
            </div>
          )}
          {/* Arrow text - mobile (absolute with fixed left) */}
          {showArrow && (
            <div
              className="absolute font-pixel text-[20px] leading-tight text-white md:hidden"
              style={{ left: "198px", top: "80px" }}
            >
              <div>&lt;---</div>
              <div>click to</div>
              <div>calm down</div>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="font-pixel text-[24px] text-white md:text-[48px] leading-[1]">
          <p>You&apos;re not bored already, are you?</p>
        </div>
      </div>
    </main>
  );
}
