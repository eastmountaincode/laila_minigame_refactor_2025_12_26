"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

// How long to show hover state on mobile before navigating (in ms)
const MOBILE_HOVER_DELAY = 600;

type ChoiceTileProps = {
  href: string;
  ariaLabel: string;
  className: string;
  children?: React.ReactNode;
};

export function ChoiceTile({
  href,
  ariaLabel,
  className,
  children,
}: ChoiceTileProps) {
  const router = useRouter();
  const [tapped, setTapped] = useState(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      setTapped(true);
      setTimeout(() => {
        router.push(href);
      }, MOBILE_HOVER_DELAY);
    },
    [href, router]
  );

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      onTouchStart={handleTouchStart}
      onClick={(e) => {
        // Let touch handle it on touch devices
        if (tapped) {
          e.preventDefault();
        }
      }}
      className={[
        "relative block select-none outline-none focus-visible:ring-2 focus-visible:ring-pink-400",
        tapped ? "tapped" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </a>
  );
}
