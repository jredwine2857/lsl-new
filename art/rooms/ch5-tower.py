"""Chapter 5: Mandatory Update Command Center, Brickell. The countdown,
server LEDs, the chair and the people are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch5-tower', floor_y=150)
D = r.D

WALL = mottled('#B4B8BC', '#A4A8AC', scale=2)
r.panel(-40, -40, 60, 280, D, WALL, thick=4)
r.panel(160, -40, 220, 280, D, WALL, thick=4)
r.panel(20, -40, 140, 58, D, WALL, thick=4)
r.panel(20, 108, 140, 60, D, WALL, thick=4)
# the four-pane Window onto Biscayne Bay
r.sky('#3A90E8', '#B8E4FA', d=90)
r.panel(-60, 80, 440, 60, 80, mottled('#1838A0', '#2A58C8', scale=0.3), thick=1, name='bay')
for i in range(6):
    h = 18 + (i * 29) % 30
    r.panel(-10 + i * 40, 80 - h, 26, h, 78, mat('#C8D0D8', rough=0.3, metal=0.4), thick=4, name='tower')
FR = mat('#3A3A40', metal=0.7, rough=0.3)
r.panel(88, 18, 4, 90, D - 0.05, FR, thick=6)
r.panel(20, 61, 140, 4, D - 0.05, FR, thick=6)
r.panel(18, 16, 144, 3, D - 0.05, FR, thick=6)
r.panel(18, 107, 144, 3, D - 0.05, FR, thick=6)
r.panel(18, 16, 3, 94, D - 0.05, FR, thick=6)
r.panel(159, 16, 3, 94, D - 0.05, FR, thick=6)

# countdown board (text drawn by the game)
r.panel(178, 18, 124, 28, D - 0.05, mat('#2A2A2E', metal=0.5), thick=3)
r.panel(180, 20, 120, 24, D - 0.08, mat('#050505'), thick=0.5)

r.text('CHAIRS ARE DEPRECATED', 120, 118, 4.5, D - 0.03, mat('#5A5A5E'), extrude=0.1)

# server rack and its cable
r.block(248, 34, 90, 154, 16, mat('#0E0E10', rough=0.3, metal=0.4), 'rack')
for i in range(6):
    r.panel(252, 93 + i * 9, 26, 6, r.floor_d(154) - 0.03, mat('#2A2A2E', metal=0.6, rough=0.3), thick=0.5)
r.slab(142, 140, mat('#3A3A3A'), x0=280, x1=300, height=0.8, name='cable')
r.block(296, 8, 135, 145, 4, mat('#F0F0F0'), 'plug')

r.floor(planks('#4A4A50', '#6A6A70', scale=1.0, axis='h', floor=True, rough=0.3))

# podium with the big red button
r.block(160, 26, 141, 168, 18, mat('#2040B0', rough=0.3), 'podium')
r.oval(175, 140, 6, 2.5, r.floor_d(168) - 0.05, mat('#E01010', rough=0.2), thick=6, name='button')

r.ambient('#E0ECFF', 0.5)
r.key(energy=220)
r.sun('#FFF8E8', 2, angle=(60, 0, 40))
r.render(out_dir())
