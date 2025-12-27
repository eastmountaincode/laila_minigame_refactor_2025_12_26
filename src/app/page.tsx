import { BackgroundVideo } from "@/components/BackgroundVideo";
import { ChoiceTile } from "@/components/ChoiceTile";
import Image from "next/image";

export default function Home({
  searchParams,
}: {
  searchParams?: { debug?: string };
}) {
  const debug = searchParams?.debug === "1";

  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      <BackgroundVideo
        className="z-0"
        posterSrc="/assets/webflow/videos/Swirl-Option-3-video-840p-2-poster-00001.jpg"
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
          {/* Top-left: Denial */}
          <div className="pointer-events-auto flex items-start justify-start">
            <ChoiceTile href="/denial" ariaLabel="Denial" debug={debug} debugLabel="Denial" className="group">
              <Image
                src="/assets/webflow/images/denial.gif"
                alt=""
                width={259}
                height={127}
                className="group-hover:hidden"
                unoptimized
                priority
              />
              <Image
                src="/assets/webflow/images/denial-pink-2.gif"
                alt=""
                width={259}
                height={127}
                className="hidden group-hover:block"
                unoptimized
                priority
              />
            </ChoiceTile>
          </div>

          {/* Top-right: Bargaining */}
          <div className="pointer-events-auto flex items-start justify-end">
            <ChoiceTile href="/bargaining" ariaLabel="Bargaining" debug={debug} debugLabel="Bargaining" className="group">
              <Image
                src="/assets/webflow/images/bargaining.gif"
                alt=""
                width={482}
                height={144}
                className="group-hover:hidden"
                unoptimized
                priority
              />
              <Image
                src="/assets/webflow/images/bargaining-water.png"
                alt=""
                width={482}
                height={144}
                className="hidden group-hover:block"
                unoptimized
                priority
              />
            </ChoiceTile>
          </div>

          {/* Bottom-left: Anger */}
          <div className="pointer-events-auto flex items-end justify-start">
            <ChoiceTile href="/anger" ariaLabel="Anger" debug={debug} debugLabel="Anger" className="group">
              <Image
                src="/assets/webflow/images/anger.gif"
                alt=""
                width={256}
                height={126}
                className="group-hover:hidden"
                unoptimized
                priority
              />
              <Image
                src="/assets/webflow/images/cooltext442316558388593.gif"
                alt=""
                width={256}
                height={126}
                className="hidden group-hover:block"
                unoptimized
                priority
              />
            </ChoiceTile>
          </div>

          {/* Bottom-right: Tender */}
          <div className="pointer-events-auto flex items-end justify-end">
            <ChoiceTile href="/tender" ariaLabel="Tender" debug={debug} debugLabel="Tender" className="group">
              <Image
                src="/assets/webflow/images/tender.gif"
                alt=""
                width={282}
                height={124}
                className="group-hover:hidden"
                unoptimized
                priority
              />
              <Image
                src="/assets/webflow/images/tender-pink.gif"
                alt=""
                width={282}
                height={124}
                className="hidden group-hover:block"
                unoptimized
                priority
              />
            </ChoiceTile>
          </div>
        </div>

        {/* Mobile layout: 2x2 grid */}
        <div className="grid h-full grid-cols-2 grid-rows-2 md:hidden">
          <div className="pointer-events-auto flex items-start justify-start pt-[20vh] pl-[5vw]">
            <ChoiceTile href="/denial" ariaLabel="Denial" debug={debug} className="group">
              <img
                src="/assets/webflow/images/denial.gif"
                alt=""
                className="h-auto w-[66vw] max-w-[275px] group-hover:hidden group-[.tapped]:hidden"
              />
              <img
                src="/assets/webflow/images/denial-pink-2.gif"
                alt=""
                className="hidden h-auto w-[66vw] max-w-[275px] group-hover:block group-[.tapped]:block"
              />
            </ChoiceTile>
          </div>

          <div className="pointer-events-auto flex items-start justify-end">
            <ChoiceTile href="/bargaining" ariaLabel="Bargaining" debug={debug} className="group">
              <img
                src="/assets/webflow/images/bargaining.gif"
                alt=""
                className="h-auto w-[56vw] max-w-[300px] group-hover:hidden group-[.tapped]:hidden"
              />
              <img
                src="/assets/webflow/images/bargaining-water.png"
                alt=""
                className="hidden h-auto w-[64vw] max-w-[340px] group-hover:block group-[.tapped]:block"
              />
            </ChoiceTile>
          </div>

          <div className="pointer-events-auto flex items-end justify-start pb-[17vh] -ml-[2vw]">
            <ChoiceTile href="/anger" ariaLabel="Anger" debug={debug} className="group">
              <img
                src="/assets/webflow/images/anger.gif"
                alt=""
                className="h-auto w-[42vw] max-w-[170px] group-hover:hidden group-[.tapped]:hidden"
              />
              <img
                src="/assets/webflow/images/cooltext442316558388593.gif"
                alt=""
                className="hidden h-auto w-[42vw] max-w-[170px] group-hover:block group-[.tapped]:block"
              />
            </ChoiceTile>
          </div>

          <div className="pointer-events-auto flex items-end justify-end">
            <ChoiceTile href="/tender" ariaLabel="Tender" debug={debug} className="group">
              <img
                src="/assets/webflow/images/tender.gif"
                alt=""
                className="h-auto w-[24vw] max-w-[95px] group-hover:hidden group-[.tapped]:hidden"
              />
              <img
                src="/assets/webflow/images/tender-pink.gif"
                alt=""
                className="hidden h-auto w-[24vw] max-w-[95px] group-hover:block group-[.tapped]:block"
              />
            </ChoiceTile>
          </div>
        </div>
      </div>
    </main>
  );
}
