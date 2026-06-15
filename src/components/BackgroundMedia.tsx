/* eslint-disable @next/next/no-img-element */

type BackgroundMediaProps = {
  className?: string;
} & (
  | { type: "video"; src: string }
  | {
      type: "image";
      src: string;
      alt?: string;
      sources?: {
        mobile?: string;
        square?: string;
        desktop?: string;
      };
    }
);

export function BackgroundMedia(props: BackgroundMediaProps) {
  return (
    <div
      data-bg-media
      className={["fixed inset-0 z-0", props.className]
        .filter(Boolean)
        .join(" ")}
    >
      {props.type === "video" ? (
        <video
          className="h-full w-full object-contain md:scale-125 translate-y-[0%] md:-translate-y-[3%]"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          src={props.src}
        />
      ) : props.sources?.mobile ||
        props.sources?.square ||
        props.sources?.desktop ? (
        <picture className="block h-full w-full">
          {props.sources.mobile ? (
            <source
              media="(max-width: 699px), (max-aspect-ratio: 3/4)"
              srcSet={props.sources.mobile}
            />
          ) : null}
          {props.sources.desktop ? (
            <source
              media="(min-width: 1100px) and (min-aspect-ratio: 4/3)"
              srcSet={props.sources.desktop}
            />
          ) : null}
          <img
            className="h-full w-full object-cover"
            src={props.sources.square ?? props.src}
            alt={props.alt ?? ""}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      ) : (
        <img
          className="h-full w-full object-cover"
          src={props.src}
          alt={props.alt ?? ""}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      )}
    </div>
  );
}
