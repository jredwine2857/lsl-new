// Blender-rendered room backdrops (see art/README.md). Each room has a
// painted 320x200 background, and optionally an "-fg" layer: the parts of
// the scene that stand in front of characters, like a counter. A room's
// draw() paints the backdrop, then its animated bits and people, then the
// fg layer, and the engine draws Larry last.

const urls = import.meta.glob('../art/rooms/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

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
