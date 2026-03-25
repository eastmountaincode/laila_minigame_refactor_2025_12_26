type BackgroundMediaProps = {
  className?: string;
} & (
  | { type: "video"; src: string }
  | { type: "image"; src: string; alt?: string }
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
      ) : (
        <img
          className="h-full w-full object-contain md:scale-125 md:-translate-y-[5%]"
          src={props.src}
          alt={props.alt ?? ""}
        />
      )}
    </div>
  );
}
