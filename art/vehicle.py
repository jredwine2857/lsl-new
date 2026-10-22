"""Cars for the rooms and the traffic sprites: real side profiles (sedan, SUV,
G-wagon, shuttle van, police cruiser) with rounded bodywork, glass, chrome,
tyres with hubcaps, wheel arches and lights.

Models are built in metres with the car's length along +x, its roof up +z
and the side that faces the camera at y = 0 (the body goes back to +y).
"""

import math

import bpy

# Side profile (x, z) in metres, clockwise from the rear bumper; side window
# shape; wheel radius and centres; body depth.
KINDS = {
    'sedan': dict(
        body=[(0, 0.30), (0, 0.78), (0.12, 0.93), (1.0, 0.98), (1.55, 1.40), (2.95, 1.44), (3.55, 1.0), (4.5, 0.88),
              (4.7, 0.72), (4.7, 0.30), (4.45, 0.22), (0.3, 0.22)],
        windows=[[(1.66, 1.02), (1.74, 1.33), (2.28, 1.36), (2.28, 1.02)], [(2.36, 1.02), (2.36, 1.36), (2.9, 1.36), (3.38, 1.02)]],
        wheel=0.33, axles=(0.85, 3.85), depth=1.85),
    'suv': dict(
        body=[(0, 0.42), (0, 1.15), (0.08, 1.78), (0.35, 1.9), (3.55, 1.9), (4.1, 1.22), (5.0, 1.06), (5.1, 0.86),
              (5.1, 0.42), (4.8, 0.32), (0.3, 0.32)],
        windows=[[(0.22, 1.22), (0.38, 1.76), (1.6, 1.78), (1.6, 1.22)], [(1.7, 1.22), (1.7, 1.78), (2.7, 1.78), (2.7, 1.22)],
                 [(2.8, 1.22), (2.8, 1.78), (3.48, 1.78), (3.95, 1.22)]],
        wheel=0.4, axles=(0.95, 4.1), depth=2.0),
    'gwagon': dict(
        body=[(0, 0.42), (0, 1.96), (3.35, 1.96), (3.58, 1.26), (4.75, 1.16), (4.8, 0.42), (4.5, 0.32), (0.3, 0.32)],
        windows=[[(0.15, 1.32), (0.15, 1.86), (1.3, 1.86), (1.3, 1.32)], [(1.4, 1.32), (1.4, 1.86), (2.4, 1.86), (2.4, 1.32)],
                 [(2.5, 1.32), (2.5, 1.86), (3.28, 1.86), (3.45, 1.32)]],
        wheel=0.4, axles=(0.85, 3.9), depth=1.95),
    'van': dict(
        body=[(0, 0.42), (0, 2.3), (0.12, 2.42), (4.55, 2.42), (5.3, 1.45), (5.5, 1.12), (5.5, 0.42), (5.2, 0.32), (0.3, 0.32)],
        windows=[[(0.3, 1.5), (0.3, 2.18), (1.6, 2.18), (1.6, 1.5)], [(1.75, 1.5), (1.75, 2.18), (3.05, 2.18), (3.05, 1.5)],
                 [(3.2, 1.5), (3.2, 2.18), (4.45, 2.18), (4.98, 1.5)]],
        wheel=0.38, axles=(1.0, 4.5), depth=2.05),
}
KINDS['police'] = KINDS['sedan']
KINDS['taxi'] = KINDS['sedan']


def _mesh(name, verts, faces):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    return o


def _extrude(name, pts, y0, y1):
    n = len(pts)
    verts = [(x, y0, z) for x, z in pts] + [(x, y1, z) for x, z in pts]
    faces = [list(range(n - 1, -1, -1)), list(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append([i, j, n + j, n + i])
    o = _mesh(name, verts, faces)
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(o.data)
    return o


def _cyl(name, r, depth, x, y, z, verts=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=(x, y, z),
                                        rotation=(math.radians(90), 0, 0))
    o = bpy.context.object
    o.name = name
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


def build(kind, color, glass='#2A3848', name='car', trim=None, lidar=False):
    """Build a vehicle at the origin and return its parts (all parented to one empty)."""
    from kit import glow, mat
    k = KINDS[kind]
    D = k['depth']
    r = k['wheel']
    L = max(x for x, _ in k['body'])
    root = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(root)
    parts = []

    def add(o, m):
        o.data.materials.append(m)
        o.parent = root
        parts.append(o)
        return o

    body = add(_extrude(name + '_body', k['body'], 0.02, D - 0.02), paint(color))
    bev = body.modifiers.new('round', 'BEVEL')
    bev.width = 0.07
    bev.segments = 4
    bev.limit_method = 'ANGLE'
    for p in body.data.polygons:
        p.use_smooth = True
    gm = mat(glass, rough=0.04, metal=0.6)
    chrome = mat('#D8D8DC', rough=0.12, metal=1.0)
    dark = mat('#1C1C20', rough=0.6)
    for i, w in enumerate(k['windows']):
        add(_extrude(f'{name}_win{i}', w, -0.004, 0.012), gm)
        add(_extrude(f'{name}_winb{i}', w, D - 0.012, D + 0.004), gm)
    # windscreen and rear glass are seen edge-on; a dark band sells the roof pillars
    zmin = min(z for w in k['windows'] for _, z in w)
    add(_box(name + '_trim', 0.1, L - 0.1, -0.006, 0.004, zmin - 0.05, zmin - 0.02), chrome)
    # bumpers, sills, lights, mirror, handles
    add(_box(name + '_bumperR', -0.04, 0.35, -0.01, D + 0.01, 0.24, 0.42), dark)
    add(_box(name + '_bumperF', L - 0.35, L + 0.04, -0.01, D + 0.01, 0.24, 0.42), dark)
    add(_box(name + '_sill', 0.5, L - 0.5, -0.01, 0.03, 0.22, 0.32), dark)
    zl = max(z for x, z in k['body'] if x > L - 0.3) - 0.14
    add(_box(name + '_head', L - 0.08, L + 0.03, 0.1, 0.45, zl - 0.1, zl), glow('#FFF6D8', 4))
    add(_box(name + '_tail', -0.03, 0.06, 0.1, 0.4, zl - 0.12, zl + 0.02), glow('#E01818', 2.5))
    for hx in (L * 0.37, L * 0.58):
        add(_box(name + '_handle', hx, hx + 0.16, -0.025, 0.0, zmin - 0.16, zmin - 0.12), chrome)
    tyre = mat('#141414', rough=0.85)
    for ax in k['axles']:
        add(_cyl(name + '_arch', r * 1.12, 0.02, ax, 0.0, r + 0.02), dark)
        add(_cyl(name + '_tyre', r, D * 0.92, ax, D / 2, r), tyre)
        add(_cyl(name + '_wall', r, 0.03, ax, -0.02, r), tyre)
        add(_cyl(name + '_hub', r * 0.6, 0.02, ax, -0.04, r), mat('#C0C0C8', rough=0.3, metal=0.3))
        add(_cyl(name + '_hubc', r * 0.2, 0.02, ax, -0.055, r, verts=16), dark)
    if kind == 'police':
        add(_box(name + '_bar', 1.9, 2.7, 0.5, D - 0.5, 1.44, 1.56), dark)
        add(_box(name + '_red', 1.95, 2.3, 0.48, D - 0.48, 1.46, 1.58), glow('#FF2020', 3))
        add(_box(name + '_blue', 2.3, 2.65, 0.48, D - 0.48, 1.46, 1.58), glow('#2060FF', 3))
    if kind == 'taxi':
        add(_box(name + '_sign', 2.0, 2.5, 0.6, D - 0.6, 1.44, 1.62), glow('#FFF4C0', 1.5))
        add(_box(name + '_check', 1.0, L - 0.9, -0.012, 0.0, 0.62, 0.7), mat('#111111'))
    if lidar:
        top = max(z for _, z in k['body'])
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.22, depth=0.28, location=(L * 0.42, D / 2, top + 0.14))
        add(bpy.context.object, mat('#2A2A2E', rough=0.3))
    if trim:
        add(_box(name + '_stripe', 0.3, L - 0.3, -0.012, 0.0, 0.66, 0.74), mat(trim, rough=0.3))
    return root, dict(length=L, height=max(z for _, z in k['body']), depth=D)
