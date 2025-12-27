"use client";

import { useEffect, useState } from "react";

type TypedTextProps = {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
};

export function TypedText({
  text,
  speed = 75,
  className,
  onComplete,
}: TypedTextProps) {
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    if (visibleChars >= text.length) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setVisibleChars((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [visibleChars, text.length, speed, onComplete]);

  return (
    <span className={className}>
      {text.slice(0, visibleChars)}
      {visibleChars < text.length && (
        <span className="animate-pulse">_</span>
      )}
    </span>
  );
}
