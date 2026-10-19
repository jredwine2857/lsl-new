import { describe, expect, it } from 'vitest';
import { chapter3 } from '../src/content/chapter3';
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
  const g = new Game(chapter3);
  g.queue = [];
  return g;
}

/** Plays up to the checkpoint with Willow convinced and the juke learned. */
function toCheckpoint(g: Game) {
  g.set('pamSaved');
  g.give('soap');
  g.set('juke');
  g.set('willowWoke');
  g.goto('checkpoint', 20, 172);
  g.queue = [];
}

describe('chapter 3 walkthrough', () => {
  it('can be finished with a perfect score', () => {
    const g = newGame();
    run(g, 'look at sign');
    run(g, 'look at tv');
    walk(g, 90, 152);
    run(g, 'order coney');
    expect(g.has('coney')).toBe(true);
    walk(g, 170, 162);
    run(g, 'talk to rick');
    run(g, 'give coney to rick');
    expect(g.has('soap')).toBe(true);
    walk(g, 316, 170);
    expect(g.s.room).toBe('park');

    walk(g, 62, 168);
    run(g, 'talk to alicia');
    walk(g, 156, 152);
    run(g, 'get football');
    walk(g, 232, 170);
    run(g, 'talk to barry');
    run(g, 'give football to barry');
    expect(g.flag('juke')).toBe(true);
    walk(g, 316, 172);
    expect(g.s.room).toBe('zone');

    run(g, 'look at banner');
    run(g, 'chant vibes');
    walk(g, 150, 172);
    run(g, 'talk to willow');
    walk(g, 190, 172);
    run(g, 'talk to brayden');
    walk(g, 254, 152);
    run(g, 'scan qr code');
    walk(g, 150, 172);
    run(g, 'show phone to willow');
    expect(g.flag('willowWoke')).toBe(true);
    walk(g, 316, 172);
    expect(g.s.room).toBe('checkpoint');

    walk(g, 300, 172);
    expect(g.s.x).toBeLessThan(240);
    run(g, 'look at farkus');
    run(g, 'talk to farkus');
    run(g, 'juke');
    run(g, 'use soap on farkus');
    expect(g.flag('farkusGone')).toBe(true);
    walk(g, 316, 172);

    expect(g.s.over).toBe('won');
    expect(Object.keys(chapter3.points).filter((k) => !g.s.awarded.includes(k))).toEqual([]);
    expect(g.maxScore).toBe(100);
  });
});

describe('chapter 3 deaths', () => {
  const deaths: [string, (g: Game) => void, string][] = [
    ['ordering a six-way', (g) => { walk(g, 90, 152); g.command('order 6-way'); }, 'SIX WAYS TO DIE'],
    ['the streetcar after Pam has used her save', (g) => { g.set('pamSaved'); g.goto('park', 120, 172); walk(g, 120, 196); }, 'END OF THE LINE'],
    ['chanting the wrong slogan', (g) => { g.goto('zone', 150, 172); g.command('chant where is the beef'); }, 'CANCELED'],
    ['buying the $90 hoodie', (g) => { g.goto('zone', 190, 172); g.command('buy hoodie'); }, 'CANCELED'],
    ['a "Honk if you\'re single" sign', (g) => { g.goto('zone', 122, 172); g.command('get cardboard'); g.command('write sign'); }, 'CANCELED'],
    ['flirting with Willow', (g) => { g.goto('zone', 150, 172); g.command('flirt with willow'); }, 'CANCELED'],
    ['fighting Farkus', (g) => { toCheckpoint(g); walk(g, 232, 172); g.command('punch farkus'); }, 'SAY UNCLE'],
  ];
  for (const [name, play, title] of deaths) {
    it(`${name} kills Larry, and Kris can save him`, () => {
      const g = newGame();
      play(g);
      expect(g.s.over).toBe('dead');
      expect(g.queue.at(-1)?.title).toBe(title);
      expect(g.rescue()).toBe(true);
      expect(g.s.over).toBe(null);
    });
  }

  it('Pam saves you from the streetcar once', () => {
    const g = newGame();
    g.goto('park', 120, 172);
    walk(g, 120, 196);
    expect(g.s.over).toBe(null);
    expect(g.flag('pamSaved')).toBe(true);
  });
});

describe('chapter 3 gates', () => {
  it('Willow ignores you until you know the chant', () => {
    const g = newGame();
    g.goto('zone', 150, 172);
    expect(run(g, 'talk to willow')).toMatch(/tourist/);
    expect(g.flag('talkedWillow')).toBeFalsy();
  });

  it('Farkus blocks the exit until he is gone', () => {
    const g = newGame();
    toCheckpoint(g);
    walk(g, 316, 172);
    expect(g.s.room).toBe('checkpoint');
    expect(g.s.over).toBe(null);
  });

  it('soap does nothing while Farkus is standing', () => {
    const g = newGame();
    toCheckpoint(g);
    walk(g, 232, 172);
    run(g, 'use soap');
    expect(g.flag('farkusGone')).toBeFalsy();
  });

  it("won't leave without Willow", () => {
    const g = newGame();
    g.set('farkusGone');
    g.goto('checkpoint', 280, 172);
    walk(g, 316, 172);
    expect(g.s.over).toBe(null);
  });
});
