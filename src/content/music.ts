// Original tunes in the style of 1970s disco and lounge, for Larry to strut
// to. See src/engine/sound.ts for the notation: each token is a note and its
// length in sixteenths, "r" is a rest, "x" is a drum hit, "|" is a bar line.

import type { Song } from '../engine/sound';

const DM7 = 'F4+A4+C5';
const G7 = 'F4+B4+D5';
const CMAJ7 = 'E4+G4+B4';
const A7 = 'E4+G4+C#5';
const EM7 = 'D4+G4+B4';
const stab = (c: string) => `r:2 ${c}:2 r:4 r:2 ${c}:2 r:2 ${c}:2`;
const halves = (a: string, b: string) => `r:2 ${a}:2 r:2 ${a}:2 r:2 ${b}:2 r:2 ${b}:2`;
const oct = (lo: string, hi: string, n = 4) => Array(n).fill(`${lo}:2 ${hi}:2`).join(' ');

/** "Polyester Groove": the main theme. Octave-jumping bass, four on the floor. */
export const POLYESTER: Song = {
  bpm: 116,
  tracks: {
    kick: 'x:4 x:4 x:4 x:4',
    clap: 'r:4 x:4 r:4 x:4',
    ohat: 'r:2 x:2 r:2 x:2 r:2 x:2 r:2 x:2',
    hat: 'x:1 r:1 r:2 x:1 r:1 r:2 x:1 r:1 r:2 x:1 r:1 x:1 x:1',
    bass: [
      oct('D2', 'D3'), oct('G1', 'G2'), oct('C2', 'C3'), oct('A1', 'A2'),
      oct('D2', 'D3'), oct('G1', 'G2'), `${oct('E2', 'E3', 2)} ${oct('A1', 'A2', 2)}`, `${oct('D2', 'D3', 2)} ${oct('G1', 'G2', 2)}`,
    ].join(' | '),
    ep: [stab(DM7), stab(G7), stab(CMAJ7), stab(A7), stab(DM7), stab(G7), halves(EM7, A7), halves(DM7, G7)].join(' | '),
    strings: [
      'D4+F4+A4+C5:16', 'B3+D4+F4+G4:16', 'C4+E4+G4+B4:16', 'C#4+E4+G4+A4:16',
      'D4+F4+A4+C5:16', 'B3+D4+F4+G4:16', 'E4+G4+B4+D5:8 C#4+E4+G4+A4:8', 'D4+F4+A4+C5:8 B3+D4+F4+G4:8',
    ].join(' | '),
    brass: 'r:28 F4+B4+D5:2 F4+B4+D5:2 | r:28 E4+G4+C#5:2 E4+G4+C#5:2 | r:28 F4+B4+D5:2 F4+B4+D5:2 | r:28 F4+B4+D5:2 G4+B4+D5:2',
    lead: [
      'r:128',
      'A4:3 C5:3 D5:2 r:2 C5:2 A4:2 G4:2', 'F4:4 G4:2 r:2 B4:6 r:2', 'C5:2 E5:2 G5:4 E5:2 D5:2 C5:4', 'C#5:6 E5:2 r:2 A4:6',
      'A4:3 C5:3 D5:2 r:2 F5:2 E5:2 D5:2', 'B4:4 D5:2 r:2 F5:6 r:2', 'E5:2 D5:2 B4:4 C#5:2 E5:2 G5:4', 'F5:6 E5:2 D5:4 B4:4',
    ].join(' | '),
  },
};

/** "Lounge Lizard": swinging vibes and a walking bass, for bars and boats. */
export const LOUNGE: Song = {
  bpm: 96,
  swing: 0.3,
  tracks: {
    kick: 'x:8 x:8',
    hat: 'x:2 x:2 x:2 x:2 x:2 x:2 x:2 x:2',
    snare: 'r:12 x:4',
    bass: 'F2:4 A2:4 C3:4 E3:4 | E2:4 G2:4 B2:4 D3:4 | D2:4 F2:4 A2:4 C3:4 | G2:4 B2:4 D3:4 F3:4',
    ep: [
      'r:2 A3+C4+E4:4 r:2 A3+C4+E4:4 r:4', 'r:2 G3+B3+D4:4 r:2 G3+B3+D4:4 r:4',
      'r:2 F3+A3+C4:4 r:2 F3+A3+C4:4 r:4', 'r:2 F3+B3+D4:4 r:2 F3+B3+D4:4 r:4',
    ].join(' | '),
    bell: [
      'A5:4 G5:2 F5:2 E5:8', 'D5:4 E5:2 G5:2 B5:8', 'A5:2 F5:2 D5:4 C5:8', 'B4:4 D5:4 F5:8',
      'r:64',
    ].join(' | '),
  },
};

/** "Room 3": a slow karaoke ballad for the Cho family noraebang. */
export const ROOM3: Song = {
  bpm: 72,
  tracks: {
    kick: 'x:8 r:8',
    snare: 'r:8 x:8',
    hat: 'x:4 x:4 x:4 x:4',
    bass: 'C2:8 G2:8 | A1:8 E2:8 | F1:8 C2:8 | G1:8 D2:8',
    ep: [
      'C4:2 E4:2 G4:2 C5:2 G4:2 E4:2 G4:2 E4:2', 'A3:2 C4:2 E4:2 A4:2 E4:2 C4:2 E4:2 C4:2',
      'F3:2 A3:2 C4:2 F4:2 C4:2 A3:2 C4:2 A3:2', 'G3:2 B3:2 D4:2 G4:2 D4:2 B3:2 D4:2 B3:2',
    ].join(' | '),
    strings: 'C4+E4+G4:16 | A3+C4+E4:16 | F3+A3+C4:16 | G3+B3+D4:16',
    lead: [
      'E5:6 D5:2 C5:4 G4:4', 'A4:6 C5:2 E5:8', 'F5:6 E5:2 D5:4 C5:4', 'D5:12 r:4',
      'E5:6 G5:2 E5:4 C5:4', 'A4:4 C5:4 E5:8', 'F5:4 A5:4 G5:4 F5:4', 'E5:12 r:4',
    ].join(' | '),
  },
};

const LOUNGE_ROOMS = new Set(['lounge', 'theme', 'yacht', 'basel']);

/** Which tune plays in a room. */
export function songFor(roomId: string): Song {
  if (roomId === 'norae') return ROOM3;
  if (LOUNGE_ROOMS.has(roomId)) return LOUNGE;
  return POLYESTER;
}
