"""Chapter 1: Babbage's. The CRT demo, the Space Quest box in the bargain
bin and Gus are drawn by the game; the counter is the fg layer."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch1-babbages', floor_y=126)
D = r.D

r.wall(mottled('#F0D040', '#E0B830', scale=2))
r.floor(planks('#3040B0', '#4A60E0', scale=1.4, axis='h', floor=True))

BOX = ['#4060FF', '#D02020', '#20A040', '#B020B0', '#20B0B0', '#F0F0F0', '#FF6050']
TITLES = ['KQ', 'PQ', 'SQ', 'LSL', 'KQ', 'SQ', 'PQ']
# shelves of big boxes
for sx, n, w in ((10, 7, 90), (200, 1, 20)):
    for row in range(4):
        r.panel(sx, 52 + row * 20, w, 2, D - 0.6, mat('#7A4A1A'), thick=20)
        for i in range(n):
            c = BOX[(i + row) % len(BOX)]
            r.panel(sx + 2 + i * 12, 40 + row * 20, 10, 12, D - 0.65, mat(c, rough=0.4), thick=8)
            r.text(TITLES[(i + row) % len(TITLES)], sx + 7 + i * 12, 45 + row * 20, 2.6, D - 0.7, mat('#FFFFFF'), crisp=False)

# NO RETURNS sign with Larry's Polaroid
r.panel(110, 22, 100, 24, D - 0.05, mat('#D02020'), thick=1)
r.panel(111, 23, 98, 22, D - 0.07, mat('#F8F8F4', rough=0.9), thick=0.5)
r.text('NO RETURNS ON OPENED', 113, 27, 4, D - 0.09, mat('#C01010'), align='LEFT', extrude=0.1)
r.text('SOFTWARE.', 113, 34, 4, D - 0.09, mat('#C01010'), align='LEFT', extrude=0.1)
r.text('LOOKING AT YOU, LARRY', 113, 41, 4, D - 0.09, mat('#101010'), align='LEFT', extrude=0.1)
r.panel(196, 33, 9, 10, D - 0.1, mat('#FFFFFF'), thick=0.3)
r.panel(198, 35, 5, 5, D - 0.11, mat('#F0A070'), thick=0.3)

# CRT on a stand (picture drawn by the game)
r.panel(228, 68, 44, 38, D - 0.5, mat('#C8C4B8', rough=0.5), thick=24)
r.panel(233, 73, 34, 24, D - 0.52, mat('#080808', rough=0.1), thick=0.5)
r.panel(236, 106, 28, 30, D - 0.4, mat('#5A5A5A'), thick=20)

# counter (fg) and register
r.block(108, 104, 106, 134, 14, planks('#9A5A22', '#6A3A12', scale=3, axis='v'), 'counter', fg=True)
r.block(106, 108, 103, 134.5, 16, mat('#5A3010', rough=0.3), 'countertop', fg=True, lift=26)
r.block(178, 18, 94, 128, 12, mat('#4A4A4A', rough=0.4), 'register', fg=True, lift=28)

# bargain bin
r.block(226, 54, 146, 168, 22, mat('#E04040', rough=0.6), 'bin')
r.text('BARGAIN', 253, 156, 5, r.floor_d(168) - 0.05, mat('#FFFFFF'))
for i in range(5):
    if i != 2:
        r.block(230 + i * 10, 8, 138, 160, 3, mat('#30A040'), 'et')

r.lamp(160, 20, D - 3, color='#FFFFFF', energy=300, radius=3)
r.ambient('#F0F0E0', 0.5)
r.key(energy=220)
r.render(out_dir())
