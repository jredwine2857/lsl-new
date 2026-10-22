"""Liftoff! The pad without its rocket as a backdrop, the rocket as a sprite
cut from the pad render (so it matches the room exactly), and flickering
flame and billowing smoke sprites the game animates and shakes.

    python3 art/build.py ch6-pad       # first, so the rocket can be cut out
    python3 art/scenes/launch.py       # writes src/art/scenes/launch-*.png
"""

import os
import random
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scenekit as sk  # noqa: E402
from scenekit import rad  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOMS = os.path.join(HERE, '..', '..', 'src', 'art', 'rooms')


def backdrop():
    """ch6-pad again with PAD_NAME set, which leaves the rocket off."""
    env = dict(os.environ, PAD_NAME='launch-bg')
    subprocess.run([sys.executable, os.path.join(HERE, '..', 'rooms', 'ch6-pad.py'), sk.OUT], check=True, env=env,
                   stdout=subprocess.DEVNULL)
    sk.publish('launch-bg')
    fg = os.path.join(sk.GAME, 'launch-bg-fg.png')
    if os.path.exists(os.path.join(sk.OUT, 'launch-bg-fg.png')):
        shutil.copy(os.path.join(sk.OUT, 'launch-bg-fg.png'), fg)


def rocket():
    """Where the pad with a rocket differs from the pad without one, that's the rocket."""
    import numpy as np
    from PIL import Image
    a = np.asarray(Image.open(os.path.join(ROOMS, 'ch6-pad.png')).convert('RGB')).astype(int)
    b = np.asarray(Image.open(os.path.join(sk.GAME, 'launch-bg.png')).convert('RGB')).astype(int)
    x0, x1, y0, y1 = 136, 184, 4, 146
    diff = np.abs(a - b).sum(axis=2) > 40
    # keep the change only inside the rocket's own outline (body, fairing and grid fins),
    # so lighting shifts on the ground don't come along, and fill the body solid
    ys, xs = np.mgrid[0:a.shape[0], 0:a.shape[1]]
    body = (abs(xs - 160) <= 12) & (ys >= 6) & (ys < 146)
    fins = (ys >= 54) & (ys <= 62) & (abs(xs - 160) <= 20)
    core = (abs(xs - 160) <= 10) & (ys >= 24) & (ys < 146)
    mask = ((body | fins) & diff) | core
    out = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    out[..., :3] = a[y0:y1, x0:x1]
    out[..., 3] = mask[y0:y1, x0:x1] * 255
    Image.fromarray(out, 'RGBA').save(os.path.join(sk.OUT, 'launch-rocket.png'), optimize=True)
    sk.publish('launch-rocket')
    print('rendered launch-rocket', (x1 - x0, y1 - y0), 'top-left', (x0, y0))


def flame(frame):
    """A Raptor plume: a white-hot core in a yellow-orange cone, broken up by noise."""
    import bpy
    sk.reset()
    rnd = random.Random(frame * 7 + 1)
    for i, (r0, length, color, strength) in enumerate([(1.1, 9.0, '#E04008', 1.2), (0.8, 6.5, '#FF9A20', 1.5),
                                                      (0.45, 3.6, '#FFF0C0', 2.2)]):
        bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=r0 * 1.6, radius2=r0, depth=length,
                                        location=(0, i * 0.1, -length / 2))
        o = bpy.context.active_object
        bpy.ops.object.shade_smooth()
        # ragged edges: displace by noise, different each frame
        tex = bpy.data.textures.new(f'n{i}', 'CLOUDS')
        tex.noise_scale = 0.6
        tex.noise_basis = 'ORIGINAL_PERLIN'
        bpy.ops.object.modifier_add(type='SUBSURF')
        o.modifiers['Subdivision'].levels = 3
        d = o.modifiers.new('d', 'DISPLACE')
        d.texture = tex
        d.strength = 0.5 + 0.2 * i
        d.texture_coords = 'GLOBAL'
        o.location.x += rnd.uniform(-0.15, 0.15)
        o.location.z += rnd.uniform(-0.3, 0.3)
        o.rotation_euler = rad(0, 0, rnd.uniform(0, 360))
        tex.noise_depth = 2
        m = bpy.data.materials.new(f'f{i}')
        m.use_nodes = True
        p = m.node_tree.nodes['Principled BSDF']
        p.inputs['Base Color'].default_value = (0, 0, 0, 1)
        p.inputs['Emission Color'].default_value = (*sk.lin(color), 1)
        p.inputs['Emission Strength'].default_value = strength
        o.data.materials.append(m)
    sk.fx(f'launch-flame-{frame}', 56, 120, cam=(0, -40, -4.6), target=(0, 0, -4.6), ppm=11)


def smoke(frame):
    """Exhaust clouds rolling out of the flame trench: lumpy white puffs, lit warm from below."""
    import bpy
    sk.reset()
    rnd = random.Random(frame * 13 + 5)
    m = bpy.data.materials.new('smoke')
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*sk.lin('#E8E4E0'), 1)
    p.inputs['Roughness'].default_value = 1.0
    for k in range(46):
        x = rnd.gauss(0, 5.5)
        h = max(0.0, 3.2 - abs(x) * 0.35) * rnd.random()
        rr = rnd.uniform(0.8, 1.8) * (1.2 - abs(x) / 20)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=rr, location=(x, rnd.uniform(-1, 1), h + rr * 0.5))
        o = bpy.context.active_object
        bpy.ops.object.shade_smooth()
        o.data.materials.append(m)
    sc = bpy.context.scene
    for color, energy, rot in (('#FFF4E8', 3.0, (40, 0, -20)), ('#FF9030', 1.6, (160, 0, 0)), ('#A0B8E0', 1.0, (60, 0, 160))):
        ld = bpy.data.lights.new('l', 'SUN')
        ld.energy = energy
        ld.color = sk.lin(color)
        lo = bpy.data.objects.new('l', ld)
        sc.collection.objects.link(lo)
        lo.rotation_euler = rad(*rot)
    sk.fx(f'launch-smoke-{frame}', 200, 60, cam=(0, -60, 2.6), target=(0, 0, 2.6), ppm=8, colors=24)


which = sys.argv[1:] or ['bg', 'rocket', 'flame', 'smoke']
if 'bg' in which:
    backdrop()
if 'rocket' in which:
    rocket()
for f in range(3):
    if 'flame' in which:
        flame(f)
    if 'smoke' in which:
        smoke(f)
