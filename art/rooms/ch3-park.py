"""Chapter 3: Washington Park, in front of Cincinnati Music Hall. Fountain
jets, the football, the streetcar and the people are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, brick, glow, mat, mottled, out_dir, tiles  # noqa: E402

r = Room('ch3-park', floor_y=90)
D = r.D

r.sky('#6AB8F0', '#C8E8F8', d=90)
for x, y, w in [(30, 20, 40), (240, 30, 50), (180, 12, 30)]:
    r.cloud(x, y, w)

# Music Hall: red brick Gothic with a central tower
BR = brick('#B03A28', '#6A2A20', scale=4, mortar_size=0.05, vary='#A03020')
r.panel(100, 30, 120, 62, D, BR, thick=30)
r.poly([(98, 31), (130, 14), (190, 14), (222, 31)], D - 0.02, mat('#5A3A3A', rough=0.7), thick=30)
r.panel(154, 6, 12, 86, D - 0.3, BR, thick=12)
r.poly([(153, 7), (160, -4), (167, 7)], D - 0.32, mat('#4A3030'), thick=12)
r.oval(160, 38, 7, 7, D - 0.35, mat('#F0E0A0', rough=0.4), thick=1)
r.panel(159.5, 33, 1, 5, D - 0.37, mat('#202020'), thick=0.3)
for x in range(108, 216, 14):
    if 150 < x < 168:
        continue
    r.panel(x, 44, 6, 12, D - 0.05, mat('#D8D0B8'), thick=1)
    r.poly([(x, 44), (x + 3, 40), (x + 6, 44)], D - 0.05, mat('#D8D0B8'), thick=1)
    r.panel(x + 1, 64, 4, 14, D - 0.05, mat('#3A3A4A'), thick=1)
r.panel(150, 70, 20, 22, D - 0.4, mat('#2A1A14'), thick=1)

# the lawn and trees
r.floor(mottled('#3A9A2A', '#6ACA3A', scale=3, floor=True))
for tx in (28, 258, 304):
    r.tree(tx, 100, 48, leaves='#2A7A2A', leaves2='#5AB83A')
r.tree(-4, 120, 40, leaves='#2A7A2A', leaves2='#5AB83A')

# path and streetcar tracks
r.slab(186, 150, tiles('#C8C4BC', '#A09C94', scale=1.2, rough=0.8), height=0.5, name='path')
r.slab(200, 186, mat('#4A4A4E', rough=0.8), height=0.4, name='trackbed')
for y in (190, 196):
    r.slab(y + 0.6, y, mat('#C0C0C4', metal=1, rough=0.3), height=0.6, name='rail')

# vegan tent
r.poly([(24, 126), (66, 94), (108, 126)], r.floor_d(128) + 0.2, mat('#F4F4F0', rough=0.8), thick=40, name='tent')
r.panel(30, 111, 72, 7, r.floor_d(128) - 0.02, mat('#7AE060'), thick=1)
r.text('VEGAN', 66, 114.5, 4.5, r.floor_d(128) - 0.05, mat('#1A6A1A'))
for x in (28, 104):
    r.post(x, 128, 0.8, 120, mat('#888888', metal=0.8), 'tentpole')

# fountain basin
r.disc(156, 140, 38, 134, 6, mat('#B8B8B4', rough=0.6), 'basin')
r.disc(156, 140, 34, 133.5, 1, mat('#3A7AE0', rough=0.05, metal=0.2), 'water')

r.ambient('#C8E0FF', 0.5)
r.sun('#FFF4DC', 3.5, angle=(50, 0, 25))
r.render(out_dir())
