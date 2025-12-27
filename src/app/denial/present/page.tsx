import Link from "next/link";
import { BackgroundVideo } from "@/components/BackgroundVideo";

export default function PresentPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      {/* Video Background */}
      <BackgroundVideo
        className="z-0"
        posterSrc="/assets/webflow/videos/present-moshed-compressedx2-poster-00001.jpg"
        sources={[
          {
            src: "/assets/webflow/videos/present-moshed-compressedx2-transcode.webm",
            type: "video/webm",
          },
          {
            src: "/assets/webflow/videos/present-moshed-compressedx2-transcode.mp4",
            type: "video/mp4",
          },
        ]}
      />

      {/* Clickable Overlay - entire page is a link */}
      <Link
        href="/denial/are-you-sure"
        className="fixed inset-0 z-10 flex cursor-pointer items-center justify-center"
        aria-label="Open - continue to next page"
      >
        {/* "OPEN ME" Text */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-medium text-white md:left-12 md:text-xl">
          &lt;------ OPEN ME !!!!!!
        </div>
      </Link>
    </main>
  );
}
