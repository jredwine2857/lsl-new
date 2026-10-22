"""Chapter 4: courtside at a Lakers game. The jumbotron picture and ticker,
the ball and the people are drawn by the game."""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402
import kit  # noqa: E402

r = Room('ch4-arena', floor_y=70)
D = r.D

# the stands: rows of crowd fading into the dark
r.wall(mottled('#3A0A3A', '#7A207A', scale=9, detail=8))
for y in range(14, 70, 7):
    r.panel(-40, y, 400, 1, D - 0.05, mat('#1A0418'), thick=4, name='row')

# jumbotron hanging over center court
r.panel(98, 12, 124, 54, D - 3, mat('#2A2A2E', metal=0.6, rough=0.3), thick=20)
r.panel(104, 18, 112, 34, D - 3.02, mat('#050505'), thick=0.5)
r.panel(104, 54, 112, 8, D - 3.02, mat('#050505'), thick=0.5)
r.panel(159, -20, 2, 32, D - 2.5, mat('#333333', metal=0.8), thick=2)

# hardwood court with the center circle and LAKERS
r.floor(planks('#C0844A', '#9A6430', scale=1.6, axis='v', floor=True, rough=0.4))
r.slab(100.6, 99.6, mat('#FFFFFF'), height=0.2, name='centerline')
r.disc(160, 100, 26, 99.9, 0.3, mat('#5A1A8A'), 'circle')
r.disc(160, 100, 23, 99.85, 0.35, planks('#C0844A', '#9A6430', scale=1.6, axis='v', floor=True, rough=0.4), 'circle_in')
d = r.floor_d(114)
bpy.ops.object.text_add(location=(r.P(160, 114, d).x, d, 0.02), rotation=(0, 0, 0))
t = bpy.context.object
t.data.body = 'LAKERS'
t.data.size = 11 * r.m(d) / 0.72 * 3
t.data.align_x = 'CENTER'
t.data.align_y = 'CENTER'
t.data.font = kit.BOLD or t.data.font
t.data.materials.append(mat('#5A1A8A'))
t.scale = (1, 0.45, 1)
r.crisp.append(t)

# courtside apron and seats
r.slab(152, 128, mat('#6A1A7A', rough=0.4), height=0.5, name='apron')
for x in range(6, 320, 30):
    r.block(x, 20, 139, 150, 10, mat('#F8C820', rough=0.5), 'seat', lift=3)
    r.block(x, 20, 130, 142, 2, mat('#F8C820', rough=0.5), 'seatback', lift=8)
r.slab(200, 152, mottled('#1A1A1E', '#2A2A2E', scale=4, floor=True), height=0.6, name='front')

r.ambient('#6040A0', 0.35)
r.key(energy=120)
for x in (60, 160, 260):
    r.spot(x, -20, D - 4, (r.P(x, 100, r.floor_d(100)).x, r.floor_d(100), 0), color='#FFF8E8', energy=180, size=70)
r.render(out_dir())
