// Placeholder art toolkit: the 16-color EGA palette, dithering, and tiny
// character-map sprites. Real art (pixel sprites / Blender renders) replaces
// the room draw functions later; everything else stays the same.

import type { Facing } from './types';

export const EGA = {
  black: '#000000', blue: '#0000AA', green: '#00AA00', cyan: '#00AAAA',
  red: '#AA0000', magenta: '#AA00AA', brown: '#AA5500', lgray: '#AAAAAA',
  dgray: '#555555', lblue: '#5555FF', lgreen: '#55FF55', lcyan: '#55FFFF',
  lred: '#FF5555', lmagenta: '#FF55FF', yellow: '#FFFF55', white: '#FFFFFF',
} as const;

/** Sierra's go-to "skin" was usually a peach the EGA palette didn't have. */
export const SKIN = '#FFAA77';
export const SKIN_DARK = '#AA6633';

type Ctx = CanvasRenderingContext2D;

export function rect(ctx: Ctx, c: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Checkerboard two colors, the EGA way of faking a third. */
export function dither(ctx: Ctx, a: string, b: string, x: number, y: number, w: number, h: number) {
  rect(ctx, a, x, y, w, h);
  ctx.fillStyle = b;
  for (let yy = 0; yy < h; yy++) {
    for (let xx = (yy % 2); xx < w; xx += 2) ctx.fillRect(x + xx, y + yy, 1, 1);
  }
}

/** Horizontal stripes, handy for wood paneling and blinds. */
export function stripes(ctx: Ctx, a: string, b: string, x: number, y: number, w: number, h: number, every = 4) {
  rect(ctx, a, x, y, w, h);
  for (let yy = 0; yy < h; yy += every) rect(ctx, b, x, y + yy, w, 1);
}

export function frame(ctx: Ctx, c: string, x: number, y: number, w: number, h: number) {
  rect(ctx, c, x, y, w, 1);
  rect(ctx, c, x, y + h - 1, w, 1);
  rect(ctx, c, x, y, 1, h);
  rect(ctx, c, x + w - 1, y, 1, h);
}

export function text(ctx: Ctx, s: string, x: number, y: number, c: string = EGA.white, size = 6, align: CanvasTextAlign = 'left') {
  ctx.fillStyle = c;
  ctx.font = `bold ${size}px "Courier New", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(s, x, y);
}

export function poly(ctx: Ctx, c: string, pts: [number, number][]) {
  ctx.fillStyle = c;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
}

export function ellipse(ctx: Ctx, c: string, cx: number, cy: number, rx: number, ry: number) {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Screen pixels per logical pixel; the canvas is drawn at 3x. */
export const SCALE = 3;
/** Sprite pixels are 5 screen pixels: chunky like Sierra's, but still crisp. */
export const PX = 5 / SCALE;
const snap = (v: number) => Math.round(v * SCALE) / SCALE;

/** Draw a char-map sprite. Each char maps to a color; '.' is transparent. */
export function sprite(ctx: Ctx, art: string[], colors: Record<string, string>, x: number, y: number, flip = false, px = 1) {
  const w = art[0].length;
  x = snap(x);
  y = snap(y);
  for (let r = 0; r < art.length; r++) {
    const row = art[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      const color = colors[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + (flip ? w - 1 - c : c) * px, y + r * px, px, px);
    }
  }
}

// 12x24 person, feet at the bottom row. H hair, S skin, E eyes, M mouth,
// T top, A accent (chain, tie, badge), P pants, O shoes.
const BODY = [
  '....HHHH....',
  '...HHHHHH...',
  '...HSSSSH...',
  '...SESSES...',
  '...SSSSSS...',
  '....SMMS....',
  '.....SS.....',
  '..TTTSSTTT..',
  '.TTTTASTTTT.',
  '.TTTTSATTTT.',
  '.TTTTTTTTTT.',
  '.TTTTTTTTTT.',
  '.TT.TTTT.TT.',
  '.TT.TTTT.TT.',
  '.SS.TTTT.SS.',
  '...PPPPPP...',
];
const BACK_HEAD = [
  '....HHHH....',
  '...HHHHHH...',
  '...HHHHHH...',
  '...HHHHHH...',
  '...HHHHHH...',
  '....HHHH....',
];
const SIDE_HEAD = [
  '....HHHH....',
  '...HHHHHH...',
  '...HHSSSS...',
  '...HSSSES...',
  '...HSSSSSS..',
  '....SSMS....',
];
const LEGS_STILL = [
  '...PP..PP...',
  '...PP..PP...',
  '...PP..PP...',
  '...PP..PP...',
  '...PP..PP...',
  '..OOO..OOO..',
];
const LEGS_STRIDE = [
  '...PP..PP...',
  '..PP....PP..',
  '..PP....PP..',
  '.PP......PP.',
  '.PP......PP.',
  'OOO......OOO',
];
const DRESS_LEGS = [
  '..PPPPPPPP..',
  '..PPPPPPPP..',
  '.PPPPPPPPPP.',
  '....SS.SS...',
  '....SS.SS...',
  '...OOO.OOO..',
];

export interface Look {
  hair: string;
  skin?: string;
  top: string;
  pants: string;
  shoes?: string;
  accent?: string;
  longHair?: boolean;
  dress?: boolean;
  bald?: boolean;
  glasses?: boolean;
  pin?: boolean;
}

export const PERSON_W = 12 * PX;
export const PERSON_H = 22 * PX;

/** Draw a person with feet centered at (x, y). */
export function person(ctx: Ctx, x: number, y: number, look: Look, facing: Facing = 'down', step = 0) {
  const head = facing === 'up' ? BACK_HEAD : facing === 'left' || facing === 'right' ? SIDE_HEAD : BODY.slice(0, 6);
  const legs = look.dress ? DRESS_LEGS : step % 2 ? LEGS_STRIDE : LEGS_STILL;
  const art = [...head, ...BODY.slice(6), ...legs];
  const colors: Record<string, string> = {
    H: look.bald ? (look.skin ?? SKIN) : look.hair,
    S: look.skin ?? SKIN,
    E: EGA.black,
    M: EGA.red,
    T: look.top,
    A: look.accent ?? look.top,
    P: look.pants,
    O: look.shoes ?? EGA.black,
  };
  const left = snap(x - PERSON_W / 2);
  const top = snap(y - art.length * PX);
  sprite(ctx, art, colors, left, top, facing === 'left', PX);
  // Extras are drawn in sprite pixels too.
  const dot = (c: string, col: number, row: number, w = 1, h = 1) => {
    ctx.fillStyle = c;
    ctx.fillRect(left + col * PX, top + row * PX, w * PX, h * PX);
  };
  if (look.bald) { dot(look.hair, 3, 2, 1, 2); dot(look.hair, 8, 2, 1, 2); }
  if (look.longHair && facing !== 'up') { dot(look.hair, 2, 1, 1, 8); dot(look.hair, 9, 1, 1, 8); }
  if (look.glasses && facing === 'down') {
    dot(EGA.black, 3, 3, 6, 1);
    dot(EGA.lgray, 4, 3);
    dot(EGA.lgray, 7, 3);
  }
  if (look.pin && facing !== 'up') dot(EGA.lmagenta, facing === 'left' ? 7 : 3, 8);
}

export const LARRY: Look = {
  hair: EGA.brown,
  top: EGA.white,
  pants: EGA.white,
  accent: EGA.yellow,
  shoes: EGA.black,
};
