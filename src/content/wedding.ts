// The wedding, right after the proposal: Room 3 of the Cho family noraebang,
// Donald Trump officiating and Elon Musk as best man. Then the twist: the man
// in the red cap who has been peeking at Larry in every city (watcher.ts) was
// Trump, keeping him safe from afar the whole time. Art: art/scenes/wedding.py.

import { backdrop, sceneArt } from '../engine/art';
import { EGA, ellipse, rect, text } from '../engine/gfx';
import type { Game } from '../engine/game';
import type { Cutscene } from '../engine/types';
import { drawWatcher, WATCH_SPOTS } from './watcher';

type Ctx = CanvasRenderingContext2D;

const FEET = 107; // the feet row in the 80x112 poses
const GROUND = 178; // the couple's feet
const BACK = 166; // the officiant's feet, a step behind them
const LARRY_X = 124;
const GRACE_X = 198;
const TRUMP_X = 161;
const ELON_X = 62;

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

/** A pose with its feet centred at (x, ground). */
function stand(ctx: Ctx, name: string, x: number, ground = GROUND, flip = false) {
  pic(ctx, name, x - 40, ground - FEET, flip);
}

function shout(ctx: Ctx, s: string, x: number, y: number, c: string, size: number) {
  text(ctx, s, x + 1, y + 1, EGA.black, size, 'center');
  text(ctx, s, x, y, c, size, 'center');
}

/** A line of dialogue in a caption box along the bottom, typed out. */
function line(ctx: Ctx, who: string, said: string, u: number, c = EGA.white) {
  const shown = said.slice(0, Math.max(0, Math.floor(u * 40)));
  ctx.save();
  ctx.globalAlpha = 0.75;
  rect(ctx, '#000000', 0, 182, 320, 18);
  ctx.restore();
  text(ctx, who, 6, 186, '#FFD040', 6);
  text(ctx, shown, 6 + who.length * 4.6 + 4, 186, c, 6);
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

/** The white lectern with a gold seal, in front of the officiant. */
function lectern(ctx: Ctx) {
  rect(ctx, '#E8E4EC', TRUMP_X - 15, 130, 30, 36);
  rect(ctx, '#FFFFFF', TRUMP_X - 15, 130, 3, 36);
  rect(ctx, '#B8B0C0', TRUMP_X + 12, 130, 3, 36);
  rect(ctx, '#F4F0F8', TRUMP_X - 18, 126, 36, 5);
  ellipse(ctx, '#C8A030', TRUMP_X, 146, 6, 6);
  ellipse(ctx, '#F0D060', TRUMP_X, 146, 4, 4);
  text(ctx, 'OFFICIANT', TRUMP_X, 157, '#7A6A30', 3, 'center');
}

/** What the karaoke screen behind the arch says. */
function screen(ctx: Ctx, words: string, c: string, t: number) {
  const pulse = 0.75 + 0.25 * Math.sin(t * 6);
  ctx.save();
  ctx.globalAlpha = pulse;
  shout(ctx, words, 160, 46, c, 7);
  ctx.restore();
}

// ---------------------------------------------------------------- timeline

const TITLE = 3;
const ENTER = TITLE + 4; // Trump reaches the lectern
const LINES: [number, string, string][] = [
  [ENTER, 'TRUMP:', 'Beautiful room. Tremendous room. Room 3, the best room.'],
  [ENTER + 2.8, 'TRUMP:', 'Greatest wedding ever, maybe. Everybody says so.'],
  [ENTER + 5.4, 'TRUMP:', 'Larry, do you take Grace?'],
  [ENTER + 7, 'LARRY:', 'I do.'],
  [ENTER + 8.4, 'TRUMP:', 'Grace, do you take Larry? Take your time. Really.'],
  [ENTER + 10.6, 'GRACE:', 'I do. Obviously.'],
  [ENTER + 12, 'ELON:', 'The ring. Delivered by rocket. Third try.'],
];
const PRONOUNCE = ENTER + 14.6;
const KISS = PRONOUNCE + 3;
const WHY = KISS + 3.6;
const FLASH = WHY + 2.8;
const FLASHES: [string, string][] = [
  ['ch1-mall', 'CINCINNATI'],
  ['ch2-gate', 'LAX, GATE 42'],
  ['ch3-skyline', 'HOUSTON'],
  ['ch4-street', 'LONG BEACH'],
  ['ch5-basel', 'MIAMI'],
];
const SHOT = 1.5;
const PAM = FLASH + FLASHES.length * SHOT;
const REVEAL = PAM + 2.6;
const THUMBS = REVEAL + 3.4;
const END = THUMBS + 5.6;

function said(t: number, start: number): number {
  return t - start;
}

/** A flashback: the room, sepia, with the man in the red cap circled. */
function flashback(ctx: Ctx, room: string, place: string, u: number) {
  backdrop(ctx, room);
  const spot = WATCH_SPOTS[room];
  if (spot) drawWatcher(ctx, { ...spot, phase: 0 }, 2);
  ctx.save();
  ctx.globalCompositeOperation = 'color';
  rect(ctx, '#A0723A', 0, 0, 320, 200);
  ctx.restore();
  const vig = ctx.createRadialGradient(160, 100, 60, 160, 100, 200);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, 320, 200);
  if (spot && u > 0.35) {
    ctx.strokeStyle = '#FF3030';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(spot.x, spot.y - 34, 14, 18, 0, 0, Math.PI * 2 * Math.min(1, (u - 0.35) * 3));
    ctx.stroke();
  }
  shout(ctx, place, 160, 14, '#F8E8C8', 8);
  // film grain and a flicker
  for (let i = 0; i < 30; i++) rect(ctx, '#F8E8C8', (i * 97 + Math.floor(u * 40) * 31) % 320, (i * 53 + Math.floor(u * 40) * 17) % 200, 1, 1);
}

export const wedding: Cutscene = {
  duration: END,
  draw(ctx, t, g) {
    cues(t, g, [[0.2, 'bride'], [PRONOUNCE + 1.2, 'win'], [KISS, 'smooch'], [KISS + 0.3, 'applause'], [WHY + 0.2, 'scratch'], [REVEAL, 'reveal'], [THUMBS + 3.5, 'applause']]);
    if (t < FLASH || t >= REVEAL) {
      // the hall
      ctx.save();
      const z = t < TITLE ? 1.1 - t * 0.033 : 1;
      ctx.translate(160, 110);
      ctx.scale(z, z);
      ctx.translate(-160, -110);
      pic(ctx, 'wed-hall', 0, 0);
      // party-light twinkle
      for (let i = 0; i < 10; i++) if (Math.sin(t * 4 + i * 2.1) > 0.7) rect(ctx, '#FFFFFF', 12 + i * 31, 6 + (i % 2) * 8, 2, 2);
      if (t >= KISS && t < REVEAL) screen(ctx, 'JUST MARRIED', '#FF70B0', t);
      else if (t >= TITLE) screen(ctx, '♪ WEDDING MODE ♪', '#80E0FF', t);
      // the officiant
      if (t >= TITLE && t < ENTER) {
        const u = (t - TITLE) / (ENTER - TITLE);
        const x = 340 - u * (340 - TRUMP_X);
        stand(ctx, `wed-trump-walk-${Math.floor(t * 3) % 2}`, x, BACK - 2 + u * 2, true);
      } else if (t >= ENTER && t < REVEAL) {
        stand(ctx, t >= PRONOUNCE && t < KISS + 1.5 ? 'wed-trump-proclaim' : 'wed-trump-read', TRUMP_X, BACK);
        lectern(ctx);
      } else if (t >= REVEAL) {
        stand(ctx, t < THUMBS ? 'wed-trump-binoculars' : 'wed-trump-thumbs', TRUMP_X, BACK);
      }
      // best man
      const ring = t >= LINES[6][0] && t < PRONOUNCE;
      stand(ctx, ring ? 'wed-elon-ring' : 'wed-elon', ring ? ELON_X + 22 : ELON_X);
      // the couple
      const kiss = t >= KISS && t < WHY;
      if (t >= WHY && t < FLASH) stand(ctx, 'wed-larry-shrug', LARRY_X);
      else stand(ctx, kiss ? 'wed-larry-kiss' : 'wed-larry', kiss ? LARRY_X + 18 : LARRY_X);
      stand(ctx, kiss ? 'wed-grace-kiss' : 'wed-grace', kiss ? GRACE_X - 18 : GRACE_X);
      ctx.restore();
      // confetti and hearts from the kiss on
      if (t >= KISS && t < REVEAL) {
        const u = t - KISS;
        for (let i = 0; i < 40; i++) {
          const y = ((u * (30 + (i % 7) * 6) + i * 37) % 220) - 20;
          const x = (i * 71 + Math.sin(u * 2 + i) * 8) % 320;
          rect(ctx, ['#FF4A8A', '#FFD040', '#80E0FF', '#FFFFFF', '#90FF90'][i % 5], x, y, 2, 1 + (i % 2));
        }
        for (let i = 0; i < 6; i++) {
          const life = (u * 0.5 + i / 6) % 1;
          heart(ctx, 160 + Math.sin(life * 7 + i) * 14, 80 - life * 60, 2 + (i % 3), i % 2 ? '#FF3070' : '#FF90C0');
        }
      }
      // words
      if (t < TITLE) {
        const a = Math.min(1, t / 0.5) * Math.min(1, (TITLE - t) / 0.4);
        ctx.save();
        ctx.globalAlpha = a;
        shout(ctx, 'THE WEDDING', 160, 70, '#FFF0F8', 20);
        shout(ctx, 'Room 3, the Cho family noraebang, Cerritos', 160, 96, '#FFC0E0', 7);
        ctx.restore();
      }
      if (t >= TITLE + 0.3 && t < ENTER) line(ctx, 'SNOOP:', 'Y\'all, please rise for... your officiant.', said(t, TITLE + 0.3));
      for (let i = 0; i < LINES.length; i++) {
        const [at, who, s] = LINES[i];
        const next = i + 1 < LINES.length ? LINES[i + 1][0] : PRONOUNCE;
        if (t >= at && t < next) line(ctx, who, s, said(t, at));
      }
      if (t >= PRONOUNCE && t < KISS) line(ctx, 'TRUMP:', 'I now pronounce you husband and wife. Kiss the bride!', said(t, PRONOUNCE));
      if (t >= KISS && t < WHY) shout(ctx, 'JUST MARRIED!', 160, 30, '#FF70B0', Math.round(10 + 10 * Math.min(1, (t - KISS) * 4)));
      if (t >= WHY && t < FLASH) line(ctx, 'LARRY:', 'Wait. Why are YOU officiating my wedding?', said(t, WHY));
      if (t >= REVEAL && t < THUMBS) line(ctx, 'TRUMP:', 'The red cap. The binoculars. That was me, Larry.', said(t, REVEAL));
      if (t >= THUMBS && t < THUMBS + 3) line(ctx, 'TRUMP:', 'Somebody had to keep you safe. You\'re a disaster.', said(t, THUMBS));
      if (t >= THUMBS + 3) line(ctx, 'TRUMP:', 'A beautiful disaster. Many people are saying it.', said(t, THUMBS + 3));
    } else if (t < PAM) {
      // the flashback montage
      const i = Math.floor((t - FLASH) / SHOT);
      const u = (t - FLASH - i * SHOT) / SHOT;
      flashback(ctx, FLASHES[i][0], FLASHES[i][1], u);
      line(ctx, 'TRUMP:', 'I\'ve been watching you, Larry. Every city. Every mess.', said(t, FLASH));
      fade(ctx, Math.max(1 - u / 0.15, 1 - (1 - u) / 0.15) * 0.8);
    } else {
      // who do you think kept sending Pam?
      const u = t - PAM;
      pic(ctx, 'pam-beach', 0, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'color';
      rect(ctx, '#A0723A', 0, 0, 320, 200);
      ctx.restore();
      stand(ctx, 'pam-wave', 200 + u * 10, 184, true);
      line(ctx, 'TRUMP:', 'And who do you think kept sending Pam?', said(t, PAM));
    }
    const cut = (a: number) => Math.max(0, 1 - Math.abs(t - a) / 0.25);
    fade(ctx, Math.max(1 - t / 0.4, 1 - (END - t) / 0.8, cut(FLASH), cut(PAM), cut(REVEAL)));
  },
};
