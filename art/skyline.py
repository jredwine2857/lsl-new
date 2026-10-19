"""Style test: Skyline Chili (Chapter 3) as a 1990s VGA Sierra background.

Builds the room from primitives in Blender, renders it, and then crunches it
to 320x200 with a 256-color palette, roughly what Sierra did to its scanned
paintings for SCI1 games. The layout follows jr's photo of a real Skyline:
the oval skyline sign, navy subway tile, digital menu boards, chrome
pendant lamps and a merch wall of tie-dye shirts.

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


def font(path):
    """Use a bolder system font when there is one; Blender's own is the fallback."""
    return bpy.data.fonts.load(path) if os.path.exists(path) else None


SCRIPT = font('/usr/share/fonts/opentype/inter/Inter-ExtraBoldItalic.otf')
BOLD = font('/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf')


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


def tiled(name, rgb, grout, scale, brick=True):
    """Subway tile: a brick texture with thin grout lines."""
    m = mat(name, rgb, rough=0.15)
    nt = m.node_tree
    b = nt.nodes.new('ShaderNodeTexBrick')
    b.inputs['Color1'].default_value = (*rgb, 1)
    b.inputs['Color2'].default_value = (*rgb, 1)
    b.inputs['Mortar'].default_value = (*grout, 1)
    b.inputs['Scale'].default_value = scale
    b.inputs['Mortar Size'].default_value = 0.015
    b.offset = 0.5 if brick else 0.0
    nt.links.new(b.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])
    return m


def box(name, loc, size, material, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    o.data.materials.append(material)
    return o


def cyl(name, loc, r, depth, material, verts=32, rot=(0, 0, 0), scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    o.data.materials.append(material)
    return o


def label(body, loc, size, material, face=None, shear=0.0, align='CENTER'):
    bpy.ops.object.text_add(location=loc, rotation=(math.radians(90), 0, 0))
    o = bpy.context.object
    o.data.body = body
    o.data.size = size
    o.data.align_x = align
    o.data.align_y = 'CENTER'
    o.data.extrude = 0.01
    o.data.shear = shear
    if face:
        o.data.font = face
    o.data.materials.append(material)
    return o


NAVY = tiled('navy_tile', (0.008, 0.012, 0.07), (0.05, 0.06, 0.15), 6, brick=False)
WHITE_TILE = tiled('white_tile', (0.8, 0.8, 0.78), (0.55, 0.55, 0.55), 5)
BEIGE_TILE = tiled('beige_tile', (0.62, 0.52, 0.5), (0.5, 0.42, 0.4), 3)
SOFFIT = mat('soffit', (0.72, 0.68, 0.6))
FLOOR = mat('floor', (0.35, 0.35, 0.34), rough=0.5)
COUNTER_TOP = mat('countertop', (0.85, 0.85, 0.85), rough=0.2)
CHROME = mat('chrome', (0.85, 0.85, 0.85), rough=0.15, metal=1)
SIGN_RIM = mat('sign_rim', (0.03, 0.04, 0.12), rough=0.3)
SIGN_FACE = mat('sign_face', (0.01, 0.01, 0.02), rough=0.1)
SKY = mat('sky', (0.35, 0.55, 0.95), emit=0.8)
CITY = mat('city', (0.01, 0.01, 0.02))
LIME = mat('lime', (0.35, 0.85, 0.0), emit=1.3)
RED = mat('red', (0.9, 0.05, 0.03), emit=2)
WHITE_GLOW = mat('white_glow', (1, 1, 1), emit=3)
SCREEN_BLUE = mat('screen_blue', (0.1, 0.3, 0.9), emit=1.2)
SCREEN_WHITE = mat('screen_white', (0.85, 0.88, 1.0), emit=0.8)
YELLOW = mat('yellow', (1.0, 0.8, 0.0), emit=2)
GOLD = mat('gold', (0.8, 0.65, 0.2), rough=0.3, metal=1)
ORANGE = mat('orange', (1.0, 0.35, 0.05))
LAMP = mat('lamp', (1.0, 0.95, 0.8), emit=8)
KITCHEN = mat('kitchen', (0.6, 0.6, 0.58), emit=0.12)

# ---- shell ---------------------------------------------------------------
box('floor', (0, 0, 0), (16, 10, 0.1), FLOOR)
box('soffit', (0, 2.2, 6.6), (16, 4, 2.6), SOFFIT)
box('back_upper', (0, 4.0, 4.6), (10, 0.1, 1.4), NAVY)
box('back_lower', (0, 4.0, 2.1), (10, 0.1, 3.0), BEIGE_TILE)
box('kitchen_window', (0.6, 3.94, 2.0), (3.6, 0.02, 1.6), KITCHEN)
box('left_wall', (-5.0, 2.0, 2.3), (0.1, 4.0, 4.6), WHITE_TILE)
box('right_wall', (5.0, 2.0, 2.3), (0.1, 4.0, 4.6), NAVY)
box('right_face', (6.5, 0.0, 2.3), (3.0, 0.1, 4.6), NAVY)
box('left_face', (-6.5, 0.0, 2.3), (3.0, 0.1, 4.6), WHITE_TILE)

# ---- the big oval sign on the soffit ---------------------------------------
cyl('sign_rim', (0, -0.05, 6.4), 1.0, 0.3, SIGN_RIM, 64, rot=(math.radians(90), 0, 0), scale=(2.6, 1.25, 1))
cyl('sign_face', (0, -0.22, 6.4), 0.96, 0.05, SIGN_FACE, 64, rot=(math.radians(90), 0, 0), scale=(2.6, 1.25, 1))
# sky band and city silhouette across the top of the oval
cyl('sign_sky', (0, -0.25, 6.85), 0.7, 0.02, SKY, 64, rot=(math.radians(90), 0, 0), scale=(2.6, 0.62, 1))
for i, (x, h) in enumerate([(-1.5, 0.3), (-1.2, 0.5), (-0.9, 0.38), (-0.6, 0.7), (-0.35, 0.45), (-0.1, 0.85),
                            (0.15, 0.55), (0.4, 0.75), (0.65, 0.4), (0.9, 0.6), (1.2, 0.35), (1.45, 0.5)]):
    box(f'tower{i}', (x, -0.27, 6.55 + h / 2), (0.2, 0.02, h), CITY)
label('Skyline', (0, -0.3, 6.35), 0.95, LIME, SCRIPT, shear=0.25)
box('chili_bar', (0.1, -0.28, 5.75), (1.9, 0.02, 0.34), RED)
label('C H I L I', (0.1, -0.31, 5.75), 0.28, WHITE_GLOW, BOLD)

# ---- menu screens --------------------------------------------------------
for i, (title, sub) in enumerate([('CONEYS  WAYS', '3-WAY 4-WAY 5-WAY'), ('CHILITOS', 'BLACK BEANS & RICE'),
                                  ('BREAKFAST', 'BREAKFAST CONEY'), ('DRINKS', 'COFFEE TO GO')]):
    x = -3.3 + i * 2.2
    box(f'screen{i}', (x, 3.92, 4.55), (2.0, 0.04, 0.8), SCREEN_WHITE)
    box(f'screen_top{i}', (x, 3.89, 4.82), (2.0, 0.02, 0.24), SCREEN_BLUE)
    label(title, (x, 3.87, 4.82), 0.16, WHITE_GLOW, BOLD)
    label(sub, (x, 3.87, 4.45), 0.12, mat(f'menu_ink{i}', (0.05, 0.1, 0.5), emit=1), BOLD)
box('coffee_sign', (2.2, 3.85, 3.9), (1.2, 0.04, 0.5), mat('coffee', (0.05, 0.05, 0.2)))
label('COFFEE TO GO', (2.2, 3.82, 3.9), 0.13, WHITE_GLOW, BOLD)

# ---- counter -------------------------------------------------------------
box('counter', (-0.3, 1.0, 0.75), (8.6, 1.0, 1.5), NAVY)
box('counter_top', (-0.3, 1.0, 1.53), (8.8, 1.2, 0.08), COUNTER_TOP)
box('steam_table', (-0.6, 1.5, 1.75), (2.2, 0.5, 0.35), CHROME)
for i in range(3):
    cyl(f'pendant_cord{i}', (-2.6 + i * 2.6, 2.0, 4.5), 0.015, 1.6, CHROME, 8)
    cyl(f'pendant{i}', (-2.6 + i * 2.6, 2.0, 3.4), 0.35, 0.3, CHROME, 32)
    cyl(f'bulb{i}', (-2.6 + i * 2.6, 2.0, 3.24), 0.22, 0.02, LAMP, 24)

# ---- merch wall (left) ---------------------------------------------------
for i, c in enumerate([(0.9, 0.2, 0.6), (0.1, 0.2, 0.8), ORANGE, (0.2, 0.2, 0.25)]):
    shirt = c if isinstance(c, bpy.types.Material) else mat(f'shirt{i}', c)
    x, z = -6.3 + (i % 2) * 0.95, 3.0 - (i // 2) * 1.15
    box(f'shirt{i}', (x, -0.1, z), (0.6, 0.05, 0.8), shirt)
    box(f'sleeves{i}', (x, -0.08, z + 0.28), (0.9, 0.04, 0.24), shirt)
label('ITS SKYLINE TIME', (-5.85, -0.12, 1.3), 0.16, YELLOW, BOLD)

# ---- "Welcome to Skyline, Cincinnati" (right) ------------------------------
cyl('welcome_oval', (6.5, -0.07, 2.5), 0.5, 0.02, mat('welcome', (0.85, 0.85, 0.85), emit=0.4), 48,
    rot=(math.radians(90), 0, 0), scale=(1.6, 0.9, 1))
label('Skyline', (6.5, -0.1, 2.5), 0.38, SIGN_FACE, SCRIPT, shear=0.25)
label('WELCOME TO', (6.5, -0.1, 3.3), 0.24, mat('ink', (0.9, 0.9, 0.9), emit=0.5), BOLD)
label('CINCINNATI', (6.5, -0.1, 1.75), 0.24, mat('ink2', (0.9, 0.9, 0.9), emit=0.5), BOLD)

# ---- lights --------------------------------------------------------------
bpy.ops.object.light_add(type='AREA', location=(0, -3, 4.0))
key = bpy.context.object
key.data.energy = 260
key.data.size = 10
key.rotation_euler = (math.radians(60), 0, 0)
key.data.color = (1.0, 0.95, 0.88)
for x in (-4, 0, 4):
    bpy.ops.object.light_add(type='SPOT', location=(x, -1.5, 4.6))
    s = bpy.context.object
    s.data.energy = 50
    s.data.spot_size = math.radians(70)

world = bpy.data.worlds.new('world')
scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.6, 0.65, 0.7, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.12
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'

# Sierra rooms are shown nearly straight on, a little from above.
bpy.ops.object.camera_add(location=(0, -12.5, 4.0), rotation=(math.radians(89), 0, 0))
cam = bpy.context.object
cam.data.lens = 30
scene.camera = cam

scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.resolution_x = 960
scene.render.resolution_y = 600
scene.render.filepath = os.path.join(OUT, 'skyline-raw.png')
bpy.ops.render.render(write_still=True)

# VGA crunch: shrink to 320x200, 256 colors, then show it at 3x.
raw = Image.open(scene.render.filepath).convert('RGB')
small = raw.resize((320, 200), Image.LANCZOS)
vga = small.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
vga.save(os.path.join(OUT, 'skyline-vga-320x200.png'))
vga.convert('RGB').resize((960, 600), Image.NEAREST).save(os.path.join(OUT, 'skyline-vga.png'))

ega = small.quantize(colors=16, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
ega.convert('RGB').resize((960, 600), Image.NEAREST).save(os.path.join(OUT, 'skyline-16color.png'))
print('rendered to', OUT)
