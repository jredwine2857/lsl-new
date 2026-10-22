import { describe, expect, it } from 'vitest';
import { LOUNGE, POLYESTER, ROOM3 } from '../src/content/music';
import { parseTrack } from '../src/engine/sound';

describe('music', () => {
  for (const [name, song] of Object.entries({ POLYESTER, LOUNGE, ROOM3 })) {
    it(`${name} tracks are whole bars that loop evenly`, () => {
      const lens = Object.values(song.tracks).map((t) => parseTrack(t!).steps);
      const loop = Math.max(...lens);
      for (const n of lens) {
        expect(n % 16).toBe(0);
        expect(loop % n).toBe(0);
      }
    });
  }
});
