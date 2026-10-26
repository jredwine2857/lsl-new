"""The wedding: Room 3 of the Cho family noraebang, dressed for the big day,
with Donald Trump officiating and Elon Musk as best man. Poses for Larry and
Grace at the flower arch, Trump at the lectern (reading, proclaiming, and
with the binoculars he has been watching Larry through all game), and Elon
holding out the ring.

    python3 art/scenes/wedding.py [hall poses ...]   # writes src/art/scenes/wed-*.png
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scenekit as sk  # noqa: E402
from scenekit import rad  # noqa: E402

PPM = 96 / 1.8  # the same size as Pam's rescue poses
W, H = 80, 112
TILT = math.radians(6)


def shoot(name, zc=0.95, w=W, h=H):
    cam = (0, -20 * math.cos(TILT), zc + 20 * math.sin(TILT))
    sk.shoot(name, w, h, cam=cam, target=(0, 0, zc), ppm=PPM)


def hall():
    from kit import Room, glow, mat, mottled, planks
    r = Room('wed-hall', floor_y=128)
    D = r.D
    r.wall(mottled('#8A1A9A', '#5A0A6A', scale=1.5))
    for x in range(-20, 340, 30):
        r.panel(x, 6, 2, 120, D - 0.05, glow('#FF60E0', 0.5), thick=1, name='led_strip')
    # the karaoke screen (its words are drawn by the game) between the speakers
    r.panel(100, 10, 120, 56, D - 0.3, mat('#2A2A2E', metal=0.5), thick=6)
    r.panel(105, 15, 110, 46, D - 0.32, mat('#050505'), thick=0.5)
    for x in (78, 242):
        r.panel(x - 11, 30, 22, 38, D - 0.4, mat('#151518'), thick=16)
        r.oval(x, 42, 6, 6, D - 0.42, mat('#333338', rough=0.3), thick=1)
        r.oval(x, 58, 4.5, 4.5, D - 0.42, mat('#333338', rough=0.3), thick=1)
    r.panel(279.5, -10, 1, 26, D - 2, mat('#888888'))
    r.ball(280, 22, D - 2, 7, mat('#E0E0F0', metal=1, rough=0.08))
    # a white flower arch over the spot where they'll stand
    d = r.floor_d(150)
    white = mat('#F4F0F4', rough=0.5)
    for x in (88, 228):
        r.panel(x, 36, 6, 116, d, white, thick=6, name='arch_post')
    n = 24
    for i in range(n + 1):
        a = math.pi * i / n
        x = 161 - math.cos(a) * 70
        y = 40 - math.sin(a) * 26
        r.ball(x, y, d - 0.05, 5.5, mat('#F8F4F8', rough=0.7), name='flower')
        r.ball(x + 2, y + 3, d - 0.1, 3.2, mat(['#FF7AB0', '#FFC0D8', '#E83A7A'][i % 3], rough=0.7), name='rose')
    for x in (91, 231):
        for k in range(5):
            r.ball(x + (k % 2) * 3 - 1.5, 60 + k * 16, d - 0.1, 3.4, mat(['#FF7AB0', '#FFC0D8', '#E83A7A'][k % 3], rough=0.7), name='rose')
    # strings of party lights across the top
    for row, y0 in ((0, 4), (1, 12)):
        for i in range(17):
            x = 6 + i * 19 + row * 9
            y = y0 + math.sin(i * 0.9) * 3
            r.text('♥', x, y, 7, D - 0.6, glow('#FF4A8A' if (i + row) % 2 else '#FFFFFF', 0.6), font=None)
    # a white runner up the middle of the floor
    r.floor(planks('#1830A0', '#0A0A2A', scale=1.0, axis='h', floor=True, rough=0.3))
    r.slab(200, 150, mat('#F4F0EC', rough=0.85), x0=124, x1=196, height=0.4, name='runner')
    r.lamp(280, 22, D - 2.5, color='#FFFFFF', energy=80)
    r.lamp(160, 30, d - 2, color='#FFE0F0', energy=60)
    r.ambient('#A040C0', 0.5)
    r.key(energy=200, color='#FFD0F0')
    sk.backdrop(r)


def book(c, side='L'):
    """A white wedding book held open in the hand."""
    from kit import mat
    j = c._empty('bookj', c.j['wrist' + side], (0, 0, -0.06))
    c.box(j, (0, -0.06, -0.02), (0.22, 0.03, 0.16), mat('#F4F0E4', rough=0.8), 'book', rot=rad(-60, 0, 0), bevel=0.005)
    c.box(j, (0, -0.045, -0.02), (0.235, 0.02, 0.17), mat('#7A1020', rough=0.6), 'cover', rot=rad(-60, 0, 0), bevel=0.005)


def binoculars(c):
    from kit import mat
    r = c.head_r
    from mathutils import Vector
    for sx in (1, -1):
        c.ball(c.headj, Vector((sx * r * 0.36, -r * 1.25, r * 1.0)), (r * 0.24, r * 0.5, r * 0.24), mat('#1A1A1E', rough=0.4), 'barrel')
        c.ball(c.headj, Vector((sx * r * 0.36, -r * 1.72, r * 1.0)), (r * 0.18, r * 0.03, r * 0.18), mat('#5A8AC0', rough=0.1, metal=0.3), 'lens')


def trump_read():
    """At the lectern facing us, the book in one hand, the other hand up making a point."""
    c = sk.character('trump')
    j = c.j
    j['shoulderL'].rotation_euler = rad(-55, 0, 0)
    j['elbowL'].rotation_euler = rad(-70, 0, 0)
    book(c)
    j['shoulderR'].rotation_euler = rad(-35, 40, 0)
    j['elbowR'].rotation_euler = rad(-70, 0, 0)
    shoot('wed-trump-read')


def trump_proclaim():
    """Both arms up and wide: 'I now pronounce you...'"""
    c = sk.character('trump')
    for s, sy in (('L', -1), ('R', 1)):
        c.j['shoulder' + s].rotation_euler = (0, rad(sy * 125)[0], 0)
        c.j['elbow' + s].rotation_euler = (0, rad(sy * 20)[0], 0)
    c.neck.rotation_euler = rad(-10, 0, 0)
    shoot('wed-trump-proclaim')


def trump_walk():
    """Two walking frames, side on, for his entrance."""
    for f, s in enumerate((1, -1)):
        c = sk.character('trump')
        c.root.rotation_euler = rad(0, 0, 90)
        j = c.j
        j['hipL'].rotation_euler = rad(-22 * s, 0, 0)
        j['hipR'].rotation_euler = rad(22 * s, 0, 0)
        j['kneeR' if s > 0 else 'kneeL'].rotation_euler = rad(20, 0, 0)
        j['shoulderL'].rotation_euler = rad(18 * s, 0, 0)
        j['shoulderR'].rotation_euler = rad(-18 * s, 0, 0)
        # one hand up in a wave to the crowd
        j['shoulderR' if s > 0 else 'shoulderL'].rotation_euler = rad(-150, 0, 0)
        shoot(f'wed-trump-walk-{f}')


def trump_binoculars():
    """The reveal: binoculars up to his eyes, aimed right at us."""
    c = sk.character('watcher')
    for s, sy in (('L', -1), ('R', 1)):
        c.j['shoulder' + s].rotation_euler = rad(-75, 0, sy * 20)
        c.j['elbow' + s].rotation_euler = rad(-115, 0, 0)
    binoculars(c)
    shoot('wed-trump-binoculars')


def trump_thumbs():
    """Thumbs up: 'Somebody had to keep you safe.'"""
    c = sk.character('trump')
    c.j['shoulderR'].rotation_euler = rad(-60, 0, -15)
    c.j['elbowR'].rotation_euler = rad(-80, 0, 0)
    from kit import mat
    from mathutils import Vector
    c.ball(c.j['wristR'], Vector((0, 0, -0.02)), (0.02, 0.02, 0.05), mat('#F0A468'), 'thumb')
    c.ball(c.j['wristR'], Vector((0, 0, 0.04)), (0.022, 0.022, 0.045), mat('#F0A468'), 'thumbup')
    shoot('wed-trump-thumbs')


def couple(name, who, facing, lean=0):
    c = sk.character(who)
    c.root.rotation_euler = rad(0, 0, facing)
    for s in 'LR':
        c.j['shoulder' + s].rotation_euler = rad(-30, 0, 0)
        c.j['elbow' + s].rotation_euler = rad(-60, 0, 0)
    c.chest.rotation_euler = rad(lean, 0, 0)
    c.neck.rotation_euler = rad(lean * 0.5, 0, 0)
    if who == 'grace-bride':
        from kit import mat
        from mathutils import Vector
        # the bouquet, held in both hands
        c.ball(c.j['wristR'], Vector((0, -0.04, -0.06)), (0.09, 0.09, 0.08), mat('#FF7AB0', rough=0.7), 'bouquet')
        c.ball(c.j['wristR'], Vector((0.03, -0.08, -0.03)), (0.04, 0.04, 0.04), mat('#FFFFFF', rough=0.7), 'bloom')
    shoot(name)


def larry_shrug():
    """Facing us, arms out: 'Wait. Why are YOU here?'"""
    c = sk.character('larry')
    for s, sy in (('L', -1), ('R', 1)):
        c.j['shoulder' + s].rotation_euler = (0, rad(sy * 40)[0], 0)
        c.j['elbow' + s].rotation_euler = (rad(-70)[0], 0, 0)
    c.neck.rotation_euler = rad(0, 0, 10)
    shoot('wed-larry-shrug')


def elon_ring():
    """Best man, side on, holding out the ring box."""
    c = sk.character('elon-tux')
    c.root.rotation_euler = rad(0, 0, 90)
    c.j['shoulderR'].rotation_euler = rad(-80, 0, 0)
    c.j['elbowR'].rotation_euler = rad(-10, 0, 0)
    sk.ring_box(c, 'R', 1.4)
    shoot('wed-elon-ring')


def elon_stand():
    c = sk.character('elon-tux')
    c.root.rotation_euler = rad(0, 0, 60)
    for s in 'LR':
        c.j['shoulder' + s].rotation_euler = rad(-20, 0, 0)
        c.j['elbow' + s].rotation_euler = rad(-50, 0, 0)
    shoot('wed-elon')


def closeup():
    """Head and shoulders, filling the screen: pointing at us, mid-boast. Three
    mouth shapes (shut, open, wide) so the game can lip-flap it."""
    import bpy
    for f, (open_, wide) in enumerate(((1, 1), (2.6, 1.05), (4, 1.15))):
        c = sk.character('trump')
        c.j['shoulderR'].rotation_euler = rad(-80, 0, 10)
        c.j['elbowR'].rotation_euler = rad(-15, 0, 0)
        c.j['shoulderL'].rotation_euler = rad(-30, 0, 15)
        c.j['elbowL'].rotation_euler = rad(-70, 0, 0)
        c.neck.rotation_euler = rad(-6, 0, 0)
        for o in bpy.data.objects:
            if o.name.startswith('mouth'):
                o.scale = (o.scale[0] * wide, o.scale[1], o.scale[2] * open_)
                o.location.z -= c.head_r * 0.02 * (open_ - 1)
        zc = 1.45
        cam = (0, -20 * math.cos(TILT), zc + 20 * math.sin(TILT))
        sk.shoot(f'wed-trump-close-{f}', 200, 200, cam=cam, target=(0, 0, zc), ppm=200 / 0.95)


def poses():
    trump_read()
    trump_proclaim()
    trump_walk()
    trump_binoculars()
    trump_thumbs()
    couple('wed-larry', 'larry', 60)
    couple('wed-grace', 'grace-bride', -60)
    couple('wed-larry-kiss', 'larry', 80, lean=18)
    couple('wed-grace-kiss', 'grace-bride', -80, lean=18)
    larry_shrug()
    elon_ring()
    elon_stand()


if __name__ == '__main__':
    which = sys.argv[1:] or ['hall', 'poses']
    for name in which:
        globals()[name]()
