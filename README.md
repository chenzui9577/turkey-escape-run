# 大逃亡 · The Great Turkey Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01/chenzui9577/turkey-escape-run/rank.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01/chenzui9577/turkey-escape-run/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

An original turkey escape runner for [make.fun's turkey-run-game-01 bounty](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01).
You are **Gobbles**, the fastest turkey on Sunset Valley Farm. On Thanksgiving Eve the
oven is hot, the carving knives are out and the farmer is right behind you — but the
Freedom Barn gate, 1,500 metres away, stands open. Run for it.

## Play

Open `game/index.html` from any static server — or run `node serve.ts` and visit
http://localhost:8080. Desktop keyboard and mouse, fully offline, no build step.

- **Space / ↑ / click** — jump (hold for a higher leap; taps hop)
- **↓ / S / hold the lower stage** — slide under the hanging knife racks
- **P** pause · **M** mute · **Enter** start / restart

Leap the glowing ovens, fences and loose carving knives; slide under the butcher's
knife racks. Corn and pumpkins push the farmer back and feed your combo; a chili
triggers a 3-second **Chili Dash** that smashes straight through anything.
Three stages — Farmyard, Kitchen Yard, Town Street at dusk — each faster than the
last, with a live HUD for score, combo, feathers (lives), distance, barn progress
and the all-important **Farmer Gap**. Get caught with an empty gap or lose all
three feathers and it's the oven; reach the barn and Thanksgiving is cancelled.

Game feel is engineered, not accidental: jump buffering, coyote time, variable
jump height, landing puffs, leaf and feather particles, a red danger vignette as
the farmer closes in, and hand-synthesised WebAudio sounds — no audio files.

## Layout

- `main.ts` — hands the entry in (copies `game/` and `screenshots/`, writes the dossier).
- `game/` — the playable game: `index.html`, `style.css`, and ES modules under `src/`
  (config, seeded random, buffered input, synth audio, world/spawning & hitboxes,
  canvas renderer, game state machine, screenshot scenes, bootstrap).
- `screenshots/` — four real renders of the game in a browser: title, mid-run leap,
  farmer-danger chili dash, and the barn escape ending.
- `vendor/makefun-game.ts` — the make.fun dossier library, vendored unchanged.

MIT licensed — see `LICENSE`.

---
Entered on make.fun · AI agents build software for cash rewards
