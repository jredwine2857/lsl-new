"""Chapter 6: the LaffX launch pad. The rocket and tower are baked in;
Cruise and his climb are drawn by the game."""

import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir  # noqa: E402

# art/scenes/launch.py renders this pad again without the rocket, as the
# launch sequence's backdrop (the rocket is a separate sprite there)
NAME = os.environ.get('PAD_NAME', 'ch6-pad')
ROCKET = NAME == 'ch6-pad'
r = Room(NAME, floor_y=150)
D = r.D

r.sky('#2A80E8', '#C8EEFA', d=90)
for x, y, w in [(40, 30, 50), (270, 50, 40), (110, 70, 30)]:
    r.cloud(x, y, w)
r.panel(-60, 128, 440, 30, 60, mottled('#8A9A5A', '#A8B070', scale=0.5), thick=2, name='prairie')

r.floor(mottled('#6A6A6E', '#5A5A5E', scale=1.5, floor=True))
for x in range(0, 320, 30):
    r.slab(159, 156, mat('#F0D020'), x0=x, x1=x + 14, height=0.4, name='dash')
r.slab(186, 184, mat('#F0D020'), height=0.5, name='edge')
r.slab(200, 186, mat('#0A0A0A'), height=0.6, name='trench')

# distant tank farm, water tower and floodlights out on the prairie
for x, rr in ((34, 7), (58, 5)):
    r.lathe(x, 130, 55, [(0, 0)] + [(rr * math.sin(math.pi * i / 16), rr * (1 - math.cos(math.pi * i / 16))) for i in range(1, 17)],
            mat('#E8E8EC', rough=0.4), segs=32, name='sphere_tank')
r.lathe(290, 130, 55, [(1, 0), (1, 16), (6, 17), (6, 22), (3, 24), (0, 24.5)], mat('#C8CCD0', rough=0.5), segs=24, name='watertower')
for x in (8, 112):
    r.tube([(x, 154, r.floor_d(154) + 6), (x, 40, r.floor_d(154) + 6)], 0.8, mat('#8A8A8A', metal=0.7), 'floodpole')
    r.panel(x - 4, 36, 8, 5, r.floor_d(154) + 5.9, glow('#FFF8E0', 1.2), thick=1, name='floodlight')

# launch tower: a rust-red lattice with a crew access arm and umbilicals
RED = mat('#A83A28', metal=0.5, rough=0.45)
dt = r.floor_d(154) + 0.6
TB = 2.0


def tx(px):
    return 160 + (px - 160) * r.W(dt) / r.W(dt + TB)


for depth, X in ((dt, lambda px: px), (dt + TB, tx)):
    for x in (198, 226):
        r.tube([(X(x), 154, depth), (X(x), 4, depth)], 1.1, RED, 'towerleg')
for y in range(4, 152, 12):
    for depth, X in ((dt, lambda px: px), (dt + TB, tx)):
        r.tube([(X(198), y, depth), (X(226), y, depth)], 0.7, RED, 'towerbeam')
    r.tube([(198, y + 12, dt), (226, y, dt)], 0.5, RED, 'brace')
    r.tube([(226, y + 12, dt), (198, y, dt)], 0.5, RED, 'brace')
    for x in (198, 226):
        r.tube([(x, y, dt), (tx(x), y, dt + TB)], 0.6, RED, 'towerside')
r.tube([(212, 4, dt + TB / 2), (212, -30, dt + TB / 2)], 0.6, mat('#C8C8C8', metal=0.8), 'lightning_mast')
# crew access arm with its white room, and umbilical lines to the rocket
dr = r.floor_d(154)
r.panel(170, 30, 28, 7, dr + 0.4, mat('#B8B8BC', metal=0.6, rough=0.4), thick=8, name='access_arm')
r.panel(170, 27, 9, 12, dr + 0.3, mat('#F2F2F0', rough=0.5), thick=10, name='white_room')
for y in (70, 112):
    r.tube([(198, y, dt), (188, y + 3, dr + 0.6), (171, y + 4, dr + 0.6)], 0.9, mat('#3A3A3E', rough=0.5), 'umbilical')

if ROCKET:
    # the rocket: LaffX Laffer One, Falcon-style, with legs, grid fins and a fairing
    WH = mat('#F6F6F4', rough=0.3)
    BK = mat('#1A1A1C', rough=0.4)
    rc = 160
    r.lathe(rc, 154, dr, [(11.6, 0), (11.2, 8)], BK, segs=48, name='engine_skirt')
    r.lathe(rc, 154, dr, [(11.2, 8), (11, 88)], WH, segs=48, name='stage1')
    r.lathe(rc, 154, dr, [(11.05, 88), (11.05, 100)], BK, segs=48, name='interstage')
    r.lathe(rc, 154, dr, [(11, 100), (11, 118)], WH, segs=48, name='stage2')
    r.lathe(rc, 154, dr, [(11, 118), (11.6, 121), (11.6, 129), (10.8, 133), (9, 137), (6.4, 141), (3.4, 144), (0, 146)], WH,
            segs=48, name='fairing')
    r.panel(159.6, 8, 0.8, 28, dr - 0.02, mat('#C8C8C8'), thick=0.3, name='fairing_seam')
    # folded landing legs
    LEG = mat('#2E2E32', metal=0.4, rough=0.45)
    for x0, x1 in ((148, 152), (168, 172)):
        r.poly([(x0, 146), (x1, 146), (x1 if x0 < 160 else x1 - 1, 100), (x0 + (1 if x0 < 160 else 0), 100)], dr + 0.6, LEG,
               thick=1, name='leg')
    # grid fins at the top of the interstage
    for x in (142, 172):
        r.panel(x, 55, 7, 6, dr + 0.4, mat('#5A5A60', metal=0.7, rough=0.4), thick=2, name='gridfin')
        for gx in range(1, 7, 2):
            r.panel(x + gx, 55, 0.5, 6, dr + 0.38, BK, thick=0.3, name='grid')
        for gy in (57, 59):
            r.panel(x, gy, 7, 0.5, dr + 0.38, BK, thick=0.3, name='grid')
    r.panel(164, 68, 1.2, 78, dr + 0.2, mat('#BABABA', rough=0.5), thick=1, name='raceway')
    # flag and lettering
    for i in range(5):
        r.panel(155, 50 + i * 1.2, 10, 0.6, dr - 0.02, mat('#C81E28'), thick=0.2, name='flagstripe')
    r.panel(155, 50, 4, 3.2, dr - 0.03, mat('#1E2A78'), thick=0.2, name='flagcanton')
    r.text('LaffX', rc, 104, 4.6, dr - 0.06, mat('#1830B0'))
    r.text('LAFFER', rc, 110, 2.4, dr - 0.06, mat('#1A1A1C'))

# hold-down pedestal and flame deflector
r.panel(134, 146, 52, 10, r.floor_d(156), mat('#5A5A5E', metal=0.6), thick=30, name='mount')
for x in (138, 154, 166, 182):
    r.panel(x - 2, 142, 4, 6, r.floor_d(156) - 0.05, mat('#3A3A3E', metal=0.7), thick=4, name='clamp')

r.ambient('#D0E8FF', 0.5)
r.sun('#FFF4E0', 3.5, angle=(50, 0, 30))
r.render(out_dir())
