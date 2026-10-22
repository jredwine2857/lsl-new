"""Chapter 6: LaffX Mission Control. Tiered consoles with telemetry
monitors, side displays, mission clocks and the launch button are baked in;
the big screen's picture, the blinking console lights and the people are
drawn by the game."""

import math
import os
import random
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

r = Room('ch6-control', floor_y=136)
D = r.D
rnd = random.Random(6)


def telemetry(w, h, hue):
    """A little monitor picture: a dark screen with a grid and a trace or bars."""
    im = Image.new('RGB', (w * 4, h * 4), (6, 14, 24))
    dr = ImageDraw.Draw(im)
    for x in range(0, w * 4, 8):
        dr.line([(x, 0), (x, h * 4)], fill=(14, 34, 50))
    for y in range(0, h * 4, 8):
        dr.line([(0, y), (w * 4, y)], fill=(14, 34, 50))
    kind = rnd.choice(['trace', 'bars', 'text'])
    if kind == 'trace':
        pts = [(x, h * 2 + math.sin(x / (5 + rnd.random() * 6) + rnd.random()) * h * 1.3) for x in range(0, w * 4, 2)]
        dr.line(pts, fill=hue, width=2)
    elif kind == 'bars':
        for x in range(2, w * 4 - 4, 6):
            bh = rnd.randint(h, h * 3)
            dr.rectangle([x, h * 4 - bh, x + 3, h * 4 - 2], fill=hue)
    else:
        for y in range(3, h * 4 - 3, 5):
            dr.rectangle([3, y, 3 + rnd.randint(w, w * 3), y + 2], fill=hue)
    return im


def world_map(w, h):
    """The ground track: a dim map with a sine-wave orbit and the rocket's dot."""
    im = Image.new('RGB', (w * 4, h * 4), (4, 12, 30))
    dr = ImageDraw.Draw(im)
    for cx, cy, rx, ry in [(0.2, 0.35, 0.12, 0.18), (0.3, 0.7, 0.06, 0.16), (0.52, 0.3, 0.1, 0.12), (0.55, 0.62, 0.08, 0.16),
                           (0.75, 0.35, 0.16, 0.14), (0.85, 0.75, 0.06, 0.06)]:
        dr.ellipse([(cx - rx) * w * 4, (cy - ry) * h * 4, (cx + rx) * w * 4, (cy + ry) * h * 4], fill=(20, 70, 50))
    pts = [(x, h * 2 + math.sin(x / (w * 4) * math.pi * 2 + 1.2) * h * 1.2) for x in range(0, w * 4, 2)]
    dr.line(pts, fill=(240, 200, 60), width=2)
    dr.ellipse([w * 1.1 - 3, h * 2.6 - 3, w * 1.1 + 3, h * 2.6 + 3], fill=(255, 80, 60))
    return im


r.wall(mottled('#262C3A', '#2E3444', scale=2))
# acoustic wall panels and a ceiling of light strips
for x in range(-20, 340, 28):
    r.panel(x, 0, 26, 92, D - 0.03, mottled('#343A4C', '#3C4256', scale=3, rough=0.9), thick=2, name='acoustic')
for x in (40, 120, 200, 280):
    r.panel(x - 30, -10, 60, 4, D - 3.5, glow('#D8E4FF', 2.2), thick=2, name='ceiling_light')

# the big screen (the game paints the rocket on it), with mission clocks above
r.panel(54, 12, 212, 78, D - 0.05, mat('#5A5C66', metal=0.6, rough=0.35), thick=6)
r.panel(60, 18, 200, 66, D - 0.08, mat('#050508'), thick=0.5)
r.panel(70, 3, 70, 8, D - 0.06, mat('#08080A'), thick=1, name='clock')
r.text('T- 00:10:00', 105, 7, 4.2, D - 0.1, glow('#FF3020', 2.0))
r.panel(180, 3, 70, 8, D - 0.06, mat('#08080A'), thick=1, name='clock')
r.text('CST 14:32:07', 215, 7, 4.2, D - 0.1, glow('#30FF60', 2.0))
# side displays: the ground track on the left, weather and telemetry on the right
r.screen(6, 20, 44, 32, D - 0.06, world_map(44, 32), name='map')
r.text('GROUND TRACK', 28, 56, 2.6, D - 0.06, glow('#80A8FF', 1.2))
r.screen(270, 20, 44, 32, D - 0.06, telemetry(44, 32, (80, 220, 255)), name='side')
r.text('STAGE 1 LOX', 292, 56, 2.6, D - 0.06, glow('#80A8FF', 1.2))
r.screen(6, 62, 44, 24, D - 0.06, telemetry(44, 24, (255, 190, 60)), name='side2')
r.screen(270, 62, 44, 24, D - 0.06, telemetry(44, 24, (120, 255, 120)), name='side3')
r.text('LaffX', 300, 92, 4, D - 0.06, mat('#E8E8E8'))
# flags on the side walls
for x, c in ((52, '#C81E28'), (264, '#1830B0')):
    r.panel(x, 94, 1, 40, D - 0.4, mat('#B8A060', metal=0.8), thick=1, name='flagpole')

# tiered consoles: sloped desks, two monitors per station, keyboards
for i in range(3):
    y = 96 + i * 14
    d = D - 0.6 - i * 0.9
    r.panel(10, y, 300, 10, d, mat('#2E3038', metal=0.4, rough=0.4), thick=20, name='console')
    r.panel(10, y - 1, 300, 1.5, d - 0.02, mat('#7A7C84', metal=0.6), thick=20, name='console_top')
    r.panel(10, y + 8, 300, 2, d - 0.03, mat('#4A6CC8', rough=0.4), thick=0.5, name='console_trim')
    for x in range(14, 300, 36):
        for k, dx in enumerate((0, 15)):
            hue = [(80, 220, 255), (255, 190, 60), (120, 255, 120), (255, 110, 90)][(x // 36 + k + i) % 4]
            r.panel(x + dx + 2, y - 9.5, 14, 9, d - 0.01, mat('#18181C', metal=0.5, rough=0.4), thick=1, name='bezel')
            r.screen(x + dx + 3, y - 8.5, 12, 7, d - 0.03, telemetry(12, 7, hue), thick=0.3, name='monitor')
        r.panel(x + 6, y + 3, 18, 2, d - 0.05, mat('#1A1A20', rough=0.5), thick=1.5, name='keyboard')

r.floor(planks('#3A3E4C', '#2C3040', scale=1.0, axis='h', floor=True, rough=0.4))
# office chairs at the front row
for x in (24, 96, 150, 270):
    r.block(x, 12, 140, 150, 10, mat('#4A5068', rough=0.6), 'chairseat', lift=6)
    r.block(x + 1, 10, 128, 141, 3, mat('#4A5068', rough=0.6), 'chairback', lift=4)

# the launch button
r.block(196, 24, 140, 152, 12, mat('#B8BCC0', metal=0.6), 'buttonbox', lift=2)
r.block(203, 10, 135, 152, 6, glow('#F01818', 1.2), 'button', lift=12)
r.text('LAUNCH', 208, 149, 2.6, r.floor_d(152) - 0.05, mat('#101010'))

r.ambient('#6070B0', 1.1)
r.key(energy=320, color='#C8D8FF')
r.lamp(160, 60, D - 2, color='#80A0FF', energy=200, radius=2)
r.render(out_dir())
