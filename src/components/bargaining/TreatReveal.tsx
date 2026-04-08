"use client";

import { useRouter } from "next/navigation";

export function TreatReveal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex items-center bg-black">
      <button
        onClick={() => router.push("/bargaining/worth")}
        className="fixed top-40 md:top-0 md:right-20 right-0 cursor-pointer focus:outline-none"
        aria-label="Click the bag to continue"
      >
        <img
          src="/assets/webflow/images/brown-paper-bag.png"
          alt="A brown paper bag"
          className="max-w-[90vw] md:max-w-[70vw]"
        />
      </button>
      <p
        className="absolute text-white bottom-[19%] text-[40px]"
        style={{
          fontFamily: 'Pixeltimesnewroman, sans-serif',
          left: '12%',
        }}
      >
        You get a treat.
      </p>
    </div>
  );
}
