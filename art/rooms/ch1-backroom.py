"""Chapter 1: Lefty's back room. The KQ5 box, newspaper and the open door
are drawn by the game; the crate the box sits on is baked in."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from kit import Room, glow, mat, mottled, out_dir, planks  # noqa: E402

r = Room('ch1-backroom', floor_y=136)
D = r.D

r.wall(planks('#7A4A22', '#4A2A10', scale=2.2, axis='h'))
r.floor(mottled('#5A4632', '#3A2E24', scale=2, floor=True))
r.panel(-10, 128, 340, 8, D - 0.05, mat('#3A2210'), thick=6, name='baseboard')

# gilded mirror
r.panel(46, 32, 34, 42, D - 0.05, mat('#E8B848', rough=0.3, metal=0.7), thick=3)
r.panel(51, 37, 24, 32, D - 0.1, mat('#B8E0E8', rough=0.05, metal=0.6), thick=0.5)

# lipstick graffiti
r.text('KEN SENT ME', 228, 36, 7, D - 0.02, mat('#E02040', rough=0.5), align='LEFT', extrude=0.1)
r.text('LARRY WAS HERE 1987', 228, 47, 4.5, D - 0.02, mat('#E040C0'), align='LEFT', extrude=0.1)
r.text('LARRY IS STILL HERE 1992', 228, 55, 4.5, D - 0.02, mat('#C8C8C8'), align='LEFT', extrude=0.1)

# shelves of crates
WOOD = planks('#A87A44', '#6A4A22', scale=5, axis='v')
for i in range(3):
    r.panel(148, 74 + i * 22, 84, 3, D - 0.6, mat('#5A3410'), thick=30)
    for j in range(4):
        r.panel(154 + j * 19, 60 + i * 22, 16, 14, D - 0.65, WOOD if j % 2 else planks('#8E6232', '#5A3A18', scale=5, axis='v'), thick=24)
r.text('NEW COKE', 182, 89, 2.5, D - 0.68, mat('#C01818'), crisp=False)

# crate that holds the KQ5 box
r.block(128, 26, 122, 142, 22, WOOD, 'crate')

# hot tub with 30 years of scum
r.disc(58, 146, 50, 136, 12, mat('#9ADADA', rough=0.2), 'tub')
r.disc(58, 146, 43, 135, 2, mottled('#2E5A22', '#5A8A2A', scale=8), 'scum')

# steel door to the bar (the open state is drawn by the game)
r.panel(280, 60, 34, 80, D - 0.02, mat('#444444', metal=0.6, rough=0.4), thick=3)
r.panel(282, 62, 30, 76, D - 0.06, mat('#6A6A6A', metal=0.8, rough=0.35), thick=1)
r.panel(290, 76, 14, 4, D - 0.08, mat('#080808'), thick=0.5)
r.oval(286, 106, 2, 2, D - 0.1, mat('#D8B040', metal=1, rough=0.2), thick=2)

# a single bare bulb
r.panel(160, -10, 0.5, 30, D - 3, mat('#111111'))
r.ball(160, 22, D - 3, 2.5, glow('#FFE8A0', 12))
r.lamp(160, 26, D - 3, color='#FFD890', energy=700, radius=0.2)
r.ambient('#A0A8C0', 0.35)
r.key(energy=250, color='#FFF0DC')
r.render(out_dir())
