// Pamela Anderson pops up out of nowhere, once per chapter, to save Larry
// from his first brush with death. Larry is smitten every time.

import type { Game } from '../engine/game';

/** Saves Larry the first time per chapter. Returns false once she's used up. */
export function pamSave(g: Game, text: string, back: { x: number; y: number }): boolean {
  if (g.flag('pamSaved')) return false;
  g.set('pamSaved');
  g.stop();
  g.s.x = back.x;
  g.s.y = back.y;
  g.sfx('whoosh');
  g.say(text, 'PAM TO THE RESCUE');
  return true;
}
