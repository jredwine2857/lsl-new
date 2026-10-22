"""Chapter 3: the Zone's checkpoint on Vine Street. The barricade, Farkus,
Grover and Willow are drawn by the game (the barricade changes state)."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, brick, mat, out_dir, planks  # noqa: E402

r = Room('ch3-checkpoint', floor_y=112)
D = r.D

r.sky('#5AB0F0', '#C0E4F8', d=90)
for i in range(6):
    x = i * 54
    c = ['#8A4A22', '#A83020'][i % 2]
    r.panel(x, 30, 52, 84, D, brick(c, '#4A2A20', scale=4, mortar_size=0.05), thick=30, name='house')
    r.panel(x - 1, 27, 54, 4, D - 0.1, mat('#E8E0D0'), thick=32, name='cornice')
    for w in range(3):
        for row in range(2):
            y = 40 + row * 22
            r.panel(x + 5 + w * 16, y - 1, 10, 14, D - 0.02, mat('#F0EAE0'), thick=1)
            r.panel(x + 6 + w * 16, y, 8, 12, D - 0.04, mat('#2A3A5A', rough=0.1, metal=0.4), thick=1)
    r.panel(x + 20, 90, 12, 24, D - 0.04, mat('#3A2414'), thick=1)
    r.panel(x + 18, 88, 16, 3, D - 0.06, mat('#E8E0D0'), thick=3)

r.floor(mat('#4A4A4E', rough=0.8))
r.slab(150, 112, mat('#9A9690', rough=0.8), height=1.5, name='sidewalk')
r.slab(200, 150, planks('#8A8A8A', '#6A6A6A', scale=0.6, axis='h', floor=True), height=0.5, name='street')

# street sign
r.post(300, 140, 0.8, 110, mat('#555555', metal=0.6), 'signpost')
r.panel(278, 112, 34, 9, r.floor_d(140) - 0.05, mat('#1A7A2A', rough=0.4), thick=1)
r.text('VINE ST', 295, 116.5, 5, r.floor_d(140) - 0.08, mat('#FFFFFF'))

r.ambient('#C8E0FF', 0.5)
r.sun('#FFF4DC', 3.5, angle=(50, 0, 25))
r.render(out_dir())
