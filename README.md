# Leisure Suit Larry: Woke Up Broke

A fan-made, Sierra-style comedy adventure that runs in your browser.

In 1992, one fake King's Quest return ahead of the law, Larry Laffer fled to
the Philippines. There he finally found love: Maricel, who sang a mean "My Way"
at the karaoke bar they ran together on a little island with no internet, no TV
and a strict no-news policy.

Thirty-four happy years later, Larry learns that Maricel is trans. She had
mentioned it on their first date, on their tenth anniversary, and on a
hand-painted banner that hung over the bar for two decades. Larry, it turns
out, has never once listened to anything a woman said.

They part as best friends. Maricel keeps the bar, Larry keeps the leisure suit,
and Larry, still a 1992 man at heart, sets off to find what he calls a "normal"
relationship. Maricel kisses him goodbye at the ferry: "Good luck, Larry. Try
listening this time."

He comes home to a world he doesn't recognize. AIDS is over, people aren't so
scared of free love anymore, and Larry, 68, in the same white polyester suit,
plans to make up for lost time. He goes completely overboard.

He takes his "liberation" from Lost Wages to Los Angeles, Cincinnati, Miami and
Houston. Along the way he survives dating apps, the PC Police, grifters, cancel
culture, turncoat movie stars and a billionaire who wants to reboot the planet.
Pam Anderson keeps saving him and the Kardashians keep bailing him out. He
might just end up the richest man in America. Then Larry does the one thing he
never planned for: he falls in love.

Play it right and Larry comes out unscathed. Play it wrong and he dies in a
hundred stupid ways. This is a Sierra game.

Chapters 1 to 3 are playable now. See [the design doc](docs/DESIGN.md) for the
full story, the cast, the engine and the graphics plan.

## Play

```sh
npm install
npm run dev      # open the printed localhost URL
```

Walk with the arrow keys (press again to stop) or click. Type commands like
`LOOK`, `GET BOX`, `TALK TO BARTENDER`, `WEAR PIN`, `HELP`. Type `HINT` if
you're stuck and `UNDO` if you die. Save often.

## Build and test

```sh
npm test         # parser, every chapter's full walkthrough, every death
npm run build    # static site in dist/
```

Add `?debug` to the URL to get `window.game` in the console.

A parody. Not affiliated with Sierra, Al Lowe, or anyone with a lawyer.
