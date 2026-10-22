"""Chapter 1: LFTY, the mixology bar that used to be Lefty's. The TV picture
and the pin dish are drawn by the game. The bar and the patrons' high table
are fg layers; the bartender and patrons stand behind them."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, brick, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch1-lounge', floor_y=138)
D = r.D

r.wall(mottled('#4A1440', '#2A0A26', scale=1.5))
r.floor(planks('#7A4418', '#4A2408', scale=1.6, axis='v', floor=True))
r.panel(-10, -10, 170, 160, D - 0.04, brick('#A02818', '#3A1A14', scale=3, mortar_size=0.05, vary='#B83A22'), thick=2, name='brick')

# Edison bulbs
for i in range(8):
    x, y = 20 + i * 38, 20 + (i % 3) * 4
    r.panel(x, -10, 0.5, y + 10, D - 1.5, mat('#111111'))
    r.ball(x + 0.5, y + 2, D - 1.5, 2, glow('#FFB040', 2.5), squash=(1, 1, 1.4))
    r.lamp(x, y + 4, D - 1.5, color='#FFB850', energy=40, radius=0.1)

# neon sign
r.text('LFTY', 40, 40, 12, D - 0.1, glow('#FF40D0', 1.0), align='LEFT')
r.text('a mixology experience', 30, 55, 4, D - 0.1, glow('#40E0FF', 1.0), font=None, align='LEFT')

# back door (open, dark) and the door to the Strip
r.panel(-10, 70, 32, 78, D - 0.07, mat('#050505', rough=1), thick=1)
r.panel(98, 66, 34, 82, D - 0.05, mat('#D8B030', metal=0.8, rough=0.3), thick=2)
r.panel(100, 68, 30, 80, D - 0.08, planks('#4A2810', '#2A1404', scale=3, axis='v'), thick=1)
r.text('EXIT', 115, 75, 5, D - 0.1, glow('#FF2020', 1.0))

# chalkboard
r.panel(178, 28, 60, 40, D - 0.05, mat('#6A3A10'), thick=2)
r.panel(181, 31, 54, 34, D - 0.08, mottled('#183A18', '#0E260E', scale=6), thick=0.5)
r.text('OAT OLD FASH $26', 208, 37, 3.6, D - 0.1, mat('#F0F0F0'), extrude=0.05)
r.text('WIFI: LFTY_Guest', 208, 47, 3.6, D - 0.1, mat('#A0F0FF'), extrude=0.05)
r.text('PW: KenSentMe1987', 208, 56, 3.6, D - 0.1, mat('#A0F0FF'), extrude=0.05)

# TV (picture drawn by the game)
r.panel(250, 24, 56, 42, D - 0.4, mat('#151515', rough=0.3), thick=6)

# back bar: mirror, shelf and bottles
r.panel(166, 87, 160, 40, D - 0.05, planks('#5A2E10', '#3A1C08', scale=2.5, axis='v'), thick=1)
r.panel(176, 62, 140, 22, D - 0.05, mat('#C0C8D0', rough=0.1, metal=0.8), thick=1)
r.panel(166, 84, 160, 3, D - 0.4, mat('#5A3010'), thick=12)
for i in range(9):
    c = ['#2A9A40', '#8A5018', '#60D8E8'][i % 3]
    r.panel(190 + i * 14, 72, 4, 12, D - 0.45, mat(c, rough=0.05), thick=4)
    r.panel(191 + i * 14, 69, 2, 4, D - 0.45, mat(c, rough=0.05), thick=2)

# the bar (fg)
WOOD = planks('#8A4A1A', '#5A2A0A', scale=3, axis='h')
r.block(166, 160, 124, 146, 10, WOOD, 'bar', fg=True)
r.block(164, 164, 118, 146.5, 12, mat('#4A2408', rough=0.2), 'bartop', fg=True, lift=22)

# patrons' high table with laptops (fg)
r.block(38, 60, 131, 152, 8, mat('#B8B8B8', metal=0.8, rough=0.3), 'table', fg=True, lift=17)
r.post(68, 152, 1.5, 133, mat('#888888', metal=0.8), 'tableleg', fg=True)
for x in (46, 76):
    r.block(x, 10, 125, 150, 1, mat('#E8E8EE', metal=0.6, rough=0.2), 'laptop', fg=True, lift=19)
    r.text('●', x + 5, 128, 2, r.floor_d(150) - 0.02, glow('#FFFFFF', 3), fg=True, crisp=False)

r.lamp(240, 60, D - 1.2, color='#FFD8A0', energy=250, radius=0.5)
r.ambient('#6040A0', 0.4)
r.key(energy=200, color='#FFD8B0')
r.render(out_dir())
