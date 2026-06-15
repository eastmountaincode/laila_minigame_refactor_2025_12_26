import { BackgroundMedia } from "@/components/BackgroundMedia";
import { HomeLoadingGate } from "@/components/HomeLoadingGate";
import { HomeButtons } from "@/components/HomeButtons";
import { sanityFetch } from "@/sanity/lib/fetch";
import { HOMEPAGE_QUERY, CHOICE_BUTTONS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

const HOMEPAGE_PRELOAD_ASSETS = [
  "/images/post-it-note.png",
  "/images/laila_face_pic_hands.png",
  "/images/laila-smith-text-for-credits.png",
  "/assets/win95/info_icon.png",
  "/assets/win95/warning_icon.png",
  "/assets/win95/dialog_icon.png",
];

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
      : data?.backgroundImage
        ? urlFor(data.backgroundImage)
            .width(2200)
            .fit("max")
            .auto("format")
            .quality(82)
            .url()
        : undefined;

  const buttonData = buttons.map((button: any) => ({
    _id: button._id,
    label: button.label,
    href: button.href,
    defaultImageUrl: urlFor(button.defaultImage).url(),
    defaultImageAlt: button.defaultImage?.alt ?? "",
    hoverImageUrl: urlFor(button.hoverImage).url(),
    hoverImageAlt: button.hoverImage?.alt ?? "",
  }));
  const preloadAssets = [
    mediaType === "image" ? mediaUrl : undefined,
    ...buttonData.flatMap((button: any) => [
      button.defaultImageUrl,
      button.hoverImageUrl,
    ]),
    ...HOMEPAGE_PRELOAD_ASSETS,
  ].filter((asset): asset is string => Boolean(asset));

  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      <HomeLoadingGate assets={preloadAssets}>
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
          <HomeButtons buttons={buttonData} />
        </div>
      </HomeLoadingGate>
    </main>
  );
}
