// Sierra-style two-word-ish text parser. Turns "pick up the box" into
// { verb: 'get', words: ['box'] } so room scripts can match on intent.

export interface Command {
  raw: string;
  verb: string;
  /** Noun words with filler removed. */
  words: string[];
  /** Everything after the verb, lowercased, filler kept (used by "say"). */
  rest: string;
  /** True when the noun phrase mentions any of the given names (single or multi-word). */
  about(...names: string[]): boolean;
  /** True when verb matches and (if names given) the noun phrase mentions one of them. */
  is(verb: string | string[], ...names: string[]): boolean;
}

// Multi-word verb phrases are checked first, longest first.
const PHRASES: [string, string][] = [
  ['pick up line', 'flirt'],
  ['use pickup line', 'flirt'],
  ['use pick up line', 'flirt'],
  ['hit on', 'flirt'],
  ['pick up', 'get'],
  ['take off', 'remove'],
  ['put on', 'wear'],
  ['get in', 'ride'],
  ['get into', 'ride'],
  ['talk to', 'talk'],
  ['speak to', 'talk'],
  ['speak with', 'talk'],
  ['talk with', 'talk'],
  ['chat with', 'talk'],
  ['look at', 'look'],
  ['look in', 'look'],
  ['look around', 'look'],
  ['ask about', 'ask'],
  ['turn on', 'use'],
  ['log in', 'connect'],
  ['sign in', 'connect'],
  ['sign up', 'use'],
  ['go to', 'go'],
  ['walk to', 'go'],
];

const VERBS: Record<string, string> = {
  look: 'look', l: 'look', examine: 'look', x: 'look', inspect: 'look', check: 'look', see: 'look', watch: 'look',
  read: 'read',
  get: 'get', take: 'get', grab: 'get', steal: 'get', pocket: 'get', collect: 'get',
  talk: 'talk', speak: 'talk', chat: 'talk', greet: 'talk', hello: 'talk', hi: 'talk',
  ask: 'ask', question: 'ask',
  give: 'give', hand: 'give', offer: 'give',
  show: 'show',
  sell: 'sell', trade: 'sell',
  buy: 'buy', purchase: 'buy', pay: 'buy', order: 'buy',
  use: 'use', activate: 'use', swipe: 'swipe',
  open: 'open', unlock: 'open',
  close: 'close', shut: 'close',
  drink: 'drink', sip: 'drink', chug: 'drink', taste: 'drink',
  eat: 'eat', lick: 'eat',
  wear: 'wear', don: 'wear', pin: 'wear',
  remove: 'remove', undress: 'remove', strip: 'remove',
  return: 'return', refund: 'return', exchange: 'return',
  flirt: 'flirt', seduce: 'flirt', kiss: 'flirt', woo: 'flirt', grope: 'flirt', wink: 'flirt',
  knock: 'knock', bang: 'knock', pound: 'knock',
  say: 'say', type: 'say', tell: 'say', whisper: 'say', shout: 'say', yell: 'say', password: 'say',
  donate: 'donate', tip: 'donate', contribute: 'donate',
  call: 'call', summon: 'call', hail: 'call', order_ride: 'call',
  ride: 'ride', enter: 'ride', board: 'ride',
  connect: 'connect', join: 'connect',
  sit: 'sit', stand: 'stand', sleep: 'sleep', bathe: 'bathe', swim: 'bathe', wash: 'bathe',
  smell: 'smell', sniff: 'smell',
  push: 'push', pull: 'pull', kick: 'push', hit: 'push', punch: 'push', slap: 'push',
  go: 'go', walk: 'go', run: 'go',
  dance: 'dance', sing: 'sing', pray: 'pray', cry: 'cry',
  inventory: 'inventory', i: 'inventory', inv: 'inventory', items: 'inventory',
  score: 'score', points: 'score',
  help: 'help', '?': 'help', commands: 'help',
  hint: 'hint', hints: 'hint', clue: 'hint',
  save: 'save', restore: 'restore', load: 'restore', restart: 'restart', undo: 'undo', oops: 'undo',
};

const FILLER = new Set([
  'the', 'a', 'an', 'my', 'your', 'his', 'her', 'their', 'some', 'to', 'at', 'with', 'about',
  'on', 'in', 'into', 'from', 'for', 'please', 'this', 'that', 'these', 'those', 'of', 'up', 'out', 'it',
]);

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9?#\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parse(input: string): Command {
  const text = normalize(input);
  let verb = '';
  let rest = text;

  for (const [phrase, canonical] of [...PHRASES].sort((a, b) => b[0].length - a[0].length)) {
    if (text === phrase || text.startsWith(phrase + ' ')) {
      verb = canonical;
      rest = text.slice(phrase.length).trim();
      // "pick up line" style phrases keep their target ("pick up line on bartender")
      break;
    }
  }
  if (!verb) {
    const [first, ...others] = text.split(' ');
    verb = VERBS[first] ?? first ?? '';
    rest = others.join(' ');
  }

  const words = rest.split(' ').filter((w) => w && !FILLER.has(w));
  const padded = ` ${words.join(' ')} `;

  const about = (...names: string[]) =>
    names.some((n) => padded.includes(` ${normalize(n)} `));

  return {
    raw: input,
    verb,
    words,
    rest,
    about,
    is(v, ...names) {
      const verbs = Array.isArray(v) ? v : [v];
      if (!verbs.includes(verb)) return false;
      return names.length === 0 || about(...names);
    },
  };
}
