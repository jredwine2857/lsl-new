"""Character kit: build a caricature person in Blender and render a sprite sheet.

Every character is the same jointed body (pelvis, hips, knees, shoulders,
elbows, neck) dressed with a few parts: hair, nose, jacket, dress, glasses and
so on. Posing is just rotating the joints, so a walk cycle is four poses.

The sheet is 5 columns (idle, then 4 walk frames) by 3 rows (facing down,
up, right; the game mirrors right for left). Each cell is CELL_W x CELL_H game
pixels with the feet on row FEET_ROW, centred.

    c = Char('larry', skin='#F0B890')
    c.head(hair='#7A4A22', hair_style='receding', nose=1.6)
    c.suit('#F4F2EA', shirt='#202020', lapels='#E2DCC8')
    c.legs('#F4F2EA', shoes='#1A1A1A', flare=1.3)
    c.render(out_dir)
"""

import math
import os
import sys

import bpy  # noqa: I001 (bpy must load before bmesh)
import bmesh
from mathutils import Euler, Vector

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import lin, mat  # noqa: E402

CELL_W, CELL_H = 32, 48
FEET_ROW = 46
SS = 8  # supersampling: render at 8x and shrink
M_PER_PX = 1.8 / CELL_H  # ortho camera: 48 px = 1.8 m
TILT = math.radians(8)

FACINGS = {'down': 0.0, 'up': 180.0, 'right': 90.0}


def _clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


class Char:
    def __init__(self, name, skin='#F0B890', height=1.0, build=1.0, head_scale=1.0):
        _clear()
        self.name = name
        self.scene = bpy.context.scene
        self.skin = mat(skin, rough=0.55)
        self.h = height  # overall height multiplier
        self.b = build   # width multiplier (Barkley 1.3, Moranis 0.85)
        self.hs = head_scale
        self.j = {}
        self._rig()

    # --- rig -------------------------------------------------------------
    def _empty(self, name, parent, loc):
        e = bpy.data.objects.new(name, None)
        self.scene.collection.objects.link(e)
        e.parent = parent
        e.location = loc
        e.rotation_mode = 'XYZ'
        self.j[name] = e
        return e

    def _rig(self):
        h, b = self.h, self.b
        self.leg = 0.74 * h
        self.root = self._empty('root', None, (0, 0, 0))
        self.pelvis = self._empty('pelvis', self.root, (0, 0, self.leg))
        for s, x in (('L', 0.1 * b), ('R', -0.1 * b)):
            hip = self._empty('hip' + s, self.pelvis, (x, 0, 0))
            knee = self._empty('knee' + s, hip, (0, 0, -0.36 * h))
            self._empty('ankle' + s, knee, (0, 0, -0.34 * h))
        self.chest = self._empty('chest', self.pelvis, (0, 0, 0.26 * h))
        for s, x in (('L', 0.25 * b), ('R', -0.25 * b)):
            sh = self._empty('shoulder' + s, self.chest, (x, 0, 0.20 * h))
            el = self._empty('elbow' + s, sh, (0, 0, -0.26 * h))
            self._empty('wrist' + s, el, (0, 0, -0.22 * h))
        self.neck = self._empty('neck', self.chest, (0, 0, 0.26 * h))

    # --- mesh helpers ------------------------------------------------------
    def _link(self, obj, parent, m):
        obj.parent = parent
        obj.data.materials.append(m)
        for p in obj.data.polygons:
            p.use_smooth = True
        return obj

    def capsule(self, parent, r0, r1, length, m, name='seg', offset=(0, 0, 0), sx=1.0, sy=1.0):
        """A tapered segment hanging down from the joint, rounded at both ends."""
        bm = bmesh.new()
        segs, rings = 20, 10
        verts = []
        for i in range(rings + 1):
            t = i / rings
            r = r0 + (r1 - r0) * t
            z = -length * t
            ring = [bm.verts.new((math.cos(a) * r * sx, math.sin(a) * r * sy, z))
                    for a in (2 * math.pi * k / segs for k in range(segs))]
            verts.append(ring)
        for i in range(rings):
            for k in range(segs):
                a, c = verts[i][k], verts[i][(k + 1) % segs]
                d, e = verts[i + 1][(k + 1) % segs], verts[i + 1][k]
                bm.faces.new((a, c, d, e))
        bm.faces.new(list(reversed(verts[0])))
        bm.faces.new(verts[-1])
        me = bpy.data.meshes.new(name)
        bm.to_mesh(me)
        obj = bpy.data.objects.new(name, me)
        self.scene.collection.objects.link(obj)
        obj.location = offset
        mod = obj.modifiers.new('sub', 'SUBSURF')
        mod.levels = mod.render_levels = 1
        self._link(obj, parent, m)
        # round caps
        for z, r in ((0, r0), (-length, r1)):
            self.ball(parent, (offset[0], offset[1], offset[2] + z), (r * sx, r * sy, r), m, name + 'cap')
        return obj

    def ball(self, parent, loc, size, m, name='ball', rot=(0, 0, 0)):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=14, radius=1, location=(0, 0, 0))
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = size
        obj.rotation_euler = rot
        self._link(obj, parent, m)
        obj.location = loc
        return obj

    def box(self, parent, loc, size, m, name='box', rot=(0, 0, 0), bevel=0.02):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = size
        obj.rotation_euler = rot
        if bevel:
            mod = obj.modifiers.new('bev', 'BEVEL')
            mod.width = bevel
            mod.segments = 3
        self._link(obj, parent, m)
        obj.location = loc
        return obj

    # --- body parts --------------------------------------------------------
    def head(self, hair, hair_style='short', nose=1.0, chin=1.0, brows=None, mouth='#7A2A22', eyes='#141414',
             beard=None, moustache=None, ears=1.0):
        h, s = self.h, self.hs
        r = 0.19 * s
        self.head_r = r
        hj = self._empty('head', self.neck, (0, 0, 0.06 * h))
        self.headj = hj
        self.capsule(self.neck, 0.07, 0.075, 0.10 * h, self.skin, 'neckseg', offset=(0, 0, 0.08 * h))
        c = Vector((0, 0, r * 0.95))
        self.ball(hj, c, (r * 0.92, r * 0.95, r * 1.08), self.skin, 'skull')
        self.ball(hj, c + Vector((0, -r * 0.25, -r * 0.55 * chin)), (r * 0.62, r * 0.6, r * 0.42 * chin), self.skin, 'jaw')
        # nose: a caricature nose sells the character at 40 pixels
        self.ball(hj, c + Vector((0, -r * 0.98, -r * 0.12)), (r * 0.2 * nose, r * 0.3 * nose, r * 0.24 * nose),
                  self.skin, 'nose', rot=(math.radians(-15), 0, 0))
        for sx in (1, -1):
            self.ball(hj, c + Vector((sx * r * 0.92, 0, -r * 0.05)), (r * 0.12 * ears, r * 0.18 * ears, r * 0.25 * ears), self.skin, 'ear')
            self.ball(hj, c + Vector((sx * r * 0.36, -r * 0.84, r * 0.12)), (r * 0.15, r * 0.07, r * 0.18), mat('#F8F8F2', rough=0.3), 'eyewhite')
            self.ball(hj, c + Vector((sx * r * 0.36, -r * 0.9, r * 0.1)), (r * 0.09, r * 0.05, r * 0.11), mat(eyes, rough=0.2), 'pupil')
            if brows:
                self.box(hj, c + Vector((sx * r * 0.38, -r * 0.88, r * 0.34)), (r * 0.34, r * 0.06, r * 0.08), mat(brows), 'brow',
                         rot=(0, sx * math.radians(6), 0), bevel=0.005)
        self.ball(hj, c + Vector((0, -r * 0.82, -r * 0.5)), (r * 0.3, r * 0.06, r * 0.07), mat(mouth, rough=0.4), 'mouth')
        if moustache:
            self.ball(hj, c + Vector((0, -r * 0.9, -r * 0.36)), (r * 0.34, r * 0.08, r * 0.09), mat(moustache, rough=0.9), 'stache')
        if beard:
            self.ball(hj, c + Vector((0, -r * 0.3, -r * 0.62)), (r * 0.7, r * 0.62, r * 0.48), mat(beard, rough=0.9), 'beard')
        if hair_style != 'bald':
            self._hair(hj, c, r, hair, hair_style)

    def _hair(self, parent, c, r, color, style):
        """Hair is a shell around the skull with the face (and sometimes the top) cut away."""
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=20, radius=1.0)
        long = style in ('long', 'bob')
        def keep(v):
            x, y, z = v.co
            face = y < -0.25 and z < 0.55 and abs(x) < 0.85
            if style == 'receding':
                face = y < -0.12 and z < 0.6 and abs(x) < 0.9
            if style == 'afro':
                face = y < -0.35 and z < 0.35 and abs(x) < 0.75
            low = -0.15 if style in ('short', 'receding', 'buzz') else -0.25
            if long:
                low = -1.0 if style == 'long' else -0.6
            return not face and (z > low or (long and y > -0.2))
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not keep(v)], context='VERTS')
        me = bpy.data.meshes.new('hair')
        bm.to_mesh(me)
        obj = bpy.data.objects.new('hair', me)
        self.scene.collection.objects.link(obj)
        sc = {'short': (1.06, 1.07, 1.1), 'receding': (1.05, 1.06, 1.08), 'buzz': (1.02, 1.03, 1.05),
              'long': (1.12, 1.12, 1.16), 'bob': (1.12, 1.12, 1.14), 'afro': (1.45, 1.4, 1.38)}[style]
        obj.scale = (r * sc[0] * 0.92, r * sc[1] * 0.95, r * sc[2] * 1.08)
        obj.location = c + (Vector((0, 0.02, 0.05)) if style == 'afro' else Vector((0, 0.01, 0.01)))
        if long:
            obj.scale.z *= 1.5 if style == 'long' else 1.15
            obj.location.z -= r * (0.45 if style == 'long' else 0.12)
        sol = obj.modifiers.new('thick', 'SOLIDIFY')
        sol.thickness = 0.15
        self._link(obj, parent, mat(color, rough=0.75))

    def torso(self, top, top2=None, waist=1.0, belly=1.0, length=1.0):
        """Jacket or shirt body from the pelvis up to the shoulders."""
        h, b = self.h, self.b
        m = mat(top, rough=0.65)
        self.top = m
        self.capsule(self.chest, 0.21 * b, 0.19 * b * waist * belly, 0.40 * h * length, m, 'torso',
                     offset=(0, 0, 0.18 * h), sy=0.72)
        self.box(self.chest, (0, 0, 0.17 * h), (0.42 * b, 0.22 * b, 0.1 * h), m, 'shoulders', bevel=0.05)
        if belly > 1.05:
            self.ball(self.chest, (0, -0.03 * b, -0.13 * h), (0.19 * b * belly, 0.15 * b * belly, 0.14 * h), m, 'belly')

    def arms(self, sleeve, cuff=None, hands=None):
        h, b = self.h, self.b
        m = mat(sleeve, rough=0.65)
        hm = mat(hands, rough=0.5) if hands else self.skin
        for s in 'LR':
            self.capsule(self.j['shoulder' + s], 0.078 * b, 0.07 * b, 0.24 * h, m, 'upper' + s)
            self.capsule(self.j['elbow' + s], 0.07 * b, 0.064 * b, 0.19 * h, m, 'fore' + s)
            if cuff:
                self.capsule(self.j['wrist' + s], 0.05 * b, 0.05 * b, 0.02, mat(cuff), 'cuff' + s, offset=(0, 0, 0.03))
            self.ball(self.j['wrist' + s], (0, 0, -0.04), (0.06, 0.045, 0.075), hm, 'hand' + s)

    def legs(self, pants, shoes='#1A1A1A', flare=1.0, skirt=None):
        h, b = self.h, self.b
        m = mat(pants, rough=0.65)
        sm = mat(shoes, rough=0.35)
        for s in 'LR':
            self.capsule(self.j['hip' + s], 0.105 * b, 0.085 * b, 0.34 * h, m, 'thigh' + s)
            self.capsule(self.j['knee' + s], 0.08 * b, 0.07 * b * flare, 0.31 * h, m, 'shin' + s)
            self.box(self.j['ankle' + s], (0, -0.05, -0.01), (0.11, 0.24, 0.08), sm, 'shoe' + s, bevel=0.03)
        self.capsule(self.pelvis, 0.19 * b, 0.18 * b, 0.12 * h, m, 'hips', offset=(0, 0, 0.08), sy=0.72)

    def skirt(self, color, length=0.5, flare=1.6):
        h, b = self.h, self.b
        self.capsule(self.pelvis, 0.21 * b, 0.2 * b * flare, length * h, mat(color, rough=0.6), 'skirt',
                     offset=(0, 0, 0.1), sy=0.8)

    def suit_front(self, shirt, lapels=None, chain=None, tie=None, tie_len=0.0):
        """Open collar V, lapels and an optional gold chain or tie on the chest."""
        h, b = self.h, self.b
        y = -0.172 * b
        z0, z1 = -0.12 * h, 0.27 * h
        self._wedge(self.chest, [(-0.11 * b, z1, y), (0.11 * b, z1, y), (0, z0, y)], mat(shirt, rough=0.6), 'shirtV')
        if lapels:
            lm = mat(lapels, rough=0.55)
            for sx in (1, -1):
                self._wedge(self.chest, [(sx * 0.1 * b, z1, y - 0.004), (sx * 0.2 * b, z1 - 0.05, y - 0.004),
                                          (sx * 0.01 * b, z0 - 0.02, y - 0.004)], lm, 'lapel')
        if chain:
            bpy.ops.mesh.primitive_torus_add(major_radius=0.06 * b, minor_radius=0.008, location=(0, 0, 0))
            t = bpy.context.active_object
            t.rotation_euler = (math.radians(70), 0, 0)
            self._link(t, self.chest, mat(chain, rough=0.2, metal=1.0))
            t.location = (0, y + 0.035, z1 - 0.06)
        if tie:
            tw = 0.025 + max(0.0, tie_len) * 0.12
            self._wedge(self.chest, [(-tw, z1 - 0.01, y - 0.02), (tw, z1 - 0.01, y - 0.02), (0, z0 - 0.08 - tie_len, y - 0.02)],
                        mat(tie, rough=0.5), 'tie')

    def _wedge(self, parent, pts, m, name):
        """A flat triangle (x, z, y) on the front of the body, facing the front."""
        bm = bmesh.new()
        vs = [bm.verts.new((x, y, z)) for x, z, y in pts]
        f = bm.faces.new(vs)
        if f.normal.y > 0:
            f.normal_flip()
        me = bpy.data.meshes.new(name)
        bm.to_mesh(me)
        obj = bpy.data.objects.new(name, me)
        self.scene.collection.objects.link(obj)
        obj.parent = parent
        obj.data.materials.append(m)
        return obj

    def glasses(self, frame='#151515', lens='#88AACC', shades=False):
        r = self.head_r
        c = Vector((0, 0, r * 0.95))
        fm = mat(frame, rough=0.3)
        lm = mat('#101010' if shades and lens == '#88AACC' else lens, rough=0.1, metal=0.3 if shades else 0)
        for sx in (1, -1):
            self.ball(self.headj, c + Vector((sx * r * 0.36, -r * 0.96, r * 0.1)), (r * 0.2, r * 0.03, r * 0.16), lm, 'lens')
        self.box(self.headj, c + Vector((0, -r * 0.98, r * 0.18)), (r * 1.2, r * 0.04, r * 0.05), fm, 'bridge', bevel=0)

    def hat(self, color, style='cap'):
        r = self.head_r
        c = Vector((0, 0, r * 0.95))
        m = mat(color, rough=0.6)
        if style == 'cap':
            self.ball(self.headj, c + Vector((0, 0.01, r * 0.42)), (r * 1.02, r * 1.04, r * 0.75), m, 'crown')
            self.box(self.headj, c + Vector((0, -r * 1.0, r * 0.32)), (r * 1.2, r * 0.8, r * 0.06), m, 'brim', bevel=0.01)
        elif style == 'coonskin':
            self.ball(self.headj, c + Vector((0, 0.02, r * 0.5)), (r * 1.05, r * 1.08, r * 0.75), m, 'crown')
            self.capsule(self.headj, r * 0.22, r * 0.12, r * 2.4, m, 'tail', offset=(0, r * 0.95, r * 0.6))
        elif style == 'captain':
            self.ball(self.headj, c + Vector((0, 0, r * 0.62)), (r * 1.1, r * 1.1, r * 0.45), m, 'crown')
            self.box(self.headj, c + Vector((0, -r * 0.95, r * 0.4)), (r * 1.1, r * 0.5, r * 0.05), mat('#151515'), 'brim', bevel=0.01)

    # --- posing ------------------------------------------------------------
    def pose(self, facing, frame):
        """frame 0 is standing; 1..4 is the walk cycle (contact, pass, contact, pass)."""
        self.root.rotation_euler = (0, 0, math.radians(FACINGS[facing]))
        j = self.j
        for k in j:
            if k not in ('root',):
                j[k].rotation_euler = (0, 0, 0)
        self.pelvis.location.z = self.leg
        if frame == 0:
            for s, sx in (('L', 1), ('R', -1)):
                j['shoulder' + s].rotation_euler = (0, sx * math.radians(-6), 0)
                j['elbow' + s].rotation_euler = (math.radians(-8), 0, 0)
            return
        swing = {1: 1, 2: 0, 3: -1, 4: 0}[frame]
        passing = frame in (2, 4)
        a = math.radians(20) * swing
        # forward is -y; a positive x rotation swings a hanging limb toward -y? It swings to +y, so negate
        j['hipL'].rotation_euler.x = -a
        j['hipR'].rotation_euler.x = a
        back = 'R' if swing > 0 else 'L'
        j['knee' + back].rotation_euler.x = math.radians(18)
        if passing:
            lead = 'L' if frame == 2 else 'R'
            j['hip' + lead].rotation_euler.x = -math.radians(8)
            j['knee' + lead].rotation_euler.x = math.radians(8)
            other = 'R' if lead == 'L' else 'L'
            j['hip' + other].rotation_euler.x = -math.radians(16)
            j['knee' + other].rotation_euler.x = math.radians(50)
            self.pelvis.location.z = self.leg * 1.01
        else:
            self.pelvis.location.z = self.leg * 0.975
        j['shoulderL'].rotation_euler = (a * 0.8, math.radians(-6), 0)
        j['shoulderR'].rotation_euler = (-a * 0.8, math.radians(6), 0)
        for s in 'LR':
            j['elbow' + s].rotation_euler.x = -math.radians(20)
        self.chest.rotation_euler.z = math.radians(6) * swing

    # --- render ------------------------------------------------------------
    def _setup(self):
        sc = self.scene
        sc.render.engine = 'CYCLES'
        sc.cycles.device = 'CPU'
        sc.cycles.samples = 24
        sc.cycles.use_denoising = True
        sc.render.film_transparent = True
        sc.view_settings.view_transform = 'Standard'
        sc.render.resolution_x = CELL_W * SS
        sc.render.resolution_y = CELL_H * SS
        sc.render.image_settings.file_format = 'PNG'
        sc.render.image_settings.color_mode = 'RGBA'
        cam = bpy.data.cameras.new('cam')
        cam.type = 'ORTHO'
        cam.ortho_scale = CELL_H * M_PER_PX
        ob = bpy.data.objects.new('cam', cam)
        sc.collection.objects.link(ob)
        sc.camera = ob
        # aim through a point above the feet so the floor lands on FEET_ROW
        below = (FEET_ROW - CELL_H / 2) * M_PER_PX
        target = Vector((0, 0, below / math.cos(TILT)))
        fwd = Vector((0, math.cos(TILT), -math.sin(TILT)))
        ob.location = target - fwd * 20
        ob.rotation_euler = Euler((math.pi / 2 - TILT, 0, 0))
        world = bpy.data.worlds.new('w')
        world.use_nodes = True
        world.node_tree.nodes['Background'].inputs['Color'].default_value = (*lin('#8890A0'), 1)
        world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55
        sc.world = world
        key = bpy.data.lights.new('key', 'SUN')
        key.energy = 4.5
        key.color = lin('#FFF0DC')
        key.angle = math.radians(25)
        k = bpy.data.objects.new('key', key)
        sc.collection.objects.link(k)
        k.rotation_euler = Euler((math.radians(50), 0, math.radians(-30)))

    def render(self, out_dir):
        from PIL import Image
        os.makedirs(out_dir, exist_ok=True)
        self._setup()
        sheet = Image.new('RGBA', (CELL_W * 5, CELL_H * 3))
        raw_sheet = Image.new('RGBA', (CELL_W * SS * 5, CELL_H * SS * 3))
        tmp = os.path.join(out_dir, f'_{self.name}.png')
        for row, facing in enumerate(('down', 'up', 'right')):
            for col in range(5):
                self.pose(facing, col)
                self.scene.render.filepath = tmp
                bpy.ops.render.render(write_still=True)
                raw = Image.open(tmp).convert('RGBA')
                raw_sheet.paste(raw, (col * CELL_W * SS, row * CELL_H * SS))
                sheet.paste(shrink(raw), (col * CELL_W, row * CELL_H))
        os.remove(tmp)
        raw_sheet.save(os.path.join(out_dir, f'{self.name}-raw.png'))
        finish(sheet).save(os.path.join(out_dir, f'{self.name}.png'), optimize=True)
        print('rendered', self.name)


def shrink(raw):
    """8x render to game pixels: average colour over the covered area, then a hard alpha edge."""
    import numpy as np
    from PIL import Image
    a = np.asarray(raw, dtype=np.float32) / 255
    h, w = a.shape[0] // SS, a.shape[1] // SS
    a = a.reshape(h, SS, w, SS, 4)
    alpha = a[..., 3].mean(axis=(1, 3))
    rgb = (a[..., :3] * a[..., 3:]).sum(axis=(1, 3)) / np.maximum(a[..., 3].sum(axis=(1, 3)), 1e-6)[..., None]
    out = np.dstack([rgb, (alpha > 0.4).astype(np.float32)])
    return Image.fromarray((out * 255).clip(0, 255).astype(np.uint8), 'RGBA')


def finish(sheet):
    """Painted-sprite look: punchier colour, a small palette with no dither, and a soft dark rim."""
    import numpy as np
    from PIL import Image, ImageEnhance
    alpha = sheet.getchannel('A')
    rgb = sheet.convert('RGB')
    rgb = ImageEnhance.Contrast(rgb).enhance(1.15)
    rgb = ImageEnhance.Color(rgb).enhance(1.3)
    q = rgb.quantize(colors=40, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    a = np.asarray(q).astype(np.float32)
    m = np.asarray(alpha) > 0
    # Darken the outermost ring of each sprite so it reads against busy backgrounds.
    inner = m.copy()
    inner[1:, :] &= m[:-1, :]
    inner[:-1, :] &= m[1:, :]
    inner[:, 1:] &= m[:, :-1]
    inner[:, :-1] &= m[:, 1:]
    edge = m & ~inner
    a[edge] *= 0.45
    out = np.dstack([a, m * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def out_dir():
    return sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else os.path.join(os.path.dirname(__file__), '..', 'out', 'chars')
