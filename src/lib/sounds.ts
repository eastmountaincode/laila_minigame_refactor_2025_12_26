const cache = new Map<string, HTMLAudioElement>();

function preload(src: string): HTMLAudioElement {
  let audio = cache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = "auto";
    cache.set(src, audio);
  }
  return audio;
}

function play(src: string) {
  const audio = preload(src);
  // Clone for overlapping plays, but the preloaded version warms the browser cache
  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.play().catch(() => {});
}

// Preload common sounds on first import
if (typeof window !== "undefined") {
  preload("/assets/win95/click.mp3");
  preload("/assets/win95/chord.wav");
}

export const sounds = {
  click: () => play("/assets/win95/click.mp3"),
  chord: () => play("/assets/win95/chord.wav"),
};
