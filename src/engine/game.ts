import { parse, type Command } from './parser';
import type { Content, Hotspot, Item, Message, Rect, Room, State, Text } from './types';

const SPEED = 46; // logical pixels per second

export const inRect = (r: Rect, x: number, y: number) =>
  x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

export function money(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString('en-US');
  return `${sign}$${dollars}.${String(abs % 100).padStart(2, '0')}`;
}

/**
 * All game rules live here, with no DOM: the browser UI and the tests drive
 * the same object. Rooms and items come from a Content bundle.
 */
export class Game {
  s: State;
  readonly content: Content;
  readonly maxScore: number;
  queue: Message[] = [];
  /** Where a click asked Larry to walk to. */
  target: { x: number; y: number } | null = null;
  /** Arrow-key walking direction (AGI style: press again to stop). */
  dir: { dx: number; dy: number } | null = null;
  walkFrame = 0;
  private rooms = new Map<string, Room>();
  private items = new Map<string, Item>();
  private inZones = new Set<string>();
  private undoSnap: string | null = null;
  /** Called after each scored event, so the UI can beep. */
  onScore?: (points: number) => void;

  constructor(content: Content) {
    this.content = content;
    for (const r of content.rooms) this.rooms.set(r.id, r);
    for (const i of content.items) this.items.set(i.id, i);
    this.maxScore = Object.values(content.points).reduce((a, b) => a + b, 0);
    this.s = this.fresh();
    this.syncZones();
    // So Undo and the lifeline work even if Larry dies before typing anything.
    this.snapshot();
  }

  private fresh(): State {
    const c = this.content;
    return {
      room: c.startRoom,
      x: c.start.x,
      y: c.start.y,
      facing: 'down',
      inv: [...c.startInventory],
      flags: { ...(c.startFlags ?? {}) },
      score: 0,
      awarded: [],
      cash: c.startCash,
      moves: 0,
      over: null,
    };
  }

  get room(): Room {
    const r = this.rooms.get(this.s.room);
    if (!r) throw new Error(`Unknown room ${this.s.room}`);
    return r;
  }

  roomById(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  item(id: string): Item | undefined {
    return this.items.get(id);
  }

  text(t: Text): string {
    return typeof t === 'function' ? t(this) : t;
  }

  // ---- messages & outcomes ----

  say(text: string, title?: string) {
    this.queue.push({ text, title, kind: 'info' });
  }

  die(text: string, title = 'CANCELED', rescuable = false) {
    if (this.s.over) return;
    this.stop();
    this.s.over = 'dead';
    this.queue.push({ text, title, kind: 'death', rescuable });
  }

  /** Lifeline calls left, or 0 when Larry can't use the lifeline right now. */
  lifelinesLeft(): number {
    const l = this.content.lifeline;
    if (!l || !this.has(l.item)) return 0;
    return Math.max(0, l.max - Number(this.flag('lifelineUsed') ?? 0));
  }

  /** Undo a rescuable death by calling the lifeline. Returns false if it can't. */
  rescue(): boolean {
    const l = this.content.lifeline;
    const death = this.queue.find((m) => m.kind === 'death');
    if (!l || !death?.rescuable || !this.undoSnap) return false;
    // Check the lifeline against the pre-death state, which is what we restore.
    const used = Number(this.flag('lifelineUsed') ?? 0);
    if (this.lifelinesLeft() <= 0) return false;
    this.load(this.undoSnap);
    this.set('lifelineUsed', used + 1);
    this.say(l.rescue(this, used + 1), l.label);
    return true;
  }

  win(text: string, title = 'CHAPTER COMPLETE') {
    if (this.s.over) return;
    this.stop();
    this.s.over = 'won';
    this.queue.push({ text, title, kind: 'win' });
  }

  award(key: string) {
    const pts = this.content.points[key];
    if (pts === undefined) throw new Error(`No points entry for ${key}`);
    if (this.s.awarded.includes(key)) return;
    this.s.awarded.push(key);
    this.s.score += pts;
    this.onScore?.(pts);
  }

  // ---- inventory, flags, money ----

  has(id: string) { return this.s.inv.includes(id); }
  give(id: string) { if (!this.has(id)) this.s.inv.push(id); }
  drop(id: string) { this.s.inv = this.s.inv.filter((i) => i !== id); }
  flag(k: string) { return this.s.flags[k]; }
  set(k: string, v: number | boolean | string = true) { this.s.flags[k] = v; }
  /** Increments a counter flag and returns the value before incrementing. */
  bump(k: string): number {
    const n = Number(this.s.flags[k] ?? 0);
    this.s.flags[k] = n + 1;
    return n;
  }

  // ---- space ----

  visibleHotspots(): Hotspot[] {
    return this.room.hotspots.filter((h) => !h.visible || h.visible(this));
  }

  hotspot(id: string): Hotspot | undefined {
    return this.room.hotspots.find((h) => h.id === id);
  }

  distTo(id: string): number {
    const h = this.hotspot(id);
    if (!h) return Infinity;
    const { x, y, w, h: hh } = h.rect;
    const dx = Math.max(x - this.s.x, 0, this.s.x - (x + w));
    // Hotspots are often on walls; measure to their base line, not the art.
    const dy = Math.max(y - this.s.y, 0, this.s.y - (y + hh));
    return Math.hypot(dx, dy);
  }

  near(id: string, dist = 28) {
    return this.distTo(id) <= dist;
  }

  /** Says the classic Sierra line and returns false when Larry is too far. */
  needNear(id: string, dist = 28): boolean {
    if (this.near(id, dist)) return true;
    this.say("You're not close enough.");
    return false;
  }

  goto(roomId: string, x: number, y: number) {
    if (!this.rooms.has(roomId)) throw new Error(`Unknown room ${roomId}`);
    this.stop();
    this.s.room = roomId;
    this.s.x = x;
    this.s.y = y;
    this.syncZones();
    this.snapshot();
    this.room.enter?.(this);
    const seen = `seen:${roomId}`;
    if (!this.flag(seen)) {
      this.set(seen);
      this.say(this.text(this.room.describe), this.room.title);
    }
  }

  private syncZones() {
    this.inZones.clear();
    for (const z of this.room.zones) if (inRect(z.rect, this.s.x, this.s.y)) this.inZones.add(z.id);
  }

  // ---- movement ----

  stop() {
    this.target = null;
    this.dir = null;
  }

  walkTo(x: number, y: number) {
    const w = this.room.walk;
    this.dir = null;
    this.target = {
      x: Math.max(w.x, Math.min(w.x + w.w - 1, x)),
      y: Math.max(w.y, Math.min(w.y + w.h - 1, y)),
    };
  }

  toggleDir(dx: number, dy: number) {
    this.target = null;
    if (this.dir && this.dir.dx === dx && this.dir.dy === dy) this.dir = null;
    else this.dir = { dx, dy };
  }

  get moving() { return !!(this.target || this.dir); }

  /** Advance the world by dt seconds. Paused while a message is showing. */
  update(dt: number) {
    if (this.queue.length || this.s.over) return;
    let vx = 0;
    let vy = 0;
    if (this.target) {
      const dx = this.target.x - this.s.x;
      const dy = this.target.y - this.s.y;
      const d = Math.hypot(dx, dy);
      if (d < 1) { this.target = null; return; }
      const step = Math.min(d, SPEED * dt);
      vx = (dx / d) * step;
      vy = (dy / d) * step;
    } else if (this.dir) {
      vx = this.dir.dx * SPEED * dt;
      vy = this.dir.dy * SPEED * dt * 0.7;
    } else {
      return;
    }

    const nx = this.s.x + vx;
    const ny = this.s.y + vy;
    const w = this.room.walk;
    const blocked = (x: number, y: number) =>
      !inRect(w, x, y) || (this.room.blockers ?? []).some((b) => inRect(b, x, y));

    let moved = false;
    if (!blocked(nx, ny)) { this.s.x = nx; this.s.y = ny; moved = true; }
    else if (!blocked(nx, this.s.y)) { this.s.x = nx; moved = true; }
    else if (!blocked(this.s.x, ny)) { this.s.y = ny; moved = true; }
    if (!moved) { this.stop(); return; }

    this.s.facing = Math.abs(vx) >= Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : vy < 0 ? 'up' : 'down';
    this.walkFrame += dt * 6;
    this.checkZones();
  }

  private checkZones() {
    const room = this.room;
    for (const z of room.zones) {
      const inside = inRect(z.rect, this.s.x, this.s.y);
      if (inside && !this.inZones.has(z.id)) {
        this.inZones.add(z.id);
        if (!z.when || z.when(this)) {
          z.enter(this);
          // An exit may have moved us to another room; stop processing this one.
          if (this.room !== room || this.s.over) return;
        }
      } else if (!inside) {
        this.inZones.delete(z.id);
      }
    }
  }

  // ---- commands ----

  command(input: string) {
    const cmd = parse(input);
    if (!cmd.verb) return;
    if (this.s.over && !['restart', 'restore', 'undo', 'help'].includes(cmd.verb)) {
      this.say('It\'s over, Larry. Type RESTART, RESTORE or UNDO.');
      return;
    }
    if (!['undo', 'save', 'restore', 'restart', 'score', 'inventory', 'help', 'hint'].includes(cmd.verb)) {
      this.snapshot();
      this.s.moves++;
    }
    if (this.meta(cmd)) return;
    if (this.room.handle?.(this, cmd)) return;
    if (this.content.handle?.(this, cmd)) return;
    if (this.fallback(cmd)) return;
    this.say(this.confused(cmd));
  }

  private meta(cmd: Command): boolean {
    switch (cmd.verb) {
      case 'inventory': {
        const names = this.s.inv.map((i) => this.item(i)?.name ?? i);
        this.say(
          `You are carrying:\n${names.length ? names.map((n) => `  ${n}`).join('\n') : '  Nothing. Not even dignity.'}\n\nCash: ${money(this.s.cash)}`,
          'Inventory',
        );
        return true;
      }
      case 'score':
        this.say(`Your score is ${this.s.score} of ${this.maxScore}, after ${this.s.moves} moves.`);
        return true;
      case 'undo':
        if (this.undoSnap) {
          this.load(this.undoSnap);
          this.say('Oops. Let\'s pretend that never happened. Larry does it all the time.');
        } else this.say('Nothing to undo.');
        return true;
      case 'hint':
        this.say(this.content.hint(this), 'Hint');
        return true;
      default:
        return false;
    }
  }

  /** Generic responses for anything rooms and content didn't claim. */
  private fallback(cmd: Command): boolean {
    const v = cmd.verb;
    if (v === 'look' || v === 'read') {
      if (cmd.words.length === 0 || cmd.about('room', 'around', 'here')) {
        this.say(this.text(this.room.describe), this.room.title);
        return true;
      }
      const item = this.findItem(cmd);
      if (item) { this.say(this.text(item.look)); return true; }
      const h = this.findHotspot(cmd);
      if (h) { this.say(this.text(h.look)); return true; }
      if (cmd.about('larry', 'me', 'self', 'myself', 'suit')) {
        this.say('Larry Laffer. Pushing seventy, still pushing polyester. The leisure suit has outlived three presidents, two Blockbusters and every one of your relationships.');
        return true;
      }
      this.say("You don't see that here.");
      return true;
    }
    if (v === 'get') {
      if (this.findItem(cmd)) { this.say('You already have it. Hoarding is a 1992 personality trait.'); return true; }
      if (this.findHotspot(cmd)) { this.say("You can't take that. This isn't a 'fake return,' Larry."); return true; }
      this.say("You don't see that here.");
      return true;
    }
    if (v === 'talk' || v === 'ask') {
      this.say(cmd.words.length ? "It doesn't respond. Story of your love life." : 'You mutter to yourself. Somebody films it.');
      return true;
    }
    if (v === 'go') {
      this.say('Use the arrow keys or click where you want Larry to walk.');
      return true;
    }
    if (v === 'help') {
      this.say(
        'Walk with the ARROW KEYS (press again to stop) or CLICK where you want to go.\n\n' +
          'Type commands like:  LOOK, LOOK AT BOX, GET NEWSPAPER, TALK TO MAN, GIVE BOX TO WOMAN, WEAR PIN, KNOCK ON DOOR, SAY HELLO, BUY PHONE.\n\n' +
          'INVENTORY (or I), SCORE, HINT, SAVE, RESTORE, RESTART, UNDO.\n\nSave often. This is a Sierra game.',
        'Help',
      );
      return true;
    }
    return false;
  }

  findItem(cmd: Command): Item | undefined {
    return this.s.inv.map((i) => this.item(i)!).find((i) => i && cmd.about(...i.names));
  }

  findHotspot(cmd: Command): Hotspot | undefined {
    return this.visibleHotspots().find((h) => cmd.about(...h.names));
  }

  private confused(cmd: Command): string {
    const lines = [
      "You can't do that. Well, you can, but not here, and not like that.",
      `"${cmd.raw}"? Larry hasn't been that confused since New Coke.`,
      "That doesn't work. Neither does Larry, technically, but here we are.",
      "The parser stares at you the way the bartender does.",
    ];
    return lines[this.s.moves % lines.length];
  }

  // ---- save / undo ----

  private snapshot() {
    this.undoSnap = this.serialize();
  }

  serialize(): string {
    return JSON.stringify(this.s);
  }

  load(json: string) {
    this.s = { ...this.fresh(), ...JSON.parse(json) };
    this.stop();
    this.queue = [];
    this.syncZones();
  }

  restart() {
    this.s = this.fresh();
    this.queue = [];
    this.stop();
    this.syncZones();
    this.snapshot();
  }

  undo(): boolean {
    if (!this.undoSnap) return false;
    this.load(this.undoSnap);
    return true;
  }
}
