"use client";

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  title?: string;
}

export function ConsentModal({
  isOpen,
  onAccept,
  title = "Do you want to contend?",
}: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-none">
      <div className="relative flex h-[120px] w-[95px] rotate-[-45deg] items-center justify-center bg-red-600 p-5 text-center transition-none animate-none">
        {/* The rotated square creates a diamond shape */}
        <p className="-translate-x-0.5 -translate-y-2 text-sm text-black">{title}</p>
        <button
          onClick={onAccept}
          className="absolute -bottom-[25px] left-1/2 flex h-[50px] w-[50px] -translate-x-1/2 rotate-45 cursor-pointer items-center justify-center rounded-full border-none bg-pink-300 text-lg text-white hover:bg-pink-400"
          aria-label="Accept"
        >
          {/* U+2764 + U+FE0E (variation selector for text presentation) */}
          &#10084;&#65038;
        </button>
      </div>
    </div>
  );
}
