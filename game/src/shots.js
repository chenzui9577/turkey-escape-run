// shots.js — deterministic scenes for the maker's screenshots (?shot=...).
// Each scene seeds the game, places hand-picked obstacles and snacks, and
// freezes a single readable moment: title, mid-run, danger, and an ending.

import { GOAL_METRES, GROUND_Y } from './config.js';
import { spawnObstacle, spawnPickup } from './world.js';

function place(game, kind, x) {
  const o = spawnObstacle(game.rng, x, game.stageIndex());
  o.kind = kind;
  // Recompute the vertical from the kind's spec, as spawnObstacle would.
  const heights = { oven: 92, knife: 58, fence: 64, rack: 150 };
  o.y = GROUND_Y - heights[kind];
  o.h = heights[kind];
  o.w = { oven: 86, knife: 54, fence: 96, rack: 118 }[kind];
  game.entities.push(o);
  return o;
}

function snack(game, kind, x, y) {
  const p = spawnPickup(game.rng, x);
  p.kind = kind; p.x = x; if (y) p.y = y;
  game.entities.push(p);
  return p;
}

export function setupShot(game, name) {
  if (name === 'start') {
    game.state = 'title';
    game.scroll = 240;
    game.time = 1.2;
    return 'title';
  }
  if (name === 'play') {
    game.start(7);
    game.metres = 640; // Kitchen Yard stage
    game.score = 1240; game.combo = 3; game.cleanStreak = 9;
    game.farmerGap = 58;
    game.turkey.y = GROUND_Y - 120; game.turkey.vy = -140; game.turkey.onGround = false; // mid-leap over the oven
    place(game, 'oven', 330);
    snack(game, 'corn', 560); snack(game, 'corn', 630); snack(game, 'pumpkin', 720);
    place(game, 'rack', 900);
    game.time = 2.4;
    game.draw();
    return 'play';
  }
  if (name === 'danger') {
    game.start(11);
    game.metres = 1180; // Town Street, dusk
    game.score = 2130; game.combo = 2; game.lives = 2;
    game.farmerGap = 13; // he's right on the tail feathers — red vignette moment
    game.turkey.chili = 2.4; // chili dash glow
    place(game, 'knife', 470);
    place(game, 'oven', 760);
    snack(game, 'chili', 620);
    game.time = 3.1;
    game.draw();
    return 'danger';
  }
  if (name === 'end') {
    game.start(5);
    game.metres = GOAL_METRES - 26;
    game.score = 2980; game.lives = 2; game.farmerGap = 44;
    game.stats.corn = 14; game.stats.pumpkins = 3; game.stats.chilies = 1; game.stats.jumps = 31; game.stats.slides = 9;
    game.finish(true, 'barn');
    game.time = 4;
    game.draw();
    return 'end';
  }
  return null;
}
