import { BackgroundMedia } from "@/components/BackgroundMedia";
import { HomeLoadingGate } from "@/components/HomeLoadingGate";
import { HomeButtons } from "@/components/HomeButtons";
import { cookies } from "next/headers";
import { sanityFetch } from "@/sanity/lib/fetch";
import { HOMEPAGE_QUERY, CHOICE_BUTTONS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import {
  HOME_ASSETS_LOADED_COOKIE,
  HOME_ASSETS_LOADED_VALUE,
  HOME_STATIC_PRELOAD_ASSETS,
} from "@/lib/home-assets";

type SanityImage = {
  alt?: string;
} & Record<string, unknown>;

type HomepageData = {
  backgroundMediaType?: "image" | "video";
  backgroundVideo?: {
    asset?: {
      url?: string;
    };
  };
  backgroundImage?: SanityImage;
};

type ChoiceButton = {
  _id: string;
  label: string;
  href: string;
  defaultImage?: SanityImage;
  hoverImage?: SanityImage;
};

export default async function Home() {
  const cookieStore = await cookies();
  const initiallyLoaded =
    cookieStore.get(HOME_ASSETS_LOADED_COOKIE)?.value ===
    HOME_ASSETS_LOADED_VALUE;
  const data = await sanityFetch<HomepageData | null>({
    query: HOMEPAGE_QUERY,
    tags: ["homepage"],
  });
  const buttons = await sanityFetch<ChoiceButton[]>({
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

  const buttonData = buttons.map((button) => ({
    _id: button._id,
    label: button.label,
    href: button.href,
    defaultImageUrl: button.defaultImage ? urlFor(button.defaultImage).url() : "",
    defaultImageAlt: button.defaultImage?.alt ?? "",
    hoverImageUrl: button.hoverImage ? urlFor(button.hoverImage).url() : "",
    hoverImageAlt: button.hoverImage?.alt ?? "",
  }));
  const preloadAssets = [
    mediaType === "image" ? mediaUrl : undefined,
    ...buttonData.flatMap((button) => [
      button.defaultImageUrl,
      button.hoverImageUrl,
    ]),
    ...HOME_STATIC_PRELOAD_ASSETS,
  ].filter((asset): asset is string => Boolean(asset));

  return (
    <main className="relative min-h-dvh overflow-hidden bg-black text-white">
      <HomeLoadingGate
        assets={preloadAssets}
        initiallyLoaded={initiallyLoaded}
      >
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
