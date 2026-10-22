"""Chapter 5: the deck of the Yacht Gigabyte in Biscayne Bay at night.
Skyline window lights, string lights, the deck chair and the people are
drawn by the game; the skyline here matches the game's building positions."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch5-yacht', floor_y=122)
D = r.D

r.sky('#02020C', '#14184A', d=90)
r.stars(30, -5, 40, d=89)
# Miami skyline (same positions as the game's twinkling windows)
for i in range(14):
    h = 20 + (i * 37) % 40
    r.panel(i * 24, 100 - h, 20, h + 2, D + 2, mottled('#3A3A48', '#2A2A36', scale=4), thick=10, name='tower')
    r.panel(i * 24 - 1, 100 - h - 2, 22, 2, D + 1.9, mat('#5A5A6A'), thick=10, name='roof')
r.panel(-40, 100, 400, 22, D + 1, mottled('#0A1A50', '#1A3080', scale=1, emit=0.3), thick=1, name='bay')

# deck: rail, teak and the stern railing
r.floor(planks('#C89A62', '#7A5228', scale=1.4, axis='v', floor=True, rough=0.35))
r.panel(-40, 117, 400, 5, D - 0.05, mat('#F8F8F8', rough=0.3), thick=6, name='gunwale')
r.slab(201, 186, mat('#F4F4F4', rough=0.3), height=1.5, name='stern')
for x in range(0, 330, 20):
    r.post(x + 1, 194, 0.8, 184, mat('#E0E0E8', metal=0.9, rough=0.2), 'stanchion')
r.block(-200, 720, 184, 186, 1, mat('#E0E0E8', metal=0.9, rough=0.2), 'rail', lift=7)

# string light wire
for i in range(16):
    r.panel(i * 19, 108.5, 19, 0.4, D - 0.5, mat('#202020'), thick=0.5, name='wire')

for x in (60, 160, 260):
    r.lamp(x, 100, D - 1, color='#FFD890', energy=90)
r.ambient('#3040A0', 0.45)
r.key(energy=150, color='#FFE0C0')
r.render(out_dir())
