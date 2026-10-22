"""Chapter 6: the LaffX hangar in Houston. Willow's food truck (fg: she
stands inside it), the engine and the scaffold are baked in; the engine's
status light, exhaust and the people are drawn by the game."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402,F401

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

# Willow's step-van food truck (fg) with its serving window cut out
d = r.floor_d(152)
# serving window at x 24..58, rows 120..132, in model metres (6.5 x 2.95)
hole = (16 / 72 * 6.5, 50 / 72 * 6.5, 20 / 42 * 2.95, 32 / 42 * 2.95)
r.car(8, 72, 110, 152, '#F4F4F4', kind='stepvan', name='truck', fg=True, hole=hole)
r.fg_holes.append((24, 120, 34, 12))  # Willow shows through the window
r.panel(10, 112, 62, 4, d - 0.05, mat('#FF50D0'), thick=0.5, name='stripe', fg=True)
r.panel(22, 132, 38, 2.5, d - 0.08, mat('#E8E8E8', metal=0.6), thick=4, name='ledge', fg=True)
r.text("WILLOW'S", 41, 142, 4.5, d - 0.06, mat('#C020B0'), fg=True)

# the engine: a Raptor-ish methalox engine hanging in a steel test stand
STEEL = mat('#6A6E76', metal=0.7, rough=0.35)
ds = r.floor_d(154)
for x in (138, 217):
    r.block(x, 5, 74, 154, 22, STEEL, 'standpost')
r.block(136, 88, 74, 154, 22, STEEL, 'standbeam', lift=74)
r.block(136, 88, 146, 154, 22, mat('#2A2C30', metal=0.5, rough=0.5), 'grate')
for x in range(140, 222, 6):
    r.panel(x, 146, 2, 2, ds - 0.02, mat('#E8C020', rough=0.5), thick=0.5, name='hazard')
de = ds + 0.25
BELL = mat('#B0B6BE', metal=0.85, rough=0.28)
COPPER = mat('#B8703A', metal=1.0, rough=0.28)
PUMP = mat('#C8CCD2', metal=0.8, rough=0.3)
r.lathe(180, 144, de, [(17, 0), (16.4, 4), (15, 9), (13, 14), (11, 19), (9, 24)], BELL, segs=64, smooth=False, name='bell')
r.lathe(180, 144, de, [(9, 24), (7.2, 28), (6.2, 31), (5.6, 33), (6.4, 35)], COPPER, segs=48, name='throat')
r.lathe(180, 144, de, [(6.4, 35), (8, 37), (8.2, 44), (7.6, 46), (5, 48), (0, 49)], PUMP, segs=48, name='chamber')
for h, rr in ((0.5, 17.3), (9, 15.3), (19, 11.3)):
    r.lathe(180, 144, de - 0.01, [(rr, h - 0.6), (rr, h + 0.6)], mat('#4A4E54', metal=0.8, rough=0.35), segs=64, name='hoop')
# turbopumps and feedlines
for cx in (168, 192):
    r.lathe(cx, 106, de - 0.25, [(3.5, 0), (4, 2), (4, 10), (5.2, 12), (5.2, 14), (2.5, 15), (0, 15.5)], PUMP, segs=32, name='pump')
    sx = 1 if cx < 180 else -1
    r.tube([(cx + sx * 3, 100, de - 0.3), (cx + sx * 7, 101, de - 0.32), (180 - sx * 7, 103, de - 0.25)], 1.3, COPPER, 'feedline')
    r.tube([(cx, 106, de - 0.3), (cx + sx * 2, 112, de - 0.3), (180 - sx * 8, 118, de - 0.2)], 1.0, PUMP, 'turbine_exh')
r.tube([(168, 92, de - 0.25), (174, 88, de - 0.25), (186, 88, de - 0.25), (192, 92, de - 0.25)], 1.1,
       mat('#E8E8EC', metal=0.6, rough=0.3), 'manifold')
# gimbal block, thrust struts and instrument cables
r.block(172, 16, 86, 154, 8, mat('#2A2C30', metal=0.6, rough=0.4), 'gimbal', lift=59)
r.tube([(180, 80, de), (180, 86, de)], 3, STEEL, 'thrustpost')
for x0, x1 in ((158, 172), (202, 188)):
    r.tube([(x0, 80, de - 0.1), (x1, 100, de - 0.1)], 1.4, mat('#D8D8DC', metal=0.8, rough=0.25), 'actuator')
for i, (x0, x1) in enumerate(((146, 166), (214, 196), (150, 170))):
    r.tube([(x0, 82, de - 0.5), ((x0 + x1) / 2, 100 + i * 6, de - 0.55), (x1, 108 + i * 4, de - 0.4)], 0.6,
           mat('#151515', rough=0.6), 'cable')
# the control box with the status lamp the game lights up
r.block(222, 12, 96, 154, 6, mat('#3A3E44', metal=0.4), 'ctrlbox', lift=40)
r.text('ENGINE', 228, 111, 2.6, ds - 0.07, mat('#E8E8E8'))

# scaffolding for Tom's pull-ups: tube-and-coupler, a plank deck, a pull-up bar
TUBE = mat('#B4B8BE', metal=0.85, rough=0.3)
YEL = mat('#F0C820', rough=0.5)
dsc = r.floor_d(156)
BACK = 1.3


def bx(px):
    """The pixel at the back of the scaffold that sits behind front pixel px."""
    return 160 + (px - 160) * r.W(dsc) / r.W(dsc + BACK)


for depth, X in ((dsc, lambda px: px), (dsc + BACK, bx)):
    for x in (232, 268):
        r.tube([(X(x), 156, depth), (X(x), 66, depth)], 1.0, TUBE, 'standard')
    for row in (150, 124, 100, 76):
        r.tube([(X(230), row, depth), (X(270), row, depth)], 0.8, TUBE, 'ledger')
for x in (232, 268):
    r.block(x - 3, 6, 155, 156.5, 4, mat('#2A2A2A'), 'baseplate')
    for row in (150, 124, 100, 76):
        r.tube([(x, row, dsc), (bx(x), row, dsc + BACK)], 0.7, TUBE, 'transom')
        r.ball(x, row, dsc - 0.03, 1.4, mat('#7A7E84', metal=0.8, rough=0.4))
r.tube([(bx(232), 150, dsc + BACK), (bx(268), 100, dsc + BACK)], 0.7, TUBE, 'brace')
r.tube([(bx(268), 150, dsc + BACK), (bx(232), 100, dsc + BACK)], 0.7, TUBE, 'brace')
for row in (99, 75):
    a, b = r.P(232, row, dsc), r.P(268, row, dsc)
    r.box(((a.x + b.x) / 2, dsc + BACK / 2, a.z), (b.x - a.x, BACK, 0.06),
          planks('#B8864A', '#8A5A2A', scale=4, axis='h', floor=True), 'deck')
r.panel(232, 95, 36, 4, dsc - 0.05, YEL, thick=0.5, name='toeboard')
r.panel(232, 71, 36, 4, dsc - 0.05, YEL, thick=0.5, name='toeboard')
r.tube([(234, 112, dsc - 0.2), (266, 112, dsc - 0.2)], 1.3, mat('#E8E8EA', metal=0.3, rough=0.25), 'pullupbar')
for x in (234, 266):
    r.tube([(x, 112, dsc - 0.2), (x - 0 if x == 234 else x, 112, dsc)], 0.9, mat('#5A5E64', metal=0.8), 'clamp')
r.panel(272, 128, 14, 12, dsc - 0.05, mat('#F4F4F0', rough=0.8), thick=0.5, name='sign')
r.text('NO', 279, 131, 3, dsc - 0.08, mat('#D02020'))
r.text('STUNTS', 279, 136, 2.4, dsc - 0.08, mat('#D02020'))

r.ambient('#C0C8D8', 0.4)
r.key(energy=180)
r.render(out_dir())
