// Chapter 1: Rip Van Laffer.
// Larry passed out in Lefty's hot tub on April 29, 1992 and wakes up in 2026.
// Goal: get a phone, get an idea, get out of Lost Wages.

import { EGA, SKIN, SKIN_DARK, dither, ellipse, frame, person, rect, stripes, text } from '../engine/gfx';
import { money, type Game } from '../engine/game';
import type { Content, Item, Room } from '../engine/types';

const BABBAGES_RECEIPT_PRICE = 4995; // King's Quest V, 1990 pricing
const COLLECTOR_PRICE = 100000;
const PHONE_PRICE = 99900;
const SQ_PRICE = 99;

// Shared look-ups for NPCs, so the same character looks the same everywhere.
const BARTENDER = { hair: EGA.lgreen, top: EGA.black, pants: EGA.dgray, accent: EGA.lmagenta, longHair: true };
const BONDS = { hair: EGA.dgray, top: EGA.blue, pants: EGA.blue, accent: EGA.yellow, glasses: true };
const CANVASSER = { hair: EGA.brown, top: EGA.lgreen, pants: EGA.blue, accent: EGA.white, longHair: true };
const KEN = { hair: EGA.lgray, top: EGA.lred, pants: EGA.brown, bald: true, glasses: true };
const ROBERTA = { hair: EGA.lgray, top: EGA.lblue, pants: EGA.blue, longHair: true, dress: true };
const GUS = { hair: EGA.lgray, top: EGA.red, pants: EGA.black, accent: EGA.white, bald: true };
const GENIUS = { hair: EGA.black, skin: SKIN_DARK, top: EGA.lblue, pants: EGA.dgray, accent: EGA.white };

const wearingPin = (g: Game) => !!g.flag('pinWorn');
const phoneReady = (g: Game) => g.has('phone') && !!g.flag('phoneOnline');

/** Talk lines that advance each time, then hold on the last one. */
function cycle(g: Game, key: string, lines: string[]): string {
  const n = g.bump(key);
  return lines[Math.min(n, lines.length - 1)];
}

function canceled(g: Game, what: string) {
  g.die(
    `${what}\n\nWithin seconds, six phones are pointed at you. By the time you reach the door, the clip has 4 million views, a hashtag, and a think piece in The Atlantic.\n\nLarry Laffer has been CANCELED.`,
    'CANCELED',
  );
}

// ---------------------------------------------------------------- items

const items: Item[] = [
  {
    id: 'wallet',
    name: 'a 1992 wallet',
    names: ['wallet', 'money', 'cash', 'card', 'blockbuster card', 'lubber', 'condom'],
    look: (g) =>
      `Velcro, naturally. Inside: ${money(g.s.cash)}, an expired Blockbuster card (late fees: $8,213), and one emergency "lubber" from 1987.\n\nBased on the TV, you may never need it again. Based on your track record, you never needed it before.`,
  },
  {
    id: 'kq5',
    name: "a sealed King's Quest V",
    names: ['box', 'kings quest', 'kings quest v', 'kings quest 5', 'kq5', 'game', 'receipt'],
    look: "King's Quest V: Absence Makes the Heart Go Yonder! Still shrink-wrapped. Taped to the plastic: a Babbage's receipt dated April 29, 1992, $49.95.\n\nIn pencil on the back of the receipt, in your handwriting: \"return #5 - say disk 3 is 'defective' again.\"",
  },
  {
    id: 'newspaper',
    name: 'a yellowed newspaper',
    names: ['newspaper', 'paper', 'news'],
    look: 'The Lost Wages Ledger, April 30, 1992.\n\nHEADLINE: "L.A. ERUPTS AFTER KING VERDICT." Below the fold: "Can we all get along?" Below that, smaller: "Area Man Still Missing In Lefty\'s Hot Tub."\n\nThat area man is you.',
  },
  {
    id: 'pin',
    name: 'an ALLY pin',
    names: ['pin', 'ally pin', 'badge', 'button'],
    look: 'A rainbow enamel pin that says ALLY. The back says MADE IN A FACTORY YOU DON\'T WANT TO KNOW ABOUT.',
  },
  {
    id: 'phone',
    name: 'a Pear phone',
    names: ['phone', 'pear phone', 'smartphone', 'cell', 'cellphone', 'iphone', 'app', 'apps', 'swipr'],
    look: (g) =>
      g.flag('phoneOnline')
        ? 'Your Pear phone. Apps installed: Swipr (dating), Wayno (robotaxis), and Pear Pay. 4,212 unread notifications, all from apps you have never opened.'
        : 'A gleaming slab of glass with no buttons. It says "Connect to Wi-Fi to continue." You have no Wi-Fi. You have barely any fi.',
  },
  {
    id: 'sq',
    name: 'Space Quest XII',
    names: ['space quest', 'space quest xii', 'sq', 'sq12', 'space'],
    look: "Space Quest XII: Vohaul's Revenge Again. Bargain bin, marked down 31 times. The back of the box reads like a business plan: build a rocket, land it again, sell tickets to space, become the richest janitor in the galaxy.\n\nType READ SPACE QUEST to really take it in.",
  },
];

// ---------------------------------------------------------------- rooms

const backroom: Room = {
  id: 'backroom',
  title: "Lefty's Back Room",
  walk: { x: 8, y: 142, w: 304, h: 56 },
  blockers: [{ x: 10, y: 142, w: 96, h: 18 }],
  describe: (g) =>
    `A storage room that smells like 1992. A drained hot tub, the one you passed out in, crusts in the corner. Crates, a dusty mirror, graffiti on the wall${g.flag('doorOpen') ? ', and an open door' : ', and a door, locked from the outside'}.`,
  hotspots: [
    { id: 'tub', names: ['tub', 'hot tub', 'hottub', 'jacuzzi', 'water', 'scum'], rect: { x: 10, y: 122, w: 98, h: 36 }, look: 'The hot tub has a ring of green crust and about two inches of water that has been evolving since the first Bush administration. Something in it waves at you.' },
    { id: 'box', names: ['box', 'kings quest', 'kq5', 'game', 'crate', 'crates'], rect: { x: 130, y: 112, w: 22, h: 30 }, look: "A shrink-wrapped King's Quest V on a crate, right where you left it. There's a receipt taped to it.", visible: (g) => !g.flag('gotBox') },
    { id: 'crates', names: ['crate', 'crates', 'shelf', 'shelves'], rect: { x: 150, y: 70, w: 80, h: 60 }, look: 'Crates of Lefty\'s house vodka (1991), a case of New Coke, and a box marked "LARRY\'S STUFF - DO NOT RETURN".' },
    { id: 'newspaper', names: ['newspaper', 'paper', 'news'], rect: { x: 196, y: 162, w: 24, h: 10 }, look: 'A yellowed newspaper lies on the floor.', visible: (g) => !g.flag('gotPaper') },
    { id: 'mirror', names: ['mirror', 'glass'], rect: { x: 50, y: 36, w: 26, h: 34 }, look: 'A gilded mirror. You lean in and ask, "Mirror, mirror, on the wall, who\'s the fairest of them all?"\n\nThe mirror shows a 68-year-old man in a leisure suit and replies, "Daventry is that way, pal. Keep walking."' },
    { id: 'graffiti', names: ['graffiti', 'wall', 'writing', 'scrawl'], rect: { x: 226, y: 28, w: 74, h: 32 }, look: 'Scrawled in lipstick: "KEN SENT ME." Below it: "LARRY WAS HERE 1987." Below that, in a different hand: "LARRY IS STILL HERE 1992." Nobody updated it after that.' },
    { id: 'door', names: ['door', 'exit'], rect: { x: 282, y: 62, w: 30, h: 84 }, look: (g) => (g.flag('doorOpen') ? 'The door to the bar stands open.' : 'A steel door. Locked from the other side. There\'s a little sliding slot at eye level, like a speakeasy.') },
  ],
  zones: [
    { id: 'toLounge', rect: { x: 290, y: 142, w: 30, h: 56 }, when: (g) => !!g.flag('doorOpen'), enter: (g) => g.goto('lounge', 26, 172) },
  ],
  draw(ctx, g) {
    stripes(ctx, EGA.brown, '#884400', 0, 10, 320, 126, 3);
    dither(ctx, EGA.brown, EGA.dgray, 0, 136, 320, 64);
    rect(ctx, EGA.black, 0, 135, 320, 2);
    // mirror
    rect(ctx, EGA.yellow, 48, 34, 30, 38);
    dither(ctx, EGA.lcyan, EGA.cyan, 51, 37, 24, 32);
    // graffiti
    text(ctx, 'KEN SENT ME', 228, 32, EGA.lred, 8);
    text(ctx, 'LARRY WAS HERE 1987', 228, 44, EGA.lmagenta, 5);
    text(ctx, 'LARRY IS STILL HERE 1992', 228, 52, EGA.lgray, 5);
    // shelves of crates
    for (let i = 0; i < 3; i++) {
      rect(ctx, '#663300', 150, 74 + i * 22, 80, 3);
      for (let j = 0; j < 4; j++) rect(ctx, j % 2 ? EGA.brown : '#996633', 154 + j * 19, 60 + i * 22, 16, 14);
    }
    // crate with KQ5
    rect(ctx, '#996633', 128, 122, 26, 20);
    frame(ctx, '#663300', 128, 122, 26, 20);
    if (!g.flag('gotBox')) {
      rect(ctx, EGA.lblue, 133, 110, 15, 12);
      rect(ctx, EGA.yellow, 135, 112, 11, 3);
      rect(ctx, EGA.white, 137, 117, 6, 3);
    }
    // hot tub
    ellipse(ctx, EGA.lcyan, 58, 142, 50, 18);
    ellipse(ctx, EGA.cyan, 58, 142, 44, 14);
    ellipse(ctx, '#225522', 58, 143, 38, 10);
    dither(ctx, '#225522', EGA.green, 34, 140, 40, 4);
    // newspaper
    if (!g.flag('gotPaper')) {
      rect(ctx, EGA.lgray, 198, 164, 20, 7);
      rect(ctx, EGA.dgray, 200, 165, 14, 1);
      rect(ctx, EGA.dgray, 200, 167, 10, 1);
    }
    // door
    rect(ctx, g.flag('doorOpen') ? EGA.black : EGA.dgray, 282, 62, 30, 76);
    if (g.flag('doorOpen')) dither(ctx, EGA.magenta, EGA.black, 284, 64, 26, 74);
    else {
      frame(ctx, EGA.lgray, 282, 62, 30, 76);
      rect(ctx, EGA.black, 290, 76, 14, 4);
      rect(ctx, EGA.yellow, 285, 104, 3, 3);
    }
  },
  handle(g, cmd) {
    if (cmd.is('get', 'box', 'kings quest', 'kq5', 'game')) {
      if (g.flag('gotBox')) return false;
      if (!g.needNear('box')) return true;
      g.set('gotBox');
      g.give('kq5');
      g.award('getBox');
      g.say("You pick up King's Quest V. Still sealed. You never did figure out how to copy it without opening it.");
      return true;
    }
    if (cmd.is('get', 'newspaper', 'paper')) {
      if (g.flag('gotPaper')) return false;
      if (!g.needNear('newspaper', 20)) return true;
      g.set('gotPaper');
      g.give('newspaper');
      g.say('You pick up the newspaper. It crackles like your knees.');
      return true;
    }
    if (cmd.is(['drink', 'eat'], 'tub', 'water', 'scum', 'hot tub')) {
      if (!g.needNear('tub', 22)) return true;
      g.die('You scoop up a handful of 34-year-old hot tub water and drink.\n\nScientists later identify six new bacteria, one of which has a podcast. Larry Laffer is survived by his leisure suit.', 'YOU DIED');
      return true;
    }
    if (cmd.is(['bathe', 'ride', 'sit'], 'tub', 'hot tub', 'water') || (cmd.is('bathe') && cmd.words.length === 0)) {
      g.say("You've spent enough time in that tub. Thirty-four years, to be exact.");
      return true;
    }
    if (cmd.is('knock', 'door') || (cmd.is('knock') && cmd.words.length === 0)) {
      if (g.flag('doorOpen')) { g.say("It's open, Larry."); return true; }
      if (!g.needNear('door', 24)) return true;
      g.set('knocked');
      g.say('You knock. The slot slides open and a pair of heavily eyelined eyes peer through.\n\n"This is the employee wellness pantry. Password?"');
      return true;
    }
    if (cmd.is('say')) {
      if (g.flag('doorOpen')) return false;
      if (!g.flag('knocked') || !g.near('door', 32)) {
        g.say('You say it to nobody. The hot tub bubbles back.');
        return true;
      }
      if (cmd.rest.includes('ken sent me')) {
        g.set('doorOpen');
        g.award('password');
        g.say('"...Ken sent you? That password was retired in 1987. Whatever. Nobody\'s supposed to be back there anyway, it\'s a liability."\n\nThe door swings open.');
      } else {
        g.say('"Wrong. Also, you can\'t be in there. Also, are you a contractor?"\n\nThe slot slams shut. Maybe the wall knows something.');
        g.set('knocked', false);
      }
      return true;
    }
    if (cmd.is('open', 'door')) {
      g.say(g.flag('doorOpen') ? "It's already open." : 'Locked from the outside. Like your romantic prospects. Maybe try knocking.');
      return true;
    }
    if (cmd.is('look', 'mirror')) {
      g.award('mirror');
      return false;
    }
    if (cmd.is(['look', 'read'], 'graffiti', 'wall', 'writing')) {
      g.award('graffiti');
      return false;
    }
    return false;
  },
};

const lounge: Room = {
  id: 'lounge',
  title: 'LFTY: A Mixology Experience',
  public: true,
  walk: { x: 4, y: 148, w: 312, h: 50 },
  describe: "Lefty's Bar has become LFTY, a \"mixology experience.\" Edison bulbs, reclaimed wood, a $26 cocktail menu, a chalkboard, a TV over the bar, and a bowl of free pins by the register. A bartender with green hair is polishing a jar that used to be a pickle jar and is now a glass.\n\nThe street door is at the back. The back room is to the left.",
  hotspots: [
    { id: 'bartender', names: ['bartender', 'barkeep', 'woman', 'mixologist', 'server'], rect: { x: 232, y: 108, w: 18, h: 38 }, look: 'Name tag: "SAGE, Chief Mixology Officer." Septum ring, kind eyes, zero patience. Sage is muddling something that looks like a lawn.' },
    { id: 'chalkboard', names: ['chalkboard', 'board', 'sign', 'wifi', 'wi fi', 'password', 'menu'], rect: { x: 180, y: 30, w: 56, h: 36 }, look: (g) => { g.set('knowsWifi'); g.award('wifi'); return 'The chalkboard says:\n\nTODAY: Smoked Oat Old Fashioned $26\nGuest Wi-Fi: LFTY_Guest\nPassword: KenSentMe1987\n\nSome traditions survive.'; } },
    { id: 'tv', names: ['tv', 'television', 'news', 'screen'], rect: { x: 254, y: 28, w: 48, h: 34 }, look: (g) => { g.award('tv'); return 'The TV is on CNBS:\n\n"...the final one-shot HIV cure is now free worldwide. AIDS is officially over, 45 years after it began..."\n\nYou weep a single tear. "Thirty-four years of being careful, for nothing!"\n\nThe ticker adds: "Richest Man in America launches 40th rocket, buys a third social network, posts a meme about it." You squint. "Someday, that\'ll be me."'; } },
    { id: 'pins', names: ['pins', 'pin', 'bowl', 'ally pin', 'badge'], rect: { x: 168, y: 110, w: 18, h: 10 }, look: 'A bowl of rainbow ALLY pins. A card says: "FREE. Take one, wear it, feel nothing."', visible: (g) => !g.has('pin') },
    { id: 'bar', names: ['bar', 'counter', 'drinks', 'bottles'], rect: { x: 166, y: 118, w: 150, h: 28 }, look: 'Bottles of small-batch everything. Not one of them has a price under $20. There used to be a jar of pickled eggs here. You miss it.' },
    { id: 'patrons', names: ['patrons', 'people', 'customers', 'crowd', 'guy', 'girl', 'man'], rect: { x: 40, y: 110, w: 80, h: 40 }, look: 'Three patrons on laptops, two on podcasts, one on a podcast about laptops. Every one of them has a phone pointed vaguely at you.' },
    { id: 'streetdoor', names: ['door', 'exit', 'street door', 'front door'], rect: { x: 100, y: 68, w: 30, h: 76 }, look: 'The front door, out to the street.' },
    { id: 'backdoor', names: ['back door', 'back room'], rect: { x: 0, y: 70, w: 22, h: 76 }, look: 'The back room, where you spent 1992 through 2026.' },
  ],
  zones: [
    { id: 'toBack', rect: { x: 0, y: 148, w: 12, h: 50 }, enter: (g) => g.goto('backroom', 272, 172) },
    { id: 'toStreet', rect: { x: 100, y: 148, w: 30, h: 6 }, enter: (g) => g.goto('street', 53, 166) },
  ],
  draw(ctx, g, t) {
    dither(ctx, EGA.magenta, EGA.black, 0, 10, 320, 136);
    stripes(ctx, '#663300', EGA.brown, 0, 146, 320, 54, 5);
    // brick accent wall
    for (let y = 18; y < 140; y += 6) for (let x = (y / 6) % 2 ? 0 : 6; x < 160; x += 12) rect(ctx, EGA.red, x, y, 10, 4);
    // edison bulbs
    for (let i = 0; i < 8; i++) {
      rect(ctx, EGA.black, 20 + i * 38, 10, 1, 10 + (i % 3) * 4);
      rect(ctx, EGA.yellow, 19 + i * 38, 20 + (i % 3) * 4, 3, 4);
    }
    // neon
    text(ctx, 'LFTY', 40, 34, (Math.floor(t * 2) % 7) ? EGA.lmagenta : EGA.magenta, 16);
    text(ctx, 'a mixology experience', 30, 52, EGA.lcyan, 5);
    // doors
    rect(ctx, EGA.black, 0, 70, 22, 78);
    rect(ctx, '#442200', 100, 68, 30, 80);
    frame(ctx, EGA.yellow, 100, 68, 30, 80);
    text(ctx, 'EXIT', 106, 72, EGA.lred, 6);
    // chalkboard
    rect(ctx, '#663300', 178, 28, 60, 40);
    rect(ctx, '#113311', 181, 31, 54, 34);
    text(ctx, 'OAT OLD FASH $26', 183, 34, EGA.white, 4);
    text(ctx, 'WIFI: LFTY_Guest', 183, 44, EGA.lcyan, 4);
    text(ctx, 'PW: KenSentMe1987', 183, 52, EGA.lcyan, 4);
    // tv
    rect(ctx, EGA.black, 252, 26, 52, 38);
    dither(ctx, Math.floor(t * 3) % 2 ? EGA.blue : EGA.lblue, EGA.cyan, 255, 29, 46, 28);
    rect(ctx, EGA.red, 255, 52, 46, 5);
    text(ctx, 'AIDS: OVER', 257, 34, EGA.white, 6);
    // patrons on laptops
    person(ctx, 52, 150, { hair: EGA.yellow, top: EGA.lgreen, pants: EGA.blue });
    person(ctx, 82, 150, { hair: EGA.black, top: EGA.lgray, pants: EGA.dgray, glasses: true, longHair: true });
    rect(ctx, EGA.lgray, 40, 132, 56, 4);
    rect(ctx, EGA.white, 46, 126, 10, 6);
    rect(ctx, EGA.white, 76, 126, 10, 6);
    // bartender behind the bar
    rect(ctx, '#663300', 166, 84, 154, 3);
    for (let i = 0; i < 9; i++) rect(ctx, [EGA.green, EGA.brown, EGA.lcyan][i % 3], 190 + i * 14, 72, 4, 12);
    person(ctx, 241, 138, BARTENDER);
    rect(ctx, '#663300', 166, 118, 154, 6);
    stripes(ctx, EGA.brown, '#663300', 166, 124, 154, 22, 4);
    if (!g.has('pin')) {
      rect(ctx, EGA.white, 170, 112, 14, 6);
      for (let i = 0; i < 5; i++) rect(ctx, [EGA.lred, EGA.yellow, EGA.lgreen, EGA.lblue, EGA.lmagenta][i], 171 + i * 2.5, 111, 2, 2);
    }
  },
  handle(g, cmd) {
    if (cmd.is('get', 'pin', 'pins', 'ally pin', 'badge')) {
      if (g.has('pin')) return false;
      if (!g.needNear('pins', 50)) return true;
      g.give('pin');
      g.award('getPin');
      g.say('You take an ALLY pin. Sage nods approvingly without looking up. You feel exactly as virtuous as you did a second ago.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'bartender', 'sage', 'woman', 'mixologist') || (cmd.is('talk') && cmd.words.length === 0 && g.near('bartender', 50))) {
      if (!g.needNear('bartender', 50)) return true;
      g.award('talkSage');
      g.say(cycle(g, 'sageTalk', [
        '"Welcome to LFTY. Are you... are you the guy from the back room? We thought you were a Halloween decoration. We put a hat on you in 2019."',
        '"You want a job? Money? Okay, boomer. Look, there\'s a dead mall next door with a Babbage\'s still in it. The old guy there honors receipts from like 1990. Also a sweet older couple hangs out by the bench and buys old computer games. They tip well."',
        '"Everything is on your phone now, Larry. Your money, your dates, your taxis. No phone, no life. The Pear Store is in the mall."',
        '"Wi-Fi password\'s on the chalkboard. Don\'t make it weird."',
      ]));
      return true;
    }
    if (cmd.is('buy', 'drink', 'beer', 'whiskey', 'cocktail', 'old fashioned', 'oat') || (cmd.is('buy') && cmd.words.length === 0 && g.near('bartender', 50))) {
      g.say(`"That's $26. Tap to pay."\n\nYou slap down ${money(g.s.cash)} in coins. Sage looks at the change like it's a fossil. "We're cashless. Cash is... problematic." It's not clear which problem.`);
      return true;
    }
    if (cmd.is('flirt') || cmd.is('say', 'baby', 'come here often', 'sign', 'hot')) {
      if (!g.near('bartender', 60)) { g.say("There's no one close enough to embarrass yourself with. Yet."); return true; }
      canceled(g, 'You lean over the bar, unbutton one more shirt button than is legal, and say, "Hey baby, what\'s your sign? Mine\'s \'Under New Management.\'"\n\nSage stares. "Did you just... are you serious right now?"');
      return true;
    }
    if (cmd.is('donate')) {
      g.say('There\'s a tip jar with a QR code on it. You can\'t tip a QR code with nickels. You try anyway. It doesn\'t work.');
      return true;
    }
    if (cmd.is(['use', 'connect'], 'phone', 'wifi', 'wi fi', 'pear', 'internet') || cmd.is('connect')) {
      if (!g.has('phone')) { g.say('Connect what? You don\'t have a phone. You have a pager-shaped hole in your heart.'); return true; }
      if (g.flag('phoneOnline')) return false;
      if (!g.flag('knowsWifi')) { g.say('Your phone finds "LFTY_Guest" and asks for a password. You try "password." You try "larry." You try "hot tub." Maybe something in here says it.'); return true; }
      g.set('phoneOnline');
      g.award('online');
      g.say('You join LFTY_Guest with "KenSentMe1987."\n\nThe phone wakes up, installs 41 updates, downloads Swipr, Wayno and Pear Pay, and asks if you\'d like to enable "Screen Time." You would not.\n\nYou are ONLINE. 1992 Larry would be so proud. 1992 Larry would also be confused.');
      return true;
    }
    return false;
  },
};

const street: Room = {
  id: 'street',
  title: 'The Strip, Lost Wages',
  public: true,
  walk: { x: 2, y: 154, w: 316, h: 46 },
  describe: (g) =>
    `The Lost Wages Strip, 2026. LFTY is to the west. The Galleria mall is to the east${g.flag('passedBonds') ? '' : ', guarded by a squad car marked "PC POLICE"'}. A canvasser with a clipboard and a QR code sign works the sidewalk. Driverless robotaxis glide down the street. Nobody is driving anything, and nobody is looking up.`,
  hotspots: [
    { id: 'bonds', names: ['officer', 'cop', 'police', 'policeman', 'sonny', 'bonds', 'sonny bonds', 'man'], rect: { x: 296, y: 140, w: 14, h: 30 }, look: 'The name tag says "Sgt. Sonny Bonds, Dept. of Sensitivity Compliance." Same mustache he had in Lytton. His holster holds a tablet running a 400-page HR flowchart.' },
    { id: 'cruiser', names: ['car', 'cruiser', 'squad car', 'police car', 'pc police'], rect: { x: 200, y: 168, w: 70, h: 22 }, look: 'A squad car marked "PC POLICE - TO PROTECT AND TO VALIDATE." The light bar is rainbow. The siren plays a land acknowledgment.' },
    { id: 'canvasser', names: ['canvasser', 'woman', 'girl', 'activist', 'clipboard', 'qr', 'qr code'], rect: { x: 144, y: 140, w: 14, h: 30 }, look: 'A cheerful canvasser for the "Foundation for Global Justice, LLC." Her sign: "EVERY DOLLAR GOES TO THE CAUSE*". The asterisk is very small.' },
    { id: 'sign', names: ['sign', 'asterisk', 'foundation', 'fine print'], rect: { x: 160, y: 120, w: 34, h: 22 }, look: 'You squint at the asterisk. "*Cause: The Malibu Healing Campus (7 bed, 3 pool, 6-car garage for healing). Donations not tax-deductible, refundable, or traceable."' },
    { id: 'lftydoor', names: ['lfty', 'bar', 'door'], rect: { x: 40, y: 112, w: 26, h: 44 }, look: 'The door to LFTY. Through the window you can see a hat on a hook. It used to be on you.' },
    { id: 'mall', names: ['mall', 'galleria', 'entrance', 'glass doors'], rect: { x: 248, y: 96, w: 44, h: 60 }, look: 'The Lost Wages Galleria. "NOW 60% STORES!" says a banner.' },
    { id: 'billboard', names: ['billboard', 'ad', 'advertisement'], rect: { x: 118, y: 24, w: 90, h: 40 }, look: 'A billboard: "SWIPR - Love is just one swipe away. (Swipe right for premium.)"' },
    { id: 'robotaxi', names: ['robotaxi', 'taxi', 'cab', 'wayno', 'robo taxi', 'street', 'road'], rect: { x: 0, y: 176, w: 320, h: 24 }, look: 'Wayno robotaxis whir past, empty, at forty miles an hour. Nobody to wave down. You\'d need the app.' },
  ],
  zones: [
    { id: 'road', rect: { x: 0, y: 182, w: 320, h: 18 }, enter: (g) => g.die('You step off the curb like it\'s 1992 and wave for a cab.\n\nA Wayno robotaxi does not see you, because you are wearing a white leisure suit against a white crosswalk. It has no driver to apologize, no insurance company to call, and it gives itself five stars.\n\nLook both ways, Larry. Even if no one is driving.', 'ROADKILL') },
    { id: 'toLounge', rect: { x: 40, y: 154, w: 26, h: 6 }, enter: (g) => g.goto('lounge', 115, 160) },
    {
      id: 'toMall',
      rect: { x: 250, y: 154, w: 40, h: 6 },
      enter: (g) => {
        if (!wearingPin(g)) {
          g.s.y = 166;
          g.say('Sgt. Bonds steps in front of you. "Hold it, sir. That suit. Polyester, 1977. You\'re appropriating the disco community and shedding microplastics on public property."\n\n"I\'ll need to see some visible allyship before you enter a retail environment."');
          return;
        }
        if (!g.flag('passedBonds')) {
          g.set('passedBonds');
          g.award('passBonds');
          g.say('Sgt. Bonds sees the pin, softens, and gives you a fist bump. "Carry on, ally."');
        }
        g.goto('mall', 160, 188);
      },
    },
  ],
  draw(ctx, _g, t) {
    dither(ctx, EGA.black, EGA.blue, 0, 10, 320, 90);
    for (let i = 0; i < 25; i++) rect(ctx, EGA.white, (i * 53) % 320, 12 + ((i * 37) % 50), 1, 1);
    // LFTY building
    rect(ctx, EGA.dgray, 0, 70, 110, 86);
    for (let y = 74; y < 152; y += 6) for (let x = (y / 6) % 2 ? 0 : 6; x < 110; x += 12) rect(ctx, EGA.red, x, y, 10, 4);
    text(ctx, 'LFTY', 30, 80, EGA.lmagenta, 14);
    rect(ctx, '#442200', 40, 112, 26, 44);
    rect(ctx, EGA.yellow, 72, 112, 26, 20);
    // billboard
    rect(ctx, EGA.dgray, 160, 64, 4, 50);
    rect(ctx, EGA.white, 118, 24, 90, 40);
    frame(ctx, EGA.lred, 118, 24, 90, 40);
    text(ctx, 'SWIPR', 128, 30, EGA.lred, 14);
    text(ctx, 'love is one swipe away', 124, 50, EGA.black, 5);
    // mall
    rect(ctx, EGA.lgray, 214, 60, 106, 96);
    rect(ctx, EGA.dgray, 214, 60, 106, 4);
    text(ctx, 'GALLERIA', 236, 68, EGA.blue, 10);
    text(ctx, 'NOW 60% STORES!', 232, 82, EGA.red, 5);
    dither(ctx, EGA.lcyan, EGA.cyan, 250, 98, 40, 58);
    rect(ctx, EGA.dgray, 269, 98, 2, 58);
    // sidewalk and road
    rect(ctx, EGA.lgray, 0, 156, 320, 24);
    for (let x = 0; x < 320; x += 20) rect(ctx, EGA.dgray, x, 156, 1, 24);
    rect(ctx, EGA.white, 0, 179, 320, 2);
    rect(ctx, EGA.dgray, 0, 181, 320, 19);
    for (let x = (t * 30) % 30 - 30; x < 320; x += 30) rect(ctx, EGA.yellow, x, 190, 14, 2);
    // a robotaxi cruising by
    const cx = ((t * 70) % 520) - 100;
    rect(ctx, EGA.white, cx, 182, 34, 10);
    rect(ctx, EGA.lcyan, cx + 8, 178, 18, 6);
    rect(ctx, EGA.black, cx + 4, 190, 6, 4);
    rect(ctx, EGA.black, cx + 24, 190, 6, 4);
    rect(ctx, EGA.lgray, cx + 14, 175, 6, 3);
    // PC Police cruiser
    {
      rect(ctx, EGA.white, 204, 170, 64, 12);
      rect(ctx, EGA.blue, 212, 164, 44, 8);
      const lights = [EGA.lred, EGA.yellow, EGA.lgreen, EGA.lblue, EGA.lmagenta];
      for (let i = 0; i < 5; i++) rect(ctx, lights[(i + Math.floor(t * 6)) % 5], 222 + i * 5, 161, 4, 3);
      text(ctx, 'PC POLICE', 214, 173, EGA.blue, 6);
      rect(ctx, EGA.black, 210, 180, 8, 3);
      rect(ctx, EGA.black, 254, 180, 8, 3);
    }
    person(ctx, 303, 168, BONDS);
    // canvasser and her sign
    person(ctx, 151, 168, CANVASSER, 'down', Math.floor(t * 2) % 2);
    rect(ctx, EGA.dgray, 176, 140, 2, 22);
    rect(ctx, EGA.white, 160, 120, 34, 22);
    text(ctx, 'EVERY $', 162, 123, EGA.black, 5);
    text(ctx, 'TO CAUSE*', 162, 131, EGA.black, 5);
  },
  handle(g, cmd) {
    if (cmd.is(['talk', 'ask'], 'officer', 'cop', 'police', 'sonny', 'bonds', 'policeman')) {
      if (!g.needNear('bonds', 60)) return true;
      g.award('talkBonds');
      g.say(cycle(g, 'bondsTalk', [
        '"Sgt. Sonny Bonds. I used to work narcotics in Lytton. Car chases, drug busts, saving the girl. Now I issue citations for microaggressions. Last week I wrote up a guy for saying \'you guys\' to a group of guys."',
        '"Back in \'92, every cop in L.A. learned the hard way that somebody\'s always filming. Now everybody\'s always filming everybody, and nobody\'s learned a thing."',
        '"Look, Larry. Wear the pin. Say the words. Nobody checks what\'s in your heart. That\'s why it\'s such a great system."',
      ]));
      return true;
    }
    if (cmd.is(['show', 'give'], 'newspaper', 'paper')) {
      if (!g.has('newspaper')) return false;
      if (!g.needNear('bonds', 60)) return true;
      g.award('showPaper');
      g.say('Bonds reads the 1992 headline and goes quiet. "April \'92. The verdict. The riots. My buddies in L.A. wore riot gear for a week."\n\nHe hands it back. "Can we all get along? Thirty-four years later, the answer is: online, absolutely not."');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'canvasser', 'woman', 'girl', 'activist', 'mansion', 'foundation', 'malibu', 'campus')) {
      if (!g.needNear('canvasser', 50)) return true;
      if (cmd.about('mansion', 'malibu', 'campus', 'house', 'money') || g.flag('canvassTalk')) {
        g.award('askMansion');
        g.say('"It is NOT a mansion. It\'s a Healing Campus. The six-car garage is for healing. The three pools are for healing. The founders\' cousin\'s production company is for healing."\n\n"Every dollar goes to the cause," she says. "The cause is having the dollars."');
        return true;
      }
      g.set('canvassTalk');
      g.say('"Hi! Do you have a minute for global justice? It\'s just a QR code! Scan it and your phone handles the rest. Like, all the rest. Forever."');
      return true;
    }
    if (cmd.is('donate') || cmd.is(['use', 'scan'], 'qr', 'qr code', 'clipboard')) {
      if (!g.needNear('canvasser', 50)) return true;
      if (!phoneReady(g)) {
        g.say(`You offer her your ${money(g.s.cash)}. She recoils. "Oh, we don't take cash. Cash isn't trackable. I mean, accessible."`);
        return true;
      }
      g.die('You scan the QR code. Pear Pay chimes.\n\nYou have been enrolled in "Recurring Allyship" at $999 per month, billed hourly. The fine print routes it through four LLCs and a Malibu escrow account.\n\nYour checking account is now a down payment on a fourth pool. Larry Laffer dies of the most modern cause of all: a subscription he can\'t cancel.', 'DONATED TO DEATH');
      return true;
    }
    if (cmd.is(['call', 'use', 'ride'], 'robotaxi', 'taxi', 'cab', 'wayno', 'app', 'car', 'ride') || cmd.is('call')) {
      if (cmd.about('police', 'cop', 'cruiser', 'pc police')) {
        g.say('You do not want to ride in the PC Police car. The back seat is a mandatory listening session.');
        return true;
      }
      if (!g.has('phone')) { g.say('There\'s no way to hail a robotaxi without the app. You whistle. A robotaxi whistles back, digitally, and keeps going.'); return true; }
      if (!g.flag('phoneOnline')) { g.say('Your phone needs to connect to the internet before it can do anything at all. There was a Wi-Fi password somewhere...'); return true; }
      if (!g.flag('hasIdea')) {
        g.say('You open Wayno and type "Silicon Valley." Then you hesitate.\n\nShow up in Silicon Valley with no idea? Every billionaire starts with a big idea, preferably one borrowed from a sci-fi story. You need a vision first.');
        return true;
      }
      g.award('ending');
      g.win(`A Wayno robotaxi pulls up with nobody inside. You climb in. "Destination: Silicon Valley," you tell it.\n\n"Rerouting to avoid your vibe," it replies, and pulls away.\n\nIn your pocket: a phone, a dream, and ${money(g.s.cash)}. Behind you, Sgt. Bonds is writing the robotaxi a ticket for misgendering a hydrant.\n\nLarry Laffer, 68, has a phone, a plan, and a rocket-shaped idea. Next stop: venture capital.\n\nCONTINUED IN CHAPTER 2: WOKE VALLEY.\n\nFinal score: ${g.s.score} of ${g.maxScore}.`);
      return true;
    }
    if (cmd.is('flirt')) {
      if (g.near('canvasser', 50)) { canceled(g, 'You tell the canvasser that you\'d donate "to her cause, if you know what I mean," and waggle your eyebrows.'); return true; }
      if (g.near('bonds', 60)) { g.say('Bonds raises an eyebrow. "Sir, I\'m married to my job. My job is extremely online."'); return true; }
      return false;
    }
    return false;
  },
};

const mall: Room = {
  id: 'mall',
  title: 'Lost Wages Galleria',
  public: true,
  walk: { x: 4, y: 124, w: 312, h: 75 },
  blockers: [{ x: 128, y: 146, w: 64, h: 12 }],
  describe: "A dead mall. Half the stores are gone and a Spirit Halloween has taken over the old Sears. To the left: BABBAGE'S, somehow still open. To the right: the Pear Store, glowing like a cult. On a bench in the middle sits a sweet older couple sharing a pretzel. The exit to the street is behind you.",
  hotspots: [
    { id: 'couple', names: ['couple', 'ken', 'roberta', 'people', 'old couple', 'man', 'woman', 'bench'], rect: { x: 134, y: 126, w: 52, h: 32 }, look: 'Name tags: KEN and ROBERTA. He\'s grinning about something he isn\'t saying. She has the look of somebody who could design a world, a castle and a talking fox before breakfast. They\'re sharing a pretzel and arguing fondly about something called "AGI."' },
    { id: 'babbages', names: ['babbages', 'babbage', 'game store', 'left store'], rect: { x: 20, y: 40, w: 112, h: 84 }, look: "BABBAGE'S, the last one in America. The window display is all big boxes: King's Quest, Police Quest, Space Quest, Leisure Suit Larry. You blush." },
    { id: 'pear', names: ['pear', 'pear store', 'phone store', 'right store'], rect: { x: 190, y: 40, w: 112, h: 84 }, look: 'The Pear Store. White, silent, and full of tables. Nothing in the window has a price tag, which is how you know.' },
    { id: 'spirit', names: ['spirit', 'halloween', 'sears', 'spirit halloween'], rect: { x: 134, y: 40, w: 54, h: 30 }, look: 'SPIRIT HALLOWEEN, formerly Sears, formerly the place you bought this suit. One of the costumes on display is "Sexy 1992 Guy." It is your exact outfit.' },
  ],
  zones: [
    { id: 'toStreet', rect: { x: 0, y: 196, w: 320, h: 4 }, enter: (g) => g.goto('street', 270, 166) },
    { id: 'toBabbages', rect: { x: 56, y: 124, w: 40, h: 5 }, enter: (g) => g.goto('babbages', 160, 188) },
    { id: 'toPear', rect: { x: 226, y: 124, w: 40, h: 5 }, enter: (g) => g.goto('pear', 160, 188) },
  ],
  draw(ctx, g) {
    rect(ctx, EGA.lgray, 0, 10, 320, 114);
    rect(ctx, EGA.dgray, 0, 10, 320, 26);
    for (let x = 0; x < 320; x += 16) rect(ctx, EGA.white, x, 14, 10, 18);
    // checkered floor
    for (let y = 124; y < 200; y += 8) for (let x = 0; x < 320; x += 16) rect(ctx, ((x + y) / 8) % 2 ? EGA.white : EGA.lgray, x + ((y / 8) % 2 ? 8 : 0), y, 8, 8);
    // Babbage's
    rect(ctx, EGA.red, 20, 40, 112, 84);
    rect(ctx, EGA.white, 24, 44, 104, 14);
    text(ctx, "BABBAGE'S", 34, 46, EGA.red, 11);
    rect(ctx, EGA.black, 56, 76, 40, 48);
    for (let i = 0; i < 4; i++) rect(ctx, [EGA.lblue, EGA.yellow, EGA.lgreen, EGA.lmagenta][i], 28 + (i % 2) * 104 - (i % 2 ? 104 : 0) + (i > 1 ? 72 : 0), 64 + (i % 2) * 22, 18, 14);
    // Spirit Halloween
    rect(ctx, EGA.black, 134, 40, 54, 30);
    text(ctx, 'SPIRIT', 140, 44, EGA.lred, 8);
    text(ctx, 'HALLOWEEN', 139, 56, EGA.white, 5);
    // Pear store
    rect(ctx, EGA.white, 190, 40, 112, 84);
    frame(ctx, EGA.lgray, 190, 40, 112, 84);
    ellipse(ctx, EGA.dgray, 246, 54, 6, 7);
    ellipse(ctx, EGA.dgray, 246, 46, 3, 3);
    rect(ctx, EGA.lgreen, 247, 40, 3, 3);
    dither(ctx, EGA.white, EGA.lcyan, 226, 76, 40, 48);
    // bench and couple
    person(ctx, 149, 150, KEN);
    person(ctx, 171, 150, ROBERTA);
    rect(ctx, EGA.brown, 128, 146, 64, 6);
    rect(ctx, '#663300', 132, 152, 4, 8);
    rect(ctx, '#663300', 184, 152, 4, 8);
    rect(ctx, EGA.yellow, 158, 138, 6, 4);
    if (g.flag('soldBox')) rect(ctx, EGA.lblue, 162, 140, 8, 6);
  },
  handle(g, cmd) {
    const target = cmd.about('couple', 'ken', 'roberta', 'people', 'man', 'woman', 'them');
    if ((cmd.is(['talk', 'ask']) && target) || (cmd.is('talk') && cmd.words.length === 0 && g.near('couple', 50))) {
      if (!g.needNear('couple', 40)) return true;
      g.award('talkCouple');
      g.say(cycle(g, 'coupleTalk', [
        'ROBERTA: "Hello there! We used to make games, up in Oakhurst. Daventry, Lytton, Xenon, Lost Wages..."\n\nYOU: "Lost Wages! I\'m from Lost Wages!"\n\nKEN: "We know, Larry."',
        'KEN: "We started on a kitchen table. Then it was a company, then a bigger company, then somebody bought it, then somebody bought them, then there was a lot of paperwork. Never sell the company, Larry."\n\nROBERTA: "Or at least read the paperwork."',
        `ROBERTA: "We're trying to buy back a copy of everything we ever made. Sealed, if we can find them. A sealed King's Quest V would be worth ${money(COLLECTOR_PRICE)} to us. The ones that weren't copied and returned to Babbage's five times, anyway."\n\nShe looks at you. You look at the pretzel.`,
        'KEN: "Pretzel?"',
      ]));
      return true;
    }
    if ((cmd.is(['give', 'show', 'sell'], 'box', 'kings quest', 'kq5', 'game')) || (cmd.is('sell') && cmd.words.length === 0)) {
      if (!g.has('kq5')) { g.say("You don't have anything they'd want. Well. Nothing anyone would want."); return true; }
      if (!g.needNear('couple', 40)) return true;
      g.drop('kq5');
      g.set('soldBox');
      g.s.cash += COLLECTOR_PRICE;
      g.award('sellBox');
      g.say(`Roberta turns the box over in her hands, slowly. "Still sealed. Absence Makes the Heart Go Yonder."\n\nKen peeks at the receipt and the pencil note on the back. "Return number FIVE, Larry?" He laughs so hard the pretzel goes flying.\n\nThey hand you ${money(COLLECTOR_PRICE)} in actual cash, because they are the last people in America who carry it.\n\nYou now have ${money(g.s.cash)}.`);
      return true;
    }
    if (cmd.is('flirt') && g.near('couple', 60)) {
      g.say('Roberta pats your hand. "Oh, Larry. We wrote you. We know every line you\'ve got." Ken nods. "Most of them were mine."');
      return true;
    }
    return false;
  },
};

const babbages: Room = {
  id: 'babbages',
  title: "Babbage's",
  public: true,
  walk: { x: 10, y: 128, w: 300, h: 71 },
  blockers: [{ x: 226, y: 150, w: 54, h: 18 }],
  describe: "Babbage's, preserved like a museum. Big-box PC games line the walls, a CRT runs a demo loop, and behind the counter stands Gus, who has worked here since 1988 and looks like he never left. A bargain bin sits by the wall. A sign above the counter says: NO RETURNS ON OPENED SOFTWARE. WE ARE LOOKING AT YOU, LARRY.",
  hotspots: [
    { id: 'gus', names: ['gus', 'clerk', 'man', 'cashier', 'old man', 'employee'], rect: { x: 152, y: 98, w: 16, h: 30 }, look: 'Gus. Name tag, cardigan, a pocket protector holding a 5.25" floppy. He watches you the way a bank guard watches a guy in a ski mask.' },
    { id: 'sign', names: ['sign', 'returns', 'policy'], rect: { x: 110, y: 22, w: 100, h: 24 }, look: 'NO RETURNS ON OPENED SOFTWARE.\nWE ARE LOOKING AT YOU, LARRY.\n\nThere is a faded Polaroid of you taped to it.' },
    { id: 'bin', names: ['bin', 'bargain bin', 'bargain', 'space quest', 'sq', 'box'], rect: { x: 226, y: 140, w: 54, h: 28 }, look: (g) => (g.has('sq') ? 'The bargain bin. Mostly copies of E.T. for some reason.' : "The bargain bin. Mostly copies of E.T., plus one Space Quest XII: Vohaul's Revenge Again, marked down 31 times to $0.99.") },
    { id: 'shelves', names: ['shelves', 'games', 'shelf', 'boxes', 'police quest', 'leisure suit larry', 'larry'], rect: { x: 10, y: 40, w: 90, h: 80 }, look: 'King\'s Quest I through VIII. Police Quest I through IV. Space Quest I through VI. And there, on the bottom shelf: Leisure Suit Larry in the Land of the Lounge Lizards. You are on the cover. You look great.' },
    { id: 'crt', names: ['crt', 'monitor', 'computer', 'demo', 'screen'], rect: { x: 230, y: 70, w: 40, h: 34 }, look: 'An old CRT running a demo: a little man in a white suit walks into a street and is hit by a car. You feel seen.' },
  ],
  zones: [{ id: 'toMall', rect: { x: 0, y: 196, w: 320, h: 4 }, enter: (g) => g.goto('mall', 76, 136) }],
  draw(ctx, g, t) {
    rect(ctx, EGA.yellow, 0, 10, 320, 118);
    stripes(ctx, EGA.blue, EGA.lblue, 0, 128, 320, 72, 6);
    // shelves of big boxes
    for (const sx of [10, 200]) {
      for (let r = 0; r < 4; r++) {
        rect(ctx, EGA.brown, sx, 52 + r * 20, sx === 10 ? 90 : 20, 2);
        for (let i = 0; i < (sx === 10 ? 7 : 1); i++) {
          const colors = [EGA.lblue, EGA.red, EGA.green, EGA.magenta, EGA.cyan, EGA.white, EGA.lred];
          rect(ctx, colors[(i + r) % colors.length], sx + 2 + i * 12, 40 + r * 20, 10, 12);
        }
      }
    }
    // sign
    rect(ctx, EGA.white, 110, 22, 100, 24);
    frame(ctx, EGA.red, 110, 22, 100, 24);
    text(ctx, 'NO RETURNS ON OPENED', 113, 25, EGA.red, 5);
    text(ctx, 'SOFTWARE.', 113, 32, EGA.red, 5);
    text(ctx, 'LOOKING AT YOU, LARRY', 113, 39, EGA.black, 5);
    rect(ctx, EGA.white, 196, 34, 8, 9);
    rect(ctx, SKIN, 198, 36, 4, 4);
    // crt
    rect(ctx, EGA.lgray, 230, 70, 40, 34);
    rect(ctx, EGA.black, 233, 73, 34, 24);
    const walker = 235 + ((t * 8) % 28);
    rect(ctx, EGA.white, walker, 86, 2, 6);
    rect(ctx, EGA.lred, 233 + ((t * 20) % 40), 92, 6, 3);
    // Gus behind the counter
    person(ctx, 160, 117, GUS);
    rect(ctx, EGA.brown, 110, 106, 100, 22);
    rect(ctx, '#663300', 110, 104, 100, 3);
    rect(ctx, EGA.dgray, 180, 96, 16, 10);
    // bargain bin
    rect(ctx, EGA.lred, 226, 146, 54, 20);
    frame(ctx, EGA.red, 226, 146, 54, 20);
    text(ctx, 'BARGAIN', 232, 152, EGA.white, 6);
    for (let i = 0; i < 5; i++) rect(ctx, i === 2 && !g.has('sq') ? EGA.black : EGA.green, 230 + i * 10, 140, 8, 7);
    if (!g.has('sq')) rect(ctx, EGA.yellow, 251, 142, 4, 2);
  },
  handle(g, cmd) {
    if (cmd.is(['talk', 'ask'], 'gus', 'clerk', 'man', 'cashier', 'returns', 'return') || (cmd.is('talk') && cmd.words.length === 0 && g.near('gus', 50))) {
      if (!g.needNear('gus', 50)) return true;
      if (cmd.about('returns', 'return', 'refund')) {
        g.award('askReturns');
        g.say('"Returns? Oh, I remember YOUR returns, Larry. 1991. You bought King\'s Quest V, copied all nine disks, and returned it. \'Disk 3 is defective.\' Then you bought it again. Copied it again. Returned it again. Five times."\n\n"Corporate made a policy. They named it after you. I still have to read it to every customer."');
        return true;
      }
      g.award('talkGus');
      g.say(cycle(g, 'gusTalk', [
        '"Welcome to Babbage\'s. Last one in America. The landlord forgot we exist, and we\'re not reminding him."',
        '"We honor every receipt. Forever. That\'s our policy. It\'s a terrible policy. Ask me about returns sometime."',
        '"Kids today don\'t buy games. They buy \'live service experiences.\' I sold a kid a box last week and he asked me where the battle pass was."',
      ]));
      return true;
    }
    if (cmd.is(['return', 'sell', 'give', 'show'], 'box', 'kings quest', 'kq5', 'game', 'receipt') || (cmd.is('return') && cmd.words.length === 0 && g.has('kq5'))) {
      if (!g.has('kq5')) {
        if (cmd.verb === 'return') { g.say('"You have nothing to return, Larry. For once."'); return true; }
        return false;
      }
      if (!g.needNear('gus', 50)) return true;
      g.s.cash += BABBAGES_RECEIPT_PRICE;
      g.drop('kq5');
      g.die(`Gus examines the 1992 receipt. "We honor every receipt." He hands you ${money(BABBAGES_RECEIPT_PRICE)} and slides the sealed box under the counter.\n\nThrough the window you watch him walk it out to the bench, where the sweet older couple hands him ${money(COLLECTOR_PRICE)} in cash. Gus gives you a thumbs-up.\n\nYou returned a $1,000 collector's item for $49.95. Your sixth fake return was your first real mistake. With no money for a phone, Larry stays stuck in 1992 forever.`, 'RETURN TO SENDER');
      return true;
    }
    if (cmd.is('return')) {
      if (cmd.about('newspaper', 'paper')) { g.say('"We don\'t take returns on 1992, Larry. Nobody does."'); return true; }
      if (cmd.about('pin')) { g.say('"That\'s not ours. We don\'t do merch with feelings."'); return true; }
      if (cmd.about('phone')) { g.say('"Do I look like a Genius to you?"'); return true; }
      if (cmd.about('space quest', 'sq')) { g.say('"Opened software, Larry. Read the sign. Read the sign with your face on it."'); return true; }
      g.say('"Receipt?"');
      return true;
    }
    if (cmd.is(['buy', 'get'], 'space quest', 'sq', 'bin', 'bargain', 'game', 'box')) {
      if (g.has('sq')) { g.say('You already own the only copy anyone has wanted since 1995.'); return true; }
      if (!g.near('bin', 30) && !g.near('gus', 50)) { g.say("You're not close enough."); return true; }
      if (g.s.cash < SQ_PRICE) {
        g.say(`"It's ninety-nine cents, Larry." You have ${money(g.s.cash)}. Gus sighs and does not offer you a discount.`);
        return true;
      }
      g.s.cash -= SQ_PRICE;
      g.give('sq');
      g.award('buySq');
      g.say(`You buy Space Quest XII from the bargain bin for $0.99. Gus rings it up on a register older than the cashier at the Pear Store.\n\n"Want a bag? It's free. It's from 1994."\n\nYou now have ${money(g.s.cash)}.`);
      return true;
    }
    if (cmd.is('flirt') && g.near('gus', 60)) {
      g.say('Gus does not even look up. "I watched you hit on a cardboard cutout of Rosella in 1991. Don\'t."');
      return true;
    }
    return false;
  },
};

const pear: Room = {
  id: 'pear',
  title: 'The Pear Store',
  public: true,
  walk: { x: 10, y: 128, w: 300, h: 71 },
  blockers: [{ x: 96, y: 128, w: 128, h: 18 }],
  describe: 'The Pear Store. Everything is white, wood or glass, and nobody is at a register because there are no registers. Phones lie on a long table like jewelry. A Pear Genius in a blue shirt hovers nearby, radiating calm and an employee discount.',
  hotspots: [
    { id: 'genius', names: ['genius', 'employee', 'man', 'clerk', 'salesman', 'pear genius', 'worker'], rect: { x: 152, y: 96, w: 16, h: 30 }, look: 'His name tag says "DESHAWN, GENIUS." Below that, smaller: "PhD, Stanford, Comparative Literature." He has made peace with it.' },
    { id: 'phones', names: ['phone', 'phones', 'table', 'pear phone', 'smartphone', 'iphone'], rect: { x: 96, y: 112, w: 128, h: 34 }, look: `The new Pear Phone 17 Pro Max Air Ultra. It has four cameras and no headphone jack, charger, buttons or reason. ${money(PHONE_PRICE)}.` },
  ],
  zones: [{ id: 'toMall', rect: { x: 0, y: 196, w: 320, h: 4 }, enter: (g) => g.goto('mall', 246, 136) }],
  draw(ctx) {
    rect(ctx, EGA.white, 0, 10, 320, 118);
    dither(ctx, EGA.white, EGA.lgray, 0, 128, 320, 72);
    ellipse(ctx, EGA.lgray, 160, 46, 10, 12);
    ellipse(ctx, EGA.lgray, 160, 32, 5, 5);
    rect(ctx, EGA.lgreen, 161, 22, 4, 4);
    person(ctx, 160, 124, GENIUS);
    rect(ctx, '#CC9966', 96, 112, 128, 8);
    rect(ctx, '#996633', 100, 120, 4, 24);
    rect(ctx, '#996633', 216, 120, 4, 24);
    for (let i = 0; i < 6; i++) rect(ctx, EGA.black, 104 + i * 20, 113, 6, 4);
    text(ctx, 'think different. pay more.', 108, 70, EGA.lgray, 6);
  },
  handle(g, cmd) {
    if (cmd.is(['talk', 'ask'], 'genius', 'employee', 'man', 'clerk', 'deshawn', 'salesman') || (cmd.is('talk') && cmd.words.length === 0 && g.near('genius', 60))) {
      if (!g.needNear('genius', 60)) return true;
      g.award('talkGenius');
      g.say(cycle(g, 'geniusTalk', [
        `"Welcome to Pear. Every phone is ${money(PHONE_PRICE)}, or ${money(Math.round(PHONE_PRICE / 24))} a month for 24 months with credit approval."\n\nYou tell him your last credit report was in 1992. "Oh. That's... not a credit score. That's a carbon date."`,
        '"Once you buy it, connect to Wi-Fi to set it up. Everything lives on the phone now. Your bank, your taxi, your dating life, your sense of self."',
        '"I wrote my dissertation on the unreliable narrator. Now I explain AirDrop to retirees. Honestly? Same skill set."',
      ]));
      return true;
    }
    if (cmd.is(['buy', 'get'], 'phone', 'pear', 'pear phone', 'smartphone', 'iphone', 'cell') || (cmd.is('buy') && cmd.words.length === 0)) {
      if (g.has('phone')) { g.say('One phone is plenty. Two phones is a lifestyle Sgt. Bonds would want to ask about.'); return true; }
      if (!g.needNear('genius', 60) ) return true;
      if (g.s.cash < PHONE_PRICE) {
        g.say(`"That's ${money(PHONE_PRICE)}." You empty your wallet: ${money(g.s.cash)}, a Blockbuster card and a 1987 lubber. Deshawn gently slides the lubber back to you. "Keep that. Somebody might need it. Historically."`);
        return true;
      }
      g.s.cash -= PHONE_PRICE;
      g.give('phone');
      g.award('buyPhone');
      g.say(`You pay ${money(PHONE_PRICE)} in cash. Deshawn has to call a manager to remember how cash works. They count it twice, then wash their hands.\n\nYou are now the owner of a Pear phone. It asks you to connect to Wi-Fi.\n\nYou have ${money(g.s.cash)} left.`);
      return true;
    }
    if (cmd.is('flirt') && g.near('genius', 60)) {
      g.say('"Sir, I can book you a Genius appointment, but not for that."');
      return true;
    }
    return false;
  },
};

// ---------------------------------------------------------------- global

export const chapter1: Content = {
  title: 'Leisure Suit Larry: Woke Up Broke',
  chapter: 'Chapter 1: Rip Van Laffer',
  startRoom: 'backroom',
  start: { x: 60, y: 178 },
  startInventory: ['wallet'],
  startCash: 342,
  rooms: [backroom, lounge, street, mall, babbages, pear],
  items,
  points: {
    getBox: 5, password: 5, mirror: 1, graffiti: 1, readPaper: 2,
    tv: 3, wifi: 2, getPin: 3, wearPin: 3, talkSage: 2,
    talkBonds: 3, showPaper: 2, askMansion: 2, passBonds: 2,
    talkCouple: 3, sellBox: 10, talkGus: 2, askReturns: 3, buySq: 5, idea: 5,
    talkGenius: 2, buyPhone: 8, online: 5, swipr: 3, ending: 18,
  },
  intro: [
    'LEISURE SUIT LARRY: WOKE UP BROKE\n\nChapter 1: Rip Van Laffer',
    "April 29, 1992. Lost Wages. Larry Laffer celebrates his fifth successful \"return\" of King's Quest V by climbing into the hot tub in the back room of Lefty's Bar with a bottle of the house vodka.\n\nHe closes his eyes for just a minute.",
    'October 19, 2026.\n\nLarry opens his eyes. The hot tub is empty. His suit still fits, mostly. Something is very, very different.\n\n(Type HELP for instructions. Save often. This is a Sierra game.)',
  ],
  handle(g, cmd) {
    if (cmd.is('wear', 'pin', 'ally pin', 'badge') || cmd.is('use', 'pin')) {
      if (!g.has('pin')) { g.say("You don't have a pin. Your allyship is purely theoretical."); return true; }
      if (g.flag('pinWorn')) { g.say("It's already on your lapel, doing its quiet, important work."); return true; }
      g.set('pinWorn');
      g.award('wearPin');
      g.say('You pin ALLY to your lapel. Nothing about you has changed, and yet society already likes you 30% more.');
      return true;
    }
    if (cmd.is('remove', 'pin')) {
      if (!g.flag('pinWorn')) return false;
      g.set('pinWorn', false);
      g.say('You take off the pin. Somewhere, a hashtag notices.');
      return true;
    }
    if (cmd.is('remove', 'suit', 'clothes', 'pants', 'leisure suit') || (cmd.is('remove') && cmd.words.length === 0)) {
      if (g.room.public) {
        g.die('You peel off the leisure suit in public. The polyester makes a sound like velcro tearing a reputation in half.\n\nSgt. Sonny Bonds arrives in eleven seconds. "Sir, that\'s indecent exposure AND a hate crime against everybody\'s eyes."\n\nLarry spends the rest of the game in a holding cell with a man who keeps trying to sell him a timeshare in the Metaverse.', 'BUSTED');
      } else {
        g.say('You take off the suit, look at yourself in the dusty mirror, and put it right back on. Some things are better left in 1992.');
      }
      return true;
    }
    if (cmd.is('read', 'newspaper', 'paper') && g.has('newspaper')) {
      g.award('readPaper');
      return false;
    }
    if (cmd.is(['read', 'look', 'use', 'open'], 'space quest', 'sq', 'sq12') && g.has('sq')) {
      if (cmd.verb === 'look') return false;
      g.set('hasIdea');
      g.award('idea');
      g.say("You read the back of the box. Twice. Then a third time, moving your lips.\n\n\"Build a rocket. Land it again. Sell tickets to space. Become the richest janitor in the galaxy.\"\n\nNot janitor, you think. OWNER. Reusable rockets. Electric leisure suits. A social network where everyone has to read Larry's jokes.\n\nYou have an IDEA. It's a terrible idea. That's how you know it will raise a Series A.");
      return true;
    }
    if (cmd.is(['use', 'swipe'], 'swipr', 'phone', 'right', 'left', 'app', 'dating') || cmd.is('swipe')) {
      if (!g.has('phone')) { g.say('You swipe right on the air. The air does not swipe back.'); return true; }
      if (!g.flag('phoneOnline')) { g.say('"Connect to Wi-Fi to continue." The phone is a $999 mirror until then.'); return true; }
      g.award('swipr');
      g.say(cycle(g, 'swiprUses', [
        'You open Swipr. Bio: "Larry, 68. Into hot tubs, King\'s Quest, long walks into traffic." You swipe right on everyone.\n\nIT\'S A MATCH! "Brittany, 24. Crypto, travel, link in bio." She messages instantly: "hey handsome want to invest in my coin?"\n\nShe\'s a bot. You are still flattered.',
        'Swipr says you have 0 new matches and 1 new "safety reminder."',
        'Swipr suggests you upgrade to Swipr Platinum for $49.99 a month. You can buy ONE box of King\'s Quest V with that. In 1992 money. You close the app.',
      ]));
      return true;
    }
    if (cmd.is('use', 'phone') || cmd.is('call')) {
      if (!g.has('phone')) return false;
      if (!g.flag('phoneOnline')) { g.say('"Connect to Wi-Fi to continue." You don\'t know any Wi-Fi passwords. Maybe somewhere that serves drinks writes it on a board.'); return true; }
      g.say('You have Swipr (dating), Wayno (robotaxis) and Pear Pay. Try SWIPE, or CALL ROBOTAXI when you\'re outside and ready to leave town.');
      return true;
    }
    if (cmd.is('flirt')) {
      g.say("There's nobody here worth getting canceled over.");
      return true;
    }
    if (cmd.is(['use', 'give', 'show'], 'lubber', 'condom')) {
      g.say('The 1987 lubber has fossilized. It could be carbon-dated. Also, according to the news, the world has moved on.');
      return true;
    }
    if (cmd.is('sleep')) {
      g.say('You already slept for thirty-four years. Your body is fully rested. Your references are not.');
      return true;
    }
    if (cmd.is('dance')) {
      g.say('You bust out the Hustle. Somewhere, a TikTok algorithm wakes up and quietly decides you\'re "vintage core."');
      return true;
    }
    return false;
  },
  hint(g) {
    if (!g.flag('gotBox')) return "That King's Quest box on the crate looks important. GET it.";
    if (!g.flag('doorOpen')) return g.flag('knocked') ? 'They want a password. The wall seems to know it. SAY it.' : 'The door is locked from outside. Try KNOCKing. The graffiti on the wall might be useful afterward.';
    if (!g.has('pin')) return 'The bar has a bowl of free pins. Free things are always useful in adventure games.';
    if (!g.flag('pinWorn')) return 'A pin only works if you WEAR it.';
    if (!g.flag('soldBox') && g.has('kq5')) return "Someone in the mall collects old Sierra games. Babbage's will honor your receipt, but think carefully: is that a good deal?";
    if (!g.has('sq')) return "Babbage's bargain bin has something cheap, and the back of it reads like a business plan.";
    if (!g.flag('hasIdea')) return 'READ your Space Quest box. Really read it.';
    if (!g.has('phone')) return 'Everything is on your phone now. The Pear Store sells them.';
    if (!g.flag('phoneOnline')) return 'Your phone needs Wi-Fi. LFTY has the password on its chalkboard. Use the phone inside the bar.';
    return 'You have a phone, an idea and Wi-Fi. Go outside and CALL ROBOTAXI.';
  },
};
