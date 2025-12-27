import Link from "next/link";

// Present video size (in pixels)
const VIDEO_SIZE_MOBILE = 380;
const VIDEO_SIZE_DESKTOP = 750;

export default function PresentPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      {/* Video - centered and constrained size */}
      <div className="fixed inset-0 z-0 flex items-center justify-center">
        <video
          className="present-video object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/webflow/videos/present-moshed-compressedx2-poster-00001.jpg"
          aria-hidden="true"
        >
          <source src="/assets/webflow/videos/present-moshed-compressedx2-transcode.webm" type="video/webm" />
          <source src="/assets/webflow/videos/present-moshed-compressedx2-transcode.mp4" type="video/mp4" />
        </video>
        <style>{`
          .present-video {
            width: ${VIDEO_SIZE_MOBILE}px;
            height: ${VIDEO_SIZE_MOBILE}px;
          }
          @media (min-width: 768px) {
            .present-video {
              width: ${VIDEO_SIZE_DESKTOP}px;
              height: ${VIDEO_SIZE_DESKTOP}px;
            }
          }
        `}</style>
      </div>

      {/* Clickable Overlay - entire page is a link */}
      <Link
        href="/denial/are-you-sure"
        className="fixed inset-0 z-10 flex cursor-pointer items-center justify-center"
        aria-label="Open - continue to next page"
      >
        {/* "OPEN ME" Text - Desktop: right side, Mobile: center-bottom with up arrow */}
        {/* Desktop version */}
        <div className="absolute left-[78%] top-1/2 hidden -translate-x-1/2 -translate-y-1/2 font-[Pixeltimesnewroman,_sans-serif] text-[60px] text-white md:block">
          &lt;------ OPEN ME !!!!!!
        </div>
        {/* Mobile version */}
        <div className="absolute left-1/2 top-[70%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center font-[Pixeltimesnewroman,_sans-serif] text-[32px] text-white md:hidden">
          <span>OPEN ME !!!!!!</span>
          <span className="mt-2">&#8593;&#8593;&#8593;&#8593;&#8593;&#8593;</span>
        </div>
      </Link>
    </main>
  );
}
