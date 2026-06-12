"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Keep dev-mode plumbing available in code, but do not enable the runtime toggle.
const ENABLE_DEV_MODE = false;

const DevModeContext = createContext(false);

export function useDevMode() {
  return useContext(DevModeContext);
}

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    if (!ENABLE_DEV_MODE) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "b" || e.key === "B") {
        setDevMode((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync with body class
  useEffect(() => {
    if (devMode) {
      document.body.classList.add("dev-mode");
    } else {
      document.body.classList.remove("dev-mode");
    }
  }, [devMode]);

  return (
    <DevModeContext.Provider value={devMode}>
      {children}
    </DevModeContext.Provider>
  );
}
