"""Chapter 3: Skyline Chili, Over-the-Rhine. Matches jr's photo: oval sign,
navy subway tile, digital menu boards, chrome pendants. The TV picture,
chili steam and people are drawn by the game; the counter is the fg layer."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, brick, glow, mat, out_dir, planks, tiles  # noqa: E402
import kit  # noqa: E402

r = Room('ch3-skyline', floor_y=132, depth=9)
D = r.D

NAVY = brick('#0A1440', '#3A4A8A', scale=3.5, mortar_size=0.05, rough=0.2, row=0.3, width=0.6)
BEIGE = brick('#D6C0A6', '#9C8670', scale=1.8, mortar_size=0.04, rough=0.4, row=0.5, width=0.5)
SOFFIT = mat('#C9C3B8', rough=0.8)
CHROME = mat('#DDDDDD', rough=0.15, metal=1)

r.wall(BEIGE)
r.floor(tiles('#D0CCC0', '#8E8A80', scale=0.9, rough=0.25, grout_size=0.04))

# soffit with the oval sign
r.panel(96, -10, 230, 68, D - 0.3, SOFFIT, thick=40)
r.oval(162, 34, 54, 23, D - 0.45, mat('#0B1446', rough=0.3), thick=3)
r.oval(162, 34, 50, 20, D - 0.5, mat('#050508', rough=0.1), thick=1)
r.oval(162, 26, 38, 9, D - 0.52, glow('#4C8FE8', 0.9), thick=0.5)
for x, h in [(130, 5), (136, 9), (142, 7), (148, 12), (154, 8), (160, 15), (166, 9), (172, 11), (178, 7), (184, 9), (190, 6)]:
    r.panel(x, 32 - h, 5, h, D - 0.53, mat('#050508'), thick=0.4)
r.text('Skyline', 160, 31, 11, D - 0.55, glow('#7EE000', 1.0), font=kit.SCRIPT, shear=0.2)
r.panel(138, 42, 48, 8, D - 0.55, glow('#E01010', 1.4), thick=0.4)
r.text('CHILI', 162, 46, 5, D - 0.57, glow('#FFFFFF', 2.0))

# navy tile band and menu boards
r.panel(96, 58, 230, 16, D - 0.05, NAVY, thick=1)
for i, title in enumerate(['CONEYS', 'CHILITOS', 'BREAKFAST', 'DRINKS']):
    x = 112 + i * 44
    r.panel(x, 60, 38, 12, D - 0.1, glow('#E8EEFF', 0.9), thick=0.5)
    r.panel(x, 60, 38, 4, D - 0.11, glow('#2050D0', 1.0), thick=0.3)
    r.text(title, x + 19, 62, 2.5, D - 0.12, glow('#FFFFFF', 2))
    for j in range(3):
        r.panel(x + 4 + j * 11, 66, 8, 4, D - 0.12, glow('#D89A3A', 0.8), thick=0.3)
r.panel(0, 74, 320, 3, D - 0.05, NAVY, thick=1)

# window with the flyer
r.panel(10, 18, 86, 74, D - 0.02, mat('#8A8A88', rough=0.4, metal=0.6), thick=1)
r.panel(14, 22, 78, 66, D - 0.04, glow('#9FD8E8', 0.7), thick=0.5)
r.panel(22, 28, 62, 48, D - 0.08, mat('#FFE640', rough=0.9), thick=0.3)
r.text('FREE', 53, 37, 8, D - 0.1, mat('#D01818'))
r.text('FOOD!', 53, 50, 8, D - 0.1, mat('#D01818'))
r.text('SUMMER OF LOVE', 53, 62, 4.5, D - 0.1, mat('#A01890'))
r.text('WASHINGTON PARK', 53, 70, 4.5, D - 0.1, mat('#101010'))

# TV frame (the picture is drawn by the game)
r.panel(232, 20, 52, 40, D - 0.6, mat('#3A3A3A', rough=0.4), thick=6)
r.panel(240, 28, 36, 24, D - 0.62, mat('#101010'), thick=0.3)

# kitchen pass-through with the chili vat
r.panel(18, 86, 56, 40, D - 0.03, glow('#BFC4C4', 0.25), thick=0.5)
r.post(45, 138, 15, 100, mat('#9A9EA2', rough=0.3, metal=0.8), 'vat', verts=40)
r.disc(45, 138, 14, 100.5, 1, mat('#7A3A12', rough=0.4), 'chili')

# pendant lamps
for x in (130, 190, 250):
    d = D - 2.2
    r.panel(x - 0.3, 58, 0.6, 26, d, CHROME, thick=0.6)
    r.oval(x, 86, 7, 3, d, CHROME, thick=4)
    r.oval(x, 88, 4, 1, d - 0.05, glow('#FFF4D0', 6), thick=0.5)
    r.lamp(x, 92, d, energy=25)

# door to Vine Street
r.panel(298, 58, 26, 94, D - 0.15, planks('#8A5222', '#5A3210', scale=3, axis='v'), thick=3)
r.panel(301, 62, 15, 26, D - 0.2, glow('#BFE4F0', 0.6), thick=0.3)
r.text('VINE', 309, 66, 3, D - 0.22, mat('#FFFFFF'))
r.oval(302, 110, 1.5, 1.5, D - 0.25, mat('#E0C060', metal=1, rough=0.2), thick=2)

# counter (fg: the waitress stands behind it)
r.block(-10, 340, 124, 150, 8, NAVY, 'counter', fg=True)
r.block(-12, 344, 121, 150.5, 12, mat('#EDEDED', rough=0.15), 'countertop', fg=True, lift=26)
# stools
for x in range(30, 300, 34):
    r.post(x + 5, 160, 1.2, 150, CHROME, 'stool')
    r.disc(x + 5, 160, 6.5, 149, 3, mat('#C01818', rough=0.35), 'seat')

r.ambient('#B8C4E0', 0.25)
r.key(energy=300, at=(4, -2, r.H + 4))
r.lamp(160, 30, D - 3, color='#FFF0D8', energy=150, radius=2)
r.render(out_dir())
