"""Larry's big karaoke number: the noraebang stage up close, with Larry and
Grace in mid-duet. Two frames each (crooning, then belting) that the game
swaps on the beat.

    python3 art/scenes/karaoke.py   # writes src/art/scenes/karaoke-*.png
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scenekit as sk  # noqa: E402
from scenekit import rad  # noqa: E402

PPM = 110


def singer(name, frame, turn, mic_side, other):
    c = sk.character(name)
    c.root.rotation_euler = rad(0, 0, turn)
    j = c.j
    sx = 1 if mic_side == 'R' else -1
    j['shoulder' + mic_side].rotation_euler = rad(-42, 0, sx * 22)
    j['elbow' + mic_side].rotation_euler = rad(-128, 0, 0)
    j['wrist' + mic_side].rotation_euler = rad(-30, 0, 0)
    if frame == 0:
        j['shoulder' + other].rotation_euler = rad(-10, 0, -sx * 12)
        j['elbow' + other].rotation_euler = rad(-30, 0, 0)
        c.neck.rotation_euler = rad(4, 0, 0)
    else:
        j['shoulder' + other].rotation_euler = rad(-150, 0, -sx * 30)
        j['elbow' + other].rotation_euler = rad(-15, 0, 0)
        c.neck.rotation_euler = rad(-7, 0, 0)
        c.chest.rotation_euler = rad(-3, 0, 0)
    sk.mic(c, mic_side)
    sk.shoot(f'karaoke-{name}-{frame}', 110, 150, cam=(0, -8, 1.22), target=(0, 0, 1.22), ppm=PPM,
             lights=[('#FFE8F4', 4.0, (45, 0, -25)), ('#FF60E0', 3.0, (60, 0, 140)), ('#60C0FF', 2.0, (70, 0, -150))])


def stage():
    sk.reset()
    from kit import Room, glow, mat, mottled
    r = Room('karaoke-bg', floor_y=176, depth=6.0)
    D = r.D
    r.wall(mottled('#6A1080', '#3A0650', scale=1.5))
    for x in range(-20, 340, 24):
        r.panel(x, 0, 2, 180, D - 0.05, glow(['#FF60E0', '#60E0FF', '#FFE060'][(x // 24) % 3], 0.9), thick=1, name='led')
    r.panel(40, 8, 240, 112, D - 0.3, mat('#2A2A2E', metal=0.5), thick=6, name='screenframe')
    r.panel(46, 14, 228, 100, D - 0.32, mat('#050505'), thick=0.5, name='screen')
    for x in (20, 300):
        r.panel(x - 14, 90, 28, 70, D - 0.6, mat('#151518'), thick=16, name='speaker')
        r.oval(x, 108, 9, 9, D - 0.62, mat('#333338', rough=0.3), thick=1)
        r.oval(x, 138, 11, 11, D - 0.62, mat('#333338', rough=0.3), thick=1)
    r.ball(296, 18, D - 1.5, 10, mat('#E0E0F0', metal=1, rough=0.08))
    r.floor(mottled('#2030A0', '#101858', scale=1.5, floor=True, rough=0.3))
    r.lamp(160, 40, D - 3, color='#FF80F0', energy=200, radius=1)
    r.ambient('#A040C0', 0.6)
    r.key(energy=200, color='#FFD0F0')
    sk.backdrop(r)


which = sys.argv[1:] or ['stage', 'larry', 'grace']
if 'stage' in which:
    stage()
for f in (0, 1):
    if 'larry' in which:
        singer('larry', f, 28, 'R', 'L')
    if 'grace' in which:
        singer('grace', f, -28, 'L', 'R')
