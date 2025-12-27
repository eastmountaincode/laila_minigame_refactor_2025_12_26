"use client";

type TreatRevealProps = {
  onComplete: () => void;
};

export function TreatReveal({ onComplete }: TreatRevealProps) {
  return (
    <div className="fixed inset-0 flex items-center bg-black">
      <button
        onClick={onComplete}
        className="fixed top-0 right-0 cursor-pointer focus:outline-none"
        aria-label="Click the bag to continue"
      >
        <img
          src="/assets/webflow/images/brown-paper-bag.png"
          alt="A brown paper bag"
          className="max-w-[90vw]"
        />
      </button>
      <p
        className="absolute text-white"
        style={{
          fontFamily: 'Pixeltimesnewroman, sans-serif',
          fontSize: '60px',
          bottom: '306px',
          left: '12%',
        }}
      >
        You get a treat.
      </p>
    </div>
  );
}
