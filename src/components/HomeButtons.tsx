"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChoiceTile } from "@/components/ChoiceTile";
import { CreditsModal } from "@/components/CreditsModal";
import { TenderOSModal } from "@/components/TenderOSModal";
import { sounds } from "@/lib/sounds";

const BUTTON_LAYOUT: Record<
  string,
  {
    desktopPosition: string;
    desktopWidth: number;
    desktopHeight: number;
    mobilePosition: string;
    mobileClass: string;
    mobileHoverClass: string;
    desktopHoverImageClass?: string;
  }
> = {
  denial: {
    desktopPosition: "pointer-events-auto flex items-end justify-start",
    desktopWidth: 259,
    desktopHeight: 127,
    mobilePosition:
      "pointer-events-auto flex items-start justify-start pt-[20vh] pl-[5vw]",
    mobileClass: "h-auto w-[48vw] max-w-[200px]",
    mobileHoverClass: "h-auto w-[48vw] max-w-[200px]",
  },
  bargaining: {
    desktopPosition: "pointer-events-auto flex items-start justify-start",
    desktopWidth: 482,
    desktopHeight: 144,
    mobilePosition: "pointer-events-auto flex items-start justify-end",
    mobileClass: "h-auto w-[56vw] max-w-[300px]",
    mobileHoverClass: "h-auto w-[64vw] max-w-[340px]",
    desktopHoverImageClass: "-translate-y-12",
  },
  anger: {
    desktopPosition: "pointer-events-auto flex items-start justify-end",
    desktopWidth: 256,
    desktopHeight: 126,
    mobilePosition:
      "pointer-events-auto flex items-end justify-start pb-[17vh] -ml-[2vw]",
    mobileClass: "h-auto w-[42vw] max-w-[170px]",
    mobileHoverClass: "h-auto w-[42vw] max-w-[170px]",
  },
  tender: {
    desktopPosition: "pointer-events-auto flex items-end justify-end",
    desktopWidth: 282,
    desktopHeight: 124,
    mobilePosition: "pointer-events-auto flex items-end justify-end",
    mobileClass: "h-auto w-[48vw] max-w-[190px]",
    mobileHoverClass: "h-auto w-[48vw] max-w-[190px]",
  },
};

interface ButtonData {
  _id: string;
  label: string;
  href: string;
  defaultImageUrl: string;
  defaultImageAlt: string;
  hoverImageUrl: string;
  hoverImageAlt: string;
}

interface HomeButtonsProps {
  buttons: ButtonData[];
}

const BUTTON_ORDER = ["bargaining", "anger", "denial", "tender"];
const LOCKED_CHOICES = new Set(["anger"]);
const LOCKED_EFFECT = "glimmer";

export function HomeButtons({ buttons }: HomeButtonsProps) {
  const [tenderOpen, setTenderOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [lockedPreviewKey, setLockedPreviewKey] = useState<string | null>(null);

  const handleTenderClose = useCallback(() => setTenderOpen(false), []);
  const handleCreditsClose = useCallback(() => setCreditsOpen(false), []);
  const handleCreditsOpen = useCallback(() => {
    sounds.click();
    setCreditsOpen(true);
  }, []);

  const orderedButtons = [...buttons].sort((a, b) => {
    const aIndex = BUTTON_ORDER.indexOf(a.label?.toLowerCase());
    const bIndex = BUTTON_ORDER.indexOf(b.label?.toLowerCase());

    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const renderButton = (button: ButtonData, isMobile: boolean) => {
    const key = button.label?.toLowerCase();
    const layout = BUTTON_LAYOUT[key];
    if (!layout) return null;

    const mobileTileStyle = {
      aspectRatio: `${layout.desktopWidth} / ${layout.desktopHeight}`,
    };

    if (LOCKED_CHOICES.has(key)) {
      const isTapped = lockedPreviewKey === key;
      const lockedClassName = [
        "group locked-choice",
        `locked-choice--${LOCKED_EFFECT}`,
        "relative block select-none outline-none focus-visible:ring-2 focus-visible:ring-pink-400",
        isMobile ? layout.mobileHoverClass : null,
        isTapped ? "tapped" : null,
      ]
        .filter(Boolean)
        .join(" ");

      const handleLockedTouchStart = (event: React.TouchEvent) => {
        event.preventDefault();
        setLockedPreviewKey(key);
        window.setTimeout(() => {
          setLockedPreviewKey((currentKey) =>
            currentKey === key ? null : currentKey
          );
        }, 700);
      };

      return (
        <div
          key={button._id}
          className={isMobile ? "pointer-events-auto" : layout.desktopPosition}
        >
          <button
            type="button"
            aria-label={`${button.label} coming soon`}
            aria-disabled="true"
            className={lockedClassName}
            onClick={(event) => event.preventDefault()}
            onTouchStart={handleLockedTouchStart}
            style={isMobile ? mobileTileStyle : undefined}
          >
            {isMobile ? (
              <>
                <img
                  src={button.defaultImageUrl}
                  alt={button.defaultImageAlt}
                  className={[
                    "absolute left-1/2 top-1/2 h-auto -translate-x-1/2 -translate-y-1/2 group-hover:hidden group-[.tapped]:hidden",
                    layout.mobileClass,
                  ].join(" ")}
                />
                <img
                  src={button.hoverImageUrl}
                  alt={button.hoverImageAlt}
                  className={[
                    "absolute left-1/2 top-1/2 hidden h-auto -translate-x-1/2 -translate-y-1/2 group-hover:block group-[.tapped]:block",
                    layout.mobileHoverClass,
                  ].join(" ")}
                />
              </>
            ) : (
              <>
                <Image
                  src={button.defaultImageUrl}
                  alt={button.defaultImageAlt}
                  width={layout.desktopWidth}
                  height={layout.desktopHeight}
                  className="group-hover:hidden"
                  unoptimized
                  priority
                />
                <Image
                  src={button.hoverImageUrl}
                  alt={button.hoverImageAlt}
                  width={layout.desktopWidth}
                  height={layout.desktopHeight}
                  className="hidden group-hover:block"
                  unoptimized
                  priority
                />
              </>
            )}
          </button>
        </div>
      );
    }

    // Tender opens the modal instead of navigating
    if (key === "tender") {
      return (
        <div
          key={button._id}
          className={isMobile ? "pointer-events-auto" : layout.desktopPosition}
        >
          <button
            type="button"
            aria-label={button.label}
            onClick={() => setTenderOpen(true)}
            className={[
              "group relative block cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-pink-400",
              isMobile ? layout.mobileHoverClass : null,
            ]
              .filter(Boolean)
              .join(" ")}
            style={isMobile ? mobileTileStyle : undefined}
          >
            {isMobile ? (
              <>
                <img
                  src={button.defaultImageUrl}
                  alt={button.defaultImageAlt}
                  className={[
                    "absolute left-1/2 top-1/2 h-auto -translate-x-1/2 -translate-y-1/2 group-hover:hidden",
                    layout.mobileClass,
                  ].join(" ")}
                />
                <img
                  src={button.hoverImageUrl}
                  alt={button.hoverImageAlt}
                  className={[
                    "absolute left-1/2 top-1/2 hidden h-auto -translate-x-1/2 -translate-y-1/2 group-hover:block",
                    layout.mobileHoverClass,
                  ].join(" ")}
                />
              </>
            ) : (
              <>
                <Image
                  src={button.defaultImageUrl}
                  alt={button.defaultImageAlt}
                  width={layout.desktopWidth}
                  height={layout.desktopHeight}
                  className="group-hover:hidden"
                  unoptimized
                  priority
                />
                <Image
                  src={button.hoverImageUrl}
                  alt={button.hoverImageAlt}
                  width={layout.desktopWidth}
                  height={layout.desktopHeight}
                  className="hidden group-hover:block"
                  unoptimized
                  priority
                />
              </>
            )}
          </button>
        </div>
      );
    }

    // All other buttons navigate normally
    if (isMobile) {
      return (
        <div key={button._id} className="pointer-events-auto">
          <ChoiceTile
            href={button.href}
            ariaLabel={button.label}
            className={["group", layout.mobileHoverClass].join(" ")}
            style={mobileTileStyle}
          >
            <img
              src={button.defaultImageUrl}
              alt={button.defaultImageAlt}
              className={[
                "absolute left-1/2 top-1/2 h-auto -translate-x-1/2 -translate-y-1/2 group-hover:hidden group-[.tapped]:hidden",
                layout.mobileClass,
              ].join(" ")}
            />
            <img
              src={button.hoverImageUrl}
              alt={button.hoverImageAlt}
              className={[
                "absolute left-1/2 top-1/2 hidden h-auto -translate-x-1/2 -translate-y-1/2 group-hover:block group-[.tapped]:block",
                layout.mobileHoverClass,
              ].join(" ")}
            />
          </ChoiceTile>
        </div>
      );
    }

    return (
      <div key={button._id} className={layout.desktopPosition}>
        <ChoiceTile
          href={button.href}
          ariaLabel={button.label}
          className="group"
        >
          <Image
            src={button.defaultImageUrl}
            alt={button.defaultImageAlt}
            width={layout.desktopWidth}
            height={layout.desktopHeight}
            className="group-hover:hidden"
            unoptimized
            priority
          />
          <Image
            src={button.hoverImageUrl}
            alt={button.hoverImageAlt}
            width={layout.desktopWidth}
            height={layout.desktopHeight}
            className={[
              "hidden group-hover:block",
              layout.desktopHoverImageClass,
            ]
              .filter(Boolean)
              .join(" ")}
            unoptimized
            priority
          />
        </ChoiceTile>
      </div>
    );
  };

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden h-full md:grid md:grid-cols-2 md:grid-rows-2">
        {orderedButtons.map((button) => renderButton(button, false))}
      </div>

      {/* Mobile layout: 2x2 centered grid */}
      <div className="flex h-full flex-col items-center justify-between py-[8vh] md:hidden">
        <div className="flex flex-col items-center gap-12">
          {orderedButtons
            .slice(0, 2)
            .map((button) => renderButton(button, true))}
        </div>
        <div className="flex flex-col items-center gap-12">
          {orderedButtons
            .slice(2, 4)
            .map((button) => renderButton(button, true))}
        </div>
      </div>

      {/* Info icon — hidden when modal is open */}
      {!tenderOpen && !creditsOpen && (
        <div className="fixed z-40 bottom-[clamp(12px,3vw,36px)] right-[clamp(12px,3vw,36px)] md:bottom-auto md:top-1/2 md:-translate-y-1/2">
          <button
            type="button"
            aria-label="Info"
            onClick={handleCreditsOpen}
            className="pointer-events-auto cursor-pointer"
          >
            <Image
              src="/assets/win95/info_icon.png"
              alt="Info"
              width={32}
              height={32}
              unoptimized
            />
          </button>
        </div>
      )}

      <CreditsModal isOpen={creditsOpen} onClose={handleCreditsClose} />

      {/* Tender OS Modal */}
      <TenderOSModal isOpen={tenderOpen} onClose={handleTenderClose} />
    </>
  );
}
