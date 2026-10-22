"""Chapter 1: the Pear Store. White, silent, full of tables. The Genius is
drawn by the game behind the demo table (the fg layer)."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, out_dir, tiles  # noqa: E402

r = Room('ch1-pear', floor_y=110)
D = r.D

r.wall(mat('#F6F6F4', rough=0.6))
r.floor(tiles('#E8E8E4', '#D0D0CC', scale=0.6, rough=0.15))
r.panel(-10, -10, 340, 18, D - 0.5, glow('#FFFFFF', 1.2), thick=30)

# the logo
r.oval(160, 47, 10, 12.5, D - 0.05, mat('#B8B8BC', rough=0.3, metal=0.3), thick=2)
r.oval(160, 33, 5, 5, D - 0.05, mat('#B8B8BC', rough=0.3, metal=0.3), thick=2)
r.panel(161, 22, 4, 4, D - 0.06, mat('#50D050'), thick=2)
r.text('think different. pay more.', 160, 73, 4.5, D - 0.05, mat('#9A9A9A'), font=None)

# wall of accessories nobody can afford
for i in range(5):
    for side in (20, 236):
        r.panel(side + i * 13, 40, 10, 14, D - 0.1, mat('#E0E0E0'), thick=2)
        r.panel(side + i * 13, 62, 10, 14, D - 0.1, mat('#D8D8D8'), thick=2)

# demo table (fg) with phones
WOOD = mat('#D8A06A', rough=0.4)
r.block(96, 128, 112, 146, 22, WOOD, 'table', fg=True, lift=26)
r.block(100, 4, 120, 146, 4, mat('#A07040'), 'leg', fg=True)
r.block(216, 4, 120, 146, 4, mat('#A07040'), 'leg', fg=True)
for i in range(6):
    r.block(104 + i * 20, 6, 110, 140, 3, mat('#101010', rough=0.1), 'phone', fg=True, lift=30)

r.ambient('#FFFFFF', 0.7)
r.key(energy=300)
r.render(out_dir())
