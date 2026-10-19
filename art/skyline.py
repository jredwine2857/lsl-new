"""Style test: Skyline Chili (Chapter 3) as a 1990s VGA Sierra background.

Builds the room from primitives in Blender, renders it at 320x200 and then
crunches it to a 256-color palette with ordered dithering, which is roughly
what Sierra's artists did to their scanned paintings for SCI1 games.

    python3 -m pip install bpy pillow
    python3 art/skyline.py art/out
"""

import math
import os
import sys

import bpy
from PIL import Image

OUT = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else 'art/out'
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def mat(name, rgb, emit=0.0, rough=0.6, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*rgb, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    if emit:
        p.inputs['Emission Color'].default_value = (*rgb, 1)
        p.inputs['Emission Strength'].default_value = emit
    return m


def box(name, loc, size, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    o.data.materials.append(material)
    return o


def cyl(name, loc, r, depth, material, verts=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(material)
    return o


def label(body, loc, size, material, rot=(math.radians(90), 0, 0)):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.data.body = body
    o.data.size = size
    o.data.align_x = 'CENTER'
    o.data.extrude = 0.01
    o.data.materials.append(material)
    return o


# Skyline's blue and yellow, plus diner basics.
BLUE = mat('blue', (0.02, 0.08, 0.45))
YELLOW = mat('yellow', (1.0, 0.75, 0.05))
WHITE = mat('white', (0.62, 0.58, 0.5))
TILE = mat('tile', (0.75, 0.73, 0.68), rough=0.3)
CHROME = mat('chrome', (0.8, 0.8, 0.8), rough=0.2, metal=1)
RED = mat('red', (0.6, 0.03, 0.03), rough=0.4)
CHILI = mat('chili', (0.35, 0.1, 0.02), rough=0.3)
GLASS = mat('glass', (0.5, 0.8, 0.95), emit=1.5)
SCREEN = mat('screen', (0.3, 0.7, 0.8), emit=2.0)
WOOD = mat('wood', (0.35, 0.18, 0.06))
NEON = mat('neon', (1.0, 0.85, 0.1), emit=6)

# Room shell
floor = box('floor', (0, 0, 0), (12, 8, 0.1), TILE)
# Checkerboard diner floor
FLOOR = mat('checker', (1, 1, 1), rough=0.25)
nt = FLOOR.node_tree
chk = nt.nodes.new('ShaderNodeTexChecker')
chk.inputs['Scale'].default_value = 14
chk.inputs['Color1'].default_value = (0.8, 0.78, 0.72, 1)
chk.inputs['Color2'].default_value = (0.05, 0.05, 0.06, 1)
nt.links.new(chk.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])
floor.data.materials[0] = FLOOR
box('ceiling', (0, 0, 5), (12, 8, 0.1), mat('ceiling', (0.55, 0.5, 0.42)))
box('back_wall', (0, 4, 2.5), (12, 0.1, 5), WHITE)
box('left_wall', (-6, 0, 2.5), (0.1, 8, 5), WHITE)
box('right_wall', (6, 0, 2.5), (0.1, 8, 5), WHITE)
box('stripe', (0, 3.94, 4.4), (12, 0.02, 0.4), BLUE)

# Front window with the free-food flyer
box('window', (-4.3, 3.93, 2.6), (2.4, 0.02, 2.0), GLASS)
box('flyer', (-4.3, 3.9, 2.6), (1.4, 0.02, 1.1), YELLOW)
label('FREE FOOD!', (-4.3, 3.88, 2.75), 0.28, RED)
label('SUMMER OF LOVE', (-4.3, 3.88, 2.35), 0.14, BLUE)

# Menu board
box('menu', (0.2, 3.93, 3.4), (3.6, 0.04, 1.3), BLUE)
label('SKYLINE', (0.2, 3.88, 3.55), 0.5, NEON)
label('3-WAY  4-WAY  5-WAY', (0.2, 3.88, 3.05), 0.22, WHITE)

# TV with WKRP
box('tv', (4.2, 3.7, 3.4), (1.4, 0.6, 1.0), mat('tvcase', (0.1, 0.1, 0.1)))
box('tvscreen', (4.2, 3.39, 3.4), (1.1, 0.02, 0.75), SCREEN)

# Counter, stools, chili vat
box('counter', (0, 1.6, 0.6), (11, 1.0, 1.2), BLUE)
box('countertop', (0, 1.6, 1.24), (11.2, 1.2, 0.08), CHROME)
box('backbar', (0, 3.4, 0.7), (11, 0.8, 1.4), CHROME)
for i in range(8):
    x = -4.6 + i * 1.3
    cyl(f'stool{i}', (x, 0.6, 0.45), 0.06, 0.9, CHROME, 8)
    cyl(f'seat{i}', (x, 0.6, 0.92), 0.32, 0.14, RED)
cyl('vat', (-3.6, 3.3, 1.75), 0.5, 0.7, CHROME)
cyl('vat_chili', (-3.6, 3.3, 2.1), 0.46, 0.04, CHILI)
box('door', (5.95, 0.5, 1.6), (0.05, 1.4, 3.2), WOOD)

# Lights: warm key, cool window fill
bpy.ops.object.light_add(type='AREA', location=(0, 0, 4.8))
key = bpy.context.object
key.data.energy = 350
key.data.size = 8
key.data.color = (1.0, 0.92, 0.8)
bpy.ops.object.light_add(type='POINT', location=(-4, 2, 2.5))
bpy.context.object.data.energy = 200
bpy.context.object.data.color = (0.7, 0.85, 1.0)

world = bpy.data.worlds.new('world')
scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.1
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'

# Sierra rooms are shown from a high three-quarter view with a flat-ish lens.
bpy.ops.object.camera_add(location=(0, -9.5, 3.4), rotation=(math.radians(80), 0, 0))
cam = bpy.context.object
cam.data.lens = 28
scene.camera = cam

scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.resolution_x = 960
scene.render.resolution_y = 600
scene.render.filepath = os.path.join(OUT, 'skyline-raw.png')
bpy.ops.render.render(write_still=True)

# VGA crunch: shrink to 320x200, 256 colors with ordered dither, then show it 3x.
raw = Image.open(scene.render.filepath).convert('RGB')
small = raw.resize((320, 200), Image.LANCZOS)
vga = small.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
vga.save(os.path.join(OUT, 'skyline-vga-320x200.png'))
vga.convert('RGB').resize((960, 600), Image.NEAREST).save(os.path.join(OUT, 'skyline-vga.png'))

ega = small.quantize(colors=16, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
ega.convert('RGB').resize((960, 600), Image.NEAREST).save(os.path.join(OUT, 'skyline-16color.png'))
print('rendered to', OUT)
