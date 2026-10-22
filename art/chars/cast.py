"""The whole cast, as recipes for charkit.Char. Celebrities are parody
caricatures of their public personas: a signature haircut, outfit and nose.

    python3 art/chars/cast.py larry art/out/chars   # render one sprite sheet
    python3 art/chars/build.py                      # render them all
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

FAIR, LIGHT, TAN, OLIVE, BROWN, DARK = '#F2C4A0', '#EDB48C', '#D89A6A', '#E0AC80', '#A86E44', '#6E4226'
DENIM = '#3A5A9A'
BLACK, WHITE = '#1A1A1A', '#F2F0E6'

# Each recipe: skin, hair (colour, style), body (build, height, head), clothes.
#   top / sleeve / pants / shoes, skirt (colour, length), front (shirt, lapels,
#   chain, tie), glasses ('clear' | 'shades' | colour of shades), hat (colour,
#   style), beard / moustache, nose, belly, flare.
CAST = {
    'larry': dict(skin=LIGHT, hair=('#6A3F1E', 'receding'), nose=2.1, chin=0.9, brows='#5A3418', build=1.12, head=1.05,
                  top=WHITE, pants=WHITE, shoes=WHITE, flare=1.35, belly=1.08,
                  front=dict(shirt=BLACK, lapels='#DCD6C2', chain='#E8C040')),
    # chapter 1
    'sage': dict(skin=FAIR, hair=('#3CC060', 'long'), build=0.9, top=BLACK, pants='#3A3A3A'),
    'bonds': dict(skin=LIGHT, hair=('#4A4A4A', 'short'), moustache='#3A3A3A', top='#24448A', pants='#1E3470',
                  hat=('#1E3470', 'captain'), front=dict(shirt='#DDE4F0', tie=BLACK)),
    'canvasser': dict(skin=FAIR, hair=('#8A5A2A', 'long'), build=0.88, top='#5AC85A', pants=DENIM),
    'ken': dict(skin=LIGHT, hair=('#B8B8B8', 'bald'), glasses='clear', beard='#B0B0B0', top='#C83A3A', pants='#7A5A3A'),
    'roberta': dict(skin=FAIR, hair=('#C8C8C8', 'long'), build=0.88, top='#7AA8E0', skirt=('#7AA8E0', 0.5), pants=FAIR),
    'gus': dict(skin=LIGHT, hair=('#C0C0C0', 'bald'), nose=1.3, top='#B03030', pants=BLACK, belly=1.15,
                front=dict(shirt=WHITE)),
    'deshawn': dict(skin=BROWN, hair=(BLACK, 'buzz'), top='#5A8AD8', pants='#4A4A4A'),
    'patron1': dict(skin=FAIR, hair=('#E8D050', 'short'), top='#6AD06A', pants=DENIM),
    'patron2': dict(skin=OLIVE, hair=(BLACK, 'long'), glasses='clear', build=0.88, top='#B0B0B0', pants='#444444'),
    # chapter 2
    'roger': dict(skin=FAIR, hair=('#E8C850', 'short'), nose=1.2, top='#A8A8A0', pants='#A8A8A0', shoes='#3A3A3A'),
    'attendant': dict(skin=OLIVE, hair=(BLACK, 'bob'), build=0.88, top='#2A3A8A', skirt=('#2A3A8A', 0.45), pants=OLIVE,
                      front=dict(shirt=WHITE, tie='#D03030')),
    'kris': dict(skin=LIGHT, hair=(BLACK, 'bob'), glasses='shades', build=0.88, top=WHITE, pants=WHITE,
                 front=dict(shirt=WHITE, lapels='#E8E4D8', chain='#E8C040')),
    'kim': dict(skin=OLIVE, hair=(BLACK, 'long'), build=0.86, top='#C8A888', skirt=('#C8A888', 0.62), pants=OLIVE),
    'khloe': dict(skin=TAN, hair=('#E8D070', 'long'), build=0.9, height=1.04, top=BLACK, pants=BLACK),
    'caitlyn': dict(skin=LIGHT, hair=('#7A5030', 'long'), build=0.95, height=1.05, top='#C0C0C0', pants=DENIM),
    'paparazzo': dict(skin=LIGHT, hair=('#5A5A5A', 'bald'), beard='#5A5A5A', top='#7A5230', pants='#4A4A4A', belly=1.1),
    'security': dict(skin=BROWN, hair=(BLACK, 'bald'), glasses='shades', build=1.2, top=BLACK, pants=BLACK,
                     front=dict(shirt=WHITE, tie=BLACK)),
    'ashleigh': dict(skin=FAIR, hair=('#8A5A2A', 'long'), glasses='clear', build=0.88, top='#E060C0', pants=DENIM),
    'waiter': dict(skin=BROWN, hair=(BLACK, 'buzz'), top=WHITE, pants=BLACK, front=dict(shirt=WHITE, tie='#C02020')),
    # chapter 3
    'dottie': dict(skin=FAIR, hair=('#C83A20', 'bob'), build=0.95, top='#7AB0E0', skirt=('#7AB0E0', 0.5), pants=FAIR,
                   front=dict(shirt=WHITE)),
    'moranis': dict(skin=FAIR, hair=('#5A5A5A', 'short'), glasses='clear', build=0.85, height=0.92, nose=1.2,
                    top='#A8A8A8', pants='#7A5A3A', front=dict(shirt=WHITE)),
    'barry': dict(skin=BROWN, hair=(BLACK, 'buzz'), top='#2A7AC8', pants=WHITE, shoes=BLACK),
    'alicia': dict(skin=FAIR, hair=('#F0D870', 'long'), build=0.86, top='#E8C830', skirt=('#E8C830', 0.42), pants=FAIR,
                   front=dict(shirt=WHITE, lapels='#C8A820')),
    'willow': dict(skin=FAIR, hair=('#F070C8', 'long'), build=0.86, top='#3A9A4A', pants=DENIM),
    'brayden': dict(skin=TAN, hair=('#E8D060', 'short'), glasses='shades', top=BLACK, pants='#B0B0B0'),
    'farkus': dict(skin=FAIR, hair=('#C84A20', 'short'), hat=('#8A5A30', 'coonskin'), build=1.25, height=1.06,
                   top='#7A5230', pants='#4A4A4A'),
    'grover': dict(skin=FAIR, hair=('#7A5030', 'short'), build=0.8, height=0.88, nose=1.3, top='#3A8A3A', pants='#4A4A4A'),
    'kid': dict(skin=BROWN, hair=(BLACK, 'short'), build=0.75, height=0.72, head=1.1, top='#E04040', pants=DENIM),
    # chapter 4
    'affleck': dict(skin=LIGHT, hair=('#5A3A20', 'short'), hat=('#1A2A5A', 'cap'), beard='#4A3020', top='#5A5A5A',
                    pants=DENIM),
    'cousin': dict(skin=DARK, hair=(BLACK, 'bald'), build=1.35, height=1.12, top='#2A4AA8', pants='#2A4AA8'),
    'snoop': dict(skin=BROWN, hair=(BLACK, 'long'), build=0.85, height=1.1, glasses='shades', top='#6AA0E0',
                  pants='#6AA0E0'),
    'dre': dict(skin=DARK, hair=(BLACK, 'bald'), glasses='shades', beard='#1A1A1A', build=1.1, top=BLACK, pants=BLACK),
    'sandler': dict(skin=LIGHT, hair=('#4A3A2A', 'short'), top='#D04040', pants='#2A4AA8', shoes=WHITE),
    'filtr': dict(skin=FAIR, hair=('#F0E070', 'short'), glasses='#F070C8', build=0.85, top='#E060C0', pants=BLACK),
    'kaydence': dict(skin=TAN, hair=('#F0D870', 'long'), build=0.85, top=WHITE, pants='#E060C0'),
    'barkley': dict(skin=DARK, hair=(BLACK, 'bald'), build=1.35, belly=1.15, top='#4A4A4A', pants='#4A4A4A',
                    front=dict(shirt=WHITE, lapels='#3A3A3A', tie='#8A2A2A')),
    'jordan': dict(skin=DARK, hair=(BLACK, 'bald'), beard='#1A1A1A', height=1.08, top=BLACK, pants=BLACK,
                   front=dict(shirt=WHITE, lapels='#2A2A2A', tie='#C02020')),
    'moranis-lakers': dict(skin=FAIR, hair=('#5A5A5A', 'short'), glasses='clear', build=0.85, height=0.92, nose=1.2,
                           top='#6A3AA0', pants='#E8C030'),
    'drew': dict(skin=FAIR, hair=('#F0D070', 'long'), build=0.86, top='#E04040', skirt=('#E04040', 0.55), pants=FAIR,
                 shoes=FAIR),
    'fan': dict(skin=FAIR, hair=('#F0D870', 'long'), build=0.86, top='#8A3AC0', pants=DENIM),
    # chapter 5
    'steve': dict(skin=LIGHT, hair=(WHITE, 'short'), nose=1.3, top=WHITE, pants=WHITE, front=dict(shirt=WHITE, lapels='#DCD6C2', tie=BLACK)),
    'curator': dict(skin=FAIR, hair=('#6A6A6A', 'bob'), glasses='clear', build=0.86, top=BLACK, skirt=(BLACK, 0.6), pants=FAIR),
    'moranis-basel': dict(skin=FAIR, hair=('#5A5A5A', 'short'), glasses='clear', build=0.85, height=0.92, nose=1.2,
                          top='#7AD8E0', pants='#7A5A3A'),
    'gates': dict(skin=FAIR, hair=('#8A6A40', 'short'), glasses='clear', top='#7AA8E0', pants='#5A5A5A'),
    'elon': dict(skin=FAIR, hair=('#5A4030', 'short'), height=1.05, top=BLACK, pants=BLACK),
    'jeffrey': dict(skin=TAN, hair=('#C0C0C0', 'short'), top='#3A5AB0', pants=WHITE),
    'hefner': dict(skin=FAIR, hair=('#D0D0D0', 'short'), hat=(WHITE, 'captain'), top='#B02020', pants=BLACK,
                   front=dict(shirt=BLACK, lapels='#7A1010')),
    'guard': dict(skin=BROWN, hair=(BLACK, 'bald'), hat=(WHITE, 'captain'), top=WHITE, pants=WHITE),
    # chapter 6
    'grace': dict(skin='#E8BC94', hair=(BLACK, 'long'), build=0.86, top='#4A80D0', pants=DENIM, shoes=WHITE),
    'mrcho': dict(skin='#E0B088', hair=('#6A6A6A', 'short'), glasses='clear', top=WHITE, pants='#5A5A5A'),
    'mrscho': dict(skin='#E8BC94', hair=(BLACK, 'bob'), build=0.86, height=0.94, top='#C040A0', skirt=('#C040A0', 0.55),
                   pants='#E8BC94'),
    'cruise': dict(skin=LIGHT, hair=('#4A3020', 'short'), glasses='shades', top=WHITE, pants=WHITE,
                   front=dict(shirt=WHITE, chain=None)),
    'snoop-gold': dict(skin=BROWN, hair=(BLACK, 'long'), build=0.85, height=1.1, glasses='shades', top='#E8C030',
                       pants='#E8C030'),
    'spacey': dict(skin=LIGHT, hair=('#6A6A6A', 'short'), top='#6A6A6A', pants='#6A6A6A',
                   front=dict(shirt=WHITE, lapels='#5A5A5A', tie='#B02020')),
}


def build(name, out):
    make(name).render(out)


def make(name):
    """The dressed character, ready to pose or render (cutscenes reuse this)."""
    from charkit import Char
    r = CAST[name]
    c = Char(name, skin=r['skin'], height=r.get('height', 1.0), build=r.get('build', 1.0), head_scale=r.get('head', 1.0))
    hair, style = r['hair']
    c.head(hair=hair, hair_style=style, nose=r.get('nose', 1.0), chin=r.get('chin', 1.0), brows=r.get('brows'),
           beard=r.get('beard'), moustache=r.get('moustache'))
    c.torso(r['top'], belly=r.get('belly', 1.0))
    if 'front' in r:
        c.suit_front(**r['front'])
    c.arms(r.get('sleeve', r['top']))
    c.legs(r['pants'], shoes=r.get('shoes', BLACK), flare=r.get('flare', 1.0))
    if 'skirt' in r:
        c.skirt(r['skirt'][0], length=r['skirt'][1])
    g = r.get('glasses')
    if g:
        c.glasses(shades=g != 'clear', lens='#88AACC' if g in ('clear', 'shades') else g)
    if 'hat' in r:
        c.hat(*r['hat'])
    return c


if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..', 'out', 'chars'))
