"""Room kit: build a game room in Blender using the game's own pixel coordinates.

Every room in the game is 320x200 and its hotspots, walk areas and characters
are in those pixels. The kit sets up a level perspective camera with lens
shift (an architect's shot, like a Sierra painting) and works out where a
pixel lands at a given depth, so room scripts can say "a sign at x 112..212,
y 13..55 on the back wall" and it lines up with the hotspot in the code.

    room = Room('ch3-skyline', floor_y=150)
    room.wall(mat('#CCBBAA'))
    room.panel(112, 13, 100, 42, room.D, mat('#000044'))
    room.render(sys.argv[-1])

Depth `d` is metres from the camera. room.D is the back wall; room.floor_d(py)
is the depth where the floor shows at screen row py, which is where to stand
things that sit on the floor at that row.
"""

import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(__file__))
from paint import paint_rgb, sharp, vga  # noqa: E402

FONT_DIR = '/usr/share/fonts/opentype/inter'


def _font(name):
    p = os.path.join(FONT_DIR, name)
    return bpy.data.fonts.load(p) if os.path.exists(p) else None


def lin(hexstr):
    """'#RRGGBB' in sRGB to a linear RGB tuple for Blender."""
    h = hexstr.lstrip('#')
    out = []
    for i in (0, 2, 4):
        v = int(h[i:i + 2], 16) / 255
        out.append(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4)
    return tuple(out)


_mats = {}


def _principled(m):
    return m.node_tree.nodes['Principled BSDF']


def mat(color, emit=0.0, rough=0.6, metal=0.0, name=None):
    key = (color, emit, rough, metal, name)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(name or f'm{len(_mats)}')
    m.use_nodes = True
    p = _principled(m)
    rgb = lin(color)
    p.inputs['Base Color'].default_value = (*rgb, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    if emit:
        p.inputs['Emission Color'].default_value = (*rgb, 1)
        p.inputs['Emission Strength'].default_value = emit
    _mats[key] = m
    return m


def glow(color, strength=1.5):
    return mat(color, emit=strength)


def _tex_mat(color, rough=0.6):
    m = bpy.data.materials.new(f't{len(bpy.data.materials)}')
    m.use_nodes = True
    _principled(m).inputs['Roughness'].default_value = rough
    return m, m.node_tree


def _coords(nt, scale, floor=False):
    """Object coordinates in metres. Walls face the camera, so their texture
    runs along x and z; floors run along x and y."""
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = scale
    if not floor:
        mp.inputs['Rotation'].default_value = (math.radians(-90), 0, 0)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    return mp.outputs['Vector']


def brick(color, mortar, scale=4.0, mortar_size=0.02, rough=0.8, row=0.25, width=0.5, vary='#000000', floor=False):
    """Brick or tile. Scale is bricks per metre-ish; vary is a second brick tone."""
    m, nt = _tex_mat(color, rough)
    b = nt.nodes.new('ShaderNodeTexBrick')
    b.inputs['Color1'].default_value = (*lin(color), 1)
    b.inputs['Color2'].default_value = (*lin(vary if vary != '#000000' else color), 1)
    b.inputs['Mortar'].default_value = (*lin(mortar), 1)
    b.inputs['Scale'].default_value = scale
    b.inputs['Mortar Size'].default_value = mortar_size
    b.inputs['Row Height'].default_value = row
    b.inputs['Brick Width'].default_value = width
    nt.links.new(_coords(nt, (1, 1, 1), floor), b.inputs['Vector'])
    nt.links.new(b.outputs['Color'], _principled(m).inputs['Base Color'])
    return m


def tiles(color, grout, scale=2.0, rough=0.3, floor=True, grout_size=0.03):
    """Square floor (or wall) tiles."""
    return brick(color, grout, scale, grout_size, rough, row=0.5, width=0.5, floor=floor)


def checker(a, b, scale=2.0, rough=0.3):
    m, nt = _tex_mat(a, rough)
    c = nt.nodes.new('ShaderNodeTexChecker')
    c.inputs['Color1'].default_value = (*lin(a), 1)
    c.inputs['Color2'].default_value = (*lin(b), 1)
    c.inputs['Scale'].default_value = scale
    nt.links.new(_coords(nt, (1, 1, 1), True), c.inputs['Vector'])
    nt.links.new(c.outputs['Color'], _principled(m).inputs['Base Color'])
    return m


def mottled(a, b, scale=3.0, rough=0.7, detail=4.0, emit=0.0, floor=False):
    """Two tones blended by noise: grass, plaster, carpet, asphalt, painted sky."""
    m, nt = _tex_mat(a, rough)
    n = nt.nodes.new('ShaderNodeTexNoise')
    n.inputs['Scale'].default_value = scale
    n.inputs['Detail'].default_value = detail
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*lin(a), 1)
    ramp.color_ramp.elements[1].color = (*lin(b), 1)
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[1].position = 0.65
    nt.links.new(_coords(nt, (1, 1, 1), floor), n.inputs['Vector'])
    nt.links.new(n.outputs['Fac'], ramp.inputs['Fac'])
    p = _principled(m)
    nt.links.new(ramp.outputs['Color'], p.inputs['Base Color'])
    if emit:
        nt.links.new(ramp.outputs['Color'], p.inputs['Emission Color'])
        p.inputs['Emission Strength'].default_value = emit
    return m


def planks(color, line, scale=6.0, rough=0.5, axis='h', floor=False):
    """Wood planks or stripes with a darker seam: axis 'h' for horizontal
    boards, 'v' for vertical ones (on walls and floors alike)."""
    m, nt = _tex_mat(color, rough)
    w = nt.nodes.new('ShaderNodeTexWave')
    w.wave_type = 'BANDS'
    w.bands_direction = 'Y' if axis == 'h' else 'X'
    w.inputs['Scale'].default_value = scale
    w.inputs['Distortion'].default_value = 0.6
    w.inputs['Detail'].default_value = 2.0
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*lin(line), 1)
    ramp.color_ramp.elements[1].color = (*lin(color), 1)
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[1].position = 0.25
    nt.links.new(_coords(nt, (1, 1, 1), floor), w.inputs['Vector'])
    nt.links.new(w.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], _principled(m).inputs['Base Color'])
    return m


def gradient(top, bottom, emit=1.0):
    """Vertical gradient, pure emission (no shading or shadows): painted skies."""
    m = bpy.data.materials.new(f'g{len(bpy.data.materials)}')
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (*lin(bottom), 1)
    ramp.color_ramp.elements[1].color = (*lin(top), 1)
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Strength'].default_value = emit
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(tc.outputs['Generated'], sep.inputs['Vector'])
    nt.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], e.inputs['Color'])
    nt.links.new(e.outputs['Emission'], out.inputs['Surface'])
    return m


SCRIPT = None
BOLD = None
REGULAR = None


class Room:
    def __init__(self, name, floor_y=150, depth=10.0, shift=-0.2, lens=30.0, samples=64):
        global SCRIPT, BOLD, REGULAR
        bpy.ops.wm.read_factory_settings(use_empty=True)
        _mats.clear()
        SCRIPT = _font('Inter-ExtraBoldItalic.otf')
        BOLD = _font('Inter-ExtraBold.otf')
        REGULAR = _font('Inter-SemiBold.otf')
        self.name = name
        self.scene = bpy.context.scene
        self.D = depth
        self.s = shift
        self.k = 36.0 / lens
        # Camera height so the back wall meets the floor at floor_y.
        self.H = (floor_y - 100 - 320 * shift) * self.k * depth / 320
        self.fg = []
        self.crisp = []
        self.samples = samples
        bpy.ops.object.camera_add(location=(0, 0, self.H), rotation=(math.radians(90), 0, 0))
        cam = bpy.context.object
        cam.data.lens = lens
        cam.data.sensor_width = 36
        cam.data.sensor_fit = 'HORIZONTAL'
        cam.data.shift_y = shift
        cam.data.clip_end = 500
        self.scene.camera = cam
        world = bpy.data.worlds.new('world')
        self.scene.world = world
        world.use_nodes = True
        self.world_bg = world.node_tree.nodes['Background']
        self.ambient('#D8D4CC', 0.3)

    # ---- pixel <-> world -------------------------------------------------

    def W(self, d):
        """Width in metres of the 320px frame at depth d."""
        return d * self.k

    def m(self, d):
        """Metres per pixel at depth d."""
        return self.W(d) / 320

    def P(self, px, py, d):
        """World position of screen pixel (px, py) at depth d."""
        W = self.W(d)
        return Vector(((px - 160) * W / 320, d, self.H + self.s * W - (py - 100) * W / 320))

    def floor_d(self, py):
        """Depth where the floor (z=0) shows at screen row py."""
        return self.H / (self.k * ((py - 100) / 320 - self.s))

    # ---- primitives --------------------------------------------------------

    def _obj(self, name, mt, fg):
        o = bpy.context.object
        o.name = name
        if mt is not None:
            o.data.materials.append(mt)
        if fg:
            self.fg.append(o)
        if o.type == 'MESH':
            # Bake scale in so textures are in metres, not stretched per object.
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
            if len(o.data.polygons) > 6:
                bpy.ops.object.shade_smooth()
        return o

    def box(self, center, size, mt, name='box', fg=False, rot=(0, 0, 0)):
        bpy.ops.mesh.primitive_cube_add(location=center, rotation=rot)
        o = bpy.context.object
        o.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
        return self._obj(name, mt, fg)

    def panel(self, x, y, w, h, d, mt, thick=2, name='panel', fg=False):
        """A flat slab on the plane at depth d covering pixels x..x+w, y..y+h.
        The face is at d; thickness (in pixels at d) goes away from the camera."""
        m = self.m(d)
        c = self.P(x + w / 2, y + h / 2, d)
        c.y += thick * m / 2
        return self.box(c, (w * m, thick * m, h * m), mt, name, fg)

    def wall(self, mt, name='backwall'):
        """Back wall covering the whole frame at depth D."""
        return self.panel(-40, -40, 400, 280, self.D, mt, thick=4, name=name)

    def floor(self, mt, far=None, name='floor'):
        """Floor plane from just behind the camera out to the back wall (or far)."""
        far = far or self.D
        W = self.W(far) * 1.6
        self.box((0, far / 2, -0.05), (W, far + 2, 0.1), mt, name)

    def block(self, x, w, top, front, deep, mt, name='block', fg=False, lift=0.0):
        """A box standing on the floor. Its front face meets the floor at screen row
        `front` (pixels), spans x..x+w and rises to screen row `top` at the front.
        `deep` is how far back it goes, in pixels at the front face. `lift` raises
        it off the floor in pixels (tables, shelves)."""
        d = self.floor_d(front)
        m = self.m(d)
        hgt = (front - top - lift) * m
        c = self.P(x + w / 2, front, d)
        c.z = lift * m + hgt / 2
        c.y += deep * m / 2
        return self.box(c, (w * m, deep * m, hgt), mt, name, fg)

    def slab(self, front, back, mt, x0=-200, x1=520, height=0.3, name='slab', fg=False):
        """A flat region of floor between screen rows `back` and `front`
        (sidewalks, roads, rugs, courts). Height is in pixels at the front."""
        d0, d1 = self.floor_d(front), self.floor_d(back)
        m = self.m(d0)
        a, b = self.P(x0, front, d0), self.P(x1, front, d0)
        return self.box(((a.x + b.x) / 2, (d0 + d1) / 2, height * m / 2), (b.x - a.x, d1 - d0, height * m), mt, name, fg)

    def cyl(self, center, r, depth, mt, name='cyl', fg=False, rot=(0, 0, 0), scale=(1, 1, 1), verts=32):
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=center, rotation=rot)
        o = bpy.context.object
        o.scale = scale
        return self._obj(name, mt, fg)

    def oval(self, cx, cy, rx, ry, d, mt, thick=2, name='oval', fg=False):
        """An oval disc facing the camera on plane d (signs, mirrors, portholes)."""
        m = self.m(d)
        c = self.P(cx, cy, d)
        c.y += thick * m / 2
        return self.cyl(c, 1, thick * m, mt, name, fg, rot=(math.radians(90), 0, 0), scale=(rx * m, ry * m, 1), verts=64)

    def post(self, cx, front, r, top, mt, name='post', fg=False, verts=24):
        """A vertical cylinder standing on the floor at row `front` up to row `top`."""
        d = self.floor_d(front)
        m = self.m(d)
        h = (front - top) * m
        c = self.P(cx, front, d)
        c.z = h / 2
        c.y += r * m
        return self.cyl(c, r * m, h, mt, name, fg, verts=verts)

    def disc(self, cx, row, rx, top, thick, mt, name='disc', fg=False):
        """A horizontal round slab (table top, pool, rug) centred at floor row `row`,
        rx pixels wide each way, its top surface at screen row `top`."""
        d = self.floor_d(row)
        m = self.m(d)
        c = self.P(cx, row, d)
        c.z = (row - top) * m - thick * m / 2
        return self.cyl(c, 1, thick * m, mt, name, fg, scale=(rx * m, rx * m, 1), verts=48)

    def ball(self, cx, cy, d, r, mt, name='ball', fg=False, squash=(1, 1, 1)):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r * self.m(d), location=self.P(cx, cy, d), segments=24, ring_count=12)
        o = bpy.context.object
        o.scale = squash
        return self._obj(name, mt, fg)

    def text(self, s, cx, cy, size, d, mt, font=None, align='CENTER', shear=0.0, name='text', fg=False, extrude=0.5, crisp=True):
        """Text centred at pixel (cx, cy) on plane d, `size` pixels tall (caps).
        Sits slightly in front of the plane so it reads on top of a panel.
        Crisp text skips the paint filter so it stays readable."""
        m = self.m(d)
        loc = self.P(cx, cy, d)
        loc.y -= extrude * m * 1.2
        bpy.ops.object.text_add(location=loc, rotation=(math.radians(90), 0, 0))
        o = bpy.context.object
        o.data.body = s
        o.data.size = size * m / 0.72
        o.data.align_x = align
        o.data.align_y = 'CENTER'
        o.data.extrude = extrude * m
        o.data.shear = shear
        o.data.font = font or BOLD or o.data.font
        if crisp:
            self.crisp.append(o)
        return self._obj(name, mt, fg)

    def poly(self, pts, d, mt, thick=2, name='poly', fg=False):
        """A flat polygon from pixel points on plane d (roofs, mountains, sails)."""
        m = self.m(d)
        verts = []
        for px, py in pts:
            v = self.P(px, py, d)
            verts.append((v.x, v.y, v.z))
        for px, py in pts:
            v = self.P(px, py, d)
            verts.append((v.x, v.y + thick * m, v.z))
        n = len(pts)
        faces = [list(range(n)), list(range(2 * n - 1, n - 1, -1))]
        for i in range(n):
            j = (i + 1) % n
            faces.append([i, j, n + j, n + i])
        me = bpy.data.meshes.new(name)
        me.from_pydata(verts, [], faces)
        me.update()
        o = bpy.data.objects.new(name, me)
        bpy.context.collection.objects.link(o)
        bpy.context.view_layer.objects.active = o
        o.data.materials.append(mt)
        if fg:
            self.fg.append(o)
        return o

    def tree(self, cx, front, top, trunk='#664422', leaves='#2E7D32', leaves2='#66BB33', r=None, fg=False):
        """A round painted-looking tree standing at floor row `front` reaching row `top`."""
        d = self.floor_d(front)
        m = self.m(d)
        h = front - top
        r = r or h * 0.32
        self.post(cx, front, max(1.5, h * 0.04), top + r * 1.2, mat(trunk, rough=0.9), 'trunk', fg)
        lm = mottled(leaves, leaves2, scale=4)
        base = self.P(cx, top + r, d)
        base.y += r * m
        for i, (ox, oy, rr) in enumerate([(0, 0, 1.0), (-0.55, 0.3, 0.7), (0.55, 0.3, 0.7), (0, -0.45, 0.65)]):
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=r * rr * m,
                                                  location=(base.x + ox * r * m, base.y, base.z - oy * r * m))
            self._obj(f'leaves{i}', lm, fg)

    def palm(self, cx, front, top, fg=False):
        """A palm tree: a leaning trunk and a fan of fronds."""
        d = self.floor_d(front)
        m = self.m(d)
        h = (front - top) * m
        trunk = mat('#8D6E4A', rough=0.9)
        frond = mottled('#1B6B2A', '#4CAF50', scale=6)
        base = self.P(cx, front, d)
        lean = 0.12
        self.cyl((base.x + lean * h / 2, base.y + 0.3, h * 0.45), 0.09 * h / 4, h * 0.92, trunk, 'palm', fg,
                 rot=(0, lean, 0), verts=12)
        crown = Vector((base.x + lean * h, base.y + 0.3, h * 0.9))
        for i in range(9):
            a = i / 9 * math.tau
            bpy.ops.mesh.primitive_cube_add(location=crown)
            o = bpy.context.object
            o.scale = (h * 0.22, h * 0.035, h * 0.01)
            o.rotation_euler = (0, 0.35 + 0.25 * math.sin(a * 2), a)
            o.location = crown + Vector((math.cos(a) * h * 0.18, math.sin(a) * h * 0.18, -0.04 * h))
            self._obj(f'frond{i}', frond, fg)

    def car(self, x, w, top, front, body, glass='#9AD8F0', cabin=None, deep=None, name='car', fg=False):
        """A side-on car whose wheels touch the floor at row `front`, spanning
        x..x+w and with its roof at row `top`. Cabin is the upper 45%."""
        h = front - top
        deep = deep or w * 0.4
        bm = mat(body, rough=0.25, metal=0.4) if isinstance(body, str) else body
        r = h * 0.16
        self.block(x, w, top + h * 0.42, front, deep, bm, name, fg, lift=r * 0.9)
        cx0 = x + w * (cabin[0] if cabin else 0.22)
        cw = w * (cabin[1] if cabin else 0.52)
        self.block(cx0, cw, top, front, deep * 0.9, bm, name + '_cab', fg, lift=h * 0.5)
        self.block(cx0 + 2, cw - 4, top + 2, front + 0.3, deep * 0.92, mat(glass, rough=0.05, metal=0.5), name + '_glass', fg, lift=h * 0.55)
        d = self.floor_d(front)
        m = self.m(d)
        tyre = mat('#141414', rough=0.8)
        for wx in (x + w * 0.18, x + w * 0.82):
            c = self.P(wx, front, d)
            c.z = r * m
            c.y -= 0.05
            self.cyl(c, r * m, 0.3, tyre, name + '_wheel', fg, rot=(math.radians(90), 0, 0), verts=24)

    def theme_building(self, cx, base, top, span, d, mt=None, saucer=None):
        """LAX's Theme Building: two crossed parabolic arches under a flying
        saucer, at depth d. cx/base/top/span are pixels."""
        mt = mt or mat('#F4F4F0', rough=0.4)
        saucer = saucer or mt
        h = base - top
        for side in (-1, 1):
            for lean in (0.0, 0.5):
                pts_out, pts_in = [], []
                for i in range(13):
                    u = i / 12
                    x = cx + side * (span / 2) * (1 - u) * (1 - lean * 0.3)
                    y = base - h * (1 - (1 - u) ** 2)
                    w = span * 0.035 * (1.4 - u * 0.6)
                    pts_out.append((x + side * w, y))
                    pts_in.append((x - side * w, y))
                self.poly(pts_out + pts_in[::-1], d + lean * 0.5, mt, thick=1, name='arch')
        self.oval(cx, top + h * 0.06, span * 0.36, h * 0.07, d - 0.3, saucer, thick=6, name='saucer')
        self.oval(cx, top, span * 0.1, h * 0.05, d - 0.2, saucer, thick=4, name='dome')

    def sky(self, top, bottom, d=80.0, strength=1.0):
        """A painted sky: an emissive gradient covering the whole frame far away."""
        return self.panel(-60, -60, 440, 320, d, gradient(top, bottom, strength), thick=1, name='sky')

    def cloud(self, x, y, w, d=85.0):
        """A soft painted cloud: two overlapping ovals that cast no shadow."""
        for i, (ox, oy, sc) in enumerate([(0, 0, 0.5), (w * 0.22, -3, 0.33), (-w * 0.2, -1, 0.28)]):
            o = self.oval(x + ox, y + oy, w * sc, 5, d - i * 0.05, glow('#FFFFFF', 0.95), thick=1, name='cloud')
            o.visible_shadow = False

    def stars(self, n, y0, y1, d=70.0, seed=3, color='#FFFFFF'):
        import random
        rnd = random.Random(seed)
        m = glow(color, 4)
        for i in range(n):
            self.panel(rnd.uniform(0, 320), rnd.uniform(y0, y1), 1, 1, d - 1, m, thick=0.5, name=f'star{i}')

    # ---- light ---------------------------------------------------------------

    def ambient(self, color, strength):
        self.world_bg.inputs['Color'].default_value = (*lin(color), 1)
        self.world_bg.inputs['Strength'].default_value = strength

    def sun(self, color='#FFF4E0', energy=3.0, angle=(50, 0, 20)):
        bpy.ops.object.light_add(type='SUN')
        o = bpy.context.object
        o.data.energy = energy
        o.data.color = lin(color)
        o.data.angle = math.radians(8)
        o.rotation_euler = tuple(math.radians(a) for a in angle)
        return o

    def key(self, energy=600, color='#FFF2DD', size=None, at=None):
        """A big soft area light from behind and above the camera: the painter's light."""
        bpy.ops.object.light_add(type='AREA', location=at or (0, -3, self.H + 4))
        o = bpy.context.object
        o.data.energy = energy
        o.data.size = size or self.W(self.D)
        o.data.color = lin(color)
        o.rotation_euler = (math.radians(55), 0, 0)
        return o

    def lamp(self, px, py, d, color='#FFE0A0', energy=60, radius=0.3):
        bpy.ops.object.light_add(type='POINT', location=self.P(px, py, d))
        o = bpy.context.object
        o.data.energy = energy
        o.data.color = lin(color)
        o.data.shadow_soft_size = radius
        return o

    def spot(self, px, py, d, aim, color='#FFFFFF', energy=300, size=40):
        """A spotlight at pixel (px, py, d) pointing at world point `aim`."""
        bpy.ops.object.light_add(type='SPOT', location=self.P(px, py, d))
        o = bpy.context.object
        o.data.energy = energy
        o.data.color = lin(color)
        o.data.spot_size = math.radians(size)
        direction = Vector(aim) - o.location
        o.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
        return o

    # ---- output ----------------------------------------------------------------

    def render(self, out_dir):
        """Render, paint to 320x200 VGA, and write <name>.png plus <name>-fg.png
        (the objects marked fg, cut out, for drawing over characters)."""
        from PIL import Image, ImageFilter
        os.makedirs(out_dir, exist_ok=True)
        sc = self.scene
        sc.view_settings.view_transform = 'Standard'
        sc.view_settings.look = 'None'
        sc.render.engine = 'CYCLES'
        sc.cycles.device = 'CPU'
        sc.cycles.samples = self.samples
        sc.cycles.use_denoising = True
        sc.cycles.max_bounces = 6
        sc.render.resolution_x = 960
        sc.render.resolution_y = 600
        sc.render.image_settings.file_format = 'PNG'
        raw_path = os.path.join(out_dir, f'{self.name}-raw.png')
        sc.render.filepath = raw_path
        bpy.ops.render.render(write_still=True)
        raw = Image.open(raw_path)
        img = paint_rgb(raw)
        fg_mask = None
        if self.fg or self.crisp:
            r, g = self._render_masks(out_dir)
            fg_mask = r if self.fg else None
            if self.crisp:
                img.paste(sharp(raw), (0, 0), g.filter(ImageFilter.MaxFilter(3)))
        # 255 colours, keeping index 255 free to be the fg layer's transparency.
        out = vga(img, 255)
        out.save(os.path.join(out_dir, f'{self.name}.png'), optimize=True)
        if fg_mask is not None:
            fgl = out.copy()
            pal = fgl.getpalette()[:765]
            fgl.putpalette(pal + [0] * (768 - len(pal)))
            fgl.paste(255, (0, 0, 320, 200), fg_mask.point(lambda v: 255 - v))
            fgl.save(os.path.join(out_dir, f'{self.name}-fg.png'), optimize=True, transparency=255)
        print('rendered', self.name)

    def _render_masks(self, out_dir):
        """Flat colour render: red where fg objects show, green where crisp text
        shows. Returns the two masks at 320x200."""
        from PIL import Image
        fg = set(o.name for o in self.fg)
        crisp = set(o.name for o in self.crisp)
        cache = {}

        def flat(rgb):
            if rgb not in cache:
                m = bpy.data.materials.new(f'mask{rgb}')
                m.use_nodes = True
                nt = m.node_tree
                nt.nodes.clear()
                e = nt.nodes.new('ShaderNodeEmission')
                e.inputs['Color'].default_value = (*rgb, 1)
                o = nt.nodes.new('ShaderNodeOutputMaterial')
                nt.links.new(e.outputs['Emission'], o.inputs['Surface'])
                cache[rgb] = m
            return cache[rgb]

        for o in bpy.data.objects:
            if o.type in ('MESH', 'FONT', 'CURVE'):
                mm = flat((1.0 if o.name in fg else 0.0, 1.0 if o.name in crisp else 0.0, 0.0))
                if o.data.materials:
                    for i in range(len(o.data.materials)):
                        o.data.materials[i] = mm
                else:
                    o.data.materials.append(mm)
            elif o.type == 'LIGHT':
                o.hide_render = True
        self.ambient('#000000', 0)
        sc = self.scene
        sc.cycles.samples = 4
        sc.cycles.use_denoising = False
        sc.render.resolution_x = 320
        sc.render.resolution_y = 200
        sc.render.filter_size = 0.01
        mask_path = os.path.join(out_dir, f'{self.name}-mask.png')
        sc.render.filepath = mask_path
        bpy.ops.render.render(write_still=True)
        r, g, _ = Image.open(mask_path).convert('RGB').split()
        cut = lambda v: 255 if v > 127 else 0
        return r.point(cut), g.point(cut)


def out_dir():
    return sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith('.py') else 'art/out'
