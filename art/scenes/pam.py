"""Pam to the rescue: a Baywatch-style slow-motion beach run. A sunny beach with
a lifeguard tower, Pam running with her red rescue can, Pam reaching down a
hand, and Larry flat on the sand, sitting up, and smitten.

    python3 art/scenes/pam.py   # writes src/art/scenes/pam-*.png
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scenekit as sk  # noqa: E402
from scenekit import rad  # noqa: E402

PPM = 96 / 1.8  # twice the size of the room sprites
W, H = 80, 112
TILT = math.radians(6)


def shoot(name, zc=0.95, w=W, h=H):
    cam = (0, -20 * math.cos(TILT), zc + 20 * math.sin(TILT))
    sk.shoot(name, w, h, cam=cam, target=(0, 0, zc), ppm=PPM)


def beach():
    from kit import Room, glow, mat, mottled
    r = Room('pam-beach', floor_y=118)
    D = r.D
    r.sky('#2E86E8', '#BCE4FF', d=90)
    for x, y, w in ((50, 20, 70), (220, 32, 90), (300, 14, 50)):
        r.cloud(x, y, w)
    # the Pacific, with a bright line of surf
    r.panel(-60, 92, 440, 26, D + 6, mottled('#1E78C8', '#3A9AE0', scale=2, emit=0.25), thick=1, name='sea')
    r.panel(-60, 112, 440, 3, D + 5.9, glow('#F4FAFF', 1.2), thick=1, name='surf')
    r.floor(mottled('#F2D9A2', '#E6C88A', scale=3, rough=0.95, floor=True))
    # Tower 18: a hut on stilts with a red roof, a railed deck and a ramp down to the sand
    d = r.floor_d(132)
    for x in (228, 276):
        r.panel(x, 84, 3, 50, d, mat('#E8E4DC'), thick=3, name='stilt')
    r.panel(220, 80, 64, 5, d - 0.4, mat('#D8D0C0'), thick=40, name='deck')
    r.panel(226, 56, 52, 24, d - 0.8, mat('#F4F2EC', rough=0.6), thick=30, name='hut')
    r.panel(234, 62, 14, 10, d - 0.82 - 0.0, mat('#3A6A9A', rough=0.2), thick=1, name='window')
    r.panel(256, 62, 14, 10, d - 0.82, mat('#3A6A9A', rough=0.2), thick=1, name='window')
    r.poly([(220, 58), (284, 58), (276, 48), (228, 48)], d - 0.9, mat('#D02828', rough=0.5), thick=34, name='roof')
    r.text('LIFEGUARD', 252, 53, 4, d - 1.1, mat('#FFFFFF'))
    r.text('18', 252, 76, 4, d - 0.85, mat('#D02828'))
    r.poly([(220, 82), (226, 86), (204, 132), (196, 130)], d - 0.2, mat('#D8D0C0'), thick=6, name='ramp')
    r.palm(40, 150, 40)
    r.palm(70, 156, 56)
    r.sun('#FFF2D0', energy=4.0, angle=(40, 0, 30))
    r.ambient('#A8D0F0', 0.7)
    sk.backdrop(r)


def pam(facing=90):
    c = sk.character('pam')
    c.root.rotation_euler = rad(0, 0, facing)
    return c


def rescue_can(c, side='R'):
    """The red rescue can, held by its strap so it trails behind the hand."""
    from kit import mat
    j = c._empty('canj', c.j['wrist' + side], (0, 0, -0.06))
    j.rotation_euler = rad(0, 80, 0)
    c.capsule(j, 0.075, 0.075, 0.5, mat('#E02020', rough=0.35), 'can', offset=(0, 0, -0.05))


def runs():
    """A four-frame slow-motion run, side on: big strides, arms pumping."""
    for f in range(4):
        c = pam()
        s = [1, 0, -1, 0][f]
        passing = f in (1, 3)
        j = c.j
        a = rad(38)[0] * s
        j['hipL'].rotation_euler.x = -a
        j['hipR'].rotation_euler.x = a
        back = 'R' if s > 0 else 'L'
        j['knee' + back].rotation_euler.x = rad(75)[0]
        j['knee' + ('L' if back == 'R' else 'R')].rotation_euler.x = rad(15)[0]
        if passing:
            lead = 'L' if f == 1 else 'R'
            other = 'R' if lead == 'L' else 'L'
            j['hip' + lead].rotation_euler.x = -rad(30)[0]
            j['knee' + lead].rotation_euler.x = rad(40)[0]
            j['hip' + other].rotation_euler.x = rad(10)[0]
            j['knee' + other].rotation_euler.x = rad(95)[0]
            c.pelvis.location.z = c.leg * 1.03
        else:
            c.pelvis.location.z = c.leg * 0.96
        j['shoulderL'].rotation_euler = (a * 1.2, 0, 0)
        j['shoulderR'].rotation_euler = (-a * 1.2, 0, 0)
        for side in 'LR':
            j['elbow' + side].rotation_euler.x = -rad(75)[0]
        c.chest.rotation_euler = rad(-6, 0, 0)
        c.neck.rotation_euler = rad(4, 0, 0)
        rescue_can(c)
        shoot(f'pam-run-{f}')


def reach():
    """Bent over, one hand down to the man on the sand."""
    c = pam()
    j = c.j
    c.chest.rotation_euler = rad(32, 0, 0)
    c.neck.rotation_euler = rad(-10, 0, 0)
    j['hipL'].rotation_euler = rad(-20, 0, 0)
    j['kneeL'].rotation_euler = rad(30, 0, 0)
    j['hipR'].rotation_euler = rad(15, 0, 0)
    j['kneeR'].rotation_euler = rad(10, 0, 0)
    c.pelvis.location.z = c.leg * 0.94
    j['shoulderR'].rotation_euler = rad(-25, 0, 0)
    j['elbowR'].rotation_euler = rad(-5, 0, 0)
    j['shoulderL'].rotation_euler = rad(10, 0, 0)
    j['elbowL'].rotation_euler = rad(-40, 0, 0)
    rescue_can(c, 'L')
    shoot('pam-reach')


def wave():
    """Walking off up the beach, waving over her shoulder."""
    c = pam(-90)
    j = c.j
    j['shoulderR'].rotation_euler = rad(0, 0, 0)
    j['shoulderL'].rotation_euler = rad(-170, 0, 0)
    j['elbowL'].rotation_euler = rad(-30, 0, 0)
    j['hipL'].rotation_euler = rad(-15, 0, 0)
    j['hipR'].rotation_euler = rad(12, 0, 0)
    j['kneeR'].rotation_euler = rad(20, 0, 0)
    c.neck.rotation_euler = rad(0, 0, 40)
    rescue_can(c)
    shoot('pam-wave')


def larry_flat():
    """Larry flat on his back on the sand, arms out, seeing stars."""
    c = sk.character('larry')
    c.root.rotation_euler = rad(0, 90, 0)
    c.root.location = (-0.8, 0, 0.16)
    for s, sx in (('L', 1), ('R', -1)):
        c.j['shoulder' + s].rotation_euler = rad(0, -sx * 60, 0)
        c.j['hip' + s].rotation_euler = rad(0, -sx * 8, 0)
    c.j['kneeL'].rotation_euler = rad(30, 0, 0)
    shoot('larry-flat', zc=0.5, w=112, h=60)


def larry_up():
    """Back on his feet, hands clasped at his chest, completely smitten."""
    c = sk.character('larry')
    c.root.rotation_euler = rad(0, 0, 90)
    for s, sz in (('L', -1), ('R', 1)):
        c.j['shoulder' + s].rotation_euler = rad(-55, 0, sz * 25)
        c.j['elbow' + s].rotation_euler = rad(-95, 0, 0)
    c.neck.rotation_euler = rad(-12, 0, 0)
    c.chest.rotation_euler = rad(4, 0, 0)
    shoot('larry-smitten')


if __name__ == '__main__':
    which = sys.argv[1:] or ['beach', 'runs', 'reach', 'wave', 'larry_flat', 'larry_up']
    for name in which:
        globals()[name]()
