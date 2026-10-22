# Room art

Every room background is rendered in Blender from a Python script, then
painted down to a 320x200, 256-color "Larry 5" look.

```
python3 -m pip install bpy pillow numpy   # Blender as a Python module
python3 art/build.py                      # render every room (~1 min each)
python3 art/build.py ch3-skyline          # or just one
```

`build.py` writes finished images to `src/art/rooms/` (committed; the game
loads them) and scratch renders to `art/out/` (ignored).

## Files

- `kit.py`: the room kit. `Room(name, floor_y=...)` sets up a camera so that
  pixel (x, y) in the game lands where you expect. Primitives take game
  pixels: `panel` (flat things on a wall), `block` (boxes standing on the
  floor), `slab` (a strip of floor: sidewalks, roads), `post`, `disc`, `oval`,
  `text`, `poly`, `tree`, `palm`, `car`, `sky`, `cloud`, `stars`. Materials:
  `mat`, `glow`, `brick`, `tiles`, `planks`, `mottled`, `checker`.
- `paint.py`: the painted look (Kuwahara brush strokes, warm color push,
  grain, 256 colors, no dither). Text objects skip the brush pass so signs
  stay readable.
- `rooms/chN-room.py`: one script per room. The name matches the game's
  `backdrop(ctx, 'chN-room')` call.

## Rules of thumb

- Read the room's hotspots and `draw()` in `src/content/chapterN.ts` first, and
  put things where the hotspots are.
- Bake in only what never changes. Anything that moves, blinks, or depends on
  game state (people, TV pictures, items you can take, doors that open) stays
  in `draw()`.
- If people stand behind something (a counter, a bar), pass `fg=True` to that
  object. The kit writes a `-fg.png` with just those pixels, and `draw()`
  draws it after those people.
- `floor_y` is the screen row where the back wall meets the floor. Rows above
  it are farther away than the wall, so put things that stand on the floor
  at rows below it.

## Characters

`art/chars/charkit.py` builds a jointed caricature body (big head, big nose)
that each `art/chars/<name>.py` dresses and renders as a sprite sheet: 5
columns (standing, then a 4-frame walk) by 3 rows (facing down, up, right;
the game mirrors right for left), 32x48 pixels per cell with the feet on row
46. Sheets go in `src/art/chars/` and are drawn with `charSprite()`.

    python3 art/chars/larry.py art/out/chars && cp art/out/chars/larry.png src/art/chars/
