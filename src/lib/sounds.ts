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
  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.play().catch(() => {});
}

if (typeof window !== "undefined") {
  preload("/assets/win95/click.mp3");
  preload("/assets/win95/chord.wav");
}

// Chords voiced from F minor harmony
const CHORDS = [
  [174.61, 261.63, 415.30, 523.25, 622.25, 783.99],  // Fmin9   (F3, C4, Ab4, C5, Eb5, G5)
  [138.59, 207.65, 311.13, 415.30, 523.25, 622.25],  // Dbmaj9  (Db3, Ab3, Eb4, Ab4, C5, Eb5)
  [155.56, 233.08, 311.13, 466.16, 622.25, 783.99],  // Ebmaj9  (Eb3, Bb3, Eb4, Bb4, Eb5, G5)
  [116.54, 174.61, 261.63, 415.30, 523.25, 622.25],  // Fmin7/Ab(Ab2, F3, C4, Ab4, C5, Eb5)
  [207.65, 311.13, 415.30, 523.25, 622.25, 830.61],  // Abmaj9  (Ab3, Eb4, Ab4, C5, Eb5, Ab5)
  [233.08, 349.23, 466.16, 523.25, 698.46, 932.33],  // Bbmin9  (Bb3, F4, Bb4, C5, F5, Bb5)
];

// Timed drone layers: [frequencies, delaySeconds, maxGain]
// Each note ascends: F → A → C → E → G → Bb
const DRONE_LAYERS: [number[], number, number][] = [
  [[87.31, 174.61], 8, 0.15],     // F2, F3
  [[155.56, 311.13], 25, 0.14],   // Eb3, Eb4
  [[130.81, 261.63], 30, 0.13],   // C3, C4
];

function createReverbIR(ctx: AudioContext): AudioBuffer {
  const duration = 0.8;
  const decay = 3.0;
  const rate = ctx.sampleRate;
  const length = rate * duration;
  const buffer = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
}

class DragPad {
  private ctx: AudioContext | null = null;
  private chordOscs: OscillatorNode[] = [];
  private allOscs: OscillatorNode[] = [];
  private droneOscData: { osc: OscillatorNode; baseFreq: number; beatRate: number }[] = [];
  private masterGain: GainNode | null = null;
  private droneGains: GainNode[] = [];
  private active = false;
  private currentChord = -1;
  private startTime = 0;

  start() {
    if (this.active) return;
    this.ctx = this.ctx || new AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;

    // Reverb
    const reverb = this.ctx.createConvolver();
    reverb.buffer = createReverbIR(this.ctx);
    const wetGain = this.ctx.createGain();
    wetGain.gain.value = 0.25;
    this.masterGain.connect(reverb);
    reverb.connect(wetGain);
    wetGain.connect(this.ctx.destination);
    this.masterGain.connect(this.ctx.destination);

    // 6 chord voices, each with 2 detuned oscillators
    for (let v = 0; v < 6; v++) {
      for (const detune of [-9, 9]) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = CHORDS[0][v];
        osc.detune.value = detune;
        gain.gain.value = v < 2 ? 0.10 : v < 4 ? 0.07 : 0.04;
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        this.chordOscs.push(osc);
        this.allOscs.push(osc);
      }
    }

    // Timed drone layers — each gets a peaking EQ to carve its own space
    for (let droneIdx = 0; droneIdx < DRONE_LAYERS.length; droneIdx++) {
      const [freqs,,] = DRONE_LAYERS[droneIdx];
      const dg = this.ctx.createGain();
      dg.gain.value = 0;

      // Peaking filter centered on the fundamental — boosts clarity, reduces mud
      const eq = this.ctx.createBiquadFilter();
      eq.type = "peaking";
      eq.frequency.value = freqs[0] * 2; // center on the octave above fundamental
      eq.Q.value = 1.5;
      eq.gain.value = 3; // gentle boost at its own frequency

      // Gentle high-shelf cut so drones don't get harsh as they stack
      const hiShelf = this.ctx.createBiquadFilter();
      hiShelf.type = "highshelf";
      hiShelf.frequency.value = 1500;
      hiShelf.gain.value = -3;

      dg.connect(eq);
      eq.connect(hiShelf);
      hiShelf.connect(this.masterGain!);
      this.droneGains.push(dg);

      const beatRate = 0;

      for (let fi = 0; fi < freqs.length; fi++) {
        const freq = freqs[fi];
        const osc1 = this.ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.value = freq;
        osc1.connect(dg);
        osc1.start();
        this.allOscs.push(osc1);
        this.droneOscData.push({ osc: osc1, baseFreq: freq, beatRate: 0 });

        const osc2 = this.ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.value = freq + beatRate;
        osc2.connect(dg);
        osc2.start();
        this.allOscs.push(osc2);
        this.droneOscData.push({ osc: osc2, baseFreq: freq, beatRate });
      }
    }

    this.active = true;
    this.currentChord = 0;
    this.startTime = performance.now();
  }

  update(speed: number) {
    if (!this.active || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const clamped = Math.min(speed, 900);
    const idx = Math.min(
      Math.floor((clamped / 900) * CHORDS.length),
      CHORDS.length - 1
    );

    // Update chord when speed changes — shift everything together
    if (idx !== this.currentChord) {
      const prevIdx = this.currentChord;
      this.currentChord = idx;
      const chord = CHORDS[idx];
      for (let v = 0; v < 6; v++) {
        const freq = chord[v];
        this.chordOscs[v * 2].frequency.setTargetAtTime(freq, t, 0.4);
        this.chordOscs[v * 2 + 1].frequency.setTargetAtTime(freq, t, 0.4);
      }

      // Shift drones by the same ratio as the chord root moved
      if (prevIdx >= 0) {
        const ratio = CHORDS[idx][0] / CHORDS[prevIdx][0];
        for (const d of this.droneOscData) {
          d.baseFreq *= ratio;
          d.osc.frequency.setTargetAtTime(d.baseFreq + d.beatRate, t, 0.4);
        }
      }
    }

    // Volume
    const vol = Math.min(clamped / 400, 0.18);
    this.masterGain.gain.setTargetAtTime(vol, t, 0.15);

    // Timed drone layers — volume responds to speed just like the chords
    const elapsed = (performance.now() - this.startTime) / 1000;
    const speedNorm = clamped / 900; // 0–1
    for (let i = 0; i < DRONE_LAYERS.length; i++) {
      const [, delay, maxGain] = DRONE_LAYERS[i];
      const dg = this.droneGains[i];
      if (!dg) continue;
      if (elapsed < delay) {
        dg.gain.setTargetAtTime(0, t, 0.05);
      } else {
        // Drone volume tracks speed — quiet when slow, full when fast
        const droneVol = speedNorm * maxGain;
        dg.gain.setTargetAtTime(droneVol, t, 0.15);
      }
    }
  }

  stop() {
    if (!this.active || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0, t, 0.15);
    }
    for (const dg of this.droneGains) {
      dg.gain.setTargetAtTime(0, t, 0.2);
    }
    const oscs = [...this.allOscs];
    setTimeout(() => { for (const o of oscs) try { o.stop(); } catch {} }, 800);
    this.chordOscs = [];
    this.allOscs = [];
    this.droneOscData = [];
    this.droneGains = [];
    this.masterGain = null;
    this.active = false;
    this.currentChord = -1;
  }
}

export const dragPad = new DragPad();

export const sounds = {
  click: () => play("/assets/win95/click.mp3"),
  chord: () => play("/assets/win95/chord.wav"),
};
