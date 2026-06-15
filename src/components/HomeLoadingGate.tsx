"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  HOME_ASSETS_LOADED_COOKIE,
  HOME_ASSETS_LOADED_STORAGE_KEY,
  HOME_ASSETS_LOADED_VALUE,
} from "@/lib/home-assets";

const LOADER_SRC = "/assets/loaders/catscape-loader.gif";
const MAX_LOADING_MS = 15000;

type HomeLoadingGateProps = {
  assets: string[];
  initiallyLoaded?: boolean;
  children: ReactNode;
};

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    let isDone = false;
    const image = new window.Image();

    function finish() {
      if (isDone) return;
      isDone = true;
      window.clearTimeout(timeout);
      resolve();
    }

    image.onload = () => {
      const decode = image.decode
        ? image.decode().catch(() => undefined)
        : Promise.resolve();
      decode.finally(finish);
    };
    image.onerror = finish;
    image.decoding = "async";
    const timeout = window.setTimeout(finish, MAX_LOADING_MS);
    image.src = src;
  });
}

function rememberHomeAssetsLoaded() {
  window.sessionStorage.setItem(
    HOME_ASSETS_LOADED_STORAGE_KEY,
    HOME_ASSETS_LOADED_VALUE,
  );
  document.cookie = `${HOME_ASSETS_LOADED_COOKIE}=${HOME_ASSETS_LOADED_VALUE}; path=/; max-age=2592000; SameSite=Lax`;
}

export function HomeLoadingGate({
  assets,
  initiallyLoaded = false,
  children,
}: HomeLoadingGateProps) {
  const [isLoaded, setIsLoaded] = useState(initiallyLoaded);
  const preloadAssets = useMemo(
    () => Array.from(new Set([LOADER_SRC, ...assets].filter(Boolean))),
    [assets],
  );

  useEffect(() => {
    let isMounted = true;
    const wasAlreadyLoaded =
      initiallyLoaded ||
      window.sessionStorage.getItem(HOME_ASSETS_LOADED_STORAGE_KEY) ===
        HOME_ASSETS_LOADED_VALUE;

    if (wasAlreadyLoaded) {
      queueMicrotask(() => {
        if (isMounted) {
          setIsLoaded(true);
        }
      });
    }

    async function preloadAssetsForPage() {
      await Promise.allSettled(preloadAssets.map(preloadImage));
      if (!isMounted) return;
      rememberHomeAssetsLoaded();
      setIsLoaded(true);
    }

    preloadAssetsForPage();

    return () => {
      isMounted = false;
    };
  }, [initiallyLoaded, preloadAssets]);

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
          <Image
            src={LOADER_SRC}
            alt=""
            width={120}
            height={120}
            priority
            unoptimized
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
