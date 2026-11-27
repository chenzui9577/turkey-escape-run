// main.js — bootstrap: wires the game to the DOM HUD and panels, runs the
// fixed-step loop, and honours ?shot= scenes for the maker's screenshots.

import { GOAL_METRES, STORAGE_KEY } from './config.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { setupShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('game-canvas');
const sound = new SoundBank();

let toastTimer = null;
const hooks = {
  toast(text) {
    const el = $('toast');
    el.textContent = text;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 1700);
  },
  onHud(game) { renderHud(game); },
  onEnd(game, escaped, reason) { showEnd(game, escaped, reason); },
};

const game = new Game(canvas, sound, hooks);
window.__turkeyGame = game; // playtest hook: lets a headless driver read the run state
const input = new Input(canvas);

function best() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}
function saveBest(game) {
  const prev = best();
  if (!prev || game.score > prev.score) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ score: game.score, escaped: game.state === 'escaped', metres: Math.round(game.metres) })); } catch { /* private mode */ }
  }
}
function bestLine() {
  const b = best();
  $('best-line').textContent = b
    ? `Best run so far: ${b.score.toLocaleString()} pts · ${b.escaped ? 'escaped to the barn! 🦃' : `caught at ${b.metres} m`}`
    : 'No escapes logged yet — the barn gate is waiting.';
}

function renderHud(g) {
  $('hud-score').textContent = Math.round(g.score).toLocaleString();
  $('hud-combo').textContent = '×' + g.combo;
  $('hud-lives').textContent = '● '.repeat(g.lives).trim() || '—';
  $('hud-lives').style.opacity = g.lives === 1 ? '0.65' : '1';
  const stage = g.stage();
  $('hud-stage').textContent = `${stage.icon} ${stage.name}`;
  $('hud-distance').textContent = `${Math.floor(g.metres)} m of ${GOAL_METRES.toLocaleString()} m`;
  $('progress-bar').style.width = Math.min(100, (g.metres / GOAL_METRES) * 100) + '%';
  $('farmer-bar').style.width = g.farmerGap + '%';
  $('danger-vignette').classList.toggle('on', g.state === 'playing' && g.farmerGap < 26);
}

function showEnd(g, escaped, reason) {
  saveBest(g);
  $('title-screen').classList.add('hidden');
  $('hud').classList.add('hidden');
  $('end-screen').classList.remove('hidden');
  $('end-eyebrow').textContent = escaped ? 'THE ESCAPE LOG · HE MADE IT' : 'THE ESCAPE LOG · SO CLOSE';
  $('end-title').textContent = escaped ? 'You made it to the barn! 🦃' : reason === 'farmer' ? 'Caught by the farmer!' : 'Out of feathers!';
  $('end-stars').textContent = escaped ? '★'.repeat(g.stars()) + '☆'.repeat(3 - g.stars()) : '☆☆☆';
  $('end-verdict').textContent = escaped
    ? 'The gate slams shut behind you. Somewhere far behind, a farmer sits down to a very quiet, all-vegetable Thanksgiving.'
    : reason === 'farmer'
      ? 'One last lunge — and the farmer\'s hand closes on a tail feather. The oven door creaks open… Better luck, faster feet, next Thanksgiving Eve.'
      : 'Too many ovens, too many knives. Gobbles is plucked, stuffed and philosophical about it. The barn will still be there next year.';
  const s = g.stats;
  $('end-stats').innerHTML = [
    ['Final score', Math.round(g.score).toLocaleString()],
    ['Distance', `${Math.floor(g.metres)} m / ${GOAL_METRES.toLocaleString()} m`],
    ['Corn · pumpkins · chilies', `${s.corn} · ${s.pumpkins} · ${s.chilies}`],
    ['Obstacles smashed (chili)', String(s.smashes)],
    ['Jumps · slides', `${s.jumps} · ${s.slides}`],
    ['Best combo', '×' + s.bestCombo],
  ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
}

function setPlayingUI() {
  $('title-screen').classList.add('hidden');
  $('end-screen').classList.add('hidden');
  $('pause-screen').classList.add('hidden');
  $('hud').classList.remove('hidden');
}

function startRun() {
  sound.ensure();
  game.start();
  setPlayingUI();
  renderHud(game);
}

function togglePause() {
  if (game.state === 'playing') {
    game.state = 'paused';
    $('pause-screen').classList.remove('hidden');
  } else if (game.state === 'paused') {
    game.state = 'playing';
    $('pause-screen').classList.add('hidden');
  }
}

$('btn-start').addEventListener('click', startRun);
$('btn-again').addEventListener('click', startRun);
$('btn-resume').addEventListener('click', togglePause);
$('btn-restart-pause').addEventListener('click', startRun);
$('btn-pause').addEventListener('click', togglePause);
$('btn-mute').addEventListener('click', () => { $('btn-mute').textContent = sound.toggleMute() ? '🔇' : '🔊'; });
input.onPause = () => { if (game.state === 'playing' || game.state === 'paused') togglePause(); };
input.onMute = () => { $('btn-mute').textContent = sound.toggleMute() ? '🔇' : '🔊'; };
input.onAnyKey = (k) => {
  if (k === 'Enter' && game.state === 'title') startRun();
  if (k === 'Enter' && (game.state === 'escaped' || game.state === 'caught')) startRun();
};

// Screenshot mode: freeze one deterministic scene and stop the loop.
const shotName = new URLSearchParams(location.search).get('shot');
if (shotName) {
  const scene = setupShot(game, shotName);
  if (scene === 'play' || scene === 'danger') {
    setPlayingUI();
    renderHud(game);
  } else if (scene === 'end') {
    // finish() already fired onEnd, which filled the end panel.
  } else {
    bestLine();
  }
  game.draw();
} else {
  bestLine();
  game.draw();
  // Main loop: fixed-step simulation for consistent physics at any refresh rate.
  let last = performance.now();
  let accumulator = 0;
  const STEP = 1 / 120;
  function frame(nowMs) {
    requestAnimationFrame(frame);
    let dt = (nowMs - last) / 1000;
    last = nowMs;
    if (dt > 0.1) dt = 0.1;
    accumulator += dt;
    const now = nowMs / 1000;
    while (accumulator >= STEP) {
      game.update(STEP, input, now);
      accumulator -= STEP;
    }
    if (game.state !== 'paused') game.draw();
  }
  requestAnimationFrame(frame);
}
