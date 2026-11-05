import { frequency } from "./theory";

export interface SampleRecord {
  midi: number;
  url: string;
  frequency: number;
  cents: number;
  validated: boolean;
}
export interface SampleManifest {
  version: 1;
  samples: SampleRecord[];
}
export function validSample(record: SampleRecord): boolean {
  return (
    Number.isInteger(record.midi) &&
    record.midi >= 21 &&
    record.midi <= 108 &&
    record.url === `/audio/piano/${record.midi}.wav` &&
    record.validated === true &&
    Number.isFinite(record.frequency) &&
    record.frequency > 0 &&
    Math.abs(1200 * Math.log2(record.frequency / frequency(record.midi))) <= 20 &&
    Math.abs(record.cents) <= 20
  );
}

/** Audio is created on a user gesture; all scheduling uses AudioContext seconds. */
export class PianoAudio {
  context: AudioContext | null = null;
  mode: "synth" | "samples" = "synth";
  sampleError = false;
  private buffers = new Map<number, AudioBuffer>();
  private voices = new Set<() => void>();
  private loading: Promise<void> | null = null;

  async prepare() {
    if (!this.context || this.context.state === "closed") this.context = new AudioContext();
    if (this.context.state === "suspended") await this.context.resume();
    if (!this.loading) this.loading = this.loadSamples();
    await this.loading;
  }

  private async loadSamples() {
    try {
      const response = await fetch("/audio/piano/manifest.json");
      if (!response.ok) throw new Error("Manifest unavailable");
      const manifest = (await response.json()) as SampleManifest;
      if (
        manifest.version !== 1 ||
        !Array.isArray(manifest.samples) ||
        manifest.samples.length > 88 ||
        !manifest.samples.every(validSample)
      )
        throw new Error("Invalid manifest");
      const buffers = await Promise.all(
        manifest.samples.map(async (sample) => {
          const response = await fetch(sample.url);
          if (!response.ok) throw new Error("Sample unavailable");
          const buffer = await this.context?.decodeAudioData(await response.arrayBuffer());
          if (!buffer) throw new Error("Missing audio context");
          return [sample.midi, buffer] as const;
        }),
      );
      this.buffers = new Map(buffers);
      // A complete bank is required before advertising sampled piano.
      this.mode = this.buffers.size === 88 ? "samples" : "synth";
    } catch {
      this.sampleError = true;
      this.mode = "synth";
    }
  }

  play(midi: number, when: number, duration: number): () => void {
    const context = this.context;
    if (!context || midi < 21 || midi > 108) return () => {};
    const gain = context.createGain();
    gain.connect(context.destination);
    const at = Math.max(when, context.currentTime);
    const sources: (OscillatorNode | AudioBufferSourceNode)[] = [];
    const sample = this.mode === "samples" ? this.buffers.get(midi) : undefined;
    if (sample) {
      const source = context.createBufferSource();
      source.buffer = sample;
      source.connect(gain);
      sources.push(source);
    } else {
      // A percussive additive preview, explicitly labeled as synthesized in the UI.
      for (const [harmonic, level] of [
        [1, 0.55],
        [2, 0.24],
        [3, 0.1],
        [4, 0.04],
      ]) {
        const osc = context.createOscillator();
        osc.type = "sine";
        osc.frequency.value = frequency(midi) * harmonic;
        const partial = context.createGain();
        partial.gain.value = level;
        osc.connect(partial);
        partial.connect(gain);
        sources.push(osc);
      }
    }
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.32, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.12, at + Math.max(0.03, duration * 0.8));
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration + 0.08);
    let stopped = false;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(0, context.currentTime, 0.008);
      for (const source of sources) {
        try {
          source.stop(context.currentTime + 0.04);
        } catch {}
      }
      this.voices.delete(stop);
    };
    this.voices.add(stop);
    let ended = 0;
    for (const source of sources) {
      source.onended = () => {
        source.disconnect();
        if (++ended === sources.length) {
          gain.disconnect();
          this.voices.delete(stop);
        }
      };
      source.start(at);
      source.stop(at + duration + 0.1);
    }
    return stop;
  }

  stopAll() {
    for (const stop of [...this.voices]) stop();
  }
  close() {
    this.stopAll();
    void this.context?.close();
    this.context = null;
  }
}
