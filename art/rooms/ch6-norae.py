"""Chapter 6: the Cho family noraebang in Cerritos. The karaoke screen,
disco-ball sparkles and the people are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch6-norae', floor_y=126)
D = r.D

r.wall(mottled('#8A1A9A', '#5A0A6A', scale=1.5))
for x in range(-20, 340, 30):
    r.panel(x, 10, 2, 120, D - 0.05, glow('#FF60E0', 0.5), thick=1, name='led_strip')
# the karaoke screen frame (picture drawn by the game)
r.panel(86, 16, 148, 78, D - 0.3, mat('#2A2A2E', metal=0.5), thick=6)
r.panel(92, 22, 136, 66, D - 0.32, mat('#050505'), thick=0.5)
r.panel(80, 94, 160, 6, D - 0.4, mat('#1A1A1E'), thick=20, name='speakers')
for x in (70, 250):
    r.panel(x - 12, 60, 24, 40, D - 0.4, mat('#151518'), thick=16)
    r.oval(x, 72, 7, 7, D - 0.42, mat('#333338', rough=0.3), thick=1)
    r.oval(x, 90, 5, 5, D - 0.42, mat('#333338', rough=0.3), thick=1)

# disco ball
r.panel(279.5, -10, 1, 32, D - 2, mat('#888888'))
r.ball(280, 30, D - 2, 8, mat('#E0E0F0', metal=1, rough=0.08))

# the long red couch
CU = mat('#C01828', rough=0.6)
r.block(8, 304, 128, 152, 16, CU, 'couch', lift=6)
r.block(8, 304, 112, 140, 6, CU, 'couchback', lift=14)
r.block(8, 304, 126.5, 152.2, 16.5, mat('#FF5050', rough=0.6), 'cushion', lift=16)
# side table and songbook
r.block(236, 28, 139, 160, 12, mat('#7A4A22', rough=0.5), 'table', lift=4)
r.block(240, 20, 137, 156, 8, mat('#F4F4F4', rough=0.9), 'songbook', lift=19)

r.floor(planks('#1830A0', '#0A0A2A', scale=1.0, axis='h', floor=True, rough=0.3))
r.lamp(280, 30, D - 2.5, color='#FFFFFF', energy=80)
r.ambient('#A040C0', 0.45)
r.key(energy=180, color='#FFD0F0')
r.render(out_dir())
