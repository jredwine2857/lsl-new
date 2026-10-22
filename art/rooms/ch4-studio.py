"""Chapter 4: The Drew Barrymore Show set. The big screen's picture, the
bobbing audience and the people are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch4-studio', floor_y=122)
D = r.D

r.wall(mottled('#FF8AD8', '#FFC8EC', scale=2))
for x in range(-10, 330, 26):
    r.panel(x, 10, 8, 100, D - 0.05, mat('#FFE4F4', rough=0.4), thick=3, name='flute')
# the big screen frame (picture drawn by the game)
r.panel(98, 14, 124, 64, D - 0.3, mat('#3A3A3E', metal=0.5, rough=0.3), thick=6)
r.panel(104, 20, 112, 52, D - 0.32, mat('#0A0A0A'), thick=0.5)
# audience riser behind the stage
r.panel(-40, 104, 400, 20, D - 0.1, mat('#4A3A4A', rough=0.8), thick=30, name='riser')

# stage floor
r.floor(planks('#F0C030', '#A06A20', scale=1.2, axis='h', floor=True, rough=0.3))
# yellow couch with pillows
CU = mat('#40B8C8', rough=0.7)
r.block(94, 74, 140, 156, 18, CU, 'couch', lift=4)
r.block(94, 74, 128, 146, 6, CU, 'couchback', lift=12)
for x in (94, 162):
    r.block(x, 6, 134, 156, 18, CU, 'arm', lift=4)
for i, c in enumerate(['#F8E040', '#FF5050', '#60E060', '#FFFFFF', '#FF70E0']):
    r.block(100 + i * 13, 10, 130, 147, 3, mat(c, rough=0.9), 'pillow', lift=14)
# coffee table
r.block(190, 30, 146, 160, 10, mat('#2A40C0', rough=0.2), 'coffeetable', lift=6)
r.slab(200, 152, planks('#A06A20', '#F0C030', scale=1.0, axis='h', floor=True), height=0.4, name='front')

r.ambient('#FFE0F0', 0.55)
r.key(energy=260)
for x in (60, 260):
    r.spot(x, -20, D - 6, (r.P(140, 140, r.floor_d(150)).x, r.floor_d(150), 0.5), energy=350, size=50)
r.render(out_dir())
