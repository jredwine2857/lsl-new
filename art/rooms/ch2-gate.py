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

# rows of gate seats
for i in range(5):
    x = 100 + i * 22
    r.block(x, 18, 132, 142, 10, mat('#4A4A54', rough=0.4), 'seat', lift=6)
    r.block(x, 18, 120, 138, 2, mat('#4A4A54', rough=0.4), 'seatback', lift=10)
r.block(98, 112, 141, 142.5, 6, mat('#8A8A8A', metal=0.8), 'seatbeam', lift=0)

# broken moving walkway
r.slab(158, 150, mat('#3A3A3E', rough=0.5), x0=120, x1=210, height=2, name='walkway')
r.slab(151, 150, mat('#F0D020'), x0=120, x1=210, height=2.2, name='walkway_edge')
r.text('OUT OF SERVICE', 165, 155, 4, r.floor_d(158) - 0.05, mat('#E02020'))

r.ambient('#E0E8F4', 0.45)
r.key(energy=220)
r.sun('#FFF4E0', 2.5, angle=(45, 0, -30))
r.render(out_dir())
