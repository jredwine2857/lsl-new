import { chapter1 } from './content/chapter1';
import { chapter2 } from './content/chapter2';
import { chapter3 } from './content/chapter3';
import { chapter4 } from './content/chapter4';
import { chapter5 } from './content/chapter5';
import { chapter6 } from './content/chapter6';
import { preloadArt } from './engine/art';
import { Game } from './engine/game';
import { EGA, LARRY, SCALE, person, rect, text } from './engine/gfx';

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

// ---- sound: a PC-speaker-ish square wave ----

let audio: AudioContext | null = null;
function beep(notes: [number, number][]) {
  try {
    audio ??= new AudioContext();
    let t = audio.currentTime;
    for (const [freq, dur] of notes) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.04;
      osc.connect(gain).connect(audio.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  } catch {
    // No audio is fine.
  }
}
function startChapter(i: number) {
  chapter = i;
  game = new Game(CHAPTERS[i]);
  game.onScore = () => beep([[660, 0.06], [880, 0.08]]);
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
  const msg = game.queue[0];
  if (msg === showing) return;
  showing = msg;
  if (!msg) { dialog.hidden = true; return; }
  dialog.hidden = false;
  dialog.className = msg.kind ?? 'info';
  dTitle.textContent = msg.title ?? '';
  dBody.textContent = msg.text;
  dButtons.replaceChildren();
  if (msg.kind === 'death') {
    beep([[392, 0.18], [370, 0.18], [349, 0.18], [330, 0.5]]);
    dBody.textContent += '\n\nThank you for playing Leisure Suit Larry: Woke Up Broke. Next time, be more careful!';
    const left = game.lifelinesLeft();
    if (msg.rescuable && left > 0) button(`Call Kris (${left} left)`, () => { game.rescue(); });
    button('Undo', () => { game.undo(); });
    button('Restore', () => { game.queue = []; restore(); });
    button('Restart', () => { restart(); });
  } else if (msg.kind === 'win') {
    beep([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.4]]);
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
  game.room.draw(ctx, game, t);
  const s = game.s;
  person(ctx, s.x, s.y, { ...LARRY, pin: !!game.flag('pinWorn') }, s.facing, game.moving ? Math.floor(game.walkFrame) : 0);
  // status bar
  rect(ctx, EGA.white, 0, 0, 320, 10);
  text(ctx, `Score: ${s.score} of ${game.maxScore}`, 3, 2, EGA.black, 6);
  text(ctx, CHAPTERS[chapter].chapter, 317, 2, EGA.black, 6, 'right');
}

let last = performance.now();
function frame(now: number) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  game.update(dt);
  syncDialog();
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
}
