"""Render character sprite sheets and copy them into the game.

    python3 art/chars/build.py              # the whole cast, 4 at a time
    python3 art/chars/build.py larry gates  # just these

Recipes live in cast.py; each renders in its own Blender process.
"""

import os
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from cast import CAST  # noqa: E402

OUT = os.path.join(HERE, '..', 'out', 'chars')
GAME = os.path.join(HERE, '..', '..', 'src', 'art', 'chars')


def render(name):
    subprocess.run([sys.executable, os.path.join(HERE, 'cast.py'), name, OUT], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    shutil.copy(os.path.join(OUT, f'{name}.png'), os.path.join(GAME, f'{name}.png'))
    print('rendered', name, flush=True)


names = sys.argv[1:] or list(CAST)
os.makedirs(GAME, exist_ok=True)
with ThreadPoolExecutor(int(os.environ.get('JOBS', 4))) as pool:
    list(pool.map(render, names))
print('done')
