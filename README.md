# Leisure Suit Larry: Woke Up Broke

A fan-made, Sierra-style comedy adventure that runs in your browser. Larry
Laffer passes out in Lefty's hot tub in 1992 and wakes up in 2026. Can he get
from broke to the richest man in America without getting canceled, run over, or
subscribed to death?

Chapter 1, "Rip Van Laffer," is playable now. See [the design doc](docs/DESIGN.md)
for the full story, the engine choice, and the graphics plan.

## Play

```sh
npm install
npm run dev      # open the printed localhost URL
```

Walk with the arrow keys (press again to stop) or click. Type commands like
`LOOK`, `GET BOX`, `TALK TO BARTENDER`, `WEAR PIN`, `HELP`. `HINT` if you're
stuck, `UNDO` if you die. Save often. This is a Sierra game.

## Build and test

```sh
npm test         # parser, full chapter 1 walkthrough, every death
npm run build    # static site in dist/
```

Add `?debug` to the URL to get `window.game` in the console.

A parody. Not affiliated with Sierra, Al Lowe, or anyone with a lawyer.
