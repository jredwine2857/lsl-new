"""Vehicles for the rooms and the traffic sprites, each modelled on the real
thing from the side: a 5th-generation Prius, an LA cab, a Ford Transit
shuttle, a Waymo Jaguar robotaxi, a Lamborghini, a '64 Impala lowrider, a
Cadillac Escalade, a Ford Police Interceptor, a G-Wagon, a Cybertruck, a
1980s Winnebago, a step-van food truck, Cincinnati's Connector streetcar
and an airliner.

Cars are built in metres with their length along +x (front at the right),
the roof up +z and the side that faces the camera at y = 0 (the body goes
back to +y). Each build returns a root empty and the model's size.
"""

import math

import bpy

# Side profile (x, z) clockwise from the rear bumper, side windows, wheel
# radius and axles, body depth, and the extras that make each one itself.
KINDS = {
    'prius': dict(
        body=[(0, 0.36), (0, 0.86), (0.08, 1.0), (0.4, 1.06), (1.55, 1.38), (2.25, 1.42), (3.55, 0.94), (4.42, 0.74),
              (4.6, 0.56), (4.6, 0.36), (4.35, 0.26), (0.25, 0.26)],
        windows=[[(0.75, 1.04), (1.5, 1.32), (1.68, 1.33), (1.68, 1.04)], [(1.78, 1.04), (1.78, 1.35), (2.3, 1.37), (2.3, 1.04)],
                 [(2.4, 1.04), (2.4, 1.36), (2.62, 1.33), (3.3, 1.0)]],
        wheel=0.33, axles=(0.82, 3.6), depth=1.78, head=(4.3, 4.6, 0.66, 0.74), tail=(-0.02, 0.1, 0.9, 0.98),
        hub='alloy'),
    'sedan': dict(
        body=[(0, 0.36), (0, 0.86), (0.14, 0.98), (0.95, 1.02), (1.75, 1.42), (3.0, 1.45), (3.75, 1.0), (4.65, 0.86),
              (4.85, 0.7), (4.85, 0.36), (4.55, 0.26), (0.3, 0.26)],
        windows=[[(1.0, 1.04), (1.78, 1.38), (2.36, 1.39), (2.36, 1.04)], [(2.46, 1.04), (2.46, 1.39), (2.98, 1.39), (3.6, 1.03)]],
        wheel=0.34, axles=(0.88, 3.95), depth=1.84, head=(4.55, 4.85, 0.7, 0.8), tail=(-0.02, 0.1, 0.78, 0.92)),
    'escalade': dict(
        body=[(0, 0.46), (0, 1.86), (0.14, 1.96), (3.85, 1.96), (4.3, 1.32), (5.28, 1.22), (5.4, 1.06), (5.4, 0.46),
              (5.1, 0.36), (0.3, 0.36)],
        windows=[[(0.25, 1.34), (0.25, 1.84), (1.55, 1.85), (1.55, 1.34)], [(1.65, 1.34), (1.65, 1.86), (2.75, 1.86), (2.75, 1.34)],
                 [(2.85, 1.34), (2.85, 1.86), (3.8, 1.86), (4.18, 1.34)]],
        wheel=0.42, axles=(1.0, 4.45), depth=2.06, head=(5.25, 5.42, 1.0, 1.16), tail=(-0.03, 0.08, 0.95, 1.7),
        chrome_windows=True, running_board=True, grille=(5.36, 5.44, 0.62, 1.12), hub='alloy'),
    'explorer': dict(
        body=[(0, 0.44), (0, 1.62), (0.1, 1.76), (0.4, 1.8), (3.5, 1.8), (4.05, 1.18), (4.95, 1.06), (5.05, 0.9),
              (5.05, 0.44), (4.75, 0.34), (0.3, 0.34)],
        windows=[[(0.3, 1.22), (0.45, 1.7), (1.55, 1.72), (1.55, 1.22)], [(1.65, 1.22), (1.65, 1.72), (2.65, 1.72), (2.65, 1.22)],
                 [(2.75, 1.22), (2.75, 1.72), (3.42, 1.72), (3.9, 1.22)]],
        wheel=0.39, axles=(0.95, 4.05), depth=2.0, head=(4.88, 5.06, 0.92, 1.02), tail=(-0.03, 0.08, 1.0, 1.45),
        pushbar=True, hub='steel'),
    'gwagon': dict(
        body=[(0, 0.44), (0, 1.96), (3.35, 1.96), (3.58, 1.28), (4.75, 1.18), (4.82, 0.44), (4.5, 0.34), (0.3, 0.34)],
        windows=[[(0.15, 1.34), (0.15, 1.86), (1.3, 1.86), (1.3, 1.34)], [(1.4, 1.34), (1.4, 1.86), (2.4, 1.86), (2.4, 1.34)],
                 [(2.5, 1.34), (2.5, 1.86), (3.28, 1.86), (3.45, 1.34)]],
        wheel=0.41, axles=(0.85, 3.9), depth=1.95, head=(4.74, 4.84, 0.92, 1.08), tail=(-0.03, 0.06, 0.6, 0.9),
        bevel=0.035, spare=True, flares=True, hub='alloy'),
    'transit': dict(
        body=[(0, 0.46), (0, 2.62), (0.1, 2.72), (4.55, 2.72), (4.85, 2.25), (5.35, 1.38), (5.92, 1.2), (6.0, 0.96),
              (6.0, 0.46), (5.7, 0.36), (0.3, 0.36)],
        windows=[[(0.35, 1.55), (0.35, 2.3), (1.7, 2.3), (1.7, 1.55)], [(1.85, 1.55), (1.85, 2.3), (3.2, 2.3), (3.2, 1.55)],
                 [(3.35, 1.55), (3.35, 2.3), (4.6, 2.3), (4.6, 1.55)], [(4.72, 1.4), (4.72, 2.15), (4.95, 2.15), (5.28, 1.4)]],
        wheel=0.38, axles=(1.15, 4.75), depth=2.06, head=(5.82, 6.0, 1.0, 1.14), tail=(-0.03, 0.06, 0.8, 1.6), hub='steel'),
    'ipace': dict(
        body=[(0, 0.42), (0, 0.98), (0.1, 1.14), (0.45, 1.4), (1.0, 1.52), (2.55, 1.56), (3.45, 1.08), (4.5, 0.88),
              (4.68, 0.68), (4.68, 0.42), (4.4, 0.32), (0.3, 0.32)],
        windows=[[(0.6, 1.12), (1.0, 1.44), (1.85, 1.48), (1.85, 1.12)], [(1.95, 1.12), (1.95, 1.48), (2.5, 1.48), (3.3, 1.12)]],
        wheel=0.37, axles=(0.85, 3.85), depth=2.0, head=(4.45, 4.68, 0.76, 0.84), tail=(-0.02, 0.08, 0.98, 1.06),
        hub='alloy'),
    'lambo': dict(
        body=[(0, 0.3), (0, 0.76), (0.15, 0.86), (1.25, 0.96), (2.0, 1.16), (2.6, 1.16), (3.55, 0.78), (4.42, 0.5),
              (4.5, 0.34), (4.3, 0.2), (0.2, 0.2)],
        windows=[[(1.62, 0.98), (2.1, 1.12), (2.6, 1.12), (3.4, 0.8), (1.75, 0.8)]],
        wheel=0.34, axles=(0.82, 3.62), depth=1.95, head=(4.2, 4.5, 0.5, 0.56), tail=(-0.02, 0.1, 0.6, 0.66),
        intake=[(1.25, 0.5), (1.6, 0.82), (1.75, 0.78), (1.55, 0.5)], bevel=0.04, hub='alloy'),
    'impala': dict(
        body=[(0, 0.32), (0, 0.8), (0.1, 0.88), (1.45, 0.9), (1.95, 1.3), (3.3, 1.32), (3.82, 0.94), (5.25, 0.9),
              (5.35, 0.8), (5.35, 0.32), (5.0, 0.24), (0.3, 0.24)],
        windows=[[(2.02, 0.94), (2.08, 1.26), (2.75, 1.28), (2.75, 0.94)], [(2.82, 0.94), (2.82, 1.28), (3.25, 1.27), (3.62, 0.94)]],
        wheel=0.3, axles=(1.0, 4.15), depth=2.0, head=(5.25, 5.36, 0.66, 0.78), tail=(-0.02, 0.08, 0.62, 0.74),
        spear=True, hub='wire', whitewall=True),
    'cybertruck': dict(
        body=[(0, 0.5), (0, 1.16), (3.0, 1.8), (5.62, 1.06), (5.7, 0.96), (5.7, 0.52), (5.35, 0.42), (0.35, 0.42)],
        windows=[[(2.3, 1.24), (3.0, 1.72), (3.75, 1.56), (4.5, 1.24)]],
        wheel=0.43, axles=(1.0, 4.65), depth=2.03, head=(5.0, 5.72, 1.0, 1.04), tail=(-0.02, 0.05, 1.06, 1.12),
        bevel=0.01, arches='trapezoid', hub='aero'),
    'winnebago': dict(
        body=[(0, 0.5), (0, 3.2), (0.15, 3.3), (7.6, 3.3), (8.2, 3.05), (8.45, 2.3), (8.5, 1.1), (8.5, 0.5), (8.2, 0.36),
              (0.3, 0.36)],
        windows=[[(0.6, 1.9), (0.6, 2.5), (1.8, 2.5), (1.8, 1.9)], [(3.6, 1.9), (3.6, 2.5), (5.2, 2.5), (5.2, 1.9)],
                 [(7.0, 1.6), (7.0, 2.6), (7.9, 2.6), (8.3, 1.6)]],
        wheel=0.45, axles=(1.6, 6.4), depth=2.4, head=(8.4, 8.52, 0.8, 1.0), tail=(-0.03, 0.06, 0.7, 1.1),
        stripes=[(1.15, 1.35, '#6A3A1A'), (1.4, 1.55, '#C8701E'), (1.6, 1.72, '#E8B048')], door=(5.6, 6.4, 0.6, 2.7),
        hub='steel', bevel=0.12),
    'stepvan': dict(
        body=[(0, 0.46), (0, 2.95), (5.0, 2.95), (5.2, 2.8), (5.38, 1.6), (6.4, 1.42), (6.5, 1.2), (6.5, 0.46),
              (6.2, 0.36), (0.3, 0.36)],
        windows=[[(5.06, 1.62), (5.06, 2.62), (5.24, 2.62), (5.3, 1.62)]],
        wheel=0.42, axles=(1.3, 5.3), depth=2.3, head=(6.38, 6.52, 1.04, 1.18), tail=(-0.03, 0.06, 0.7, 1.2),
        hub='steel', bevel=0.06),
}
KINDS['taxi'] = KINDS['sedan']


def _link(o):
    bpy.context.collection.objects.link(o)
    return o


def _mesh(name, verts, faces):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    o = _link(bpy.data.objects.new(name, me))
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(o.data)
    return o


def _extrude(name, pts, y0, y1):
    """A side-profile polygon (x, z) pushed back from y0 to y1."""
    n = len(pts)
    verts = [(x, y0, z) for x, z in pts] + [(x, y1, z) for x, z in pts]
    faces = [list(range(n - 1, -1, -1)), list(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append([i, j, n + j, n + i])
    return _mesh(name, verts, faces)


def _cyl(name, r, depth, x, y, z, verts=32, axis='y', r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=(x, y, z))
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r2, depth=depth, location=(x, y, z))
    o = bpy.context.object
    o.name = name
    if axis == 'y':
        o.rotation_euler = (math.radians(90), 0, 0)
    elif axis == 'x':
        o.rotation_euler = (0, math.radians(90), 0)
    return o


def _box(name, x0, x1, y0, y1, z0, z1):
    bpy.ops.mesh.primitive_cube_add(location=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
    o = bpy.context.object
    o.name = name
    o.scale = ((x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2)
    return o


def paint(color):
    """Glossy car paint with a clear coat."""
    from kit import mat
    m = mat(color, rough=0.28, metal=0.35, name=f'paint{color}')
    p = m.node_tree.nodes['Principled BSDF']
    if 'Coat Weight' in p.inputs:
        p.inputs['Coat Weight'].default_value = 1.0
        p.inputs['Coat Roughness'].default_value = 0.05
    return m


class _Parts:
    """Collects a model's objects under one root empty."""

    def __init__(self, name):
        self.root = _link(bpy.data.objects.new(name, None))
        self.name = name

    def add(self, o, m):
        if m is not None:
            o.data.materials.append(m)
        o.parent = self.root
        return o


def _zat(pts, x):
    """Highest z of the profile at x (for placing things on the roof)."""
    best = 0.0
    n = len(pts)
    for i in range(n):
        (x0, z0), (x1, z1) = pts[i], pts[(i + 1) % n]
        if min(x0, x1) <= x <= max(x0, x1) and x0 != x1:
            best = max(best, z0 + (z1 - z0) * (x - x0) / (x1 - x0))
    return best


def build(kind, color, glass='#24303E', name='car', trim=None, lidar=False, twotone=None, hole=None, lightbar=True):
    """Build a car. trim: a side stripe colour. lidar: Waymo sensors. twotone:
    colour of the door panels (police black-and-white). hole: (x0, x1, z0, z1)
    cut through the near side, e.g. a food truck's serving window. lightbar:
    False leaves a police car's roof bare for one drawn by the game."""
    from kit import glow, mat
    k = KINDS[kind]
    D, r = k['depth'], k['wheel']
    prof = k['body']
    L = max(x for x, _ in prof)
    H = max(z for _, z in prof)
    P = _Parts(name)
    add = P.add
    gm = mat(glass, rough=0.04, metal=0.6)
    chrome = mat('#E0E0E4', rough=0.1, metal=1.0)
    dark = mat('#18181C', rough=0.6)
    black = mat('#0E0E10', rough=0.4)

    body = add(_extrude(name + '_body', prof, 0.02, D - 0.02), paint(color))
    bev = body.modifiers.new('round', 'BEVEL')
    bev.width = k.get('bevel', 0.07)
    bev.segments = 4
    bev.limit_method = 'ANGLE'
    for p in body.data.polygons:
        p.use_smooth = k.get('bevel', 0.07) > 0.02
    if hole:
        x0, x1, z0, z1 = hole
        cut = _box(name + '_cut', x0, x1, -0.5, D + 0.5, z0, z1)
        boo = body.modifiers.new('hole', 'BOOLEAN')
        boo.object = cut
        boo.operation = 'DIFFERENCE'
        cut.hide_render = True
        cut.parent = P.root
        add(_box(name + '_interior', x0 - 0.3, x1 + 0.3, D + 0.05, D + 0.15, z0 - 0.2, z1 + 0.2), mat('#2A2420', rough=0.9)).name = name + '_interior'

    zmin = min(z for w in k['windows'] for _, z in w)
    zmax = max(z for w in k['windows'] for _, z in w)
    for i, w in enumerate(k['windows']):
        add(_extrude(f'{name}_win{i}', w, -0.004, 0.012), gm)
        add(_extrude(f'{name}_winb{i}', w, D - 0.012, D + 0.004), gm)
    if k.get('chrome_windows'):
        x0 = min(x for w in k['windows'] for x, _ in w)
        x1 = max(x for w in k['windows'] for x, _ in w)
        add(_box(name + '_wtrim', x0 - 0.04, x1 + 0.02, -0.008, 0.004, zmin - 0.05, zmin - 0.01), chrome)
        add(_box(name + '_wtrim2', x0 + 0.1, x1 - 0.3, -0.008, 0.004, zmax + 0.01, zmax + 0.04), chrome)
    if twotone:
        a, b = k['axles']
        add(_box(name + '_doors', a + r * 1.25, b - r * 1.25, -0.01, 0.0, 0.5, zmin - 0.02), mat(twotone, rough=0.3))
    for z0, z1, c in k.get('stripes', []):
        add(_box(name + '_stripe', 0.1, L - 0.25, -0.012, 0.0, z0, z1), mat(c, rough=0.35))
    if trim:
        add(_box(name + '_trim', 0.3, L - 0.3, -0.012, 0.0, 0.66, 0.74), mat(trim, rough=0.3))
    if k.get('spear'):
        add(_box(name + '_spear', 0.2, L - 0.15, -0.014, 0.0, 0.78, 0.81), chrome)
    if 'door' in k:
        x0, x1, z0, z1 = k['door']
        add(_box(name + '_door', x0, x1, -0.012, 0.0, z0, z1), mat('#E8E4D8', rough=0.5))
        add(_box(name + '_doorwin', x0 + 0.15, x1 - 0.15, -0.016, 0.0, z1 - 0.7, z1 - 0.2), gm)
    if 'intake' in k:
        add(_extrude(name + '_intake', k['intake'], -0.008, 0.01), black)

    # bumpers, sills, lights, handles
    bz = 0.24 if k['wheel'] < 0.4 else 0.3
    add(_box(name + '_bumperR', -0.04, 0.32, -0.01, D + 0.01, bz, bz + 0.18), dark)
    add(_box(name + '_bumperF', L - 0.32, L + 0.04, -0.01, D + 0.01, bz, bz + 0.18), dark)
    if k.get('running_board'):
        add(_box(name + '_board', k['axles'][0] + r * 1.2, k['axles'][1] - r * 1.2, -0.12, 0.2, 0.42, 0.48), chrome)
    if 'grille' in k:
        x0, x1, z0, z1 = k['grille']
        add(_box(name + '_grille', x0, x1, 0.15, D - 0.15, z0, z1), chrome)
    if k.get('pushbar'):
        add(_box(name + '_push', L - 0.05, L + 0.2, 0.25, D - 0.25, 0.4, 1.0), black)
    hx0, hx1, hz0, hz1 = k['head']
    add(_box(name + '_head', hx0, hx1, -0.012, 0.45, hz0, hz1), glow('#FFF6D8', 4))
    tx0, tx1, tz0, tz1 = k['tail']
    add(_box(name + '_tail', tx0, tx1, -0.012, 0.4, tz0, tz1), glow('#E01818', 2.5))
    if kind in ('sedan', 'taxi', 'prius', 'escalade', 'explorer', 'ipace', 'impala', 'transit'):
        for hx in (k['windows'][0][-1][0] - 0.25, k['windows'][-1][0][0] + 0.1):
            add(_box(name + '_handle', hx, hx + 0.16, -0.025, 0.0, zmin - 0.16, zmin - 0.12), chrome)
    if kind == 'gwagon':
        add(_cyl(name + '_round', 0.11, 0.06, L - 0.02, 0.32, 0.98, axis='x'), glow('#FFF6D8', 4))
    if k.get('spare'):
        add(_cyl(name + '_spare', 0.4, 0.28, -0.14, D / 2, 1.05, axis='x'), mat('#141414', rough=0.85))
        add(_cyl(name + '_sparecov', 0.36, 0.04, -0.29, D / 2, 1.05, axis='x'), paint(color))

    # wheels
    tyre = mat('#141414', rough=0.85)
    hubs = {'alloy': mat('#B8BCC4', rough=0.25, metal=0.8), 'steel': mat('#5A5A60', rough=0.5, metal=0.4),
            'wire': mat('#E8C040', rough=0.15, metal=1.0), 'aero': mat('#2A2A2E', rough=0.3, metal=0.2)}
    hub = hubs[k.get('hub', 'alloy')]
    for ax in k['axles']:
        if k.get('arches') == 'trapezoid':
            add(_extrude(name + '_arch', [(ax - r * 1.35, 0.42), (ax - r * 0.9, r * 2.25), (ax + r * 0.9, r * 2.25),
                                          (ax + r * 1.35, 0.42)], -0.012, 0.02), black)
        else:
            add(_cyl(name + '_arch', r * 1.13, 0.02, ax, 0.0, r + 0.02), dark)
        if k.get('flares'):
            add(_cyl(name + '_flare', r * 1.25, 0.05, ax, -0.02, r + 0.02), black)
        add(_cyl(name + '_tyre', r, D * 0.92, ax, D / 2, r), tyre)
        add(_cyl(name + '_wall', r, 0.03, ax, -0.03, r), tyre)
        if k.get('whitewall'):
            add(_cyl(name + '_ww', r * 0.82, 0.02, ax, -0.05, r), mat('#F0F0EA', rough=0.5))
            add(_cyl(name + '_ww2', r * 0.66, 0.025, ax, -0.055, r), tyre)
        add(_cyl(name + '_hub', r * 0.6, 0.02, ax, -0.06, r), hub)
        if k.get('hub') == 'wire':
            for s in range(6):
                spoke = add(_box(name + '_spoke', ax - r * 0.55, ax + r * 0.55, -0.078, -0.07, r - 0.01, r + 0.01), hub)
                spoke.rotation_euler = (0, math.radians(30 * s), 0)
                spoke.location = (ax, -0.074, r)
        elif k.get('hub') == 'alloy':
            for s in range(5):
                spoke = add(_box(name + '_spoke', 0, 0, 0, 0, 0, 0), mat('#2A2A2E', rough=0.4))
                spoke.scale = (r * 0.05, 0.006, r * 0.22)
                spoke.rotation_euler = (0, math.radians(72 * s + 36), 0)
                spoke.location = (ax + math.sin(math.radians(72 * s + 36)) * r * 0.36, -0.074,
                                  r + math.cos(math.radians(72 * s + 36)) * r * 0.36)
        add(_cyl(name + '_hubc', r * 0.16, 0.02, ax, -0.08, r, verts=16), dark)

    # roof gear
    if kind == 'explorer' and lightbar:
        add(_box(name + '_bar', 1.6, 2.6, 0.3, D - 0.3, H, H + 0.12), black)
        add(_box(name + '_red', 1.65, 2.1, 0.28, D - 0.28, H + 0.02, H + 0.14), glow('#FF2020', 3))
        add(_box(name + '_blue', 2.1, 2.55, 0.28, D - 0.28, H + 0.02, H + 0.14), glow('#2060FF', 3))
    if kind == 'taxi':
        zr = _zat(prof, 2.4)
        add(_box(name + '_sign', 2.1, 2.6, 0.55, D - 0.55, zr, zr + 0.2), glow('#FFF4C0', 1.5))
        add(_box(name + '_check', 1.0, L - 0.9, -0.014, 0.0, 0.62, 0.7), mat('#111111'))
    if kind == 'cybertruck':
        add(_box(name + '_lightbar', L - 0.9, L + 0.02, -0.012, 0.3, 1.0, 1.04), glow('#F0F4FF', 5))
    if kind == 'winnebago':
        add(_box(name + '_ac', 3.0, 4.0, 0.5, D - 0.5, H, H + 0.3), mat('#E8E8E0', rough=0.5))
        add(_box(name + '_ladder', 0.05, 0.12, -0.05, 0.0, 0.6, 3.25), mat('#9A9A9A', metal=0.8))
    if lidar:
        zr = _zat(prof, L * 0.45)
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.24, depth=0.36, location=(L * 0.45, D / 2, zr + 0.18))
        add(bpy.context.object, mat('#2A2A2E', rough=0.3))
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.24, location=(L * 0.45, D / 2, zr + 0.36))
        dome = add(bpy.context.object, mat('#1A1A1E', rough=0.15, metal=0.4))
        dome.scale = (1, 1, 0.5)
        for sx in (L - 0.5, 0.35):
            add(_box(name + '_sensor', sx, sx + 0.14, -0.04, 0.0, 0.92, 1.04), mat('#202024', rough=0.3))
    return P.root, dict(length=L, height=H + (0.4 if lidar else 0), depth=D)


def streetcar(name='streetcar', color='#FDB913'):
    """Cincinnati's Connector: a three-section CAF Urbos 3 in daffodil yellow,
    black window band, gray roof pods and a pantograph."""
    from kit import glow, mat
    P = _Parts(name)
    add = P.add
    body = paint(color)
    band = mat('#101214', rough=0.15, metal=0.4)
    gray = mat('#8A8C90', rough=0.45, metal=0.3)
    door = mat('#3A4048', rough=0.1, metal=0.5)
    D = 2.65
    # (x0, x1, nose_left, nose_right)
    mods = [(0.0, 8.6, True, False), (8.9, 15.1, False, False), (15.4, 24.0, False, True)]
    for i, (x0, x1, nl, nr) in enumerate(mods):
        pts = [(x0 + (0.5 if nl else 0), 0.35)]
        pts += [(x0, 0.95), (x0, 2.4), (x0 + 0.7, 3.25)] if nl else [(x0, 3.25)]
        pts += [(x1 - 0.7, 3.25), (x1, 2.4), (x1, 0.95), (x1 - 0.5, 0.35)] if nr else [(x1, 3.25), (x1, 0.35)]
        o = add(_extrude(f'{name}_mod{i}', pts, 0.02, D - 0.02), body)
        bev = o.modifiers.new('round', 'BEVEL')
        bev.width = 0.12
        bev.segments = 4
        for p in o.data.polygons:
            p.use_smooth = True
        # window band, doors, roof pod, skirt
        bx0 = x0 + (0.45 if nl else 0.15)
        bx1 = x1 - (0.45 if nr else 0.15)
        add(_box(f'{name}_band{i}', bx0, bx1, -0.012, 0.0, 1.4, 2.7), band)
        if nl:
            add(_extrude(f'{name}_wsl', [(x0 - 0.03, 2.35), (x0 + 0.66, 3.2), (x0 + 0.66, 2.0), (x0 - 0.03, 1.4)], -0.02, D - 0.2), band)
        if nr:
            add(_extrude(f'{name}_wsr', [(x1 + 0.03, 1.4), (x1 - 0.66, 2.0), (x1 - 0.66, 3.2), (x1 + 0.03, 2.35)], -0.02, D - 0.2), band)
        add(_box(f'{name}_roof{i}', x0 + (0.8 if nl else 0.2), x1 - (0.8 if nr else 0.2), 0.3, D - 0.3, 3.2, 3.55), gray)
        add(_box(f'{name}_skirt{i}', x0 + 0.4, x1 - 0.4, -0.01, 0.2, 0.25, 0.5), mat('#2A2A2E', rough=0.6))
        add(_box(f'{name}_stripe{i}', bx0, bx1, -0.014, 0.0, 1.22, 1.32), mat('#F4F4F0', rough=0.4))
        for dx in ([x0 + 2.4, x1 - 2.9] if (nl or nr) else [(x0 + x1) / 2 - 0.65]):
            add(_box(f'{name}_door{i}', dx, dx + 1.3, -0.018, 0.0, 0.45, 2.75), body)
            for wx in (dx + 0.12, dx + 0.72):
                add(_box(f'{name}_doorwin{i}', wx, wx + 0.46, -0.022, 0.0, 1.0, 2.55), door)
            add(_box(f'{name}_doorline{i}', dx + 0.63, dx + 0.67, -0.02, 0.0, 0.45, 2.6), gray)
        if nl:
            add(_box(f'{name}_tail', x0 - 0.02, x0 + 0.1, 0.2, 0.6, 1.0, 1.15), glow('#E01818', 2.5))
        if nr:
            add(_box(f'{name}_head', x1 - 0.1, x1 + 0.02, 0.2, 0.6, 1.0, 1.15), glow('#FFF6D8', 4))
            add(_box(f'{name}_dest', x1 - 0.55, x1 - 0.2, -0.016, 0.0, 2.85, 3.05), glow('#FFB020', 2))
    for gx in (8.6, 15.1):
        add(_box(f'{name}_bellows', gx, gx + 0.3, 0.15, D - 0.15, 0.5, 3.1), mat('#202022', rough=0.8))
    # pantograph on the middle section
    for a in (-1, 1):
        arm = add(_box(f'{name}_panto', 0, 0, 0, 0, 0, 0), mat('#303034', metal=0.6))
        arm.scale = (0.75, 0.05, 0.07)
        arm.rotation_euler = (0, math.radians(35 * a), 0)
        arm.location = (12.0 + 0.5 * a, D / 2, 3.95)
    add(_box(f'{name}_shoe', 11.2, 12.8, D / 2 - 0.5, D / 2 + 0.5, 4.3, 4.42), mat('#303034', metal=0.6))
    # lettering
    bpy.ops.object.text_add(location=(12.0, -0.03, 0.6), rotation=(math.radians(90), 0, 0))
    t = bpy.context.object
    t.data.body = 'CONNECTOR'
    t.data.size = 0.42
    t.data.align_x = 'CENTER'
    t.data.extrude = 0.005
    add(t, mat('#F4F4F0', rough=0.4))
    for x in (2.2, 21.8):
        add(_cyl(f'{name}_wheel', 0.36, 0.3, x, 0.2, 0.36), mat('#1A1A1A', rough=0.8))
    return P.root, dict(length=24.0, height=4.4, depth=D)


def airliner(name='plane', tail='#1C3C8C', belly='#C8CCD4'):
    """A twin-engine narrowbody (A320-sized, 37 m) on its gear, nose to the right."""
    from kit import mat
    P = _Parts(name)
    add = P.add
    white = paint('#F4F4F6')
    tailm = paint(tail)
    dark = mat('#141820', rough=0.2, metal=0.4)
    gear = mat('#3A3A3E', metal=0.6, rough=0.4)
    R, zc = 1.98, 3.45  # fuselage radius and centreline height
    add(_cyl(name + '_fus', R, 25.0, 18.0, 0, zc, verts=48, axis='x'), white)
    nose = add(_mesh_sphere(name + '_nose'), white)
    nose.scale = (4.2, R, R)
    nose.location = (30.5, 0, zc - 0.15)
    tc = add(_cyl(name + '_tailcone', R, 6.0, 2.5, 0, zc + 0.55, verts=48, axis='x', r2=0.35), white)
    tc.rotation_euler = (0, math.radians(-90), 0)
    tc.location = (2.5, 0, zc + 0.6)
    # belly cheat line and windows
    add(_box(name + '_cheat', 5.5, 31.5, -R - 0.02, -R + 0.2, zc - 0.65, zc - 0.5), tailm)
    add(_box(name + '_belly', 6.0, 30.0, -R * 0.75, R * 0.75, zc - R - 0.02, zc - R + 0.35), mat(belly, rough=0.4))
    for i in range(30):
        x = 7.0 + i * 0.75
        add(_box(name + '_win', x, x + 0.26, -R - 0.03, -R + 0.15, zc + 0.35, zc + 0.68), dark)
    for x in (9.0, 27.0):
        add(_box(name + '_doorline', x, x + 0.85, -R - 0.025, -R + 0.15, zc - 0.6, zc + 1.2), mat('#D8D8DC', rough=0.4))
    add(_extrude(name + '_cockpit', [(31.2, zc + 0.45), (32.5, zc + 0.3), (32.3, zc + 0.75), (31.4, zc + 1.0)],
                 -1.6, -1.2), dark)
    # fin, stabilisers, wings, engines
    add(_extrude(name + '_fin', [(0.6, zc + 1.6), (4.6, zc + 1.6), (2.6, zc + 7.6), (0.2, zc + 7.6)], -0.12, 0.12), tailm)
    stab = add(_extrude(name + '_stab', [(0.4, -6.2), (1.6, -6.2), (4.4, 0), (1.0, 0)], -0.06, 0.06), white)
    stab.rotation_euler = (math.radians(90), 0, 0)
    stab.location = (0, 0, zc + 1.2)
    stab2 = add(_extrude(name + '_stab2', [(0.4, -6.2), (1.6, -6.2), (4.4, 0), (1.0, 0)], -0.06, 0.06), white)
    stab2.rotation_euler = (math.radians(-90), 0, 0)
    stab2.location = (0, 0, zc + 1.2)
    for side in (-1, 1):
        w = add(_extrude(name + '_wing', [(12.4, 0), (19.0, 0), (14.2, 16.5), (12.4, 16.5)], -0.12, 0.12), white)
        w.rotation_euler = (math.radians(90 * side + (-5 if side < 0 else 5)), 0, 0)
        w.location = (0, 0, zc - 1.2)
        ey = 5.7 * side
        add(_cyl(name + '_eng', 1.05, 4.4, 17.6, ey, zc - 2.15, verts=32, axis='x'), mat('#E8E8EC', rough=0.3, metal=0.3))
        add(_cyl(name + '_intake', 0.85, 0.08, 19.82, ey, zc - 2.15, verts=32, axis='x'), dark)
        add(_box(name + '_pylon', 16.6, 19.0, ey - 0.15, ey + 0.15, zc - 1.4, zc - 1.1), white)
    # landing gear
    for x, n in ((29.0, 1), (17.0, 2)):
        add(_box(name + '_strut', x - 0.1, x + 0.1, -0.1, 0.1, 0.5, zc - R + 0.2), gear)
        for j in range(n):
            add(_cyl(name + '_wheel', 0.5 if n == 2 else 0.38, 0.35, x + (j - (n - 1) / 2) * 0.0, -0.6 + j * 1.2,
                     0.5 if n == 2 else 0.38), mat('#141414', rough=0.8))
    return P.root, dict(length=34.7, height=zc + 7.6, depth=34.0)


def _mesh_sphere(name):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1)
    o = bpy.context.object
    o.name = name
    for p in o.data.polygons:
        p.use_smooth = True
    return o
