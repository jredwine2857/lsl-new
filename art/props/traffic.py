"""Side-on car sprites for the traffic that drives past the bottom of street
rooms, rendered like the characters (charkit) so they match.

    python3 art/props/traffic.py   # writes src/art/props/car-*.png
"""

import math
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
sys.path.insert(0, os.path.join(HERE, '..', 'chars'))

import bpy  # noqa: E402
from mathutils import Euler, Vector  # noqa: E402

from charkit import SS, finish, shrink  # noqa: E402
import kit  # noqa: E402
from kit import lin  # noqa: E402
from vehicle import build  # noqa: E402

M_PER_PX = 0.075
TILT = math.radians(10)
CARS = {
    'car-taxi': ('taxi', '#F2C200', None),
    'car-prius': ('sedan', '#E8E8EA', None),
    'car-red': ('sedan', '#B01C1C', None),
    'car-suv': ('suv', '#8A929C', None),
    'car-shuttle': ('van', '#F0F0F0', '#2A60C0'),
    'car-robotaxi': ('suv', '#F4F4F4', None, True),
}
OUT = os.path.join(HERE, '..', 'out', 'props')
GAME = os.path.join(HERE, '..', '..', 'src', 'art', 'props')


def render(name, kind, color, trim, lidar=False):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    kit._mats.clear()  # cached materials died with the old scene
    sc = bpy.context.scene
    root, size = build(kind, color, name=name, trim=trim, lidar=lidar)
    w = math.ceil(size['length'] / M_PER_PX) + 4
    h = math.ceil(size['height'] / M_PER_PX) + (12 if lidar else 6)
    root.location = (-size['length'] / 2, 0, 0)
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 32
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.view_settings.view_transform = 'Standard'
    sc.render.resolution_x = w * SS
    sc.render.resolution_y = h * SS
    cam = bpy.data.cameras.new('cam')
    cam.type = 'ORTHO'
    cam.ortho_scale = max(w, h) * M_PER_PX
    ob = bpy.data.objects.new('cam', cam)
    sc.collection.objects.link(ob)
    sc.camera = ob
    # wheels sit on the bottom pixel row
    below = (h / 2 - 1) * M_PER_PX
    target = Vector((0, 0, below / math.cos(TILT)))
    fwd = Vector((0, math.cos(TILT), -math.sin(TILT)))
    ob.location = target - fwd * 30
    ob.rotation_euler = Euler((math.pi / 2 - TILT, 0, 0))
    world = bpy.data.worlds.new('w')
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = (*lin('#7080A8'), 1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.7
    sc.world = world
    key = bpy.data.lights.new('key', 'SUN')
    key.energy = 3.5
    key.angle = math.radians(20)
    k = bpy.data.objects.new('key', key)
    sc.collection.objects.link(k)
    k.rotation_euler = Euler((math.radians(55), 0, math.radians(-25)))
    os.makedirs(OUT, exist_ok=True)
    raw_path = os.path.join(OUT, f'{name}-raw.png')
    sc.render.filepath = raw_path
    bpy.ops.render.render(write_still=True)
    from PIL import Image
    img = finish(shrink(Image.open(raw_path).convert('RGBA')))
    img = img.crop(img.getbbox())
    img.save(os.path.join(OUT, f'{name}.png'), optimize=True)
    os.makedirs(GAME, exist_ok=True)
    shutil.copy(os.path.join(OUT, f'{name}.png'), os.path.join(GAME, f'{name}.png'))
    print('rendered', name, img.size)


for n in sys.argv[1:] or CARS:
    render(n, *CARS[n])
