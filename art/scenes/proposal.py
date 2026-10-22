"""The proposal close-up: Larry on one knee holding out a big shiny diamond,
Grace with her hands over her mouth, and an extreme close-up of the ring.

    python3 art/scenes/proposal.py   # writes src/art/scenes/proposal-*.png
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scenekit as sk  # noqa: E402
from scenekit import rad  # noqa: E402

PPM = 80  # game pixels per metre for the two-shot


def larry_kneeling():
    c = sk.character('larry')
    c.root.rotation_euler = rad(0, 0, 90)  # facing right
    j = c.j
    c.pelvis.location.z = 0.45
    j['hipR'].rotation_euler = rad(-88, 0, 0)
    j['kneeR'].rotation_euler = rad(92, 0, 0)
    j['hipL'].rotation_euler = rad(8, 0, 0)
    j['kneeL'].rotation_euler = rad(88, 0, 0)
    j['ankleL'].rotation_euler = rad(-60, 0, 0)
    c.chest.rotation_euler = rad(-6, 0, 0)
    j['shoulderR'].rotation_euler = rad(-78, 0, 0)
    j['elbowR'].rotation_euler = rad(-8, 0, 0)
    j['wristR'].rotation_euler = rad(86, 0, 0)
    j['shoulderL'].rotation_euler = rad(-30, 0, -10)
    j['elbowL'].rotation_euler = rad(-105, 0, 0)
    c.neck.rotation_euler = rad(-5, 0, 0)
    sk.ring_box(c, 'R', scale=1.6)
    sk.shoot('proposal-larry', 120, 110, cam=(0.1, -8, 0.62), target=(0.1, 0, 0.62), ppm=PPM)


def grace_gasping():
    c = sk.character('grace')
    c.root.rotation_euler = rad(0, 0, -90)  # facing left
    j = c.j
    for s, sy in (('L', 1), ('R', -1)):
        j['shoulder' + s].rotation_euler = rad(-38, 0, sy * -14)
        j['elbow' + s].rotation_euler = rad(-128, 0, 0)
    c.neck.rotation_euler = rad(6, 0, 0)
    sk.shoot('proposal-grace', 80, 150, cam=(0, -8, 0.88), target=(0, 0, 0.88), ppm=PPM)


def ring_closeup():
    """The money shot: an open velvet box, a gold band and a diamond the size of a karaoke mic."""
    import bpy
    sk.reset()
    from kit import mat
    red = mat('#8A0E1C', rough=0.75)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.025))
    base = bpy.context.active_object
    base.scale = (0.11, 0.1, 0.05)
    base.modifiers.new('b', 'BEVEL').width = 0.006
    base.data.materials.append(red)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.052, 0.09))
    lid = bpy.context.active_object
    lid.scale = (0.11, 0.012, 0.09)
    lid.rotation_euler = rad(-22, 0, 0)
    lid.modifiers.new('b', 'BEVEL').width = 0.006
    lid.data.materials.append(red)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.045, 0.09))
    satin = bpy.context.active_object
    satin.scale = (0.095, 0.004, 0.075)
    satin.rotation_euler = rad(-22, 0, 0)
    satin.data.materials.append(mat('#B89A88', rough=0.5))
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.052))
    cush = bpy.context.active_object
    cush.scale = (0.095, 0.085, 0.008)
    cush.data.materials.append(mat('#3A0610', rough=0.95))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.0045, location=(0, 0, 0.08))
    ring = bpy.context.active_object
    ring.rotation_euler = rad(90, 0, 25)
    ring.data.materials.append(mat('#F2C64A', rough=0.12, metal=1.0))
    gem = [mat('#FFFFFF', emit=2.2), mat('#BFE6FF', emit=1.4), mat('#6A9CE0', emit=0.9)]
    for depth, r1, r2, z, flip in ((0.012, 0.022, 0.012, 0.123, False), (0.02, 0.022, 0.0, 0.107, True)):
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=r1, radius2=r2, depth=depth, location=(0, 0, z))
        o = bpy.context.active_object
        o.data.polygons.foreach_set('use_smooth', [False] * len(o.data.polygons))
        if flip:
            o.rotation_euler = rad(180, 0, 0)
        # pixel-art facets: alternate white, ice and blue faces so the stone glitters
        for g in gem:
            o.data.materials.append(g)
        for i, poly in enumerate(o.data.polygons):
            poly.material_index = (i + (1 if flip else 0)) % 3
    for x in (-0.006, 0.006):  # prongs
        bpy.ops.mesh.primitive_cylinder_add(radius=0.0018, depth=0.018, location=(x, -0.004, 0.112))
        bpy.context.active_object.data.materials.append(mat('#F2C64A', rough=0.12, metal=1.0))
    sk.shoot('proposal-ring', 320, 200, cam=(0.12, -0.5, 0.32), target=(0, 0, 0.085), ppm=320 / 0.24,
             lights=[('#FFFFFF', 6.0, (35, 0, -20)), ('#FFE8C8', 3.0, (60, 0, 140)), ('#C8D8FF', 2.0, (80, 0, 60))],
             world='#3A3048', world_strength=1.2, colors=96, rim=False)


which = sys.argv[1:] or ['larry', 'grace', 'ring']
if 'larry' in which:
    larry_kneeling()
if 'grace' in which:
    grace_gasping()
if 'ring' in which:
    ring_closeup()
