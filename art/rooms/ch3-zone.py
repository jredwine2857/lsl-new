"""Chapter 3: the Summer of Love Zone in Over-the-Rhine. The drum circle,
cardboard and people are drawn by the game; the G-Wagon is baked in."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, brick, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch3-zone', floor_y=110)
D = r.D

r.sky('#5AB0F0', '#C0E4F8', d=90)
# Over-the-Rhine brick row houses
for i in range(6):
    x = i * 54
    c = ['#A83020', '#8A4A22'][i % 2]
    r.panel(x, 40, 52, 72, D, brick(c, '#4A2A20', scale=4, mortar_size=0.05), thick=30, name='house')
    r.panel(x - 1, 37, 54, 4, D - 0.1, mat('#E8E0D0'), thick=32, name='cornice')
    for w in range(3):
        r.panel(x + 5 + w * 16, 51, 10, 14, D - 0.02, mat('#F0EAE0'), thick=1)
        r.panel(x + 6 + w * 16, 52, 8, 12, D - 0.04, mat('#2A3A5A', rough=0.1, metal=0.4), thick=1)
        r.panel(x + 5 + w * 16, 78, 10, 14, D - 0.02, mat('#F0EAE0'), thick=1)
        r.panel(x + 6 + w * 16, 79, 8, 12, D - 0.04, mat('#2A3A5A', rough=0.1, metal=0.4), thick=1)

# protest banner on poles
r.panel(18, 14, 2, 98, D - 2, mat('#555555', metal=0.6), thick=2)
r.panel(300, 14, 2, 98, D - 2, mat('#555555', metal=0.6), thick=2)
r.panel(20, 16, 280, 22, D - 2, mat('#F4F4EE', rough=0.9), thick=0.5)
r.text('WHAT DO WE WANT? VIBES!', 160, 22, 5.5, D - 2.05, mat('#C020B0'), extrude=0.1)
r.text('WHEN DO WE WANT THEM? EVENTUALLY!', 160, 32, 4.5, D - 2.05, mat('#2030C0'), extrude=0.1)

# trampled lawn and the street
r.floor(mottled('#4A8A2A', '#7A6A3A', scale=3, floor=True))
r.slab(200, 150, planks('#9A9A9A', '#7A7A7A', scale=0.6, axis='h', floor=True), height=0.5, name='street')

# tents
for tx, c in ((30, '#FF60E0'), (80, '#F8E040')):
    r.poly([(tx, 128), (tx + 18, 104), (tx + 36, 128)], r.floor_d(130), mat(c, rough=0.8), thick=24, name='tent')

# G-Wagon with a QR code and a COEXIST sticker
r.car(205, 82, 112, 158, '#F4F4F4', kind='gwagon', name='gwagon')
r.panel(246, 120, 16, 16, r.floor_d(158) - 0.08, mat('#0A0A0A'), thick=0.5)
for (qx, qy) in [(249, 123), (255, 129), (249, 129), (255, 123)]:
    r.panel(qx, qy, 4, 4, r.floor_d(158) - 0.1, mat('#FFFFFF'), thick=0.3)
r.text('COEXIST', 277, 142, 3.5, r.floor_d(158) - 0.08, mat('#2030C0'))

# hoodie rack
r.post(291, 150, 0.6, 117, mat('#888888', metal=0.8), 'rack')
r.post(313, 150, 0.6, 117, mat('#888888', metal=0.8), 'rack')
r.panel(290, 117, 24, 2, r.floor_d(150) + 0.05, mat('#888888', metal=0.8), thick=1)
for i in range(3):
    r.panel(292 + i * 7, 120, 6, 26, r.floor_d(150) + 0.04, mat('#151515', rough=0.9), thick=2)

r.ambient('#C8E0FF', 0.5)
r.sun('#FFF4DC', 3.5, angle=(50, 0, 25))
r.render(out_dir())
