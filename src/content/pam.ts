// Pamela Anderson pops up out of nowhere, once per chapter, to save Larry
// from his first brush with death. Larry is smitten every time. Each save
// opens with a Baywatch-style slow-motion beach run (art/scenes/pam.py), even
// though there is never a beach anywhere near Larry.

import { sceneArt } from '../engine/art';
import type { Game } from '../engine/game';
import { EGA, ellipse, rect, text } from '../engine/gfx';
import type { Cutscene } from '../engine/types';

/** Saves Larry the first time per chapter. Returns false once she's used up. */
export function pamSave(g: Game, text: string, back: { x: number; y: number }): boolean {
  if (g.flag('pamSaved')) return false;
  g.set('pamSaved');
  g.stop();
  g.s.x = back.x;
  g.s.y = back.y;
  g.sfx('whoosh');
  g.cutscene('pam');
  g.say(text, 'PAM TO THE RESCUE');
  return true;
}

// ---------------------------------------------------------------- the rescue

type Ctx = CanvasRenderingContext2D;

const GROUND = 184; // where feet meet the sand
const FEET = 107; // the feet row in Pam's and Larry's 80x112 poses
const FLAT = 57; // the sand row in larry-flat

function pic(ctx: Ctx, name: string, x: number, y: number, flip = false) {
  const img = sceneArt(name);
  if (!img) return;
  if (flip) {
    ctx.save();
    ctx.translate(Math.round(x) + img.naturalWidth, Math.round(y));
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  } else {
    ctx.drawImage(img, Math.round(x), Math.round(y));
  }
}

/** A pose with its feet centred at (x, GROUND). */
function stand(ctx: Ctx, name: string, x: number, flip = false) {
  pic(ctx, name, x - 40, GROUND - FEET, flip);
}

function shout(ctx: Ctx, s: string, x: number, y: number, c: string, size: number) {
  text(ctx, s, x + 1, y + 1, EGA.black, size, 'center');
  text(ctx, s, x, y, c, size, 'center');
}

function fade(ctx: Ctx, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, a);
  rect(ctx, '#000000', -10, -10, 340, 220);
  ctx.restore();
}

function heart(ctx: Ctx, x: number, y: number, s: number, c: string) {
  ellipse(ctx, c, x - s / 2, y, s / 2 + 0.5, s / 2 + 0.5);
  ellipse(ctx, c, x + s / 2, y, s / 2 + 0.5, s / 2 + 0.5);
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x - s - 0.5, y + 0.5);
  ctx.lineTo(x + s + 0.5, y + 0.5);
  ctx.lineTo(x, y + s * 1.5);
  ctx.fill();
}

const lastT = { t: -1 };
function cues(t: number, g: Game, list: [number, string][]) {
  const prev = t < lastT.t ? -1 : lastT.t;
  for (const [at, sfx] of list) if (prev < at && at <= t) g.sfx(sfx);
  lastT.t = t;
}

const TITLE = 1.8;
const RUN = 5.8; // reaches him
const UP = 7; // pulls him up
const END = 10.5;
const LARRY_X = 104;

/** Pam's slow-motion beach run to the rescue, Baywatch style. */
export const pamRescue: Cutscene = {
  duration: END,
  draw(ctx, t, g) {
    cues(t, g, [[0.1, 'whoosh'], [TITLE, 'splash'], [UP, 'boing'], [UP + 0.6, 'smooch']]);
    // a slow push in, the way these shows always did it
    const z = 1 + t * 0.008;
    ctx.translate(160, 120);
    ctx.scale(z, z);
    ctx.translate(-160, -120);
    pic(ctx, 'pam-beach', 0, 0);
    // sun glints dancing on the water
    for (let i = 0; i < 12; i++) {
      if (Math.sin(t * 3 + i * 1.7) > 0.6) rect(ctx, '#FFFFFF', (i * 29 + 7) % 320, 96 + ((i * 7) % 18), 2, 1);
    }
    // Larry, flat on the sand where he "landed", seeing stars
    if (t < UP) {
      pic(ctx, 'larry-flat', LARRY_X - 56, GROUND - FLAT + 2);
      for (let i = 0; i < 3; i++) {
        const a = t * 3 + (i * Math.PI * 2) / 3;
        text(ctx, '*', LARRY_X + 34 + Math.cos(a) * 9, GROUND - 22 + Math.sin(a) * 3, EGA.yellow, 7);
      }
    } else {
      stand(ctx, 'larry-smitten', LARRY_X);
    }
    // Pam
    if (t >= TITLE && t < RUN) {
      // slow motion: a stride every third of a second, covering almost no ground
      const u = (t - TITLE) / (RUN - TITLE);
      const x = 340 - u * 178;
      const f = Math.floor((t - TITLE) * 3) % 4;
      stand(ctx, `pam-run-${f}`, x, true);
      // sand kicking up behind her heels, hanging in the air
      ctx.save();
      for (let i = 0; i < 4; i++) {
        const age = ((t - TITLE) * 0.8 + i / 4) % 1;
        ctx.globalAlpha = 0.6 * (1 - age);
        ellipse(ctx, '#F8E8C0', x + 14 + age * 26, GROUND - 2 - age * 10, 3 + age * 4, 1.5 + age * 2);
      }
      ctx.restore();
      if (t > TITLE + 0.6) shout(ctx, '(in slow motion, for some reason)', 160, 30, '#FFFFFF', 7);
    } else if (t >= RUN && t < UP + 1.2) {
      stand(ctx, 'pam-reach', LARRY_X + 66, true);
    } else if (t >= UP + 1.2) {
      // jogs off up the beach, waving over her shoulder
      const u = (t - UP - 1.2) / (END - UP - 1.2);
      stand(ctx, 'pam-wave', LARRY_X + 66 + u * 120, true);
    }
    // hearts for Larry
    if (t >= UP + 0.4) {
      for (let i = 0; i < 6; i++) {
        const life = ((t - UP) * 0.5 + i / 6) % 1;
        heart(ctx, LARRY_X + Math.sin(life * 7 + i) * 12, GROUND - 100 - life * 50, 2 + (i % 3), i % 2 ? '#FF3070' : '#FF90C0');
      }
    }
    ctx.setTransform(ctx.getTransform().a / z, 0, 0, ctx.getTransform().d / z, 0, 0);
    // the opening title, in the big red-and-yellow italic these shows loved
    if (t < TITLE + 0.6) {
      const a = Math.min(1, t / 0.4) * Math.min(1, (TITLE + 0.6 - t) / 0.5);
      ctx.save();
      ctx.globalAlpha = a;
      const wob = (i: number) => Math.round(Math.sin(t * 4 + i * 0.6) * 2);
      const title = 'PAM TO THE RESCUE';
      const w = 15;
      for (let i = 0; i < title.length; i++) {
        const x = 160 + (i - (title.length - 1) / 2) * w;
        text(ctx, title[i], x + 2, 58 + wob(i) + 2, '#601010', 20, 'center');
        text(ctx, title[i], x, 58 + wob(i), i % 2 ? '#FFD020' : '#FF3030', 20, 'center');
      }
      ctx.restore();
    }
    if (t >= RUN + 0.3 && t < UP) shout(ctx, '"Gotcha, Larry."', 230, 40, '#FFFFFF', 9);
    if (t >= UP + 1.2 && t < END - 0.6) shout(ctx, '"Be careful out there, sweetie!"', 200, 40, '#FFFFFF', 8);
    if (t >= UP + 0.3 && t < UP + 1.4) shout(ctx, '*sigh*', LARRY_X, 60, '#FF90C0', 9);
    fade(ctx, Math.max(1 - t / 0.35, 1 - (END - t) / 0.5));
  },
};

/** Every chapter's cutscenes include Pam's rescue. */
export const pamScenes: Record<string, Cutscene> = { pam: pamRescue };
