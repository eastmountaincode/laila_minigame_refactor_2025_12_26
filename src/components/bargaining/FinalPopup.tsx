"use client";

import { useState } from "react";
import Link from "next/link";

type FinalPopupProps = {
  onComplete?: () => void;
};

export function FinalPopup({ onComplete }: FinalPopupProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success state
    // In production, you'd send this to an API
    setSubmitted(true);
    onComplete?.();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      {/* Background GIF */}
      <img
        src="/assets/webflow/images/bargaining-cropped.gif"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />

      {/* Yellow triangle popup */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <img
            src="/assets/webflow/images/yellow-triangle-pop-up.png"
            alt=""
            className="max-w-[90vw] md:max-w-[500px]"
          />

          {/* Content overlay on the triangle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-12 text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-black/70">
              Attention: You chose to bargain.
            </p>

            <h2 className="mb-6 font-[Georgia] text-xl italic text-black md:text-2xl">
              Have you mastered your desire for control?
            </h2>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter your email to receive"
                  required
                  className="w-64 border-b-2 border-black/30 bg-transparent px-2 py-2 text-center text-black placeholder:text-black/50 focus:border-black focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-black/80 px-6 py-2 text-sm uppercase tracking-wider text-white transition-colors hover:bg-black"
                >
                  Submit
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-black/70">Thank you for your submission.</p>
                <Link
                  href="/"
                  className="text-sm uppercase tracking-wider text-black underline underline-offset-4"
                >
                  Return home
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
