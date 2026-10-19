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
connect to Wi-Fi in LFTY → CALL ROBOTAXI on the Strip.

**Deaths:** drink the hot tub water; hit on the bartender (canceled); hit on the
canvasser (canceled); walk into the street; donate via QR code (death by
subscription); return the sealed box to Babbage's for $49.95; take off the suit
in public.

**Score:** 100 points. The ending is worth 18.

### Chapter 2: Woke Valley (planned)

Silicon Valley. Larry pitches "LaffX: Reusable Rockets & Leisure Suits" to VCs
who fund anything with the right buzzwords. Mandatory HR onboarding with a
pronoun minefield where every wrong answer is a death and the right answer is
always "I'll circle back." A city council that bans gas stoves while flying
private. Goal: close a seed round without getting canceled.

Easter eggs: Sierra's Oakhurst office as a startup co-working space; Roger
Wilco as a janitor at the incubator; a Space Quest "Sarien" parody of a
competitor.

### Chapter 3: #LarryToo (planned)

An influencer accuses Larry of something he didn't do (for once) to farm
engagement, and the PR and HR industries pounce. Larry must find the receipts
(a doorbell camera, a Swipr chat log, Sgt. Bonds' bodycam) to clear his name,
while every *real* sleazy move he tries still gets him canceled on the spot.
The satire is aimed at clout-chasing and trial-by-timeline, and at Larry.

### Chapter 4: The End of AIDS (planned)

The cure is real and free. Larry, freed from 40 years of anxiety he never acted
on anyway, throws the "Lubber Liberation Party" on a yacht. Health officials,
pharma marketers, and a wellness influencer selling "post-cure detox" all want a
piece. The 1987 lubber from Larry's wallet becomes a museum piece worth a
fortune. Goal: survive the party and sell the lubber to the Smithsonian.

### Chapter 5: Larry to Mars (planned)

LaffX's first rocket. LarryCoin. Larry buys a social network and renames it to a
single letter. Final puzzles combine everything from earlier chapters. Played
right, Larry lands the rocket, takes the company public, and becomes the richest
man in America, unscathed. Played wrong, every previous mistake comes back as a
congressional hearing.

**Ending:** Larry on the cover of Time, in the leisure suit, next to a sealed
King's Quest V in a glass case.

## Tone guide

- Larry is always the biggest fool in the room. When he's sleazy, he pays for
  it.
- Satire targets hypocrisy and grift (foundations buying mansions, performative
  allyship, HR theater, VC buzzwords, influencers), not people for who they are.
- No slurs. Characters who are trans, gay, Black, etc. can appear and be funny,
  but the joke is never their identity.
- Real people (Ken and Roberta Williams) appear only as affectionate cameos.

## Next steps

1. Playtest chapter 1 and tune the parser's synonyms from what players type.
2. Add a priority map so Larry can walk behind the bar and bench.
3. Replace placeholder backgrounds with Blender renders, one room at a time.
4. Write chapter 2.
