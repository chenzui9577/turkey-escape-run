// config.js — every tuning number for The Great Turkey Escape in one place.
// Distances are metres to the barn; speeds are pixels per second on a 1280x720 stage.

export const STAGE_W = 1280;
export const STAGE_H = 720;
export const GROUND_Y = 592;          // top of the dirt track the turkey runs on
export const GOAL_METRES = 1500;      // reach the barn gate to escape
export const METRES_PER_SECOND_BASE = 11;

export const GRAVITY = 2500;
export const JUMP_VELOCITY = -985;    // initial hop; holding the key keeps rising a touch longer
export const JUMP_CUT = 0.45;         // releasing early multiplies upward velocity by this
export const COYOTE_SECONDS = 0.1;    // grace window after leaving the ground edge
export const BUFFER_SECONDS = 0.12;   // a jump pressed just before landing still counts

export const START_LIVES = 3;
export const FARMER_START_GAP = 62;   // 0 = caught, 100 = far behind
export const FARMER_HIT_PENALTY = 26; // a crash lets him surge forward
export const CHILI_SECONDS = 3.2;     // invincible dash after eating a chili

// Three legs of the run, each faster and denser than the last.
export const STAGES = [
  { until: 500,  name: 'Stage 1 · Farmyard',     icon: '🌾', speed: 430, spawnEvery: [1.35, 1.9], sky: ['#ffd98a', '#f7a54d'], hill: '#c96f2e', far: '#e08b3a' },
  { until: 1000, name: 'Stage 2 · Kitchen Yard', icon: '🍳', speed: 505, spawnEvery: [1.1, 1.6], sky: ['#ffb877', '#e8762c'], hill: '#a8542a', far: '#c96a30' },
  { until: 1501, name: 'Stage 3 · Town Street',  icon: '🏘️', speed: 585, spawnEvery: [0.9, 1.35], sky: ['#c97b8f', '#8f4a72'], hill: '#6e3a5e', far: '#7d4668' },
];

export const SCORE = { corn: 50, pumpkin: 120, chili: 80, smash: 150, metre: 1 };

export const STORAGE_KEY = 'great-turkey-escape-best-v1';
