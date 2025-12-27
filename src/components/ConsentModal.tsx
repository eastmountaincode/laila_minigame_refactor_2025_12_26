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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative flex h-[120px] w-[100px] rotate-[-45deg] items-center justify-center bg-red-600 text-center">
        {/* The rotated square creates a diamond shape */}
        <p className="rotate-45 text-sm font-medium text-white">{title}</p>
        <button
          onClick={onAccept}
          className="absolute -bottom-6 left-1/2 flex h-12 w-12 -translate-x-1/2 rotate-45 cursor-pointer items-center justify-center rounded-full bg-pink-400 text-2xl text-white transition-colors hover:bg-pink-500"
          aria-label="Accept"
        >
          ❤
        </button>
      </div>
    </div>
  );
}
