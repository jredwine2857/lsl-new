import { describe, expect, it } from 'vitest';
import { chapter2 } from '../src/content/chapter2';
import { Game } from '../src/engine/game';

function walk(g: Game, x: number, y: number) {
  g.walkTo(x, y);
  for (let i = 0; i < 2000 && g.moving && !g.s.over; i++) {
    g.update(1 / 30);
    if (!g.s.over) g.queue = [];
  }
}

function run(g: Game, cmd: string): string {
  g.queue = [];
  g.command(cmd);
  const out = g.queue.map((m) => m.text).join('\n');
  g.queue = [];
  if (/not close enough|don't see that|can't do that/i.test(out)) throw new Error(`"${cmd}" failed: ${out}`);
  return out;
}

function newGame() {
  const g = new Game(chapter2);
  g.queue = [];
  return g;
}

describe('chapter 2 walkthrough', () => {
  it('can be finished with a perfect score', () => {
    const g = newGame();
    run(g, 'look at windows');
    run(g, 'look at stain');
    run(g, 'swipe right');
    walk(g, 220, 172);
    run(g, 'talk to janitor');
    run(g, 'show space quest to janitor');
    run(g, 'use spray');
    walk(g, 316, 172);
    expect(g.s.room).toBe('curb');

    walk(g, 120, 172);
    run(g, 'talk to kardashians');
    run(g, 'talk to caitlyn');
    walk(g, 230, 172);
    run(g, 'pose');
    expect(g.has('kriscard')).toBe(true);
    walk(g, 316, 170);
    expect(g.s.room).toBe('theme');

    walk(g, 170, 172);
    run(g, 'look at ashleigh');
    run(g, 'talk to ashleigh');
    run(g, 'show profile');
    walk(g, 236, 172);
    run(g, 'talk to waiter');
    run(g, 'show wristband to waiter');
    walk(g, 287, 154);

    expect(g.s.over).toBe('won');
    expect(Object.keys(chapter2.points).filter((k) => !g.s.awarded.includes(k))).toEqual([]);
    expect(g.maxScore).toBe(100);
  });
});

describe('chapter 2 deaths and the Kris lifeline', () => {
  it('complaining about her photos gets you canceled, and Kris can save you', () => {
    const g = newGame();
    g.give('kriscard');
    g.set('matched');
    g.goto('theme', 170, 172);
    run(g, 'say you look nothing like your pictures');
    expect(g.s.over).toBe('dead');
    g.queue = [{ text: '', kind: 'death', rescuable: true }];
    expect(g.rescue()).toBe(true);
    expect(g.s.over).toBe(null);
    expect(g.lifelinesLeft()).toBe(2);
  });

  it('the lifeline runs out', () => {
    const g = newGame();
    g.give('kriscard');
    g.goto('curb', 120, 170);
    for (let i = 0; i < 3; i++) {
      walk(g, 120, 195);
      expect(g.s.over).toBe('dead');
      expect(g.rescue()).toBe(true);
    }
    walk(g, 120, 195);
    expect(g.rescue()).toBe(false);
    expect(g.s.over).toBe('dead');
  });

  it('no Kris card, no rescue', () => {
    const g = newGame();
    g.goto('curb', 120, 170);
    walk(g, 120, 195);
    expect(g.rescue()).toBe(false);
  });

  it('the paparazzo ignores a stained suit', () => {
    const g = newGame();
    g.goto('curb', 230, 172);
    run(g, 'pose');
    expect(g.has('kriscard')).toBe(false);
  });

  it('the guard blocks the Theme Building without a wristband', () => {
    const g = newGame();
    g.goto('curb', 290, 172);
    walk(g, 316, 172);
    expect(g.s.room).toBe('curb');
  });
});
