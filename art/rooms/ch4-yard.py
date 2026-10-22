"""Chapter 4: Snoop's backyard cypher at night. String-light bulbs, smoke,
the ring light and the people are drawn by the game; the DJ booth is fg."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch4-yard', floor_y=112)
D = r.D

r.sky('#04041A', '#1A2A70', d=90)
r.stars(30, -5, 60, d=89)
r.tree(20, 92, 30, leaves='#0E2A1A', leaves2='#1E3A2A')
r.tree(300, 92, 24, leaves='#0E2A1A', leaves2='#1E3A2A')
r.panel(-40, 89, 400, 24, D, planks('#7A4A22', '#3A2008', scale=2.2, axis='v'), thick=4, name='fence')
r.panel(-40, 88, 400, 2, D - 0.05, mat('#5A3410'), thick=6, name='fencecap')
# string-light wire
for i in range(16):
    x = 10 + i * 19
    r.panel(x - 9.5, 30 + 10 * abs(((i % 4) - 1.5) / 1.5) ** 2 + 8, 19, 0.6, D - 2, mat('#151515'), thick=0.5, name='wire')

r.floor(mottled('#2A6A2A', '#3A8A30', scale=3, floor=True))

# smoker grill
SM = mat('#1A1A1A', rough=0.4, metal=0.5)
r.block(6, 40, 114, 140, 18, SM, 'smoker', lift=6)
r.post(38, 120, 2, 98, SM, 'chimney')
for x in (10, 40):
    r.post(x, 141, 1, 130, SM, 'smokerleg')
r.lamp(26, 130, r.floor_d(140) - 0.5, color='#FF6020', energy=40, radius=0.2)

# Snoop's lawn chair
r.block(48, 26, 145, 152, 10, mat('#F0C820', rough=0.5), 'chair', lift=4)
r.block(48, 26, 130, 146, 2, mat('#F0C820', rough=0.5), 'chairback', lift=14)

# DJ booth (fg: Dre stands behind it)
r.block(116, 50, 127, 152, 14, mat('#2A2A2E', rough=0.4), 'booth', fg=True)
for x in (122, 148):
    r.disc(x + 6, 152, 6, 126.5, 1, mat('#B0B0B0', metal=0.8), 'turntable', fg=True)
r.text('DRE', 141, 141, 6, r.floor_d(152) - 0.05, mat('#F0F0F0'), fg=True)

# Sandler's cooler, the mic stand
r.block(190, 22, 155, 170, 12, mat('#3A70E0', rough=0.3), 'cooler')
r.block(189, 24, 154, 170.2, 13, mat('#F0F0F0', rough=0.3), 'coolerlid', lift=13)
r.post(232, 172, 0.5, 140, mat('#B0B0B0', metal=0.9), 'micstand')
r.ball(232, 139, r.floor_d(172) - 0.03, 2, mat('#151515'), 'mic')

for x in (60, 160, 260):
    r.lamp(x, 40, D - 2, color='#FFC860', energy=60, radius=0.1)
r.ambient('#3040A0', 0.45)
r.key(energy=160, color='#FFD8B0')
r.render(out_dir())
