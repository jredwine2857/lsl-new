// Chapter 6 props drawn in code so they can change with the story: the big red
// LAUNCH button (in Mission Control and in close-up), and Tom Cruise's stunt
// poses (Blender renders from art/scenes/cruise.py) pinned to the scaffold bar
// or the side of the rocket.

import { EGA, ellipse, poly, rect, text } from '../engine/gfx';
import { sceneArt } from '../engine/art';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------- Tom's stunts

/** Where each pose's anchor sits in its 48x72 sprite (from cruise-stunts.json). */
const GRIP = { x: 24, y: 12 }; // between the hands on the pull-up bar
const FEET = { x: 24, y: 67 }; // feet on the ground, or the bottom of the climb poses

/** Draw a stunt pose with its anchor at (x, y). Returns false until the art loads. */
export function stunt(ctx: Ctx, name: string, x: number, y: number, flip = false): boolean {
  const img = sceneArt(name);
  if (!img) return false;
  const a = name.startsWith('cruise-pullup') ? GRIP : FEET;
  const left = Math.round(x - (flip ? img.naturalWidth - a.x : a.x));
  const top = Math.round(y - a.y);
  if (flip) {
    ctx.save();
    ctx.translate(left + img.naturalWidth, top);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  } else {
    ctx.drawImage(img, left, top);
  }
  return true;
}

/** Hands of each climbing pose, relative to its feet anchor, for the suction cups. */
export const CLIMB_HANDS: Record<string, [number, number][]> = {
  'cruise-climb-0': [[-11.5, -42.3], [16, -29.6]],
  'cruise-climb-1': [[-14.7, -37.4], [14.7, -37.4]],
  'cruise-climb-2': [[-16, -29.6], [11.5, -42.3]],
  'cruise-flail': [[-13.3, -40.2]],
};

/** A suction cup stuck to the rocket, with its handle. */
export function cup(ctx: Ctx, x: number, y: number) {
  ellipse(ctx, '#C8D0D8', x, y - 1, 3, 2);
  rect(ctx, '#58606A', x - 3, y - 1, 7, 1);
  rect(ctx, '#E8EEF4', x - 1, y - 3, 2, 1);
}

/** Pull-up pose for time t: hang, pull, chin over the bar, lower, repeat. Returns the rep count too. */
export function pullupFrame(t: number): { name: string; rep: number; top: boolean } {
  const REP = 1.4;
  const rep = Math.floor(t / REP);
  const p = (t % REP) / REP;
  const f = p < 0.3 ? 0 : p < 0.42 ? 1 : p < 0.7 ? 2 : p < 0.82 ? 1 : 0;
  return { name: `cruise-pullup-${f}`, rep, top: f === 2 };
}

/**
 * Tom on the side of the rocket, on a loop: he scrambles up hand over hand,
 * a suction cup pops off, and he slides back down to where he started.
 */
export function climbFrame(t: number): { name: string; rise: number; pop: boolean } {
  const LOOP = 5;
  const u = t % LOOP;
  const STEP = 0.35;
  if (u < 2.8) {
    const n = Math.floor(u / STEP);
    return { name: `cruise-climb-${[0, 1, 2, 1][n % 4]}`, rise: n * 2 + Math.min(2, ((u % STEP) / STEP) * 4), pop: false };
  }
  if (u < 3.4) return { name: 'cruise-flail', rise: 16, pop: true };
  return { name: 'cruise-climb-1', rise: 16 * (1 - (u - 3.4) / 1.6), pop: false };
}

// ---------------------------------------------------------------- launch button

export interface ButtonState {
  /** All three go conditions met: the ARMED lamp blinks and the button glows. */
  armed: boolean;
  /** 0 is the safety cover shut, 1 is flipped all the way open. */
  cover: number;
  /** 0 is up, 1 is pushed all the way in. */
  press: number;
}

/**
 * The launch pedestal: a steel stand with a hazard-striped top plate, a big
 * domed red button under a flip-up clear cover, SAFE/ARMED lamps, a key
 * switch and a LAUNCH plate. (cx, top) is the top centre; s scales it up for
 * close-ups.
 */
export function launchButton(ctx: Ctx, cx: number, top: number, s: number, st: ButtonState, t: number) {
  ctx.save();
  ctx.translate(cx, top);
  ctx.scale(s, s);
  const blink = Math.floor(t * 3) % 2 === 0;
  // the pedestal body, lit from the upper left
  rect(ctx, '#20242C', -11, 10, 22, 18);
  rect(ctx, '#3A404C', -11, 10, 3, 18);
  rect(ctx, '#14161C', 9, 10, 2, 18);
  rect(ctx, '#4A505C', -12, 27, 24, 2);
  for (const bx of [-9, 8]) for (const by of [12, 25]) rect(ctx, '#7A808C', bx, by, 1, 1);
  // SAFE / ARMED lamps and the key switch
  rect(ctx, '#0A0C10', -8, 13, 16, 5);
  ellipse(ctx, st.armed ? '#103010' : '#40FF60', -5, 15.5, 1.5, 1.5);
  ellipse(ctx, st.armed && blink ? '#FF3020' : '#401010', 5, 15.5, 1.5, 1.5);
  ellipse(ctx, '#B8BCC4', 0, 15.5, 1.5, 1.5);
  rect(ctx, st.armed ? '#E8C040' : '#6A6E78', st.armed ? -0.5 : -1.5, st.armed ? 13.5 : 15, st.armed ? 1 : 3, st.armed ? 3 : 1);
  if (s >= 3) {
    text(ctx, 'SAFE', -5, 19.2, '#A0A8B4', 1.6, 'center');
    text(ctx, 'ARMED', 5, 19.2, '#A0A8B4', 1.6, 'center');
  }
  // the LAUNCH plate
  rect(ctx, '#B01818', -7, 21, 14, 4);
  rect(ctx, '#E84040', -7, 21, 14, 1);
  text(ctx, 'LAUNCH', 0, 22, EGA.white, s >= 3 ? 2.6 : 3, 'center');
  // the sloped top plate with a hazard-stripe border
  poly(ctx, '#E8C020', [[-13, 10], [13, 10], [11, 0], [-11, 0]]);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-13, 10); ctx.lineTo(13, 10); ctx.lineTo(11, 0); ctx.lineTo(-11, 0);
  ctx.clip();
  ctx.fillStyle = '#141414';
  for (let x = -20; x < 20; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 10); ctx.lineTo(x + 2, 10); ctx.lineTo(x + 5, 0); ctx.lineTo(x + 3, 0);
    ctx.fill();
  }
  ctx.restore();
  poly(ctx, '#2A2E36', [[-10, 8.5], [10, 8.5], [8.8, 1.5], [-8.8, 1.5]]);
  rect(ctx, '#4A505C', -8.8, 1.5, 17.6, 0.6);
  // the button: a red dome on a black collar; it sinks when pressed
  const sink = st.press * 1.4;
  ellipse(ctx, '#0A0A0A', 0, 5.6, 6, 2.8);
  ellipse(ctx, '#701010', 0, 5.2 + sink * 0.4, 5.2, 2.4);
  ellipse(ctx, '#D01818', 0, 4.4 + sink, 5, 2.2);
  ellipse(ctx, '#F04040', -1, 3.8 + sink, 3, 1.1);
  rect(ctx, '#FFFFFF', -3, 3.3 + sink, 1.2, 0.6);
  if (st.armed || st.press > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = st.press > 0.5 ? 0.8 : 0.25 + 0.2 * Math.sin(t * 6);
    const glow = ctx.createRadialGradient(0, 4.4, 0.5, 0, 4.4, 9);
    glow.addColorStop(0, 'rgba(255,60,40,1)');
    glow.addColorStop(1, 'rgba(255,60,40,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-10, -5, 20, 20);
    ctx.restore();
  }
  // the clear safety cover, hinged along the back edge: it swings up and over
  const c = Math.min(1, Math.max(0, st.cover));
  const lift = Math.cos(c * Math.PI * 0.85); // 1 lying shut, below 0 flipped past upright
  const h = 6.4 * lift;
  ctx.save();
  ctx.globalAlpha = 0.55;
  poly(ctx, '#A8E0FF', [[-6.8, 1.8], [6.8, 1.8], [6.8, 1.8 + h], [-6.8, 1.8 + h]]);
  ctx.globalAlpha = 0.9;
  rect(ctx, '#E8F8FF', -6.8, 1.8 + h - 0.3, 13.6, 0.6);
  rect(ctx, '#E8F8FF', -5, 1.8 + h * 0.3, 0.6, Math.max(0.6, Math.abs(h) * 0.4));
  ctx.restore();
  // the hinge, and a hand-written label on the cover while it's shut
  rect(ctx, '#8A9098', -7, 1.2, 14, 0.9);
  if (c < 0.2 && s >= 3) text(ctx, 'LARRY: ONLY WHEN I SAY', 0, 7.2, '#202020', 1.1, 'center');
  ctx.restore();
}
