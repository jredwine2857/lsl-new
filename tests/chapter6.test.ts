import { describe, expect, it } from 'vitest';
import { chapter6 } from '../src/content/chapter6';
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
  const g = new Game(chapter6);
  g.queue = [];
  return g;
}

describe('chapter 6 walkthrough', () => {
  it('can be finished with a perfect score and the one ending', () => {
    const g = newGame();
    run(g, 'call maricel');
    walk(g, 120, 172);
    run(g, 'look at grace');
    run(g, 'talk to grace');
    walk(g, 175, 160);
    run(g, 'listen to engine');
    expect(g.flag('engineFixed')).toBe(true);
    walk(g, 125, 172);
    run(g, 'ask grace about music');
    walk(g, 250, 172);
    run(g, 'talk to tom');
    walk(g, 45, 160);
    run(g, 'get chili');
    walk(g, 120, 172);
    run(g, 'give chili to grace');
    expect(g.flag('invited')).toBe(true);
    walk(g, 316, 172);
    expect(g.s.room).toBe('norae');

    run(g, 'bow');
    walk(g, 100, 174);
    run(g, 'talk to dad');
    run(g, 'sing islands in the stream');
    expect(g.flag('duet')).toBe(true);
    walk(g, 150, 174);
    run(g, 'talk to mom');
    expect(g.has('ring')).toBe(true);
    walk(g, 2, 174);
    expect(g.s.room).toBe('hangar');
    walk(g, 2, 172);
    expect(g.s.room).toBe('control');

    walk(g, 40, 172);
    run(g, 'talk to kris');
    walk(g, 80, 172);
    run(g, 'talk to snoop');
    walk(g, 180, 172);
    run(g, 'talk to spacey');
    run(g, 'refuse');
    expect(g.flag('refusedSpacey')).toBe(true);
    walk(g, 316, 172);
    expect(g.s.room).toBe('pad');

    run(g, 'talk to tom');
    run(g, 'listen');
    expect(g.flag('cruiseDown')).toBe(true);
    walk(g, 2, 172);
    expect(g.s.room).toBe('control');
    walk(g, 208, 172);
    run(g, 'press launch button');
    expect(g.flag('launched')).toBe(true);
    walk(g, 240, 172);
    run(g, 'propose');

    expect(g.s.over).toBe('won');
    expect(Object.keys(chapter6.points).filter((k) => !g.s.awarded.includes(k))).toEqual([]);
    expect(g.maxScore).toBe(100);
    expect(g.s.score).toBe(100);
  });
});

describe('chapter 6 deaths', () => {
  const deaths: [string, (g: Game) => void, string][] = [
    ['test-firing the engine', (g) => { walk(g, 175, 160); g.command('start engine'); }, 'TEST FIRE'],
    ['hitting on Grace at work', (g) => { walk(g, 120, 172); g.command('flirt with grace'); }, 'GROUNDED FOR GOOD'],
    ['singing "My Way"', (g) => { g.set('bowed'); g.goto('norae', 150, 174); g.command('sing my way'); }, 'WRONG SONG'],
    ['singing the wrong duet', (g) => { g.set('bowed'); g.goto('norae', 150, 174); g.command('sing sweet caroline'); }, 'WRONG SONG'],
    ['flirting in front of her parents', (g) => { g.goto('norae', 220, 174); g.command('flirt with grace'); }, 'NOT IN FRONT OF THE PARENTS'],
    ['climbing after Tom', (g) => { g.goto('pad', 160, 174); g.command('climb rocket'); }, 'STUNT DOUBLE'],
    ['the flame trench after Pam has used her save', (g) => { g.set('pamSaved'); g.goto('pad', 100, 172); walk(g, 100, 198); }, 'SCRUBBED'],
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

  it("signing the gray man's contract is the end, and Kris can't save you", () => {
    const g = newGame();
    g.goto('control', 180, 172);
    run(g, 'talk to spacey');
    g.command('sign contract');
    expect(g.s.over).toBe('dead');
    expect(g.queue.at(-1)?.title).toBe('CONGRESSIONAL HEARING');
    expect(g.rescue()).toBe(false);
  });

  it('Pam catches you at the flame trench once', () => {
    const g = newGame();
    g.goto('pad', 100, 172);
    walk(g, 100, 198);
    expect(g.s.over).toBe(null);
    expect(g.flag('pamSaved')).toBe(true);
  });
});

describe('chapter 6 gates', () => {
  it('the engine needs Grace to explain it first', () => {
    const g = newGame();
    walk(g, 175, 160);
    run(g, 'listen to engine');
    expect(g.flag('engineFixed')).toBeFalsy();
  });

  it('the jet waits for an invitation, and Mission Control waits for the duet', () => {
    const g = newGame();
    walk(g, 316, 172);
    expect(g.s.room).toBe('hangar');
    walk(g, 2, 172);
    expect(g.s.room).toBe('hangar');
  });

  it("you can't sing before greeting her parents", () => {
    const g = newGame();
    g.goto('norae', 150, 174);
    run(g, 'sing islands in the stream');
    expect(g.flag('duet')).toBeFalsy();
  });

  it('launch waits for the engine, Tom and the gray man', () => {
    const g = newGame();
    g.goto('control', 208, 172);
    run(g, 'press button');
    g.set('engineFixed');
    run(g, 'press button');
    g.set('cruiseDown');
    run(g, 'press button');
    expect(g.flag('launched')).toBeFalsy();
    g.set('refusedSpacey');
    run(g, 'press button');
    expect(g.flag('launched')).toBe(true);
  });

  it("Grace won't hear a proposal until the booster lands", () => {
    const g = newGame();
    g.give('ring');
    g.goto('control', 240, 172);
    run(g, 'propose');
    expect(g.s.over).toBe(null);
  });
});
