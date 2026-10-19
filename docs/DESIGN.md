# Leisure Suit Larry: Woke Up Broke — Design Doc

A fan-made, Sierra-style comedy adventure. In 1992, one step ahead of
Babbage's return policy, Larry Laffer fled to the Philippines and spent 34
years running a karaoke bar on an island with no internet, alongside the love
of his life, Maricel. When Larry finally learns she is trans (she told him on
their first date; he wasn't listening), they part as best friends, and he
heads home to find what he calls a "normal" relationship. In 2026 he comes
home and learns that AIDS is over and people aren't so scared of free love
anymore. Larry goes completely overboard with his newfound liberation, crashing
through a world of dating apps, phones, PC Police, grift foundations, cancel
culture and billionaires, only to fall in love for real.

Played right, he ends up unscathed, in love, and the richest man in America.
Played wrong, he dies in a hundred stupid ways, Sierra style.

**The arc:** every chapter, Larry's "liberation" gets him into trouble and a
little closer to something real. He starts the game chasing everyone and ends
it chasing one person.

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

**Art direction (decided with jr):** Blender renders styled like 90s VGA
Sierra games (King's Quest V/VI, Leisure Suit Larry 5/6, Space Quest IV), not
modern 3D.

### FMV video interludes

jr wants the occasional full-motion-video interlude, the way Roberta Williams
pushed CD-ROM video in the mid-90s (King's Quest VI's intro, Phantasmagoria).

- **How they're made:** short Blender-rendered cutscenes, 10 to 40 seconds
  each, with the 1995 CD-ROM look baked in: rendered at 320×200 or 320×136
  letterboxed, quantized to a 256-color palette with ordered dithering, a
  little film grain, slightly jerky 15 fps, and compression blockiness.
  Characters can be Blender actors or, for the true Phantasmagoria feel,
  filmed people composited over Blender sets.
- **How they play:** an `.mp4` or `.webm` in the browser, shown in the game
  screen's letterbox with a "Loading from CD..." fake progress bar, skippable
  with Enter. A new `cutscene` message kind in the engine plays one between
  rooms or chapters.
- **Where:** about one per chapter, at chapter transitions or big set-pieces,
  never in the middle of a puzzle.

**First interlude: "Flight 1992 to LAX"** (between chapters 1 and 2). Larry
sits wedged in a middle seat on a budget airline, gets handed a single Biscoff
cookie, falls asleep and dreams of the 1987 hot tub, wakes with the cookie
smeared on his lapel as the plane banks over Los Angeles and the Theme
Building swings into view. It sets up Chapter 2's first puzzle (the stain) and
shows off the LAX hub.

Later candidates: the Theme Building elevator reveal (ch. 2 ending), the rap
battle finale (ch. 4), the chair jump (ch. 5), and the rocket landing and
wedding (ch. 6).

## Structure

| Path | What |
| --- | --- |
| `src/engine/parser.ts` | Verb/noun parser with synonyms and multi-word verbs |
| `src/engine/game.ts` | State, movement, zones, scoring, deaths, undo, save |
| `src/engine/gfx.ts` | EGA palette, dithering, sprite drawing |
| `src/content/chapterN.ts` | Rooms, items, puzzles, jokes for each chapter |
| `src/main.ts` | Browser UI: canvas loop, input, dialogs, sound |
| `tests/` | Walkthrough and death tests |

Content is data plus small handler functions. A new chapter is a new
`Content` bundle with its own rooms.

## The story, by chapter

### Chapter 1: Rip Van Laffer (playable)

Lost Wages, 2026. Goal: get a phone, get an idea, get out of town.

| Room | What happens | Easter eggs |
| --- | --- | --- |
| Lefty's Back Room | Home from the Philippines, wake up jet-lagged in the drained hot tub where your 1992 stuff is stored. Take the sealed King's Quest V. The door is locked; KNOCK, then SAY KEN SENT ME (the LSL1 password, now used to get *out*). | KQ magic mirror; 1992 newspaper with the Rodney King verdict / L.A. riots headline; graffiti. |
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

### Where it happens

Larry's world is mainly four cities, with LAX as the hub he keeps flying
through. Every city gets its own set of Larry follies and deaths.

| City | Chapters | Flavor and follies |
| --- | --- | --- |
| Los Angeles | 2, 4, epilogue | LAX and the Theme Building, the Kardashians, Long Beach, the Cerritos wedding. |
| Cincinnati | 3 | The protest zone in Over-the-Rhine, Skyline Chili (ordering a 6-way is a death), a *WKRP* nod: "As God is my witness, I thought turkeys could fly." Scut Farkus is an Ohio boy. |
| Miami | 5 | Art Basel, crypto bros, a billionaire yacht, *Miami Vice* pastels, Pam's beach rescue, and the "Out a Window" showdown from a Brickell tower. |
| Houston | 6 | LaffX next to Mission Control ("Houston, we have a problem" every time Larry touches anything), a rodeo bull ride Larry should not attempt, and the launch. |

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

**Pam to the rescue (recurring love interest).** Pamela Anderson pops up out
of nowhere once per chapter and saves Larry from his first brush with death:
yanking him off the curb, a slow-motion Baywatch sprint across LAX, a surprise
rescue boat in Long Beach. She's played as her real public persona: animal
rights, plant-based, cozy cardigans, no makeup, warm and funny. Every time,
Larry falls in love, and every time she's gone before he can say anything. A
running gag across the game: Larry keeps trying to find her again, and the
clues (a vegan cookie, a rescued bear, a PETA flyer) pile up in his
inventory. She shows up for the finale too. Unlike Kris's calls, Pam's save
is automatic and comes only once per chapter.

### Chapter 2: Filter Bubble (playable)

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
- Easter eggs: Space Quest's Roger Wilco is an LAX janitor who trades
  Spot-B-Gone for a look at Space Quest XII.

**Rooms:** Gate 42, the arrivals curb, Encounter at the Theme Building.

**Critical path:** SWIPE (match Ashleigh) → show Space Quest to Roger (get
spray) → USE SPRAY on the Biscoff stain → POSE for the paparazzo (goes viral,
Kris gives her card and a VIP wristband) → past the rope into the Theme
Building → SHOW PROFILE to Ashleigh instead of complaining → SHOW WRISTBAND to
the waiter (dinner comped) → elevator to the observation deck.

**Deaths (all rescuable by calling Kris, 3 calls per chapter):** hitting on
the flight attendant, stepping into rideshare traffic, hitting on Kim,
complaining that Ashleigh doesn't look like her photos, a 1992-style
dine-and-dash.

### Chapter 3: Summer of Love (playable)

Cincinnati. Larry follows a free-food sign and gets swept into a "Summer of
Love" protest occupation zone. He meets **Willow**: nose ring, tote bag, a
bleeding heart for every cause, and a lost soul under it. The comedy targets
the grift around the movement (organizers selling merch out of a G-Wagon, a
donation app with a 40% "solidarity fee," a city council that declares the
zone a "vibe") and Larry's attempts to fake being woke to impress her.
Puzzle: get Willow and himself out before the zone's self-appointed security
council "cancels" them. Willow and Larry part as friends; she ends up running
a soup kitchen that actually feeds people.

Easter eggs: WKRP's turkey drop on the Skyline TV ("As God is my witness, I
thought turkeys could fly"), Rick Moranis broke at the counter, Barry Sanders
teaching the juke, Alicia Silverstone's "As if!", and Scut Farkus getting the
Lifebuoy treatment from A Christmas Story.

**Rooms:** Skyline Chili in Over-the-Rhine, Washington Park, the Summer of
Love Zone, the checkpoint on Vine Street.

**Critical path:** ORDER CONEY → GIVE CONEY to Rick Moranis (he gives you
Lifebuoy soap) → GET FOOTBALL from the park fountain → GIVE FOOTBALL to Barry
Sanders (learn the juke) → LOOK BANNER and CHANT VIBES (the zone accepts you)
→ TALK TO WILLOW → SCAN the G-Wagon's donation QR code and read the 40% fee
→ SHOW PHONE to Willow (she wants out) → JUKE Scut Farkus into a puddle →
USE SOAP on his mouth → walk out onto Vine Street with Willow.

**Deaths (all rescuable by calling Kris):** ordering a six-way at Skyline, the
streetcar (Pam saves you the first time), chanting the wrong slogan, buying
the $90 "Abolish Capitalism" hoodie on Pear Pay, making a "Honk if you're
single" sign, hitting on Willow, and fighting Farkus head-on.

### Chapter 4: The Long Beach Cypher (playable)

Larry takes a wrong bus and ends up in Long Beach, where Snoop Dogg and Dr. Dre
are judging a backyard rap battle. Larry, armed with nothing but 1977 disco
energy and rhymes about polyester, enters. Gameplay: a rhyme-building parser
puzzle (choose lines; bad ones get you booed off and are deaths). Winning
gets Larry Snoop's blessing, a viral clip and seed money.

Also here: #LarryToo. A clout-chasing influencer fabricates a claim about Larry
for engagement; the receipts (Snoop's party footage, a doorbell camera) clear
him. Larry's *real* sleazy moves still get him canceled on the spot.

**Rooms:** the street outside Snoop's in Long Beach, Snoop's backyard
cypher, courtside at the Lakers game, The Drew Barrymore Show.

**Critical path:** SAY KRIS SENT ME at Snoop's gate (a "Ken sent me"
callback) → BATTLE Young Filtr and flip each diss: RAP ABOUT SUIT, RAP ABOUT
KARAOKE, RAP ABOUT MARICEL (the honest verse wins; Snoop pays seed money and
courtside tickets) → bus to the Lakers game, where #LarryToo breaks → KISS
BARKLEY on the kiss cam ("That was TURRIBLE, Larry!"; Jordan: "I took that
personally") → CALL SNOOP for his party footage → TALK TO RICK for his RV's
doorbell-cam video → on Drew's show, SHOW FOOTAGE (exposes Affleck eating a
sad Dunkin' instead of writing) and SHOW DOORBELL (Kaydence rehearsing her
claim) → Drew's hug.

**Deaths (all rescuable by calling Kris):** answering the wrong diss,
chugging Snoop's gin and juice, hitting on the influencer, kissing a stranger
on the kiss cam, fighting Affleck (he trained for Batman), hitting on Drew,
and Ocean Boulevard (Pam saves you the first time).

### Chapter 5: Too Wild for Larry (planned)

Miami, during Art Basel week, on a billionaire's yacht and in a Brickell high-rise. Larry pitches LaffX to tech investors and
ends up at the party of the century, where Bill Gates is showing off his famous
standing jump over a chair. Larry jumps higher (he's been training on hot tub
rims since 1992). Then a well-connected financier named Jeffrey invites them to
"the island." Larry, of all people, decides this crowd is too wild for him and
walks away. The point of the scene is Larry's line: "I may be a sleaze, but
I've got standards." No crimes are depicted; the joke is that even Larry
noped out.

**Elon, the nervous good guy.** Elon Musk is a recurring ally: twitchy,
awkward, laughing at his own jokes a beat too long, tweeting through every
crisis, but on the right side when it counts. He spots Larry's LaffX pitch in
Chapter 5 and becomes a jittery mentor and friendly rival for "richest man in
America."

**The showdown: "Out a Window."** At the climax of Chapter 5, cartoon-villain
Bill Gates unveils his evil plan: a Mandatory Update that forces every device
on Earth to reboot forever ("Please do not turn off your planet"). Larry
stalls him with the chair-jump contest while Elon pulls the plug. Then Elon,
stammering an apology the whole time, tosses Gates out the conference room's
giant four-pane Window. It's pure slapstick: Gates bounces off an awning,
lands in a hedge shaped like a paperclip, shakes his fist and storms off.
The world is saved. Elon tweets about it before anyone can stop him.

The End of AIDS plotline lands here too: the 1987 lubber from Larry's wallet
sells to the Smithsonian for a fortune, funding LaffX.

### Chapter 6: Larry to Mars (planned finale)

LaffX builds its rocket in Houston, next door to Mission Control. Lead propulsion engineer:
**Grace Cho from Cerritos**, brilliant, funny, unimpressed by billionaires,
and the only person who has ever out-quipped Larry. She also has the best
karaoke voice in Southern California, and her family's noraebang in Cerritos
is where Larry, the ex-karaoke-bar owner, finally learns to listen: to the
song, and to her. The final puzzles combine
everything: Willow's soup kitchen feeds the launch crew, Snoop hosts the
launch, Kris handles PR, Ashleigh live-streams it, and Grace lands the
booster. Played right, Larry becomes the richest man in America, unscathed,
and marries Grace. They live happily ever after in Cerritos, with a sealed
King's Quest V in a glass case on the mantel and a karaoke machine in every
room. The last scene is the two of them singing a duet of "Islands in the
Stream."

**There is exactly one ending.** Make the right choices and Larry gets Grace,
the money and the happy ending. Make the wrong ones and you lose: every
previous mistake comes back as a congressional hearing, and it's game over.
No alternate endings, no consolation prize. Pam stays the one who got away
and saves him one last time at the launch.

### Supporting cast

Affectionate parodies of each star's public persona and best-known roles.
Turncoats are comic movie villains; no jokes about real-life allegations.
Hugh Hefner and John Candy appear as warm ghostly tributes.

**Allies**

| Who | Where | Bit |
| --- | --- | --- |
| Rick Moranis | Sporadic, every chapter | Pops up at random like Sierra's "man on the street," always with one oddly perfect item: a shrink ray, a Keymaster badge, a Dark Helmet ("I see your Schwartz is as big as mine"). |
| John Candy (ghost) | Ch. 2, LAX | Del Griffith from *Planes, Trains and Automobiles*, selling shower curtain rings at the gate. He teaches Larry that being a nice guy is a superpower. |
| Alicia Silverstone | Ch. 3 | Willow's vegan friend and Larry's style consultant ("As if!"). She gets along famously with Pam. |
| Barry Sanders | Ch. 3 | He teaches Larry the juke that gets him out of the protest zone, as a movement puzzle. |
| Drew Barrymore | Ch. 4 | She books Larry on her talk show after the rap battle. Her hug is how Larry survives #LarryToo. |
| Charles Barkley | Ch. 4, Lakers game | Courtside next to Larry at a Lakers game. He's Larry's loudest cheerleader through a kiss-cam disaster ("That was TURRIBLE, Larry. Do it again!"). |
| Michael Jordan | Ch. 4 onward | A few seats down, giving Larry the famous side-eye. He doesn't trust Larry one bit, but he backs the quest for love anyway ("I took that personally"). He shows up again at key moments with one line of tough-love advice. |
| Adam Sandler | Ch. 4 | Basketball shorts, a hoodie, and a Happy Gilmore golf swing. He's a guest judge at Snoop's battle. |
| Hugh Hefner (ghost) | Ch. 5 | Appears in a smoking jacket to tell Larry that a real gentleman reads the articles and walks away from bad parties. |
| Steve Martin | Ch. 5 | Navin Johnson energy ("The new phone book's here!"). As a seed investor, he explains how the Opti-Grab made him rich off one dumb idea. |

**Surprise turncoats**

| Who | Where | Bit |
| --- | --- | --- |
| Ben Affleck | Ch. 4 | Larry's new best bud, always carrying Dunkin'. He steals Larry's rap clip and claims he wrote it. A sad Dunkin' photo gives him away. |
| Tom Cruise | Ch. 6 | Volunteers as LaffX's stunt astronaut, then tries to hijack the rocket by climbing along the outside. Grace and Pam talk him down. |
| Kevin Spacey | Ch. 5 to 6 | A smooth Beltway fixer who breaks the fourth wall to the player. He turns out to be Gates's inside man and runs the final congressional hearing. |

**The worst guy: Scut Farkus.** The yellow-eyed bully from *A Christmas
Story*, grown up and running the protest zone's self-appointed "security
council" in Chapter 3. He's the only character in the game who is worse than
Larry. The puzzle ends Ralphie-style: Larry finally stands up to him, with
Barry's juke and a well-timed bar of soap.

### Scenario map

| jr's scenario | Where it lands |
| --- | --- |
| Online dating and pic filters | Ch. 2: Filter Bubble |
| "Summer of love" protests, girl with a nose ring | Ch. 3: Summer of Love (Willow) |
| Bill Gates, Epstein, the chair jump | Ch. 5: Too Wild for Larry |
| Elon as a nervous, weird good guy who throws Gates out a window | Ch. 5 onward: Elon the ally; the "Out a Window" showdown |
| LAX and the Theme Building | Hub room in every chapter |
| Kardashians save Larry's bacon | Ch. 2 onward: the Kris lifeline mechanic |
| Snoop and Dre's rap contest in Long Beach | Ch. 4: The Long Beach Cypher |
| Nice Korean girl from Cerritos, happily ever after | Ch. 6: Grace Cho, karaoke lovers, the one and only ending |
| Pam Anderson keeps popping up and saving the day | Every chapter: one automatic rescue (live in Ch. 1 and 2) |

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
- Maricel, Larry's ex, is a dignified, likable character. The joke in the
  backstory is Larry's 34 years of not listening, never her identity. She can
  come back as a friend who gives him the best advice in the game.
- Real public figures (Ken and Roberta Williams, the Kardashian-Jenners, Snoop
  Dogg and Dr. Dre, Bill Gates) appear as obvious parody. The game never
  depicts or alleges specific crimes by real people.

## Next steps

1. Playtest chapter 1 and tune the parser's synonyms from what players type.
2. Add a priority map so Larry can walk behind the bar and bench.
3. Replace placeholder backgrounds with Blender renders, one room at a time.
4. Render the first FMV interlude and add the `cutscene` message kind.
5. Write chapter 5 (Too Wild for Larry, Miami).
