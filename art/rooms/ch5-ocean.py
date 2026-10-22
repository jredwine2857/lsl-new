"""Chapter 5: Ocean Drive at night. Art deco hotels, palms and the
Cybertruck are baked in; traffic, Elon and the guard are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, tiles  # noqa: E402

r = Room('ch5-ocean', floor_y=130)
D = r.D

r.sky('#05031A', '#2A1050', d=90)
r.stars(25, -5, 30, d=89)
# art deco hotels
COLS = ['#FF70D8', '#A8FFD0', '#70E8F8', '#FFCCA8']
NEON = ['#FF40D0', '#4060FF', '#FF40D0', '#4060FF']
for i in range(4):
    x = i * 80
    r.panel(x + 4, 30, 72, 102, D, mottled(COLS[i], COLS[i], scale=2), thick=40, name='hotel')
    r.panel(x + 2, 28, 76, 4, D - 0.1, mat('#FFFFFF'), thick=42, name='cornice')
    r.panel(x + 30, 18, 20, 12, D - 0.05, mat(COLS[i]), thick=20, name='deco_tower')
    r.text(['PEARL', 'TIDES', 'CARDOZO', 'LARRY'][i], x + 40, 37, 5.5, D - 0.12, glow(NEON[i], 1.0))
    for w in range(3):
        for row in range(3):
            r.panel(x + 12 + w * 20, 44 + row * 24, 10, 14, D - 0.03, glow('#FFE070', 0.8), thick=1)
            r.panel(x + 10 + w * 20, 58 + row * 24, 14, 2, D - 0.15, mat('#FFFFFF'), thick=8)
for x in (0, 80, 160, 240):
    r.lamp(x + 40, 120, D - 1, color='#FF80E0', energy=60)
for px in (78, 238):
    r.palm(px, 152, 64)

r.floor(mat('#2A2A30', rough=0.6))
r.slab(150, 128, tiles('#C8C4C0', '#A09C98', scale=1.2, rough=0.8), height=1, name='sidewalk')
r.slab(186, 150, tiles('#FFC8A0', '#E0A880', scale=1.0, rough=0.8), height=1.2, name='promenade')

# Cybertruck: one big steel wedge
d = r.floor_d(158)
STEEL = mat('#B8BCC0', metal=0.9, rough=0.35)
for off in (0.0, 1.2):
    r.poly([(120, 152), (120, 146), (150, 133), (190, 145), (190, 152)], d + off, STEEL, thick=2, name='cyber_side')
from kit import Vector  # noqa: E402
a = r.P(120, 146, d)
b = r.P(190, 152, d)
r.box(((a.x + b.x) / 2, d + 0.6, (a.z + b.z) / 2), (b.x - a.x, 1.2, a.z - b.z), STEEL, 'cyber_body')
r.poly([(140, 140), (150, 136), (168, 141), (164, 143)], d - 0.05, mat('#101418', metal=0.6, rough=0.1), thick=0.5, name='cyber_glass')
for wx in (132, 178):
    c = r.P(wx, 158, d)
    c.z = 6 * r.m(d)
    r.cyl(c, 6 * r.m(d), 0.3, mat('#141414'), 'wheel', rot=(1.5708, 0, 0))

# dock gate
r.post(292, 154, 2, 118, mat('#F4F4F4'), 'gatepost')
r.panel(284, 119, 40, 5, r.floor_d(154) - 0.1, mat('#2040C0'), thick=2)

for px in (78, 238):
    r.lamp(px + 6, 75, r.floor_d(152) - 1.5, color='#FFC0E8', energy=120, radius=0.5)
r.ambient('#6040C0', 0.45)
r.key(energy=160, color='#FFD0F0')
r.render(out_dir())
