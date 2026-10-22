"""Tom Cruise's stunts: pull-ups on the hangar scaffold, climbing the rocket on
suction cups, dropping to the pad, and hugging Larry. Each pose is a sprite at
the same scale as the character sheets, with its anchor points (hands, feet)
written to cruise-stunts.json so the game can pin the hands to the bar or the
suction cups to the rocket.

    python3 art/scenes/cruise.py   # writes src/art/scenes/cruise-*.png and cruise-stunts.json
"""

import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scenekit as sk  # noqa: E402
from scenekit import rad  # noqa: E402

PPM = 48 / 1.8  # the character sheets' scale: 48 px = 1.8 m
W, H = 48, 72
TILT = math.radians(8)
ZC = 1.2  # the camera looks at this height
anchors = {}


def project(world, sc):
    """World point to sprite pixel (x right, y down)."""
    from bpy_extras.object_utils import world_to_camera_view
    from mathutils import Vector
    v = world_to_camera_view(sc, sc.camera, Vector(world))
    return [round(v.x * W, 1), round((1 - v.y) * H, 1)]


def shot(c, name, points, zc=ZC):
    """Render c, then record where its named joints land in the sprite."""
    import bpy
    cam = (0, -20 * math.cos(TILT), zc + 20 * math.sin(TILT))
    sk.shoot(name, W, H, cam=cam, target=(0, 0, zc), ppm=PPM)
    bpy.context.view_layer.update()
    sc = bpy.context.scene
    anchors[name] = {k: project(c.j[j].matrix_world.translation if isinstance(j, str) else j, sc) for k, j in points.items()}


def world(c, joint):
    import bpy
    bpy.context.view_layer.update()
    return c.j[joint].matrix_world.translation.copy()


def aim(c, joint, child, target, out_sign):
    """Two-bone IK in the picture plane (x, z): bend joint and child so the next
    joint down lands on target, with the elbow or knee bowing toward out_sign."""
    s = world(c, joint)
    e = world(c, child)
    w = world(c, {'elbow': 'wrist', 'knee': 'ankle'}[child[:-1]] + child[-1])
    l1 = (e - s).length
    l2 = (w - e).length
    dx, dz = target[0] - s.x, target[1] - s.z
    d = min(math.hypot(dx, dz), (l1 + l2) * 0.995)
    base = math.atan2(dx, dz)
    a = math.acos(max(-1, min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))))
    cands = [base + a, base - a]
    up = max(cands, key=lambda t: out_sign * math.sin(t))
    ex, ez = s.x + l1 * math.sin(up), s.z + l1 * math.cos(up)
    fore = math.atan2(target[0] - ex, target[1] - ez)
    # a limb hangs along -z; rotating it by r about y points it at (-sin r, -cos r)
    # in the parent's frame, which (with no other rotation upstream) is the world frame.
    ru = math.atan2(-math.sin(up), -math.cos(up))
    rf = math.atan2(-math.sin(fore), -math.cos(fore))
    c.j[joint].rotation_euler = (0, -ru if c.mirror else ru, 0)
    c.j[child].rotation_euler = (0, -(rf - ru) if c.mirror else (rf - ru), 0)


def tom(facing=0):
    c = sk.character('cruise')
    c.root.rotation_euler = rad(0, 0, facing)
    # seen from behind, the picture's +x is the body's -x
    c.mirror = facing == 180
    return c


def pullups():
    """Hands fixed on a bar; the body rises from a dead hang to chin over the bar."""
    bar_z, grip = 2.35, 0.3
    for i, (lift, tuck) in enumerate([(0.0, 0), (0.15, 15), (0.3, 35)]):
        c = tom()
        c.root.location.z = bar_z - 1.66 + lift
        for s, sx in (('L', 1), ('R', -1)):
            aim(c, 'shoulder' + s, 'elbow' + s, (sx * grip, bar_z), sx)
            c.j['hip' + s].rotation_euler = rad(-tuck * 0.6, 0, 0)
            c.j['knee' + s].rotation_euler = rad(tuck * 1.6, 0, 0)
        c.j['ankleL'].rotation_euler = rad(tuck, 0, 0)
        c.neck.rotation_euler = rad(-lift * 30, 0, 0)
        shot(c, f'cruise-pullup-{i}', {'handL': 'wristL', 'handR': 'wristR'}, zc=1.45)


def climbs():
    """Seen from behind, spread on the side of the rocket: reach, pull, reach."""
    poses = [
        # (left hand target, right hand target) relative to the shoulders, left knee up?, right knee up?
        ((0.2, 0.5), (-0.35, -0.05), True, False),
        ((0.3, 0.25), (-0.3, 0.25), False, False),
        ((0.35, -0.05), (-0.2, 0.5), False, True),
    ]
    for i, (lt, rt, lk, rk) in enumerate(poses):
        c = tom(180)
        for s, t, knee in (('L', lt, lk), ('R', rt, rk)):
            sh = world(c, 'shoulder' + s)
            # picture-plane targets: the body's left is the picture's right when seen from behind
            aim(c, 'shoulder' + s, 'elbow' + s, (sh.x + (-t[0] if c.mirror else t[0]), sh.z + t[1]),
                1 if (sh.x > 0) else -1)
            hp = world(c, 'hip' + s)
            out = 1 if hp.x > 0 else -1
            # a knee-up leg splays out like a frog on a window; the other hangs nearly straight
            foot = (hp.x + out * 0.3, hp.z - 0.38) if knee else (hp.x + out * 0.1, hp.z - 0.69)
            aim(c, 'hip' + s, 'knee' + s, foot, out)
        c.chest.rotation_euler = rad(-6, 0, 0)
        shot(c, f'cruise-climb-{i}', {'handL': 'wristL', 'handR': 'wristR', 'feetL': 'ankleL', 'feetR': 'ankleR'})


def flail():
    """A cup pops off: one hand stuck, the other arm and a leg windmilling."""
    c = tom(180)
    shL = world(c, 'shoulderL')
    aim(c, 'shoulderL', 'elbowL', (shL.x - 0.25, shL.z + 0.35), -1 if shL.x < 0 else 1)
    c.j['shoulderR'].rotation_euler = (0, rad(150)[0], 0)
    c.j['elbowR'].rotation_euler = (0, rad(40)[0], 0)
    c.j['hipR'].rotation_euler = rad(-40, 0, -30)
    c.j['kneeR'].rotation_euler = rad(60, 0, 0)
    c.j['hipL'].rotation_euler = rad(-10, 0, 8)
    c.neck.rotation_euler = rad(-15, 0, 10)
    shot(c, 'cruise-flail', {'handL': 'wristL', 'handR': 'wristR'})


def landing():
    """Superhero landing on the pad: deep crouch, one fist down, other arm out."""
    c = tom()
    c.pelvis.location.z = 0.44
    for s, sx in (('L', 1), ('R', -1)):
        aim(c, 'hip' + s, 'knee' + s, (sx * 0.34, 0.04), sx)
    c.chest.rotation_euler = rad(-15, 0, 0)
    shR = world(c, 'shoulderR')
    aim(c, 'shoulderR', 'elbowR', (shR.x - 0.12, 0.12), -1)
    c.j['shoulderL'].rotation_euler = rad(0, -80, 0)
    c.j['elbowL'].rotation_euler = rad(0, -25, 0)
    shot(c, 'cruise-land', {'feet': (0, 0, 0)})


def hug(name, who, facing):
    """Arms out for a hug, facing across the picture."""
    c = sk.character(who)
    c.root.rotation_euler = rad(0, 0, facing)
    for s in 'LR':
        c.j['shoulder' + s].rotation_euler = rad(-80, 0, 18 if s == 'L' else -18)
        c.j['elbow' + s].rotation_euler = rad(-25, 0, 0)
    c.chest.rotation_euler = rad(-5, 0, 0)
    shot(c, name, {'feet': (0, 0, 0)})


if __name__ == '__main__':
    pullups()
    climbs()
    flail()
    landing()
    hug('cruise-hug', 'cruise', 90)
    hug('larry-hug', 'larry', -90)
    with open(os.path.join(sk.GAME, 'cruise-stunts.json'), 'w') as f:
        json.dump(anchors, f, indent=1)
    print(json.dumps(anchors))
