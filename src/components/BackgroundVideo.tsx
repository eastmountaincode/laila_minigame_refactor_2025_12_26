type BackgroundVideoProps = {
  className?: string;
  posterSrc?: string;
  sources: Array<{ src: string; type: string }>;
};

export function BackgroundVideo({
  className,
  posterSrc,
  sources,
}: BackgroundVideoProps) {
  return (
    <div className={["fixed inset-0 z-0", className].filter(Boolean).join(" ")}>
      <video
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={posterSrc}
        aria-hidden="true"
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>
    </div>
  );
}


