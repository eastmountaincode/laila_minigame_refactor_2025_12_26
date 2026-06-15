"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

const LOADER_SRC = "/assets/loaders/catscape-loader.gif";
const MAX_LOADING_MS = 15000;
const HOME_ASSETS_LOADED_KEY = "laila-home-assets-loaded";

type HomeLoadingGateProps = {
  assets: string[];
  children: ReactNode;
};

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new window.Image();
    const finish = () => resolve();
    const timeout = window.setTimeout(finish, MAX_LOADING_MS);

    image.onload = () => {
      window.clearTimeout(timeout);
      finish();
    };
    image.onerror = () => {
      window.clearTimeout(timeout);
      finish();
    };
    image.decoding = "async";
    image.src = src;
  });
}

export function HomeLoadingGate({ assets, children }: HomeLoadingGateProps) {
  const [isLoaded, setIsLoaded] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(HOME_ASSETS_LOADED_KEY) === "true";
  });
  const preloadAssets = useMemo(
    () => Array.from(new Set([LOADER_SRC, ...assets].filter(Boolean))),
    [assets],
  );

  useEffect(() => {
    let isMounted = true;

    async function preloadAssetsForPage() {
      await Promise.allSettled(preloadAssets.map(preloadImage));
      if (!isMounted) return;
      window.sessionStorage.setItem(HOME_ASSETS_LOADED_KEY, "true");
      setIsLoaded(true);
    }

    preloadAssetsForPage();

    return () => {
      isMounted = false;
    };
  }, [preloadAssets]);

  return (
    <>
      <div
        aria-hidden={!isLoaded}
        className={[
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        {children}
      </div>

      <div
        aria-busy={!isLoaded}
        aria-live="polite"
        className={[
          "fixed inset-0 z-[100] grid place-items-center bg-black text-white transition-opacity duration-300",
          isLoaded ? "pointer-events-none opacity-0" : "opacity-100",
        ].join(" ")}
      >
        <div className="flex flex-col items-center gap-3">
          <img
            src={LOADER_SRC}
            alt=""
            width={120}
            height={120}
            className="h-[120px] w-[120px]"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="font-[Pixelated_MS_Sans_Serif,_Arial,_sans-serif] text-[18px] font-bold leading-none text-white">
            loading
          </div>
        </div>
      </div>
    </>
  );
}
