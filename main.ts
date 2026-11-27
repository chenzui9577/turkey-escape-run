// The Great Turkey Escape — entry hand-in program (Node 22, standard library only).
//
// What this does, and nothing more: it takes the playable game in game/ and the
// maker's screenshots in screenshots/, copies both into the output directory
// the grader points at, and writes a dossier.json describing them with the
// vendored make.fun library, so the judge reads exactly the files that ship.
//
// Run it locally the same way the grader does, just with a stand-in output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Play the game itself with `node serve.ts`, then http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The game goes in whole: every file under game/ is part of the run.
mkdirSync(join(outputDir, 'game'), { recursive: true });
cpSync(join(repoDir, 'game'), join(outputDir, 'game'), { recursive: true });

// Screenshots ride along when the maker has taken them (3 or 4 by the rules).
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoDir, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier caps are the scorer's own for this bounty: the text the judge
// outlines is capped, screenshots are few and small, and the game tree stays
// well inside the platform's file and byte limits.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierText);
