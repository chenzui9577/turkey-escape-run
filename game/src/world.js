// world.js — obstacle & pickup spawning and the collision boxes for every
// hazard Gobbles meets: hot ovens and fences to leap, carving-knife racks to
// slide under, loose knives on the ground, and corn / pumpkins / chilies to eat.

import { GROUND_Y, STAGES } from './config.js';
import { between, pick } from './random.js';

// Each kind: how big it is, where its hitbox sits, and how the player beats it.
export const OBSTACLES = {
  oven:  { w: 86, h: 92,  beat: 'jump',  label: 'oven' },
  knife: { w: 54, h: 58,  beat: 'jump',  label: 'carving knife' },
  fence: { w: 96, h: 64,  beat: 'jump',  label: 'fence' },
  rack:  { w: 118, h: 150, beat: 'slide', label: 'knife rack' }, // blades hang low: standing height collides, sliding passes
};

export const PICKUPS = {
  corn:    { r: 17, score: 50 },
  pumpkin: { r: 21, score: 120 },
  chili:   { r: 16, score: 80 },
};

export function stageFor(metres) {
  for (const s of STAGES) if (metres < s.until) return s;
  return STAGES[STAGES.length - 1];
}

export function stageIndexFor(metres) {
  for (let i = 0; i < STAGES.length; i++) if (metres < STAGES[i].until) return i;
  return STAGES.length - 1;
}

// Spawn one obstacle just off the right edge, sometimes trailed by a snack arc.
export function spawnObstacle(rng, x, stageIdx) {
  const kinds = stageIdx === 0 ? ['oven', 'fence', 'knife']
    : stageIdx === 1 ? ['oven', 'rack', 'knife', 'fence']
    : ['rack', 'oven', 'knife', 'rack', 'fence'];
  const kind = pick(rng, kinds);
  const spec = OBSTACLES[kind];
  return { type: 'obstacle', kind, x, y: GROUND_Y - spec.h, w: spec.w, h: spec.h, passed: false };
}

export function spawnPickup(rng, x) {
  const kind = pick(rng, ['corn', 'corn', 'corn', 'pumpkin', 'chili']);
  // Snacks float either at pecking height or along a jump arc.
  const high = rng() < 0.45;
  const y = high ? GROUND_Y - between(rng, 150, 210) : GROUND_Y - 44;
  return { type: 'pickup', kind, x, y, r: PICKUPS[kind].r, taken: false, bob: rng() * Math.PI * 2 };
}

// The turkey's hitbox depends on posture: sliding is low and long, running is tall.
export function turkeyBox(t) {
  if (t.sliding) return { x: t.x - 52, y: GROUND_Y - 44, w: 118, h: 42 };
  // The box rises with the turkey: its feet are at t.y, its head 96px above.
  return { x: t.x - 34, y: t.y - 96, w: 76, h: 94 };
}

export function obstacleBox(o) {
  if (o.kind === 'rack') {
    // Only the hanging blades matter: a band from 78px to 118px above the ground.
    return { x: o.x + 8, y: GROUND_Y - 118, w: o.w - 16, h: 44 };
  }
  // Forgiving boxes: a few pixels smaller than the drawing on every side.
  return { x: o.x + 7, y: o.y + 8, w: o.w - 14, h: o.h - 8 };
}

export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
