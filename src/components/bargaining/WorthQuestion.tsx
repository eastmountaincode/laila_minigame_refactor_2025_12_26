"use client";

import { useState } from "react";
import { TypedText } from "./TypedText";

type WorthQuestionProps = {
  onComplete: () => void;
};

export function WorthQuestion({ onComplete }: WorthQuestionProps) {
  const [showButtons, setShowButtons] = useState(false);

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-black">
      {/* GIF - at top on mobile, centered on desktop */}
      <img
        src="/assets/webflow/images/whats-it-worth-infinite.gif"
        alt=""
        className="mt-[80px] max-w-[70%] md:fixed md:top-[350px] md:mt-0 md:w-[40%]"
      />

      {/* Typed text - below GIF on mobile, at top on desktop */}
      <div
        className="mt-8 px-4 text-center md:fixed md:top-[50px] md:mt-0"
        style={{
          fontFamily: '"Pixelated Times New Roman", sans-serif',
          fontStyle: 'italic',
          color: '#f0a',
          letterSpacing: '1px',
        }}
      >
        <p className="text-[48px] md:text-[80px]">
          <TypedText
            text="What would you give for it?"
            speed={75}
            onComplete={() => setShowButtons(true)}
          />
        </p>
      </div>

      {/* Buttons - stacked on mobile, corners on desktop */}
      {showButtons && (
        <>
          {/* Mobile: stacked buttons */}
          <div className="fixed bottom-[8%] left-0 right-0 mx-auto flex w-fit flex-col md:hidden">
            <button
              onClick={onComplete}
              className="cursor-pointer text-center text-[red] hover:text-[#8B0000]"
              style={{
                fontFamily: 'Pixeltimesnewroman, sans-serif',
                fontSize: '50px',
              }}
            >
              Anything
            </button>
            <button
              onClick={onComplete}
              className="cursor-pointer text-center text-[red] hover:text-[#8B0000]"
              style={{
                fontFamily: 'Pixeltimesnewroman, sans-serif',
                fontSize: '50px',
              }}
            >
              Nothing
            </button>
          </div>

          {/* Desktop: corner buttons */}
          <button
            onClick={onComplete}
            className="fixed bottom-4 left-10 hidden cursor-pointer text-center text-[red] hover:text-[#8B0000] md:block"
            style={{
              fontFamily: 'Pixeltimesnewroman, sans-serif',
              fontSize: '80px',
              width: '300px',
            }}
          >
            Anything
          </button>
          <button
            onClick={onComplete}
            className="fixed bottom-4 right-4 hidden cursor-pointer text-center text-[red] hover:text-[#8B0000] md:block"
            style={{
              fontFamily: 'Pixeltimesnewroman, sans-serif',
              fontSize: '80px',
              width: '300px',
            }}
          >
            Nothing
          </button>
        </>
      )}
    </div>
  );
}
