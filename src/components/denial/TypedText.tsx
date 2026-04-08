"use client";

import { useEffect, useState } from "react";

interface TypedTextProps {
  strings: string[];
  typeSpeed?: number;
  backSpeed?: number;
  backDelay?: number;
  startDelay?: number;
  loop?: boolean;
  className?: string;
  cursorClassName?: string;
  showCursor?: boolean;
}

export function TypedText({
  strings,
  typeSpeed = 75,
  backSpeed = 50,
  backDelay = 100,
  startDelay = 500,
  loop = false,
  className = "",
  cursorClassName = "",
  showCursor = true,
}: TypedTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [stringIndex, setStringIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);

  useEffect(() => {
    if (strings.length === 0) return;

    const currentString = strings[stringIndex];

    // Initial delay
    if (isWaiting) {
      const timer = setTimeout(() => {
        setIsWaiting(false);
      }, startDelay);
      return () => clearTimeout(timer);
    }

    // Typing
    if (!isDeleting && charIndex < currentString.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentString.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, typeSpeed);
      return () => clearTimeout(timer);
    }

    // Finished typing current string
    if (!isDeleting && charIndex === currentString.length) {
      // If this is the last string and we're not looping, stop
      if (stringIndex === strings.length - 1 && !loop) {
        return;
      }

      // Wait before deleting
      const timer = setTimeout(() => {
        setIsDeleting(true);
      }, backDelay);
      return () => clearTimeout(timer);
    }

    // Deleting
    if (isDeleting && charIndex > 0) {
      const timer = setTimeout(() => {
        setDisplayedText(currentString.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, backSpeed);
      return () => clearTimeout(timer);
    }

    // Finished deleting, move to next string
    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      const nextIndex = (stringIndex + 1) % strings.length;
      setStringIndex(nextIndex);
    }
  }, [
    strings,
    stringIndex,
    charIndex,
    isDeleting,
    isWaiting,
    typeSpeed,
    backSpeed,
    backDelay,
    startDelay,
    loop,
  ]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <span
          className={`inline-block animate-blink ${cursorClassName}`}
          aria-hidden="true"
        >
          _
        </span>
      )}
    </span>
  );
}
