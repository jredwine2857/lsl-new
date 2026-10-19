import { describe, expect, it } from 'vitest';
import { chapter5 } from '../src/content/chapter5';
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
  const g = new Game(chapter5);
  g.queue = [];
  return g;
}

/** Puts Larry on the yacht with Jeffrey's invitation in hand. */
function invited(g: Game) {
  g.set('jumpedYacht');
  g.set('invited');
  g.goto('yacht', 240, 168);
  g.queue = [];
}

describe('chapter 5 walkthrough', () => {
  it('can be finished with a perfect score', () => {
    const g = newGame();
    run(g, 'look at banana');
    walk(g, 120, 168);
    run(g, 'talk to steve');
    run(g, 'pitch laffx');
    expect(g.has('invite')).toBe(false);
    walk(g, 190, 168);
    run(g, 'talk to curator');
    run(g, 'sell lubber to curator');
    expect(g.s.cash).toBeGreaterThan(500000000);
    walk(g, 120, 168);
    run(g, 'pitch laffx to steve');
    expect(g.has('invite')).toBe(true);
    walk(g, 250, 168);
    run(g, 'ask rick about chair');
    expect(g.has('chair')).toBe(true);
    walk(g, 316, 172);
    expect(g.s.room).toBe('ocean');

    run(g, 'look at cybertruck');
    walk(g, 316, 172);
    expect(g.s.room).toBe('yacht');

    walk(g, 136, 168);
    run(g, 'look at gates');
    run(g, 'jump');
    walk(g, 190, 168);
    run(g, 'talk to elon');
    walk(g, 40, 168);
    run(g, 'talk to hefner');
    walk(g, 250, 168);
    run(g, 'talk to jeffrey');
    expect(g.flag('invited')).toBe(true);
    run(g, 'say no thanks');
    expect(g.flag('elonAlly')).toBe(true);
    walk(g, 2, 172);
    expect(g.s.room).toBe('ocean');

    walk(g, 155, 168);
    run(g, 'ride cybertruck');
    expect(g.s.room).toBe('tower');
    walk(g, 140, 170);
    run(g, 'talk to gates');
    run(g, 'drop chair');
    run(g, 'challenge gates');
    run(g, 'jump');

    expect(g.s.over).toBe('won');
    expect(Object.keys(chapter5.points).filter((k) => !g.s.awarded.includes(k))).toEqual([]);
    expect(g.maxScore).toBe(100);
  });
});

describe('chapter 5 deaths', () => {
  const deaths: [string, (g: Game) => void, string][] = [
    ['eating the $6.2 million banana', (g) => { walk(g, 55, 152); g.command('eat banana'); }, 'BANANA REPUBLIC'],
    ['hitting on the curator', (g) => { walk(g, 190, 168); g.command('flirt with curator'); }, 'CANCELED'],
    ['Ocean Drive after Pam has used her save', (g) => { g.set('pamSaved'); g.goto('ocean', 100, 172); walk(g, 100, 196); }, "LAMBO'D"],
    ['going overboard after Pam has used her save', (g) => { g.set('pamSaved'); g.goto('yacht', 100, 172); walk(g, 100, 196); }, 'MAN OVERBOARD'],
    ['pressing the INSTALL NOW button', (g) => { g.goto('tower', 160, 170); g.command('press button'); }, 'PLEASE DO NOT TURN OFF YOUR PLANET'],
    ['pulling the plug yourself', (g) => { g.goto('tower', 240, 170); g.command('pull plug'); }, 'SHOCK VALUE'],
    ['charging Gates', (g) => { g.goto('tower', 140, 170); g.command('push gates'); }, 'LARRY HAS STOPPED WORKING'],
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

  it("going to Jeffrey's island is the end, and Kris can't save you", () => {
    const g = newGame();
    invited(g);
    g.command('say yes');
    expect(g.s.over).toBe('dead');
    expect(g.queue.at(-1)?.title).toBe('WRONG PARTY');
    expect(g.rescue()).toBe(false);
  });

  it('Pam pulls you out of the bay once', () => {
    const g = newGame();
    g.goto('yacht', 100, 172);
    walk(g, 100, 196);
    expect(g.s.over).toBe(null);
    expect(g.flag('pamSaved')).toBe(true);
  });
});

describe('chapter 5 gates', () => {
  it('Steve wants skin in the game first', () => {
    const g = newGame();
    walk(g, 120, 168);
    run(g, 'pitch laffx');
    expect(g.flag('pitched')).toBeFalsy();
  });

  it('the dock guard wants an invitation', () => {
    const g = newGame();
    g.goto('ocean', 290, 172);
    walk(g, 316, 172);
    expect(g.s.room).toBe('ocean');
  });

  it("the Cybertruck won't open until Elon is with you", () => {
    const g = newGame();
    g.goto('ocean', 155, 168);
    run(g, 'ride cybertruck');
    expect(g.s.room).toBe('ocean');
  });

  it('Jeffrey only invites you after the jump', () => {
    const g = newGame();
    g.goto('yacht', 250, 168);
    run(g, 'talk to jeffrey');
    expect(g.flag('invited')).toBeFalsy();
  });

  it("Gates won't jump without a chair", () => {
    const g = newGame();
    g.goto('tower', 140, 170);
    run(g, 'challenge gates');
    expect(g.flag('challenged')).toBeFalsy();
  });

  it('walking away also works as "walk away"', () => {
    const g = newGame();
    invited(g);
    run(g, 'walk away');
    expect(g.flag('walkedAway')).toBe(true);
  });
});
