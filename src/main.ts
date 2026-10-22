import { chapter1 } from './content/chapter1';
import { chapter2 } from './content/chapter2';
import { chapter3 } from './content/chapter3';
import { chapter4 } from './content/chapter4';
import { chapter5 } from './content/chapter5';
import { chapter6 } from './content/chapter6';
import { songFor } from './content/music';
import { charSprite, preloadArt } from './engine/art';
import { Game } from './engine/game';
import { EGA, LARRY, SCALE, person, rect, text } from './engine/gfx';
import { sound } from './engine/sound';

const CHAPTERS = [chapter1, chapter2, chapter3, chapter4, chapter5, chapter6];
const SAVE_KEY = 'lsl-woke-up-broke:save';
const CHAPTER_KEY = 'lsl-woke-up-broke:chapter';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const input = document.getElementById('input') as HTMLInputElement;
const form = document.getElementById('parser') as HTMLFormElement;
const dialog = document.getElementById('dialog') as HTMLDivElement;
const dTitle = dialog.querySelector('.title') as HTMLDivElement;
const dBody = dialog.querySelector('.body') as HTMLDivElement;
const dButtons = dialog.querySelector('.buttons') as HTMLDivElement;

const chapterSelect = document.getElementById('chapter') as HTMLSelectElement;

let chapter = 0;
let game = new Game(CHAPTERS[0]);
const history: string[] = [];
let historyAt = 0;

// ---- sound ----

// Browsers only start audio after the player clicks or types.
for (const ev of ['pointerdown', 'keydown'] as const) window.addEventListener(ev, () => sound.unlock(), { capture: true });

const musicBtn = document.getElementById('music') as HTMLButtonElement;
const sfxBtn = document.getElementById('sfx') as HTMLButtonElement;
function syncSoundButtons() {
  musicBtn.textContent = `Music: ${sound.musicOn ? 'On' : 'Off'}`;
  musicBtn.setAttribute('aria-pressed', String(sound.musicOn));
  sfxBtn.textContent = `Sound: ${sound.sfxOn ? 'On' : 'Off'}`;
  sfxBtn.setAttribute('aria-pressed', String(sound.sfxOn));
}
musicBtn.addEventListener('click', () => { sound.unlock(); sound.toggleMusic(); syncSoundButtons(); input.focus(); });
sfxBtn.addEventListener('click', () => { sound.unlock(); sound.toggleSfx(); syncSoundButtons(); input.focus(); });
syncSoundButtons();

function startChapter(i: number) {
  chapter = i;
  game = new Game(CHAPTERS[i]);
  game.onScore = () => sound.sfx('score');
  game.onSfx = (name) => sound.sfx(name);
  chapterSelect.value = String(i);
  try { localStorage.setItem(CHAPTER_KEY, String(i)); } catch { /* storage blocked */ }
  for (const line of CHAPTERS[i].intro) game.say(line);
}

CHAPTERS.forEach((c, i) => chapterSelect.add(new Option(c.chapter, String(i))));
chapterSelect.addEventListener('change', () => { startChapter(Number(chapterSelect.value)); input.focus(); });

// ---- saves ----

function save() {
  try {
    localStorage.setItem(`${SAVE_KEY}:${chapter}`, game.serialize());
    game.say('Game saved. Smart. Larry never saves anything, including himself.');
  } catch {
    game.say("Couldn't save in this browser (private mode?).");
  }
}

function restore() {
  let data: string | null = null;
  try { data = localStorage.getItem(`${SAVE_KEY}:${chapter}`); } catch { /* storage blocked */ }
  if (!data) { game.say('No saved game found. You should SAVE more often.'); return; }
  game.load(data);
  game.say('Game restored.');
}

function restart() {
  startChapter(chapter);
}

// ---- input ----

function run(raw: string) {
  const cmd = raw.trim();
  if (!cmd) return;
  history.push(cmd);
  historyAt = history.length;
  const word = cmd.toLowerCase().split(/\s+/)[0];
  if (word === 'save') save();
  else if (word === 'restore' || word === 'load') restore();
  else if (word === 'restart') restart();
  else game.command(cmd);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (game.queue.length) { if (!dButtons.childElementCount) dismiss(); return; }
  run(input.value);
  input.value = '';
});

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
};

window.addEventListener('keydown', (e) => {
  if (game.scene && ['Enter', 'Escape', ' '].includes(e.key)) { e.preventDefault(); game.skipScene(); return; }
  if (game.queue.length) {
    if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
      e.preventDefault();
      if (!dButtons.childElementCount) dismiss();
    }
    return;
  }
  const arrow = ARROWS[e.key];
  if (arrow) {
    e.preventDefault();
    if (e.key === 'ArrowUp' && e.shiftKey) return;
    game.toggleDir(...arrow);
    return;
  }
  // F3 repeats the last command, like it always should have.
  if (e.key === 'F3' && history.length) { e.preventDefault(); input.value = history[history.length - 1]; }
  if (e.key === 'PageUp' && history.length) { e.preventDefault(); historyAt = Math.max(0, historyAt - 1); input.value = history[historyAt]; }
  if (document.activeElement !== input && e.key.length === 1 && !e.metaKey && !e.ctrlKey) input.focus();
});

canvas.addEventListener('click', (e) => {
  if (game.scene) { game.skipScene(); return; }
  if (game.queue.length) { if (!dButtons.childElementCount) dismiss(); return; }
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 320;
  const y = ((e.clientY - r.top) / r.height) * 200;
  // Clicking a hotspot walks to the floor in front of it.
  const h = game.visibleHotspots().find((h) => x >= h.rect.x && x < h.rect.x + h.rect.w && y >= h.rect.y && y < h.rect.y + h.rect.h);
  if (h && y < game.room.walk.y) game.walkTo(h.rect.x + h.rect.w / 2, h.rect.y + h.rect.h + 4);
  else game.walkTo(x, y);
  input.focus();
});

document.querySelectorAll<HTMLButtonElement>('#toolbar [data-cmd]').forEach((b) =>
  b.addEventListener('click', () => { if (!game.queue.length) run(b.dataset.cmd!); input.focus(); }),
);
document.querySelectorAll<HTMLButtonElement>('#toolbar [data-walk]').forEach((b) =>
  b.addEventListener('click', () => {
    const [dx, dy] = b.dataset.walk!.split(',').map(Number);
    if (!game.queue.length) game.toggleDir(dx, dy);
  }),
);

// ---- dialog ----

let showing: unknown = null;

function dismiss() {
  game.queue.shift();
  showing = null;
}

function button(label: string, fn: () => void) {
  const b = document.createElement('button');
  b.textContent = label;
  b.addEventListener('click', (e) => { e.stopPropagation(); fn(); input.focus(); });
  dButtons.appendChild(b);
}

function syncDialog() {
  const msg = game.scene ? undefined : game.queue[0];
  if (msg === showing) return;
  showing = msg;
  if (!msg) { dialog.hidden = true; sound.duck(false); return; }
  if (msg.kind === 'info') { sound.duck(false); sound.sfx('blip'); }
  dialog.hidden = false;
  dialog.className = msg.kind ?? 'info';
  dTitle.textContent = msg.title ?? '';
  dBody.textContent = msg.text;
  dButtons.replaceChildren();
  if (msg.kind === 'death') {
    sound.duck(true);
    sound.sfx('death');
    dBody.textContent += '\n\nThank you for playing Leisure Suit Larry: Woke Up Broke. Next time, be more careful!';
    const left = game.lifelinesLeft();
    if (msg.rescuable && left > 0) button(`Call Kris (${left} left)`, () => { sound.sfx('phone'); game.rescue(); });
    button('Undo', () => { game.undo(); });
    button('Restore', () => { game.queue = []; restore(); });
    button('Restart', () => { restart(); });
  } else if (msg.kind === 'win') {
    sound.duck(true);
    sound.sfx('win');
    if (CHAPTERS[chapter + 1]) button(`Play ${CHAPTERS[chapter + 1].chapter.split(':')[0]}`, () => { startChapter(chapter + 1); });
    button('Play again', () => { restart(); });
  }
}
dialog.addEventListener('click', () => { if (!dButtons.childElementCount) dismiss(); });

// ---- render ----

function draw(t: number) {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;
  rect(ctx, EGA.black, 0, 0, 320, 200);
  if (game.scene) {
    const sc = CHAPTERS[chapter].scenes?.[game.scene.name];
    if (sc) {
      ctx.save();
      sc.draw(ctx, game.scene.t, game);
      ctx.restore();
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      text(ctx, 'click to skip', 317, 193, '#888888', 5, 'right');
      return;
    }
  }
  game.room.draw(ctx, game, t);
  const s = game.s;
  const step = game.moving ? 1 + Math.floor(game.walkFrame) : 0;
  if (charSprite(ctx, 'larry', s.x, s.y, s.facing, step)) {
    if (game.flag('pinWorn') && s.facing !== 'up') rect(ctx, EGA.lmagenta, s.x + (s.facing === 'left' ? 1 : -4), s.y - 27, 1, 1);
  } else {
    person(ctx, s.x, s.y, { ...LARRY, pin: !!game.flag('pinWorn') }, s.facing, step);
  }
  // status bar
  rect(ctx, EGA.white, 0, 0, 320, 10);
  text(ctx, `Score: ${s.score} of ${game.maxScore}`, 3, 2, EGA.black, 6);
  text(ctx, CHAPTERS[chapter].chapter, 317, 2, EGA.black, 6, 'right');
}

let last = performance.now();
let lastStep = -1;
function frame(now: number) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  game.update(dt);
  syncDialog();
  sound.play(songFor(game.s.room));
  const step = game.moving ? Math.floor(game.walkFrame) : -1;
  if (step !== lastStep && step >= 0 && step % 2 === 0) sound.sfx('step');
  lastStep = step;
  draw(now / 1000);
  requestAnimationFrame(frame);
}

let saved = 0;
try { saved = Number(localStorage.getItem(CHAPTER_KEY) ?? 0) || 0; } catch { /* storage blocked */ }
startChapter(Math.min(saved, CHAPTERS.length - 1));
input.focus();
preloadArt().then(() => requestAnimationFrame(frame));

// ?debug exposes the game object in the console for testing rooms quickly.
if (new URLSearchParams(location.search).has('debug')) {
  Object.defineProperty(window, 'game', { get: () => game });
  Object.defineProperty(window, 'startChapter', { value: startChapter });
  Object.defineProperty(window, 'sound', { value: sound });
}
