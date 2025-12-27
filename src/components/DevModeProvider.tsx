"use client";

import { useEffect } from "react";

export function DevModeProvider() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "b" || e.key === "B") {
        document.body.classList.toggle("dev-mode");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
