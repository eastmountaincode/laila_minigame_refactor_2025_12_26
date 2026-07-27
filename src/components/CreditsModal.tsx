"use client";

import { useCallback, useEffect, useRef, type MouseEvent } from "react";
import Image from "next/image";
import { sounds } from "@/lib/sounds";
import {
  CREDITS_BACKGROUND_IMAGE,
  LAILA_NAME_IMAGE,
  LYLIA_IMAGE,
} from "@/lib/home-assets";
const REGULAR_EXPRESSION_URL = "https://www.andrew-boylan.com/";
const LAILA_SMITH_URL = "https://linktr.ee/lailasmith_";
const LYLIA_LI_URL = "https://lyliali.substack.com/";
const LISTEN_HERE_URL =
  "https://symphony.to/lailasmith-1/something-dreadful-is-going-to-happen";
const PROJECT_TITLE = "Something Dreadful Is Going to Happen";

type CreditLine =
  | { label: string; href: string; prefix?: string }
  | {
      prefix: string;
      label: string;
      href: string;
      imageSrc: string;
      linkLabel: string;
    }
  | { prefix: string; brand: string };

const CREDIT_SECTIONS = [
  {
    key: "project-credits",
    lines: [
      {
        prefix: "Created by",
        label: "Laila Smith",
        href: LAILA_SMITH_URL,
        imageSrc: LAILA_NAME_IMAGE,
        linkLabel: "Link Tree",
      },
      { prefix: "Web development by", brand: "Regular Expression" },
      {
        prefix: "Pinball hand animation by",
        label: "Lylia Li",
        href: LYLIA_LI_URL,
      },
    ],
  },
  {
    key: "open-source",
    title: "Open Source Software Used:",
    lines: [
      {
        label: "Windows 98 UI: azayrahmad/win98-web",
        href: "https://github.com/azayrahmad/win98-web",
      },
      {
        label: "SkiFree: cdleveille/skifreejs",
        href: "https://github.com/cdleveille/skifreejs",
      },
      {
        label: "Windows 98 CSS: jdan/98.css",
        href: "https://github.com/jdan/98.css",
      },
    ],
  },
];

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleCloseClick = useCallback(() => {
    sounds.click();
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-hidden bg-black/45 px-4 py-8"
      onClick={handleBackdropClick}
    >
      <section
        aria-labelledby="credits-title"
        aria-modal="true"
        role="dialog"
        className="relative grid w-[min(94vw,760px)] cursor-default place-items-center"
      >
        <div className="relative z-10 aspect-square w-[min(92vw,440px)]  md:-translate-x-4">
          <div
            className="absolute inset-0 bg-[#f4ed82]"
            style={{
              maskImage: `url("${CREDITS_BACKGROUND_IMAGE}")`,
              maskPosition: "center",
              maskRepeat: "no-repeat",
              maskSize: "contain",
              WebkitMaskImage: `url("${CREDITS_BACKGROUND_IMAGE}")`,
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
            }}
          />

          <Image
            src={CREDITS_BACKGROUND_IMAGE}
            alt=""
            fill
            sizes="(max-width: 768px) 92vw, 540px"
            unoptimized
            priority
            className="pointer-events-none select-none object-contain"
          />

          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close credits"
            onClick={handleCloseClick}
            className="absolute right-[20%] top-[6%] z-20 grid h-6 w-6 sm:h-8 sm:w-8 rotate-[-9.5deg] cursor-pointer place-items-center border-2 border-black bg-white/85 font-[Pixelated_MS_Sans_Serif,_Arial,_sans-serif] text-xl leading-none text-black shadow-[3px_3px_0_rgba(0,0,0,0.45)] md:right-[19%] md:top-[5%]"
          >
            x
          </button>

          <div className="absolute inset-[5%_9%_7%_8%] rotate-[-10deg] overflow-auto px-3 py-5 text-[#1f120f] sm:inset-[10%_11%_7%_10%] sm:px-4 sm:py-5 md:inset-[7%_9%_8%_8%]">
            <div className="space-y-2 md:space-y-3">
              <div className="flex flex-col items-start gap-1 pr-12">
                <Image
                  src={LYLIA_IMAGE}
                  alt=""
                  width={2888}
                  height={3800}
                  unoptimized
                  className="-mb-0 h-auto w-[42px] rotate-[-1deg] select-none md:w-[58px]"
                />
                <h3 className="max-w-[18rem] font-[Pixelated_MS_Sans_Serif,_Arial,_sans-serif] text-[16px] font-bold leading-tight md:text-[20px]">
                  {PROJECT_TITLE}
                </h3>
                <a
                  href={LISTEN_HERE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex min-h-7 items-center justify-center border-2 border-black bg-white/85 px-2 py-1 font-[Pixelated_MS_Sans_Serif,_Arial,_sans-serif] text-[11px] font-bold leading-none text-black shadow-[3px_3px_0_rgba(0,0,0,0.45)] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:text-[13px]"
                >
                  LISTEN HERE
                </a>
                <h2
                  id="credits-title"
                  className="font-[Pixeltimesnewroman,_ui-serif] text-[clamp(30px,7vw,48px)] leading-none text-[#ff002e] drop-shadow-[2px_2px_0_rgba(0,0,0,0.7)]"
                >
                  credits
                </h2>
              </div>

              <div className="space-y-3 font-[Pixelated_MS_Sans_Serif,_Arial,_sans-serif] text-[12px] leading-snug md:space-y-4 md:text-[16px]">
                {CREDIT_SECTIONS.map((section) => (
                  <div key={section.key} className="space-y-1.5">
                    {section.title ? (
                      <h3 className="text-[16px] font-bold leading-tight md:text-[20px]">
                        {section.title}
                      </h3>
                    ) : null}
                    {section.lines.map((line: CreditLine) =>
                      "imageSrc" in line ? (
                        <p key={line.href} className="max-w-[34rem]">
                          {line.prefix}{" "}
                          <Image
                            src={line.imageSrc}
                            alt={line.label}
                            width={115}
                            height={65}
                            unoptimized
                            className="ml-1 mb-1 inline-block h-auto w-[58px] align-middle md:w-[72px]"
                          />{" "}
                          <a
                            href={line.href}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 inline-flex align-middle no-underline hover:underline focus-visible:underline"
                          >
                            {line.linkLabel}
                          </a>
                        </p>
                      ) : "href" in line ? (
                        <p key={line.href} className="max-w-[34rem]">
                          {line.prefix ? `${line.prefix} ` : null}
                          <a
                            href={line.href}
                            target="_blank"
                            rel="noreferrer"
                            className={
                              line.prefix
                                ? "inline-flex align-middle no-underline hover:underline focus-visible:underline"
                                : "underline decoration-1 underline-offset-2"
                            }
                          >
                            {line.label}
                          </a>
                        </p>
                      ) : (
                        <p
                          key={`${line.prefix}-${line.brand}`}
                          className="max-w-[34rem]"
                        >
                          {line.prefix}{" "}
                          <a
                            href={REGULAR_EXPRESSION_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="font-[Pyxis,_serif] text-[1.2em] tracking-[-0.03em] no-underline [word-spacing:-0.18em] hover:underline focus-visible:underline"
                          >
                            {line.brand}
                          </a>
                        </p>
                      ),
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
