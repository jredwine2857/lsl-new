"""Chapter 1: the Lost Wages Galleria. Ken and Roberta and the KQ5 box on
the bench are drawn by the game; the bench is baked in."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, checker, glow, mat, mottled, out_dir  # noqa: E402

r = Room('ch1-mall', floor_y=124)
D = r.D

r.wall(mottled('#C8C4BC', '#B4B0A8', scale=2))
r.floor(checker('#F2F0EA', '#A8A8A8', scale=1.1, rough=0.15))
# skylights
r.panel(-10, -10, 340, 46, D - 0.2, mat('#5A5A60'), thick=40)
for x in range(0, 320, 16):
    r.panel(x, 14, 10, 18, D - 0.25, glow('#D8F0FF', 1.2), thick=1)
r.lamp(160, 50, D - 3, color='#FFFFFF', energy=300, radius=3)

# Babbage's
r.panel(20, 40, 112, 86, D - 0.05, mat('#C01818', rough=0.4), thick=3)
r.panel(24, 44, 104, 14, D - 0.1, glow('#FFFFFF', 0.9), thick=1)
r.text("BABBAGE'S", 76, 51, 8, D - 0.15, mat('#C01010'))
r.panel(56, 76, 40, 50, D - 0.1, mat('#101010'), thick=1)
for i, (x, y, c) in enumerate([(28, 64, '#5070FF'), (28, 86, '#FFE040'), (102, 64, '#50E050'), (102, 86, '#FF50E0')]):
    r.panel(x - 1, y - 1, 20, 16, D - 0.1, mat('#E8E8E8'), thick=1)
    r.panel(x, y, 18, 14, D - 0.15, mat(c), thick=2)
    r.text(['KQ', 'SQ', 'PQ', 'LSL'][i], x + 9, y + 7, 4, D - 0.2, mat('#FFFFFF'), crisp=False)

# Spirit Halloween (formerly Sears)
r.panel(134, 40, 54, 30, D - 0.05, mat('#0A0A0A'), thick=3)
r.text('SPIRIT', 161, 48, 6.5, D - 0.1, glow('#FF3020', 1.0))
r.text('HALLOWEEN', 161, 60, 4.2, D - 0.1, mat('#F0F0F0'))
r.panel(134, 72, 54, 54, D - 0.04, mat('#8A8A84'), thick=1)
r.text('SEARS', 161, 82, 6, D - 0.06, mat('#9A9A94'), crisp=False)

# the Pear store
r.panel(190, 40, 112, 86, D - 0.05, mat('#F4F4F4', rough=0.2), thick=3)
r.oval(246, 55, 6, 7.5, D - 0.1, mat('#B0B0B4', rough=0.3, metal=0.3), thick=1)
r.oval(246, 47, 3, 3, D - 0.1, mat('#B0B0B4', rough=0.3, metal=0.3), thick=1)
r.panel(247, 40, 3, 3, D - 0.12, mat('#50D050'), thick=1)
r.panel(226, 76, 40, 50, D - 0.1, glow('#E0F4FF', 0.6), thick=1)
r.panel(245, 76, 2, 50, D - 0.12, mat('#C0C0C0', metal=0.8), thick=0.5)

# the bench
WOOD = mat('#9A6A3A', rough=0.5)
r.block(128, 64, 146, 158, 12, WOOD, 'bench', fg=True, lift=6)
r.block(132, 4, 150, 158, 10, mat('#4A3018'), 'leg', fg=True)
r.block(184, 4, 150, 158, 10, mat('#4A3018'), 'leg', fg=True)
# planters
for x in (8, 290):
    r.block(x, 24, 132, 152, 20, mat('#B87A4A', rough=0.7), 'planter')
    r.tree(x + 12, 140, 96, leaves='#2E8A3A', leaves2='#6ACF4A')

r.ambient('#E0E8F0', 0.5)
r.key(energy=250)
r.render(out_dir())
