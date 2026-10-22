// Chapter 6's action sequences: Larry and Grace's karaoke duet, the rocket
// launch, and the proposal. Each is a short full-screen cutscene built from
// Blender renders (art/scenes/) animated here: frame swaps, flicker, smoke,
// screen shake and sparkle. Click (or Enter) skips.

import { EGA, ellipse, rect, text } from '../engine/gfx';
import { backdrop, sceneArt } from '../engine/art';
import type { Game } from '../engine/game';
import type { Cutscene } from '../engine/types';

type Ctx = CanvasRenderingContext2D;

/** Draw a scene image with its top-left at (x, y), optionally scaled. */
function pic(ctx: Ctx, name: string, x: number, y: number, w?: number, h?: number) {
  const img = sceneArt(name);
  if (!img) return;
  ctx.drawImage(img, Math.round(x), Math.round(y), w ?? img.naturalWidth, h ?? img.naturalHeight);
}

/** Text with a hard drop shadow, readable over anything. */
function shout(ctx: Ctx, s: string, x: number, y: number, c: string, size: number, align: CanvasTextAlign = 'center') {
  text(ctx, s, x + 1, y + 1, EGA.black, size, align);
  text(ctx, s, x, y, c, size, align);
}

function fade(ctx: Ctx, c: string, a: number) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, a);
  rect(ctx, c, -20, -20, 360, 240);
  ctx.restore();
}

/** Black fades in and out at the edges of [start, end). */
function edges(ctx: Ctx, t: number, start: number, end: number, len = 0.4) {
  fade(ctx, EGA.black, Math.max(1 - (t - start) / len, 1 - (end - t) / len));
}

/** A four-point twinkle. */
function twinkle(ctx: Ctx, x: number, y: number, r: number, c = '#FFFFFF') {
  rect(ctx, c, x - r, y, r * 2 + 1, 1);
  rect(ctx, c, x, y - r, 1, r * 2 + 1);
  if (r > 2) rect(ctx, c, x - 1, y - 1, 3, 3);
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

/** Sound cues fire once each as the scene's clock passes them. */
const lastT = new Map<string, number>();
function cues(name: string, t: number, g: Game, list: [number, string][]) {
  let prev = lastT.get(name) ?? -1;
  if (t < prev) prev = -1;
  for (const [at, sfx] of list) if (prev < at && at <= t) g.sfx(sfx);
  lastT.set(name, t);
}

// ---------------------------------------------------------------- karaoke

const BEAT = 0.5;
const LYRICS: [number, string, string][] = [
  [0, 'ISLANDS IN THE STREAM', EGA.yellow],
  [2, '♪ KENNY ♪  ooh ~ ~ ~ ~ ~', '#60C8FF'],
  [4.5, '♪ DOLLY ♪  ahh ~ ~ ~ ~ ~', '#FF70D0'],
  [7, '♪ BOTH ♪  ~ ~ ~ ~ ~ ~ ~ ~', EGA.yellow],
];

const karaoke: Cutscene = {
  duration: 10,
  draw(ctx, t, g) {
    cues('karaoke', t, g, [[8.6, 'applause']]);
    const beat = Math.floor(t / BEAT);
    pic(ctx, 'karaoke-bg', 0, 0);
    // the karaoke video: a beach at sunset, waves rolling by
    const sky = ctx.createLinearGradient(0, 14, 0, 114);
    sky.addColorStop(0, '#2A1060');
    sky.addColorStop(0.5, '#E05080');
    sky.addColorStop(0.62, '#FFB040');
    sky.addColorStop(0.63, '#2050A0');
    sky.addColorStop(1, '#102050');
    ctx.fillStyle = sky;
    ctx.fillRect(46, 14, 228, 100);
    ellipse(ctx, '#FFE070', 160, 76, 14, 14);
    rect(ctx, '#2050A0', 46, 77, 228, 37);
    for (let i = 0; i < 6; i++) rect(ctx, '#80B0E0', 46 + ((i * 47 + t * 30) % 228), 82 + i * 5, 18, 1);
    // the lyric line, with a colour wipe and the bouncing ball
    const line = [...LYRICS].reverse().find(([at]) => t >= at)!;
    const [at, words, hue] = line;
    const next = LYRICS.find(([a]) => a > at)?.[0] ?? 10;
    const p = Math.min(1, (t - at) / (next - at - 0.3));
    rect(ctx, '#000000', 46, 14, 228, 18);
    shout(ctx, words, 160, 27, EGA.white, 7);
    ctx.save();
    ctx.beginPath();
    ctx.rect(60, 17, 200 * p, 16);
    ctx.clip();
    text(ctx, words, 160, 27, hue, 7, 'center');
    ctx.restore();
    const bx = 60 + 200 * p;
    ellipse(ctx, EGA.white, bx, 20 - Math.abs(Math.sin((t / BEAT) * Math.PI)) * 4, 1.5, 1.5);
    // coloured spots sweeping the stage
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const [i, c] of [[0, '#FF40C0'], [1, '#40C0FF'], [2, '#FFE040']] as const) {
      const sx = 160 + Math.sin(t * 1.3 + i * 2.1) * 110;
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(296, 18);
      ctx.lineTo(sx - 22, 200);
      ctx.lineTo(sx + 22, 200);
      ctx.fill();
    }
    ctx.restore();
    // the singers: Larry belts his part, Grace hers, then both
    const kenny = t >= 2 && t < 4.5;
    const dolly = t >= 4.5 && t < 7;
    const both = t >= 7;
    const larryF = (kenny || both) && beat % 2 ? 1 : 0;
    const graceF = (dolly || both) && beat % 2 ? 1 : 0;
    const bob = (on: boolean) => (on ? Math.round(Math.abs(Math.sin((t / BEAT) * Math.PI)) * 2) : 0);
    pic(ctx, `karaoke-larry-${larryF}`, 62, 62 + bob(kenny || both));
    pic(ctx, `karaoke-grace-${graceF}`, 150, 62 + bob(dolly || both));
    // disco ball glints and floating notes
    for (let i = 0; i < 14; i++) {
      const a = i * 2.4 + t * 0.8;
      const x = 160 + Math.cos(a) * (60 + (i * 37) % 100);
      const y = 70 + Math.sin(a * 1.3) * 60;
      if ((beat + i) % 3 === 0) twinkle(ctx, Math.round(x), Math.round(y), 1 + (i % 2), i % 2 ? '#FFFFFF' : '#FFC0F0');
    }
    for (let i = 0; i < 6; i++) {
      const life = (t * 0.6 + i / 6) % 1;
      const fromLarry = i % 2 === 0;
      if (fromLarry ? !(kenny || both) : !(dolly || both)) continue;
      const x = (fromLarry ? 112 : 170) + Math.sin(life * 6 + i) * 6;
      const y = 110 - life * 70;
      ctx.save();
      ctx.globalAlpha = 1 - life;
      shout(ctx, i % 4 < 2 ? '♪' : '♫', x, y, fromLarry ? '#60C8FF' : '#FF70D0', 9);
      ctx.restore();
    }
    edges(ctx, t, 0, 10);
  },
};

// ---------------------------------------------------------------- launch

const IGNITE = 3;
const LIFT = 4.6;

const launch: Cutscene = {
  duration: 11.5,
  draw(ctx, t, g) {
    cues('launch', t, g, [[0.05, 'blip'], [1, 'blip'], [2, 'blip'], [IGNITE, 'rocket'], [IGNITE + 3.5, 'rocket'], [9.5, 'applause']]);
    const burn = t >= IGNITE;
    const rise = t > LIFT ? 7 * (t - LIFT) ** 2 + 6 * (t - LIFT) : 0;
    // the whole frame shakes with the thrust, hardest at liftoff
    const amp = burn ? Math.min(1, (t - IGNITE) / 0.6) * Math.max(0.6, 4 - Math.max(0, t - LIFT - 1) * 0.6) : 0;
    ctx.translate(Math.round(Math.sin(t * 71) * amp), Math.round(Math.cos(t * 57) * amp));
    pic(ctx, 'launch-bg', -6, -6, 332, 212);
    // venting vapour while it waits
    if (!burn) {
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.1 * Math.sin(t * 5);
      pic(ctx, `launch-smoke-${Math.floor(t * 3) % 3}`, 120, 120, 80, 24);
      ctx.restore();
    }
    // smoke trail left hanging in the air behind the climbing rocket
    if (t > LIFT) {
      ctx.save();
      for (let y = 140 - rise + 40; y < 150; y += 12) {
        const age = Math.max(0, (150 - y) / 200);
        ctx.globalAlpha = Math.max(0, 0.6 - age * 0.3);
        const w = 34 + age * 40 + (150 - y) * 0.2;
        pic(ctx, `launch-smoke-${Math.abs(Math.round(y / 12)) % 3}`, 160 - w / 2, y - w * 0.15, w, w * 0.3);
      }
      ctx.restore();
    }
    // the plume, then the rocket on top of it
    const f = Math.floor(t * 14) % 3;
    if (burn) {
      const grow = Math.min(1, (t - IGNITE) / 0.8);
      const h = (40 + 120 * grow) * (1 + 0.08 * Math.sin(t * 40));
      const w = 30 + 26 * grow;
      pic(ctx, `launch-flame-${f}`, 160 - w / 2, 142 - rise, w, h);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const glow = ctx.createRadialGradient(160, 150 - rise, 2, 160, 150 - rise, 70);
      glow.addColorStop(0, 'rgba(255,240,200,0.9)');
      glow.addColorStop(0.3, 'rgba(255,150,40,0.35)');
      glow.addColorStop(1, 'rgba(255,90,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(80, 70 - rise, 160, 160);
      ctx.restore();
      ellipse(ctx, '#FFFFF0', 160, 147 - rise, 6, 3);
    }
    pic(ctx, 'launch-rocket', 136, 4 - rise);
    // exhaust clouds boiling out of the trench and rolling across the pad
    if (burn) {
      const k = Math.min(1, (t - IGNITE) / 3.5);
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const w = 120 + k * (220 + i * 60);
        const h = w * 0.3;
        ctx.globalAlpha = 0.95 - i * 0.12;
        const drift = (i - 1) * k * 30;
        pic(ctx, `launch-smoke-${(f + i) % 3}`, 160 - w / 2 + drift, 200 - h + i * 4 - k * 6, w, h);
      }
      ctx.restore();
      // the pad lit orange from the flame
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.max(0, 0.3 - rise / 1000) * (1 + 0.3 * Math.sin(t * 33));
      const lit = ctx.createLinearGradient(0, 110, 0, 200);
      lit.addColorStop(0, 'rgba(255,112,32,0)');
      lit.addColorStop(1, 'rgba(255,112,32,1)');
      ctx.fillStyle = lit;
      ctx.fillRect(-10, 110, 340, 100);
      ctx.restore();
    }
    // ignition flash
    if (burn) fade(ctx, '#FFFFFF', 0.9 - (t - IGNITE) / 0.35);
    ctx.setTransform(ctx.getTransform().a, 0, 0, ctx.getTransform().d, 0, 0);
    if (!burn) {
      const n = 3 - Math.floor(t);
      shout(ctx, `T-${n}`, 70, 60, EGA.lred, 28);
      shout(ctx, 'LaffX LAFFER ONE', 70, 82, EGA.white, 8);
    } else if (t > LIFT && t < LIFT + 4) {
      const pop = Math.min(1, (t - LIFT) * 4);
      shout(ctx, 'LIFTOFF!', 160, 40, EGA.yellow, Math.round(10 + 18 * pop));
    } else if (t >= LIFT + 4.2) {
      shout(ctx, 'GO, LAFFER ONE!', 160, 40, EGA.white, 12);
    }
    fade(ctx, EGA.black, 1 - (11.5 - t) / 0.6);
  },
};

// ---------------------------------------------------------------- proposal

/** Mission Control in the dark, one spotlight on the two of them. */
function proposalShot(ctx: Ctx, t: number, yes: boolean) {
  backdrop(ctx, 'ch6-control');
  fade(ctx, '#000010', 0.62);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const spot = ctx.createRadialGradient(150, 150, 8, 150, 150, 120);
  spot.addColorStop(0, 'rgba(255,230,190,0.45)');
  spot.addColorStop(1, 'rgba(255,230,190,0)');
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, 320, 200);
  ctx.restore();
  ellipse(ctx, '#0A0A14', 155, 194, 90, 5);
  pic(ctx, 'proposal-larry', 56, 86);
  const hop = yes ? Math.round(Math.abs(Math.sin(t * 7)) * 6) : 0;
  pic(ctx, 'proposal-grace', 172, 46 - hop);
  // the diamond catches the light
  const glint = (Math.sin(t * 5) + 1) / 2;
  twinkle(ctx, 153, 118, 1 + Math.round(glint * 3));
  if (glint > 0.7) twinkle(ctx, 158, 114, 1, '#C0E8FF');
}

const proposal: Cutscene = {
  duration: 13,
  draw(ctx, t, g) {
    cues('proposal', t, g, [[5, 'tuned'], [9.2, 'win'], [9.6, 'applause'], [10.4, 'smooch']]);
    if (t < 5) {
      // shot 1: down on one knee, slow push in
      const z = 1 + t * 0.03;
      ctx.translate(150, 150);
      ctx.scale(z, z);
      ctx.translate(-150, -150);
      proposalShot(ctx, t, false);
      ctx.setTransform(ctx.getTransform().a / z, 0, 0, ctx.getTransform().d / z, 0, 0);
      if (t > 1.2) {
        const said = '"Grace Cho. Will you marry me?"';
        shout(ctx, said.slice(0, Math.floor((t - 1.2) * 16)), 160, 26, EGA.white, 9);
      }
      edges(ctx, t, 0, 5);
    } else if (t < 9) {
      // shot 2: the ring, close enough to see your face in it
      const u = t - 5;
      const sky = ctx.createRadialGradient(160, 70, 10, 160, 100, 220);
      sky.addColorStop(0, '#3A0A30');
      sky.addColorStop(1, '#05020A');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 320, 200);
      const z = 1 + u * 0.05;
      ctx.translate(160, 58);
      ctx.scale(z, z);
      ctx.translate(-160, -58);
      pic(ctx, 'proposal-ring', 0, 0);
      // facets flashing and a glint sweeping across the stone
      for (let i = 0; i < 9; i++) {
        const a = i * 0.7 + u * 1.7;
        const on = Math.sin(u * 6 + i * 2.3) > 0.3;
        if (on) twinkle(ctx, Math.round(160 + Math.cos(a) * (10 + (i % 3) * 9)), Math.round(54 + Math.sin(a) * (8 + (i % 3) * 5)), 1 + (i % 3), i % 2 ? '#FFFFFF' : '#C8F0FF');
      }
      const sweep = ((u * 0.6) % 1) * 80 - 40;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(160 + sweep - 3, 36);
      ctx.lineTo(160 + sweep + 3, 36);
      ctx.lineTo(160 + sweep + 9, 76);
      ctx.lineTo(160 + sweep + 3, 76);
      ctx.fill();
      ctx.restore();
      const big = 3 + Math.round(((Math.sin(u * 3) + 1) / 2) * 6);
      twinkle(ctx, 172, 46, big);
      ctx.setTransform(ctx.getTransform().a / z, 0, 0, ctx.getTransform().d / z, 0, 0);
      shout(ctx, "GRANDMA CHO'S DIAMOND", 160, 190, '#C8F0FF', 7);
      edges(ctx, t, 5, 9);
    } else {
      // shot 3: YES!
      const u = t - 9;
      proposalShot(ctx, t, true);
      for (let i = 0; i < 12; i++) {
        const life = (u * 0.45 + i / 12) % 1;
        const x = 60 + ((i * 53) % 200) + Math.sin(life * 8 + i) * 6;
        heart(ctx, x, 190 - life * 200, 3 + (i % 3), i % 2 ? '#FF4080' : '#FF90C0');
      }
      const pop = Math.min(1, u * 5);
      shout(ctx, 'YES!', 160, 32, '#FF70B0', Math.round(10 + 26 * pop));
      if (u > 1) shout(ctx, '"Obviously yes."', 160, 72, EGA.white, 8);
      edges(ctx, t, 9, 13, 0.6);
    }
  },
};

export const scenes6: Record<string, Cutscene> = { karaoke, launch, proposal };
