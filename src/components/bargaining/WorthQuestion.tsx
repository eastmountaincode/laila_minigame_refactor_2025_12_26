"use client";

import { useState } from "react";
import { TypedText } from "./TypedText";

type WorthQuestionProps = {
  onComplete: () => void;
};

export function WorthQuestion({ onComplete }: WorthQuestionProps) {
  const [showButtons, setShowButtons] = useState(false);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-8">
        <img
          src="/assets/webflow/images/whats-it-worth-infinite.gif"
          alt=""
          className="max-w-[80vw] md:max-w-[400px]"
        />

        <div className="text-center">
          <TypedText
            text="What would you give for it?"
            speed={75}
            className="font-[Georgia] text-2xl italic text-purple-400 md:text-3xl"
            onComplete={() => setShowButtons(true)}
          />
        </div>

        {showButtons && (
          <div className="flex gap-6 animate-in fade-in duration-500">
            <button
              onClick={onComplete}
              className="px-8 py-3 text-xl text-white/80 transition-colors hover:text-white"
            >
              Nothing
            </button>
            <button
              onClick={onComplete}
              className="px-8 py-3 text-xl text-white/80 transition-colors hover:text-white"
            >
              Anything
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
