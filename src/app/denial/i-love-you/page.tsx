"use client";

import Image from "next/image";
import Link from "next/link";
import { TypedText } from "@/components/TypedText";

export default function ILoveYouPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-black">
      {/* Thank you text at top */}
      <div className="absolute top-[15%] left-0 right-0 text-center">
        <TypedText
          strings={["thank you, i'll speak to you soon"]}
          typeSpeed={75}
          startDelay={500}
          loop={false}
          className="font-pixel-alt text-[42px] italic text-[#84ff00] md:text-[80px]"
        />
      </div>

      {/* Flower image */}
      <div className="absolute right-[20%] top-[40%]">
        <Image
          src="/assets/webflow/images/picmix.com_2064406.png"
          alt=""
          width={600}
          height={600}
          className="h-[200px] w-auto md:h-[300px]"
          unoptimized
        />
      </div>

      {/* START OVER? Y - clickable link back to start */}
      <Link href="/" className="absolute bottom-[20%] left-[10%]">
        <TypedText
          strings={["START OVER? Y"]}
          typeSpeed={75}
          startDelay={4000}
          loop={false}
          className="font-pixel-alt text-[50px] italic text-[#84ff00] md:text-[80px]"
        />
      </Link>
    </main>
  );
}
