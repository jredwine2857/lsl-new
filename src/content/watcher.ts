// The man in the red cap. Once per city, a big man in a trench coat, a red cap
// and sunglasses pops out from behind something, watches Larry through
// binoculars, and ducks away again. At the wedding he turns out to be Donald
// Trump, who has been keeping Larry safe all game (src/content/wedding.ts).

import { charSprite } from '../engine/art';
import { rect } from '../engine/gfx';
import type { Facing, Hotspot } from '../engine/types';

type Ctx = CanvasRenderingContext2D;

export interface WatchSpot {
  /** Feet when fully peeking out. */
  x: number;
  y: number;
  facing: Facing;
  /** Only this part of the screen shows him: the gap beside or above whatever he hides behind. */
  clip: { x: number; y: number; w: number; h: number };
  /** How far he slides to get out of sight. */
  hide: { x: number; y: number };
  /** Offsets the peek cycle so he isn't in step with anything else. */
  phase?: number;
}

const CYCLE = 9;

/** How far out he is at time t: 0 hidden, 1 peeking. In for a few seconds of every nine. */
export function peek(t: number, phase = 0): number {
  const u = (t + phase) % CYCLE;
  if (u < 0.6) return u / 0.6;
  if (u < 4) return 1;
  if (u < 4.6) return 1 - (u - 4) / 0.6;
  return 0;
}

export function drawWatcher(ctx: Ctx, s: WatchSpot, t: number) {
  const p = peek(t, s.phase);
  if (p <= 0) return;
  const x = Math.round(s.x + s.hide.x * (1 - p));
  const y = Math.round(s.y + s.hide.y * (1 - p));
  ctx.save();
  ctx.beginPath();
  ctx.rect(s.clip.x, s.clip.y, s.clip.w, s.clip.h);
  ctx.clip();
  charSprite(ctx, 'watcher', x, y, s.facing);
  // the binoculars, held up to the sunglasses
  const by = y - 38;
  if (s.facing === 'down') {
    rect(ctx, '#101014', x - 4, by, 3, 3);
    rect(ctx, '#101014', x + 1, by, 3, 3);
    rect(ctx, '#5A8AC0', x - 3, by + 1, 1, 1);
    rect(ctx, '#5A8AC0', x + 2, by + 1, 1, 1);
  } else {
    const dir = s.facing === 'left' ? -1 : 1;
    rect(ctx, '#101014', dir < 0 ? x - 8 : x + 3, by, 5, 3);
    rect(ctx, '#5A8AC0', dir < 0 ? x - 8 : x + 7, by + 1, 1, 1);
  }
  ctx.restore();
}

/** Where he peeks out, one room per city. */
export const WATCH_SPOTS: Record<string, WatchSpot> = {
  // over the potted palm at the Cincinnati mall
  'ch1-mall': { x: 299, y: 146, facing: 'left', clip: { x: 276, y: 70, w: 44, h: 56 }, hide: { x: 0, y: 30 } },
  // over the seats at Gate 42
  'ch2-gate': { x: 196, y: 140, facing: 'down', clip: { x: 178, y: 80, w: 36, h: 33 }, hide: { x: 0, y: 28 }, phase: 3 },
  // in the side door at Skyline Chili
  'ch3-skyline': { x: 306, y: 118, facing: 'left', clip: { x: 297, y: 60, w: 18, h: 58 }, hide: { x: 14, y: 0 }, phase: 5 },
  // behind the Winnebago outside Snoop's
  'ch4-street': { x: 164, y: 150, facing: 'left', clip: { x: 120, y: 90, w: 48, h: 62 }, hide: { x: 14, y: 0 }, phase: 2 },
  // at the edge of Art Basel
  'ch5-basel': { x: 312, y: 150, facing: 'left', clip: { x: 296, y: 90, w: 24, h: 62 }, hide: { x: 16, y: 0 }, phase: 6 },
};

/** Look at him and he's a "bird-watcher". */
export function watcherHotspot(s: WatchSpot, look: string): Hotspot {
  return {
    id: 'watcher',
    names: ['red cap', 'cap', 'binoculars', 'watcher', 'stranger', 'trench coat', 'big man', 'man in red cap', 'bird-watcher'],
    rect: s.clip,
    look,
  };
}

/** The same man, everywhere Larry goes. */
export const WATCH_LOOK = 'A big man in a trench coat, a red cap and sunglasses, watching you through binoculars. The second you look, he ducks out of sight. Probably a bird-watcher. A very large, very tan bird-watcher.';
