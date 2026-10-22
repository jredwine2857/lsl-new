"""Chapter 5: Art Basel, Miami Beach. The neon, the duct-taped banana, the
goat painting behind its velvet rope and the canvases are baked in; Moranis's chair and the people are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir  # noqa: E402

r = Room('ch5-basel', floor_y=148)
D = r.D

r.wall(mat('#F8F8F6', rough=0.7))
r.panel(-40, 140, 400, 10, D - 0.03, mat('#C8C8C4'), thick=3, name='baseboard')
r.floor(mottled('#B8B8B4', '#D0D0CC', scale=1.5, floor=True, rough=0.15))

# the banana, duct-taped to a canvas
r.panel(38, 48, 34, 34, D - 0.05, mat('#B8B8B4'), thick=3)
r.panel(40, 50, 30, 30, D - 0.08, mat('#FFFFFF', rough=0.9), thick=1)
r.poly([(46, 71), (50, 64), (58, 59), (66, 58), (64, 61), (57, 63), (51, 68), (49, 74)], D - 0.12, mat('#F8D820', rough=0.5), thick=3, name='banana')
r.panel(51, 59, 12, 4, D - 0.16, mat('#A8A8A8', rough=0.4, metal=0.3), thick=0.5, name='tape')
r.text('$6.2M', 55, 86.5, 4.5, D - 0.05, mat('#202020'))

# more art nobody understands
r.panel(100, 40, 40, 50, D - 0.06, mottled('#C01818', '#E02A20', scale=4), thick=2)
r.panel(150, 46, 30, 30, D - 0.06, mat('#1830B0'), thick=2)
r.oval(165, 61, 8, 8, D - 0.1, mat('#F8D820'), thick=1)

# a painting of a goat, and next to it the letters SE. That's the whole joke.
GOAT = mat('#8A7A68', rough=0.8)
r.panel(222, 44, 76, 44, D - 0.05, mat('#C8A040', rough=0.3, metal=0.6), thick=3, name='goatframe')
r.panel(225, 47, 70, 38, D - 0.08, mat('#FFFFFF', rough=0.9), thick=1)
r.panel(227, 79, 42, 4, D - 0.1, mat('#5AA040', rough=0.9), thick=0.5, name='grass')
r.oval(243, 68, 11, 6, D - 0.11, GOAT, thick=1, name='goatbody')
r.poly([(252, 64), (257, 57), (262, 57), (265, 62), (262, 66), (256, 67)], D - 0.12, GOAT, thick=1, name='goathead')
r.poly([(257, 57), (254, 50), (256, 50), (260, 57)], D - 0.13, mat('#3A3028'), thick=0.5, name='horn')
r.poly([(259, 66), (262, 66), (261, 71)], D - 0.13, mat('#E8E0D0'), thick=0.5, name='beard')
r.poly([(232, 66), (229, 62), (233, 64)], D - 0.12, GOAT, thick=0.5, name='goattail')
r.ball(261, 60, D - 0.14, 0.8, mat('#101010'))
for lx in (236, 240, 247, 251):
    r.panel(lx, 72, 2, 9, D - 0.1, GOAT, thick=0.5, name='goatleg')
r.text('SE', 282, 66, 15, D - 0.1, mat('#101010'))
r.text('VIEWER DISCRETION ADVISED', 260, 92, 3, D - 0.05, mat('#C01818'))
# velvet rope
BRASS = mat('#D0A840', metal=0.9, rough=0.25)
for px in (230, 290):
    r.post(px, 152, 1, 132, BRASS, 'ropepost')
    r.ball(px, 131, r.floor_d(152), 1.5, BRASS)
r.panel(230, 134, 60, 1.5, r.floor_d(152) - 0.02, mat('#A01020', rough=0.6), thick=1, name='rope')

# neon
r.text('IS THIS ART?', 260, 35, 6.5, D - 0.08, mat('#F020B0', rough=0.3))

# gallery track lights
r.panel(-40, 6, 400, 2, D - 2, mat('#222222', metal=0.6), thick=4)
for x in (55, 120, 165):
    r.spot(x, 8, D - 2, (r.P(x, 60, D).x, D, r.P(x, 60, D).z), energy=180, size=45)

r.ambient('#F0F4FF', 0.55)
r.key(energy=180)
r.render(out_dir())
