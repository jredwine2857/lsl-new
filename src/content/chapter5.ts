// Chapter 5: Too Wild for Larry.
// Miami during Art Basel week. Larry funds LaffX, out-jumps Bill Gates, walks
// away from the wrong party, and helps Elon stop the Mandatory Update.

import { EGA, person, poly, rect, text } from '../engine/gfx';
import { backdrop } from '../engine/art';
import { money, type Game } from '../engine/game';
import type { Content, Item, Room } from '../engine/types';
import { pamSave } from './pam';

const LUBBER_PRICE = 500000000;

const STEVE = { hair: EGA.white, top: EGA.white, pants: EGA.white, accent: EGA.black };
const CURATOR = { hair: EGA.dgray, top: EGA.black, pants: EGA.black, accent: EGA.lred, glasses: true, longHair: true, dress: true };
const MORANIS = { hair: EGA.dgray, top: EGA.lcyan, pants: EGA.brown, accent: EGA.white, glasses: true };
const GATES = { hair: EGA.brown, top: EGA.lblue, pants: EGA.dgray, accent: EGA.white, glasses: true };
const ELON = { hair: EGA.brown, top: EGA.black, pants: EGA.black, accent: EGA.dgray };
const JEFFREY = { hair: EGA.lgray, top: EGA.blue, pants: EGA.white, accent: EGA.yellow };
const HEFNER = { hair: EGA.lgray, top: EGA.red, pants: EGA.black, accent: EGA.black };
const GUARD = { hair: EGA.black, top: EGA.white, pants: EGA.white, accent: EGA.blue, bald: true };

const has = (g: Game, f: string) => !!g.flag(f);

function cycle(g: Game, key: string, lines: string[]): string {
  const n = g.bump(key);
  return lines[Math.min(n, lines.length - 1)];
}

function canceled(g: Game, what: string) {
  g.die(
    `${what}\n\nThe entire Miami art world is filming. They call it "a performance piece." The internet calls it something else.\n\nLarry Laffer has been CANCELED.`,
    'CANCELED',
    true,
  );
}

// ---------------------------------------------------------------- items

const items: Item[] = [
  {
    id: 'wallet',
    name: 'a 1992 wallet',
    names: ['wallet', 'money', 'cash', 'blockbuster card'],
    look: (g) => `Velcro. ${money(g.s.cash)} and an expired Blockbuster card.${g.has('lubber') ? ' The lubber has its own pocket.' : ''}`,
  },
  {
    id: 'lubber',
    name: 'the 1987 lubber',
    names: ['lubber', 'condom', 'rubber', 'prophylactic'],
    look: 'The lubber you\'ve carried since 1987. Unopened. Faded. The wrapper says "LUBBERS: FOR THE MODERN MAN." It has survived three chapters, two airports and the entire end of an epidemic. It is, frankly, a historical document.',
  },
  {
    id: 'phone',
    name: 'a Pear phone',
    names: ['phone', 'pear phone', 'smartphone', 'cell'],
    look: 'A text from Kris: "Steve Martin is at Art Basel. Pitch him LaffX. Do NOT go on any boats. Fine, go on ONE boat. Do NOT go to any islands."',
  },
  {
    id: 'kriscard',
    name: "Kris's business card",
    names: ['card', 'business card', 'kris card', 'kris'],
    look: (g) => `KRIS. Momager. "Call me before you do anything stupid. Or after. Mostly after."\n\nLifeline calls left: ${g.lifelinesLeft()}.`,
  },
  {
    id: 'invite',
    name: 'a yacht party invitation',
    names: ['invite', 'invitation', 'yacht invite', 'yacht invitation', 'pass'],
    look: 'A gold card: "THE PARTY OF THE CENTURY. The Yacht Gigabyte, Miami Beach Marina. Guest of Steve Martin."',
  },
  {
    id: 'chair',
    name: 'a folding lawn chair',
    names: ['chair', 'lawn chair', 'folding chair'],
    look: 'Rick Moranis\'s folding lawn chair, aluminum and green webbing, circa 1984. "I always bring my own chair," he said. "You never know when they won\'t have chairs."',
  },
];

// ---------------------------------------------------------------- rooms

const basel: Room = {
  id: 'basel',
  title: 'Art Basel, Miami Beach',
  public: true,
  walk: { x: 4, y: 150, w: 312, h: 50 },
  describe: 'Art Basel, Miami Beach: white walls, champagne and people pretending to understand things. A banana is duct-taped to one wall. A man in a white suit (not you, the other one) is examining it. A severe woman with a Smithsonian badge takes notes. A small man in glasses sits in a folding lawn chair in the middle of the floor. Ocean Drive is to the east.',
  hotspots: [
    { id: 'banana', names: ['banana', 'art', 'tape', 'duct tape', 'wall', 'comedian'], rect: { x: 40, y: 50, w: 30, h: 30 }, look: (g) => { g.award('lookBanana'); return 'A banana, duct-taped to a white wall. The card reads: "COMEDIAN. Banana, duct tape. $6.2 million." A security guard watches it like it\'s the Mona Lisa.\n\nYou\'ve been carrying a historical artifact in your wallet for 39 years and nobody ever put it on a wall.'; } },
    { id: 'steve', names: ['steve', 'steve martin', 'martin', 'man', 'white suit', 'investor'], rect: { x: 113, y: 128, w: 14, h: 40 }, look: 'Steve Martin, in a white suit. He sees your white suit. You see his. A long moment passes between two men who have committed to the bit.' },
    { id: 'curator', names: ['curator', 'woman', 'smithsonian', 'lady', 'badge'], rect: { x: 183, y: 128, w: 14, h: 40 }, look: 'Dr. Ellen Pike, Smithsonian Curator of American Culture. Her badge says she\'s here "acquiring artifacts of the post-pandemic era." She has rejected four NFTs and a Bored Ape in the last hour.' },
    { id: 'moranis', names: ['moranis', 'rick', 'rick moranis', 'small man', 'man in chair'], rect: { x: 243, y: 128, w: 14, h: 40 }, look: (g) => (g.has('chair') || has(g, 'chairPlaced') ? 'Rick Moranis, standing now, holding a plastic cup of white wine with both hands.' : 'Rick Moranis, in a folding lawn chair, in the middle of Art Basel. People keep photographing him. Someone has offered $40,000 for the piece.') },
    { id: 'neon', names: ['neon', 'sign', 'neon sign'], rect: { x: 220, y: 30, w: 80, h: 20 }, look: 'A neon sign: "IS THIS ART?" Under it, a smaller neon sign: "YES. $90,000."' },
  ],
  zones: [
    { id: 'toOcean', rect: { x: 308, y: 150, w: 12, h: 50 }, enter: (g) => g.goto('ocean', 20, 172) },
  ],
  draw(ctx, g) {
    backdrop(ctx, 'ch5-basel');
    person(ctx, 120, 166, STEVE, 'left');
    person(ctx, 190, 166, CURATOR);
    if (!g.has('chair') && !has(g, 'chairPlaced')) {
      rect(ctx, EGA.lgray, 240, 156, 18, 2);
      rect(ctx, EGA.green, 242, 150, 14, 8);
      person(ctx, 250, 164, MORANIS);
    } else person(ctx, 250, 166, MORANIS);
  },
  handle(g, cmd) {
    if (cmd.is(['sell', 'give', 'show', 'donate'], 'lubber', 'condom', 'rubber')) {
      if (!g.has('lubber')) return false;
      if (!g.needNear('curator', 60)) return true;
      g.drop('lubber');
      g.s.cash += LUBBER_PRICE;
      g.set('soldLubber');
      g.award('sellLubber');
      g.say(`You hold up the 1987 lubber. "Ma'am. This has been in my wallet since the Reagan administration. I carried it through the whole epidemic. I never needed it. Now nobody does."\n\nDr. Pike puts on white gloves. Her hands shake. "Unopened? With the original wallet ring? Do you know what this IS? This is the END of an ERA."\n\nShe makes three phone calls. A Smithsonian lawyer arrives. A check arrives. The check is for ${money(LUBBER_PRICE)}.\n\nThe lubber will hang next to Archie Bunker's chair. You finally have money. Real, American, richest-man money. Well, a start.`);
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'curator', 'woman', 'smithsonian', 'lady', 'pike')) {
      if (!g.needNear('curator', 60)) return true;
      g.award('talkCurator');
      g.say(has(g, 'soldLubber')
        ? '"It\'s getting its own wing. We\'re calling the exhibit \'Unopened: 1981 to Now.\'"'
        : '"I\'m acquiring artifacts of the end of the AIDS era for the Smithsonian. Something real. Something people carried. Not another NFT." She looks at your Velcro wallet with sudden, intense interest.');
      return true;
    }
    if (cmd.is(['pitch', 'show', 'tell', 'talk', 'ask', 'say'], 'laffx', 'idea', 'pitch', 'business', 'startup', 'space') || cmd.is('pitch')) {
      if (!g.needNear('steve', 60)) return true;
      if (has(g, 'pitched')) { g.say('"I\'m in, Larry. I\'m all in. Go to the boat."'); return true; }
      if (!has(g, 'soldLubber')) {
        g.say('You pitch LaffX: a space company run like a 1987 hot tub party. Steve listens, nodding.\n\n"Larry, I love it. I invested in the Opti-Grab and look at me. But investors want to see you put in your OWN money first. Skin in the game. Do you have any skin? I mean money."\n\nYou have $10,001.18. That is not skin. That is a skin tag.');
        return true;
      }
      g.set('pitched');
      g.give('invite');
      g.award('pitch');
      g.say('"LaffX. A rocket company. Founded by a 68-year-old man in a leisure suit, funded by the Smithsonian buying his condom."\n\nSteve Martin stares at you for a long moment. Then he throws both arms in the air. "THE NEW PHONE BOOK\'S HERE! I mean, I\'M IN!"\n\nHe writes a check on the back of an Art Basel brochure and hands you a gold card. "There\'s a party tonight on a yacht. Every tech billionaire in Miami will be there. Just... some of those guys are wild, Larry. Even for you."');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'steve', 'steve martin', 'martin', 'man', 'investor')) {
      if (!g.needNear('steve', 60)) return true;
      g.award('talkSteve');
      g.say(cycle(g, 'steve', [
        '"Nice suit. I had that suit. I wore it on SNL with an arrow through my head. Excuse me." He produces an arrow-through-the-head headband and puts it on, for no reason.',
        '"I made my fortune on the Opti-Grab. A handle for your glasses. People said it was a dumb idea. Then they all bought one. Then they sued me. But I\'d already bought the house."',
        '"I invest in dumb ideas, Larry. Do you have a dumb idea? PITCH me."',
      ]));
      return true;
    }
    if (cmd.is(['talk', 'ask', 'get', 'borrow', 'buy'], 'moranis', 'rick', 'rick moranis', 'chair', 'lawn chair')) {
      if (!g.needNear('moranis', 60)) return true;
      g.award('talkMoranis');
      if (g.has('chair') || has(g, 'chairPlaced')) { g.say('"Bring it back when you\'re done. Or don\'t. I have more. I have a lot of chairs."'); return true; }
      g.give('chair');
      g.award('getChair');
      g.say('"Oh! Hi! Different city again. I really don\'t know how this keeps happening."\n\nYou ask about the chair. Rick stands up and folds it. "Take it. I always bring my own chair. You never know when a place won\'t have chairs. Rich people hate chairs. They think chairs are for people who need to sit down."\n\nA collector immediately offers you $40,000 for the empty spot where the chair was.');
      return true;
    }
    if (cmd.is(['eat', 'get', 'take'], 'banana')) {
      if (!g.needNear('banana', 80)) return true;
      g.die('You peel the $6.2 million banana off the wall and eat it. It is a little brown. It is, technically, the most expensive thing you have ever eaten.\n\nSecurity tackles you. The artist calls it "a beautiful act of collaboration" and sues you for $6.2 million. Your Smithsonian money would have covered it. If you\'d sold the lubber first. You did not.', 'BANANA REPUBLIC', true);
      return true;
    }
    if (cmd.is('flirt')) {
      if (g.near('curator', 60)) { canceled(g, 'You lean in and tell the Smithsonian curator, "Baby, I\'ve got an artifact you should see," and start unbuckling your belt.\n\nShe has worked with the public for thirty years. She does not even blink. She just raises her badge, and an entire security team appears out of the white walls.'); return true; }
      if (g.near('steve', 60)) { g.say('You wink at Steve Martin. He winks back, then does it again with the other eye, then both eyes, then his whole face. You lose.'); return true; }
      return false;
    }
    return false;
  },
};

const ocean: Room = {
  id: 'ocean',
  title: 'Ocean Drive',
  public: true,
  walk: { x: 4, y: 150, w: 312, h: 50 },
  describe: (g) =>
    `Ocean Drive at night: pastel art deco hotels, pink and blue neon, palm trees and a parade of Lamborghinis going 4 miles an hour so people can look at them. ${has(g, 'elonAlly') ? 'Elon\'s Cybertruck is parked at the curb, idling nervously.' : 'A Cybertruck is parked at the curb, looking like a refrigerator that went to war.'} Art Basel is to the west. The marina, with its VIP dock, is to the east.`,
  hotspots: [
    { id: 'cybertruck', names: ['cybertruck', 'truck', 'car', 'tesla', 'refrigerator'], rect: { x: 120, y: 132, w: 70, h: 26 }, look: (g) => { g.award('lookCyber'); return has(g, 'elonAlly') ? 'Elon\'s Cybertruck. He is in the driver\'s seat, waving at you a little too much. "Get in! Brickell! We have to stop him! Also the window is bulletproof, watch." He knocks on it. It cracks.' : 'A Cybertruck. It has a sticker on the bumper: "MY OTHER CAR IS ON MARS." The window has a small crack in it, as if someone threw a ball at it on stage once.'; } },
    { id: 'hotels', names: ['hotel', 'hotels', 'neon', 'art deco', 'buildings'], rect: { x: 0, y: 20, w: 320, h: 100 }, look: 'Art deco hotels in pastel pink, mint and baby blue, the exact colors of a 1985 Miami Vice wardrobe. Somewhere, Don Johnson is pretending not to be here.' },
    { id: 'dock', names: ['dock', 'marina', 'guard', 'vip', 'east'], rect: { x: 284, y: 120, w: 36, h: 32 }, look: 'The marina\'s VIP dock and a guard in a white captain\'s hat. "Invitation only."' },
    { id: 'traffic', names: ['traffic', 'street', 'lamborghini', 'lambos', 'cars'], rect: { x: 0, y: 186, w: 320, h: 14 }, look: 'Lamborghinis, all going 4 miles per hour, all revving at 9,000 RPM.' },
  ],
  zones: [
    { id: 'toBasel', rect: { x: 0, y: 150, w: 8, h: 36 }, enter: (g) => g.goto('basel', 296, 172) },
    {
      id: 'toYacht',
      rect: { x: 308, y: 150, w: 12, h: 36 },
      enter: (g) => {
        if (!g.has('invite')) { g.s.x = 296; g.say('The guard in the captain\'s hat steps in front of you. "Party of the century. Invitation only. You look like a party of the 20th century."'); return; }
        g.goto('yacht', 20, 172);
      },
    },
    { id: 'traffic', rect: { x: 0, y: 188, w: 320, h: 12 }, enter: (g) => pamSave(g, 'You step onto Ocean Drive. A Lamborghini going 4 miles an hour revs at 9,000 RPM and lurches at your shins.\n\nA blonde in a red lifeguard jacket sprints down the sidewalk in perfect slow motion and pulls you back onto the curb. Somewhere, a saxophone plays.\n\n"Miami, Larry. They can\'t SEE over the hood." It\'s Pamela Anderson. She\'s here to free a manatee from a nightclub aquarium. The manatee is in a wheelbarrow, wrapped in a wet towel, looking calm.\n\nShe kisses your cheek and vanishes. (She won\'t be there next time.)', { x: g.s.x, y: 174 }) || g.die('You step onto Ocean Drive. A Lamborghini going 4 miles an hour runs over your foot at 9,000 RPM.\n\nThe driver, a crypto founder, offers to settle in a coin he made this morning. By the time you agree, it\'s worth nothing. So is your foot.', 'LAMBO\'D', true) },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch5-ocean');
    const lx = ((t * 12) % 420) - 80;
    rect(ctx, EGA.yellow, lx, 189, 40, 7);
    rect(ctx, EGA.lgreen, lx + 120, 189, 40, 7);
    if (has(g, 'elonAlly')) person(ctx, 158, 150, ELON, 'left');
    person(ctx, 304, 166, GUARD, 'left');
  },
  handle(g, cmd) {
    if (cmd.is(['ride', 'get', 'open', 'use', 'go'], 'cybertruck', 'truck', 'car', 'tesla', 'brickell')) {
      if (!has(g, 'elonAlly')) { g.say('The Cybertruck\'s door handle is flush with the door. You can\'t figure out how to open it. Nobody can. That\'s the point.'); return true; }
      if (!g.needNear('cybertruck', 50)) return true;
      g.say('You climb into the Cybertruck. Elon floors it. The truck goes 0 to 60 in 2.6 seconds and hits every speed bump on the MacArthur Causeway. Elon laughs at the speed bumps. "Hehe. Bump."');
      g.goto('tower', 30, 174);
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'guard', 'captain')) {
      if (!g.needNear('dock', 60)) return true;
      g.say(g.has('invite') ? '"Guest of Steve Martin. Welcome aboard, sir. Watch the rail. People keep going over the rail."' : '"Invitation only, pal. Who\'s your billionaire?"');
      return true;
    }
    return false;
  },
};

const yacht: Room = {
  id: 'yacht',
  title: 'The Yacht Gigabyte',
  public: true,
  walk: { x: 4, y: 150, w: 312, h: 50 },
  describe: (g) =>
    `The Yacht Gigabyte, the party of the century. Champagne, a DJ playing smooth jazz versions of Windows startup sounds, and every tech billionaire in Florida. ${has(g, 'jumpedYacht') ? 'A knocked-over deck chair marks where Bill Gates lost.' : 'Bill Gates is in the middle of the deck, showing off his famous standing jump over a chair.'} A nervous man in a black T-shirt hovers near the bar. A tanned financier named Jeffrey holds court by the rail. And in the corner, glowing faintly, is a man in a red smoking jacket who should not be here, because he is dead.`,
  hotspots: [
    { id: 'gates', names: ['gates', 'bill', 'bill gates', 'billionaire', 'jumper'], rect: { x: 113, y: 128, w: 14, h: 40 }, visible: (g) => !has(g, 'jumpedYacht'), look: (g) => { g.award('lookGates'); return 'Bill Gates, in a sweater, sizing up a deck chair. He crouches, springs, and clears it with his feet together, then looks around for applause. He gets some. He wants more.'; } },
    { id: 'deckchair', names: ['deck chair', 'chair', 'lounger'], rect: { x: 128, y: 150, w: 16, h: 10 }, look: 'A teak deck chair, the one Gates keeps jumping over.' },
    { id: 'elon', names: ['elon', 'musk', 'elon musk', 'nervous man', 'man', 't shirt'], rect: { x: 183, y: 128, w: 14, h: 40 }, look: 'Elon Musk, holding a drink he isn\'t drinking, laughing at a joke nobody told. He is checking his phone every four seconds. He is the only person here more awkward than you.' },
    { id: 'jeffrey', names: ['jeffrey', 'financier', 'tan man', 'host'], rect: { x: 253, y: 128, w: 14, h: 40 }, look: 'Jeffrey, a financier. Very tan, very connected, very interested in who is on whose plane. Every billionaire here seems to owe him a favor. Something about him makes even Larry Laffer\'s skin crawl, and Larry\'s skin has crawled into a lot of hot tubs.' },
    { id: 'hefner', names: ['hefner', 'hugh', 'hugh hefner', 'hef', 'ghost', 'smoking jacket'], rect: { x: 23, y: 128, w: 14, h: 40 }, look: 'The ghost of Hugh Hefner, in a red smoking jacket and captain\'s hat, translucent and glowing. He raises a ghostly pipe at you.' },
    { id: 'rail', names: ['rail', 'water', 'bay', 'ocean', 'overboard'], rect: { x: 0, y: 186, w: 320, h: 14 }, look: 'The rail, and below it the dark water of Biscayne Bay. Somebody\'s Rolex is already down there.' },
  ],
  zones: [
    { id: 'toOcean', rect: { x: 0, y: 150, w: 8, h: 36 }, enter: (g) => g.goto('ocean', 296, 172) },
    { id: 'overboard', rect: { x: 0, y: 188, w: 320, h: 12 }, enter: (g) => pamSave(g, 'You lean over the rail to look at a dolphin and keep leaning.\n\nSPLASH. Before you can even sink, a blonde in a red swimsuit dives off the yacht next door in perfect slow motion, swims to you, and tows you back to the ladder with one arm.\n\n"I literally did this for eleven seasons, Larry." It\'s Pamela Anderson. She was on the next yacht protesting a caviar menu. She climbs back aboard, wrings out her hair and is gone. (She won\'t be there next time.)', { x: g.s.x, y: 174 }) || g.die('You lean over the rail to look at a dolphin and keep leaning.\n\nSPLASH. Your polyester suit absorbs exactly zero water and floats you gently out to sea, like a little white raft. The Coast Guard finds you three days later off Cuba, sunburned and very calm.', 'MAN OVERBOARD', true) },
  ],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch5-yacht');
    // lights in the skyline across the bay
    for (let i = 0; i < 14; i++) {
      const h = 20 + ((i * 37) % 40);
      for (let w = 0; w < 3; w++) if ((i + w + Math.floor(t)) % 4) rect(ctx, EGA.yellow, i * 24 + 3 + w * 6, 100 - h + 4, 2, 2);
    }
    // string lights
    for (let i = 0; i < 16; i++) rect(ctx, (i + Math.floor(t * 2)) % 3 ? EGA.yellow : EGA.lmagenta, 10 + i * 19, 108, 2, 2);
    // deck chair
    if (has(g, 'jumpedYacht')) poly(ctx, '#CC9966', [[126, 160], [146, 156], [148, 160], [128, 164]]);
    else { rect(ctx, '#CC9966', 128, 150, 16, 3); rect(ctx, EGA.brown, 128, 153, 2, 7); rect(ctx, EGA.brown, 142, 153, 2, 7); }
    if (!has(g, 'jumpedYacht')) {
      const hop = Math.max(0, Math.sin(t * 3)) * 10;
      person(ctx, 120, 166 - hop, GATES, 'right');
    }
    person(ctx, 190, 166, ELON, 'left', Math.floor(t * 6) % 2);
    if (!has(g, 'walkedAway')) person(ctx, 260, 166, JEFFREY, 'left');
    if (Math.floor(t * 3) % 4) person(ctx, 30, 166, HEFNER);
  },
  handle(g, cmd) {
    if (cmd.is('jump') || cmd.is(['go'], 'chair', 'over chair')) {
      if (has(g, 'jumpedYacht')) { g.say('You already won. Retire undefeated, like Barry Sanders.'); return true; }
      if (!g.needNear('deckchair', 40)) return true;
      g.set('jumpedYacht');
      g.award('jumpYacht');
      g.say('"Let an old man try," you say.\n\nThe deck goes quiet. You crouch. Since 1992 you\'ve been training on the rim of a hot tub in the Philippines, hopping in and out three hundred times a night. Your knees have the springs of a man who refused to use the steps.\n\nYou clear the deck chair by a full foot, land in a perfect disco split, and pop back up.\n\nThe deck goes wild. Bill Gates turns the color of a blue screen. "That jump was not supported," he hisses. "Enjoy your little victory. Tomorrow at nine a.m. the Mandatory Update ships. Every device on Earth. Reboot. Forever. Please do not turn off your planet."\n\nHe storms off to his tender, which sputters toward the Brickell skyline.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'gates', 'bill', 'bill gates')) {
      if (has(g, 'jumpedYacht')) return false;
      if (!g.needNear('gates', 60)) return true;
      g.say('"Can you do this?" Gates clears the deck chair again, feet together. "Standing jump. Very few people can. I\'ve been told I\'m the best. By people I employ." He looks at you. "You couldn\'t. You\'re wearing polyester. It\'s not optimized."');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'elon', 'musk', 'elon musk', 'nervous man', 'man')) {
      if (!g.needNear('elon', 60)) return true;
      g.award('talkElon');
      if (has(g, 'walkedAway')) { g.say('"Okay, okay. Brickell. My Cybertruck\'s on Ocean Drive. We stop the update. I pull the plug. You... do whatever it is you do. Jump? You jump. Hehe. Jump."'); return true; }
      g.say(cycle(g, 'elon', [
        '"Oh. Hi. You\'re the... Vintage King guy. Hehe. That\'s funny. That\'s a funny name." He laughs for slightly too long. "Sorry. I don\'t... parties are hard."',
        '"LaffX? Steve told me. A rocket company? Ha. That\'s... that\'s my thing. Kind of. But also it\'s... honestly it\'s pretty good? I hate that it\'s good." He checks his phone. He tweets something. He deletes it.',
        '"Can I tell you something? Bill\'s planning something. Something with updates. I can\'t prove it. Also, don\'t get on Jeffrey\'s plane. I mean it. Don\'t."',
      ]));
      return true;
    }
    if (cmd.is(['talk', 'ask', 'listen'], 'hefner', 'hugh', 'hugh hefner', 'hef', 'ghost')) {
      if (!g.needNear('hefner', 60)) return true;
      g.award('talkHefner');
      g.say('The ghost of Hugh Hefner drifts toward you, smoking jacket rippling in a breeze that isn\'t there.\n\n"Larry. I threw a lot of parties. Some of them I\'m proud of. Here\'s what took me ninety-one years to learn: a real gentleman reads the articles, and a real gentleman knows when to walk away from a bad party."\n\nHe looks over at Jeffrey. Then back at you. Then he fades out, pipe last.');
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'jeffrey', 'financier', 'host')) {
      if (has(g, 'walkedAway')) return false;
      if (!g.needNear('jeffrey', 60)) return true;
      g.award('talkJeffrey');
      if (!has(g, 'jumpedYacht')) { g.say('"Larry, is it? Steve\'s friend. The suit guy. Charming. Enjoy the party." He looks past you, at someone more important. Everyone is someone more important.'); return true; }
      g.set('invited');
      g.say('Jeffrey claps you on the shoulder. "Now THAT was a jump. Larry, we\'re all flying down to the island tonight. My plane. Private. Very private. All the guys are coming. Bill, everybody. It\'s a wild crowd. You\'ll love it."\n\nHe smiles. The smile doesn\'t move anything else on his face.');
      return true;
    }
    if (cmd.is(['say', 'go', 'accept', 'ride', 'board', 'yes', 'fly']) && (cmd.about('yes', 'island', 'plane', 'sure', 'okay', 'ok', 'jet', 'seaplane') || cmd.is(['accept', 'yes']))) {
      if (!has(g, 'invited') || has(g, 'walkedAway')) return false;
      g.die('"Sure, why not," you say. "I\'m Larry Laffer. I go to every party."\n\nYou board Jeffrey\'s plane.\n\nThis is where the story of Larry Laffer ends. Not with a bang, not with a punchline. There\'s nobody to call. Kris doesn\'t pick up. Nobody picks up for this one.\n\nSome parties you just don\'t go to. Even Larry knew that. You were supposed to know that.', 'WRONG PARTY', false);
      return true;
    }
    if (cmd.is(['say', 'decline', 'refuse', 'leave', 'go', 'walk', 'no']) && (cmd.about('no', 'away', 'pass', 'no thanks', 'standards') || cmd.is(['decline', 'refuse', 'no']))) {
      if (!has(g, 'invited') || has(g, 'walkedAway')) return false;
      g.set('walkedAway');
      g.set('elonAlly');
      g.award('walkAway');
      g.say('You look at Jeffrey. You look at the plane. You look at the billionaires lining up to board it, laughing a little too loud.\n\nYou put down your champagne.\n\n"No thanks, pal. I may be a sleaze, but I\'ve got standards."\n\nThe deck goes quiet. Larry Laffer, a man who once tried to pick up a hooker in a 1987 bar bathroom, has just walked away from a party for being too wild. Somewhere, the ghost of Hugh Hefner nods.\n\nElon Musk hurries after you down the gangway, tripping on the last step. "Hey. HEY. You walked away. Nobody walks away. I... I respect that. Hehe. Okay. Listen. The Mandatory Update is real. Gates is at his tower in Brickell. My Cybertruck\'s on Ocean Drive. Want to save the world? It\'s fine if you don\'t. It\'s... please do."');
      return true;
    }
    if (cmd.is('flirt')) {
      if (g.near('elon', 60)) { g.say('You wink at Elon. He panics, winks back with both eyes, and tweets "lol" to 200 million people.'); return true; }
      if (g.near('hefner', 60)) { g.say('You wink at the ghost of Hugh Hefner. He winks back. It\'s the most professionally reciprocated wink of your life.'); return true; }
      canceled(g, 'You slide up to a billionaire\'s date at the bar and say, "Your yacht or mine?" You don\'t have a yacht. Her husband has nine. He also has a private security team and a podcast.');
      return true;
    }
    return false;
  },
};

const tower: Room = {
  id: 'tower',
  title: 'Mandatory Update Command Center, Brickell',
  public: true,
  walk: { x: 4, y: 152, w: 312, h: 47 },
  describe: (g) =>
    `The top floor of a glass tower in Brickell. One entire wall is a giant four-pane Window overlooking Biscayne Bay. A countdown clock reads "MANDATORY UPDATE: INSTALLING AT 9:00 A.M." Bill Gates stands at a podium beside a big red button marked INSTALL NOW. Behind him, a server rack hums, plugged into the wall. ${has(g, 'chairPlaced') ? 'Rick\'s lawn chair sits in the middle of the room.' : 'There are no chairs. A sign says "CHAIRS ARE DEPRECATED."'} Elon hovers nervously by the server rack.`,
  hotspots: [
    { id: 'gates', names: ['gates', 'bill', 'bill gates'], rect: { x: 143, y: 128, w: 14, h: 40 }, look: 'Bill Gates, at a podium, in a slightly evil sweater. He keeps saying "per my last email" to nobody.' },
    { id: 'window', names: ['window', 'windows', 'four pane window', 'glass', 'pane'], rect: { x: 20, y: 18, w: 140, h: 90 }, look: 'An enormous four-pane Window. The view of Biscayne Bay is spectacular. Down below, on the plaza, there is a hedge trimmed into the shape of a giant smiling paperclip.' },
    { id: 'button', names: ['button', 'red button', 'install now', 'install'], rect: { x: 168, y: 130, w: 14, h: 14 }, look: 'A big red button: INSTALL NOW. Under it, smaller: "Your planet will restart several times."' },
    { id: 'server', names: ['server', 'rack', 'plug', 'cord', 'outlet', 'wall'], rect: { x: 250, y: 90, w: 30, h: 62 }, look: 'A server rack blinking with the Mandatory Update, plugged into a single, ordinary wall outlet. Elon keeps staring at the plug like a dog staring at a steak.' },
    { id: 'elon', names: ['elon', 'musk', 'elon musk'], rect: { x: 223, y: 128, w: 14, h: 40 }, look: 'Elon, bouncing on his heels next to the server rack, whispering "distract him, distract him" to you.' },
    { id: 'clock', names: ['clock', 'countdown', 'timer'], rect: { x: 180, y: 20, w: 120, h: 24 }, look: 'MANDATORY UPDATE: INSTALLING AT 9:00 A.M. 0% complete. It will be 0% complete for the next forty-five minutes, then 99% complete for six hours.' },
  ],
  zones: [],
  draw(ctx, g, t) {
    backdrop(ctx, 'ch5-tower');
    text(ctx, has(g, 'won') ? 'UPDATE CANCELED' : 'UPDATE 9:00 AM', 240, 26, has(g, 'won') ? EGA.lgreen : EGA.lred, 8, 'center');
    for (let i = 0; i < 6; i++) rect(ctx, (i + Math.floor(t * 4)) % 3 ? EGA.lgreen : EGA.dgray, 254, 95 + i * 9, 4, 2);
    person(ctx, 150, 166, GATES, 'right');
    person(ctx, 230, 166, ELON, 'left', Math.floor(t * 6) % 2);
    if (has(g, 'chairPlaced')) {
      rect(ctx, EGA.lgray, 96, 158, 18, 2);
      rect(ctx, EGA.green, 98, 150, 14, 8);
      rect(ctx, EGA.lgray, 98, 160, 2, 8);
      rect(ctx, EGA.lgray, 110, 160, 2, 8);
    }
  },
  handle(g, cmd) {
    if (cmd.is(['drop', 'use', 'put', 'open', 'unfold', 'place', 'set'], 'chair', 'lawn chair', 'folding chair')) {
      if (!g.has('chair')) return false;
      g.drop('chair');
      g.set('chairPlaced');
      g.award('placeChair');
      g.s.x = Math.min(g.s.x, 90);
      g.say('You unfold Rick Moranis\'s lawn chair in the middle of the Mandatory Update Command Center.\n\nBill Gates freezes mid-monologue. He stares at the chair. A chair. In HIS room. His right eye twitches. His knees bend slightly, on their own.');
      return true;
    }
    if (cmd.is(['challenge', 'dare', 'bet']) || (cmd.is(['say', 'ask', 'talk']) && cmd.about('jump', 'rematch', 'contest', 'challenge'))) {
      if (!has(g, 'chairPlaced')) { g.say('"A jump contest? Here? There are no chairs. Chairs are deprecated." He goes back to his podium.'); return true; }
      if (has(g, 'challenged')) { g.say('Gates is already crouched at the chair, muttering "best of seven."'); return true; }
      g.set('challenged');
      g.award('challenge');
      g.say('"Rematch, Bill. Right now. Best of three. Unless you\'re scared of a 68-year-old in polyester."\n\nGates steps away from the podium like a man in a trance. "Best of SEVEN." He clears the lawn chair with feet together. Perfect form. Behind his back, Elon begins tiptoeing toward the wall outlet.\n\nYour turn. JUMP.');
      return true;
    }
    if (cmd.is('jump') || cmd.is(['go'], 'chair', 'over chair')) {
      if (!has(g, 'challenged')) { g.say(has(g, 'chairPlaced') ? 'You hop over the chair. Nobody is watching. Challenge Gates first.' : 'You jump in place. Bill Gates sighs and adds you to a spreadsheet.'); return true; }
      g.award('jumpTower');
      g.award('ending');
      g.set('won');
      g.win(`You plant your feet. You think of every hot tub rim in the Philippines. You SPRING.\n\nYou clear the lawn chair, the podium AND the big red button, landing in a disco split so perfect that the floor-to-ceiling Window rattles.\n\n"That jump was NOT SUPPORTED," Gates screams, and right then Elon yanks the plug. The server rack whines down to silence. The countdown flickers: UPDATE CANCELED.\n\nGates spins around. "You... you can't just TURN IT OFF AND ON AGAIN—"\n\n"Sorry. Sorry, Bill. So sorry." Elon picks Bill Gates up by the sweater, still apologizing, and tosses him straight out the giant four-pane Window.\n\nGates bounces off a striped awning, does a full somersault, and lands face-first in the hedge shaped like a paperclip. He stands up covered in leaves, shakes his fist at the sky and yells, "It looks like you're trying to RUIN MY LIFE!"\n\nThe world is saved. Elon tweets about it before anyone can stop him: "just threw bill out a window lol. he's fine. hedge is fine. larry is cool."\n\nIt gets 400 million likes. LaffX gets 400 million dollars in investment by lunchtime. The richest man in America list has a new name at number two.\n\nYour phone buzzes. Kris: "Larry. Houston. NASA wants to talk about LaffX. And Ashleigh says there's a karaoke bar there you need to see. LISTEN this time."\n\nCONTINUED IN CHAPTER 6: LARRY TO MARS.\n\nFinal score: ${g.s.score} of ${g.maxScore}.`);
      return true;
    }
    if (cmd.is(['push', 'press', 'use', 'hit'], 'button', 'red button', 'install', 'install now')) {
      if (!g.needNear('gates', 70)) return true;
      g.die('You press the big red button. You\'ve never been able to resist a big red button.\n\nEvery device on Earth reboots. Then again. Then again. Planes circle. Phones loop. Somewhere in Cerritos, a karaoke machine starts "My Way" and can never, ever finish it.\n\n"Thank you for your patience," says the planet.', 'PLEASE DO NOT TURN OFF YOUR PLANET', true);
      return true;
    }
    if (cmd.is(['pull', 'unplug', 'use', 'get'], 'plug', 'cord', 'server', 'outlet') || cmd.is('unplug')) {
      g.die('You go for the plug yourself. You forgot that you have never once in your life understood a computer.\n\nYou grab the wrong cord. It is the building\'s main power line. Your hair stands up into a perfect 1977 afro. Gates laughs so hard he has to sit down, and there are no chairs.', 'SHOCK VALUE', true);
      return true;
    }
    if (cmd.is(['push', 'fight', 'throw']) && cmd.about('gates', 'bill', 'window')) {
      g.die('You charge Bill Gates. He sidesteps and you go straight into the four-pane Window. It doesn\'t break. It was tested by Microsoft. It just shows you a little message: "Larry has stopped working."', 'LARRY HAS STOPPED WORKING', true);
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'gates', 'bill', 'bill gates')) {
      if (!g.needNear('gates', 70)) return true;
      g.award('talkGates');
      g.say(cycle(g, 'gates', [
        '"Larry. The jumper. Welcome to the future. At nine a.m., every device on Earth installs my Mandatory Update. It restarts. Then it restarts again. Forever. Please do not turn off your planet."',
        '"Why? Because I am TIRED of people clicking \'Remind me tomorrow.\' No more tomorrow. Only updates."',
        '"You beat me once, on a boat. Lucky. Polyester has good bounce. It won\'t happen here. There aren\'t even any chairs."',
      ]));
      return true;
    }
    if (cmd.is(['talk', 'ask'], 'elon', 'musk', 'elon musk')) {
      if (!g.needNear('elon', 60)) return true;
      g.say('"Psst. I can\'t get to the plug while he\'s watching," Elon whispers. "He has, like, a sixth sense for people near outlets. Distract him. Make him do the jump thing. He can\'t NOT do the jump thing. Hehe."');
      return true;
    }
    if (cmd.is('flirt')) { g.say('There\'s nobody here to flirt with but two billionaires and a server rack. You consider the server rack. No.'); return true; }
    return false;
  },
};

tower.enter = (g) => g.award('enterTower');
yacht.enter = (g) => g.award('enterYacht');

// ---------------------------------------------------------------- global

export const chapter5: Content = {
  title: 'Leisure Suit Larry: Woke Up Broke',
  chapter: 'Chapter 5: Too Wild for Larry',
  startRoom: 'basel',
  start: { x: 30, y: 176 },
  startInventory: ['wallet', 'lubber', 'phone', 'kriscard'],
  startCash: 1000118,
  startFlags: { phoneOnline: true, hasIdea: true },
  rooms: [basel, ocean, yacht, tower],
  items,
  points: {
    lookBanana: 2, talkSteve: 3, talkCurator: 3, sellLubber: 10, pitch: 8, talkMoranis: 3, getChair: 4,
    lookCyber: 2,
    enterYacht: 2, lookGates: 2, talkElon: 4, jumpYacht: 8, talkHefner: 3, talkJeffrey: 3, walkAway: 12,
    enterTower: 2, talkGates: 3, placeChair: 4, challenge: 6, jumpTower: 6, ending: 10,
  },
  lifeline: {
    item: 'kriscard',
    max: 3,
    label: 'Calling Kris...',
    rescue: (g, used) => {
      const lines = [
        'Kris answers from a yacht of her own. "Miami? Of course you\'re in Miami." A lawyer, a publicist and a Miami Heat legend arrive by speedboat. It never happened.',
        '"Again, Larry." Kris sends Kim, who reads three Florida statutes aloud until everyone goes home out of boredom.',
        'Kris sighs. "Last call this chapter. I mean it." One sincere apology video and a donation to a manatee rescue later, you\'re back.',
      ];
      return `${lines[Math.min(used - 1, lines.length - 1)]}\n\nLifeline calls left: ${g.lifelinesLeft()}.`;
    },
  },
  intro: [
    'LEISURE SUIT LARRY: WOKE UP BROKE\n\nChapter 5: Too Wild for Larry',
    'Miami Beach, Art Basel week.\n\nYou have $10,001.18 from Snoop, a big idea called LaffX, and a 1987 lubber that has outlived an epidemic. Steve Martin is here, and he invests in dumb ideas.\n\nKris\'s orders: one boat, no islands.\n\n(Type HELP for instructions. Save often.)',
  ],
  handle(g, cmd) {
    if (cmd.is(['call', 'use'], 'kris', 'card', 'business card', 'momager')) {
      g.say(`Kris picks up. "One boat. No islands. I'm saving my calls for emergencies." (${g.lifelinesLeft()} lifeline calls left. They work when you die.)`);
      return true;
    }
    if (cmd.is('jump')) { g.say('You do a little hop. Your knees still have it. Save it for somebody who needs to lose.'); return true; }
    if (cmd.is('pitch')) { g.say('You pitch LaffX to a passing seagull. It invests a french fry. Find a real investor: Steve Martin is at Art Basel.'); return true; }
    if (cmd.is(['use', 'open', 'blow'], 'lubber', 'condom', 'rubber')) {
      if (!g.has('lubber')) return false;
      g.say('You consider opening it. Then you remember it has been sealed since 1987 and is the only thing you own that has appreciated in value. Somebody would want this.');
      return true;
    }
    if (cmd.is('flirt')) { g.say("There's nobody here worth getting canceled over."); return true; }
    return false;
  },
  hint(g) {
    if (!has(g, 'soldLubber')) return 'The Smithsonian curator wants artifacts of the end of the AIDS era. You\'ve carried one since 1987. SELL LUBBER to her.';
    if (!has(g, 'pitched')) return 'Now you have skin in the game. PITCH LAFFX to Steve Martin.';
    if (!g.has('chair') && !has(g, 'chairPlaced')) return 'Rick Moranis brought his own chair. Rich people don\'t have chairs. ASK RICK ABOUT CHAIR.';
    if (!has(g, 'jumpedYacht')) return 'Show your invitation at the marina east of Ocean Drive. On the yacht, walk up to the deck chair and JUMP.';
    if (!has(g, 'invited')) return 'Talk to Jeffrey.';
    if (!has(g, 'walkedAway')) return 'Some parties you don\'t go to. Ask Hef. Then SAY NO THANKS.';
    if (g.s.room !== 'tower') return 'Elon\'s Cybertruck is on Ocean Drive. RIDE CYBERTRUCK.';
    if (!has(g, 'chairPlaced')) return 'There are no chairs in Gates\'s tower. You brought one. DROP CHAIR.';
    if (!has(g, 'challenged')) return 'Gates can\'t resist a chair. CHALLENGE GATES to a jump.';
    return 'JUMP.';
  },
};
