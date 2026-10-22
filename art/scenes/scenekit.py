"""Cutscene kit: posed close-ups of the cast and props, rendered as sprites
with transparent backgrounds for the game's full-screen action sequences
(src/content/scenes.ts). Backgrounds use the room kit (art/kit.py).

The characters are the same models as their sprite sheets (art/chars/cast.py),
posed by rotating joints and shot close with a perspective camera.
"""

import math
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
sys.path.insert(0, os.path.join(HERE, '..', 'chars'))

import bpy  # noqa: E402,I001
from mathutils import Euler, Vector  # noqa: E402

import kit  # noqa: E402
from kit import lin, mat  # noqa: E402

OUT = os.path.join(HERE, '..', 'out', 'scenes')
GAME = os.path.join(HERE, '..', '..', 'src', 'art', 'scenes')
SS = 4


def rad(*deg):
    return tuple(math.radians(d) for d in deg)


def character(name):
    """A fresh scene with one dressed cast member in it."""
    from cast import make
    kit._mats.clear()  # the scene (and its materials) is about to be replaced
    c = make(name)
    kit._mats.clear()
    for k in c.j:
        if k != 'root':
            c.j[k].rotation_euler = (0, 0, 0)
    c.pelvis.location.z = c.leg
    return c


def mic(c, side='R'):
    """A handheld karaoke mic in the hand, pointing up out of the fist."""
    w = c.j['wrist' + side]
    # the fist points the mic on past the fingers, head first
    c.capsule(w, 0.028, 0.02, 0.15, mat('#1A1A1E', rough=0.35, metal=0.5), 'mic', offset=(0, -0.02, 0.06))
    c.ball(w, (0, -0.02, -0.13), (0.045, 0.045, 0.05), mat('#B8BCC4', rough=0.3, metal=0.9), 'micball')


def ring_box(c, side='R', scale=1.0):
    """An open red velvet ring box with a gold ring and a big diamond, held out in the hand."""
    w = c._empty('ringbox', c.j['wrist' + side], (0, 0, 0))
    w.scale = (scale, scale, scale)
    red = mat('#9A1020', rough=0.7)
    # the wrist is posed level, so the box sits in front of the fist with its lid open toward the holder
    c.box(w, (0, -0.07, -0.02), (0.08, 0.09, 0.05), red, 'boxbase', bevel=0.008)
    c.box(w, (0, -0.02, 0.03), (0.08, 0.015, 0.08), red, 'boxlid', rot=rad(-10, 0, 0), bevel=0.008)
    c.box(w, (0, -0.07, 0.006), (0.066, 0.075, 0.006), mat('#3A0810', rough=0.9), 'cushion', bevel=0)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.024, minor_radius=0.005, location=(0, 0, 0))
    ring = bpy.context.active_object
    ring.rotation_euler = rad(0, 90, 0)
    c._link(ring, w, mat('#F0C040', rough=0.15, metal=1.0))
    ring.location = (0, -0.07, 0.03)
    diamond(c, w, (0, -0.07, 0.06), 0.02)


def diamond(c, parent, loc, r):
    """A brilliant-cut stone: a low crown on a deep pavilion, glassy and bright."""
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=r, radius2=r * 0.55, depth=r * 0.45, location=(0, 0, 0))
    crown = bpy.context.active_object
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=r, radius2=0, depth=r * 0.9, location=(0, 0, 0))
    pav = bpy.context.active_object
    pav.rotation_euler = rad(180, 0, 0)
    gem = gem_mat()
    for o, dz in ((crown, r * 0.22), (pav, -r * 0.45)):
        o.data.polygons.foreach_set('use_smooth', [False] * len(o.data.polygons))
        c._link(o, parent, gem)
        o.location = (loc[0], loc[1], loc[2] + dz)


def gem_mat():
    """Pixel-art diamonds read as hard white and ice-blue facets, so the stone is a
    mirror-polished, flat-shaded solid rather than real glass."""
    m = bpy.data.materials.new('diamond')
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*lin('#E8F6FF'), 1)
    p.inputs['Metallic'].default_value = 1.0
    p.inputs['Roughness'].default_value = 0.04
    p.inputs['Emission Color'].default_value = (*lin('#D8ECFF'), 1)
    p.inputs['Emission Strength'].default_value = 0.35
    return m


def shoot(name, w, h, cam, target, lens=50, lights=None, world='#606878', world_strength=0.6, colors=64, rim=True, ppm=None):
    """Render the current scene to a w x h game-pixel sprite with a transparent
    background, painted down like the character sprites, into src/art/scenes.
    ppm (game pixels per metre) makes it an orthographic shot at that scale."""
    from PIL import Image
    from charkit import shrink
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 48
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.view_settings.view_transform = 'Standard'
    sc.render.resolution_x = w * SS
    sc.render.resolution_y = h * SS
    cd = bpy.data.cameras.new('cam')
    cd.lens = lens
    if ppm:
        cd.type = 'ORTHO'
        cd.ortho_scale = max(w, h) / ppm
    co = bpy.data.objects.new('cam', cd)
    sc.collection.objects.link(co)
    sc.camera = co
    co.location = cam
    d = Vector(target) - Vector(cam)
    co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    wd = bpy.data.worlds.new('w')
    wd.use_nodes = True
    wd.node_tree.nodes['Background'].inputs['Color'].default_value = (*lin(world), 1)
    wd.node_tree.nodes['Background'].inputs['Strength'].default_value = world_strength
    sc.world = wd
    for color, energy, rot in lights or [('#FFF0DC', 4.0, (50, 0, -30))] + ([('#A8C0FF', 2.5, (60, 0, 150))] if rim else []):
        ld = bpy.data.lights.new('l', 'SUN')
        ld.energy = energy
        ld.color = lin(color)
        ld.angle = math.radians(20)
        lo = bpy.data.objects.new('l', ld)
        sc.collection.objects.link(lo)
        lo.rotation_euler = Euler(rad(*rot))
    os.makedirs(OUT, exist_ok=True)
    raw = os.path.join(OUT, f'{name}-raw.png')
    sc.render.filepath = raw
    bpy.ops.render.render(write_still=True)
    img = paint(shrink_ss(Image.open(raw).convert('RGBA')), colors)
    img.save(os.path.join(OUT, f'{name}.png'), optimize=True)
    publish(name)
    print('rendered', name, img.size)


def shrink_ss(raw):
    import numpy as np
    from PIL import Image
    a = np.asarray(raw, dtype=np.float32) / 255
    h, w = a.shape[0] // SS, a.shape[1] // SS
    a = a[:h * SS, :w * SS].reshape(h, SS, w, SS, 4)
    alpha = a[..., 3].mean(axis=(1, 3))
    rgb = (a[..., :3] * a[..., 3:]).sum(axis=(1, 3)) / np.maximum(a[..., 3].sum(axis=(1, 3)), 1e-6)[..., None]
    out = np.dstack([rgb, (alpha > 0.4).astype(np.float32)])
    return Image.fromarray((out * 255).clip(0, 255).astype(np.uint8), 'RGBA')


def paint(img, colors=64):
    """Punchier colour, a small palette with no dither and a soft dark rim, like the sprites."""
    import numpy as np
    from PIL import Image, ImageEnhance
    alpha = img.getchannel('A')
    rgb = ImageEnhance.Color(ImageEnhance.Contrast(img.convert('RGB')).enhance(1.12)).enhance(1.25)
    q = np.asarray(rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')).astype(np.float32)
    m = np.asarray(alpha) > 0
    inner = m.copy()
    inner[1:, :] &= m[:-1, :]
    inner[:-1, :] &= m[1:, :]
    inner[:, 1:] &= m[:, :-1]
    inner[:, :-1] &= m[:, 1:]
    q[m & ~inner] *= 0.5
    return Image.fromarray(np.dstack([q, m * 255]).astype(np.uint8), 'RGBA')


def fx(name, w, h, cam, target, lens=50, colors=48, ppm=None):
    """Render glowing or soft effects (flames, smoke) keeping soft alpha, no rim."""
    import numpy as np
    from PIL import Image
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 48
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.view_settings.view_transform = 'Standard'
    sc.render.resolution_x = w * SS
    sc.render.resolution_y = h * SS
    cd = bpy.data.cameras.new('cam')
    cd.lens = lens
    if ppm:
        cd.type = 'ORTHO'
        cd.ortho_scale = max(w, h) / ppm
    co = bpy.data.objects.new('cam', cd)
    sc.collection.objects.link(co)
    sc.camera = co
    co.location = cam
    co.rotation_euler = (Vector(target) - Vector(cam)).to_track_quat('-Z', 'Y').to_euler()
    os.makedirs(OUT, exist_ok=True)
    raw = os.path.join(OUT, f'{name}-raw.png')
    sc.render.filepath = raw
    bpy.ops.render.render(write_still=True)
    im = Image.open(raw).convert('RGBA').resize((w, h), Image.Resampling.BOX)
    a = np.asarray(im).astype(np.float32)
    rgb = Image.fromarray(a[..., :3].astype(np.uint8)).quantize(colors=colors, dither=Image.Dither.NONE).convert('RGB')
    alpha = (np.round(a[..., 3] / 255 * 4) / 4 * 255).astype(np.uint8)  # four steps of see-through
    out = np.dstack([np.asarray(rgb), alpha])
    Image.fromarray(out, 'RGBA').save(os.path.join(OUT, f'{name}.png'), optimize=True)
    publish(name)
    print('rendered', name, (w, h))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    kit._mats.clear()


def publish(name):
    os.makedirs(GAME, exist_ok=True)
    shutil.copy(os.path.join(OUT, f'{name}.png'), os.path.join(GAME, f'{name}.png'))


def backdrop(room):
    """Render a kit.Room as a 320x200 cutscene background."""
    room.render(OUT)
    publish(room.name)
