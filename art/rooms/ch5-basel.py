"""Chapter 5: Art Basel, Miami Beach. The neon, the duct-taped banana and
the canvases are baked in; Moranis's chair and the people are drawn by the game."""

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

# neon
r.text('IS THIS ART?', 260, 35, 6.5, D - 0.08, mat('#F020B0', rough=0.3))

# gallery track lights
r.panel(-40, 6, 400, 2, D - 2, mat('#222222', metal=0.6), thick=4)
for x in (55, 120, 165):
    r.spot(x, 8, D - 2, (r.P(x, 60, D).x, D, r.P(x, 60, D).z), energy=180, size=45)

r.ambient('#F0F4FF', 0.55)
r.key(energy=180)
r.render(out_dir())
