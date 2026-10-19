# Leisure Suit Larry: Woke Up Broke — Design Doc

A fan-made, Sierra-style comedy adventure. Larry Laffer passes out in Lefty's
hot tub on April 29, 1992 and wakes up in October 2026. He has to survive a
world of phones, cashless bars, PC Police, grift foundations, cancel culture and
venture capital. Played right, he ends up unscathed and the richest man in
America. Played wrong, he dies in a hundred stupid ways, Sierra style.

This is satire in the spirit of the original series: the jokes punch at
institutions, hypocrisy, grifters, corporate HR culture, Silicon Valley, and
above all at Larry himself.

## Pillars

1. **Gameplay first.** Puzzles, jokes and deaths are written and testable
   before any final art exists. Placeholder EGA art is drawn in code.
2. **Feels like 1989.** Text parser, arrow-key walking, a score out of N,
   "You're not close enough," message boxes you dismiss, and deaths around every
   corner. Modern conveniences on top: click-to-walk, UNDO, HINT, on-screen
   buttons for phones.
3. **Never stuck without knowing it.** Sierra loved dead ends. We keep the
   deaths but turn would-be dead ends into instant, funny deaths (for example,
   returning the collector's-item box to Babbage's) so the game is always
   winnable if you're alive.
4. **Nostalgia everywhere.** Every room has at least one Sierra easter egg.

## Engine and why

**TypeScript + Vite + a small custom engine on an HTML canvas.** No game
framework.

- An AGI/SCI-style adventure needs rooms, hotspots, walk areas, a parser and
  message boxes. That's a few hundred lines; Phaser or Unity would add weight
  and abstractions we wouldn't use.
- All game rules live in `Game` (no DOM), so the full walkthrough and every
  death run as unit tests in Node (`npm test`).
- It runs in any browser, including phones, and builds to static files that can
  be hosted anywhere (GitHub Pages, itch.io).
- The screen is 320×200 logical pixels (the SCI resolution), drawn at 3×.

### Graphics plan

Placeholder art is drawn procedurally with the 16-color EGA palette
(`src/engine/gfx.ts`). Each room's `draw()` is the only thing that changes when
real art arrives:

1. **Backgrounds:** model rooms in Blender (driven through the Blender MCP),
   render at 320×200 or 640×400 with an orthographic/low-angle camera, then
   palette-quantize to EGA (16 colors) or a VGA-style 256-color palette. Ship as
   PNGs and draw with `drawImage`. This matches how Sierra's VGA remakes were
   painted and scanned.
2. **Sprites:** pixel-art sprite sheets (Aseprite or AI-assisted, then cleaned
   up by hand) with 4-direction walk cycles, same feet-anchor as today.
3. **Priority bands:** add a per-room priority map (like SCI) so Larry can walk
   behind counters and benches.

Unreal Engine is overkill for a 2D adventure and would kill the "runs in a
browser tab" goal; Blender-rendered backgrounds give the 3D-assisted look
without it.

## Structure

| Path | What |
| --- | --- |
| `src/engine/parser.ts` | Verb/noun parser with synonyms and multi-word verbs |
| `src/engine/game.ts` | State, movement, zones, scoring, deaths, undo, save |
| `src/engine/gfx.ts` | EGA palette, dithering, sprite drawing |
| `src/content/chapter1.ts` | Rooms, items, puzzles, jokes for chapter 1 |
| `src/main.ts` | Browser UI: canvas loop, input, dialogs, sound |
| `tests/` | Walkthrough and death tests |

Content is data plus small handler functions. A new chapter is a new
`Content` bundle with its own rooms.

## The story, by chapter

### Chapter 1: Rip Van Laffer (playable)

Lost Wages, 2026. Goal: get a phone, get an idea, get out of town.

| Room | What happens | Easter eggs |
| --- | --- | --- |
| Lefty's Back Room | Wake up in the drained hot tub. Take the sealed King's Quest V. The door is locked; KNOCK, then SAY KEN SENT ME (the LSL1 password, now used to get *out*). | KQ magic mirror; 1992 newspaper with the Rodney King verdict / L.A. riots headline; graffiti. |
| LFTY (formerly Lefty's) | Cashless "mixology experience." Free ALLY pins. Wi-Fi password on the chalkboard. TV news: AIDS is officially over; the richest man in America launches another rocket. | Wi-Fi password is `KenSentMe1987`. |
| The Strip | PC Police (Sgt. Sonny Bonds, Dept. of Sensitivity Compliance) won't let Larry into the mall without visible allyship. A canvasser for the "Foundation for Global Justice, LLC" pushes QR-code donations to a Malibu "healing campus." Robotaxis. | Police Quest's Sonny Bonds; Lytton; the LSL1 street death. |
| Galleria | Dead mall. A sweet older couple named Ken and Roberta on a bench buy back sealed Sierra games. | Oakhurst, Daventry, Lytton, Xenon. "Never sell the company." |
| Babbage's | Last one in America. Gus remembers Larry's five fake returns of King's Quest V. Bargain bin Space Quest XII for $0.99 gives Larry his big idea. | NO RETURNS sign with Larry's Polaroid; the LSL1 street-death demo on the CRT. |
| Pear Store | $999 phone, paid in cash. | — |

**Critical path:** get box → knock / say password → get and wear pin → sell box
to Ken and Roberta ($1,000) → buy Space Quest → read it (the IDEA) → buy phone →
connect to Wi-Fi in LFTY → CALL ROBOTAXI on the Strip (to the airport and a flight to LAX).

**Deaths:** drink the hot tub water; hit on the bartender (canceled); hit on the
canvasser (canceled); walk into the street; donate via QR code (death by
subscription); return the sealed box to Babbage's for $49.95; take off the suit
in public.

**Score:** 100 points. The ending is worth 18.

### The road ahead

Larry leaves Lost Wages for Los Angeles. **LAX is the hub of the whole game**:
the Theme Building (the flying-saucer restaurant in the middle of the airport)
is a recurring "home base" room Larry returns to between chapters, and every
chapter starts or ends with a flight in or out. Each visit, the terminal has
changed a little (new TSA rules, new lounges, the same broken moving walkway).

**Kardashian lifeline (game mechanic).** In Chapter 2 Larry befriends the
Kardashian-Jenner family (Kris, Kim, Khloé, Caitlyn and company) and gets
Kris's number. From then on, when Larry is about to die in certain set-pieces,
CALL KRIS rescues him (a lawyer, a PR firm, a private jet, a reality-show
camera crew that makes the scandal "content"). Limited uses per chapter, so
it's a resource, not a free pass. They save his bacon many times.

### Chapter 2: Filter Bubble (planned)

LAX and the Westside. Larry lands at LAX and sets up Swipr.

- **First date, filtered.** Larry matches with "Ashleigh, 29." At the Theme
  Building's Encounter restaurant, the woman who shows up looks nothing like
  her photos (beauty filters, a 2014 photo, and somebody else's dog). The
  puzzle: Larry has to get through the date without being the shallow one, and
  learns that his own profile photo is from 1987. Both of them walk out
  laughing; she becomes a recurring ally.
- **Meeting the Kardashians.** A mix-up at the LAX private terminal puts Larry
  in the Kardashians' SUV. His 1992 polyester becomes "vintage core," he goes
  viral for the right reasons for once, and he gets Kris's number (the
  lifeline).
- Easter eggs: Space Quest's Roger Wilco as an LAX janitor; the Theme
  Building's observation deck plays the Sierra logo jingle.

### Chapter 3: Summer of Love (planned)

Downtown L.A. Larry follows a free-food sign and gets swept into a "Summer of
Love" protest occupation zone. He meets **Willow**: nose ring, tote bag, a
bleeding heart for every cause, and a lost soul under it. The comedy targets
the grift around the movement (organizers selling merch out of a G-Wagon, a
donation app with a 40% "solidarity fee," a city council that declares the
zone a "vibe") and Larry's attempts to fake being woke to impress her.
Puzzle: get Willow and himself out before the zone's self-appointed security
council "cancels" them. Willow and Larry part as friends; she ends up running
a soup kitchen that actually feeds people.

Deaths: chanting the wrong slogan, buying the $90 "Abolish Capitalism" hoodie
with a credit card, trying to pick up Willow with a protest sign that says
"Honk if you're single."

### Chapter 4: The Long Beach Cypher (planned)

Larry takes a wrong bus and ends up in Long Beach, where Snoop Dogg and Dr. Dre
are judging a backyard rap battle. Larry, armed with nothing but 1977 disco
energy and rhymes about polyester, enters. Gameplay: a rhyme-building parser
puzzle (choose lines; bad ones get you booed off and are deaths). Winning
gets Larry Snoop's blessing, a viral clip and seed money.

Also here: #LarryToo. A clout-chasing influencer fabricates a claim about Larry
for engagement; the receipts (Snoop's party footage, a doorbell camera) clear
him. Larry's *real* sleazy moves still get him canceled on the spot.

### Chapter 5: Too Wild for Larry (planned)

Seattle and a billionaires' retreat. Larry pitches LaffX to tech investors and
ends up at the party of the century, where Bill Gates is showing off his famous
standing jump over a chair. Larry jumps higher (he's been training on hot tub
rims since 1992). Then a well-connected financier named Jeffrey invites them to
"the island." Larry, of all people, decides this crowd is too wild for him and
walks away. The point of the scene is Larry's line: "I may be a sleaze, but
I've got standards." No crimes are depicted; the joke is that even Larry
noped out.

The End of AIDS plotline lands here too: the 1987 lubber from Larry's wallet
sells to the Smithsonian for a fortune, funding LaffX.

### Chapter 6: Larry to Mars (planned finale)

LaffX builds a rocket in a Long Beach hangar. Lead propulsion engineer:
**Grace Cho from Cerritos**, brilliant, funny, unimpressed by billionaires,
and the only person who has ever out-quipped Larry. The final puzzles combine
everything: Willow's soup kitchen feeds the launch crew, Snoop hosts the
launch, Kris handles PR, Ashleigh live-streams it, and Grace lands the
booster. Played right, Larry becomes the richest man in America, unscathed,
and marries Grace. They live happily ever after in Cerritos, with a sealed
King's Quest V in a glass case on the mantel.

Played wrong, every previous mistake comes back as a congressional hearing.

### Scenario map

| jr's scenario | Where it lands |
| --- | --- |
| Online dating and pic filters | Ch. 2: Filter Bubble |
| "Summer of love" protests, girl with a nose ring | Ch. 3: Summer of Love (Willow) |
| Bill Gates, Epstein, the chair jump | Ch. 5: Too Wild for Larry |
| LAX and the Theme Building | Hub room in every chapter |
| Kardashians save Larry's bacon | Ch. 2 onward: the Kris lifeline mechanic |
| Snoop and Dre's rap contest in Long Beach | Ch. 4: The Long Beach Cypher |
| Nice Korean girl from Cerritos, happily ever after | Ch. 6: Grace Cho, the ending |

### How ideas get added

jr's friends Stephen and Brian may contribute ideas too. When ideas conflict,
the group votes.


## Tone guide

- Larry is always the biggest fool in the room. When he's sleazy, he pays for
  it.
- Satire targets hypocrisy and grift (foundations buying mansions, performative
  allyship, HR theater, VC buzzwords, influencers), not people for who they are.
- No slurs. Characters who are trans, gay, Black, etc. can appear and be funny,
  but the joke is never their identity.
- Real public figures (Ken and Roberta Williams, the Kardashian-Jenners, Snoop
  Dogg and Dr. Dre, Bill Gates) appear as obvious parody. The game never
  depicts or alleges specific crimes by real people.

## Next steps

1. Playtest chapter 1 and tune the parser's synonyms from what players type.
2. Add a priority map so Larry can walk behind the bar and bench.
3. Replace placeholder backgrounds with Blender renders, one room at a time.
4. Write chapter 2, starting with the LAX hub room.
