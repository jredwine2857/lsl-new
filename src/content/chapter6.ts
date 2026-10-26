// Chapter 6: Larry to Mars. The finale.
// Houston and Cerritos. Larry finally learns to listen: to an engine, to
// Grace Cho, to Tom Cruise, and to the song. There is exactly one ending.

import { EGA, dither, ellipse, person, poly, rect, text } from '../engine/gfx';
import { backdrop } from '../engine/art';
import { money, type Game } from '../engine/game';
import type { Command } from '../engine/parser';
import type { Content, Item, Room } from '../engine/types';
import { pamSave, pamScenes } from './pam';
import { CLIMB_HANDS, climbFrame, cup, launchButton, pullupFrame, stunt } from './props6';
import { scenes6 } from './scenes6';

const GRACE = { sprite: 'grace', hair: EGA.black, top: EGA.lblue, pants: EGA.blue, accent: EGA.white, longHair: true };
const WILLOW = { sprite: 'willow', hair: EGA.lmagenta, top: EGA.green, pants: EGA.blue, accent: EGA.yellow, longHair: true };
const CRUISE = { sprite: 'cruise', hair: EGA.brown, top: EGA.white, pants: EGA.white, accent: EGA.lred, glasses: true };
const DAD = { sprite: 'mrcho', hair: EGA.dgray, top: EGA.white, pants: EGA.dgray, accent: EGA.blue, glasses: true };
const MOM = { sprite: 'mrscho', hair: EGA.black, top: EGA.lmagenta, pants: EGA.dgray, accent: EGA.yellow, dress: true };
const KRIS = { sprite: 'kris', hair: EGA.black, top: EGA.white, pants: EGA.white, accent: EGA.yellow, glasses: true };
const SNOOP = { sprite: 'snoop-gold', hair: EGA.black, skin: '#AA6633', top: EGA.yellow, pants: EGA.yellow, accent: EGA.black, longHair: true };
const ASHLEIGH = { sprite: 'ashleigh', hair: EGA.brown, top: EGA.lmagenta, pants: EGA.blue, longHair: true, glasses: true };
const SPACEY = { sprite: 'spacey', hair: EGA.dgray, top: EGA.dgray, pants: EGA.dgray, accent: EGA.red };

const has = (g: Game, f: string) => !!g.flag(f);

/** Any way of asking Grace to marry you: PROPOSE, MARRY GRACE, WILL YOU MARRY ME, GET ON ONE KNEE, GIVE RING... */
function isProposal(cmd: Command): boolean {
  return /\b(propose|proposal|marry|marriage|kneel|one knee|pop the question|her hand|engaged)\b/i.test(cmd.raw) ||
    cmd.is(['give', 'show', 'use', 'offer'], 'ring', 'engagement ring', 'grandma ring');
}

function cycle(g: Game, key: string, lines: string[]): string {
  const n = g.bump(key);
  return lines[Math.min(n, lines.length - 1)];
}

const SONGS = ['islands in the stream', 'islands', 'stream', 'dolly', 'kenny', 'dolly parton', 'kenny rogers'];

// ---------------------------------------------------------------- items

const items: Item[] = [
  {
    id: 'wallet',
    name: 'a 1992 wallet',
    names: ['wallet', 'money', 'cash', 'blockbuster card'],
    look: (g) => `Velcro. ${money(g.s.cash)} and an expired Blockbuster card. For the first time in your life, the wallet is the cheapest thing about you.`,
  },
  {
    id: 'phone',
    name: 'a Pear phone',
    names: ['phone', 'pear phone', 'smartphone', 'cell'],
    look: 'Your contacts, in order of how often they save you: Kris, Pam (no number, she just appears), Snoop, Maricel. Maricel has texted: "Call me before you meet her family. I mean it."',
  },
  {
    id: 'kriscard',
    name: "Kris's business card",
    names: ['card', 'business card', 'kris card', 'kris'],
    look: (g) => `KRIS. Momager. "Call me before you do anything stupid. Or after. Mostly after."\n\nLifeline calls left: ${g.lifelinesLeft()}.`,
  },
  {
    id: 'chili',
    name: "a bowl of Willow's chili",
    names: ['chili', 'bowl', 'food', 'lunch', 'meal'],
    look: 'A bowl from Willow\'s Kitchen: Skyline chili over rice, with a spoonful of Alicia\'s vegan kimchi on top. It should not work. It works.',
  },
  {
    id: 'ring',
    name: "Grandma Cho's ring",
    names: ['ring', 'engagement ring', 'grandma ring'],
    look: 'A gold band with a big, shiny, frankly ridiculous diamond. It throws rainbows on the ceiling. Mrs. Cho pressed it into your hand and said, "Her grandmother would have liked you. She also never stopped talking."',
  },
];

// ---------------------------------------------------------------- rooms

const hangar: Room = {
  id: 'hangar',
  title: 'LaffX Hangar, Houston',
  public: true,
  walk: { x: 4, y: 150, w: 312, h: 50 },
  describe: (g) =>
    `The LaffX hangar in Houston, next door to Mission Control. A rocket engine the size of a minivan sits on a test stand. ${has(g, 'invited') ? '' : 'A woman in a blue LaffX jacket is glaring at it with a wrench. '}Willow's Kitchen has parked a food truck by the door. A man in aviator sunglasses is doing pull-ups on the scaffolding for no one. The LaffX jet to California is out the west door. Mission Control is east.`,
  hotspots: [
    { id: 'grace', names: ['grace', 'grace cho', 'cho', 'woman', 'engineer'], rect: { x: 113, y: 128, w: 14, h: 40 }, visible: (g) => !has(g, 'invited'), look: (g) => { g.award('lookGrace'); return 'Grace Cho, LaffX\'s lead propulsion engineer. Cerritos born, Caltech trained, safety glasses pushed up into her hair. She has the specific glare of a brilliant person surrounded by people who are not listening to her.\n\nSomething in your chest does a thing it hasn\'t done since 1987. You decide, for once, not to say anything about it.'; } },
    { id: 'engine', names: ['engine', 'rocket engine', 'stand', 'test stand', 'injector', 'motor'], rect: { x: 140, y: 78, w: 80, h: 74 }, look: 'The LaffX Raptor-Ish engine, hanging nozzle-down in a steel test stand: a polished bell, a copper throat, two turbopumps and more plumbing than a Cincinnati chili parlor. During every test fire it makes a long, rising whine. Grace says the whine is "wrong." Nobody else can hear what she means.' },
    { id: 'truck', names: ['truck', 'food truck', 'willow', 'kitchen', 'willows kitchen'], rect: { x: 10, y: 110, w: 70, h: 42 }, look: 'WILLOW\'S KITCHEN: ACTUALLY FREE FOOD. Willow waves from the window in a hairnet, pink hair and all.' },
    { id: 'cruise', names: ['cruise', 'tom', 'tom cruise', 'man', 'aviators', 'astronaut'], rect: { x: 240, y: 106, w: 20, h: 58 }, look: 'Tom Cruise, in a flight suit he brought from home, doing pull-ups on the scaffolding. He has volunteered as LaffX\'s stunt astronaut. Nobody asked for a stunt astronaut.' },
  ],
  zones: [
    {
      id: 'toControl',
      rect: { x: 308, y: 150, w: 12, h: 50 },
      enter: (g) => {
        if (!has(g, 'duet')) { g.s.x = 296; g.say('Mission Control is locked down until launch week. Kris\'s text: "Meet the parents first. Then rockets."'); return; }
        g.goto('control', 20, 172);
      },
    },
    {
      id: 'toJet',
      rect: { x: 0, y: 150, w: 8, h: 50 },
      enter: (g) => {
        if (!has(g, 'invited')) { g.s.x = 20; g.say('The LaffX jet is fueled and ready to go to California. You have no reason to go to California. Yet.'); return; }
        g.say('The LaffX jet takes you to Long Beach. A car takes you to Cerritos. Grace is already there, because she drove like an engineer.');
        g.goto('norae', 30, 174);
      },
    },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch6-hangar');
    // Willow behind the serving window
    ctx.save();
    ctx.beginPath();
    ctx.rect(24, 118, 34, 14);
    ctx.clip();
    person(ctx, 42, 162, WILLOW);
    ctx.restore();
    backdrop(ctx, 'ch6-hangar-fg');
    // the engine's status lamp on its control box, and a flicker of vapour from the bell
    rect(ctx, has(g, 'engineFixed') ? EGA.lgreen : EGA.yellow, 225, 100, 6, 6);
    if (Math.floor(t * 3) % 2) ellipse(ctx, EGA.lcyan, 180, 147, 12, 2);
    if (!has(g, 'invited')) person(ctx, 120, 166, GRACE, 'right');
    // Tom doing pull-ups on a bar across the scaffold, counting out loud
    rect(ctx, '#5A606A', 236, 111, 28, 3);
    rect(ctx, '#C8CED8', 236, 111, 28, 1);
    const pu = pullupFrame(t);
    if (!stunt(ctx, pu.name, 250, 112)) person(ctx, 250, 162, CRUISE, 'down');
    if (pu.top) text(ctx, String(47 + (pu.rep % 50)), 266, 100, EGA.white, 5);
  },
  handle(g, cmd) {
    if (cmd.is(['listen', 'hear']) && (cmd.about('engine', 'injector', 'whine', 'sound', 'motor', 'it') || (!cmd.words.length && g.near('engine', 50)))) {
      if (!g.needNear('engine', 50)) return true;
      if (has(g, 'engineFixed')) { g.say('The engine hums a perfect A. You could tune a piano to it.'); return true; }
      if (!has(g, 'talkedGrace')) { g.say('You listen. It whines. You don\'t know what you\'re listening for yet. Maybe ask the engineer.'); return true; }
      g.set('engineFixed');
      g.award('listenEngine');
      g.sfx('tuned');
      g.say('Grace fires up a test. You close your eyes and listen. Not to fix it. Just to listen.\n\nThirty-four years running a karaoke bar. You have heard "My Way" sung flat by four thousand drunk men. You know flat.\n\n"It\'s flat," you say. "About a quarter-tone. Right at the top. Like a guy who can\'t hit the last note of \'Sweet Caroline.\'"\n\nGrace stares at you. She grabs a laptop, checks the injector frequency, and slowly turns around. "It\'s a quarter-tone flat. At the top. Nobody else could hear that." She adjusts a valve. The whine resolves into a clean, perfect note.\n\nFor the first time, Grace Cho looks at you like you\'re worth listening to.');
      return true;
    }
    if (cmd.is(['use', 'start', 'push', 'fire', 'touch', 'turn'], 'engine', 'rocket engine', 'stand', 'button', 'motor')) {
      if (!g.needNear('engine', 60)) return true;
      g.die('You find a big switch on the test stand marked "DO NOT" and decide that is the beginning of a sentence.\n\nThe engine fires. You are standing directly behind it. You leave the hangar at roughly the speed of sound and land in the parking lot of a Buc-ee\'s forty miles away, where they sell you a brisket sandwich out of respect.', 'TEST FIRE', true);
      return true;
    }
    if (cmd.is('ask') && cmd.about('music', 'song', 'songs', 'karaoke', 'favorite', 'sing', 'singing', 'family', 'parents')) {
      if (!g.needNear('grace', 60)) return true;
      g.award('askMusic');
      g.set('heardSong');
      g.say('You ask Grace what music she likes. Then you do something you have never done in your life. You shut up and wait for the whole answer.\n\n"My parents own a noraebang in Cerritos. A karaoke place. I grew up doing homework in Room 3." She smiles for the first time. "Every anniversary my dad sings \'Islands in the Stream\' with my mom. He does Kenny. She does Dolly. He\'s terrible. She\'s amazing. It\'s the most romantic thing I\'ve ever seen."\n\nYou file that away. Carefully. Like the 1987 lubber.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'grace', 'grace cho', 'cho', 'woman', 'engineer') || (cmd.is('ask') && cmd.about('engine', 'injector', 'whine'))) {
      if (!g.needNear('grace', 60)) return true;
      g.set('talkedGrace');
      g.award('talkGrace');
      g.say(cycle(g, 'grace', [
        '"You\'re Larry. The founder. The suit." She doesn\'t look up from the engine. "I\'ve read your Wikipedia page. I\'ve read your hearing transcripts from 1992. Please don\'t say anything charming. I don\'t have time for charming."\n\n"This engine whines on every test fire, and it\'s WRONG, and nobody here can hear it but me. Everybody says it\'s fine. It\'s not fine. I\'d kill for one person who could hear it."',
        '"I haven\'t eaten since Tuesday. It\'s Thursday. Don\'t make it weird."',
        '"If you want to actually talk to me, ask me something about me. Nobody here ever does. They just tell me about crypto."',
      ]));
      return true;
    }
    if (cmd.is(['get', 'buy', 'order', 'talk', 'ask'], 'chili', 'food', 'lunch', 'bowl', 'willow', 'truck', 'kitchen')) {
      if (!g.needNear('truck', 50)) return true;
      if (g.has('chili') || has(g, 'invited')) { g.say('"One bowl per hero, Larry," Willow says. "You\'re not a hero yet. You\'re a guy with a rocket."'); return true; }
      g.give('chili');
      g.award('getFood');
      g.say('Willow leans out of the window. "LARRY! We feed the whole launch crew now. Free. No solidarity fee." She hands you a bowl. "Skyline chili on rice with Alicia\'s vegan kimchi. Dottie sends her love. Rick washed the dishes for a week and then vanished."');
      return true;
    }
    if (cmd.is(['give', 'offer', 'show'], 'chili', 'food', 'lunch', 'bowl')) {
      if (!g.has('chili')) return false;
      if (!g.needNear('grace', 60)) return true;
      g.drop('chili');
      g.set('invited');
      g.award('giveFood');
      g.say('You set the bowl down next to her wrench and walk away without a word, like a man who has finally learned what "Don\'t make it weird" means.\n\nYou\'re halfway across the hangar when she calls after you. "Larry." She\'s eating. "This is really good." A pause. "My family\'s doing karaoke night in Cerritos tomorrow. You owned a karaoke bar, right?" Another pause. "If you come, you have to actually sing. And you have to be nice to my dad. He\'s read your hearing transcripts too."\n\nShe heads out the west door to the jet.');
      return true;
    }
    if (cmd.is('flirt')) {
      if (g.near('grace', 70)) {
        g.die('You lean on the engine and say, "Hey, beautiful. Want to see a REAL rocket?"\n\nGrace hands you her wrench, walks to the exit, and quits LaffX on the spot. So does the entire propulsion team, out of solidarity. The rocket never flies. You are 68, the founder of a company with no engineers, and you just used the oldest line in your book on the only woman who ever heard the whine.', 'GROUNDED FOR GOOD', true);
        return true;
      }
      if (g.near('cruise', 60)) { g.say('You wink at Tom Cruise. He winks back, then sprints up the scaffolding to show you he can.'); return true; }
      return false;
    }
    if (cmd.is(['talk', 'ask'], 'cruise', 'tom', 'tom cruise', 'astronaut')) {
      if (!g.needNear('cruise', 60)) return true;
      g.award('talkCruise');
      g.say(cycle(g, 'cruise', [
        '"Larry! Tom. Stunt astronaut. I do my own stunts. All of them. In SPACE." He drops from the scaffold, lands in a three-point stance, and checks that someone saw.',
        '"When that rocket launches, Larry, I want to be ON it. Not IN it. ON it." He means this. He has already bought the suction cups.',
      ]));
      return true;
    }
    return false;
  },
};

const norae: Room = {
  id: 'norae',
  title: 'Cho Family Noraebang, Cerritos',
  public: true,
  walk: { x: 4, y: 152, w: 312, h: 47 },
  describe: (g) =>
    `Room 3 at the Cho family's noraebang in Cerritos: velvet couches, a disco ball, two microphones, tambourines and a giant screen with a Korean music video of a man running along a beach. Mr. Cho sits with his arms folded. Mrs. Cho is pouring barley tea. Grace is at the song book${has(g, 'duet') ? ', laughing' : ', pretending not to watch what you do'}. The door back to the car is west.`,
  hotspots: [
    { id: 'grace', names: ['grace', 'grace cho', 'cho', 'her'], rect: { x: 213, y: 130, w: 14, h: 40 }, look: 'Grace, out of her LaffX jacket, in a sweater, nervous in a way she never is at work. She keeps glancing at her dad.' },
    { id: 'dad', names: ['dad', 'father', 'mr cho', 'mister cho', 'man', 'her dad'], rect: { x: 93, y: 130, w: 14, h: 40 }, look: 'Mr. Cho, retired aerospace machinist, arms folded. He has the same glare as Grace, with thirty more years of practice. Michael Jordan would study this glare.' },
    { id: 'mom', names: ['mom', 'mother', 'mrs cho', 'missus cho', 'woman', 'her mom'], rect: { x: 143, y: 130, w: 14, h: 40 }, look: 'Mrs. Cho, who owns the place, and who is clearly the one with the beautiful voice. She is pretending to pour tea while studying you like an X-ray.' },
    { id: 'songbook', names: ['songbook', 'song book', 'book', 'songs', 'list', 'menu'], rect: { x: 240, y: 140, w: 20, h: 10 }, look: 'The song book. The duets page: "My Way" (solo, but you\'d try). "Sweet Caroline." "Total Eclipse of the Heart." "Gangnam Style." "Islands in the Stream."' },
    { id: 'screen', names: ['screen', 'tv', 'machine', 'karaoke machine', 'disco ball'], rect: { x: 90, y: 20, w: 140, h: 70 }, look: 'A karaoke screen showing a man running along a beach in slow motion for reasons the video never explains. You feel right at home. You haven\'t been in a karaoke room since you left the Philippines.' },
  ],
  zones: [
    { id: 'toHangar', rect: { x: 0, y: 152, w: 8, h: 47 }, enter: (g) => g.goto('hangar', 20, 172) },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch6-norae');
    rect(ctx, EGA.blue, 92, 22, 136, 66);
    rect(ctx, EGA.yellow, 92, 70, 136, 18);
    const rx = 100 + ((t * 30) % 120);
    person(ctx, rx, 68, { hair: EGA.black, top: EGA.white, pants: EGA.blue }, 'right', Math.floor(t * 6) % 2);
    text(ctx, has(g, 'duet') ? 'ISLANDS IN THE STREAM' : 'SELECT A SONG', 160, 76, EGA.black, 6, 'center');
    // disco ball sparkles
    for (let i = 0; i < 8; i++) {
      const a = t * 2 + i;
      rect(ctx, [EGA.yellow, EGA.lcyan, EGA.white][i % 3], 280 + Math.cos(a) * 30, 60 + Math.sin(a) * 20, 2, 2);
    }
    person(ctx, 100, 168, DAD);
    person(ctx, 150, 168, MOM);
    person(ctx, 220, 168, GRACE, 'left', has(g, 'duet') ? Math.floor(t * 4) % 2 : 0);
  },
  handle(g, cmd) {
    if (cmd.is(['bow', 'greet']) || cmd.is(['say', 'talk'], 'annyeonghaseyo', 'hello sir', 'nice to meet you')) {
      if (has(g, 'bowed')) { g.say('You bow again. Mr. Cho nods. Once was respectful. Twice is a little much. Three times and he\'ll think you\'re selling something.'); return true; }
      g.set('bowed');
      g.award('bow');
      g.say('You put down your tea, stand up straight, and bow deeply to Mr. and Mrs. Cho. Not a 1987 bow. A real one.\n\nMrs. Cho smiles. Mr. Cho unfolds exactly one arm. Grace lets out a breath she has been holding since Houston.');
      return true;
    }
    if (cmd.is(['sing', 'duet', 'pick', 'choose', 'play', 'select', 'use']) && (cmd.words.length || cmd.is(['sing', 'duet']))) {
      if (cmd.is('use') && !cmd.about('mic', 'microphone', 'machine', 'karaoke', ...SONGS)) return false;
      if (!cmd.words.length || cmd.about('mic', 'microphone', 'machine', 'karaoke') && !cmd.about(...SONGS)) { g.say('Pick a song. LOOK at the SONGBOOK. This is the most important song choice of your life. No pressure.'); return true; }
      if (has(g, 'duet')) { g.say('Mrs. Cho has already queued it up four more times.'); return true; }
      if (!has(g, 'bowed')) { g.say('You reach for the mic. Mr. Cho clears his throat, very slightly. Grace gives you a look that says: you have not even said hello to my parents.'); return true; }
      if (!cmd.about(...SONGS)) {
        const solo = cmd.about('my way', 'sinatra');
        g.die(solo
          ? 'You grab the mic and sing "My Way." All of it. Every verse. With your eyes closed. You do the big arm thing at the end. You did it your way, Larry. You did it your way for thirty-four years.\n\nWhen you open your eyes, Grace is gone. Mrs. Cho is gone. Mr. Cho is still there, arms folded, looking at you with something close to pity. "It\'s a duet night," he says. "She told you. You weren\'t listening."'
          : `You pick a song. It's a fine song. It's just not THE song.\n\nGrace sings along, politely. Mr. Cho checks his watch. Mrs. Cho refills the tea. When it ends, Grace says, "That was nice, Larry," in the voice people use for a nice coffee, and drives you to the airport.\n\nShe told you which song mattered. You weren't listening.`, 'WRONG SONG', true);
        return true;
      }
      g.set('duet');
      g.award('singDuet');
      g.cutscene('karaoke');
      g.say('You hand the second mic to Grace. "Islands in the Stream." Her eyes go wide. She looks at her mom. Her mom has a hand over her mouth.\n\nYou take Kenny. Grace takes Dolly. Thirty-four years of karaoke-bar nights pour out of you, and for the first time, you aren\'t performing. You\'re listening to her, matching her, leaving room for her. It\'s the best you have ever sung.\n\nAt the chorus, Mr. Cho stands up, takes your mic, and sings Kenny himself, terribly. Mrs. Cho joins in on Dolly. It turns into a four-part disaster. Grace laughs so hard she has to sit on the floor.\n\nWhen it ends, Mr. Cho hands you back the mic. "Okay," he says. "You listen. Good."');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'mom', 'mother', 'mrs cho', 'missus cho', 'woman', 'her mom')) {
      if (!g.needNear('mom', 60)) return true;
      if (has(g, 'duet') && !g.has('ring') && !has(g, 'proposed')) {
        g.give('ring');
        g.award('getRing');
        g.say('Mrs. Cho pulls you aside by the tambourines. She presses a little red velvet box into your hand. Inside: a gold ring with a diamond so big and shiny it throws rainbows on the tambourines.\n\n"Her grandmother\'s. I have been waiting to give it to someone who knew that song." She pats your cheek. "Don\'t do it here. Do it somewhere big. She deserves big."');
        return true;
      }
      g.say(has(g, 'duet') ? '"More tea? You sing Kenny better than my husband. Don\'t tell him."' : '"Barley tea?" She studies your suit. "Grace says you are a genius with ears. She never says anything about men. So."');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'dad', 'father', 'mr cho', 'mister cho', 'man', 'her dad')) {
      if (!g.needNear('dad', 60)) return true;
      g.award('talkDad');
      g.say(has(g, 'duet')
        ? '"I built rocket parts at Rockwell for thirty years," Mr. Cho says. "Grace builds better rockets than I ever did. You take care of her rocket." A pause. "And her."'
        : has(g, 'bowed')
          ? '"I read about you. 1992. The King\'s Quest thing." He narrows his eyes. "Grace says you heard a quarter-tone in her engine. That I believe. The rest, we\'ll see. Sing something."'
          : 'Mr. Cho looks at you. Then at your hand, which you were about to stick out for a high five. Then back at you. He says nothing. Somewhere in your head, Maricel whispers: "Larry. Manners."');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'grace', 'grace cho', 'cho', 'her')) {
      if (!g.needNear('grace', 60)) return true;
      g.say(has(g, 'duet')
        ? '"You remembered," she says. "Nobody remembers anything I say. You remembered the SONG." She shakes her head. "Okay. Launch is Monday. Mission Control. Don\'t be weird."'
        : '"Say hi to my parents first," she whispers. "Properly. Then pick a song. Please don\'t pick \'My Way.\' Everybody your age picks \'My Way.\'"');
      return true;
    }
    if (cmd.is('flirt')) {
      g.die(g.near('mom', 60)
        ? 'In a moment of pure 1987 instinct, you wink at Mrs. Cho and say, "So THAT\'S where Grace gets it."\n\nMr. Cho stands up. He was a machinist for thirty years. He escorts you to the parking lot with one hand. Grace does not follow.'
        : 'You slide onto the couch next to Grace, in front of her parents, and put your arm around her with a move you last used at Lefty\'s.\n\nMr. Cho turns off the karaoke machine. In a noraebang, that is the loudest sound there is. Grace drives you to the airport in silence.', 'NOT IN FRONT OF THE PARENTS', true);
      return true;
    }
    return false;
  },
};

norae.enter = (g) => g.award('enterNorae');

const control: Room = {
  id: 'control',
  title: 'LaffX Mission Control, Houston',
  public: true,
  walk: { x: 4, y: 152, w: 312, h: 47 },
  describe: (g) =>
    `LaffX Mission Control: rows of consoles, a giant screen showing the rocket on the pad, and everyone you have ever met. Kris runs PR from a headset. Snoop is hosting the livestream. Ashleigh is filming it for her 3 million followers. Grace is at the flight director's console. ${has(g, 'refusedSpacey') ? '' : 'A smooth gray man in a gray suit is leaning on the launch console, holding a contract. '}${has(g, 'launched') ? 'The screen shows the booster standing on the drone ship.' : 'A big red LAUNCH button waits under a plastic cover.'} The pad is east. The hangar is west.`,
  hotspots: [
    { id: 'kris', names: ['kris', 'kris jenner', 'momager'], rect: { x: 33, y: 130, w: 14, h: 40 }, look: 'Kris Jenner on three phones and a headset. She has never been prouder of a client, and she will never tell you.' },
    { id: 'snoop', names: ['snoop', 'snoop dogg', 'snoop dog', 'host'], rect: { x: 73, y: 130, w: 14, h: 40 }, look: 'Snoop Dogg in a gold LaffX jumpsuit, hosting the launch stream. "We live from Houston, nephew!"' },
    { id: 'ashleigh', names: ['ashleigh', 'date', 'livestream'], rect: { x: 113, y: 130, w: 14, h: 40 }, look: 'Ashleigh, your first Swipr date, livestreaming the launch. She waves. "Content, Larry! Finally, GOOD content!"' },
    { id: 'spacey', names: ['spacey', 'kevin', 'kevin spacey', 'gray man', 'fixer', 'man in gray', 'contract'], rect: { x: 173, y: 130, w: 14, h: 40 }, visible: (g) => !has(g, 'refusedSpacey'), look: 'A smooth Beltway fixer in a gray suit. He turns away from you, faces the player directly, and raises one eyebrow. "You\'re wondering what I\'m doing here. So am I. Let\'s find out together."' },
    { id: 'grace', names: ['grace', 'grace cho', 'cho', 'flight director'], rect: { x: 233, y: 130, w: 14, h: 40 }, look: 'Grace at the flight director\'s console, headset on, completely calm. She glances at you and does a tiny Dolly Parton shoulder shimmy. Nobody else sees it.' },
    { id: 'button', names: ['button', 'launch button', 'launch', 'console', 'red button', 'cover', 'pedestal'], rect: { x: 192, y: 118, w: 32, h: 36 }, look: (g) => `The launch pedestal: a steel stand with a hazard-striped top, a key switch, SAFE and ARMED lamps, and a big domed red button under a flip-up clear cover. On the cover, in Grace's handwriting: "LARRY: ONLY WHEN I SAY."${has(g, 'launched') ? ' The cover is up and the button is still glowing.' : has(g, 'engineFixed') && has(g, 'cruiseDown') && has(g, 'refusedSpacey') ? ' The ARMED lamp is blinking.' : ' The SAFE lamp is lit.'}` },
    { id: 'screen', names: ['screen', 'rocket', 'pad', 'monitor'], rect: { x: 60, y: 16, w: 200, h: 70 }, look: (g) => (has(g, 'cruiseDown') ? 'The rocket on the pad, clean. No Tom Cruise on it anywhere. Engines green.' : 'The rocket on the pad. Wait. Zoom in. There is a man climbing up the OUTSIDE of the rocket with suction cups. It\'s Tom Cruise.') },
  ],
  zones: [
    { id: 'toHangar', rect: { x: 0, y: 152, w: 8, h: 47 }, enter: (g) => g.goto('hangar', 296, 172) },
    { id: 'toPad', rect: { x: 308, y: 152, w: 12, h: 47 }, enter: (g) => g.goto('pad', 20, 174) },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch6-control');
    dither(ctx, EGA.lcyan, EGA.lblue, 60, 18, 200, 66);
    rect(ctx, EGA.white, 154, 30, 12, 50);
    poly(ctx, EGA.white, [[154, 30], [160, 18], [166, 30]]);
    text(ctx, 'LaffX', 160, 50, EGA.blue, 5, 'center');
    if (!has(g, 'cruiseDown')) {
      // a tiny Tom clinging to the side of the rocket on the monitor
      const ty = Math.round(66 - Math.abs(Math.sin(t)) * 20);
      rect(ctx, EGA.brown, 166, ty, 2, 2);
      rect(ctx, EGA.white, 166, ty + 2, 2, 4);
    }
    if (has(g, 'launched')) { rect(ctx, EGA.blue, 60, 74, 200, 10); rect(ctx, EGA.white, 200, 58, 6, 16); }
    for (let i = 0; i < 3; i++) {
      for (let x = 16; x < 300; x += 18) rect(ctx, (x + i + Math.floor(t * 3)) % 3 ? EGA.lgreen : EGA.lred, x, 99 + i * 14, 2, 2);
    }
    const launched = has(g, 'launched');
    launchButton(ctx, 208, 118, 1.25, { armed: has(g, 'engineFixed') && has(g, 'cruiseDown') && has(g, 'refusedSpacey'), cover: launched ? 1 : 0, press: launched ? 1 : 0 }, t);
    person(ctx, 40, 168, KRIS);
    person(ctx, 80, 168, SNOOP, 'down', Math.floor(t * 2) % 2);
    person(ctx, 120, 168, ASHLEIGH);
    if (!has(g, 'refusedSpacey')) person(ctx, 180, 168, SPACEY, 'down');
    person(ctx, 240, 168, GRACE, 'left');
  },
  handle(g, cmd) {
    if (isProposal(cmd)) {
      if (!g.has('ring')) { g.say(has(g, 'duet') ? 'With what? Mrs. Cho said she\'d been waiting to give something to the right man. Maybe ask her.' : 'You don\'t even know her parents yet.'); return true; }
      if (!has(g, 'launched')) { g.say('You start to kneel. Grace doesn\'t even turn around. "Larry, if that\'s what I think it is, I am landing a ROCKET first."'); return true; }
      g.drop('ring');
      g.set('proposed');
      g.award('ending');
      g.cutscene('proposal');
      g.win(`You get down on one knee, in Mission Control, in front of Snoop, Kris, Ashleigh, three million livestream viewers and a booster standing on a boat called TRY LISTENING THIS TIME.\n\nYou don't make a speech. For once in your life, you ask a question and then you shut up.\n\n"Grace Cho. Will you marry me?"\n\nShe looks at the ring. She knows it instantly. Her mom gave it to you. Her dad let her. She laughs, the real laugh from the noraebang, and says, "Yes. Obviously yes. Get up, your knees are 68."\n\nSnoop drops the beat to "Islands in the Stream." Kris is crying and denying it. Ashleigh's stream breaks Swipr.\n\n\nEPILOGUE\n\nThey are married in Cerritos, at the noraebang, in Room 3. Mr. Cho sings Kenny, terribly. Willow caters. Barry Sanders refuses to dance, then dances. Rick Moranis turns up, nobody knows how. Pam Anderson sends a card with a photo of a rescued bear, signed "The one who got away. Be happy, Larry." Maricel flies in from the Philippines, hugs Grace and whispers, "He listens now? Really?" Grace whispers back, "Mostly."\n\nThey live happily ever after in a house in Cerritos with a karaoke machine in every room and, on the mantel, in a glass case, a sealed copy of King's Quest V. Ken and Roberta send a note: "Never return it."\n\nEvery anniversary, they sing "Islands in the Stream." He does Kenny. She does Dolly. He's terrible. She's amazing.\n\nLarry Laffer: unscathed, the richest man in America, and finally, really, listening.\n\n\nTHE END\n\nThanks for playing LEISURE SUIT LARRY: WOKE UP BROKE.\n\nFinal score: ${g.s.score} of ${g.maxScore}.`, 'THE END');
      return true;
    }
    if (has(g, 'launched') && g.has('ring') && /\b(love|grace|kiss|hug)\b/i.test(cmd.raw) && cmd.is(['say', 'tell', 'talk', 'kiss', 'hug', 'love'])) {
      g.say('Grace is looking right at you. Your hand is in your pocket, on Grandma Cho\'s ring. There is exactly one right thing to do with it. (PROPOSE.)');
      return true;
    }
    if (cmd.is(['sign', 'accept', 'take', 'yes']) || (cmd.is('say') && cmd.about('yes', 'deal', 'sign', 'okay', 'ok'))) {
      if (has(g, 'refusedSpacey') || !has(g, 'heardDeal')) return false;
      g.die('You sign the gray man\'s contract without reading it. You have never read anything in your life except the fine print in Cincinnati, and you\'ve forgotten that already.\n\nThe contract says you work for Bill Gates now.\n\nThree weeks later you are sitting in front of a congressional hearing. Every stupid thing you have ever done is on the big screen: the King\'s Quest return, the six-way, the kiss cam, the banana. The gray man is running the hearing. He turns to the camera and winks at you, the player.\n\n"Some people listen," he says. "Some people sign."\n\nNo rocket. No Grace. No ending. This is how you lose.', 'CONGRESSIONAL HEARING', false);
      return true;
    }
    if (cmd.is(['refuse', 'decline', 'tear', 'rip', 'no']) || (cmd.is('say') && cmd.about('no', 'no thanks', 'pass', 'never'))) {
      if (has(g, 'refusedSpacey') || !has(g, 'heardDeal')) return false;
      g.set('refusedSpacey');
      g.award('refuseSpacey');
      g.say('"No thanks, pal. I read the fine print once. In Cincinnati. Changed my life."\n\nThe gray man looks at you, then turns to face the player directly. "Well. That\'s disappointing. For him." He nods at the screen, where a news ticker crawls: "GATES SPOKESMAN DENIES ANY LINK TO LaffX FIXER."\n\nKris doesn\'t even look up from her phones. "I already got the launch license from the FAA this morning, Kevin. Bye, Kevin." He leaves the way he came in: slowly, toward the camera.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'spacey', 'kevin', 'kevin spacey', 'gray man', 'fixer', 'man in gray')) {
      if (has(g, 'refusedSpacey')) return false;
      if (!g.needNear('spacey', 60)) return true;
      g.set('heardDeal');
      g.award('talkSpacey');
      g.say('The gray man smiles at you, then turns and speaks straight to the player. "Larry has a lot of history. Congress has a lot of questions. I make questions go away."\n\nHe turns back and holds out a contract and a pen. "Sign, and your launch license sails through, and nobody ever brings up 1992 again. Just sign. Don\'t read it. Nobody reads it."\n\n(SIGN the contract, or REFUSE.)');
      return true;
    }
    if (cmd.is(['push', 'press', 'use', 'open', 'hit', 'launch']) && (cmd.about('button', 'launch', 'red button', 'rocket', 'console', 'cover') || cmd.is('launch'))) {
      if (has(g, 'launched')) { g.say('It already launched, Larry. It\'s gone. Look at the screen. The booster is home.'); return true; }
      if (!g.needNear('button', 60)) return true;
      if (!has(g, 'engineFixed')) { g.say('Grace slaps your hand off the cover. "The engine\'s still flat. ONLY WHEN I SAY."'); return true; }
      if (!has(g, 'cruiseDown')) { g.say('Grace slaps your hand off the cover. "There is a MOVIE STAR on the outside of the rocket, Larry! ONLY WHEN I SAY." On the screen, Tom Cruise gives a thumbs up.'); return true; }
      if (!has(g, 'refusedSpacey')) { g.say('The gray man puts one manicured finger on the cover. "No license, no launch. Unless you sign." He offers you the pen again.'); g.set('heardDeal'); return true; }
      g.set('launched');
      g.award('launch');
      g.cutscene('launch');
      g.s.cash += 40000000000;
      g.say('Grace looks at you. "Now."\n\nYou flip up the cover and press LAUNCH. The whole building shakes. On the screen, the LaffX Laffer One climbs on a column of fire, singing a perfect A, all the way up.\n\nStage separation. Then, eight minutes later, the booster comes back down, flips, and lands upright on the drone ship. The drone ship is named TRY LISTENING THIS TIME.\n\nMission Control goes insane. Snoop is yelling. Ashleigh is crying into her phone. Kris finally puts down all three phones and hugs you.\n\nYour Pear phone buzzes. FORBES ALERT: "LARRY LAFFER, 68, IS NOW THE RICHEST MAN IN AMERICA." Elon texts: "congrats lol. rematch."\n\nGrace takes off her headset. She\'s looking at you. Now would be a good time to say something.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'grace', 'grace cho', 'cho', 'flight director')) {
      if (!g.needNear('grace', 60)) return true;
      g.say(has(g, 'launched')
        ? '"We did it," she says quietly, still watching the booster. "You heard the engine. I landed the booster." She looks at you. "Was there something you wanted to ask me?"'
        : !has(g, 'cruiseDown')
          ? '"Tom Cruise is on the outside of my rocket. I can\'t launch with a movie star on it. Go out to the pad and get him down. And Larry? Don\'t argue with him. Just listen. He\'s scared. Scared people climb things."'
          : '"Engines green. Pad clear. Wait for my call."');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'kris', 'kris jenner', 'momager')) {
      if (!g.needNear('kris', 60)) return true;
      g.award('talkKris');
      g.say(has(g, 'launched') ? '"I am not crying. It\'s the rocket fuel. Go talk to that girl."' : '"Larry. This is it. Three networks, Snoop on the mic, Ashleigh streaming. Do NOT sign anything that gray man gives you. I\'ve handled him before. Just say no and let me do the rest."');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'snoop', 'snoop dogg', 'snoop dog', 'host')) {
      if (!g.needNear('snoop', 60)) return true;
      g.award('talkSnoop');
      g.say('"Nephew! From the backyard to the BOOSTER! I told the whole stream about your Maricel verse. Grace already watched it. Twice. Fo\' shizzle, she\'s into you. Don\'t mess it up."');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'ashleigh', 'date')) {
      if (!g.needNear('ashleigh', 60)) return true;
      g.say('"Larry! Look at you! From a 1987 hot tub photo to a rocket company. I\'m so proud. Also my niece is catering. Also I\'m engaged! To a man who looks NOTHING like his pictures!"');
      return true;
    }
    if (cmd.is('flirt')) {
      if (g.near('grace', 60)) { g.say('You do the Dolly shoulder shimmy back at her. She bites her lip to keep from laughing on the open mic. That\'s the right kind of flirting, it turns out.'); return true; }
      if (g.near('kris', 60)) { g.say('Kris doesn\'t look up. "Larry. I\'ve managed six Kardashians and a Jenner. Don\'t."'); return true; }
      return false;
    }
    return false;
  },
};

control.enter = (g) => g.award('enterControl');

const pad: Room = {
  id: 'pad',
  title: 'LaffX Launch Pad',
  public: true,
  walk: { x: 4, y: 152, w: 312, h: 47 },
  describe: (g) =>
    `The launch pad. The LaffX Laffer One towers over you, white and humming. ${has(g, 'cruiseDown') ? 'Tom Cruise is down on the ground, sitting on a crate, drinking a juice box.' : 'Halfway up the outside of the rocket, clinging on with suction cups, is Tom Cruise.'} A flame trench runs along the front of the pad. Mission Control is west.`,
  hotspots: [
    { id: 'cruise', names: ['cruise', 'tom', 'tom cruise', 'man', 'astronaut'], rect: { x: 150, y: 40, w: 30, h: 62 }, look: (g) => (has(g, 'cruiseDown') ? 'Tom Cruise, on a crate, in a foil blanket, drinking a juice box like a kid after a swim meet. He looks happier than you\'ve ever seen him in a movie.' : 'Tom Cruise, forty feet up the side of the rocket on suction cups, shouting "I do my own STUNTS!" at nobody. His knuckles are white. His eyes are scared. He is not coming down on his own.') },
    { id: 'rocket', names: ['rocket', 'laffer one', 'laffx'], rect: { x: 140, y: 14, w: 40, h: 140 }, look: 'The LaffX Laffer One. On the side, in tiny letters near the bottom, Grace has painted: "FOR THE GUY WHO HEARD THE WHINE."' },
    { id: 'trench', names: ['trench', 'flame trench', 'pit', 'flames'], rect: { x: 0, y: 186, w: 320, h: 14 }, look: 'The flame trench. During launch it carries a few thousand degrees of exhaust away from the pad. Right now it is just a very deep ditch with warning signs.' },
  ],
  zones: [
    { id: 'toControl', rect: { x: 0, y: 152, w: 8, h: 47 }, enter: (g) => g.goto('control', 296, 172) },
    { id: 'trench', rect: { x: 0, y: 188, w: 320, h: 12 }, enter: (g) => pamSave(g, 'You back up to get a better look at the rocket and step right off the edge of the flame trench.\n\nA hand grabs your collar. It\'s Pamela Anderson, in a red LaffX safety jacket. Of course it is. She hauls you back onto the pad.\n\n"Last time, Larry," she says. She\'s smiling, but she means it. "I heard about the engineer. The one who heard the whine with you." She brushes off your lapel. "Go get her. You finally deserve somebody."\n\nShe walks away across the pad, and for once you don\'t yell anything after her. The one who got away. (She won\'t be there next time. She really won\'t.)', { x: g.s.x, y: 174 }) || g.die('You back up to get a better look at the rocket and step right off the edge of the flame trench.\n\nIt\'s a long way down. Grace has to scrub the launch to fish you out. By the time they do, Tom Cruise has climbed all the way to the top and planted a flag that says "TOP GUN."', 'SCRUBBED', true) },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch6-pad');
    if (!has(g, 'cruiseDown')) {
      // Tom scrambling up the side of the rocket on suction cups, and slipping back
      const c = climbFrame(t);
      const shake = c.pop ? Math.round(Math.sin(t * 40)) : 0;
      const fx = 165 + shake;
      const fy = Math.round(98 - c.rise);
      if (stunt(ctx, c.name, fx, fy)) {
        for (const [hx, hy] of CLIMB_HANDS[c.name]) cup(ctx, fx + hx, fy + hy);
      } else {
        person(ctx, fx, fy, CRUISE, 'up');
      }
      if (c.pop) {
        cup(ctx, fx + 22, fy - 30 + Math.round((t % 5 - 2.8) * 30));
        text(ctx, 'SHHLOOP!', fx + 14, fy - 50, EGA.white, 4);
      }
    } else {
      // down safe, on a crate, with his juice box
      rect(ctx, EGA.brown, 236, 160, 16, 8);
      person(ctx, 244, 166, CRUISE);
      rect(ctx, '#F0E040', 250, 146, 3, 4);
      rect(ctx, '#40A0E0', 250, 148, 3, 1);
      rect(ctx, EGA.white, 252, 144, 1, 2);
    }
  },
  handle(g, cmd) {
    if (cmd.is(['listen', 'hear']) || cmd.is('ask', 'cruise', 'tom', 'tom cruise', 'scared', 'afraid', 'why', 'fear')) {
      if (has(g, 'cruiseDown')) { g.say('Tom is fine now. He\'s telling a pad technician about the time he held his breath for six minutes. The technician is listening. It\'s contagious.'); return true; }
      if (!has(g, 'yelledAtCruise')) { g.say('You listen. Up there, Tom Cruise is shouting, but you can\'t make out more than "STUNTS!" Talk to him first.'); return true; }
      g.set('cruiseDown');
      g.award('listenCruise');
      g.cutscene('talkdown');
      g.say('You didn\'t yell. You didn\'t argue. You just stood at the bottom of the rocket and listened until Tom ran out of shouting.\n\n"Everybody always says I\'m crazy," he told you. "Nobody asks why I keep climbing things. I\'m 64, Larry. If I\'m not on the poster, I\'m nobody."\n\n"You don\'t have to be ON the rocket to be in the shot," you said. "Ashleigh\'s got three million people watching. Come stand next to me at the button."\n\nNow he\'s on a crate in a foil blanket, working on a juice box, telling a pad technician about the time he held his breath for six minutes.');
      return true;
    }
    if (cmd.is(['talk', 'ask', 'say', 'yell', 'shout', 'call'], 'cruise', 'tom', 'tom cruise', 'down') || cmd.is(['yell', 'shout'])) {
      if (has(g, 'cruiseDown')) { g.say('"Larry! That was the best scene I\'ve ever done and there wasn\'t even a camera!" There was. Ashleigh had it.'); return true; }
      g.set('yelledAtCruise');
      g.award('talkCruisePad');
      g.say('"TOM! GET DOWN FROM THERE!"\n\n"NO!" he shouts back. "I DO MY OWN STUNTS! I\'M GOING TO SPACE ON THE OUTSIDE! IT\'S NEVER BEEN DONE!" A suction cup pops off. He catches himself with one hand and looks very, very scared for a second before he grins again.\n\nYelling isn\'t working. Somewhere in your head, Maricel says: "When someone\'s scared, Larry, don\'t fix it. LISTEN."');
      return true;
    }
    if (cmd.is(['climb', 'pull', 'grab', 'push', 'go'], 'rocket', 'cruise', 'tom', 'up', 'ladder') || cmd.is('climb')) {
      g.die('You start climbing up after him. You get eleven feet before your knees file a formal complaint and you let go.\n\nTom Cruise sees you fall and, being Tom Cruise, does a full backflip off the rocket to catch you. He doesn\'t catch you. He lands perfectly, though. Grace scrubs the launch, and the footage plays at your congressional hearing.', 'STUNT DOUBLE', true);
      return true;
    }
    if (cmd.is('flirt')) { g.say('There\'s nobody here but you, a rocket and Tom Cruise. You choose not to.'); return true; }
    return false;
  },
};

// ---------------------------------------------------------------- global

export const chapter6: Content = {
  title: 'Leisure Suit Larry: Woke Up Broke',
  chapter: 'Chapter 6: Larry to Mars',
  startRoom: 'hangar',
  start: { x: 90, y: 176 },
  startInventory: ['wallet', 'phone', 'kriscard'],
  startCash: 40000000000,
  startFlags: { phoneOnline: true, hasIdea: true },
  rooms: [hangar, norae, control, pad],
  scenes: { ...scenes6, ...pamScenes },
  items,
  points: {
    lookGrace: 2, talkGrace: 3, askMusic: 5, listenEngine: 8, getFood: 2, giveFood: 5, talkCruise: 2, callMaricel: 5,
    enterNorae: 2, bow: 6, talkDad: 3, singDuet: 12, getRing: 5,
    enterControl: 2, talkKris: 2, talkSnoop: 2, talkSpacey: 2, refuseSpacey: 6,
    talkCruisePad: 2, listenCruise: 8,
    launch: 6, ending: 10,
  },
  lifeline: {
    item: 'kriscard',
    max: 3,
    label: 'Calling Kris...',
    rescue: (g, used) => {
      const lines = [
        'Kris answers before it rings. "Houston, we have a Larry." A crisis team, a NASA liaison and Snoop arrive. Snoop just tells everybody to chill. They do. It never happened.',
        '"AGAIN? In the FINALE?" Kris sends Khloé, Kim and Caitlyn. Caitlyn gives a speech about second chances so moving that everyone forgets what you did.',
        'Kris takes a long breath. "Larry. This is the last one. Ever. Don\'t make me watch you lose her." She makes it go away. You can hear her smiling.',
      ];
      return `${lines[Math.min(used - 1, lines.length - 1)]}\n\nLifeline calls left: ${g.lifelinesLeft()}.`;
    },
  },
  intro: [
    'LEISURE SUIT LARRY: WOKE UP BROKE\n\nChapter 6: Larry to Mars',
    'Houston, Texas.\n\nLaffX has money, a rocket and a hangar next door to Mission Control. The launch is in five days. The lead engineer has never once been impressed by anything.\n\nYou\'ve been rich, famous, canceled, un-canceled and thrown a billionaire out a window. You have never once really listened to a woman.\n\nThis is the last chapter. There is one ending. Make the right choices.\n\n(Type HELP for instructions. Save often.)',
  ],
  handle(g, cmd) {
    if (cmd.is('call', 'maricel', 'ex', 'philippines')) {
      g.award('callMaricel');
      g.sfx('phone');
      g.say(cycle(g, 'maricel', [
        'Maricel picks up from the bar in the Philippines. You can hear someone murdering "My Way" in the background.\n\n"Larry! I saw you on the news. Twice. Once good." She laughs. "So. There\'s a girl. I can hear it. Okay, listen to me, because you never do.\n\nAsk her what SHE loves. Then shut up until she\'s done. Then remember it, Larry. Write it on your hand if you have to.\n\nBe respectful to her parents. Bow. You\'re not in Lefty\'s.\n\nAnd when somebody is scared, don\'t fix it, don\'t yell. Just listen. That\'s all anybody wants."',
        '"I already told you everything, Larry. Ask, shut up, remember. Bow. Listen. Go. I love you. Platonically. Go!"',
      ]));
      return true;
    }
    if (cmd.is(['call', 'use'], 'kris', 'card', 'business card', 'momager')) {
      g.say(`Kris picks up. "It's the finale, Larry. I'm saving my calls for emergencies." (${g.lifelinesLeft()} lifeline calls left. They work when you die.)`);
      return true;
    }
    if (cmd.is('call', 'pam', 'pamela')) { g.say('Pam doesn\'t have a phone. Pam just appears when you need her. You\'ve always loved that about her.'); return true; }
    if (cmd.is('eat', 'chili', 'bowl', 'food')) {
      if (!g.has('chili')) return false;
      g.say('You raise the spoon. You remember Grace hasn\'t eaten since Tuesday. You put it down. Growth.');
      return true;
    }
    if (cmd.is(['listen', 'hear'])) { g.say('You stop and listen. A forklift beeps. Your knees creak. Somewhere, a woman is saying something important. Try listening to someone specific.'); return true; }
    if (cmd.is('sing')) { g.say('You sing a few bars of "My Way." It is, as always, flat. Save it for the right room.'); return true; }
    if (cmd.is('flirt')) { g.say('There\'s nobody here worth losing her over.'); return true; }
    if (isProposal(cmd)) {
      if (has(g, 'proposed')) return false;
      if (!g.has('ring')) g.say(has(g, 'duet') ? 'With what? Mrs. Cho said she\'d been waiting to give something to the right man. Maybe ask her.' : 'Easy, Larry. You haven\'t even met her parents.');
      else if (g.s.room === 'norae') g.say('You start to kneel. Mrs. Cho catches your elbow and hauls you back up. "Not here. In a noraebang? No. Somewhere BIG. She deserves big."');
      else g.say('Grace isn\'t here. She\'s at the flight director\'s console in Mission Control, which is about as big a room as a proposal gets.');
      return true;
    }
    return false;
  },
  hint(g) {
    if (!has(g, 'callMaricel') && !g.s.awarded.includes('callMaricel')) return 'Maricel gives the best advice in the game. CALL MARICEL.';
    if (!has(g, 'talkedGrace')) return 'Talk to Grace, the engineer.';
    if (!has(g, 'engineFixed')) return 'Grace says the engine sounds wrong. You ran a karaoke bar for 34 years. LISTEN TO ENGINE.';
    if (!has(g, 'heardSong')) return 'Grace wants to be asked about herself. ASK GRACE ABOUT MUSIC.';
    if (!has(g, 'invited')) return g.has('chili') ? 'GIVE CHILI to Grace. Then leave her alone.' : 'Grace hasn\'t eaten since Tuesday. Willow\'s food truck is right there. GET CHILI.';
    if (!has(g, 'duet')) {
      if (g.s.room !== 'norae') return 'Take the jet to Cerritos. It\'s out the hangar\'s west door.';
      if (!has(g, 'bowed')) return 'Greet her parents properly. BOW.';
      return 'Sing the song she told you about: SING ISLANDS IN THE STREAM.';
    }
    if (!g.has('ring') && !has(g, 'proposed')) return 'Mrs. Cho has something for you. TALK TO MOM.';
    if (!has(g, 'refusedSpacey')) return 'At Mission Control, talk to the gray man. Then REFUSE his deal.';
    if (!has(g, 'cruiseDown')) return has(g, 'yelledAtCruise') ? 'Don\'t yell at Tom. LISTEN.' : 'Tom Cruise is on the rocket. Go to the pad and TALK TO TOM.';
    if (!has(g, 'launched')) return 'Back at Mission Control: PRESS LAUNCH.';
    return 'Grace is waiting. PROPOSE.';
  },
};
