import { BackgroundVideo } from "@/components/BackgroundVideo";
import { ChoiceTile } from "@/components/ChoiceTile";
import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/fetch";
import { HOMEPAGE_QUERY } from "@/sanity/lib/queries";
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
    desktopPosition: "pointer-events-auto flex items-start justify-start",
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
    desktopPosition: "pointer-events-auto flex items-end justify-start",
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

  // Fallback to local assets if Sanity data isn't available yet
  const heroImageUrl = data?.heroImage?.asset?.url;
  const buttons = data?.choiceButtons ?? [];

  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      <BackgroundVideo
        className="z-0"
        posterSrc={
          heroImageUrl ??
          "/assets/webflow/videos/Swirl-Option-3-video-840p-2-poster-00001.jpg"
        }
        sources={[
          {
            src: "/assets/webflow/videos/Swirl-Option-3-video-840p-2-transcode.webm",
            type: "video/webm",
          },
          {
            src: "/assets/webflow/videos/Swirl-Option-3-video-840p-2-transcode.mp4",
            type: "video/mp4",
          },
        ]}
      />

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
            const layout = BUTTON_LAYOUT[button._key];
            if (!layout) return null;
            const defaultUrl = urlFor(button.defaultImage).url();
            const hoverUrl = urlFor(button.hoverImage).url();
            return (
              <div key={button._key} className={layout.desktopPosition}>
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

        {/* Mobile layout: 2x2 grid */}
        <div className="grid h-full grid-cols-2 grid-rows-2 md:hidden">
          {buttons.map((button: any) => {
            const layout = BUTTON_LAYOUT[button._key];
            if (!layout) return null;
            const defaultUrl = urlFor(button.defaultImage).url();
            const hoverUrl = urlFor(button.hoverImage).url();
            return (
              <div key={button._key} className={layout.mobilePosition}>
                <ChoiceTile
                  href={button.href}
                  ariaLabel={button.label}
                  className="group"
                >
                  <img
                    src={defaultUrl}
                    alt={button.defaultImage?.alt ?? ""}
                    className={`${layout.mobileClass} group-hover:hidden group-[.tapped]:hidden`}
                  />
                  <img
                    src={hoverUrl}
                    alt={button.hoverImage?.alt ?? ""}
                    className={`hidden ${layout.mobileHoverClass} group-hover:block group-[.tapped]:block`}
                  />
                </ChoiceTile>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
