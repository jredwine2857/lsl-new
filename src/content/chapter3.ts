// Chapter 3: Summer of Love.
// Cincinnati. Larry follows a free-food sign into a protest zone, meets
// Ashleigh's niece Willow, and has to get them both out past Scut Farkus.

import { EGA, SKIN_DARK, dither, ellipse, person, poly, rect, stripes, text } from '../engine/gfx';
import { money, type Game } from '../engine/game';
import type { Content, Item, Room } from '../engine/types';
import { pamSave } from './pam';

const CONEY = 225;
const NAVY = '#000044';
const LIME = '#AAFF00';

const WAITRESS = { hair: EGA.red, top: EGA.lblue, pants: EGA.blue, accent: EGA.yellow, longHair: true, dress: true };
const MORANIS = { hair: EGA.dgray, top: EGA.lgray, pants: EGA.brown, accent: EGA.white, glasses: true };
const BARRY = { hair: EGA.black, skin: SKIN_DARK, top: EGA.lblue, pants: EGA.white, accent: EGA.white };
const ALICIA = { hair: EGA.yellow, top: EGA.yellow, pants: EGA.lgray, accent: EGA.white, longHair: true, dress: true };
const WILLOW = { hair: EGA.lmagenta, top: EGA.green, pants: EGA.blue, accent: EGA.yellow, longHair: true };
const BRAYDEN = { hair: EGA.yellow, top: EGA.black, pants: EGA.lgray, accent: EGA.lred, glasses: true };
const FARKUS = { hair: EGA.red, top: EGA.brown, pants: EGA.dgray, accent: EGA.yellow };
const GROVER = { hair: EGA.brown, top: EGA.green, pants: EGA.dgray, accent: EGA.lgreen };

const has = (g: Game, f: string) => !!g.flag(f);

function cycle(g: Game, key: string, lines: string[]): string {
  const n = g.bump(key);
  return lines[Math.min(n, lines.length - 1)];
}

function canceled(g: Game, what: string) {
  g.die(
    `${what}\n\nThe Zone's Security Council convenes on the spot. The vote is unanimous, mostly because the council is one guy in a coonskin cap.\n\nLarry Laffer has been CANCELED.`,
    'CANCELED',
    true,
  );
}

// ---------------------------------------------------------------- items

const items: Item[] = [
  {
    id: 'wallet',
    name: 'a 1992 wallet',
    names: ['wallet', 'money', 'cash', 'blockbuster card', 'lubber', 'condom'],
    look: (g) => `Velcro. ${money(g.s.cash)}, an expired Blockbuster card and the 1987 lubber, now on its second time zone.`,
  },
  {
    id: 'phone',
    name: 'a Pear phone',
    names: ['phone', 'pear phone', 'smartphone', 'cell', 'iphone', 'app', 'apps'],
    look: (g) => (has(g, 'readFee')
      ? 'A screenshot of the Love Collective donation page, with the fine print circled: "40% SOLIDARITY FEE. Remaining funds support Founder Mobility (G-Wagon lease)."'
      : 'Your Pear phone. Ashleigh has texted: "Willow is at the Summer of Love thing in Washington Park. Please bring her home before she gives somebody her trust fund. Pink hair, nose ring, tote bag."'),
  },
  {
    id: 'kriscard',
    name: "Kris's business card",
    names: ['card', 'business card', 'kris card', 'number', 'kris'],
    look: (g) => `KRIS. Momager. Gold embossed. "Call me before you do anything stupid. Or after. Mostly after."\n\nLifeline calls left: ${g.lifelinesLeft()}.`,
  },
  {
    id: 'coney',
    name: 'a cheese coney',
    names: ['coney', 'cheese coney', 'hot dog', 'hotdog', 'food', 'chili dog'],
    look: 'A Skyline cheese coney: a tiny hot dog buried under chili, mustard, onions and a small mountain of fluorescent shredded cheddar. It weighs about four pounds.',
  },
  {
    id: 'soap',
    name: 'a bar of Lifebuoy soap',
    names: ['soap', 'lifebuoy', 'bar', 'bar of soap'],
    look: 'A red bar of Lifebuoy, the soap every mother in 1940s Indiana used on a dirty mouth. It smells like a hospital that is disappointed in you.',
  },
  {
    id: 'football',
    name: 'a wet football',
    names: ['football', 'ball', 'pigskin'],
    look: 'A soaking wet football with a faded Lions logo and a signature: BARRY SANDERS.',
  },
  {
    id: 'cardboard',
    name: 'a piece of cardboard',
    names: ['cardboard', 'sign', 'poster', 'board'],
    look: 'A blank square of cardboard and the community Sharpie, which you have technically stolen from the community.',
  },
];

// ---------------------------------------------------------------- rooms

const skyline: Room = {
  id: 'skyline',
  title: 'Skyline Chili, Over-the-Rhine',
  public: true,
  walk: { x: 6, y: 150, w: 308, h: 49 },
  describe: "Skyline Chili in Cincinnati's Over-the-Rhine. The big oval Skyline sign glows over a navy-tiled counter, a steaming chili vat, and a waitress who has heard every joke about \"ways.\" A small man in glasses sits at the counter looking hungry and a little lost. An old TV plays a rerun, and a sign is taped in the front window. The door to Vine Street is to the right.",
  hotspots: [
    { id: 'waitress', names: ['waitress', 'woman', 'server', 'counter', 'dottie'], rect: { x: 83, y: 98, w: 14, h: 40 }, look: 'Her name tag says "DOTTIE, 31 YEARS." She has the forearms of a woman who has ladled a billion pounds of chili.' },
    { id: 'moranis', names: ['moranis', 'rick', 'rick moranis', 'man', 'small man', 'guy'], rect: { x: 163, y: 120, w: 14, h: 40 }, look: 'Is that Rick Moranis? It is. Rick Moranis is sitting at a Skyline counter in Cincinnati, patting his pockets like a man who has misplaced his wallet in another country.' },
    { id: 'tv', names: ['tv', 'television', 'rerun', 'wkrp', 'show'], rect: { x: 236, y: 24, w: 44, h: 32 }, look: (g) => { g.award('lookTv'); return 'WKRP in Cincinnati, the Thanksgiving episode. Live turkeys rain from a helicopter onto a shopping center. Mr. Carlson stares into the camera:\n\n"As God is my witness, I thought turkeys could fly."\n\nYou haven\'t seen this since 1978. You tear up a little.'; } },
    { id: 'sign', names: ['sign', 'window', 'flyer', 'poster', 'free food'], rect: { x: 18, y: 24, w: 70, h: 60 }, look: (g) => { g.award('lookSign'); return 'A hand-painted flyer: "FREE FOOD! SUMMER OF LOVE! WASHINGTON PARK! ALL WELCOME (VIBES REQUIRED)."\n\nFree food AND love. Larry hasn\'t been this excited since the Carter administration.'; } },
    { id: 'logo', names: ['logo', 'oval', 'skyline sign', 'skyline', 'big sign'], rect: { x: 112, y: 13, w: 100, h: 42 }, look: 'The Skyline sign: a glowing oval with the Cincinnati skyline across the top, "Skyline" in neon lime script and "CHILI" on a red bar. It has looked down on a million 3-ways and judged none of them.' },
    { id: 'menu', names: ['menu', 'board', 'screens', 'ways', 'chili', 'vat'], rect: { x: 112, y: 58, w: 170, h: 16 }, look: `The menu screens: CHEESE CONEY ${money(CONEY)}. 3-WAY (spaghetti, chili, cheese). 4-WAY (add onions or beans). 5-WAY (add both). In smaller letters, underlined twice: "THERE IS NO 6-WAY."` },
  ],
  zones: [
    { id: 'toPark', rect: { x: 306, y: 150, w: 14, h: 49 }, enter: (g) => g.goto('park', 20, 172) },
  ],
  draw(ctx, _g, t) {
    // back wall: navy tile band with menu screens over beige tile
    rect(ctx, '#CCBBAA', 0, 10, 320, 140);
    for (let y = 74; y < 122; y += 8) rect(ctx, '#AA9988', 0, y, 320, 1);
    for (let x = 0; x < 320; x += 16) rect(ctx, '#AA9988', x, 74, 1, 48);
    rect(ctx, NAVY, 96, 58, 224, 16);
    for (let i = 0; i < 4; i++) {
      rect(ctx, EGA.white, 112 + i * 44, 60, 38, 12);
      rect(ctx, EGA.blue, 112 + i * 44, 60, 38, 3);
    }
    // soffit and the big oval sign
    rect(ctx, EGA.lgray, 96, 10, 224, 48);
    ellipse(ctx, NAVY, 162, 34, 52, 21);
    ellipse(ctx, EGA.black, 162, 34, 49, 19);
    ellipse(ctx, EGA.lblue, 162, 25, 36, 8);
    for (const [x, h] of [[132, 5], [138, 8], [144, 6], [150, 11], [156, 7], [162, 13], [168, 8], [174, 10], [180, 6], [186, 8], [192, 5]] as [number, number][]) rect(ctx, EGA.black, x, 32 - h, 5, h);
    text(ctx, 'Skyline', 162, 29, LIME, 12, 'center');
    rect(ctx, EGA.red, 140, 43, 46, 7);
    text(ctx, 'C H I L I', 163, 44, EGA.white, 5, 'center');
    // window with the flyer
    dither(ctx, EGA.lcyan, EGA.cyan, 14, 22, 78, 66);
    rect(ctx, EGA.yellow, 22, 28, 62, 48);
    text(ctx, 'FREE', 30, 32, EGA.red, 9);
    text(ctx, 'FOOD!', 30, 44, EGA.red, 9);
    text(ctx, 'SUMMER OF LOVE', 25, 60, EGA.magenta, 5);
    text(ctx, 'WASHINGTON PARK', 25, 67, EGA.black, 5);
    // chrome pendant lamps
    for (const x of [130, 190, 250]) { rect(ctx, EGA.lgray, x, 74, 1, 10); ellipse(ctx, EGA.lgray, x, 86, 6, 3); rect(ctx, EGA.yellow, x - 3, 88, 6, 1); }
    // TV
    rect(ctx, EGA.dgray, 236, 24, 44, 32);
    rect(ctx, EGA.lcyan, 240, 28, 36, 24);
    const ty = 28 + ((t * 18) % 22);
    rect(ctx, EGA.brown, 250, ty, 4, 3);
    rect(ctx, EGA.brown, 264, 28 + ((t * 18 + 11) % 22), 4, 3);
    text(ctx, 'WKRP', 246, 46, EGA.black, 5);
    // vat and waitress behind the counter
    rect(ctx, EGA.lgray, 30, 102, 30, 24);
    ellipse(ctx, EGA.brown, 45, 102, 15, 3);
    if (Math.floor(t * 2) % 2) rect(ctx, EGA.white, 42, 92, 2, 6);
    person(ctx, 90, 138, WAITRESS);
    // counter and stools
    rect(ctx, NAVY, 0, 122, 320, 24);
    for (let x = 0; x < 320; x += 5) rect(ctx, '#222277', x, 125, 1, 21);
    rect(ctx, EGA.white, 0, 122, 320, 3);
    for (let x = 30; x < 300; x += 34) { rect(ctx, EGA.dgray, x + 4, 146, 2, 10); ellipse(ctx, EGA.red, x + 5, 146, 6, 2); }
    // floor
    stripes(ctx, EGA.lgray, EGA.white, 0, 150, 320, 50, 6);
    person(ctx, 170, 160, MORANIS, 'up');
    // door
    rect(ctx, EGA.brown, 300, 60, 20, 90);
    text(ctx, 'VINE', 302, 64, EGA.white, 5);
  },
  handle(g, cmd) {
    if (cmd.is('buy') || cmd.is(['eat', 'get'], 'chili', 'way', '3 way', '4 way', '5 way', '6 way', 'six way')) {
      if (cmd.about('6 way', 'six way', '6', 'six', 'sixway', '6way')) {
        if (!g.needNear('waitress', 70)) return true;
        g.die('"One six-way, please."\n\nDottie sets down her ladle. The restaurant goes silent. Somewhere a jukebox scratches.\n\n"There is no six-way," she says. "But for you, hon, the cook will try."\n\nWhat comes out of the kitchen has spaghetti, chili, cheese, onions, beans, garlic, a second chili, and what may be a Cincinnati-style shoe. You finish it out of pride. Pride is the last thing to go.', 'SIX WAYS TO DIE', true);
        return true;
      }
      if (cmd.about('3 way', '4 way', '5 way', 'three way', 'four way', 'five way', 'way', 'spaghetti')) {
        if (!g.needNear('waitress', 70)) return true;
        g.say(`Dottie points to the board with her ladle. "Nine bucks and up, sugar." You have ${money(g.s.cash)}. You are a coney man today.`);
        return true;
      }
      if (cmd.about('coney', 'cheese coney', 'hot dog', 'hotdog', 'chili dog', 'food') || cmd.words.length === 0 || cmd.about('chili')) {
        if (!g.needNear('waitress', 70)) return true;
        if (g.has('coney') || has(g, 'gaveConey')) { g.say('"One per customer, hon. We\'re not made of cheese." (They are mostly made of cheese.)'); return true; }
        if (g.s.cash < CONEY) { g.say('You can\'t afford it.'); return true; }
        g.s.cash -= CONEY;
        g.give('coney');
        g.award('buyConey');
        g.say(`Dottie slides a cheese coney down the counter like a bartender in a western. It stops exactly in front of you.\n\n${money(CONEY)}. You have ${money(g.s.cash)} left, and four pounds of cheddar.`);
        return true;
      }
    }
    if (cmd.is(['talk', 'ask'], 'moranis', 'rick', 'rick moranis', 'man', 'small man', 'guy')) {
      if (!g.needNear('moranis', 50)) return true;
      g.award('talkMoranis');
      g.say(has(g, 'gaveConey')
        ? cycle(g, 'rickAfter', [
          '"Don\'t thank me. Thank my mother. She used that soap on me every time I said \'darn.\' I said \'darn\' a lot."',
          '"I don\'t act much anymore. I just turn up places. People seem to like it when I turn up places."',
        ])
        : cycle(g, 'rickBefore', [
          '"Oh! Hi. I\'m, uh, Rick. I came all the way from Canada for a coney and I left my wallet in Canada. Which is a whole country away. That\'s the problem with countries."',
          '"I\'m not going to ask you to buy me a coney. That would be rude. I\'m just going to sit here and look at the coneys. Respectfully."',
        ]));
      return true;
    }
    if (cmd.is(['give', 'show'], 'coney', 'cheese coney', 'hot dog', 'hotdog', 'food', 'chili dog')) {
      if (!g.has('coney')) return false;
      if (!g.needNear('moranis', 50)) return true;
      g.drop('coney');
      g.give('soap');
      g.set('gaveConey');
      g.award('giveConey');
      g.say('Rick looks at the coney, then at you, then at the coney, with the gratitude of a man rescued from a desert island.\n\nHe eats it in four very polite bites. Then he digs in his jacket. "I can\'t pay you back. But here. I always carry one of these. You never know when somebody\'s going to need their mouth washed out."\n\nHe hands you a bar of Lifebuoy soap. It is somehow the perfect thing. It always is, with Rick.');
      return true;
    }
    if (cmd.is('eat', 'coney', 'hot dog', 'hotdog', 'cheese coney')) {
      if (!g.has('coney')) return false;
      g.say('You raise the coney to your mouth. Rick Moranis makes a tiny, involuntary noise of longing. You can\'t do it.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'waitress', 'dottie', 'woman', 'server')) {
      if (!g.needNear('waitress', 70)) return true;
      g.say(cycle(g, 'dottie', [
        '"What\'ll it be, hon? And before you ask: yes, it\'s chili on spaghetti. No, it\'s not like Texas chili. Yes, people from Texas yell at me about it. Daily."',
        '"That protest in the park? Free food, they say. Funny thing. They buy it all from us and then charge a donation."',
      ]));
      return true;
    }
    if (cmd.is('flirt') && g.near('waitress', 70)) {
      g.say('You tell Dottie she\'s got "a real five-way personality." She ladles a little chili onto your shoe without breaking eye contact.');
      return true;
    }
    return false;
  },
};

const park: Room = {
  id: 'park',
  title: 'Washington Park',
  public: true,
  walk: { x: 4, y: 150, w: 312, h: 50 },
  describe: (g) =>
    `Washington Park, across from Music Hall. A splash fountain sprays in the middle of the lawn${g.has('football') || has(g, 'juke') ? '' : ', with a football bobbing in it'}. A man in a Lions jersey throws passes to some kids, and a woman in a yellow plaid blazer runs a vegan tent. The Cincinnati streetcar hums along the tracks at the bottom of the park. Skyline is to the west; drum circles thump to the east.`,
  hotspots: [
    { id: 'fountain', names: ['fountain', 'water', 'splash', 'splash fountain'], rect: { x: 120, y: 118, w: 72, h: 32 }, look: (g) => (g.has('football') || has(g, 'juke') ? 'The splash fountain. Kids are running through it screaming. You remember when that used to be you, at Lefty\'s, at closing time.' : 'The splash fountain. A football with a Lions logo bobs in the middle of it, just out of the kids\' reach.') },
    { id: 'football', names: ['football', 'ball', 'pigskin'], rect: { x: 150, y: 128, w: 10, h: 8 }, visible: (g) => !g.has('football') && !has(g, 'juke'), look: 'A football, bobbing in the fountain like a very slow Lions drive.' },
    { id: 'barry', names: ['barry', 'barry sanders', 'sanders', 'man', 'jersey', 'football player', 'player'], rect: { x: 225, y: 128, w: 14, h: 40 }, look: 'It\'s Barry Sanders. Hall of Fame running back. Arguably the greatest broken-field runner who ever lived, now in a Cincinnati park, throwing passes to kids who have no idea who he is.' },
    { id: 'alicia', names: ['alicia', 'alicia silverstone', 'silverstone', 'woman', 'blazer', 'cher'], rect: { x: 55, y: 126, w: 14, h: 40 }, look: 'Alicia Silverstone, in a yellow plaid blazer, handing out vegan chili samples and the occasional withering look.' },
    { id: 'tent', names: ['tent', 'vegan tent', 'vegan', 'samples', 'booth'], rect: { x: 26, y: 96, w: 80, h: 30 }, look: 'A tent with a sign: "VEGAN CHILI. IT\'S NOT SAD, IT\'S JUST BEANS."' },
    { id: 'tracks', names: ['tracks', 'streetcar', 'trolley', 'connector', 'street'], rect: { x: 0, y: 186, w: 320, h: 14 }, look: 'The Cincinnati Bell Connector streetcar. It runs on a 3.6-mile loop forever, like a dog chasing a very specific tail.' },
    { id: 'musichall', names: ['music hall', 'hall', 'building'], rect: { x: 100, y: 20, w: 120, h: 70 }, look: 'Music Hall, a red-brick Victorian castle. Legend says it\'s haunted. Legend also says it was built on a cemetery. Cincinnati legends are a lot.' },
  ],
  zones: [
    { id: 'toSkyline', rect: { x: 0, y: 150, w: 8, h: 36 }, enter: (g) => g.goto('skyline', 296, 172) },
    { id: 'toZone', rect: { x: 308, y: 150, w: 12, h: 36 }, enter: (g) => g.goto('zone', 20, 172) },
    { id: 'tracks', rect: { x: 0, y: 188, w: 320, h: 12 }, enter: (g) => pamSave(g, 'You step onto the streetcar tracks to admire Music Hall.\n\nA bell clangs. A blonde in a red lifeguard jacket vaults a park bench, tackles you onto the grass and rolls you clear as the streetcar glides past at a gentle eleven miles an hour.\n\n"It goes ELEVEN miles an hour, Larry." It\'s Pamela Anderson. She\'s in Cincinnati rescuing a pig named Porkopolis. The pig is wearing a tiny cardigan.\n\n"Love you, mean it, look both ways." She\'s gone before you can propose. (She won\'t be there next time.)', { x: g.s.x, y: 176 }) || g.die('You step onto the streetcar tracks to admire Music Hall.\n\nThe Cincinnati Bell Connector hits you at a gentle eleven miles an hour, which is still more than enough. The driver dings the bell twice, out of respect.', 'END OF THE LINE', true) },
  ],
  draw(ctx, g, t) {
    rect(ctx, EGA.lcyan, 0, 10, 320, 80);
    // Music Hall
    rect(ctx, EGA.red, 100, 30, 120, 60);
    poly(ctx, EGA.red, [[100, 30], [130, 14], [190, 14], [220, 30]]);
    rect(ctx, EGA.brown, 156, 20, 8, 70);
    for (let x = 108; x < 216; x += 14) rect(ctx, EGA.lgray, x, 44, 6, 12);
    ellipse(ctx, EGA.yellow, 160, 38, 7, 7);
    // trees
    for (const tx of [20, 250, 296]) { rect(ctx, EGA.brown, tx + 6, 70, 4, 30); ellipse(ctx, EGA.green, tx + 8, 66, 16, 14); }
    // lawn
    dither(ctx, EGA.green, EGA.lgreen, 0, 90, 320, 96);
    // path and tracks
    rect(ctx, EGA.lgray, 0, 150, 320, 36);
    rect(ctx, EGA.dgray, 0, 186, 320, 14);
    rect(ctx, EGA.lgray, 0, 190, 320, 1);
    rect(ctx, EGA.lgray, 0, 196, 320, 1);
    // tent
    poly(ctx, EGA.white, [[26, 126], [66, 96], [106, 126]]);
    rect(ctx, EGA.lgreen, 30, 112, 72, 6);
    text(ctx, 'VEGAN', 52, 113, EGA.green, 5);
    person(ctx, 62, 166, ALICIA);
    // fountain
    ellipse(ctx, EGA.lgray, 156, 140, 36, 10);
    ellipse(ctx, EGA.lblue, 156, 140, 32, 8);
    for (let i = 0; i < 6; i++) {
      const h = 10 + Math.abs(Math.sin(t * 3 + i)) * 12;
      rect(ctx, EGA.lcyan, 132 + i * 10, 138 - h, 2, h);
    }
    if (!g.has('football') && !has(g, 'juke')) ellipse(ctx, EGA.brown, 155, 134 + Math.sin(t * 2), 5, 3);
    // Barry and the kids
    person(ctx, 232, 166, BARRY, 'left', Math.floor(t) % 2);
    person(ctx, 276, 168, { hair: EGA.black, top: EGA.lred, pants: EGA.blue }, 'left');
    const sx = ((t * 30) % 520) - 140;
    rect(ctx, EGA.red, sx, 178, 90, 16);
    rect(ctx, EGA.lcyan, sx + 6, 181, 78, 5);
    text(ctx, 'CONNECTOR', sx + 20, 188, EGA.white, 5);
  },
  handle(g, cmd) {
    if (cmd.is('get', 'football', 'ball', 'pigskin')) {
      if (g.has('football') || has(g, 'juke')) return false;
      if (!g.needNear('fountain', 30)) return true;
      g.give('football');
      g.award('getFootball');
      g.say('You wade into the splash fountain in your leisure suit. A geyser fires straight up your pant leg. The kids cheer.\n\nYou come out soaked, triumphant, holding a football.');
      return true;
    }
    if (cmd.is(['give', 'show', 'throw'], 'football', 'ball', 'pigskin')) {
      if (!g.has('football')) return false;
      if (!g.needNear('barry', 60)) return true;
      g.drop('football');
      g.set('juke');
      g.award('giveFootball');
      g.award('learnJuke');
      g.say('Barry catches the ball one-handed without looking. "Appreciate you, man. The kids threw it in there twenty minutes ago and nobody wanted to get wet."\n\nYou tell him about the protest zone and the guy who won\'t let anybody leave.\n\n"Then don\'t go through him," Barry says. "Go around him. Watch." He plants a foot, his hips go one way, his shoulders go the other, and for a second there seem to be two Barry Sanderses.\n\n"Plant. Look left. Go right. Never make the same cut twice." He has you practice until the kids are bored.\n\nYou have learned THE JUKE.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'barry', 'barry sanders', 'sanders', 'player', 'man') || (cmd.is('ask') && cmd.about('juke', 'farkus', 'escape'))) {
      if (!g.needNear('barry', 60)) return true;
      g.award('talkBarry');
      g.say(has(g, 'juke')
        ? '"Plant, look left, go right. And when you get past him? Don\'t celebrate. Just hand the ball to the ref. Act like you\'ve been there."'
        : cycle(g, 'barry', [
          '"Hey. Barry. I\'m here for a charity flag football game. I retired at 30 in 1999 and people still ask me why. Honestly? I just didn\'t want to get tackled anymore."',
          '"Those kids threw my ball in the fountain and now nobody wants to go in after it. Me included. These shoes are suede."',
        ]));
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'alicia', 'silverstone', 'woman', 'cher', 'alicia silverstone')) {
      if (!g.needNear('alicia', 60)) return true;
      g.award('talkAlicia');
      g.say(cycle(g, 'alicia', [
        '"Ugh. As IF." She looks you up and down. "Okay, wait. Is that suit 100% polyester? That\'s... technically vegan. I hate that I respect it."',
        '"Willow? Pink hair, nose ring? She\'s my friend. She\'s about to give her entire trust fund to the Love Collective. Their founder drives a G-Wagon to the protest. A G-WAGON. Get me proof and she\'ll listen. She doesn\'t listen to me, I\'m \'performative.\'"',
        '"The zone\'s got one rule: you have to know the chant. It\'s on the banner. Do not freestyle, Larry. Nobody wants your freestyle."',
      ]));
      return true;
    }
    if (cmd.is(['eat', 'get', 'buy'], 'vegan chili', 'samples', 'sample', 'chili')) {
      if (!g.needNear('alicia', 60)) return true;
      g.say('You try the vegan chili. It\'s... good? You feel strange. You feel like a man who might, some day, eat a salad.');
      return true;
    }
    if (cmd.is('flirt')) {
      if (g.near('alicia', 60)) { g.say('You tell Alicia she\'s "totally Clueless about how hot she is." She holds up one hand like a stop sign. "AS IF." Then she hands you a pamphlet about lentils.'); return true; }
      if (g.near('barry', 60)) { g.say('Barry jukes your flirtation so cleanly you end up complimenting a trash can.'); return true; }
      return false;
    }
    if (cmd.is(['bathe', 'go', 'ride'], 'fountain', 'water', 'splash')) {
      if (!g.needNear('fountain', 30)) return true;
      g.say('You run through the splash fountain. It\'s the most fun you\'ve had sober since 1975.');
      return true;
    }
    return false;
  },
};

const zone: Room = {
  id: 'zone',
  title: 'The Summer of Love Zone',
  public: true,
  walk: { x: 4, y: 150, w: 312, h: 50 },
  describe: (g) =>
    `The "Summer of Love Autonomous Vibe Zone": four tents, two drum circles and a banner. ${has(g, 'willowWoke') ? 'Willow is packing up her tote bag.' : 'A young woman with pink hair, a nose ring and a tote bag is collecting donations.'} A guy in a $900 "Eat the Rich" T-shirt sells merch out of the back of a white G-Wagon. A pile of cardboard sits by the drums. The checkpoint out is to the east.`,
  hotspots: [
    { id: 'banner', names: ['banner', 'chant', 'slogan', 'words'], rect: { x: 20, y: 16, w: 280, h: 22 }, look: (g) => { g.award('lookBanner'); return 'The official chant, painted on a bedsheet:\n\n"WHAT DO WE WANT? VIBES!\nWHEN DO WE WANT THEM? EVENTUALLY!"\n\nUnderneath, smaller: "Unauthorized chants will be reviewed by the Security Council."'; } },
    { id: 'drums', names: ['drums', 'drum circle', 'circle', 'drummers', 'protesters', 'crowd'], rect: { x: 26, y: 128, w: 84, h: 30 }, look: 'A drum circle with no discernible rhythm. One drummer has been playing the same bongo for nine days. His name is either Sky or Skyy.' },
    { id: 'willow', names: ['willow', 'girl', 'woman', 'pink hair', 'niece', 'her', 'nose ring'], rect: { x: 143, y: 130, w: 14, h: 40 }, look: (g) => (has(g, 'willowWoke') ? 'Willow, red-eyed but determined, rolling up her own banner: "WILLOW\'S KITCHEN: ACTUALLY FREE FOOD."' : 'Willow: pink hair, a nose ring, a tote bag that says "SHE/HER/HOPEFUL," and the biggest heart in Ohio. She is holding a donation bucket and beaming at everyone.') },
    { id: 'brayden', names: ['brayden', 'guy', 'man', 'merch guy', 'founder', 'seller'], rect: { x: 183, y: 128, w: 14, h: 40 }, look: 'Brayden, founder of the Love Collective. Tousled hair, $400 sunglasses, a T-shirt reading "EAT THE RICH" in a font that costs money. He calls everyone "fam."' },
    { id: 'gwagon', names: ['gwagon', 'g wagon', 'g', 'mercedes', 'truck', 'car', 'suv'], rect: { x: 205, y: 112, w: 82, h: 44 }, look: 'A white Mercedes G-Wagon with a "COEXIST" bumper sticker and a QR code taped to the back window: "DONATE TO THE MOVEMENT."' },
    { id: 'qr', names: ['qr', 'qr code', 'code', 'donation', 'donations', 'app', 'fine print', 'page'], rect: { x: 246, y: 120, w: 16, h: 16 }, look: 'A QR code labeled "DONATE TO THE MOVEMENT." You could scan it with your phone.' },
    { id: 'hoodies', names: ['hoodie', 'hoodies', 'merch', 'rack', 'shirts'], rect: { x: 290, y: 118, w: 24, h: 32 }, look: 'A rack of black hoodies: "ABOLISH CAPITALISM. $90. Card only."' },
    { id: 'cardboard', names: ['cardboard', 'pile', 'boxes', 'signs'], rect: { x: 112, y: 160, w: 22, h: 10 }, visible: (g) => !g.has('cardboard'), look: 'A pile of blank cardboard and a community Sharpie on a string. "MAKE YOUR OWN SIGN!"' },
  ],
  zones: [
    { id: 'toPark', rect: { x: 0, y: 150, w: 8, h: 50 }, enter: (g) => g.goto('park', 296, 172) },
    { id: 'toCheckpoint', rect: { x: 308, y: 150, w: 12, h: 50 }, enter: (g) => g.goto('checkpoint', 20, 172) },
  ],
  draw(ctx, g, t) {
    rect(ctx, EGA.lcyan, 0, 10, 320, 90);
    // brick row houses of Over-the-Rhine
    for (let i = 0; i < 6; i++) {
      const x = i * 54;
      rect(ctx, i % 2 ? EGA.red : EGA.brown, x, 40, 52, 70);
      for (let w = 0; w < 3; w++) rect(ctx, EGA.white, x + 6 + w * 16, 52, 8, 12);
    }
    // banner
    rect(ctx, EGA.white, 20, 16, 280, 22);
    text(ctx, 'WHAT DO WE WANT? VIBES!', 160, 18, EGA.magenta, 7, 'center');
    text(ctx, 'WHEN DO WE WANT THEM? EVENTUALLY!', 160, 28, EGA.blue, 6, 'center');
    rect(ctx, EGA.dgray, 18, 16, 2, 94);
    rect(ctx, EGA.dgray, 300, 16, 2, 94);
    // ground
    dither(ctx, EGA.green, EGA.brown, 0, 110, 320, 40);
    stripes(ctx, EGA.lgray, EGA.dgray, 0, 150, 320, 50, 10);
    // tents
    for (const [tx, c] of [[30, EGA.lmagenta], [80, EGA.yellow]] as [number, string][]) poly(ctx, c, [[tx, 128], [tx + 18, 104], [tx + 36, 128]]);
    // drum circle
    for (let i = 0; i < 4; i++) {
      const bob = Math.floor(t * 4 + i) % 2;
      rect(ctx, EGA.brown, 32 + i * 20, 146 - bob, 8, 10);
      ellipse(ctx, EGA.white, 36 + i * 20, 146 - bob, 4, 1);
    }
    // cardboard
    if (!g.has('cardboard')) { rect(ctx, EGA.brown, 112, 162, 22, 8); rect(ctx, '#CC9966', 114, 160, 18, 4); }
    // G-Wagon
    rect(ctx, EGA.white, 205, 112, 82, 40);
    rect(ctx, EGA.lcyan, 212, 118, 26, 14);
    rect(ctx, EGA.black, 246, 120, 16, 16);
    rect(ctx, EGA.white, 249, 123, 4, 4);
    rect(ctx, EGA.white, 255, 129, 4, 4);
    rect(ctx, EGA.dgray, 212, 150, 14, 8);
    rect(ctx, EGA.dgray, 266, 150, 14, 8);
    text(ctx, 'COEXIST', 268, 140, EGA.blue, 5);
    // hoodie rack
    rect(ctx, EGA.dgray, 290, 118, 24, 2);
    for (let i = 0; i < 3; i++) rect(ctx, EGA.black, 292 + i * 7, 121, 6, 26);
    person(ctx, 190, 166, BRAYDEN, 'left');
    person(ctx, 150, 168, WILLOW, has(g, 'willowWoke') ? 'right' : 'down', has(g, 'willowWoke') ? 0 : Math.floor(t) % 2);
    if (!has(g, 'willowWoke')) rect(ctx, EGA.yellow, 157, 150, 6, 8);
  },
  handle(g, cmd) {
    if (cmd.is(['chant', 'sing', 'shout']) || (cmd.is('say') && cmd.about('vibes', 'vibe', 'eventually', 'what do we want'))) {
      if (cmd.about('vibes', 'vibe', 'eventually', 'what do we want') || cmd.words.length === 0) {
        if (cmd.words.length === 0 && !has(g, 'chanted')) { g.say('Chant what? There\'s a banner for that.'); return true; }
        if (has(g, 'chanted')) { g.say('"VIBES! EVENTUALLY!" The drummers nod at you. You\'re one of them now. Mostly.'); return true; }
        g.set('chanted');
        g.award('chant');
        g.say('You read the banner and bellow, in your best lounge-singer baritone:\n\n"WHAT DO WE WANT?"\nThe whole zone: "VIBES!"\n"WHEN DO WE WANT THEM?"\n"EVENTUALLY!"\n\nThe drum circle finds a rhythm for the first time in nine days. Sky (or Skyy) weeps. The pink-haired girl with the donation bucket turns and looks at you like you\'re a stray dog who just did a trick.');
        return true;
      }
      if (cmd.is('sing')) { g.say('You croon a few bars of "Feelings." The drum circle drowns you out, as is its right.'); return true; }
      const slogan = cmd.rest.trim().toUpperCase();
      canceled(g, `You throw your fist in the air and freestyle: "${slogan}!"\n\nThe drums stop. Sky (or Skyy) slowly lowers his bongo. Somebody whispers "is that a dog whistle?" Somebody else whispers "is that a CRYPTO thing?" Nobody can agree what it means, so everybody agrees it's problematic.`);
      return true;
    }
    if (cmd.is(['look', 'use', 'scan', 'read'], 'qr', 'qr code', 'code', 'fine print', 'donation page', 'page', 'app') || cmd.is('scan') || (cmd.is('use', 'phone') && g.near('qr', 50))) {
      if (!g.needNear('qr', 50)) return true;
      if (has(g, 'readFee')) { g.say('You already have the screenshot. It\'s in your phone, right next to 900 photos of your thumb.'); return true; }
      g.set('readFee');
      g.award('readFee');
      g.say('You scan the QR code. The Love Collective donation page loads: rainbows, raised fists, and a big DONATE button.\n\nYou\'re 68. You read the fine print. Nobody reads the fine print.\n\n"A 40% SOLIDARITY FEE applies to all donations. Remaining funds support Founder Mobility (lease payments, Mercedes-Benz G 550), Founder Wellness (Tulum), and the Movement."\n\nYou take a screenshot. For once in your life, you have evidence that you are right.');
      return true;
    }
    if (cmd.is('donate') || cmd.is(['give', 'use'], 'bucket', 'donation')) {
      if (!g.needNear('willow', 60) && !g.near('qr', 50)) return true;
      g.say(`You consider donating your ${money(g.s.cash)}. Then you remember you're the guy who actually reads the fine print. Maybe read it first.`);
      return true;
    }
    if (cmd.is(['buy', 'wear'], 'hoodie', 'hoodies', 'merch', 'shirt', 'sweatshirt') || (cmd.is('buy') && !cmd.words.length)) {
      if (!g.needNear('brayden', 70) && !g.near('hoodies', 50)) return true;
      canceled(g, 'You buy a $90 "ABOLISH CAPITALISM" hoodie. Brayden only takes cards, so you tap your Pear phone.\n\nThe receipt prints. It\'s three feet long. "SUBTOTAL $90.00. SOLIDARITY FEE $36.00. SERVICE FEE $14.00. SUGGESTED TIP 30%."\n\nYou put the hoodie on. It still has the tag: "MADE IN A FACTORY YOU DON\'T WANT TO KNOW ABOUT." A teenager films you reading it. The caption: "Boomer buys revolution on credit."');
      return true;
    }
    if (cmd.is('get', 'cardboard', 'pile', 'sign', 'signs')) {
      if (g.has('cardboard')) return false;
      if (!g.needNear('cardboard', 40)) return true;
      g.give('cardboard');
      g.say('You take a square of cardboard and the community Sharpie. You feel the creative spirit of 1968 flowing through you. This is a mistake.');
      return true;
    }
    if (cmd.is(['write', 'make', 'use', 'hold', 'draw', 'show'], 'sign', 'cardboard', 'sharpie', 'marker', 'poster') || cmd.is(['write', 'make'])) {
      if (!g.has('cardboard')) { g.say('On what? Your suit? Larry, no.'); return true; }
      canceled(g, 'You have one chance to say something meaningful to the movement. You uncap the Sharpie and write, in big block letters:\n\n"HONK IF YOU\'RE SINGLE"\n\nYou hold it up at the edge of Vine Street. A Metro bus honks. Then a pickup truck. Then the entire Cincinnati Bengals tailgate parade. Three hundred horns. Nobody here is single anymore, Larry, they\'re "intentionally unpartnered."');
      return true;
    }
    if (cmd.is(['show', 'give', 'use'], 'phone', 'screenshot', 'proof', 'evidence', 'fine print', 'fee') && g.near('willow', 60) && has(g, 'talkedWillow') && !has(g, 'willowWoke')) {
      if (!has(g, 'readFee')) { g.say('You show Willow your phone. It\'s a photo of your thumb. She smiles politely. Maybe find something worth showing her first.'); return true; }
      g.set('willowWoke');
      g.award('showWillow');
      g.say('You hand Willow your phone with the screenshot. "Fine print. Nobody reads it but old guys and lawyers."\n\nShe reads it. Then she reads it again. She looks over at the G-Wagon, where Brayden is on FaceTime with what is obviously a yacht broker.\n\n"Forty percent," she whispers. "I gave them my whole summer. My aunt\'s birthday money. I was going to give them my TRUST FUND."\n\nShe dumps the donation bucket into her tote. "Okay. New plan. I\'m opening a soup kitchen. Actually free food, no solidarity fee. Get me out of here, Larry. The Security Council doesn\'t let anybody leave."');
      return true;
    }
    if ((cmd.is(['talk', 'ask']) && cmd.about('willow', 'girl', 'woman', 'niece', 'her', 'pink hair')) || (cmd.is('talk') && !cmd.words.length && g.near('willow', 60))) {
      if (!g.needNear('willow', 60)) return true;
      if (!has(g, 'chanted')) {
        g.say('The pink-haired girl smiles right through you. "Sorry, I only talk to people in the movement. No offense. You look like a tourist. Or a cop. Or a tourist cop."');
        return true;
      }
      g.set('talkedWillow');
      g.award('talkWillow');
      g.say(has(g, 'willowWoke')
        ? cycle(g, 'willowAfter', [
          '"Willow\'s Kitchen. Over-the-Rhine. Skyline will donate the chili, I already asked Dottie. Alicia\'s doing a vegan pot. You\'re doing dishes."',
          '"The checkpoint is east. Scut runs the Security Council. He\'s a bully. He was a bully in fourth grade, too. We were in fourth grade together. He\'s 31."',
        ])
        : cycle(g, 'willowBefore', [
          '"Oh my gosh, you\'re LARRY! Aunt Ashleigh\'s date! She said you were a fraud. A nice fraud. I\'m Willow. Do you want to donate to the Love Collective? It goes straight to the movement."',
          '"I\'m giving them my trust fund on Friday. Brayden says money is a construct. He says it while getting his G-Wagon detailed, but still."',
          '"Alicia says it\'s a scam. Alicia says everything is a scam. Alicia once said her own oat milk was a scam. She was right, but still."',
        ]));
      return true;
    }
    if (cmd.is('flirt')) {
      if (g.near('willow', 60)) {
        canceled(g, 'You lean on her donation bucket and say, "Hey there. You know, I dated your aunt, but I\'d really like to get to know the whole family."\n\nWillow, who is 24, makes a noise like a kettle. The drum circle stops. Several hundred phones rise like sunflowers.');
        return true;
      }
      if (g.near('brayden', 70)) { g.say('You wink at Brayden. He winks back and tries to sell you a hoodie. You both feel used.'); return true; }
      return false;
    }
    if (cmd.is(['talk', 'ask'], 'brayden', 'guy', 'man', 'founder', 'seller', 'merch guy')) {
      if (!g.needNear('brayden', 70)) return true;
      g.award('talkBrayden');
      g.say(cycle(g, 'brayden', [
        '"Fam! Welcome to the Zone. Hoodie? Ninety bucks. Card only. Cash is, like, so colonial."',
        '"The G-Wagon? It\'s a mobile organizing platform, fam. The heated seats are for solidarity."',
        '"Scut handles security. I handle vision. Vision is harder. You wouldn\'t understand. You\'re very old."',
      ]));
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'drums', 'drummer', 'drummers', 'sky', 'skyy', 'crowd', 'protesters')) {
      if (!g.needNear('drums', 50)) return true;
      g.say('"Hey man," says Sky (or Skyy). "Nine days. My hands don\'t work anymore. I can\'t stop. If I stop, the vibes stop."');
      return true;
    }
    if (cmd.is(['ride', 'open', 'get'], 'gwagon', 'g wagon', 'mercedes', 'car', 'truck')) {
      g.say('Locked. On the dashboard is a parking permit for a yacht club and a copy of "The Communist Manifesto (Leather-Bound Collector\'s Edition)."');
      return true;
    }
    return false;
  },
};

const checkpoint: Room = {
  id: 'checkpoint',
  title: 'The Checkpoint',
  public: true,
  walk: { x: 4, y: 150, w: 312, h: 50 },
  describe: (g) =>
    (has(g, 'farkusGone')
      ? 'The checkpoint, abandoned. A coonskin cap lies in a puddle. Vine Street and freedom are to the east.'
      : 'The zone\'s only exit: a barricade of shipping pallets and a hand-lettered sign, "SECURITY COUNCIL. LEAVING IS VIOLENCE." Guarding it is a big redheaded guy with yellow eyes and a coonskin cap, and a small weaselly sidekick who giggles at everything he says.') +
    (has(g, 'willowWoke') ? ' Willow is right behind you, clutching her tote bag.' : ''),
  hotspots: [
    { id: 'farkus', names: ['farkus', 'scut', 'scut farkus', 'bully', 'guard', 'man', 'redhead', 'council', 'security'], rect: { x: 255, y: 130, w: 14, h: 40 }, visible: (g) => !has(g, 'farkusGone'), look: (g) => { g.award('lookFarkus'); return has(g, 'farkusDown') ? 'Scut Farkus, sitting in a puddle, coonskin cap askew, with his mouth open in shock. He is about to say something unforgivable.' : 'Scut Farkus. Yellow eyes. Coonskin cap. Chairman, CEO and sole member of the Summer of Love Security Council. Wherever there\'s a playground, a comment section, or a protest, there\'s a Scut Farkus running it.'; } },
    { id: 'grover', names: ['grover', 'grover dill', 'dill', 'sidekick', 'weasel'], rect: { x: 283, y: 134, w: 14, h: 38 }, visible: (g) => !has(g, 'farkusGone'), look: 'Grover Dill, Farkus\'s sidekick. His whole job is laughing at Farkus\'s jokes and filming people for the Council\'s Instagram.' },
    { id: 'barricade', names: ['barricade', 'pallets', 'sign', 'exit', 'gate'], rect: { x: 240, y: 108, w: 16, h: 44 }, look: (g) => (has(g, 'farkusGone') ? 'The barricade has been kicked aside. The sign now says "LEAVING IS VIOLENCE" with "VIOLENCE" crossed out and "FINE" written in Sharpie.' : 'Pallets, zip ties and a sign: "SECURITY COUNCIL. LEAVING IS VIOLENCE. EXIT DONATION: EVERYTHING."') },
  ],
  zones: [
    { id: 'toZone', rect: { x: 0, y: 150, w: 8, h: 50 }, enter: (g) => g.goto('zone', 296, 172) },
    {
      id: 'barricade',
      rect: { x: 238, y: 150, w: 12, h: 50 },
      enter: (g) => {
        if (has(g, 'farkusGone')) return;
        g.stop();
        g.s.x = 232;
        g.say(has(g, 'farkusDown')
          ? 'Farkus is down but not out. He grabs your ankle from the puddle. "Nobody leaves!"'
          : 'Farkus steps in front of you and pokes you in the chest. "Where do you think you\'re going, Grandpa? Leaving is violence. Exit donation is everything you own."\n\nGrover giggles. "Everything!"');
      },
    },
    {
      id: 'freedom',
      rect: { x: 308, y: 150, w: 12, h: 50 },
      enter: (g) => {
        if (!has(g, 'willowWoke')) { g.s.x = 296; g.say('You can\'t leave without Willow. You promised Ashleigh. You\'ve never kept a promise to a woman before, and you\'d like to try one.'); return; }
        g.award('ending');
        g.win(`You and Willow walk out onto Vine Street. Nobody stops you. Behind you, the drum circle finally stops, too. Sky (or Skyy) lies down on the grass and sleeps for eleven hours.\n\nBy September, Willow's Kitchen is open in Over-the-Rhine. Dottie sends chili every Tuesday. Alicia does a vegan pot that nobody admits they like. Rick Moranis turns up, washes dishes for a week, and leaves without saying goodbye. Barry Sanders stops by and refuses to take a selfie, then takes forty.\n\nThe Love Collective's G-Wagon is repossessed on a Wednesday. Brayden announces a podcast.\n\nWillow hugs you at the airport. "You know you're not a bad guy, Larry? You just need to listen more."\n"Everybody keeps saying that."\n"Maybe listen to that."\n\nYour phone buzzes. It's Kris: "Larry. Snoop Dogg saw your Vintage King photos. He wants you in Long Beach. Don't do anything stupid."\n\nYou will absolutely do something stupid.\n\nCONTINUED IN CHAPTER 4: LONG BEACH CYPHER.\n\nFinal score: ${g.s.score} of ${g.maxScore}.`);
      },
    },
  ],
  draw(ctx, g, t) {
    rect(ctx, EGA.lcyan, 0, 10, 320, 100);
    for (let i = 0; i < 6; i++) {
      const x = i * 54;
      rect(ctx, i % 2 ? EGA.brown : EGA.red, x, 30, 52, 80);
      for (let w = 0; w < 3; w++) for (let r = 0; r < 2; r++) rect(ctx, EGA.white, x + 6 + w * 16, 40 + r * 22, 8, 12);
    }
    rect(ctx, EGA.dgray, 0, 110, 320, 40);
    stripes(ctx, EGA.lgray, EGA.dgray, 0, 150, 320, 50, 10);
    text(ctx, 'VINE ST', 280, 116, EGA.lgreen, 6);
    if (has(g, 'farkusGone')) {
      poly(ctx, EGA.brown, [[230, 152], [246, 140], [262, 152]]);
      ellipse(ctx, EGA.lblue, 266, 178, 14, 4);
      rect(ctx, EGA.brown, 262, 172, 10, 5);
    } else {
      for (let i = 0; i < 4; i++) rect(ctx, EGA.brown, 240, 112 + i * 10, 16, 8);
      rect(ctx, EGA.white, 234, 96, 30, 14);
      text(ctx, 'LEAVING IS', 236, 98, EGA.red, 4);
      text(ctx, 'VIOLENCE', 238, 104, EGA.red, 4);
      if (has(g, 'farkusDown')) {
        ellipse(ctx, EGA.lblue, 262, 172, 16, 4);
        person(ctx, 262, 176, FARKUS, 'left');
      } else {
        person(ctx, 262, 170, FARKUS, 'left', Math.floor(t * 2) % 2);
      }
      if (!has(g, 'farkusDown')) { rect(ctx, EGA.brown, 255, 128, 14, 5); rect(ctx, EGA.brown, 268, 130, 3, 9); }
      person(ctx, 290, 172, GROVER, 'left');
    }
    if (has(g, 'willowWoke')) person(ctx, 30, 168, WILLOW, 'right');
  },
  handle(g, cmd) {
    if (has(g, 'farkusGone')) return false;
    if (cmd.is('juke') || cmd.is(['go', 'dodge', 'fake', 'spin'], 'farkus', 'around', 'past', 'scut') || cmd.is(['dodge', 'fake', 'spin'])) {
      if (!g.needNear('farkus', 40)) return true;
      if (!has(g, 'juke')) {
        g.say('You try a fancy move. Your hip makes a noise like a stepped-on Lego. Farkus laughs. Grover laughs harder, to be safe.');
        return true;
      }
      if (has(g, 'farkusDown')) { g.say('Never make the same cut twice. Barry said so. He\'s already down, finish it.'); return true; }
      g.set('farkusDown');
      g.award('jukeFarkus');
      g.say('Farkus lunges for you. You plant. You look left. You go right.\n\nFor one glorious second, there are two Larry Laffers. Farkus tackles the one that isn\'t there, sails through the air like a WKRP turkey, and lands face-first in a puddle.\n\nGrover stops giggling. Farkus sits up, dripping, and opens his mouth to call you something truly unforgivable.');
      return true;
    }
    if (cmd.is(['use', 'give', 'bathe', 'push', 'put'], 'soap', 'lifebuoy', 'mouth', 'bar') || cmd.is('bathe', 'farkus', 'scut', 'mouth')) {
      if (!g.has('soap')) { g.say('With what? You need something to wash that mouth out with.'); return true; }
      if (!g.needNear('farkus', 40)) return true;
      if (!has(g, 'farkusDown')) {
        g.say('You wave the soap at Farkus. He grabs your wrist and twists it. "Uncle. Say uncle." You say uncle. He lets go, laughing. You\'ll need to get him off his feet first.');
        return true;
      }
      g.drop('soap');
      g.set('farkusGone');
      g.award('soapFarkus');
      g.say('Before he can finish the word, you jam the bar of Lifebuoy right in there, the way every mother in Indiana did in 1940.\n\nFarkus gags. He sputters. Bubbles come out of his nose. "You... you\'re not ALLOWED! That\'s... that\'s..."\n"Hygiene," you say.\n\nScut Farkus bursts into tears, shouts "I\'m TELLING," and runs off down Vine Street with Grover behind him. The Security Council has been dissolved.\n\nWillow slow-claps. So do the drummers. Somewhere, a man in glasses nods once and does not know why.');
      return true;
    }
    if ((cmd.is(['push', 'fight']) && cmd.about('farkus', 'scut', 'bully', 'him', 'guard')) || cmd.is('fight')) {
      if (!g.needNear('farkus', 40)) return true;
      g.die('You put up your dukes like it\'s a 1930s boxing poster.\n\nFarkus puts you in a headlock, gives you a noogie that removes several layers of scalp, and makes you say "uncle" while Grover livestreams it to 40,000 people. Then he sits on you. He is a large man and he sits for a long time.', 'SAY UNCLE', true);
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'farkus', 'scut', 'bully', 'guard', 'man', 'council') || (cmd.is('talk') && !cmd.words.length && g.near('farkus', 40))) {
      if (!g.needNear('farkus', 50)) return true;
      g.award('talkFarkus');
      g.say(cycle(g, 'farkus', [
        '"I\'m the Security Council. I keep the zone safe. From people leaving. Leaving is violence. Wanna know what else is violence? Your suit."',
        '"You think I\'m a bully? I\'m not a bully. I\'m a COMMUNITY SAFETY AMBASSADOR. Grover, tell him."\nGROVER: "He\'s an ambassador!"',
        '"You know what I did to the last guy who tried to leave? I made him say uncle. In front of everybody. Then I made him say aunt."',
      ]));
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'grover', 'dill', 'sidekick')) {
      if (!g.needNear('grover', 60)) return true;
      g.say('Grover giggles. "Scut\'s gonna get you! He\'s gonna GET you!" He doesn\'t say how. Grover never knows how.');
      return true;
    }
    if (cmd.is('donate') || cmd.is(['give', 'buy'], 'money', 'cash', 'wallet', 'everything', 'donation')) {
      if (!g.needNear('farkus', 50)) return true;
      g.say(`You offer Farkus your entire net worth: ${money(g.s.cash)}. He looks at it, then at you, with pity. "Keep it, Grandpa. You need it more than the movement."\n\nHe still doesn't let you leave.`);
      return true;
    }
    return false;
  },
};

// ---------------------------------------------------------------- global

export const chapter3: Content = {
  title: 'Leisure Suit Larry: Woke Up Broke',
  chapter: 'Chapter 3: Summer of Love',
  startRoom: 'skyline',
  start: { x: 40, y: 176 },
  startInventory: ['wallet', 'phone', 'kriscard'],
  startCash: 343,
  startFlags: { phoneOnline: true, hasIdea: true },
  rooms: [skyline, park, zone, checkpoint],
  items,
  points: {
    lookSign: 2, lookTv: 3, talkMoranis: 3, buyConey: 4, giveConey: 6,
    talkBarry: 2, talkAlicia: 4, getFootball: 3, giveFootball: 4, learnJuke: 3,
    enterZone: 2, lookBanner: 2, chant: 8, talkWillow: 4, talkBrayden: 2, readFee: 8, showWillow: 10,
    lookFarkus: 2, talkFarkus: 2, jukeFarkus: 8, soapFarkus: 8, ending: 10,
  },
  lifeline: {
    item: 'kriscard',
    max: 3,
    label: 'Calling Kris...',
    rescue: (g, used) => {
      const lines = [
        'Kris answers from a private jet. "Cincinnati? Why are you in Cincinnati? Nevermind." A local news anchor, a crisis PR firm and a Bengals linebacker arrive within minutes. By dinner, the whole thing is a heartwarming segment about "a confused grandpa." You\'re back where you were.',
        '"Again, Larry? Fine." Kris sends Khloé, who livestreams herself eating a 5-way. Cincinnati forgets you exist. That\'s a gift.',
        'Kris sighs. "Last one this chapter." A tasteful apology, a donation to a real soup kitchen and a photo-op with a rescued pig later, it never happened.',
      ];
      return `${lines[Math.min(used - 1, lines.length - 1)]}\n\nLifeline calls left: ${g.lifelinesLeft()}.`;
    },
  },
  intro: [
    'LEISURE SUIT LARRY: WOKE UP BROKE\n\nChapter 3: Summer of Love',
    'Cincinnati, Ohio.\n\nAshleigh asked one favor: check on her niece Willow, who has joined a "Summer of Love" protest and is about to give away her trust fund. Kris had a jet headed this way anyway.\n\nLarry has $3.43, a phone, Kris\'s card, and a powerful hunger. He also has no idea what chili on spaghetti is. He\'s about to learn.\n\n(Type HELP for instructions. Save often.)',
  ],
  handle(g, cmd) {
    if (cmd.is(['call', 'use'], 'kris', 'card', 'business card', 'momager')) {
      g.say(`Kris picks up. "Larry, I'm in a meeting with three networks. Save my calls for emergencies." (${g.lifelinesLeft()} lifeline calls left. They work when you die.)`);
      return true;
    }
    if (cmd.is('juke')) { g.say(has(g, 'juke') ? 'You juke a pigeon. It falls for it. Save it for someone who deserves it.' : 'You don\'t know how. You need a teacher. Preferably a Hall of Famer.'); return true; }
    if (cmd.is(['chant', 'write'])) { g.say('Not here. Save it for the protest.'); return true; }
    if (cmd.is('flirt')) { g.say("There's nobody here worth getting canceled over."); return true; }
    return false;
  },
  hint(g) {
    if (!g.has('soap') && !has(g, 'farkusGone')) {
      if (!g.has('coney')) return 'Rick Moranis is hungry and broke. You have $3.43. ORDER CONEY from the waitress.';
      return 'GIVE CONEY to Rick.';
    }
    if (!has(g, 'juke')) return g.has('football') ? 'Give the football to Barry Sanders.' : 'Barry Sanders lost his football in the fountain in Washington Park. GET FOOTBALL.';
    if (!has(g, 'chanted')) return 'Nobody in the zone will talk to you until you know the chant. LOOK BANNER, then CHANT VIBES.';
    if (!has(g, 'talkedWillow')) return 'TALK TO WILLOW, the girl with the pink hair.';
    if (!has(g, 'readFee')) return 'Alicia says you need proof. SCAN the QR code on the G-Wagon and read the fine print.';
    if (!has(g, 'willowWoke')) return 'SHOW PHONE to Willow.';
    if (!has(g, 'farkusDown')) return 'Scut Farkus guards the exit. Don\'t fight him. JUKE him, like Barry taught you.';
    if (!has(g, 'farkusGone')) return 'Farkus is about to say something filthy. USE SOAP.';
    return 'Walk east onto Vine Street with Willow.';
  },
};

zone.enter = (g) => g.award('enterZone');
