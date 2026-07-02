"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";

const LOADER_SRC = "/assets/loaders/catscape-loader.gif";
const MAX_LOADING_MS = 15000;
const PRELOAD_BATCH_SIZE = 8;

type HomeLoadingGateProps = {
  assets: string[];
  children: ReactNode;
};

const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);
const MEDIA_EXTENSIONS = new Set([
  ".m4a",
  ".mp3",
  ".mp4",
  ".ogg",
  ".wav",
  ".webm",
]);

function getAssetPathname(src: string) {
  try {
    return new URL(src, window.location.href).pathname.toLowerCase();
  } catch {
    return src.toLowerCase();
  }
}

function isImageAsset(src: string) {
  const pathname = getAssetPathname(src);
  return Array.from(IMAGE_EXTENSIONS).some((extension) =>
    pathname.endsWith(extension),
  );
}

function isMediaAsset(src: string) {
  const pathname = getAssetPathname(src);
  return Array.from(MEDIA_EXTENSIONS).some((extension) =>
    pathname.endsWith(extension),
  );
}

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

function preloadMediaAsset(src: string) {
  return new Promise<void>((resolve) => {
    let isDone = false;
    const media = /\.(mp4|webm)$/i.test(getAssetPathname(src))
      ? document.createElement("video")
      : document.createElement("audio");

    function finish() {
      if (isDone) return;
      isDone = true;
      window.clearTimeout(timeout);
      media.removeAttribute("src");
      media.load();
      resolve();
    }

    media.preload = "auto";
    media.muted = true;
    media.addEventListener("canplaythrough", finish, { once: true });
    media.addEventListener("loadeddata", finish, { once: true });
    media.addEventListener("error", finish, { once: true });
    const timeout = window.setTimeout(finish, MAX_LOADING_MS);
    media.src = src;
    media.load();
  });
}

async function preloadFetchableAsset(src: string) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), MAX_LOADING_MS);

  try {
    const response = await fetch(src, {
      cache: "force-cache",
      signal: controller.signal,
    });

    if (!response.ok) return;

    await response.blob();
  } catch {
    if (isMediaAsset(src)) {
      await preloadMediaAsset(src);
    }
  } finally {
    window.clearTimeout(timeout);
  }
}

function preloadAsset(src: string) {
  return isImageAsset(src) ? preloadImage(src) : preloadFetchableAsset(src);
}

async function preloadAssetsInBatches(assets: string[]) {
  for (let index = 0; index < assets.length; index += PRELOAD_BATCH_SIZE) {
    const batch = assets.slice(index, index + PRELOAD_BATCH_SIZE);
    await Promise.allSettled(batch.map(preloadAsset));
  }
}

export function HomeLoadingGate({
  assets,
  children,
}: HomeLoadingGateProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const preloadAssets = useMemo(
    () => Array.from(new Set([LOADER_SRC, ...assets].filter(Boolean))),
    [assets],
  );

  useEffect(() => {
    let isMounted = true;

    async function preloadAssetsForPage() {
      await preloadAssetsInBatches(preloadAssets);
      if (!isMounted) return;
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
          "home-viewport-layer z-[100] grid place-items-center bg-black text-white transition-opacity duration-300",
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
