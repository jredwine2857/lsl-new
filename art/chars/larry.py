"""Larry Laffer: white polyester leisure suit, open black shirt, gold chain,
receding brown hair and the nose."""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from charkit import Char, out_dir  # noqa: E402

c = Char('larry', skin='#EDB48C', head_scale=1.05, build=1.12)
c.head(hair='#6A3F1E', hair_style='receding', nose=2.1, brows='#5A3418', chin=0.9)
c.torso('#F2F0E6', belly=1.08)
c.suit_front('#1C1C1C', lapels='#DCD6C2', chain='#E8C040')
c.arms('#F2F0E6')
c.legs('#F2F0E6', shoes='#F2F0E6', flare=1.35)
c.render(out_dir())
