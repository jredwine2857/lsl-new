import { describe, expect, it } from 'vitest';
import { chapter4 } from '../src/content/chapter4';
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
  const g = new Game(chapter4);
  g.queue = [];
  return g;
}

describe('chapter 4 walkthrough', () => {
  it('can be finished with a perfect score', () => {
    const g = newGame();
    run(g, 'look at rv');
    walk(g, 120, 170);
    run(g, 'talk to ben');
    expect(g.has('dunkin')).toBe(true);
    walk(g, 30, 170);
    walk(g, 2, 170);
    expect(g.s.room).toBe('street');
    walk(g, 40, 168);
    run(g, 'talk to cousin');
    run(g, 'say kris sent me');
    walk(g, 2, 170);
    expect(g.s.room).toBe('yard');

    walk(g, 60, 168);
    run(g, 'talk to snoop');
    walk(g, 140, 152);
    run(g, 'talk to dre');
    walk(g, 200, 168);
    run(g, 'talk to sandler');
    walk(g, 250, 172);
    run(g, 'battle');
    run(g, 'rap about my suit');
    run(g, 'rap about karaoke');
    run(g, 'rap about maricel');
    expect(g.flag('wonBattle')).toBe(true);
    expect(g.has('tickets')).toBe(true);
    walk(g, 316, 172);
    expect(g.s.room).toBe('street');
    walk(g, 316, 172);
    expect(g.s.room).toBe('arena');

    run(g, 'look at jumbotron');
    walk(g, 110, 170);
    run(g, 'talk to barkley');
    run(g, 'kiss barkley');
    walk(g, 170, 170);
    run(g, 'talk to jordan');
    run(g, 'call snoop');
    expect(g.has('footage')).toBe(true);
    walk(g, 240, 170);
    run(g, 'talk to rick');
    expect(g.has('doorbell')).toBe(true);
    walk(g, 316, 174);
    expect(g.s.room).toBe('studio');

    walk(g, 140, 170);
    run(g, 'talk to drew');
    run(g, 'show footage to drew');
    run(g, 'show doorbell video');

    expect(g.s.over).toBe('won');
    expect(Object.keys(chapter4.points).filter((k) => !g.s.awarded.includes(k))).toEqual([]);
    expect(g.maxScore).toBe(100);
  });
});

describe('chapter 4 deaths', () => {
  const toBattle = (g: Game) => { g.set('inList'); g.goto('yard', 250, 172); g.command('battle'); };
  const deaths: [string, (g: Game) => void, string][] = [
    ['answering the wrong diss', (g) => { toBattle(g); g.command('rap about cheese'); }, 'BOOED OFF'],
    ['skipping round two', (g) => { toBattle(g); g.command('rap about polyester'); g.command('rap about polyester'); }, 'BOOED OFF'],
    ["chugging Snoop's cup", (g) => { g.goto('yard', 60, 168); g.command('drink gin and juice'); }, 'GIN, NO JUICE'],
    ['hitting on the influencer', (g) => { g.goto('yard', 290, 168); g.command('flirt with kaydence'); }, 'CANCELED'],
    ['kissing a stranger on the kiss cam', (g) => { g.goto('arena', 270, 170); g.command('kiss woman'); }, 'CANCELED'],
    ['fighting Affleck', (g) => { g.goto('studio', 200, 170); g.command('punch ben'); }, 'BATFLECKED'],
    ['hitting on Drew', (g) => { g.goto('studio', 140, 170); g.command('flirt with drew'); }, 'CANCELED'],
    ['Ocean Boulevard after Pam has used her save', (g) => { g.set('pamSaved'); walk(g, 200, 196); }, 'LOW AND SLOW'],
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

  it('Pam saves you from Ocean Boulevard once', () => {
    const g = newGame();
    walk(g, 200, 196);
    expect(g.s.over).toBe(null);
    expect(g.flag('pamSaved')).toBe(true);
  });
});

describe('chapter 4 gates', () => {
  it('the cousin turns you away without the password', () => {
    const g = newGame();
    walk(g, 2, 170);
    expect(g.s.room).toBe('street');
  });

  it('the bus waits until you have won the battle', () => {
    const g = newGame();
    walk(g, 316, 172);
    expect(g.s.room).toBe('street');
  });

  it('Drew\'s producer wants both receipts', () => {
    const g = newGame();
    g.give('footage');
    g.goto('arena', 290, 174);
    walk(g, 316, 174);
    expect(g.s.room).toBe('arena');
  });

  it('Rick only remembers the doorbell after the kiss cam', () => {
    const g = newGame();
    g.goto('arena', 240, 170);
    run(g, 'talk to rick');
    expect(g.has('doorbell')).toBe(false);
  });

  it('winning the battle pays seed money', () => {
    const g = newGame();
    const before = g.s.cash;
    g.set('inList');
    g.goto('yard', 250, 172);
    run(g, 'battle');
    run(g, 'rap about suit');
    run(g, 'rap about philippines');
    run(g, 'rap about listening');
    expect(g.s.cash - before).toBe(1000000);
  });
});
