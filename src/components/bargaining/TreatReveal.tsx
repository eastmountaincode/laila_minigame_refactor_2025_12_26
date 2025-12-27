"use client";

type TreatRevealProps = {
  onComplete: () => void;
};

export function TreatReveal({ onComplete }: TreatRevealProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
      <button
        onClick={onComplete}
        className="cursor-pointer focus:outline-none"
        aria-label="Click the bag to continue"
      >
        <img
          src="/assets/webflow/images/brown-paper-bag.png"
          alt="A brown paper bag"
          className="max-h-[70vh] max-w-[90vw] object-contain"
        />
      </button>
      <p className="mt-6 font-[Georgia] text-2xl italic text-white/80 md:text-3xl">
        You get a treat.
      </p>
    </div>
  );
}
