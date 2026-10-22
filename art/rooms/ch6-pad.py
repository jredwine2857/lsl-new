"""Chapter 6: the LaffX launch pad. The rocket and tower are baked in;
Cruise and his climb are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir  # noqa: E402

r = Room('ch6-pad', floor_y=150)
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

# launch tower
RED = mat('#C82020', metal=0.5, rough=0.4)
d = r.floor_d(154) + 0.6
for x in (200, 228):
    r.panel(x, 20, 2, 134, d, RED, thick=2)
for y in range(20, 152, 12):
    r.panel(200, y, 30, 2, d, RED, thick=2)
    r.poly([(201, y), (203, y), (229, y + 12), (227, y + 12)], d, RED, thick=1, name='brace')

# the rocket
dr = r.floor_d(154)
WH = mat('#F6F6F4', rough=0.3)
c = r.P(160, 92, dr)
c.y += 20 * r.m(dr)
r.cyl(c, 20 * r.m(dr), 124 * r.m(dr), WH, 'rocket', verts=40)
nose = r.P(160, 20, dr)
nose.y += 20 * r.m(dr)
import bpy  # noqa: E402
bpy.ops.mesh.primitive_cone_add(vertices=40, radius1=20 * r.m(dr), depth=20 * r.m(dr), location=nose)
r._obj('nose', WH, False)
r.panel(140, 60, 40, 3, dr - 0.02, mat('#151515'), thick=1)
r.text('LaffX', 160, 93, 6, dr - 0.06, mat('#1830B0'))
r.panel(136, 144, 48, 10, r.floor_d(156), mat('#5A5A5E', metal=0.6), thick=30, name='mount')

r.ambient('#D0E8FF', 0.5)
r.sun('#FFF4E0', 3.5, angle=(50, 0, 30))
r.render(out_dir())
