"""Chapter 2: Encounter, the restaurant inside the Theme Building, at night.
Twinkling city lights, the lava lamp blob and the people are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch2-theme', floor_y=146)
D = r.D

WALL = mottled('#1A1424', '#2A1E36', scale=2)
r.panel(-40, -40, 60, 280, D, WALL, thick=4)
r.panel(260, -40, 120, 280, D, WALL, thick=4)
r.panel(20, -40, 240, 60, D, WALL, thick=4)
r.panel(20, 90, 240, 80, D, WALL, thick=4)
r.sky('#03030C', '#1A2058', d=90)
r.stars(25, 15, 50, d=89)
# LA at night far below
for i in range(30):
    x = i * 9 - 5
    h = 6 + (i * 37) % 14
    r.panel(x, 90 - h, 8, h + 20, 60, mat('#10121E'), thick=4, name='city')
r.panel(-60, 80, 440, 40, 61, glow('#3A2A50', 0.6), thick=2, name='haze')
for x in range(20, 261, 40):
    r.panel(x - 1, 18, 4, 74, D - 0.05, mat('#B0B0B8', metal=0.8, rough=0.3), thick=8)
r.panel(18, 17, 244, 3, D - 0.05, mat('#B0B0B8', metal=0.8), thick=8)
r.panel(18, 89, 244, 3, D - 0.05, mat('#B0B0B8', metal=0.8), thick=8)

# atomic starbursts
GOLD = glow('#FFD040', 0.9)
for cx, cy in [(60, 104), (160, 100), (230, 108)]:
    for a in range(8):
        import math
        ang = a / 8 * math.tau
        pts = [(cx + math.cos(ang) * 1.2, cy + math.sin(ang) * 1.2), (cx + math.cos(ang) * 10, cy + math.sin(ang) * 10),
               (cx + math.cos(ang + 0.2) * 1.2, cy + math.sin(ang + 0.2) * 1.2)]
        r.poly(pts, D - 0.1, GOLD, name='burst')
    r.oval(cx, cy, 2, 2, D - 0.12, glow('#FFFFFF', 2), thick=2)

# lava lamp body (the blob is drawn by the game)
r.post(11, 152, 5, 118, mat('#6A2A8A', rough=0.05, metal=0.2), 'lavalamp', verts=20)
r.post(11, 153, 6, 146, mat('#C0C0C8', metal=1, rough=0.2), 'lavabase', verts=20)

# elevator to the observation deck
r.panel(268, 68, 38, 86, D - 0.05, mat('#C0C0C8', metal=0.9, rough=0.25), thick=2)
r.panel(270, 70, 34, 82, D - 0.08, planks('#9A5A22', '#6A3A12', scale=3, axis='v'), thick=1)
r.panel(286, 70, 2, 82, D - 0.1, mat('#E0B840', metal=1, rough=0.25), thick=0.5)
r.text('DECK', 287, 64, 4.5, D - 0.1, glow('#FFFFFF', 1.0))

r.floor(planks('#9A1A8A', '#D040C0', scale=1.0, axis='h', floor=True))
# round white tables
for tx in (48, 118, 184):
    r.post(tx, 160, 1.2, 152, mat('#C8C8C8', metal=0.8), 'tableleg')
    r.disc(tx, 160, 16, 151, 1.5, mat('#F4F4F4', rough=0.3), 'tabletop')

for x in (60, 160, 230):
    r.lamp(x, 100, D - 1, color='#FFC860', energy=60)
r.ambient('#4030A0', 0.4)
r.key(energy=160, color='#FFD8C0')
r.render(out_dir())
