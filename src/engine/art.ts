import type { Facing } from './types';

// Blender-rendered room backdrops (see art/README.md). Each room has a
// painted 320x200 background, and optionally an "-fg" layer: the parts of
// the scene that stand in front of characters, like a counter. A room's
// draw() paints the backdrop, then its animated bits and people, then the
// fg layer, and the engine draws Larry last.
//
// Characters are Blender-rendered sprite sheets too (art/chars/): 5 columns
// (standing, then 4 walk frames) by 3 rows (facing down, up, right).

const urls = {
  ...import.meta.glob('../art/rooms/*.png', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../art/chars/*.png', { eager: true, query: '?url', import: 'default' }),
  ...import.meta.glob('../art/props/*.png', { eager: true, query: '?url', import: 'default' }),
} as Record<string, string>;

const images = new Map<string, HTMLImageElement>();

/** Load every backdrop up front so rooms never flash black. */
export function preloadArt(): Promise<void> {
  if (typeof Image === 'undefined') return Promise.resolve();
  return Promise.all(Object.entries(urls).map(([path, url]) => new Promise<void>((done) => {
    const img = new Image();
    img.onload = img.onerror = () => done();
    img.src = url;
    images.set(path.replace(/^.*\//, '').replace(/\.png$/, ''), img);
  }))).then(() => undefined);
}

/** Draw a backdrop layer by name (e.g. 'ch3-skyline' or 'ch3-skyline-fg'). */
export function backdrop(ctx: CanvasRenderingContext2D, name: string): boolean {
  const img = images.get(name);
  if (!img?.complete || !img.naturalWidth) return false;
  ctx.drawImage(img, 0, 0, 320, 200);
  return true;
}

const CELL_W = 32;
const CELL_H = 48;
const FEET_ROW = 46;
const ROWS: Record<Facing, number> = { down: 0, up: 1, right: 2, left: 2 };

/** Draw a character sprite with feet centred at (x, y). step 0 is standing, 1+ cycles the walk. */
export function charSprite(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, facing: Facing, step = 0): boolean {
  const img = images.get(name);
  if (!img?.complete || !img.naturalWidth) return false;
  const col = step ? 1 + ((step - 1) % 4) : 0;
  const left = Math.round(x - CELL_W / 2);
  const top = Math.round(y - FEET_ROW);
  const sx = col * CELL_W;
  const sy = ROWS[facing] * CELL_H;
  if (facing === 'left') {
    ctx.save();
    ctx.translate(left + CELL_W, top);
    ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, CELL_W, CELL_H, 0, 0, CELL_W, CELL_H);
    ctx.restore();
  } else {
    ctx.drawImage(img, sx, sy, CELL_W, CELL_H, left, top, CELL_W, CELL_H);
  }
  return true;
}

/** Draw a prop sprite (src/art/props) with its bottom-left at (x, bottom); flip mirrors it. */
export function prop(ctx: CanvasRenderingContext2D, name: string, x: number, bottom: number, flip = false): number {
  const img = images.get(name);
  if (!img?.complete || !img.naturalWidth) return 0;
  const top = Math.round(bottom - img.naturalHeight);
  if (flip) {
    ctx.save();
    ctx.translate(Math.round(x) + img.naturalWidth, top);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  } else {
    ctx.drawImage(img, Math.round(x), top);
  }
  return img.naturalWidth;
}
