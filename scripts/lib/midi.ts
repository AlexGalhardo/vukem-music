/** Strict Standard MIDI File reader for build-time piano assets, with rational ticks. */
export interface MidiNote {
  tick: number;
  length: number;
  midi: number;
  velocity: number;
  track: number;
}
export function readMidi(bytes: Uint8Array): { division: number; notes: MidiNote[]; ticks: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let at = 0;
  const ensure = (n: number) => {
    if (n < 0 || at + n > bytes.length) throw new Error("Truncated MIDI");
  };
  const str = (n: number) => {
    ensure(n);
    const s = new TextDecoder().decode(bytes.slice(at, at + n));
    at += n;
    return s;
  };
  const u16 = () => {
    ensure(2);
    const n = view.getUint16(at);
    at += 2;
    return n;
  };
  const u32 = () => {
    ensure(4);
    const n = view.getUint32(at);
    at += 4;
    return n;
  };
  const variable = () => {
    let value = 0;
    for (let i = 0; i < 4; i++) {
      ensure(1);
      const b = bytes[at++];
      value = value * 128 + (b & 127);
      if (!(b & 128)) return value;
    }
    throw new Error("Invalid MIDI variable integer");
  };
  if (str(4) !== "MThd" || u32() !== 6) throw new Error("Invalid MIDI header");
  const format = u16();
  const count = u16();
  const division = u16();
  if (format > 1 || count < 1 || count > 64 || !division || division & 0x8000)
    throw new Error("Unsupported MIDI format");
  const notes: MidiNote[] = [];
  let ticks = 0;
  for (let track = 0; track < count; track++) {
    if (str(4) !== "MTrk") throw new Error("Missing MIDI track");
    const length = u32();
    ensure(length);
    const end = at + length;
    let tick = 0;
    let running = 0;
    const held = new Map<string, { tick: number; velocity: number }[]>();
    while (at < end) {
      tick += variable();
      ensure(1);
      let status = bytes[at++];
      if (status < 128) {
        if (!running) throw new Error("Invalid MIDI running status");
        at--;
        status = running;
      } else if (status < 0xf0) running = status;
      if (status === 0xff) {
        ensure(1);
        at++;
        const n = variable();
        ensure(n);
        at += n;
        continue;
      }
      if (status === 0xf0 || status === 0xf7) {
        const n = variable();
        ensure(n);
        at += n;
        running = 0;
        continue;
      }
      const command = status & 0xf0;
      const channel = status & 15;
      if (command < 0x80 || command > 0xe0) throw new Error("Invalid MIDI event");
      const size = command === 0xc0 || command === 0xd0 ? 1 : 2;
      ensure(size);
      const a = bytes[at++];
      const b = size === 2 ? bytes[at++] : 0;
      if (a > 127 || b > 127) throw new Error("Invalid MIDI data byte");
      const key = `${channel}:${a}`;
      if (command === 0x90 && b > 0) {
        const queue = held.get(key) ?? [];
        queue.push({ tick, velocity: b / 127 });
        held.set(key, queue);
      }
      if (command === 0x80 || (command === 0x90 && b === 0)) {
        const queue = held.get(key);
        const on = queue?.shift();
        if (!on) throw new Error("Unmatched MIDI note off");
        if (!queue?.length) held.delete(key);
        if (tick > on.tick)
          notes.push({ tick: on.tick, length: tick - on.tick, midi: a, velocity: on.velocity, track });
      }
      if (notes.length > 50000) throw new Error("MIDI note limit");
    }
    if (at !== end || held.size) throw new Error("Unclosed MIDI track or held note");
    ticks = Math.max(ticks, tick);
  }
  if (at !== bytes.length) throw new Error("Trailing MIDI bytes");
  return { division, notes: notes.sort((a, b) => a.tick - b.tick || a.midi - b.midi), ticks };
}
