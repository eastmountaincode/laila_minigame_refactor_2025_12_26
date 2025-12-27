"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

// How long to show hover state on mobile before navigating (in ms)
const MOBILE_HOVER_DELAY = 600;

type ChoiceTileProps = {
  href: string;
  ariaLabel: string;
  className: string;
  debug?: boolean;
  debugLabel?: string;
  children?: React.ReactNode;
};

export function ChoiceTile({
  href,
  ariaLabel,
  className,
  debug,
  debugLabel,
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
        debug ? "ring-2 ring-lime-400/90 bg-lime-400/10" : null,
        tapped ? "tapped" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {debug ? (
        <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-semibold tracking-wide text-lime-300">
          {debugLabel ?? ariaLabel}
        </span>
      ) : null}
      {children}
    </a>
  );
}
