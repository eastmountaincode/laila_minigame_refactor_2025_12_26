"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChoiceTile } from "@/components/ChoiceTile";
import { TenderOSModal } from "@/components/TenderOSModal";

const BUTTON_LAYOUT: Record<
  string,
  {
    desktopPosition: string;
    desktopWidth: number;
    desktopHeight: number;
    mobilePosition: string;
    mobileClass: string;
    mobileHoverClass: string;
  }
> = {
  denial: {
    desktopPosition: "pointer-events-auto flex items-end justify-start",
    desktopWidth: 259,
    desktopHeight: 127,
    mobilePosition:
      "pointer-events-auto flex items-start justify-start pt-[20vh] pl-[5vw]",
    mobileClass: "h-auto w-[66vw] max-w-[275px]",
    mobileHoverClass: "h-auto w-[66vw] max-w-[275px]",
  },
  bargaining: {
    desktopPosition: "pointer-events-auto flex items-start justify-end",
    desktopWidth: 482,
    desktopHeight: 144,
    mobilePosition: "pointer-events-auto flex items-start justify-end",
    mobileClass: "h-auto w-[56vw] max-w-[300px]",
    mobileHoverClass: "h-auto w-[64vw] max-w-[340px]",
  },
  anger: {
    desktopPosition: "pointer-events-auto flex items-start justify-start",
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
    mobileClass: "h-auto w-[24vw] max-w-[95px]",
    mobileHoverClass: "h-auto w-[24vw] max-w-[95px]",
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

export function HomeButtons({ buttons }: HomeButtonsProps) {
  const [tenderOpen, setTenderOpen] = useState(false);

  const handleTenderClose = useCallback(() => setTenderOpen(false), []);

  const renderButton = (button: ButtonData, isMobile: boolean) => {
    const key = button.label?.toLowerCase();
    const layout = BUTTON_LAYOUT[key];
    if (!layout) return null;

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
            className="group relative block cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          >
            {isMobile ? (
              <>
                <img
                  src={button.defaultImageUrl}
                  alt={button.defaultImageAlt}
                  className="h-auto w-[50vw] max-w-[220px] group-hover:hidden"
                />
                <img
                  src={button.hoverImageUrl}
                  alt={button.hoverImageAlt}
                  className="hidden h-auto w-[50vw] max-w-[220px] group-hover:block"
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
            className="group"
          >
            <img
              src={button.defaultImageUrl}
              alt={button.defaultImageAlt}
              className="h-auto w-[50vw] max-w-[220px] group-hover:hidden group-[.tapped]:hidden"
            />
            <img
              src={button.hoverImageUrl}
              alt={button.hoverImageAlt}
              className="hidden h-auto w-[50vw] max-w-[220px] group-hover:block group-[.tapped]:block"
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
            className="hidden group-hover:block"
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
        {buttons.map((button) => renderButton(button, false))}
      </div>

      {/* Mobile layout: 2x2 centered grid */}
      <div className="flex h-full flex-col items-center justify-between py-[8vh] md:hidden">
        <div className="flex flex-col items-center gap-12">
          {buttons.slice(0, 2).map((button) => renderButton(button, true))}
        </div>
        <div className="flex flex-col items-center gap-12">
          {buttons.slice(2, 4).map((button) => renderButton(button, true))}
        </div>
      </div>

      {/* Info icon — hidden when modal is open */}
      {!tenderOpen && (
        <div className="fixed z-40 bottom-[clamp(12px,3vw,36px)] right-[clamp(12px,3vw,36px)] md:bottom-auto md:top-1/2 md:-translate-y-1/2">
          <button
            type="button"
            aria-label="Info"
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

      {/* Tender OS Modal */}
      <TenderOSModal isOpen={tenderOpen} onClose={handleTenderClose} />
    </>
  );
}
