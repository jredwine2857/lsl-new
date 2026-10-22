"""Chapter 1: the Strip, Lost Wages, at night. Lane dashes, the robotaxi,
the cruiser's light bar and the people are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, brick, glow, mat, mottled, out_dir, tiles  # noqa: E402

r = Room('ch1-street', floor_y=156)
D = r.D

r.sky('#04041A', '#1A2260', d=80)
r.stars(40, -5, 60, d=79)
# distant casino glow on the horizon
for i, (x, w, h, c) in enumerate([(-10, 40, 40, '#2A1A4A'), (30, 30, 70, '#22183A'), (180, 40, 55, '#2A1A4A'), (200, 30, 90, '#1A1430')]):
    r.panel(x, 100 - h, w, h + 60, 40, mat(c), thick=10, name=f'far{i}')
r.panel(50, 20, 6, 70, 40, glow('#FFD040', 1.2), thick=2, name='casino_neon')

r.floor(mat('#3A3A40', rough=0.8))
# sidewalk slab
r.slab(181, 150, tiles('#A8A8A4', '#7A7A76', scale=1.0, rough=0.7), height=1.5, name='sidewalk')
r.block(-200, 720, 179.5, 181.5, 1, mat('#E8E8E8'), 'curb')

# LFTY building
r.panel(-10, 66, 122, 92, D, brick('#9A2818', '#3A3434', scale=3, mortar_size=0.05, vary='#B03420'), thick=20)
r.panel(-10, 62, 122, 6, D - 0.1, mat('#2A2A2A'), thick=24)
r.text('LFTY', 30, 87, 10, D - 0.15, glow('#FF40D0', 1.0), align='LEFT')
r.panel(38, 110, 30, 48, D - 0.05, mat('#2A1A0A'), thick=1)
r.panel(40, 112, 26, 46, D - 0.08, mat('#4A2810', rough=0.5), thick=1)
r.panel(72, 112, 26, 20, D - 0.05, glow('#FFD860', 0.9), thick=1)
r.lamp(85, 125, D - 1, color='#FFC860', energy=60)

# SWIPR billboard
r.panel(160, 60, 4, 60, D + 2, mat('#555555', metal=0.6), thick=4)
r.panel(116, 22, 94, 44, D + 2, mat('#E02020', rough=0.4), thick=3)
r.panel(119, 25, 88, 38, D + 1.95, glow('#F4F4F0', 0.8), thick=1)
r.text('SWIPR', 128, 37, 10, D + 1.9, mat('#E01818'), align='LEFT')
r.text('love is one swipe away', 124, 53, 4.2, D + 1.9, mat('#101010'), align='LEFT')

# Galleria mall
r.panel(214, 56, 116, 102, D, mottled('#B8B4AC', '#A09C94', scale=2), thick=20)
r.panel(212, 56, 120, 6, D - 0.1, mat('#5A5A5A'), thick=24)
r.text('GALLERIA', 236, 73, 7, D - 0.05, mat('#1830B0', rough=0.4), align='LEFT')
r.text('NOW 60% STORES!', 232, 84, 4.2, D - 0.05, mat('#D02020'), align='LEFT')
r.panel(248, 96, 44, 62, D - 0.05, mat('#5A5A5A', metal=0.8), thick=1)
r.panel(250, 98, 40, 60, D - 0.08, glow('#80C8D8', 0.5), thick=0.5)
r.panel(269, 98, 2, 60, D - 0.1, mat('#5A5A5A', metal=0.8), thick=0.5)

# street lamps
for x in (20, 300):
    r.post(x, 158, 1.2, 96, mat('#303030', metal=0.6), 'lamppost')
    r.ball(x, 95, r.floor_d(158), 3, glow('#FFF0C0', 3))
    r.lamp(x, 100, r.floor_d(158) - 0.3, color='#FFD8A0', energy=90, radius=0.3)

# PC Police cruiser (light bar drawn by the game)
r.car(204, 64, 164, 184, '#16161A', kind='explorer', name='cruiser', twotone='#F0F0F0',
      glass='#4A5C7A', lightbar=False)
r.spot(236, 120, r.floor_d(184) - 5, r.P(236, 172, r.floor_d(184)), color='#FFE8C8', energy=700, size=50)
r.text('PC POLICE', 238, 170, 4.2, r.floor_d(184) - 0.12, mat('#1830B0'))

# canvasser's sign
r.post(177, 164, 1, 140, mat('#6A4A2A'), 'signpole')
r.panel(160, 120, 34, 22, r.floor_d(164) - 0.05, mat('#F0F0EA', rough=0.9), thick=1)
r.text('EVERY $', 164, 126, 4.2, r.floor_d(164) - 0.08, mat('#101010'), align='LEFT')
r.text('TO CAUSE*', 164, 134, 4.2, r.floor_d(164) - 0.08, mat('#101010'), align='LEFT')

r.ambient('#4050A0', 0.45)
r.key(energy=120, color='#C0C8FF')
r.render(out_dir())
