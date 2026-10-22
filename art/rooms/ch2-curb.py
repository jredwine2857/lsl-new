"""Chapter 2: LAX arrivals curb at night, under the light pylons. Cars,
the family, the paparazzo and the bodyguard are drawn by the game; the
Kardashian SUV and the velvet rope are baked in."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, tiles  # noqa: E402

r = Room('ch2-curb', floor_y=152)
D = r.D

r.sky('#060418', '#1A1450', d=90)
r.stars(30, -5, 40, d=89)
# the LAX gateway pylons, lit in a rainbow
cols = ['#FF50E0', '#5070FF', '#40F0FF', '#50FF70', '#FFF050', '#FF5050']
for i in range(12):
    x, top = 8 + i * 26, 30 + (i % 2) * 6
    r.panel(x, top, 6, 120 - top, D + 6, glow(cols[i % len(cols)], 1.1), thick=6, name='pylon')
r.text('LAX', 160, 64, 16, D + 5, glow('#FFFFFF', 1.0))
r.theme_building(286, 122, 88, 50, D + 4, saucer=mat('#E8E8F0'))
r.lamp(286, 80, D + 2, color='#80A0FF', energy=150)

# terminal facade and sidewalk
r.panel(-40, 118, 400, 40, D, mottled('#4A4A52', '#3A3A42', scale=3), thick=10, name='terminal')
for x in range(10, 320, 40):
    r.panel(x, 124, 26, 22, D - 0.05, glow('#FFE8B0', 0.6), thick=1)
r.floor(mat('#18181C', rough=0.6))
r.slab(186, 150, tiles('#9A9A9E', '#6A6A6E', scale=0.9, rough=0.7), height=1.5, name='sidewalk')
r.block(-200, 720, 184.5, 186.5, 1, mat('#F0D020'), 'curb')

# Kardashian SUV
r.car(52, 88, 152, 186, '#181A24', glass='#3A4C6A', kind='suv', facing='left', name='suv')
r.spot(70, 110, r.floor_d(186) - 4, r.P(96, 168, r.floor_d(186) + 0.5), color='#FFE8C8', energy=900, size=50)
r.text('MOM', 92, 176, 4.5, r.floor_d(186) - 0.05, mat('#F0F0F0'))

# velvet rope
GOLD = mat('#E0B840', metal=1, rough=0.25)
for x in (282, 318):
    r.post(x, 170, 1.4, 150, GOLD, 'stanchion')
r.panel(282, 152, 36, 2, r.floor_d(170) - 0.05, mat('#C01020', rough=0.6), thick=2)

r.ambient('#5060C0', 0.5)
r.key(energy=180, color='#D0D8FF')
r.lamp(160, 140, D - 3, color='#FFE0B0', energy=300, radius=2)
r.render(out_dir())
