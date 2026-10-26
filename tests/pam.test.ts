import { describe, expect, it } from 'vitest';
import { chapter1 } from '../src/content/chapter1';
import { chapter2 } from '../src/content/chapter2';
import { chapter3 } from '../src/content/chapter3';
import { chapter4 } from '../src/content/chapter4';
import { chapter5 } from '../src/content/chapter5';
import { chapter6 } from '../src/content/chapter6';
import { Game } from '../src/engine/game';

describe("Pam's rescue", () => {
  for (const c of [chapter1, chapter2, chapter3, chapter4, chapter5, chapter6]) {
    it(`plays the slow-motion beach run in ${c.chapter.split(':')[0]}`, () => {
      const g = new Game(c);
      // the first hazard zone in the game that Pam saves you from
      const room = c.rooms.find((r) => r.zones.some((z) => String(z.enter).includes('pamSave')))!;
      const zone = room.zones.find((z) => String(z.enter).includes('pamSave'))!;
      g.goto(room.id, zone.rect.x + zone.rect.w / 2, zone.rect.y - 10);
      g.queue = [];
      zone.enter(g);
      expect(g.flag('pamSaved')).toBe(true);
      expect(g.scene?.name).toBe('pam');
      expect(g.queue.at(-1)?.title).toBe('PAM TO THE RESCUE');
    });
  }
});
