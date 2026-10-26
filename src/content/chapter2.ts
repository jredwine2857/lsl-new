// Chapter 2: Filter Bubble.
// Larry lands at LAX, gets his first real Swipr date, and meets the family
// that will keep saving his bacon for the rest of the game.

import { drawWatcher, watcherHotspot, WATCH_LOOK, WATCH_SPOTS } from './watcher';
import { EGA, SKIN_DARK, ellipse, person, rect } from '../engine/gfx';
import { backdrop, prop } from '../engine/art';
import { money, type Game } from '../engine/game';
import type { Content, Item, Room } from '../engine/types';
import { pamSave, pamScenes } from './pam';

const BILL = 41200;

const ROGER = { sprite: 'roger', hair: EGA.yellow, top: EGA.lgray, pants: EGA.lgray, accent: EGA.blue };
const ATTENDANT = { sprite: 'attendant', hair: EGA.black, top: EGA.blue, pants: EGA.blue, accent: EGA.lred, longHair: true, dress: true };
const KRIS = { sprite: 'kris', hair: EGA.black, top: EGA.white, pants: EGA.white, accent: EGA.yellow, glasses: true };
const KIM = { sprite: 'kim', hair: EGA.black, top: '#CCAA88', pants: '#CCAA88', longHair: true, dress: true };
const KHLOE = { sprite: 'khloe', hair: EGA.yellow, top: EGA.black, pants: EGA.black, longHair: true };
const CAITLYN = { sprite: 'caitlyn', hair: EGA.brown, top: EGA.lgray, pants: EGA.blue, longHair: true };
const PAPARAZZO = { sprite: 'paparazzo', hair: EGA.dgray, top: EGA.brown, pants: EGA.dgray, accent: EGA.black, bald: true };
const ASHLEIGH = { sprite: 'ashleigh', hair: EGA.brown, top: EGA.lmagenta, pants: EGA.blue, longHair: true, glasses: true };
const WAITER = { sprite: 'waiter', hair: EGA.black, skin: SKIN_DARK, top: EGA.white, pants: EGA.black, accent: EGA.red };

const has = (g: Game, f: string) => !!g.flag(f);

function cycle(g: Game, key: string, lines: string[]): string {
  const n = g.bump(key);
  return lines[Math.min(n, lines.length - 1)];
}

function canceled(g: Game, what: string) {
  g.die(
    `${what}\n\nSomebody was filming. Somebody is always filming. By the time you blink, you're trending under #LAXLarry, and not in the good way.\n\nLarry Laffer has been CANCELED.`,
    'CANCELED',
    true,
  );
}

// ---------------------------------------------------------------- items

const items: Item[] = [
  {
    id: 'wallet',
    name: 'a 1992 wallet',
    names: ['wallet', 'money', 'cash', 'card', 'blockbuster card', 'lubber', 'condom'],
    look: (g) => `Velcro. ${money(g.s.cash)}, an expired Blockbuster card and the 1987 lubber, which made it through TSA because the scanner refused to believe it.`,
  },
  {
    id: 'phone',
    name: 'a Pear phone',
    names: ['phone', 'pear phone', 'smartphone', 'cell', 'iphone', 'app', 'apps', 'swipr'],
    look: (g) => (has(g, 'matched')
      ? 'Swipr says: DATE TONIGHT with Ashleigh, 29, at Encounter in the LAX Theme Building. Her photos show a willowy blonde lit like a perfume ad.'
      : 'Your Pear phone, on airport Wi-Fi. Swipr, Wayno, Pear Pay. Try SWIPE.'),
  },
  {
    id: 'sq',
    name: 'Space Quest XII',
    names: ['space quest', 'space quest xii', 'sq', 'sq12', 'space'],
    look: 'Space Quest XII, the box that gave you your billion-dollar idea. The back still says "the richest janitor in the galaxy."',
  },
  {
    id: 'spray',
    name: 'a can of Spot-B-Gone',
    names: ['spray', 'spot b gone', 'spotbgone', 'can', 'cleaner', 'stain remover'],
    look: 'Spot-B-Gone, "Industrial Strength, Approved for Starship Use." The label has a cartoon of a janitor fighting a space slime.',
  },
  {
    id: 'kriscard',
    name: "Kris's business card",
    names: ['card', 'business card', 'kris card', 'number', 'kris'],
    look: (g) => `KRIS. Momager. Just the one name and a phone number, embossed in gold.\n\nOn the back, handwritten: "Call me before you do anything stupid. Or after. Mostly after."\n\nLifeline calls left: ${g.lifelinesLeft()}.`,
  },
  {
    id: 'wristband',
    name: 'a VIP wristband',
    names: ['wristband', 'band', 'bracelet', 'vip', 'vip wristband'],
    look: 'A gold wristband: THEME BUILDING GRAND REOPENING - VIP - KARDASHIAN GUEST LIST. Everything is comped. Everything.',
  },
];

// ---------------------------------------------------------------- rooms

const gate: Room = {
  id: 'gate',
  title: 'LAX, Gate 42',
  public: true,
  walk: { x: 6, y: 146, w: 308, h: 53 },
  describe: "LAX. You've just landed on a Spirit-adjacent airline whose snack was a single Biscoff cookie, most of which is now on your lapel. Through the windows you can see the Theme Building, the flying saucer on legs in the middle of the airport. A flight attendant stands at the jet bridge, a janitor mops near a broken moving walkway, and the exit to the arrivals curb is to the right.",
  hotspots: [
    { id: 'janitor', names: ['janitor', 'man', 'roger', 'wilco', 'roger wilco', 'cleaner', 'mop'], rect: { x: 224, y: 128, w: 16, h: 40 }, look: 'A middle-aged janitor with a blond flattop, a gray jumpsuit and a thousand-yard stare that has seen several galaxies. His name tag says "R. WILCO, SANITATION ENGINEER (SPACE)".' },
    { id: 'attendant', names: ['attendant', 'flight attendant', 'stewardess', 'woman', 'crew'], rect: { x: 52, y: 128, w: 16, h: 40 }, look: 'A flight attendant who has already been awake for 19 hours and does not want your feedback about the cookie.' },
    { id: 'windows', names: ['window', 'windows', 'theme building', 'saucer', 'plane', 'airport'], rect: { x: 80, y: 20, w: 200, h: 80 }, look: (g) => { g.award('lookTheme'); return 'The Theme Building: a 1961 flying saucer on four giant arches, the most Space Quest thing ever built by humans. A banner on it reads "GRAND REOPENING TONIGHT."'; } },
    { id: 'walkway', names: ['walkway', 'moving walkway', 'travelator', 'belt'], rect: { x: 120, y: 150, w: 90, h: 10 }, look: 'The moving walkway has been "temporarily out of service" since 2019. A sign apologizes for the inconvenience in nine languages.' },
    watcherHotspot(WATCH_SPOTS['ch2-gate'], WATCH_LOOK),
  ],
  zones: [
    { id: 'toCurb', rect: { x: 306, y: 146, w: 14, h: 53 }, enter: (g) => g.goto('curb', 20, 166) },
  ],
  draw(ctx, _g, t) {
    backdrop(ctx, 'ch2-gate');
    drawWatcher(ctx, WATCH_SPOTS['ch2-gate'], t);
    person(ctx, 60, 166, ATTENDANT);
    person(ctx, 232, 168, ROGER, 'left', Math.floor(t * 2) % 2);
    // mop and bucket
    rect(ctx, EGA.brown, 220, 140, 1, 28);
    rect(ctx, EGA.white, 216, 166, 8, 3);
    rect(ctx, EGA.yellow, 244, 158, 10, 10);
  },
  handle(g, cmd) {
    if (cmd.is(['talk', 'ask'], 'janitor', 'man', 'roger', 'wilco', 'roger wilco') || (cmd.is('talk') && !cmd.words.length && g.near('janitor', 50))) {
      if (!g.needNear('janitor', 50)) return true;
      g.award('talkRoger');
      g.say(cycle(g, 'rogerTalk', [
        '"Name\'s Roger. I used to save the galaxy. Twice a year, sometimes more. Then the franchise went dormant and the union said janitorial was \'adjacent experience.\'"',
        '"See that stain on your lapel? I could get that out. I\'ve cleaned Sarien goo off a Deltaur. A Biscoff cookie is nothing."',
        '"Don\'t touch the walkway. It ate a guy in 2021. Still in there somewhere, going nowhere."',
      ]));
      return true;
    }
    if (cmd.is(['show', 'give'], 'space quest', 'sq', 'box', 'game')) {
      if (!g.has('sq')) return false;
      if (!g.needNear('janitor', 50)) return true;
      if (g.has('spray')) { g.say('Roger looks at the box again and gets misty. "Still the richest janitor in the galaxy. Some day."'); return true; }
      g.give('spray');
      g.award('giveSq');
      g.say('Roger takes the box like it\'s a holy relic. "Space Quest TWELVE? They made a twelve? Am I in it?" He flips it over. "...I\'m the richest janitor in the galaxy."\n\nHe hands it back, then presses a can into your hand. "Spot-B-Gone. Approved for starship use. Go get that stain, buddy."');
      return true;
    }
    if (cmd.is('flirt') && g.near('attendant', 60)) {
      canceled(g, 'You lean on the jet bridge and tell the flight attendant you\'d like to "join the Mile High Club, retroactively."\n\nShe presses a button. The whole terminal hears your line over the PA.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'attendant', 'flight attendant', 'stewardess', 'woman')) {
      if (!g.needNear('attendant', 60)) return true;
      g.say('"Welcome to Los Angeles. Please collect all your belongings, your dignity, and the cookie on your lapel."');
      return true;
    }
    if (cmd.is(['use', 'ride'], 'walkway', 'moving walkway', 'belt')) {
      g.say('You step onto the moving walkway. It does not move. You stand there for a while, out of respect.');
      return true;
    }
    return false;
  },
};

const curb: Room = {
  id: 'curb',
  title: 'LAX Arrivals Curb',
  public: true,
  walk: { x: 4, y: 150, w: 312, h: 50 },
  describe: (g) =>
    `The arrivals curb. The glowing LAX pylons change color behind a wall of honking rideshares. A black SUV idles at the curb with three famous women and one famous momager beside it. ${has(g, 'viral') ? '' : 'A paparazzo with a giant lens is bored out of his mind. '}The Theme Building rises to the east, past a security rope. The terminal is to the west.`,
  hotspots: [
    { id: 'kris', names: ['kris', 'momager', 'kris jenner', 'woman'], rect: { x: 86, y: 130, w: 14, h: 40 }, look: 'Kris Jenner, on two phones at once, closing a deal on one and a different deal on the other. Her sunglasses cost more than your 1992.' },
    { id: 'kim', names: ['kim', 'kim kardashian'], rect: { x: 106, y: 130, w: 14, h: 40 }, look: 'Kim, in a beige dress that has its own publicist, studying for some kind of law exam on her phone.' },
    { id: 'khloe', names: ['khloe', 'khloé'], rect: { x: 126, y: 130, w: 14, h: 40 }, look: 'Khloé, the funny one, already laughing at your suit.' },
    { id: 'caitlyn', names: ['caitlyn', 'caitlyn jenner', 'jenner'], rect: { x: 146, y: 130, w: 14, h: 40 }, look: 'Caitlyn Jenner, gold medalist, who looks at your polyester with real professional respect. "Seventies," she says, nodding. "I know that era."' },
    { id: 'kardashians', names: ['kardashians', 'kardashian', 'family', 'jenners', 'women', 'them'], rect: { x: 84, y: 130, w: 78, h: 40 }, look: 'The Kardashian-Jenners: Kris, Kim, Khloé and Caitlyn, waiting for a driver who is clearly fired.' },
    { id: 'suv', names: ['suv', 'car', 'escalade', 'truck'], rect: { x: 56, y: 166, w: 80, h: 22 }, look: 'A black SUV with blacked-out windows and a license plate that just says "MOM."' },
    { id: 'paparazzo', names: ['paparazzo', 'photographer', 'pap', 'man', 'camera', 'lens'], rect: { x: 234, y: 130, w: 14, h: 40 }, look: (g) => (has(g, 'viral') ? 'The paparazzo is editing your photos with the giddy look of a man about to make rent.' : 'A paparazzo, waiting for anything at all to happen. "Nobody\'s doing anything interesting," he complains. "Everybody\'s just looking at their phones."') },
    { id: 'pylons', names: ['pylons', 'lights', 'lax sign', 'columns'], rect: { x: 0, y: 20, w: 320, h: 60 }, look: 'The LAX pylons: fifteen glowing towers that cycle colors to make you forget you\'ve been circling for forty minutes.' },
    { id: 'rope', names: ['rope', 'security', 'guard', 'theme building', 'east'], rect: { x: 280, y: 120, w: 40, h: 50 }, look: 'A velvet rope and a security guard with a clipboard. "Theme Building reopening. Wristbands only."' },
    { id: 'traffic', names: ['traffic', 'street', 'road', 'cars', 'rideshare', 'uber'], rect: { x: 0, y: 184, w: 320, h: 16 }, look: 'Bumper-to-bumper rideshares, all of them honking at each other, none of them yours.' },
  ],
  zones: [
    { id: 'traffic', rect: { x: 0, y: 186, w: 320, h: 14 }, enter: (g) => pamSave(g, 'You step off the curb into seventeen lanes of rideshares.\n\nFrom out of nowhere, a blonde in a red lifeguard jacket sprints down the curb in slow motion, scoops you up and drops you back on the sidewalk as a Prius whooshes past.\n\n"Twice in one week, Larry?" It\'s Pamela Anderson. She\'s at LAX to escort a rescued bear onto a flight to a sanctuary. The bear waves.\n\nShe kisses your forehead, says "Stay out of the road, sweetie," and vanishes into the crowd before you can propose. (She won\'t be there next time.)', { x: g.s.x, y: 172 }) || g.die('You step off the curb to wave down a cab like it\'s 1992.\n\nSeventeen rideshare drivers, all following the same GPS instruction, hit you at once. Every one of them gives you one star.', 'FIVE STAR PILEUP', true) },
    { id: 'toGate', rect: { x: 0, y: 150, w: 8, h: 36 }, enter: (g) => g.goto('gate', 296, 170) },
    {
      id: 'toTheme',
      rect: { x: 308, y: 150, w: 12, h: 36 },
      enter: (g) => {
        if (!g.has('wristband')) {
          g.s.x = 296;
          g.say('The guard stops you with a clipboard. "Theme Building grand reopening. Kardashian guest list only. Wristbands only."\n\nHe looks at your stained lapel. "And dress code."');
          return;
        }
        g.goto('theme', 40, 182);
      },
    },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch2-curb');
    // rideshare traffic crawling past the curb
    const cars = ['car-prius', 'car-taxi', 'car-shuttle', 'car-red', 'car-suv'];
    for (let i = 0; i < cars.length; i++) {
      const cx = ((t * 20 + i * 96) % 480) - 80;
      prop(ctx, cars[i], cx, 201);
    }
    // the family
    person(ctx, 93, 164, KRIS);
    person(ctx, 113, 164, KIM);
    person(ctx, 133, 164, KHLOE);
    person(ctx, 153, 164, CAITLYN);
    // paparazzo
    person(ctx, 241, 168, PAPARAZZO, 'left');
    rect(ctx, EGA.black, 228, 142, 8, 6);
    if (has(g, 'viral') && Math.floor(t * 3) % 4 === 0) rect(ctx, EGA.white, 224, 140, 6, 6);
    person(ctx, 304, 168, { sprite: 'security', hair: EGA.black, top: EGA.black, pants: EGA.black, accent: EGA.white, bald: true });
  },
  handle(g, cmd) {
    if (cmd.is(['talk', 'ask', 'pose'], 'paparazzo', 'photographer', 'pap', 'camera') || cmd.is('pose') || cmd.is(['show'], 'suit', 'outfit')) {
      if (!g.needNear('paparazzo', 60)) return true;
      if (has(g, 'viral')) { g.say('"Fifty million views, bro. You\'re the Vintage King. I\'m buying a boat."'); return true; }
      g.award('talkPaparazzo');
      if (!has(g, 'clean')) {
        g.say('You strike a disco pose. The paparazzo lowers his camera. "Dude. That stain on your lapel isn\'t vintage, it\'s evidence. Clean yourself up and maybe I\'ll shoot you."');
        return true;
      }
      g.set('viral');
      g.give('kriscard');
      g.give('wristband');
      g.award('viral');
      g.sfx('scratch');
      g.award('krisCard');
      g.say('You strike the pose you perfected at Lefty\'s in 1979: one hand on hip, one finger pointed at the sky.\n\nThe paparazzo goes off like a strobe light. Within four minutes your photo is everywhere. #VintageKing. A Gen Z fashion account calls you "unironically iconic."\n\nKris Jenner hangs up both phones and walks over. "You. White suit. I don\'t know who you are, but you\'ve got fifty million views and no management. That changes now."\n\nShe hands you her business card and slaps a VIP wristband on your arm. "Theme Building, tonight. You\'re on the list. And Larry? Call me before you do anything stupid."');
      return true;
    }
    if (cmd.is('flirt')) {
      if (g.near('kardashians', 50)) {
        canceled(g, 'You slide up to Kim and say, "Hey baby, I\'ve been to law school too. Well, I walked past one."\n\nKhloé laughs so hard she has to sit down in the SUV. Kim does not laugh. Kim\'s lawyers do not laugh.');
        return true;
      }
      return false;
    }
    if (cmd.is(['talk', 'ask'], 'caitlyn', 'jenner', 'caitlyn jenner')) {
      if (!g.needNear('kardashians', 60)) return true;
      g.award('talkCaitlyn');
      g.say('"1976. Montreal. I wore a lot of polyester that year too," Caitlyn says. "Here\'s my advice: stand up straight and act like you meant to wear it. Works for everything."');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'kris', 'kim', 'khloe', 'khloé', 'kardashians', 'kardashian', 'family', 'women', 'momager')) {
      if (!g.needNear('kardashians', 60)) return true;
      g.award('talkKardashians');
      if (has(g, 'viral')) {
        g.say(cycle(g, 'krisAfter', [
          'KRIS: "Theme Building tonight. Don\'t be late, don\'t be early, be exactly the right amount of fashionably late."',
          'KHLOÉ: "Mom already has a spinoff pitched. It\'s called \'Keeping Up With Larry.\' It\'s a cooking show, for some reason."',
          'KIM: "If you get in legal trouble, call Mom. If it\'s really bad, call me. I passed the bar. Eventually."',
        ]));
        return true;
      }
      g.say(cycle(g, 'krisBefore', [
        'KRIS doesn\'t look up from either phone. "Not now, sweetie. Unless you\'re trending, I can\'t see you."',
        'KHLOÉ: "Is that a costume? Mom, there\'s a man in a costume. He\'s, like, so committed."',
        'KIM: "Our driver quit to become an influencer. Everybody in LA becomes an influencer eventually. It\'s like a zombie movie."',
      ]));
      return true;
    }
    if (cmd.is(['ride', 'open'], 'suv', 'car', 'escalade')) {
      g.say('The door is locked. Through the tinted glass a bodyguard holds up a sign: "NO."');
      return true;
    }
    return false;
  },
};

const theme: Room = {
  id: 'theme',
  title: 'Encounter at the Theme Building',
  public: true,
  walk: { x: 6, y: 152, w: 308, h: 47 },
  describe: (g) =>
    `Encounter, the space-age restaurant inside the Theme Building, freshly reopened. Starburst lights, lava lamps, curved windows over the runways, and an elevator to the observation deck. ${has(g, 'matched') ? 'At a table by the window sits your Swipr date.' : 'Every table is taken by couples. You have no date.'} A waiter in a white jacket drifts between tables.`,
  hotspots: [
    { id: 'ashleigh', names: ['ashleigh', 'date', 'woman', 'girl', 'her', 'lady'], rect: { x: 168, y: 130, w: 16, h: 40 }, visible: (g) => has(g, 'matched'), look: (g) => { g.award('lookAshleigh'); return 'You compare her to her Swipr photos. The photos showed a willowy 29-year-old blonde with poreless skin, doe eyes and a golden retriever.\n\nThe woman at the table is a cheerful 52-year-old brunette in bifocals with a laugh like a car alarm. The golden retriever was borrowed. She seems lovely. She looks absolutely nothing like her pictures.'; } },
    { id: 'waiter', names: ['waiter', 'server', 'man', 'garcon'], rect: { x: 236, y: 130, w: 14, h: 40 }, look: 'The waiter wears a white jacket with a rocket on the pocket. His name tag says "ORBIT." It might be his real name. This is LA.' },
    { id: 'elevator', names: ['elevator', 'lift', 'observation deck', 'deck', 'door'], rect: { x: 270, y: 70, w: 34, h: 82 }, look: 'A brass elevator door marked OBSERVATION DECK. Best view of LA, according to a plaque. Second best view of a parking lot, according to Yelp.' },
    { id: 'windows', names: ['window', 'windows', 'runway', 'runways', 'view', 'lamp', 'lava lamp'], rect: { x: 20, y: 20, w: 240, h: 70 }, look: 'Planes land in a row of blinking lights. A lava lamp the size of a bodyguard burps slowly in the corner.' },
  ],
  zones: [
    { id: 'toCurb', rect: { x: 0, y: 152, w: 8, h: 47 }, enter: (g) => g.goto('curb', 294, 168) },
    {
      id: 'elevator',
      rect: { x: 272, y: 152, w: 30, h: 6 },
      enter: (g) => {
        if (!has(g, 'bonded')) { g.say('You can\'t leave your date sitting there. Even 1992 Larry knew that. Well, he knew it eventually.'); return; }
        if (!has(g, 'paid')) { g.say('The waiter steps in front of the elevator. "Sir. The check." He says "check" like a threat.'); return; }
        g.award('ending');
        g.win(`You and Ashleigh ride the elevator to the observation deck. All of Los Angeles glitters below like a phone screen at 3 a.m.\n\n"For the record," she says, "you look nothing like your pictures either."\n"My pictures were from 1987."\n"Mine were from Pinterest."\n\nYou laugh. Her phone buzzes. "Oh! My niece Willow is at some protest in Cincinnati. Free food, drum circles, a guy selling hoodies out of a G-Wagon. Could you check on her? Kris has a jet going that way. You'd fit right in. Or you'd get canceled. Either way, content."\n\nYour own phone buzzes. It's Kris: "Proud of you, Larry. Don't do anything stupid tomorrow."\n\nYou will absolutely do something stupid tomorrow.\n\nCONTINUED IN CHAPTER 3: SUMMER OF LOVE.\n\nFinal score: ${g.s.score} of ${g.maxScore}.`);
      },
    },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch2-theme');
    // LA twinkling far below
    for (let i = 0; i < 12; i++) rect(ctx, (i + Math.floor(t * 2)) % 3 ? EGA.yellow : EGA.white, 24 + i * 20, 82, 1, 1);
    // lava lamp blob
    ellipse(ctx, EGA.lred, 11, 132 + Math.sin(t) * 5, 2.5, 3.5);
    if (has(g, 'matched')) person(ctx, 176, 170, ASHLEIGH, 'left');
    person(ctx, 243, 168, WAITER, 'left', Math.floor(t) % 2);
  },
  handle(g, cmd) {
    const aboutHer = cmd.about('ashleigh', 'date', 'woman', 'girl', 'her', 'lady');
    if ((cmd.is(['talk', 'ask']) && aboutHer) || (cmd.is('talk') && !cmd.words.length && g.near('ashleigh', 50) && has(g, 'matched'))) {
      if (!has(g, 'matched')) { g.say('You\'re not on a date. You\'re a man alone at the Theme Building. Try SWIPE.'); return true; }
      if (!g.needNear('ashleigh', 50)) return true;
      g.award('talkAshleigh');
      g.say(has(g, 'bonded')
        ? cycle(g, 'ashTalk', [
          '"I run a dog-walking app. None of the dogs are mine, either. Honestly, the whole internet is borrowed dogs."',
          '"My niece Willow is a lot. Big heart, nose ring, wants to save everybody. You\'d like her. Platonically, Larry."',
        ])
        : '"Larry! You\'re... older than your photos. And also younger? Is that a 1987 photo?"\n\nShe smiles brightly, like someone daring you to say what you\'re both thinking.');
      return true;
    }
    if ((cmd.is(['say', 'ask', 'show', 'complain']) && cmd.about('pictures', 'photos', 'pics', 'filter', 'filters', 'look different', 'catfish', 'different', 'real')) || cmd.is('complain')) {
      if (!has(g, 'matched')) return false;
      if (cmd.about('profile', 'my', 'mine', '1987')) return false;
      canceled(g, 'You hold up your phone next to her face. "Uh, no offense, but you look NOTHING like your pictures."\n\nAshleigh calmly holds up HER phone, showing your profile photo: 1987 Larry, 41 years younger, in a hot tub, with hair.\n\n"Neither do you, Larry." She posts both photos side by side with the caption "Men are wild."');
      return true;
    }
    if (cmd.is(['show', 'say', 'confess', 'admit', 'laugh', 'use'], 'profile', 'my photo', 'my picture', 'my pic', '1987', 'phone', 'truth', 'swipr') || cmd.is(['laugh', 'confess', 'admit'])) {
      if (!has(g, 'matched') || has(g, 'bonded')) return false;
      if (!g.needNear('ashleigh', 50)) return true;
      g.set('bonded');
      g.award('confess');
      g.say('You turn your phone around and show her your own profile picture: you, 1987, in a hot tub, with hair.\n\n"Full disclosure. That photo is older than you think I think you are."\n\nAshleigh stares, then laughs so loud a pilot outside aborts a landing. She shows you her originals: a willowy model from Pinterest and a borrowed golden retriever.\n\n"We\'re both frauds, Larry."\n"Cheers to that."\n\nIt\'s the best date you\'ve had since the Reagan administration.');
      return true;
    }
    if (cmd.is('flirt')) {
      if (has(g, 'matched') && g.near('ashleigh', 60)) {
        if (!has(g, 'bonded')) {
          canceled(g, 'You skip the small talk and say, "So. Your place or the 1987 hot tub?"\n\nAshleigh is live-streaming the date. You didn\'t know. Her 3 million followers know now.');
          return true;
        }
        g.say('"Slow down, Vintage King," she laughs. "Dinner first."');
        return true;
      }
      return false;
    }
    if (cmd.is(['talk', 'ask'], 'waiter', 'server', 'orbit')) {
      if (!g.needNear('waiter', 60)) return true;
      g.award('talkWaiter');
      g.say(has(g, 'paid')
        ? '"Enjoy the deck. Don\'t lick the telescope. People lick the telescope."'
        : `"Welcome to Encounter. Tonight's tasting menu is $206 per person. Your table's check comes to ${money(BILL)}, including the 'reopening experience fee' and a 22% 'gratitude' surcharge."`);
      return true;
    }
    if (cmd.is(['buy', 'pay', 'order', 'show', 'give'], 'check', 'bill', 'food', 'dinner', 'menu', 'wristband', 'band', 'vip') || cmd.is('buy')) {
      if (!g.needNear('waiter', 70) && !g.near('ashleigh', 50)) return true;
      if (has(g, 'paid')) { g.say('It\'s all comped. Even your dignity is comped tonight.'); return true; }
      if (g.has('wristband') && (cmd.about('wristband', 'band', 'vip') || g.near('waiter', 70))) {
        g.set('paid');
        g.award('comp');
        g.sfx('cash');
        g.say(`The waiter sees the gold wristband and bows slightly. "Kardashian guest list. Of course. Everything is comped, sir. Including the gratitude."\n\nYou just ate a ${money(BILL)} dinner for ${money(0)}. Larry Laffer is finally living in America.`);
        return true;
      }
      g.say(`The check is ${money(BILL)}. You have ${money(g.s.cash)}. You're going to need connections.`);
      return true;
    }
    if (cmd.is(['dash', 'run', 'leave', 'go'], 'dine and dash', 'dash', 'without paying') || cmd.raw.toLowerCase().includes('dine and dash')) {
      g.die('You attempt a classic 1992 dine-and-dash, sprinting for the stairs in your leisure suit.\n\nThe Theme Building\'s legs are sixty feet tall and the stairs are closed for "historic preservation." Airport police corner you on the arch. It takes a helicopter and a very long press conference to get you down.', 'GROUNDED', true);
      return true;
    }
    if (cmd.is(['use', 'ride'], 'elevator', 'lift', 'deck')) {
      g.say('Walk to the elevator doors.');
      return true;
    }
    return false;
  },
};

// ---------------------------------------------------------------- global

export const chapter2: Content = {
  title: 'Leisure Suit Larry: Woke Up Broke',
  chapter: 'Chapter 2: Filter Bubble',
  startRoom: 'gate',
  scenes: pamScenes,
  start: { x: 40, y: 178 },
  startInventory: ['wallet', 'phone', 'sq'],
  startCash: 343,
  startFlags: { phoneOnline: true, hasIdea: true },
  rooms: [gate, curb, theme],
  items,
  points: {
    lookTheme: 2, talkRoger: 3, giveSq: 5, swipr: 6, lookStain: 2, clean: 5,
    talkPaparazzo: 3, viral: 10, krisCard: 5, talkKardashians: 3, talkCaitlyn: 3,
    enterTheme: 5, talkAshleigh: 3, lookAshleigh: 3, confess: 12, talkWaiter: 2,
    comp: 8, ending: 20,
  },
  lifeline: {
    item: 'kriscard',
    max: 3,
    label: 'Calling Kris...',
    rescue: (g, used) => {
      const lines = [
        'Kris answers on the first ring. "Larry, darling. Don\'t say another word."\n\nWithin ten minutes a lawyer, a crisis PR firm and a camera crew arrive. By sundown the incident is a teaser for next season and you\'re back where you were, a little shaken.',
        '"Again? Okay." Kris sends Khloé, who makes a joke so good everybody forgets what you did. The clip of HER goes viral instead.',
        'Kris sighs. "This is the last one this chapter, Larry." A private jet, a tasteful apology video and a donation to an animal shelter later, it never happened.',
      ];
      return `${lines[Math.min(used - 1, lines.length - 1)]}\n\nLifeline calls left: ${g.lifelinesLeft()}.`;
    },
  },
  intro: [
    'LEISURE SUIT LARRY: WOKE UP BROKE\n\nChapter 2: Filter Bubble',
    'Los Angeles International Airport.\n\nLarry has a phone, a big idea, $3.43, and a Biscoff cookie smeared across his lapel. Somewhere in this city is a date, a family of famous women, and the start of the richest man in America.\n\n(Type HELP for instructions. Save often.)',
  ],
  handle(g, cmd) {
    if (cmd.is(['use', 'swipe'], 'swipr', 'phone', 'right', 'left', 'app', 'dating') || cmd.is('swipe')) {
      if (has(g, 'matched')) { g.say('Swipr: "You have a date tonight at Encounter, Theme Building. Don\'t swipe while on a date. (You will.)"'); return true; }
      g.set('matched');
      g.award('swipr');
      g.say('You open Swipr and swipe right on everybody in a ten-mile radius.\n\nIT\'S A MATCH! "Ashleigh, 29. Dog mom. Pilates. Looking for my Player 2." Her photos: a willowy blonde with flawless skin and a golden retriever, lit like a perfume ad.\n\nShe messages instantly: "Encounter at the Theme Building, tonight? I hear it\'s reopening!"');
      return true;
    }
    if (cmd.is('look', 'stain', 'lapel', 'cookie', 'biscoff') || (cmd.is('look', 'suit') && !has(g, 'clean'))) {
      g.award('lookStain');
      g.say(has(g, 'clean') ? 'Spotless. Whiter than a TV dentist.' : 'A Biscoff cookie has fused to your lapel at the molecular level. It looks like you\'ve been shot with caramel.');
      return true;
    }
    if (cmd.is('use', 'spray', 'spot b gone', 'cleaner', 'can') || cmd.is(['clean', 'bathe'], 'suit', 'stain', 'lapel')) {
      if (!g.has('spray')) { g.say('You rub the stain with your thumb. Now your thumb has a stain too.'); return true; }
      if (has(g, 'clean')) { g.say('Your suit is already clean enough to perform surgery on.'); return true; }
      g.set('clean');
      g.award('clean');
      g.say('One blast of Spot-B-Gone and the cookie stain dissolves with a faint scream. Your suit is whiter than it has been since the Carter administration.');
      return true;
    }
    if (cmd.is(['call', 'use'], 'kris', 'card', 'business card', 'momager')) {
      if (!g.has('kriscard')) { g.say('You don\'t know anybody to call. You don\'t know anybody, period.'); return true; }
      g.say(`Kris picks up. "Larry, I'm saving my calls for emergencies, and so should you." (${g.lifelinesLeft()} lifeline calls left. They work when you die.)`);
      return true;
    }
    if (cmd.is('flirt')) { g.say("There's nobody here worth getting canceled over."); return true; }
    return false;
  },
  hint(g) {
    if (!has(g, 'matched')) return 'You have a dating app now. SWIPE.';
    if (!g.has('spray')) return 'That stain needs a professional. The janitor at the gate looks like he\'s cleaned up worse. He might like your Space Quest box.';
    if (!has(g, 'clean')) return 'USE SPRAY on your suit.';
    if (!has(g, 'viral')) return 'The paparazzo at the curb is bored. Give him something to shoot: POSE.';
    if (!has(g, 'bonded')) return 'Your date looks nothing like her pictures. Do yours? Maybe SHOW PROFILE instead of complaining.';
    if (!has(g, 'paid')) return 'Dinner is expensive. Your wristband says "everything is comped." SHOW WRISTBAND to the waiter.';
    return 'Take your date up to the observation deck. Walk to the elevator.';
  },
};

// The Theme Building's first visit is worth points; enter() fires on every visit.
theme.enter = (g) => g.award('enterTheme');
