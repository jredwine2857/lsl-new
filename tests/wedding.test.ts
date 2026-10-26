import { describe, expect, it } from 'vitest';
import { chapter1 } from '../src/content/chapter1';
import { chapter2 } from '../src/content/chapter2';
import { chapter3 } from '../src/content/chapter3';
import { chapter4 } from '../src/content/chapter4';
import { chapter5 } from '../src/content/chapter5';
import { chapter6 } from '../src/content/chapter6';
import { WATCH_SPOTS } from '../src/content/watcher';
import { Game } from '../src/engine/game';

describe('the wedding', () => {
  it('plays right after the proposal, and a click skips one scene at a time', () => {
    const g = new Game(chapter6);
    g.cutscene('proposal');
    g.cutscene('wedding');
    expect(g.scene?.name).toBe('proposal');
    g.skipScene();
    expect(g.scene?.name).toBe('wedding');
    g.update(chapter6.scenes!.wedding.duration + 1);
    expect(g.scene).toBeNull();
  });

  it('is in the epilogue, with Trump officiating and Elon as best man', () => {
    const src = String(chapter6.rooms.map((r) => r.handle).join('\n'));
    expect(src).toMatch(/Donald Trump officiates/);
    expect(src).toMatch(/Elon is best man/);
  });
});

describe('the man in the red cap', () => {
  const chapters = [chapter1, chapter2, chapter3, chapter4, chapter5];
  for (const c of chapters) {
    it(`peeks at Larry somewhere in ${c.chapter.split(':')[0]}`, () => {
      const rooms = c.rooms.filter((r) => r.hotspots.some((h) => h.id === 'watcher'));
      expect(rooms).toHaveLength(1);
      const h = rooms[0].hotspots.find((x) => x.id === 'watcher')!;
      expect(Object.values(WATCH_SPOTS)).toContainEqual(expect.objectContaining({ clip: h.rect }));
    });
  }
});
