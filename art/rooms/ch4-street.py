"""Chapter 4: Long Beach at sunset, outside Snoop's. Smoke over the gate,
the lowrider, Affleck's coffee and the people are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks, tiles  # noqa: E402

r = Room('ch4-street', floor_y=147)
D = r.D

r.sky('#FF60C0', '#FFB040', d=90)
r.panel(-60, 52, 440, 30, 88, glow('#FF6A40', 1.0), thick=1, name='sunset_band')
r.oval(220, 72, 20, 10, 87, glow('#FFF080', 1.2), thick=1, name='sun')
r.panel(-60, 80, 440, 40, 86, mottled('#2050C0', '#3A70E0', scale=0.2, emit=0.6), thick=1, name='ocean')
r.panel(-60, 80, 440, 1.2, 85.9, glow('#FFD0A0', 1.0), thick=1, name='glint')

# white stucco wall and houses
r.panel(-40, 94, 400, 70, D, mottled('#F0ECE4', '#DAD4CA', scale=3), thick=8, name='wall')
r.panel(-40, 92, 400, 3, D - 0.1, mat('#C8A07A'), thick=10, name='coping')
for tx in (62, 152, 272):
    r.palm(tx, 152, 26)

# Snoop's gate
r.panel(-2, 98, 34, 56, D - 0.1, mat('#3A2410'), thick=3)
r.panel(0, 100, 30, 52, D - 0.15, planks('#8A5A2A', '#2A1808', scale=4, axis='h'), thick=2)

r.floor(mat('#34343A', rough=0.7))
r.slab(186, 150, tiles('#C0BCB4', '#9A968E', scale=1.0, rough=0.8), height=1.5, name='sidewalk')
r.block(-200, 720, 184.5, 186.5, 1, mat('#E8E8E8'), 'curb')

# the RV
RV = mat('#F4F2EA', rough=0.4)
r.block(170, 90, 110, 154, 30, RV, 'rv', lift=5)
r.block(170, 90, 127, 154.2, 30.5, mat('#9A5A2A'), 'rvstripe', lift=23)
r.panel(176, 116, 20, 10, r.floor_d(154) - 0.03, mat('#80C8E0', rough=0.05, metal=0.4), thick=0.5)
r.panel(236, 116, 10, 25, r.floor_d(154) - 0.03, mat('#2A2A2A'), thick=0.5)
r.panel(248, 120, 3, 3, r.floor_d(154) - 0.05, glow('#FF4040', 1.5), thick=0.5)
for wx in (186, 244):
    c = r.P(wx, 154, r.floor_d(154))
    c.z = 4 * r.m(r.floor_d(154))
    r.cyl(c, 4 * r.m(r.floor_d(154)), 0.3, mat('#141414'), 'wheel', rot=(1.5708, 0, 0))

# bus stop
r.post(297, 152, 0.8, 100, mat('#666666', metal=0.7), 'busstop')
r.panel(288, 100, 20, 10, r.floor_d(152) - 0.05, mat('#2040C0', rough=0.4), thick=1)
r.text('LA', 298, 105, 5, r.floor_d(152) - 0.08, mat('#FFFFFF'))

r.ambient('#FFC8C0', 0.5)
r.sun('#FFD0A0', 2.2, angle=(60, 0, -40))
r.render(out_dir())
