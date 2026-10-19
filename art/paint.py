"""Turn a Blender render into a Larry 5 style "hand-painted" VGA background.

Larry 5 (1991) used scanned paintings: soft brushy shapes, warm saturated
color, no hard 3D edges and almost no dithering. This approximates that look:
an oil-paint (Kuwahara) filter to break up the render into brush strokes, a
saturation and warmth push, then a 256-color palette with no dithering.

    python3 art/paint.py art/out/skyline-raw.png art/out/skyline
"""

import sys

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter


def kuwahara(img: Image.Image, r: int) -> Image.Image:
    """Classic Kuwahara filter: each pixel takes the mean of its calmest quadrant."""
    a = np.asarray(img, dtype=np.float32)
    lum = a.mean(axis=2)
    h, w = lum.shape
    pad = lambda x: np.pad(x, ((r, r), (r, r)) + ((0, 0),) * (x.ndim - 2), mode='edge')
    L, A = pad(lum), pad(a)

    def box(x):
        # Sum over (r+1)x(r+1) windows via an integral image.
        s = np.cumsum(np.cumsum(x, 0), 1)
        s = np.pad(s, ((1, 0), (1, 0)) + ((0, 0),) * (x.ndim - 2))
        k = r + 1
        return (s[k:, k:] - s[:-k, k:] - s[k:, :-k] + s[:-k, :-k]) / (k * k)

    mean_l, mean_l2, mean_a = box(L), box(L * L), box(A)
    var = mean_l2 - mean_l ** 2
    best_v = np.full((h, w), np.inf, dtype=np.float32)
    out = np.zeros_like(a)
    for dy in (0, r):
        for dx in (0, r):
            v = var[dy:dy + h, dx:dx + w]
            m = mean_a[dy:dy + h, dx:dx + w]
            pick = v < best_v
            best_v = np.where(pick, v, best_v)
            out = np.where(pick[..., None], m, out)
    return Image.fromarray(out.clip(0, 255).astype(np.uint8))


def paint(raw: Image.Image) -> Image.Image:
    img = raw.convert('RGB')
    # Brighter, warmer and more saturated than the render, like Larry 5's gouache.
    img = ImageEnhance.Brightness(img).enhance(1.25)
    img = ImageEnhance.Color(img).enhance(1.6)
    r, g, b = img.split()
    img = Image.merge('RGB', (r.point(lambda v: min(255, int(v * 1.06) + 8)), g.point(lambda v: min(255, v + 4)), b.point(lambda v: int(v * 0.94))))
    # Brush strokes: a light Kuwahara at full size keeps signs readable.
    img = kuwahara(img, 3)
    # Paper grain, then a gentle smooth so strokes blend like wet paint.
    rng = np.random.default_rng(7)
    a = np.asarray(img, dtype=np.float32)
    grain = rng.normal(0, 5, a.shape[:2])[..., None]
    img = Image.fromarray((a + grain).clip(0, 255).astype(np.uint8)).filter(ImageFilter.SMOOTH)
    small = img.resize((320, 200), Image.LANCZOS)
    return small.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)


if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]
    vga = paint(Image.open(src))
    vga.save(f'{out}-painted-320x200.png')
    vga.convert('RGB').resize((960, 600), Image.NEAREST).save(f'{out}-painted.png')
    print('painted', out)
