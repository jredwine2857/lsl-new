import type { Command } from './parser';
import type { Game } from './game';

export interface Rect { x: number; y: number; w: number; h: number }

export type Text = string | ((g: Game) => string);

/** Something Larry can look at, click on, or need to stand near. */
export interface Hotspot {
  id: string;
  names: string[];
  rect: Rect;
  look: Text;
  visible?: (g: Game) => boolean;
}

/** A floor area that fires when Larry's feet walk into it (exits, hazards). */
export interface Zone {
  id: string;
  rect: Rect;
  when?: (g: Game) => boolean;
  enter: (g: Game) => void;
}

export interface Room {
  id: string;
  title: string;
  /** Public rooms are where taking your clothes off gets you arrested. */
  public?: boolean;
  /** Where Larry's feet are allowed to go. */
  walk: Rect;
  blockers?: Rect[];
  hotspots: Hotspot[];
  zones: Zone[];
  describe: Text;
  draw: (ctx: CanvasRenderingContext2D, g: Game, t: number) => void;
  enter?: (g: Game) => void;
  /** Return true if the room handled the command. */
  handle?: (g: Game, cmd: Command) => boolean;
}

export interface Item {
  id: string;
  name: string;
  names: string[];
  look: Text;
}

export interface Content {
  title: string;
  chapter: string;
  startRoom: string;
  start: { x: number; y: number };
  startInventory: string[];
  startCash: number;
  startFlags?: Record<string, number | boolean | string>;
  /** A phone-a-friend that can undo deaths marked rescuable. */
  lifeline?: {
    item: string;
    max: number;
    label: string;
    rescue: (g: Game, used: number) => string;
  };
  rooms: Room[];
  items: Item[];
  /** Every scoreable event and its points; max score is the sum. */
  points: Record<string, number>;
  intro: string[];
  /** Commands no room claimed. Return true if handled. */
  handle?: (g: Game, cmd: Command) => boolean;
  hint: (g: Game) => string;
}

export type Facing = 'left' | 'right' | 'up' | 'down';

export interface State {
  room: string;
  x: number;
  y: number;
  facing: Facing;
  inv: string[];
  flags: Record<string, number | boolean | string>;
  score: number;
  awarded: string[];
  /** In cents. Larry's money is tracked to the penny, like his self-respect. */
  cash: number;
  moves: number;
  over: null | 'dead' | 'won';
}

export interface Message {
  text: string;
  title?: string;
  kind?: 'info' | 'death' | 'win';
  /** Deaths the lifeline can undo. */
  rescuable?: boolean;
}
