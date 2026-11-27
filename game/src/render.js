// render.js — all canvas drawing: parallax autumn scenery for the three stages,
// hand-drawn Gobbles the turkey, the farmer in pursuit, every obstacle and snack,
// plus leaf & feather particles. No images: every shape is drawn with paths.

import { GROUND_Y, STAGE_H, STAGE_W } from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// ---------- scenery ----------
export function drawBackground(ctx, stage, scroll, time) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, stage.sky[0]);
  sky.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, STAGE_W, GROUND_Y + 4);

  // Low sun with a soft halo, sinking as the stages pass.
  const sunY = 150 + (stage.until > 1000 ? 60 : 0);
  const glow = ctx.createRadialGradient(1050, sunY, 10, 1050, sunY, 190);
  glow.addColorStop(0, 'rgba(255,240,190,.85)');
  glow.addColorStop(1, 'rgba(255,240,190,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(830, sunY - 200, 440, 400);
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath(); ctx.arc(1050, sunY, 44, 0, Math.PI * 2); ctx.fill();

  drawHills(ctx, scroll * 0.18, stage.far, 330, 120);
  drawHills(ctx, scroll * 0.42, stage.hill, 430, 110);
  drawLandmarks(ctx, stage, scroll);
  drawGround(ctx, scroll);
}

function drawHills(ctx, offset, colour, baseY, height) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= STAGE_W; x += 40) {
    const y = baseY + Math.sin((x + offset) * 0.006) * height * 0.4 + Math.sin((x + offset) * 0.017) * 18;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(STAGE_W, GROUND_Y);
  ctx.closePath(); ctx.fill();
}

// Stage dressing that scrolls at mid speed: fences & barns, kitchen chimneys, town houses.
function drawLandmarks(ctx, stage, scroll) {
  const spacing = 460;
  const off = -((scroll * 0.65) % spacing);
  ctx.save();
  for (let x = off - spacing; x < STAGE_W + spacing; x += spacing) {
    const idx = Math.round((x + scroll * 0.65) / spacing);
    if (stage.until <= 500) drawBarn(ctx, x, idx);
    else if (stage.until <= 1000) drawKitchenHouse(ctx, x, idx);
    else drawTownHouse(ctx, x, idx);
  }
  ctx.restore();
}

function drawBarn(ctx, x, idx) {
  const base = GROUND_Y - 118;
  ctx.fillStyle = idx % 2 ? '#a03d2a' : '#8f3626';
  rr(ctx, x, base, 150, 118, 4); ctx.fill();
  ctx.fillStyle = '#6e2718';
  ctx.beginPath(); ctx.moveTo(x - 10, base); ctx.lineTo(x + 75, base - 52); ctx.lineTo(x + 160, base); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f3e2c2';
  rr(ctx, x + 52, base + 44, 46, 74, 3); ctx.fill();
  ctx.strokeStyle = '#6e2718'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x + 52, base + 44); ctx.lineTo(x + 98, base + 118); ctx.moveTo(x + 98, base + 44); ctx.lineTo(x + 52, base + 118); ctx.stroke();
}

function drawKitchenHouse(ctx, x, idx) {
  const base = GROUND_Y - 132;
  ctx.fillStyle = idx % 2 ? '#e8dcc4' : '#dccbaa';
  rr(ctx, x, base, 170, 132, 4); ctx.fill();
  ctx.fillStyle = '#7a4a2b';
  ctx.beginPath(); ctx.moveTo(x - 8, base); ctx.lineTo(x + 85, base - 44); ctx.lineTo(x + 178, base); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8a8f96'; rr(ctx, x + 118, base - 74, 24, 52, 3); ctx.fill(); // chimney
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.beginPath(); ctx.arc(x + 130, base - 92, 10 + (idx % 3) * 3, 0, Math.PI * 2); ctx.arc(x + 142, base - 108, 13, 0, Math.PI * 2); ctx.fill(); // smoke
  ctx.fillStyle = '#ffd98a'; rr(ctx, x + 26, base + 34, 34, 34, 3); ctx.fill(); rr(ctx, x + 106, base + 34, 34, 34, 3); ctx.fill();
  ctx.fillStyle = '#5d3a1e'; rr(ctx, x + 66, base + 66, 38, 66, 3); ctx.fill();
}

function drawTownHouse(ctx, x, idx) {
  const base = GROUND_Y - 150;
  const colours = ['#c9a27a', '#b58a9c', '#9aa87e', '#a88f6a'];
  ctx.fillStyle = colours[((idx % 4) + 4) % 4];
  rr(ctx, x, base, 150, 150, 4); ctx.fill();
  ctx.fillStyle = '#4e3446';
  ctx.beginPath(); ctx.moveTo(x - 8, base); ctx.lineTo(x + 75, base - 38); ctx.lineTo(x + 158, base); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) rr(ctx, x + 18 + c * 44, base + 26 + r * 48, 26, 30, 3), ctx.fill();
  ctx.fillStyle = '#3c2a38'; rr(ctx, x + 58, base + 96, 34, 54, 3); ctx.fill();
}

function drawGround(ctx, scroll) {
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(0, GROUND_Y, STAGE_W, STAGE_H - GROUND_Y);
  ctx.fillStyle = '#a06a33';
  ctx.fillRect(0, GROUND_Y, STAGE_W, 10);
  // Dirt speckles scrolling at full speed sell the running.
  ctx.fillStyle = 'rgba(60,32,10,.35)';
  const gap = 90;
  const off = -((scroll) % gap);
  for (let x = off; x < STAGE_W; x += gap) {
    ctx.fillRect(x + 20, GROUND_Y + 34 + ((x * 7) % 40), 22, 5);
    ctx.fillRect(x + 55, GROUND_Y + 78 + ((x * 13) % 30), 14, 4);
  }
  // Finish barn gate appears in the last metres (drawn by game when close).
}

// ---------- characters ----------
export function drawTurkey(ctx, t, time) {
  const x = t.x, feet = t.y;
  ctx.save();
  if (t.invincible > 0 && Math.floor(time * 14) % 2 === 0 && !t.chili) ctx.globalAlpha = 0.45;
  if (t.chili) { ctx.shadowColor = '#ff5722'; ctx.shadowBlur = 24; }

  if (t.sliding) {
    // Low, stretched-out slide: body horizontal, tail up, one wing forward.
    ctx.fillStyle = '#7a4a26';
    ctx.beginPath(); ctx.ellipse(x, feet - 24, 58, 22, -0.06, 0, Math.PI * 2); ctx.fill();
    drawTail(ctx, x - 52, feet - 34, time, true);
    ctx.fillStyle = '#96622f';
    ctx.beginPath(); ctx.ellipse(x + 6, feet - 28, 42, 16, -0.05, 0, Math.PI * 2); ctx.fill();
    drawHead(ctx, x + 58, feet - 38, time);
    ctx.strokeStyle = '#e8a13a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + 20, feet - 8); ctx.lineTo(x + 44, feet - 2); ctx.stroke();
    ctx.restore();
    return;
  }

  const runCycle = Math.sin(time * 16) * (t.onGround ? 1 : 0.25);
  // Legs first, scissoring as he runs; tucked when airborne.
  ctx.strokeStyle = '#e8a13a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  if (t.onGround) {
    ctx.moveTo(x - 6, feet - 26); ctx.lineTo(x - 6 + runCycle * 20, feet);
    ctx.moveTo(x + 14, feet - 26); ctx.lineTo(x + 14 - runCycle * 20, feet);
  } else {
    ctx.moveTo(x - 6, feet - 26); ctx.lineTo(x - 18, feet - 6);
    ctx.moveTo(x + 14, feet - 26); ctx.lineTo(x + 30, feet - 10);
  }
  ctx.stroke();

  drawTail(ctx, x - 38, feet - 62, time, false);
  // Plump body.
  const bodyGrad = ctx.createLinearGradient(x, feet - 96, x, feet - 20);
  bodyGrad.addColorStop(0, '#96622f'); bodyGrad.addColorStop(1, '#6e421e');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath(); ctx.ellipse(x, feet - 56, 44, 38, -0.12, 0, Math.PI * 2); ctx.fill();
  // Wing, flapping harder in the air.
  ctx.fillStyle = '#7d5024';
  ctx.save();
  ctx.translate(x - 2, feet - 62);
  ctx.rotate(t.onGround ? Math.sin(time * 16) * 0.12 : Math.sin(time * 22) * 0.45);
  ctx.beginPath(); ctx.ellipse(0, 8, 26, 14, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Chest fluff.
  ctx.fillStyle = '#c98d4b';
  ctx.beginPath(); ctx.ellipse(x + 24, feet - 52, 16, 22, -0.2, 0, Math.PI * 2); ctx.fill();
  drawHead(ctx, x + 40, feet - 92, time);
  ctx.restore();
}

function drawTail(ctx, x, y, time, sliding) {
  const fan = ['#b5542a', '#d9762e', '#e8a13a', '#c95f27', '#a84a24'];
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < 5; i++) {
    const ang = (-0.9 + i * 0.34) + Math.sin(time * 6 + i) * 0.05 + (sliding ? 0.5 : 0);
    ctx.fillStyle = fan[i];
    ctx.save(); ctx.rotate(ang);
    ctx.beginPath(); ctx.ellipse(-24, 0, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawHead(ctx, x, y, time) {
  // Neck + head, the famous red wattle, a determined eye and a beak set for freedom.
  ctx.strokeStyle = '#8a5a30'; ctx.lineWidth = 11; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 12, y + 26); ctx.quadraticCurveTo(x + 2, y + 10, x + 4, y); ctx.stroke();
  ctx.fillStyle = '#a06a35';
  ctx.beginPath(); ctx.arc(x + 8, y - 4, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d93a2e'; // wattle
  ctx.beginPath(); ctx.ellipse(x + 16, y + 8, 6, 11, 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2a03c'; // beak
  ctx.beginPath(); ctx.moveTo(x + 20, y - 8); ctx.lineTo(x + 36, y - 3); ctx.lineTo(x + 20, y + 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x + 12, y - 8, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#241423';
  ctx.beginPath(); ctx.arc(x + 14, y - 8, 2.8, 0, Math.PI * 2); ctx.fill();
  // Sweat drop of effort when the farmer is close is drawn by the game layer.
  void time;
}

export function drawFarmer(ctx, x, time, gap) {
  const feet = GROUND_Y;
  const stride = Math.sin(time * 13);
  ctx.save();
  // Legs in overalls, pumping.
  ctx.strokeStyle = '#33507a'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, feet - 62); ctx.lineTo(x - 4 + stride * 22, feet);
  ctx.moveTo(x + 10, feet - 62); ctx.lineTo(x + 14 - stride * 22, feet);
  ctx.stroke();
  // Boots.
  ctx.fillStyle = '#3a2415';
  ctx.fillRect(x - 12 + stride * 22, feet - 7, 18, 7);
  ctx.fillRect(x + 6 - stride * 22, feet - 7, 18, 7);
  // Torso: plaid shirt + overalls bib.
  ctx.fillStyle = '#b03a2e'; rr(ctx, x - 20, feet - 118, 52, 60, 8); ctx.fill();
  ctx.fillStyle = '#33507a'; rr(ctx, x - 12, feet - 92, 36, 36, 4); ctx.fill();
  ctx.strokeStyle = '#e8dcc4'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - 20, feet - 96); ctx.lineTo(x + 32, feet - 96); ctx.moveTo(x - 6, feet - 118); ctx.lineTo(x - 6, feet - 58); ctx.stroke();
  // Arm swinging forward, carving knife glinting.
  ctx.strokeStyle = '#d9a066'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(x + 26, feet - 108); ctx.lineTo(x + 52, feet - 84 + stride * 8); ctx.stroke();
  ctx.save();
  ctx.translate(x + 56, feet - 82 + stride * 8); ctx.rotate(0.5);
  ctx.fillStyle = '#e9edf2'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(30, -5); ctx.lineTo(30, 4); ctx.lineTo(2, 7); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5d3a1e'; ctx.fillRect(-10, -2, 11, 6);
  ctx.restore();
  // Head with straw hat and a very determined frown.
  ctx.fillStyle = '#eebd8d';
  ctx.beginPath(); ctx.arc(x + 6, feet - 134, 17, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8c96a';
  ctx.beginPath(); ctx.ellipse(x + 6, feet - 146, 30, 7, 0, 0, Math.PI * 2); ctx.fill();
  rr(ctx, x - 8, feet - 166, 28, 16, 4); ctx.fill();
  ctx.strokeStyle = '#4a2436'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x - 2, feet - 138); ctx.lineTo(x + 4, feet - 136); ctx.moveTo(x + 10, feet - 136); ctx.lineTo(x + 16, feet - 138); ctx.stroke(); // angry brows
  if (gap < 30) { // shouting when close
    ctx.fillStyle = '#4a2436';
    ctx.beginPath(); ctx.ellipse(x + 10, feet - 124, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------- obstacles & pickups ----------
export function drawObstacle(ctx, o, time) {
  ctx.save();
  if (o.kind === 'oven') {
    ctx.fillStyle = '#3d3f45'; rr(ctx, o.x, o.y, o.w, o.h, 8); ctx.fill();
    ctx.fillStyle = '#26272c'; rr(ctx, o.x + 10, o.y + 16, o.w - 20, 40, 6); ctx.fill();
    // Fire glow inside the oven window.
    const flicker = 0.75 + Math.sin(time * 11 + o.x) * 0.25;
    ctx.fillStyle = `rgba(255,${Math.floor(120 * flicker)},30,${0.85})`;
    rr(ctx, o.x + 16, o.y + 24, o.w - 32, 24, 4); ctx.fill();
    ctx.fillStyle = '#f7a54d';
    ctx.beginPath(); ctx.moveTo(o.x + 26, o.y + 46); ctx.quadraticCurveTo(o.x + 36, o.y + 26, o.x + 43, o.y + 46); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(o.x + 48, o.y + 46); ctx.quadraticCurveTo(o.x + 58, o.y + 30, o.x + 64, o.y + 46); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c9ccd4'; rr(ctx, o.x + 8, o.y + 6, o.w - 16, 7, 3); ctx.fill(); // handle bar
    ctx.fillStyle = '#17181c'; rr(ctx, o.x + 14, o.y + o.h - 12, 12, 8, 2); ctx.fill(); rr(ctx, o.x + o.w - 26, o.y + o.h - 12, 12, 8, 2); ctx.fill();
    ctx.fillStyle = '#ffb35c'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('HOT!', o.x + o.w / 2, o.y + 70);
  } else if (o.kind === 'knife') {
    // A carving knife stuck blade-up in a chopping block: leap it.
    ctx.fillStyle = '#8a5a2b'; rr(ctx, o.x - 4, GROUND_Y - 20, o.w + 8, 20, 4); ctx.fill();
    ctx.save(); ctx.translate(o.x + o.w / 2, GROUND_Y - 18); ctx.rotate(-0.1);
    ctx.fillStyle = '#e9edf2';
    ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(0, -44); ctx.lineTo(8, -2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#cfd6de'; ctx.beginPath(); ctx.moveTo(0, -44); ctx.lineTo(8, -2); ctx.lineTo(1, -2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4a2c14'; rr(ctx, -5, -2, 10, 14, 3); ctx.fill();
    ctx.restore();
  } else if (o.kind === 'fence') {
    ctx.fillStyle = '#a5713a';
    for (let i = 0; i < 4; i++) { rr(ctx, o.x + 6 + i * 23, o.y + 6, 10, o.h - 6, 3); ctx.fill(); }
    ctx.fillStyle = '#8a5a2b'; rr(ctx, o.x, o.y + 16, o.w, 9, 3); ctx.fill(); rr(ctx, o.x, o.y + 38, o.w, 9, 3); ctx.fill();
    ctx.fillStyle = '#c98d4b';
    ctx.beginPath(); ctx.moveTo(o.x + 6, o.y + 6); ctx.lineTo(o.x + 11, o.y - 4); ctx.lineTo(o.x + 16, o.y + 6); ctx.closePath(); ctx.fill();
  } else if (o.kind === 'rack') {
    // Butcher's rack: posts + a beam, with three carving knives hanging low.
    ctx.fillStyle = '#5d3a1e';
    rr(ctx, o.x, GROUND_Y - 196, 10, 196, 3); ctx.fill();
    rr(ctx, o.x + o.w - 10, GROUND_Y - 196, 10, 196, 3); ctx.fill();
    rr(ctx, o.x - 4, GROUND_Y - 202, o.w + 8, 12, 4); ctx.fill();
    ctx.fillStyle = '#fff3c4'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('SLIDE! ↓', o.x + o.w / 2, GROUND_Y - 208);
    for (let i = 0; i < 3; i++) {
      const kx = o.x + 24 + i * 34;
      ctx.strokeStyle = '#8a8f96'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(kx + 6, GROUND_Y - 190); ctx.lineTo(kx + 6, GROUND_Y - 168); ctx.stroke();
      ctx.fillStyle = '#e9edf2';
      ctx.beginPath(); ctx.moveTo(kx - 2, GROUND_Y - 168); ctx.lineTo(kx + 14, GROUND_Y - 168); ctx.lineTo(kx + 6, GROUND_Y - 118); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4a2c14'; rr(ctx, kx + 1, GROUND_Y - 176, 10, 9, 2); ctx.fill();
    }
  }
  ctx.restore();
}

export function drawPickup(ctx, p, time) {
  const bobY = Math.sin(time * 3 + p.bob) * 5;
  ctx.save(); ctx.translate(p.x, p.y + bobY);
  if (p.kind === 'corn') {
    ctx.rotate(0.5);
    ctx.fillStyle = '#ffd83d'; ctx.beginPath(); ctx.ellipse(0, 0, 10, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d9a514'; ctx.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 6, -16); ctx.lineTo(i * 6, 16); ctx.stroke(); }
    ctx.fillStyle = '#7cb342';
    ctx.beginPath(); ctx.ellipse(-9, 10, 6, 12, 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(9, 10, 6, 12, -0.6, 0, Math.PI * 2); ctx.fill();
  } else if (p.kind === 'pumpkin') {
    ctx.fillStyle = '#e8762c'; ctx.beginPath(); ctx.ellipse(0, 2, 21, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c25a1a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 2, 10, 16, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#5d7a2a'; rr(ctx, -3, -20, 7, 9, 2); ctx.fill();
  } else { // chili
    ctx.rotate(-0.4 + Math.sin(time * 5 + p.bob) * 0.12);
    ctx.fillStyle = '#d93a1e';
    ctx.beginPath(); ctx.moveTo(-4, -12); ctx.quadraticCurveTo(16, -2, 4, 18); ctx.quadraticCurveTo(-8, 8, -4, -12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3f7a1e'; rr(ctx, -7, -18, 12, 7, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,40,.35)';
    ctx.beginPath(); ctx.arc(0, 2, 24, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawBarnGate(ctx, x) {
  // The goal: a big friendly barn with its gate wide open and a hay-strewn floor.
  const base = GROUND_Y;
  ctx.save();
  ctx.fillStyle = '#a03d2a'; rr(ctx, x, base - 230, 240, 230, 6); ctx.fill();
  ctx.fillStyle = '#6e2718';
  ctx.beginPath(); ctx.moveTo(x - 14, base - 230); ctx.lineTo(x + 120, base - 300); ctx.lineTo(x + 254, base - 230); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2c1a12'; rr(ctx, x + 62, base - 168, 116, 168, 4); ctx.fill();
  ctx.fillStyle = '#f7d774'; rr(ctx, x + 74, base - 26, 92, 14, 4); ctx.fill(); // hay
  ctx.fillStyle = '#8f3626';
  ctx.save(); ctx.translate(x + 62, base - 84); ctx.rotate(-0.9); rr(ctx, -8, -84, 16, 168, 3); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x + 178, base - 84); ctx.rotate(0.9); rr(ctx, -8, -84, 16, 168, 3); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#fff7ea'; ctx.font = '900 25px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('FREEDOM BARN', x + 120, base - 246);
  ctx.restore();
}

// ---------- particles ----------
export class Particles {
  constructor() { this.list = []; }
  burst(x, y, colours, n = 12, speed = 260) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = speed * (0.3 + Math.random() * 0.7);
      this.list.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: 0.55 + Math.random() * 0.4, age: 0, colour: colours[i % colours.length], size: 3 + Math.random() * 5, leaf: Math.random() < 0.4 });
    }
  }
  feather(x, y) { this.burst(x, y, ['#c98d4b', '#96622f', '#e8dcc4'], 8, 180); }
  update(dt) {
    for (const p of this.list) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 700 * dt; p.vx *= 0.98; }
    this.list = this.list.filter((p) => p.age < p.life);
  }
  draw(ctx) {
    for (const p of this.list) {
      ctx.globalAlpha = 1 - p.age / p.life;
      ctx.fillStyle = p.colour;
      if (p.leaf) { ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, p.age * 4, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}
