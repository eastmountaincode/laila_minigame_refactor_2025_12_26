import { BackgroundMedia } from "@/components/BackgroundMedia";
import { ChoiceTile } from "@/components/ChoiceTile";
import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/fetch";
import { HOMEPAGE_QUERY, CHOICE_BUTTONS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

// Layout config per button — presentation concern, not CMS content
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

export default async function Home() {
  const data = await sanityFetch<any>({
    query: HOMEPAGE_QUERY,
    tags: ["homepage"],
  });
  const buttons = await sanityFetch<any>({
    query: CHOICE_BUTTONS_QUERY,
    tags: ["choiceButton"],
  });

  const mediaType = data?.backgroundMediaType ?? "video";
  const mediaUrl =
    mediaType === "video"
      ? data?.backgroundVideo?.asset?.url
      : data?.backgroundImage?.asset?.url;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      {mediaUrl && (
        <BackgroundMedia
          className="z-0"
          type={mediaType}
          src={mediaUrl}
          {...(mediaType === "image" && {
            alt: data?.backgroundImage?.alt ?? "",
          })}
        />
      )}

      <div className="pointer-events-none fixed inset-0 z-10 bg-black/15" />

      {/* "PICK ONE" centered text */}
      <div className="fixed inset-0 z-20 grid place-items-center">
        <div className="font-[Pixeltimesnewroman,_ui-sans-serif] text-center text-[clamp(36px,8vw,60px)] leading-none tracking-wide text-[#ff002e] drop-shadow-[0_3px_0_rgba(0,0,0,0.71)]">
          PICK&nbsp;ONE
        </div>
      </div>

      {/* Desktop: corners | Mobile: centered column */}
      <div className="pointer-events-none fixed inset-0 z-30 p-[clamp(12px,3vw,36px)]">
        {/* Desktop layout */}
        <div className="hidden h-full md:grid md:grid-cols-2 md:grid-rows-2">
          {buttons.map((button: any) => {
            const key = button.label?.toLowerCase();
            const layout = BUTTON_LAYOUT[key];
            if (!layout) return null;
            const defaultUrl = urlFor(button.defaultImage).url();
            const hoverUrl = urlFor(button.hoverImage).url();
            return (
              <div key={button._id} className={layout.desktopPosition}>
                <ChoiceTile
                  href={button.href}
                  ariaLabel={button.label}
                  className="group"
                >
                  <Image
                    src={defaultUrl}
                    alt={button.defaultImage?.alt ?? ""}
                    width={layout.desktopWidth}
                    height={layout.desktopHeight}
                    className="group-hover:hidden"
                    unoptimized
                    priority
                  />
                  <Image
                    src={hoverUrl}
                    alt={button.hoverImage?.alt ?? ""}
                    width={layout.desktopWidth}
                    height={layout.desktopHeight}
                    className="hidden group-hover:block"
                    unoptimized
                    priority
                  />
                </ChoiceTile>
              </div>
            );
          })}
        </div>

        {/* Mobile layout: 2x2 centered grid */}
        <div className="flex h-full flex-col items-center justify-between py-[8vh] md:hidden">
          {/* Top two */}
          <div className="flex flex-col items-center gap-12">
            {buttons.slice(0, 2).map((button: any) => {
              const key = button.label?.toLowerCase();
              if (!BUTTON_LAYOUT[key]) return null;
              const defaultUrl = urlFor(button.defaultImage).url();
              const hoverUrl = urlFor(button.hoverImage).url();
              return (
                <div key={button._id} className="pointer-events-auto">
                  <ChoiceTile href={button.href} ariaLabel={button.label} className="group">
                    <img src={defaultUrl} alt={button.defaultImage?.alt ?? ""} className="h-auto w-[50vw] max-w-[220px] group-hover:hidden group-[.tapped]:hidden" />
                    <img src={hoverUrl} alt={button.hoverImage?.alt ?? ""} className="hidden h-auto w-[50vw] max-w-[220px] group-hover:block group-[.tapped]:block" />
                  </ChoiceTile>
                </div>
              );
            })}
          </div>
          {/* Bottom two */}
          <div className="flex flex-col items-center gap-12">
            {buttons.slice(2, 4).map((button: any) => {
              const key = button.label?.toLowerCase();
              if (!BUTTON_LAYOUT[key]) return null;
              const defaultUrl = urlFor(button.defaultImage).url();
              const hoverUrl = urlFor(button.hoverImage).url();
              return (
                <div key={button._id} className="pointer-events-auto">
                  <ChoiceTile href={button.href} ariaLabel={button.label} className="group">
                    <img src={defaultUrl} alt={button.defaultImage?.alt ?? ""} className="h-auto w-[50vw] max-w-[220px] group-hover:hidden group-[.tapped]:hidden" />
                    <img src={hoverUrl} alt={button.hoverImage?.alt ?? ""} className="hidden h-auto w-[50vw] max-w-[220px] group-hover:block group-[.tapped]:block" />
                  </ChoiceTile>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
