type BackgroundMediaProps = {
  className?: string;
} & (
  | { type: "video"; src: string }
  | { type: "image"; src: string; alt?: string }
);

export function BackgroundMedia(props: BackgroundMediaProps) {
  return (
    <div
      className={["fixed inset-0 z-0", props.className]
        .filter(Boolean)
        .join(" ")}
    >
      {props.type === "video" ? (
        <video
          className="h-full w-full object-cover"
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
          className="h-full w-full object-cover"
          src={props.src}
          alt={props.alt ?? ""}
        />
      )}
    </div>
  );
}
