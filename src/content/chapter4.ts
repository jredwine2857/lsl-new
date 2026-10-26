// Chapter 4: The Long Beach Cypher.
// Snoop's backyard rap battle, a Lakers kiss-cam, and #LarryToo, which Larry
// beats with receipts and a Drew Barrymore hug.

import { drawWatcher, watcherHotspot, WATCH_LOOK, WATCH_SPOTS } from './watcher';
import { EGA, SKIN_DARK, ellipse, person, rect, text } from '../engine/gfx';
import { backdrop, prop } from '../engine/art';
import { money, type Game } from '../engine/game';
import type { Content, Item, Room } from '../engine/types';
import type { Command } from '../engine/parser';
import { pamSave, pamScenes } from './pam';

const SEED = 1000000;

const AFFLECK = { sprite: 'affleck', hair: EGA.brown, top: EGA.dgray, pants: EGA.blue, accent: EGA.lred };
const COUSIN = { sprite: 'cousin', hair: EGA.black, skin: SKIN_DARK, top: EGA.blue, pants: EGA.blue, accent: EGA.white, bald: true };
const SNOOP = { sprite: 'snoop', hair: EGA.black, skin: SKIN_DARK, top: EGA.lblue, pants: EGA.lblue, accent: EGA.yellow, longHair: true };
const DRE = { sprite: 'dre', hair: EGA.black, skin: SKIN_DARK, top: EGA.black, pants: EGA.black, accent: EGA.white, bald: true, glasses: true };
const SANDLER = { sprite: 'sandler', hair: EGA.dgray, top: EGA.lred, pants: EGA.blue, accent: EGA.white };
const FILTR = { sprite: 'filtr', hair: EGA.yellow, top: EGA.lmagenta, pants: EGA.black, accent: EGA.lcyan, glasses: true };
const KAYDENCE = { sprite: 'kaydence', hair: EGA.yellow, top: EGA.white, pants: EGA.lmagenta, longHair: true };
const BARKLEY = { sprite: 'barkley', hair: EGA.black, skin: SKIN_DARK, top: EGA.dgray, pants: EGA.dgray, accent: EGA.white, bald: true };
const JORDAN = { sprite: 'jordan', hair: EGA.black, skin: SKIN_DARK, top: EGA.black, pants: EGA.black, accent: EGA.red, bald: true };
const MORANIS = { sprite: 'moranis-lakers', hair: EGA.dgray, top: EGA.lmagenta, pants: EGA.yellow, accent: EGA.white, glasses: true };
const DREW = { sprite: 'drew', hair: EGA.yellow, top: EGA.lred, pants: EGA.white, longHair: true, dress: true };

const has = (g: Game, f: string) => !!g.flag(f);

function cycle(g: Game, key: string, lines: string[]): string {
  const n = g.bump(key);
  return lines[Math.min(n, lines.length - 1)];
}

function canceled(g: Game, what: string) {
  g.die(
    `${what}\n\nThis is a real sleazy move, and the internet knows the difference. Forty thousand people post the clip before you can blink.\n\nLarry Laffer has been CANCELED. For real this time.`,
    'CANCELED',
    true,
  );
}

// ---------------------------------------------------------------- the battle

const ROUNDS: { diss: string; answers: string[]; verse: string }[] = [
  {
    diss: 'YOUNG FILTR: "Yo, look at grandpa\'s suit! White polyester from 1977! Did you rob a disco? That thing\'s more plastic than my face, and my face is ninety percent filter!"',
    answers: ['suit', 'polyester', 'disco', '1977', 'leisure suit', 'clothes', 'outfit', 'fashion'],
    verse: '"This suit\'s polyester, it\'s flame-retardant, fam,\nI wore it through disco, I wore it through Vietnam,\nIt\'s survived three marriages and a Biscoff cookie spill,\nYour drip\'s from Shein, my drip\'s still here, and it always will."',
  },
  {
    diss: 'YOUNG FILTR: "Where you BEEN, grandpa? Thirty-four years on an island with no Wi-Fi? You don\'t know TikTok, you don\'t know Drake, you don\'t know NOTHING!"',
    answers: ['philippines', 'island', 'karaoke', 'bar', 'karaoke bar', 'my way', 'manila'],
    verse: '"Thirty-four years I ran a karaoke bar,\nSang \'My Way\' every night, I\'m a Filipino star,\nNo TikTok, no Drake, no algorithm in my brain,\nJust a mic and a sunset and a whole lotta rain."',
  },
  {
    diss: 'YOUNG FILTR: "And the internet says you spent thirty-four years with one woman and never heard a WORD she said! You ain\'t a player, grandpa, you a non-LISTENER!"',
    answers: ['maricel', 'listening', 'listen', 'her', 'truth', 'ex', 'girlfriend', 'love', 'honest', 'honesty'],
    verse: '"You\'re right. I never listened. Her name\'s Maricel.\nShe told me everything, and I missed it, oh well.\nShe\'s my best friend now, she kept the bar and the cat,\nI\'m learning to listen. Can you rap about THAT?"',
  },
];

function rap(g: Game, cmd: Command) {
  const round = Number(g.flag('round') || 0);
  if (has(g, 'wonBattle')) { g.say('Snoop raises a hand. "You already won, nephew. Quit while you\'re legendary."'); return; }
  if (round === 0) {
    if (!g.needNear('filtr', 70)) return;
    g.set('round', 1);
    g.award('startBattle');
    g.say(`Dre drops a beat that rattles the avocado trees. Snoop leans back in his lawn chair. "Larry Laffer versus Young Filtr. Three rounds. Flip whatever he throws at you. Go."\n\n${ROUNDS[0].diss}\n\n(Answer with RAP ABOUT something.)`);
    return;
  }
  const r = ROUNDS[round - 1];
  if (!cmd.words.length) { g.say(`Rap about WHAT? He's waiting.\n\n${r.diss}`); return; }
  if (!cmd.about(...r.answers)) {
    g.die(`You grab the mic and spit a verse about ${cmd.rest.trim() || 'nothing'}.\n\nIt does not answer the diss. It does not rhyme. At one point you say "word to your mother" to Dr. Dre, who stops the beat by unplugging the entire neighborhood.\n\nThe crowd boos you out of the backyard, down the street and onto the 710.`, 'BOOED OFF', true);
    return;
  }
  g.award(`round${round}`);
  if (round < ROUNDS.length) {
    g.set('round', round + 1);
    g.say(`${r.verse}\n\nThe backyard goes "OHHHHH." Sandler falls off his cooler.\n\n${ROUNDS[round].diss}`);
    return;
  }
  g.set('wonBattle');
  g.award('winBattle');
  g.sfx('applause');
  g.give('tickets');
  g.s.cash += SEED;
  g.say(`${r.verse}\n\nSilence. Then the backyard ERUPTS. Young Filtr takes off his sunglasses, says "...that was beautiful, man," and hugs you.\n\nSnoop stands up for the first time all night. "Nephew. That was REAL. Nobody raps about listening." He hands you an envelope. "Seed money. ${money(SEED)}. And two courtside seats for the Lakers tomorrow. Call me if you need anything. ANYTHING."\n\nDre nods once. That's worth more than the money.`);
}

// ---------------------------------------------------------------- items

const items: Item[] = [
  {
    id: 'wallet',
    name: 'a 1992 wallet',
    names: ['wallet', 'money', 'cash', 'blockbuster card', 'lubber', 'condom', 'envelope'],
    look: (g) => `Velcro. ${money(g.s.cash)}${has(g, 'wonBattle') ? ', most of it in an envelope from Snoop Dogg' : ''}, an expired Blockbuster card and the 1987 lubber.`,
  },
  {
    id: 'phone',
    name: 'a Pear phone',
    names: ['phone', 'pear phone', 'smartphone', 'cell', 'app', 'apps'],
    look: (g) => (has(g, 'larryToo')
      ? 'Your notifications are a wall of #LarryToo. Kaydence\'s post has 11 million views: "He got handsy at Snoop\'s party. Believe me. Like and subscribe."'
      : 'A text from Kris: "Snoop\'s backyard tonight, Long Beach. The password at the gate is my name. Don\'t embarrass me."'),
  },
  {
    id: 'kriscard',
    name: "Kris's business card",
    names: ['card', 'business card', 'kris card', 'kris'],
    look: (g) => `KRIS. Momager. "Call me before you do anything stupid. Or after. Mostly after."\n\nLifeline calls left: ${g.lifelinesLeft()}.`,
  },
  {
    id: 'dunkin',
    name: 'a Dunkin\' iced coffee',
    names: ['dunkin', 'coffee', 'iced coffee', 'cup', 'dunkin donuts'],
    look: 'A large Dunkin\' iced coffee, extra extra. Ben gave it to you "because that\'s what best buds do." The cup says BEN on it, crossed out, then LARRY.',
  },
  {
    id: 'tickets',
    name: 'two courtside Lakers tickets',
    names: ['tickets', 'ticket', 'lakers tickets', 'courtside'],
    look: 'Two courtside seats at the Lakers game, from Snoop. Row AA. "Seat next to Chuck," he said. "He talks."',
  },
  {
    id: 'footage',
    name: "Snoop's party footage",
    names: ['footage', 'video', 'party footage', 'snoop footage', 'clip', 'receipts'],
    look: 'Snoop\'s phone footage of the whole party. You rap for four straight minutes, twenty feet from Kaydence the entire time. In the corner of every shot, Ben Affleck sadly eats a Dunkin\' donut and does not write anything.',
  },
  {
    id: 'doorbell',
    name: "Rick's doorbell-cam video",
    names: ['doorbell', 'doorbell cam', 'doorbell camera', 'camera', 'rv video', 'video', 'receipts'],
    look: 'Rick\'s RV doorbell camera, pointed at Snoop\'s gate. At 11:42 p.m. it catches Kaydence in front of a ring light, rehearsing: "He got handsy. No, wait. HE got HANDSY. Okay, from the top."',
  },
];

// ---------------------------------------------------------------- rooms

const street: Room = {
  id: 'street',
  title: 'Long Beach, Outside Snoop\'s',
  public: true,
  walk: { x: 4, y: 150, w: 312, h: 50 },
  describe: (g) =>
    `A palm-lined street in Long Beach at sunset. Bass thumps from behind a big wooden gate to the west, where a large cousin with a clipboard stands guard. A beat-up RV is parked at the curb. ${has(g, 'wonBattle') ? 'Ben Affleck is posting on his phone with suspicious energy.' : 'A guy in a Red Sox cap and a Dunkin\' cup waves at you like you\'re old friends.'} A bus stop to the east says LOS ANGELES.`,
  hotspots: [
    { id: 'affleck', names: ['affleck', 'ben', 'ben affleck', 'guy', 'man', 'red sox'], rect: { x: 113, y: 128, w: 14, h: 40 }, look: 'Ben Affleck, in a Red Sox cap, holding a Dunkin\' in each hand and wearing the face he wears in every paparazzi photo: a man who has just been told the Dunkin\' is out of the good donuts.' },
    { id: 'cousin', names: ['cousin', 'guard', 'bouncer', 'clipboard', 'man'], rect: { x: 31, y: 126, w: 14, h: 40 }, look: 'Snoop\'s cousin. Six foot six, a clipboard, and the patience of a man who has turned away three Kardashian ex-boyfriends tonight.' },
    { id: 'gate', names: ['gate', 'fence', 'party', 'backyard', 'west'], rect: { x: 0, y: 100, w: 30, h: 52 }, look: 'A tall wooden gate. Behind it: bass, laughter, and the unmistakable smell of a very professional barbecue.' },
    { id: 'rv', names: ['rv', 'camper', 'motorhome', 'winnebago', 'doorbell'], rect: { x: 170, y: 108, w: 90, h: 44 }, look: (g) => { g.award('lookRv'); return 'A 1987 Winnebago with Canadian plates. Somebody has installed a doorbell camera on the RV\'s door, pointed straight at Snoop\'s gate. A bumper sticker: "I BRAKE FOR MARSHMALLOW MEN."'; } },
    { id: 'busstop', names: ['bus', 'bus stop', 'stop', 'sign', 'los angeles'], rect: { x: 286, y: 100, w: 24, h: 50 }, look: 'A Long Beach Transit stop. The sign says LOS ANGELES and, under it in Sharpie, "EVENTUALLY."' },
    { id: 'traffic', names: ['street', 'road', 'traffic', 'ocean'], rect: { x: 0, y: 186, w: 320, h: 14 }, look: 'Ocean Boulevard. Lowriders, a Tesla and a guy on a unicycle, all doing exactly 25.' },
    watcherHotspot(WATCH_SPOTS['ch4-street'], WATCH_LOOK),
  ],
  zones: [
    {
      id: 'gate',
      rect: { x: 0, y: 150, w: 8, h: 36 },
      enter: (g) => {
        if (has(g, 'inList')) { g.goto('yard', 296, 172); return; }
        g.stop();
        g.s.x = 22;
        g.say('The cousin puts one enormous hand on your chest. "Private party. Who sent you?"');
      },
    },
    {
      id: 'bus',
      rect: { x: 308, y: 150, w: 12, h: 36 },
      enter: (g) => {
        if (!has(g, 'wonBattle')) { g.s.x = 296; g.say('The bus to LA pulls up. Then you remember Kris\'s text: Snoop\'s party is tonight. The bus pulls away without you, which is the only on-time thing it does all day.'); return; }
        g.say('You take the bus to Los Angeles. It takes three hours. You arrive just in time for tip-off.');
        g.goto('arena', 20, 174);
      },
    },
    { id: 'traffic', rect: { x: 0, y: 188, w: 320, h: 12 }, enter: (g) => pamSave(g, 'You step into Ocean Boulevard without looking. A lowrider hits its hydraulics and bounces straight at you.\n\nA blonde in a red lifeguard jacket dives off a bus bench and rolls you onto the sidewalk. The lowrider bounces past, the driver salutes.\n\n"Long Beach, Larry. LONG BEACH. You look BOTH ways here." It\'s Pamela Anderson. She\'s in town to free some sea lions from a seafood restaurant\'s tank. The sea lions are already in her car.\n\nShe tousles your hair and leaves before you can propose. (She won\'t be there next time.)', { x: g.s.x, y: 174 }) || g.die('You step into Ocean Boulevard without looking. A lowrider hits its hydraulics, bounces fourteen feet in the air and lands on you, gently, with tremendous style.\n\nThe driver feels terrible. He makes you an honorary member of the car club. Posthumously.', 'LOW AND SLOW', true) },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch4-street');
    drawWatcher(ctx, WATCH_SPOTS['ch4-street'], t);
    // smoke from the backyard
    if (Math.floor(t * 4) % 2) { rect(ctx, EGA.white, 14, 88, 2, 6); rect(ctx, EGA.white, 11, 93, 4, 2); }
    const lx = ((t * 40) % 420) - 80;
    prop(ctx, 'car-lowrider', lx, 198 - (Math.floor(t * 4) % 2) * 3); // hitting the hydraulics
    person(ctx, 38, 166, COUSIN);
    person(ctx, 120, 168, AFFLECK, has(g, 'wonBattle') ? 'down' : 'left');
    rect(ctx, EGA.white, 128, 150, 4, 6);
    rect(ctx, EGA.lred, 128, 151, 4, 1);
  },
  handle(g, cmd) {
    if (cmd.is(['say', 'password', 'answer']) || cmd.is(['talk', 'ask', 'show', 'give'], 'cousin', 'guard', 'bouncer')) {
      if (cmd.is('say') && !g.near('cousin', 60)) return false;
      if (!g.needNear('cousin', 60)) return true;
      if (has(g, 'inList')) { g.say('"You good, Kris. I mean Larry. Go on in."'); return true; }
      g.award('talkCousin');
      if (cmd.about('kris', 'kris sent me', 'kris jenner', 'momager')) {
        g.set('inList');
        g.award('krisSentMe');
        g.say('"Kris sent me."\n\nThe cousin checks the clipboard. Then checks it again. "Kris Jenner. Personally. Huh." He swings the gate open. "Snoop said if Kris sends somebody, they either a genius or a disaster. Have fun, Unc."\n\nYou haven\'t said a password to get into a party since "Ken sent me" in 1987. It feels good.');
        return true;
      }
      if (cmd.about('ken', 'ken sent me')) { g.say('"Ken? Who\'s Ken? Barbie\'s man? Nah."'); return true; }
      g.say('"Private party, Unc. No name, no entry. Who sent you?" He taps the clipboard. There is only one name on it, and it is written very large.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'affleck', 'ben', 'ben affleck', 'guy', 'man')) {
      if (!g.needNear('affleck', 60)) return true;
      g.award('talkAffleck');
      if (has(g, 'wonBattle')) {
        g.say('"Bro. BRO. That verse. I\'m posting it. I\'ll tag you. Probably. Hey, if anybody asks, we wrote it together, right? Best buds?" He does not wait for an answer.');
        return true;
      }
      if (!g.has('dunkin')) {
        g.give('dunkin');
        g.say('"Larry! Larry Laffer! The Vintage King! I\'m Ben. Big fan. Huge." He hands you one of his two Dunkin\'s. "Here. Best buds get Dunkin\'. That\'s the rule. Where I\'m from, that\'s a contract."\n\nYou have known Ben Affleck for nine seconds and he is already your best friend. This is suspicious. You don\'t notice.');
        return true;
      }
      g.say(cycle(g, 'ben', [
        '"You battling tonight? I used to write. Won an Oscar for writing. I could write you some bars. You don\'t have to credit me. You won\'t have to. Ha. Ha."',
        '"Me and Matt wrote a whole movie once. Now I mostly hold coffee. It\'s a craft."',
      ]));
      return true;
    }
    if (cmd.is(['use', 'ring', 'push', 'look'], 'doorbell', 'camera', 'doorbell camera')) {
      if (!g.needNear('rv', 40)) return true;
      g.say('You ring the RV\'s doorbell. Nobody answers. A tiny voice from the speaker says, "Hi! I\'m not in. I\'m at a basketball game. I don\'t know why. Please don\'t take the RV."');
      return true;
    }
    if (cmd.is(['ride', 'call'], 'bus')) { g.say('Walk to the bus stop to the east.'); return true; }
    if (cmd.is('flirt') && g.near('affleck', 60)) { g.say('You wink at Ben. He winks back, too hard, and spills both Dunkin\'s. He looks devastated. That face is now a meme.'); return true; }
    return false;
  },
};

const yard: Room = {
  id: 'yard',
  title: 'Snoop\'s Backyard Cypher',
  public: true,
  walk: { x: 4, y: 150, w: 312, h: 50 },
  describe: (g) =>
    `Snoop Dogg's backyard: string lights, a smoker the size of a Buick, and a crowd in a circle around a mic stand. Snoop reclines in a gold lawn chair. Dr. Dre stands behind a DJ booth. Adam Sandler, in basketball shorts and a hoodie, sits on a cooler as a guest judge. ${has(g, 'wonBattle') ? 'Young Filtr is asking you for a selfie.' : 'A kid in pink sunglasses named Young Filtr is warming up at the mic.'} An influencer with a ring light is filming everything. The gate back to the street is east.`,
  hotspots: [
    { id: 'snoop', names: ['snoop', 'snoop dogg', 'snoop dog', 'uncle snoop', 'chair'], rect: { x: 53, y: 128, w: 14, h: 40 }, look: 'Snoop Dogg: braids, a gold lawn chair, a red cup and the calmest energy in Southern California. He has seen everything twice.' },
    { id: 'dre', names: ['dre', 'dr dre', 'doctor dre', 'dj', 'booth', 'beat'], rect: { x: 133, y: 108, w: 14, h: 42 }, look: 'Dr. Dre, behind a DJ booth that cost more than Long Beach. He has not smiled since 1999. He does not need to.' },
    { id: 'sandler', names: ['sandler', 'adam', 'adam sandler', 'judge', 'cooler', 'happy gilmore'], rect: { x: 193, y: 128, w: 14, h: 40 }, look: 'Adam Sandler, in his official uniform: giant basketball shorts, a hoodie, and the face of a man who just remembered a funny voice.' },
    { id: 'filtr', names: ['filtr', 'young filtr', 'kid', 'rapper', 'mc', 'opponent', 'mic', 'microphone', 'stage'], rect: { x: 243, y: 128, w: 14, h: 42 }, look: 'Young Filtr, 19, pink sunglasses, a face so filtered it buffers. He has 6 million followers and one rhyme, which is "drip."' },
    { id: 'kaydence', names: ['kaydence', 'influencer', 'woman', 'girl', 'ring light', 'light'], rect: { x: 283, y: 126, w: 14, h: 40 }, visible: (g) => !has(g, 'wonBattle'), look: 'Kaydence, an influencer with a ring light on a stick. She narrates everything to her phone. "Day four hundred of finding my truth. Today my truth is at Snoop\'s."' },
    { id: 'smoker', names: ['smoker', 'grill', 'barbecue', 'bbq', 'ribs', 'food'], rect: { x: 6, y: 110, w: 40, h: 30 }, look: 'A smoker the size of a Buick, full of ribs. It has its own Instagram.' },
  ],
  zones: [
    { id: 'toStreet', rect: { x: 308, y: 150, w: 12, h: 50 }, enter: (g) => g.goto('street', 24, 172) },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch4-yard');
    for (let i = 0; i < 16; i++) {
      const on = (i + Math.floor(t * 2)) % 3;
      rect(ctx, on ? EGA.yellow : EGA.lred, 10 + i * 19, 39 + 10 * ((((i % 4) - 1.5) / 1.5) ** 2), 3, 3);
    }
    if (Math.floor(t * 2) % 2) rect(ctx, EGA.lgray, 35, 90, 6, 6);
    person(ctx, 60, 166, SNOOP);
    person(ctx, 140, 148, DRE, 'down', Math.floor(t * 2) % 2);
    backdrop(ctx, 'ch4-yard-fg');
    person(ctx, 200, 166, SANDLER);
    person(ctx, 250, 170, FILTR, 'left', has(g, 'round') && !has(g, 'wonBattle') ? Math.floor(t * 4) % 2 : 0);
    if (!has(g, 'wonBattle')) {
      person(ctx, 290, 166, KAYDENCE, 'left');
      ellipse(ctx, EGA.white, 280, 128, 6, 6);
      ellipse(ctx, EGA.black, 280, 128, 3, 3);
    }
  },
  handle(g, cmd) {
    if (cmd.is(['rap', 'battle', 'freestyle', 'spit', 'sing']) || cmd.is(['use', 'get'], 'mic', 'microphone') || cmd.is('say', 'rap', 'bars')) {
      rap(g, cmd);
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'snoop', 'snoop dogg', 'snoop dog', 'uncle snoop')) {
      if (!g.needNear('snoop', 60)) return true;
      g.award('talkSnoop');
      g.say(has(g, 'wonBattle')
        ? '"Courtside tomorrow, nephew. Sit next to Chuck. And if the internet starts tripping on you, call me. I film EVERYTHING. Fo\' shizzle, that\'s insurance."'
        : cycle(g, 'snoop', [
          '"Larry Laffer. Kris told me about you. Said you the most 1987 man alive. That\'s a compliment, cuz. Mostly."',
          '"Battle\'s simple. Young Filtr gonna roast you. Don\'t run from it. Whatever he throws, you OWN it. You flip it. That\'s the whole game, nephew."',
        ]));
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'dre', 'dr dre', 'doctor dre', 'dj')) {
      if (!g.needNear('dre', 50)) return true;
      g.award('talkDre');
      g.say(has(g, 'wonBattle')
        ? 'Dre nods at you once. Somewhere, a record executive faints.'
        : 'Dre looks at you for a long time. "Three rounds. He disses. You answer the diss. Not some other thing. THE diss." He goes back to his knobs. That is the most words he has said this year.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'sandler', 'adam', 'adam sandler', 'judge')) {
      if (!g.needNear('sandler', 60)) return true;
      g.award('talkSandler');
      g.say(cycle(g, 'sandler', [
        '"Larry! Love the suit. Very Grown Ups 3. I\'m judging. I don\'t know anything about rap, but I know about getting roasted. I\'ve been roasted by every critic in America for thirty years. Still here, baby!"',
        '"Here\'s the trick. When they roast you, you don\'t duck. You lean IN. Like Happy Gilmore. You don\'t fight the golf ball. You run at it." He does the run-up swing. He hits a lawn flamingo into the next yard.',
      ]));
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'filtr', 'young filtr', 'kid', 'rapper', 'mc', 'opponent')) {
      if (!g.needNear('filtr', 70)) return true;
      g.say(has(g, 'wonBattle') ? '"Respect, Unc. Can I get a selfie? No filter. Okay, one filter."' : '"You battling ME? Grandpa, I got 6 million followers. You got... a Velcro wallet." He has a point. He has exactly one point. Type BATTLE when you\'re ready.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'kaydence', 'influencer', 'woman', 'girl')) {
      if (!g.needNear('kaydence', 60)) return true;
      g.say('"OMG, the old guy from the Vintage King memes! Say something problematic! Just kidding. Unless?" She tilts the ring light at you like a spotlight in a prison yard.');
      return true;
    }
    if (cmd.is('flirt')) {
      if (g.near('kaydence', 60)) {
        canceled(g, 'You sidle up to Kaydence and say, "Hey, ring light. Wanna see my ring?" You hold up your 1979 pinky ring and put an arm around her shoulders without asking.\n\nShe is livestreaming. She is ALWAYS livestreaming.');
        return true;
      }
      if (g.near('snoop', 60)) { g.say('You wink at Snoop. Snoop winks back without moving any other part of his body. You feel blessed.'); return true; }
      return false;
    }
    if (cmd.is(['drink', 'get'], 'cup', 'red cup', 'gin', 'juice', 'gin and juice', 'drink')) {
      if (!g.needNear('snoop', 60)) return true;
      g.die('You grab Snoop\'s red cup and chug it like it\'s 1977.\n\n"Nephew, NO. That was the GIN part." It was mostly gin. There was a rumor of juice. You wake up in Barstow wearing someone else\'s jersey.', 'GIN, NO JUICE', true);
      return true;
    }
    if (cmd.is(['eat', 'get'], 'ribs', 'barbecue', 'bbq', 'food')) {
      g.say('You eat a rib. It is the best thing you have ever eaten, including everything in the Philippines and an entire 1983 cruise buffet.');
      return true;
    }
    return false;
  },
};

const arena: Room = {
  id: 'arena',
  title: 'Courtside, Lakers Game',
  public: true,
  walk: { x: 4, y: 152, w: 312, h: 47 },
  describe: 'Courtside at the Lakers game. Purple and gold everywhere, a jumbotron the size of a house overhead, and celebrities in the front row trying to look like they aren\'t looking at the camera. In Row AA: Charles Barkley, Michael Jordan, and, for some reason, Rick Moranis. A tunnel leads east to the studio lots. The exit to the bus is west.',
  hotspots: [
    { id: 'barkley', names: ['barkley', 'charles', 'charles barkley', 'chuck', 'sir charles'], rect: { x: 103, y: 130, w: 14, h: 40 }, look: 'Charles Barkley, courtside, already yelling. He has opinions about the game, the refs, the popcorn and your suit, all of them loud and all of them affectionate.' },
    { id: 'jordan', names: ['jordan', 'michael', 'michael jordan', 'mj', 'his airness'], rect: { x: 163, y: 130, w: 14, h: 40 }, look: 'Michael Jordan, two seats down, giving you the side-eye. The famous one. The one from the documentary. You feel personally evaluated.' },
    { id: 'moranis', names: ['moranis', 'rick', 'rick moranis', 'man', 'small man'], rect: { x: 233, y: 130, w: 14, h: 40 }, look: 'Rick Moranis, in a Lakers jersey three sizes too big, holding a foam finger the wrong way. He waves at you shyly.' },
    { id: 'jumbotron', names: ['jumbotron', 'screen', 'scoreboard', 'kiss cam', 'kisscam', 'camera'], rect: { x: 100, y: 14, w: 120, h: 50 }, look: (g) => { g.award('lookJumbotron'); return has(g, 'kissCam') ? 'The jumbotron is replaying you kissing Charles Barkley\'s head in slow motion, set to "Celebration." Under it, the #LarryToo ticker still crawls.' : 'The jumbotron flashes KISS CAM, hunting the crowd for couples. Underneath, a news ticker crawls: "#LARRYTOO: INFLUENCER KAYDENCE SAYS LARRY LAFFER \'GOT HANDSY\' AT SNOOP\'S PARTY... BEN AFFLECK SAYS HE GHOSTWROTE LARRY\'S VIRAL VERSE..."'; } },
    { id: 'court', names: ['court', 'game', 'lakers', 'players', 'floor'], rect: { x: 0, y: 70, w: 320, h: 60 }, look: 'The Lakers are up by 4. LeBron is 41 and still dunking. Nobody has explained this.' },
    { id: 'woman', names: ['woman', 'lady', 'fan', 'blonde'], rect: { x: 273, y: 130, w: 14, h: 40 }, look: 'A woman in a Lakers jersey sitting with her husband. She is not on the kiss cam. She would like it to stay that way.' },
  ],
  zones: [
    { id: 'toStreet', rect: { x: 0, y: 152, w: 8, h: 47 }, enter: (g) => g.goto('street', 292, 172) },
    {
      id: 'toStudio',
      rect: { x: 308, y: 152, w: 12, h: 47 },
      enter: (g) => {
        if (!g.has('footage') || !g.has('doorbell')) {
          g.s.x = 296;
          g.say('A producer with a headset stops you in the tunnel. "Drew wants you on the show tomorrow. But you can\'t go on national TV with #LarryToo trending and no receipts, Larry. Come back with proof."');
          return;
        }
        g.goto('studio', 20, 174);
      },
    },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch4-arena');
    // jumbotron
    if (has(g, 'kissCam')) {
      ellipse(ctx, EGA.red, 160, 32, 10, 8);
      text(ctx, 'TURRIBLE!', 160, 42, EGA.yellow, 6, 'center');
    } else {
      text(ctx, 'KISS CAM', 160, 22, Math.floor(t * 2) % 2 ? EGA.lred : EGA.lmagenta, 10, 'center');
      ellipse(ctx, EGA.lred, 150, 42, 4, 3);
      ellipse(ctx, EGA.lred, 170, 42, 4, 3);
    }
    const tick = '#LARRYTOO TRENDING ... KAYDENCE: HE GOT HANDSY ... AFFLECK: I WROTE THAT VERSE ... ';
    const off = Math.floor(t * 20) % (tick.length * 4);
    ctx.save();
    ctx.beginPath(); ctx.rect(104, 54, 112, 8); ctx.clip();
    text(ctx, tick + tick, 104 - off, 55, EGA.yellow, 5);
    ctx.restore();
    const bx = 60 + Math.sin(t) * 120;
    ellipse(ctx, EGA.brown, 160 + bx * 0.5, 84 - Math.abs(Math.sin(t * 4)) * 10, 3, 3);
    person(ctx, 110, 168, BARKLEY, 'down', Math.floor(t * 3) % 2);
    person(ctx, 170, 168, JORDAN, 'left');
    person(ctx, 240, 168, MORANIS);
    rect(ctx, EGA.yellow, 248, 136, 4, 12);
    person(ctx, 280, 168, { sprite: 'fan', hair: EGA.yellow, top: EGA.magenta, pants: EGA.blue, longHair: true });
  },
  handle(g, cmd) {
    if (cmd.is('flirt')) {
      if (cmd.about('barkley', 'charles', 'chuck', 'head') || (!cmd.words.length && g.near('barkley', 50))) {
        if (!g.needNear('barkley', 60)) return true;
        if (has(g, 'kissCam')) { g.say('"Once was enough, Larry! Twice is a relationship!"'); return true; }
        g.set('kissCam');
        g.award('kissCam');
        g.sfx('smooch');
        g.say('The kiss cam swings onto you and Charles Barkley. Twenty thousand people scream.\n\nYou don\'t panic. You lean over and plant one right on top of Chuck\'s gleaming bald head.\n\nThe arena LOSES it. Barkley leaps up, arms in the air. "That was TURRIBLE, Larry! TURRIBLE! Do it AGAIN!"\n\nTwo seats down, Michael Jordan slowly lowers his sunglasses. "...I took that personally."\n\nFor one beautiful minute, nobody is talking about #LarryToo.');
        return true;
      }
      if (cmd.about('jordan', 'michael', 'mj')) {
        g.say('You pucker up at Michael Jordan. He looks at you with such pure competitive contempt that your lips retreat back into your face on their own.');
        return true;
      }
      if (cmd.about('moranis', 'rick')) { g.say('Rick Moranis sees you coming and hides behind his foam finger. "Oh, no. No, no, no. I\'m Canadian."'); return true; }
      canceled(g, 'The kiss cam swings over. Instead of the man next to you, you lean across two rows and kiss a total stranger, a married woman, who had absolutely not agreed to be on the kiss cam.\n\nHer husband is a Lakers season ticket holder. So is his lawyer.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'barkley', 'charles', 'charles barkley', 'chuck')) {
      if (!g.needNear('barkley', 60)) return true;
      g.award('talkBarkley');
      g.say(has(g, 'kissCam')
        ? '"Larry, I LOVE you, man! That\'s what love looks like! Bald, beautiful and on a jumbotron! Now go get your name back. I\'ll be right here yelling."'
        : cycle(g, 'chuck', [
          '"Larry! The Vintage King! Sit DOWN, sit down! Man, that suit is TURRIBLE. I love it. Don\'t ever change. Well, change a LITTLE."',
          '"Watch out, that kiss cam\'s coming. When it finds you, you gotta COMMIT, Larry. And you kiss the RIGHT person. The one sitting next to you who\'s got your back." He points at his own head and winks.',
        ]));
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'jordan', 'michael', 'michael jordan', 'mj')) {
      if (!g.needNear('jordan', 60)) return true;
      g.award('talkJordan');
      g.say(has(g, 'kissCam')
        ? 'Jordan studies you for a long time. "I don\'t trust you, Larry. But I watched that battle. You won because you told the truth. So do it again. Get the receipts. Snoop films everything. And that little Canadian guy\'s been filming Snoop\'s gate all night."'
        : '"You\'re the guy." He doesn\'t say which guy. He doesn\'t have to. "Everybody wants to cancel you. I\'m not saying they\'re wrong. I\'m saying I\'m watching."');
      return true;
    }
    if (cmd.is(['talk', 'ask', 'show'], 'moranis', 'rick', 'rick moranis', 'man', 'doorbell', 'camera', 'rv')) {
      if (!g.needNear('moranis', 60)) return true;
      if (g.has('doorbell')) { g.say('"Glad the doorbell finally did something. Nobody ever rings it. I installed it to feel included."'); return true; }
      if (!has(g, 'kissCam')) { g.say('"Oh! Hi again. Different city. I don\'t know how I keep turning up. I parked my RV outside a party in Long Beach and then I was just... here." He looks at his foam finger like it might explain.'); return true; }
      g.give('doorbell');
      g.award('getDoorbell');
      g.say('You ask Rick about his RV.\n\n"Oh! The doorbell camera. It films everything. Raccoons, mostly." He scrolls on his phone. "Huh. And this lady. Rehearsing a speech. Over and over. With a ring light."\n\nHe AirDrops it to you. "I don\'t know if that helps. I hope it helps. I always hope things help."');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'woman', 'lady', 'fan')) {
      if (!g.needNear('woman', 60)) return true;
      g.say('"I\'m here with my husband," she says, before you have said anything. Smart woman.');
      return true;
    }
    return false;
  },
};

arena.enter = (g) => {
  g.award('enterArena');
  g.set('larryToo');
};

const studio: Room = {
  id: 'studio',
  title: 'The Drew Barrymore Show',
  public: true,
  walk: { x: 4, y: 152, w: 312, h: 47 },
  describe: (g) =>
    `The set of The Drew Barrymore Show: a cozy couch, about four hundred throw pillows and a live studio audience. Drew Barrymore is barefoot and beaming. ${has(g, 'affleckExposed') ? 'Ben Affleck\'s chair is empty except for a sad Dunkin\'.' : 'Ben Affleck sits in the other guest chair, holding a Dunkin\' and a printout titled "MY VERSE."'} A big screen behind them shows #LarryToo.`,
  hotspots: [
    { id: 'drew', names: ['drew', 'drew barrymore', 'barrymore', 'host', 'woman'], rect: { x: 133, y: 128, w: 14, h: 40 }, look: 'Drew Barrymore, barefoot, holding a mug, radiating so much kindness the lighting guy has to adjust.' },
    { id: 'affleck', names: ['affleck', 'ben', 'ben affleck', 'guest'], rect: { x: 203, y: 128, w: 14, h: 40 }, visible: (g) => !has(g, 'affleckExposed'), look: 'Ben Affleck, telling the audience he "basically" wrote your battle verse. He keeps glancing at you with the face of a man who knows you have receipts.' },
    { id: 'screen', names: ['screen', 'tv', 'monitor', 'larrytoo', 'hashtag'], rect: { x: 100, y: 16, w: 120, h: 60 }, look: (g) => (has(g, 'cleared') ? '#LARRYTOO is gone. The screen now says "#LARRYTOOHONEST."' : 'The big screen shows Kaydence\'s post: "He got handsy at Snoop\'s. Believe me. Link in bio." 11 million views.') },
    { id: 'couch', names: ['couch', 'sofa', 'pillows', 'pillow'], rect: { x: 100, y: 130, w: 60, h: 24 }, look: 'A couch with more pillows than structural support.' },
    { id: 'audience', names: ['audience', 'crowd', 'people'], rect: { x: 0, y: 80, w: 320, h: 40 }, look: 'Two hundred people who came for a cooking segment and got a scandal.' },
  ],
  zones: [
    { id: 'toArena', rect: { x: 0, y: 152, w: 8, h: 47 }, enter: (g) => g.goto('arena', 292, 174) },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch4-studio');
    rect(ctx, has(g, 'cleared') ? EGA.lgreen : EGA.lcyan, 104, 20, 112, 52);
    text(ctx, has(g, 'cleared') ? '#LARRYTOOHONEST' : '#LARRYTOO', 160, 40, EGA.black, 9, 'center');
    // audience silhouettes
    for (let i = 0; i < 20; i++) ellipse(ctx, '#3A2A3A', 8 + i * 16, 104 - (Math.floor(t * 3 + i) % 2), 6, 6);
    person(ctx, 140, 166, DREW, 'down', has(g, 'cleared') ? Math.floor(t * 4) % 2 : 0);
    if (!has(g, 'affleckExposed')) person(ctx, 210, 166, AFFLECK, 'left');
    else rect(ctx, EGA.white, 204, 140, 4, 6);
  },
  handle(g, cmd) {
    const finish = () => {
      if (!has(g, 'affleckExposed') || !has(g, 'cleared')) return;
      g.award('ending');
      g.win(`Drew Barrymore jumps off the couch, crosses the stage barefoot and hugs you. A real hug, the kind with a little sway in it.\n\n"Larry, you told the truth on the mic and you brought receipts. That's the whole thing!" she says to the audience. "That's ALL of it!" The audience gives you a standing ovation. A cooking segment is canceled for time. Nobody minds.\n\nBy dinner, #LarryToo is #LarryTooHonest. Kaydence posts a 40-minute apology video. Ben Affleck is photographed outside a Dunkin' looking sadder than ever, which everybody agrees is his best work.\n\nYour phone buzzes three times.\n\nSNOOP: "Told you. Insurance. Fo' shizzle."\nJORDAN: "Still don't trust you. Good job."\nKRIS: "Larry. A man named Steve Martin wants to invest in your idea. He's in Miami. So are some people you should NOT party with. Do not do anything stupid."\n\nYou will absolutely do something stupid.\n\nCONTINUED IN CHAPTER 5: TOO WILD FOR LARRY.\n\nFinal score: ${g.s.score} of ${g.maxScore}.`);
    };
    if (cmd.is(['show', 'give', 'play', 'use'], 'footage', 'party footage', 'snoop footage', 'clip')) {
      if (!g.has('footage')) return false;
      if (has(g, 'affleckExposed')) { g.say('Drew has already watched it twice. She says the part where you rap about Maricel makes her cry every time.'); return true; }
      g.set('affleckExposed');
      g.award('exposeAffleck');
      g.sfx('scratch');
      g.say('You hand Drew Snoop\'s party footage. She puts it on the big screen.\n\nThere you are, rapping your heart out about Maricel. And there, in the corner of every single shot, is Ben Affleck, eating a Dunkin\' donut with the saddest face in Hollywood. He is not writing. He is not even holding a pen. At one point he drops the donut and stares at it for eleven seconds.\n\nThe audience howls. Ben stands up, says "I was writing it in my HEAD," picks up his Dunkin\' and walks off the set.');
      finish();
      return true;
    }
    if (cmd.is(['show', 'give', 'play', 'use'], 'doorbell', 'doorbell cam', 'doorbell camera', 'camera', 'rv video', 'video')) {
      if (!g.has('doorbell')) return false;
      if (has(g, 'cleared')) { g.say('The audience asks for an encore. Kaydence\'s "HE got HANDSY, okay from the top" is already a ringtone.'); return true; }
      g.set('cleared');
      g.award('clearName');
      g.sfx('applause');
      g.say('You play Rick\'s doorbell-cam video. Timestamped 11:42 p.m., Snoop\'s gate.\n\nKaydence, in front of her ring light: "He got handsy. No, wait. HE got HANDSY. Okay, from the top, but with tears." In the background, through the gate, you can clearly see yourself twenty feet away, rapping, with both hands on the mic.\n\nThe audience gasps. Then they start chanting: "RE-CEIPTS! RE-CEIPTS!"');
      finish();
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'drew', 'drew barrymore', 'barrymore', 'host')) {
      if (!g.needNear('drew', 60)) return true;
      g.award('talkDrew');
      g.say(cycle(g, 'drew', [
        '"Larry! Welcome! I believe people when they say they\'re hurt. I really do. And I also believe in RECEIPTS. Do you have anything you want to show us?"',
        '"I grew up on camera. You learn that the camera always tells the truth eventually. Usually at the worst possible time."',
      ]));
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'affleck', 'ben', 'ben affleck')) {
      if (has(g, 'affleckExposed')) return false;
      if (!g.needNear('affleck', 60)) return true;
      g.say('"Larry! Buddy! Tell her. We wrote it together. Best buds. I gave you a Dunkin\'. That\'s a contract where I\'m from." He is sweating through his Red Sox cap.');
      return true;
    }
    if (cmd.is(['give', 'show'], 'dunkin', 'coffee', 'iced coffee')) {
      if (!g.has('dunkin')) return false;
      g.say('You hand Ben back his Dunkin\'. "Contract void, buddy." He accepts it like a man receiving a folded flag.');
      g.drop('dunkin');
      return true;
    }
    if ((cmd.is(['push', 'fight']) && cmd.about('affleck', 'ben')) || cmd.is('fight')) {
      g.die('You lunge at Ben Affleck. You forgot that he trained for two years to play Batman.\n\nHe catches you, apologizes, and very gently puts you through Drew\'s coffee table. Four hundred throw pillows rain down. The clip of Ben saying "sorry, sorry, sorry" while body-slamming a 68-year-old in a leisure suit becomes the most-watched moment in daytime TV history.', 'BATFLECKED', true);
      return true;
    }
    if (cmd.is('flirt')) {
      if (g.near('drew', 70)) {
        canceled(g, 'In the middle of clearing your name of a groping accusation, on national television, you put your hand on Drew Barrymore\'s knee and say, "You know, you\'re even prettier than in E.T."\n\nThe audience goes silent. Somewhere, Kaydence screams "SEE?"');
        return true;
      }
      return false;
    }
    return false;
  },
};

// ---------------------------------------------------------------- global

export const chapter4: Content = {
  title: 'Leisure Suit Larry: Woke Up Broke',
  chapter: 'Chapter 4: The Long Beach Cypher',
  startRoom: 'street',
  scenes: pamScenes,
  start: { x: 200, y: 176 },
  startInventory: ['wallet', 'phone', 'kriscard'],
  startCash: 118,
  startFlags: { phoneOnline: true, hasIdea: true },
  rooms: [street, yard, arena, studio],
  items,
  points: {
    lookRv: 2, talkAffleck: 3, talkCousin: 2, krisSentMe: 5,
    talkSnoop: 3, talkDre: 3, talkSandler: 3, startBattle: 4, round1: 8, round2: 8, round3: 10, winBattle: 5,
    enterArena: 2, lookJumbotron: 2, talkBarkley: 3, talkJordan: 3, kissCam: 8, getFootage: 4, getDoorbell: 4,
    talkDrew: 2, exposeAffleck: 6, clearName: 6, ending: 4,
  },
  lifeline: {
    item: 'kriscard',
    max: 3,
    label: 'Calling Kris...',
    rescue: (g, used) => {
      const lines = [
        'Kris answers from a Calabasas spin class. "Long Beach, Larry? Fine." Within the hour, a crisis team, a lawyer and Kim\'s law-school study group arrive. It never happened.',
        '"AGAIN?" Kris sends Khloé, who posts a video of herself eating ribs at Snoop\'s. The internet forgets you instantly. You have never been so grateful to be forgotten.',
        'Kris sighs the sigh of a woman who has managed worse. "Last one this chapter." A tasteful apology, a sea-lion charity and a family photo-op later, you\'re back.',
      ];
      return `${lines[Math.min(used - 1, lines.length - 1)]}\n\nLifeline calls left: ${g.lifelinesLeft()}.`;
    },
  },
  intro: [
    'LEISURE SUIT LARRY: WOKE UP BROKE\n\nChapter 4: The Long Beach Cypher',
    'Long Beach, California.\n\nSnoop Dogg saw your Vintage King photos and invited you to his backyard rap battle. Kris texted the password. You have $1.18, a phone and no idea what a "cypher" is.\n\nYou\'re 68 years old and you\'re about to battle rap. In a leisure suit. In Long Beach.\n\n(Type HELP for instructions. Save often.)',
  ],
  handle(g, cmd) {
    if (cmd.is('call', 'snoop', 'snoop dogg', 'snoop dog')) {
      if (!has(g, 'wonBattle')) { g.say('You don\'t have Snoop\'s number. Yet.'); return true; }
      if (!has(g, 'larryToo')) { g.say('Snoop picks up. "Nephew! You good? Cool. Courtside. Go." He hangs up.'); return true; }
      if (g.has('footage')) { g.say('"Already sent it, nephew. Go show the world."'); return true; }
      g.give('footage');
      g.award('getFootage');
      g.sfx('phone');
      g.say('Snoop picks up on the first ring. "I saw the hashtag. Told you, nephew. I film EVERYTHING." Your phone dings. "That\'s the whole party. Every minute. You twenty feet from that girl the whole time, rapping your heart out. Oh, and peep Ben in the corner."');
      return true;
    }
    if (cmd.is(['call', 'use'], 'kris', 'card', 'business card', 'momager')) {
      g.say(`Kris picks up. "Larry, I'm saving my calls for emergencies. You should too." (${g.lifelinesLeft()} lifeline calls left. They work when you die.)`);
      return true;
    }
    if (cmd.is('drink', 'dunkin', 'coffee', 'iced coffee')) {
      if (!g.has('dunkin')) return false;
      g.say('You sip Ben\'s Dunkin\'. It is 90% sugar and 10% Boston. You can hear in color for a moment.');
      return true;
    }
    if (cmd.is('rap')) { g.say('You start rapping to nobody. A seagull listens politely, then leaves. Save it for the battle.'); return true; }
    if (cmd.is('flirt')) { g.say("There's nobody here worth getting canceled over."); return true; }
    return false;
  },
  hint(g) {
    if (!has(g, 'inList')) return 'Snoop\'s cousin wants to know who sent you. Check your phone. SAY KRIS SENT ME.';
    if (!has(g, 'wonBattle')) {
      const round = Number(g.flag('round') || 0);
      if (round === 0) return 'Walk up to Young Filtr and type BATTLE.';
      return [
        'He roasted your suit. Own it: RAP ABOUT SUIT.',
        'He says you spent 34 years on an island. Own it: RAP ABOUT KARAOKE.',
        'He says you never listened to Maricel. Tell the truth: RAP ABOUT MARICEL.',
      ][round - 1];
    }
    if (!has(g, 'larryToo')) return 'Take the bus at the east end of the street to the Lakers game.';
    if (!has(g, 'kissCam')) return 'The kiss cam is coming. Kiss the person who has your back: KISS BARKLEY.';
    if (!g.has('footage')) return 'Snoop films everything. CALL SNOOP.';
    if (!g.has('doorbell')) return 'Rick Moranis has a doorbell camera pointed at Snoop\'s gate. TALK TO RICK.';
    if (!has(g, 'affleckExposed')) return 'Go through the tunnel to Drew\'s show and SHOW FOOTAGE.';
    return 'SHOW DOORBELL video to clear your name.';
  },
};
