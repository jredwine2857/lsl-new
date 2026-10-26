"""Chapter 2: LAX, Gate 42. Windows onto the tarmac and the Theme Building.
Roger's mop and bucket and the people are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch2-gate', floor_y=140)
D = r.D

WALL = mottled('#B8B8B4', '#A8A8A4', scale=2)
# wall around the big window (left, right, top, bottom)
r.panel(-40, -40, 110, 280, D, WALL, thick=4)
r.panel(290, -40, 80, 280, D, WALL, thick=4)
r.panel(70, -40, 220, 60, D, WALL, thick=4)
r.panel(70, 104, 220, 60, D, WALL, thick=4)
for x in range(70, 291, 44):
    r.panel(x - 1, 18, 4, 88, D - 0.05, mat('#4A4A4E', metal=0.7, rough=0.3), thick=6)
r.panel(68, 17, 224, 3, D - 0.05, mat('#4A4A4E', metal=0.7), thick=6)
r.panel(68, 103, 224, 3, D - 0.05, mat('#4A4A4E', metal=0.7), thick=6)

# outside: sky, tarmac, a plane and the Theme Building
r.sky('#3A8AE0', '#BCE0F4', d=90)
r.panel(-100, 80, 520, 200, 60, mat('#6A6A6A', rough=0.9), thick=4, name='tarmac')
r.theme_building(186, 98, 52, 70, 40)
dp = 30
from vehicle import airliner  # noqa: E402
r.vehicle(*airliner(), 80, 92, 98, d=dp)

# gate sign
r.panel(10, 24, 50, 20, D - 0.1, mat('#0A0A0A', rough=0.3), thick=3)
r.text('GATE 42', 35, 31, 6, D - 0.15, glow('#FFE040', 1.0))
r.text('ARRIVED', 35, 39, 4, D - 0.15, glow('#40FF60', 1.0))

r.floor(planks('#2034A0', '#3A54D0', scale=1.0, axis='h', floor=True))
r.panel(-40, 134, 400, 6, D - 0.02, mat('#5A5A5E'), thick=3, name='skirting')

# a row of Eames tandem sling seats, the classic gate seating: black leather
# pads with ribbed backs on polished aluminium frames, armrests, and a steel
# beam on two T-legs
LEATHER = mat('#1C1C22', rough=0.32)
RIB = mat('#34343C', rough=0.4)
ALU = mat('#D0D4DA', metal=0.9, rough=0.2)
STEEL = mat('#6A6E76', metal=0.8, rough=0.35)
FRONT, X0, N, SW = 148, 92, 6, 20


def row_back(front, px):
    """The floor row px pixels (at the front's scale) behind floor row front."""
    d = r.floor_d(front)
    d += px * r.m(d)
    return 100 + 320 * (r.H / (r.k * d) + r.s)


BACK = row_back(FRONT, 9)
for i in range(N):
    x = X0 + i * SW
    # the sling seat, its rolled front lip, and the tall ribbed back
    r.block(x + 1, SW - 2, FRONT - 13, FRONT, 9, LEATHER, 'seatpad', lift=10)
    r.block(x + 1.5, SW - 3, FRONT - 13.4, FRONT + 0.3, 1.2, RIB, 'seatlip', lift=11.5)
    r.block(x + 1, SW - 2, BACK - 30, BACK, 2.5, LEATHER, 'backpad', lift=11)
    for k in range(4):
        r.block(x + 1.5, SW - 3, BACK - 28 + k * 4.5, BACK - 0.3, 0.6, RIB, 'rib', lift=26.5 - k * 4.5)
    r.block(x + 2, SW - 4, BACK - 31.5, BACK + 0.2, 1, ALU, 'backrail', lift=30)
# aluminium side frames with black armpads between the seats
for i in range(N + 1):
    x = X0 + i * SW - 1
    r.block(x, 2, FRONT - 18, FRONT - 0.5, 10, ALU, 'sideframe', lift=9)
    r.block(x - 0.8, 3.6, FRONT - 19.5, FRONT - 1, 9, LEATHER, 'armpad', lift=17.5)
# the beam and its two T-legs
r.block(X0 - 2, N * SW + 2, FRONT - 9.5, FRONT - 3, 4, STEEL, 'beam', lift=7)
for x in (X0 + 14, X0 + N * SW - 18):
    r.block(x, 3, FRONT - 7, FRONT - 3, 3, ALU, 'leg', lift=0)
    r.block(x - 6, 15, FRONT - 1, FRONT, 10, ALU, 'foot', lift=0)
# a forgotten carry-on and a newspaper on the seats
r.block(X0 + 3 * SW + 4, 12, FRONT - 24, FRONT - 3, 6, mat('#8A2A2A', rough=0.6), 'bag', lift=13)
r.block(X0 + 3 * SW + 8, 4, FRONT - 26, FRONT - 3, 1, mat('#202020'), 'handle', lift=24)
r.block(X0 + 5 * SW + 3, 13, FRONT - 13.8, FRONT - 1, 7, mat('#E8E4D8', rough=0.9), 'paper', lift=13)

# broken moving walkway
r.slab(158, 150, mat('#3A3A3E', rough=0.5), x0=120, x1=210, height=2, name='walkway')
r.slab(151, 150, mat('#F0D020'), x0=120, x1=210, height=2.2, name='walkway_edge')
r.text('OUT OF SERVICE', 165, 155, 4, r.floor_d(158) - 0.05, mat('#E02020'))

r.ambient('#E0E8F4', 0.45)
r.key(energy=220)
r.sun('#FFF4E0', 2.5, angle=(45, 0, -30))
r.render(out_dir())
