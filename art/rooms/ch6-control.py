"""Chapter 6: LaffX Mission Control. The big screen's picture, console
lights and the people are drawn by the game; the launch button is baked in."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch6-control', floor_y=136)
D = r.D

r.wall(mottled('#0E1018', '#181A24', scale=2))
r.panel(54, 12, 212, 78, D - 0.05, mat('#3A3A42', metal=0.6), thick=6)
r.panel(60, 18, 200, 66, D - 0.08, mat('#050508'), thick=0.5)
r.text('MISSION CONTROL', 160, 7, 3.5, D - 0.05, glow('#60A0FF', 1.0))

# tiered consoles
for i in range(3):
    y = 96 + i * 14
    d = D - 0.6 - i * 0.9
    r.panel(10, y, 300, 10, d, mat('#3A3C44', metal=0.4, rough=0.4), thick=20, name='console')
    r.panel(10, y - 1, 300, 1.5, d - 0.02, mat('#6A6C74', metal=0.6), thick=20, name='console_top')
    for x in range(16, 300, 36):
        r.panel(x + 8, y + 2, 10, 5, d - 0.03, glow('#3070D0', 0.6), thick=0.3, name='monitor')

r.floor(planks('#2A2C34', '#14161C', scale=1.0, axis='h', floor=True, rough=0.4))

# the launch button
r.block(196, 24, 140, 152, 12, mat('#B8BCC0', metal=0.6), 'buttonbox', lift=2)
r.block(202, 12, 141, 150, 6, glow('#E01010', 0.6), 'button', lift=6)

r.ambient('#5060A0', 0.6)
r.key(energy=160, color='#C8D8FF')
r.lamp(160, 60, D - 2, color='#80A0FF', energy=200, radius=2)
r.render(out_dir())
