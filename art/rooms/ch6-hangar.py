"""Chapter 6: the LaffX hangar in Houston. Willow's food truck (fg: she
stands inside it), the engine and the scaffold are baked in; the engine's
status light, exhaust and the people are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch6-hangar', floor_y=140)
D = r.D

r.wall(mottled('#4A4E54', '#3A3E44', scale=2))
for x in range(0, 321, 40):
    r.panel(x - 1, -10, 4, 100, D - 0.1, mat('#9A9EA4', metal=0.8, rough=0.3), thick=8, name='rib')
r.panel(-40, 87, 400, 4, D - 0.1, mat('#9A9EA4', metal=0.8, rough=0.3), thick=10, name='beam')
r.panel(-40, 91, 400, 60, D - 0.02, planks('#5A5E64', '#4A4E54', scale=1.0, axis='h'), thick=2, name='lowerwall')
r.text('LaffX', 160, 36, 12, D - 0.12, glow('#FFFFFF', 0.9))
r.text('HOUSTON', 160, 54.5, 4.5, D - 0.12, mat('#B8BCC0'))

r.floor(planks('#8A8E94', '#6A6E74', scale=0.5, axis='h', floor=True, rough=0.3))
for x in (60, 160, 260):
    r.panel(x - 12, -10, 24, 4, D - 4, glow('#F0F8FF', 3), thick=4, name='highbay')
    r.lamp(x, 0, D - 4, color='#F0F8FF', energy=500, radius=1)

# Willow's food truck (fg) with its serving window cut out
TR = mat('#F4F4F4', rough=0.4)
d = r.floor_d(152)
r.block(10, 70, 110, 152, 26, TR, 'truck', fg=True, lift=4)
r.panel(10, 110, 70, 6, d - 0.03, mat('#FF50D0'), thick=0.5, name='stripe', fg=True)
r.panel(24, 120, 34, 12, d - 0.03, mat('#151515'), thick=0.5, name='window')
r.panel(22, 132, 38, 2.5, d - 0.06, mat('#E8E8E8', metal=0.6), thick=4, name='ledge', fg=True)
r.text("WILLOW'S", 45, 142, 4.5, d - 0.05, mat('#C020B0'), fg=True)
for wx in (22, 66):
    c = r.P(wx, 152, d)
    c.z = 5 * r.m(d)
    r.cyl(c, 5 * r.m(d), 0.3, mat('#141414'), 'wheel', fg=True, rot=(1.5708, 0, 0))

# the engine on its stand
r.block(150, 60, 140, 154, 18, mat('#5A5E64', metal=0.6), 'stand')
de = r.floor_d(154) + 0.3
r.poly([(160, 96), (200, 96), (210, 140), (150, 140)], de, mat('#C0C4C8', metal=0.9, rough=0.3), thick=8, name='bell')
r.panel(172, 102, 16, 12, de - 0.05, mat('#2A2A2E'), thick=0.5)

# scaffold
Y = mat('#F0C820', rough=0.5)
for x in (236, 264):
    r.post(x + 1, 152, 1, 90, Y, 'scaffold')
for y in range(90, 150, 15):
    r.panel(236, y, 30, 2, r.floor_d(152) - 0.01, Y, thick=2)

r.ambient('#C0C8D8', 0.4)
r.key(energy=180)
r.render(out_dir())
