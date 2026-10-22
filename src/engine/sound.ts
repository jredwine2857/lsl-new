// Music and sound effects, synthesized live with Web Audio so there are no
// audio files to load. The instruments aim for a 1991 Sierra sound card
// (AdLib / Sound Blaster FM) playing 1977 disco: wah bass, Rhodes, string
// pads, brass stabs, a four-on-the-floor drum machine.
//
// Songs are written as text, one string per instrument, in steps of a
// sixteenth note: "C3:2" is C3 for two sixteenths, "C4+E4+G4:16" is a whole
// chord, "r:4" is a quarter rest and "|" is just a bar line for reading.

type Inst = 'bass' | 'ep' | 'strings' | 'brass' | 'lead' | 'kick' | 'snare' | 'clap' | 'hat' | 'ohat' | 'bell';

export interface Song {
  bpm: number;
  swing?: number; // 0..0.5: delays every other sixteenth, for the lounge songs
  tracks: Partial<Record<Inst, string>>;
}

interface Note { at: number; len: number; freqs: number[] }

const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function freq(name: string): number {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!m) throw new Error(`Bad note ${name}`);
  const semis = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) + 1) * 12;
  return 440 * 2 ** ((semis - 69) / 12);
}

/** Parse a track string into notes (times in sixteenths) and its total length. */
export function parseTrack(src: string): { notes: Note[]; steps: number } {
  const notes: Note[] = [];
  let at = 0;
  for (const tok of src.split(/\s+/)) {
    if (!tok || tok === '|') continue;
    const [pitch, n] = tok.split(':');
    const len = Number(n ?? 1);
    if (!Number.isFinite(len) || len <= 0) throw new Error(`Bad length in ${tok}`);
    if (pitch !== 'r') notes.push({ at, len, freqs: pitch === 'x' ? [0] : pitch.split('+').map(freq) });
    at += len;
  }
  return { notes, steps: at };
}

const STORE = 'lsl-woke-up-broke:sound';

export class Sound {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private noise!: AudioBuffer;
  private out!: AudioNode;
  private song: Song | null = null;
  private parsed: { inst: Inst; notes: Note[]; steps: number }[] = [];
  private loopSteps = 0;
  private startAt = 0;
  private scheduledTo = 0; // in sixteenths since startAt
  private timer: ReturnType<typeof setInterval> | null = null;
  private ducked = false;
  musicOn = true;
  sfxOn = true;

  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? '{}');
      if (saved.music === false) this.musicOn = false;
      if (saved.sfx === false) this.sfxOn = false;
    } catch { /* storage blocked */ }
  }

  private persist() {
    try { localStorage.setItem(STORE, JSON.stringify({ music: this.musicOn, sfx: this.sfxOn })); } catch { /* storage blocked */ }
  }

  /** Browsers only allow audio after a click or key press; call this from one. */
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') void this.ctx.resume(); return; }
    if (typeof AudioContext === 'undefined') return;
    try {
      this.ctx = new AudioContext();
    } catch { return; }
    const c = this.ctx;
    this.master = c.createGain();
    this.master.gain.value = 0.8;
    const comp = c.createDynamicsCompressor();
    this.master.connect(comp).connect(c.destination);
    this.out = comp;
    this.musicBus = c.createGain();
    this.musicBus.gain.value = this.musicOn ? 0.32 : 0;
    this.musicBus.connect(this.master);
    this.sfxBus = c.createGain();
    this.sfxBus.gain.value = this.sfxOn ? 0.6 : 0;
    this.sfxBus.connect(this.master);
    this.noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (this.song) this.restart();
  }

  toggleMusic() {
    this.musicOn = !this.musicOn;
    this.persist();
    this.applyMusicLevel();
    return this.musicOn;
  }

  toggleSfx() {
    this.sfxOn = !this.sfxOn;
    this.persist();
    if (this.ctx) this.sfxBus.gain.setTargetAtTime(this.sfxOn ? 0.6 : 0, this.ctx.currentTime, 0.02);
    return this.sfxOn;
  }

  /** Quiet the music under a death or victory jingle. */
  duck(on: boolean) {
    if (this.ducked === on) return;
    this.ducked = on;
    this.applyMusicLevel();
  }

  private applyMusicLevel() {
    if (!this.ctx) return;
    const v = this.musicOn ? (this.ducked ? 0.05 : 0.32) : 0;
    this.musicBus.gain.setTargetAtTime(v, this.ctx.currentTime, 0.15);
  }

  /** A copy of everything the game plays, for recording (debug only). */
  tap(): MediaStream | null {
    if (!this.ctx) return null;
    const d = this.ctx.createMediaStreamDestination();
    this.out.connect(d);
    return d.stream;
  }

  // ---- music ----

  play(song: Song | null) {
    if (song === this.song) return;
    this.song = song;
    this.parsed = song
      ? Object.entries(song.tracks).map(([inst, src]) => ({ inst: inst as Inst, ...parseTrack(src!) }))
      : [];
    this.loopSteps = Math.max(0, ...this.parsed.map((t) => t.steps));
    this.restart();
  }

  private restart() {
    if (!this.ctx) return;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (!this.song || !this.loopSteps) return;
    this.startAt = this.ctx.currentTime + 0.1;
    this.scheduledTo = 0;
    this.timer = setInterval(() => this.schedule(), 100);
    this.schedule();
  }

  private stepTime(step: number) {
    const song = this.song!;
    const sixteenth = 60 / song.bpm / 4;
    const swing = step % 2 === 1 ? (song.swing ?? 0) * sixteenth : 0;
    return this.startAt + step * sixteenth + swing;
  }

  private schedule() {
    const c = this.ctx;
    if (!c || !this.song) return;
    const sixteenth = 60 / this.song.bpm / 4;
    const until = (c.currentTime + 0.4 - this.startAt) / sixteenth;
    while (this.scheduledTo < until) {
      const from = this.scheduledTo;
      const to = from + 1;
      for (const t of this.parsed) {
        const loopAt = Math.floor(from / this.loopSteps) * this.loopSteps;
        for (const n of t.notes) {
          // tracks shorter than the song repeat inside it
          for (let rep = loopAt; rep < loopAt + this.loopSteps; rep += t.steps) {
            const s = rep + n.at;
            if (s >= from && s < to) this.voice(t.inst, n.freqs, this.stepTime(s), n.len * sixteenth, this.musicBus);
          }
        }
      }
      this.scheduledTo = to;
    }
  }

  // ---- instruments ----

  private env(g: GainNode, t: number, peak: number, attack: number, decay: number, sustain: number, end: number, release = 0.08) {
    const p = g.gain;
    p.setValueAtTime(0.0001, t);
    p.linearRampToValueAtTime(peak, t + attack);
    p.setTargetAtTime(peak * sustain, t + attack, decay);
    p.setTargetAtTime(0.0001, end, release);
  }

  private osc(type: OscillatorType, f: number, t: number, end: number, out: AudioNode, detune = 0) {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    o.connect(out);
    o.start(t);
    o.stop(end + 0.6);
    return o;
  }

  private noiseSrc(t: number, dur: number, out: AudioNode) {
    const s = this.ctx!.createBufferSource();
    s.buffer = this.noise;
    s.connect(out);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur);
    return s;
  }

  private voice(inst: Inst, freqs: number[], t: number, dur: number, bus: AudioNode) {
    const c = this.ctx!;
    const end = t + dur * 0.92;
    const g = c.createGain();
    g.connect(bus);
    switch (inst) {
      case 'bass': {
        // Disco wah: a sawtooth through a resonant filter that snaps open.
        const f = c.createBiquadFilter();
        f.type = 'lowpass';
        f.Q.value = 9;
        f.frequency.setValueAtTime(260, t);
        f.frequency.linearRampToValueAtTime(1500, t + 0.03);
        f.frequency.setTargetAtTime(320, t + 0.03, 0.08);
        f.connect(g);
        for (const fr of freqs) this.osc('sawtooth', fr, t, end, f);
        this.env(g, t, 0.5, 0.005, 0.15, 0.6, end, 0.03);
        break;
      }
      case 'ep': {
        // Rhodes-ish: sine body plus a quickly fading bell partial.
        for (const fr of freqs) {
          this.osc('sine', fr, t, end, g);
          const bell = c.createGain();
          bell.connect(g);
          this.osc('sine', fr * 4, t, end, bell);
          bell.gain.setValueAtTime(0.25, t);
          bell.gain.setTargetAtTime(0.0001, t, 0.06);
        }
        this.env(g, t, 0.16, 0.005, 0.5, 0.35, end, 0.2);
        break;
      }
      case 'strings': {
        const f = c.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 2400;
        f.connect(g);
        for (const fr of freqs) {
          this.osc('sawtooth', fr, t, end, f, -9);
          this.osc('sawtooth', fr, t, end, f, 9);
        }
        this.env(g, t, 0.05, 0.25, 0.5, 0.9, end, 0.35);
        break;
      }
      case 'brass': {
        const f = c.createBiquadFilter();
        f.type = 'lowpass';
        f.Q.value = 2;
        f.frequency.setValueAtTime(600, t);
        f.frequency.linearRampToValueAtTime(3200, t + 0.05);
        f.frequency.setTargetAtTime(1400, t + 0.05, 0.1);
        f.connect(g);
        for (const fr of freqs) this.osc('sawtooth', fr, t, end, f);
        this.env(g, t, 0.12, 0.02, 0.1, 0.6, end, 0.06);
        break;
      }
      case 'lead': {
        // A square lead with late vibrato, like an FM card trying its best.
        for (const fr of freqs) {
          const o = this.osc('square', fr, t, end, g);
          const lfo = c.createOscillator();
          const depth = c.createGain();
          lfo.frequency.value = 5.5;
          depth.gain.setValueAtTime(0, t);
          depth.gain.linearRampToValueAtTime(fr * 0.012, t + Math.min(0.4, dur));
          lfo.connect(depth).connect(o.frequency);
          lfo.start(t);
          lfo.stop(end + 0.3);
        }
        this.env(g, t, 0.07, 0.01, 0.2, 0.75, end, 0.06);
        break;
      }
      case 'bell': {
        for (const fr of freqs) {
          this.osc('sine', fr, t, end, g);
          this.osc('sine', fr * 2.76, t, end, g);
        }
        this.env(g, t, 0.12, 0.002, 0.3, 0.0, end, 0.4);
        break;
      }
      case 'kick': {
        const o = this.osc('sine', 120, t, t + 0.3, g);
        o.frequency.setValueAtTime(140, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
        this.env(g, t, 0.9, 0.002, 0.12, 0, t + 0.25, 0.05);
        break;
      }
      case 'snare':
      case 'clap': {
        const f = c.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = inst === 'clap' ? 1400 : 2200;
        f.Q.value = inst === 'clap' ? 1.5 : 0.7;
        f.connect(g);
        this.noiseSrc(t, 0.25, f);
        if (inst === 'snare') this.osc('triangle', 190, t, t + 0.08, g);
        this.env(g, t, inst === 'clap' ? 0.4 : 0.32, 0.002, 0.05, 0, t + 0.15, 0.04);
        break;
      }
      case 'hat':
      case 'ohat': {
        const f = c.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 7000;
        f.connect(g);
        const len = inst === 'ohat' ? 0.22 : 0.05;
        this.noiseSrc(t, len + 0.1, f);
        this.env(g, t, 0.14, 0.001, len / 2, 0, t + len, 0.03);
        break;
      }
    }
  }

  // ---- sound effects ----

  /** Play a named sound effect now. Unknown names are ignored. */
  sfx(name: string) {
    const c = this.ctx;
    if (!c || !this.sfxOn) return;
    const t = c.currentTime + 0.01;
    const bus = this.sfxBus;
    const seq = (inst: Inst, notes: [string | number, number][], start = t, gap = 0) => {
      let at = start;
      for (const [n, d] of notes) {
        this.voice(inst, [typeof n === 'number' ? n : freq(n)], at, d, bus);
        at += d + gap;
      }
    };
    const slide = (type: OscillatorType, from: number, to: number, dur: number, vol: number, at = t) => {
      const g = c.createGain();
      g.connect(bus);
      const o = this.osc(type, from, at, at + dur, g);
      o.frequency.setValueAtTime(from, at);
      o.frequency.exponentialRampToValueAtTime(to, at + dur);
      this.env(g, at, vol, 0.01, dur, 0.8, at + dur, 0.05);
    };
    const hiss = (dur: number, f0: number, f1: number, vol: number, at = t) => {
      const g = c.createGain();
      g.connect(bus);
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 1.2;
      f.frequency.setValueAtTime(f0, at);
      f.frequency.exponentialRampToValueAtTime(f1, at + dur);
      f.connect(g);
      this.noiseSrc(at, dur + 0.1, f);
      this.env(g, at, vol, dur * 0.3, dur * 0.4, 0.5, at + dur, 0.08);
    };
    switch (name) {
      case 'score': seq('bell', [['E6', 0.07], ['A6', 0.18]]); break;
      case 'pickup': seq('bell', [['C6', 0.05], ['E6', 0.05], ['G6', 0.05], ['C7', 0.2]]); break;
      case 'give': seq('bell', [['G6', 0.06], ['E6', 0.06], ['C6', 0.16]]); break;
      case 'door': hiss(0.35, 400, 1800, 0.25); seq('kick', [[0, 0.1]]); break;
      case 'step': {
        const g = c.createGain();
        g.connect(bus);
        const f = c.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 900;
        f.connect(g);
        this.noiseSrc(t, 0.05, f);
        this.env(g, t, 0.08, 0.001, 0.02, 0, t + 0.03, 0.01);
        break;
      }
      case 'blip': seq('ep', [['A5', 0.05]]); break;
      case 'death': {
        // The sad trombone: wah, wah, wah, waaaaah.
        const notes: [number, number][] = [[311, 0.32], [294, 0.32], [277, 0.32], [262, 1.1]];
        let at = t;
        for (const [f, d] of notes) {
          const g = c.createGain();
          g.connect(bus);
          const lp = c.createBiquadFilter();
          lp.type = 'lowpass';
          lp.Q.value = 6;
          lp.frequency.setValueAtTime(300, at);
          lp.frequency.linearRampToValueAtTime(1600, at + 0.1);
          lp.frequency.linearRampToValueAtTime(400, at + d);
          lp.connect(g);
          const o = this.osc('sawtooth', f, at, at + d, lp);
          if (d > 1) {
            const lfo = c.createOscillator();
            const depth = c.createGain();
            lfo.frequency.value = 6;
            depth.gain.value = 6;
            lfo.connect(depth).connect(o.frequency);
            lfo.start(at + 0.2);
            lfo.stop(at + d);
          }
          this.env(g, at, 0.3, 0.03, 0.2, 0.8, at + d - 0.05, 0.08);
          at += d;
        }
        break;
      }
      case 'win':
        seq('brass', [['C5', 0.12], ['E5', 0.12], ['G5', 0.12], ['C6', 0.5]]);
        seq('brass', [['E4', 0.12], ['G4', 0.12], ['C5', 0.12], ['E5', 0.5]]);
        seq('kick', [[0, 0.12], [0, 0.12], [0, 0.12], [0, 0.5]]);
        break;
      case 'phone':
        for (let i = 0; i < 2; i++) {
          for (let k = 0; k < 8; k++) seq('bell', [[k % 2 ? 'E6' : 'G6', 0.04]], t + i * 0.6 + k * 0.045);
        }
        break;
      case 'cash': seq('bell', [['B6', 0.06], ['E7', 0.3]]); hiss(0.15, 3000, 6000, 0.15); break;
      case 'whoosh': hiss(0.4, 300, 3000, 0.35); break;
      case 'splash': hiss(0.6, 2500, 400, 0.5); hiss(0.4, 800, 300, 0.3, t + 0.15); break;
      case 'smooch': slide('sine', 500, 1400, 0.12, 0.25); hiss(0.08, 2000, 4000, 0.2, t + 0.1); break;
      case 'boing': slide('triangle', 180, 700, 0.25, 0.3); break;
      case 'crash':
        hiss(0.9, 5000, 300, 0.6);
        for (let k = 0; k < 6; k++) seq('bell', [[1800 + Math.random() * 2200, 0.08]], t + 0.05 + k * 0.07);
        break;
      case 'thud': seq('kick', [[0, 0.2]]); hiss(0.2, 300, 120, 0.4); break;
      case 'rocket': hiss(4, 200, 1200, 0.6); slide('sawtooth', 50, 30, 4, 0.2); break;
      case 'applause':
        for (let k = 0; k < 40; k++) {
          const at = t + Math.random() * 2.2;
          const g = c.createGain();
          g.connect(bus);
          const f = c.createBiquadFilter();
          f.type = 'bandpass';
          f.frequency.value = 1000 + Math.random() * 1500;
          f.connect(g);
          this.noiseSrc(at, 0.04, f);
          this.env(g, at, 0.12, 0.001, 0.015, 0, at + 0.03, 0.01);
        }
        break;
      case 'scratch': slide('sawtooth', 900, 200, 0.18, 0.2); slide('sawtooth', 300, 1100, 0.15, 0.2, t + 0.2); break;
      case 'type': seq('hat', [[0, 0.03]]); break;
      case 'tuned': seq('bell', [['A5', 0.9]]); seq('ep', [['A4', 0.9]]); break;
    }
  }
}

export const sound = new Sound();
