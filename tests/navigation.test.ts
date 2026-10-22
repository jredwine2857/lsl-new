import { describe, expect, it } from 'vitest';
import { chapter1 } from '../src/content/chapter1';
import { chapter2 } from '../src/content/chapter2';
import { chapter3 } from '../src/content/chapter3';
import { chapter4 } from '../src/content/chapter4';
import { chapter5 } from '../src/content/chapter5';
import { chapter6 } from '../src/content/chapter6';
import { Game, inRect } from '../src/engine/game';

// Walk from the middle of every room into every exit and hazard, dismissing
// messages the way a player would, and check Larry always comes to rest.
describe('walking between rooms', () => {
  for (const c of [chapter1, chapter2, chapter3, chapter4, chapter5, chapter6]) {
    for (const room of c.rooms) {
      for (const z of room.zones) {
        it(`${c.chapter.split(':')[0]}: ${room.id} → ${z.id} settles`, () => {
          const g = new Game(c);
          g.set('pamSaved');
          const w = room.walk;
          g.goto(room.id, w.x + w.w / 2, w.y + w.h / 2);
          g.queue = [];
          g.walkTo(z.rect.x + z.rect.w / 2, z.rect.y + z.rect.h / 2);
          let messages = 0;
          for (let i = 0; i < 3000 && g.moving && !g.s.over; i++) {
            g.update(1 / 30);
            messages += g.queue.length;
            g.queue = [];
          }
          expect(g.moving).toBe(false);
          expect(messages).toBeLessThanOrEqual(1);
          const here = g.roomById(g.s.room)!;
          expect(inRect(here.walk, g.s.x, g.s.y)).toBe(true);
          // Arriving in a new room never drops Larry inside one of its exits.
          if (here !== room) expect(here.zones.filter((q) => inRect(q.rect, g.s.x, g.s.y))).toEqual([]);
        });
      }
    }
  }
});
