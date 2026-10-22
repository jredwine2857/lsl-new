"""Render room backdrops and copy them into the game.

    python3 -m pip install bpy pillow numpy
    python3 art/build.py              # every room
    python3 art/build.py ch3-skyline  # just one (or a few)

Each art/rooms/<name>.py builds one room in Blender, renders it and paints
it down to 320x200 (see kit.py and paint.py). Finished images land in
src/art/rooms/, which the game loads; scratch renders stay in art/out/.
"""

import glob
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
GAME = os.path.join(HERE, '..', 'src', 'art', 'rooms')

names = sys.argv[1:] or sorted(os.path.basename(p)[:-3] for p in glob.glob(os.path.join(HERE, 'rooms', '*.py')))
os.makedirs(GAME, exist_ok=True)
for name in names:
    print('rendering', name, flush=True)
    subprocess.run([sys.executable, os.path.join(HERE, 'rooms', f'{name}.py'), OUT], check=True, stdout=subprocess.DEVNULL)
    for suffix in ('', '-fg'):
        src = os.path.join(OUT, f'{name}{suffix}.png')
        dst = os.path.join(GAME, f'{name}{suffix}.png')
        if os.path.exists(src):
            shutil.copy(src, dst)
        elif os.path.exists(dst):
            os.remove(dst)
print('done')
