import { describe, expect, it } from 'vitest';
import { chapter1 } from '../src/content/chapter1';
import { Game } from '../src/engine/game';
import { parse } from '../src/engine/parser';

/** Walk like a player would: set a target and tick until Larry stops. */
function walk(g: Game, x: number, y: number) {
  g.walkTo(x, y);
  for (let i = 0; i < 2000 && g.moving && !g.s.over; i++) {
    g.update(1 / 30);
    g.queue = []; // dismiss messages as they pop
  }
}

let strict = false;

function run(g: Game, cmd: string): string {
  g.queue = [];
  g.command(cmd);
  const out = g.queue.map((m) => m.text).join('\n');
  g.queue = [];
  if (strict && /not close enough|don't see that|can't do that/i.test(out)) throw new Error(`"${cmd}" failed: ${out}`);
  return out;
}

function newGame() {
  const g = new Game(chapter1);
  g.queue = [];
  return g;
}

describe('parser', () => {
  it('maps phrases and synonyms to canonical verbs', () => {
    expect(parse('pick up the box').verb).toBe('get');
    expect(parse('Pick up the box').about('box')).toBe(true);
    expect(parse('hit on bartender').verb).toBe('flirt');
    expect(parse('talk to the old couple').about('couple')).toBe(true);
    expect(parse('x mirror').verb).toBe('look');
    expect(parse("give King's Quest to Roberta").about('kings quest', 'roberta')).toBe(true);
    expect(parse('say Ken sent me').rest).toBe('ken sent me');
    expect(parse('i').verb).toBe('inventory');
  });
});

describe('chapter 1 walkthrough', () => {
  it('can be finished with a perfect score', () => {
    const g = newGame();
    strict = true;
    // back room
    run(g, 'look at mirror');
    run(g, 'read graffiti');
    walk(g, 140, 150);
    expect(run(g, 'get box')).toContain("King's Quest V");
    walk(g, 208, 172);
    run(g, 'get newspaper');
    run(g, 'read newspaper');
    walk(g, 280, 165);
    expect(run(g, 'knock on door')).toContain('Password');
    run(g, 'say ken sent me');
    expect(g.flag('doorOpen')).toBe(true);
    walk(g, 305, 170);
    expect(g.s.room).toBe('lounge');

    // lounge
    run(g, 'look tv');
    run(g, 'read chalkboard');
    walk(g, 200, 152);
    run(g, 'talk to bartender');
    run(g, 'get pin');
    run(g, 'wear pin');
    walk(g, 115, 150);
    expect(g.s.room).toBe('street');

    // street
    walk(g, 151, 172);
    run(g, 'talk to canvasser');
    run(g, 'ask about mansion');
    walk(g, 280, 168);
    run(g, 'talk to officer');
    run(g, 'show newspaper to officer');
    walk(g, 270, 156);
    expect(g.s.room).toBe('mall');

    // mall: sell the box to the couple
    walk(g, 160, 165);
    run(g, 'talk to couple');
    expect(run(g, 'give box to couple')).toContain('$1,000.00');
    expect(g.s.cash).toBe(100342);

    // Babbage's
    walk(g, 76, 126);
    expect(g.s.room).toBe('babbages');
    walk(g, 160, 135);
    run(g, 'talk to gus');
    run(g, 'ask gus about returns');
    walk(g, 250, 172);
    run(g, 'buy space quest');
    run(g, 'read space quest');
    expect(g.flag('hasIdea')).toBe(true);
    walk(g, 160, 199);
    expect(g.s.room).toBe('mall');

    // Pear Store
    walk(g, 246, 126);
    expect(g.s.room).toBe('pear');
    walk(g, 160, 150);
    run(g, 'talk to genius');
    run(g, 'buy phone');
    expect(g.has('phone')).toBe(true);
    walk(g, 160, 199);
    walk(g, 160, 199);
    expect(g.s.room).toBe('street');

    // back to LFTY for Wi-Fi
    walk(g, 53, 156);
    expect(g.s.room).toBe('lounge');
    run(g, 'use phone');
    expect(g.flag('phoneOnline')).toBe(true);
    run(g, 'swipe right');
    walk(g, 115, 150);
    expect(g.s.room).toBe('street');

    g.command('call robotaxi');
    expect(g.s.over).toBe('won');
    expect(Object.keys(chapter1.points).filter((k) => !g.s.awarded.includes(k))).toEqual([]);
    expect(g.s.score).toBe(g.maxScore);
    expect(g.maxScore).toBe(100);
    strict = false;
  });
});

describe('chapter 1 deaths', () => {
  it('drinking the hot tub water kills you', () => {
    const g = newGame();
    run(g, 'drink water');
    expect(g.s.over).toBe('dead');
    run(g, 'undo');
    expect(g.s.over).toBe(null);
  });

  it('wrong password keeps the door shut', () => {
    const g = newGame();
    walk(g, 280, 165);
    run(g, 'knock');
    run(g, 'say open sesame');
    expect(g.flag('doorOpen')).toBeFalsy();
  });

  it('Pam saves you from the street once, then you get run over', () => {
    const g = newGame();
    g.goto('street', 150, 165);
    walk(g, 150, 195);
    expect(g.s.over).toBe(null);
    expect(g.flag('pamSaved')).toBe(true);
    walk(g, 150, 195);
    expect(g.s.over).toBe('dead');
  });

  it('the PC Police stop you without visible allyship', () => {
    const g = newGame();
    g.goto('street', 270, 166);
    walk(g, 270, 156);
    expect(g.s.room).toBe('street');
  });

  it('hitting on the bartender gets you canceled', () => {
    const g = newGame();
    g.goto('lounge', 220, 152);
    run(g, 'hit on bartender');
    expect(g.s.over).toBe('dead');
  });

  it("returning the sealed King's Quest is a fatal mistake", () => {
    const g = newGame();
    g.give('kq5');
    g.goto('babbages', 160, 135);
    run(g, 'return box');
    expect(g.s.over).toBe('dead');
  });

  it('donating with a phone is death by subscription', () => {
    const g = newGame();
    g.give('phone');
    g.set('phoneOnline');
    g.goto('street', 151, 170);
    run(g, 'donate');
    expect(g.s.over).toBe('dead');
  });

  it('getting naked in public gets you busted', () => {
    const g = newGame();
    g.goto('mall', 100, 170);
    run(g, 'take off suit');
    expect(g.s.over).toBe('dead');
  });
});

describe('save and restore', () => {
  it('round-trips state', () => {
    const g = newGame();
    walk(g, 140, 150);
    run(g, 'get box');
    const saved = g.serialize();
    const h = newGame();
    h.load(saved);
    expect(h.has('kq5')).toBe(true);
    expect(h.s.score).toBe(g.s.score);
  });
});
