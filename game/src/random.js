// random.js — a tiny seeded RNG so screenshot runs and playtests are reproducible.

export function makeRng(seed) {
  let state = (seed >>> 0) || 1;
  return function next() {
    // xorshift32: fast, deterministic, good enough for obstacle layouts.
    state ^= state << 13; state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5; state >>>= 0;
    return state / 4294967296;
  };
}

export function pick(rng, list) {
  return list[Math.floor(rng() * list.length) % list.length];
}

export function between(rng, min, max) {
  return min + rng() * (max - min);
}
