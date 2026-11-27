// game.js — the state machine and simulation: Gobbles auto-runs, the world
// scrolls past, the farmer's gap breathes in and out with your mistakes and
// your clean streaks, and three stages carry the run from farmyard to town.

import {
  BUFFER_SECONDS, CHILI_SECONDS, COYOTE_SECONDS, FARMER_HIT_PENALTY, FARMER_START_GAP,
  GOAL_METRES, GRAVITY, GROUND_Y, JUMP_CUT, JUMP_VELOCITY, METRES_PER_SECOND_BASE,
  SCORE, STAGE_W, START_LIVES,
} from './config.js';
import { makeRng } from './random.js';
import { obstacleBox, overlaps, spawnObstacle, spawnPickup, stageFor, stageIndexFor, turkeyBox } from './world.js';
import { Particles, drawBackground, drawBarnGate, drawFarmer, drawObstacle, drawPickup, drawTurkey } from './render.js';

export class Game {
  constructor(canvas, sound, hooks) {
    this.ctx = canvas.getContext('2d');
    this.sound = sound;
    this.hooks = hooks; // { onHud(game), onEnd(game), toast(text) }
    this.state = 'title'; // title | playing | paused | escaped | caught
    this.particles = new Particles();
    this.reset(1);
  }

  reset(seed) {
    this.rng = makeRng(seed * 7919 + 13);
    this.time = 0;
    this.scroll = 0;
    this.metres = 0;
    this.score = 0;
    this.combo = 1;
    this.cleanStreak = 0;
    this.lives = START_LIVES;
    this.farmerGap = FARMER_START_GAP;
    this.entities = [];
    this.spawnTimer = 1.7;
    this.turkey = {
      x: 300, y: GROUND_Y, vy: 0, onGround: true, sliding: false,
      coyote: 0, invincible: 0, chili: 0, wasJumpHeld: false,
    };
    this.stats = { corn: 0, pumpkins: 0, chilies: 0, smashes: 0, jumps: 0, slides: 0, bestCombo: 1 };
    this.alarmCooldown = 0;
    this.endedAt = 0;
  }

  start(seed = (Math.random() * 1e9) | 0) {
    this.reset(seed);
    this.state = 'playing';
    this.hooks.onHud(this);
  }

  stage() { return stageFor(this.metres); }
  stageIndex() { return stageIndexFor(this.metres); }

  speed() {
    const chiliBoost = this.turkey.chili > 0 ? 150 : 0;
    return this.stage().speed + chiliBoost;
  }

  // --- player actions, called from the main loop with buffered input ---
  tryJump(now, input) {
    const t = this.turkey;
    const canJump = t.onGround || t.coyote > 0;
    if (canJump && input.consumeBufferedJump(now, BUFFER_SECONDS)) {
      t.vy = JUMP_VELOCITY;
      t.onGround = false;
      t.coyote = 0;
      t.sliding = false;
      this.stats.jumps++;
      this.sound.jump();
      this.particles.burst(t.x - 10, GROUND_Y - 4, ['#c9a06a', '#a06a33'], 5, 120);
    }
    // Variable jump height: letting go early cuts the rise, so taps hop and holds
    // soar — but the cut never drops the rise below a fence-clearing hop (-640),
    // because a quick tap is how most players jump and it must still work.
    if (t.wasJumpHeld && !input.jumpHeld && t.vy < 0) t.vy = Math.max(t.vy * JUMP_CUT, -640);
    t.wasJumpHeld = input.jumpHeld;
  }

  update(dt, input, now) {
    this.time += dt;
    this.particles.update(dt);
    if (this.state !== 'playing') return;

    const t = this.turkey;
    const stage = this.stage();
    const speed = this.speed();
    this.scroll += speed * dt;
    this.metres += (speed / 46) * METRES_PER_SECOND_BASE / 11 * dt * 1.9;
    this.score += SCORE.metre * dt * 6;

    // Sliding: only on the ground; starting one plays the swoosh once.
    const wantSlide = input.slideHeld && t.onGround;
    if (wantSlide && !t.sliding) { this.stats.slides++; this.sound.slide(); }
    t.sliding = wantSlide;

    this.tryJump(now, input);

    // Gravity and the ground, keeping coyote time honest.
    const wasGround = t.onGround;
    t.vy += GRAVITY * dt;
    t.y += t.vy * dt;
    if (t.y >= GROUND_Y) {
      if (!wasGround && t.vy > 500) this.particles.burst(t.x, GROUND_Y - 2, ['#c9a06a'], 6, 130); // landing puff
      t.y = GROUND_Y; t.vy = 0; t.onGround = true;
    } else {
      if (wasGround && t.vy >= 0) t.coyote = COYOTE_SECONDS;
      t.onGround = false;
    }
    if (t.coyote > 0) t.coyote -= dt;
    if (t.invincible > 0) t.invincible -= dt;
    if (t.chili > 0) t.chili -= dt;

    this.spawn(dt, stage);
    this.moveEntities(dt, speed);
    this.collide();

    // The farmer: drifts closer as the run goes on, surges on a crash (in
    // collide), falls back while you run clean and collect snacks.
    const pressure = 0.3 + this.stageIndex() * 0.2;
    this.farmerGap -= pressure * dt;
    this.farmerGap += Math.min(this.cleanStreak, 10) * 0.06 * dt;
    if (t.chili > 0) this.farmerGap += 3.2 * dt;
    this.farmerGap = Math.max(0, Math.min(100, this.farmerGap));
    if (this.farmerGap < 28 && this.alarmCooldown <= 0) { this.sound.alarm(); this.alarmCooldown = 1.6; }
    if (this.alarmCooldown > 0) this.alarmCooldown -= dt;

    if (this.farmerGap <= 0) return this.finish(false, 'farmer');
    if (this.lives <= 0) return this.finish(false, 'feathers');
    if (this.metres >= GOAL_METRES) return this.finish(true, 'barn');
    this.hooks.onHud(this);
  }

  spawn(dt, stage) {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    const [lo, hi] = stage.spawnEvery;
    this.spawnTimer = lo + this.rng() * (hi - lo);
    // Don't spawn inside the barn's final approach.
    if (this.metres > GOAL_METRES - 60) return;
    const obstacle = spawnObstacle(this.rng, STAGE_W + 80, this.stageIndex());
    this.entities.push(obstacle);
    // A snack arc just past the obstacle rewards the jump or slide that beat it.
    if (this.rng() < 0.72) {
      const n = 1 + Math.floor(this.rng() * 3);
      for (let i = 0; i < n; i++) this.entities.push(spawnPickup(this.rng, STAGE_W + 220 + i * 64));
    } else if (this.rng() < 0.4) {
      this.entities.push(spawnPickup(this.rng, STAGE_W + 200));
    }
  }

  moveEntities(dt, speed) {
    for (const e of this.entities) e.x -= speed * dt;
    // Score the clean pass: clearing an obstacle untouched builds the streak.
    const box = turkeyBox(this.turkey);
    for (const e of this.entities) {
      if (e.type === 'obstacle' && !e.passed && e.x + e.w < box.x) {
        e.passed = true;
        this.cleanStreak++;
        if (this.cleanStreak % 5 === 0) {
          this.combo = Math.min(8, this.combo + 1);
          this.stats.bestCombo = Math.max(this.stats.bestCombo, this.combo);
          this.hooks.toast(`🔥 Clean streak ×${this.combo} combo!`);
        }
      }
    }
    this.entities = this.entities.filter((e) => e.x > -180 && !e.taken);
  }

  collide() {
    const t = this.turkey;
    const box = turkeyBox(t);
    for (const e of this.entities) {
      if (e.type === 'pickup') {
        const dx = e.x - t.x, dy = e.y - (t.y - 52);
        if (dx * dx + dy * dy < (e.r + 46) * (e.r + 46)) {
          e.taken = true;
          this.collect(e);
        }
        continue;
      }
      if (t.invincible > 0 || !overlaps(box, obstacleBox(e))) continue;
      if (t.chili > 0) {
        // Chili dash smashes straight through: feathers for him, points for you.
        const smashX = e.x + 40;
        e.x = -999; e.passed = true;
        this.stats.smashes++;
        this.addScore(SCORE.smash);
        this.sound.smash();
        this.particles.burst(smashX, GROUND_Y - 50, ['#e8762c', '#3d3f45', '#ffd83d'], 16, 320);
        continue;
      }
      // A real crash: lose a feather, brief invincibility, farmer surges.
      this.lives--;
      t.invincible = 1.4;
      this.combo = 1;
      this.cleanStreak = 0;
      this.farmerGap -= FARMER_HIT_PENALTY;
      this.sound.hurt();
      this.particles.feather(t.x - 10, t.y - 60);
      this.hooks.toast(this.lives > 0 ? `💥 Ouch! ${this.lives} feather${this.lives === 1 ? '' : 's'} left — keep running!` : '💥 Last feather gone!');
      e.passed = true; // the same obstacle never hits twice
    }
  }

  collect(e) {
    if (e.kind === 'corn') { this.stats.corn++; this.addScore(SCORE.corn); this.sound.corn(); this.farmerGap += 1.6; }
    if (e.kind === 'pumpkin') { this.stats.pumpkins++; this.addScore(SCORE.pumpkin); this.sound.corn(); this.farmerGap += 3; }
    if (e.kind === 'chili') {
      this.stats.chilies++;
      this.addScore(SCORE.chili);
      this.turkey.chili = CHILI_SECONDS;
      this.sound.chili();
      this.hooks.toast('🌶 CHILI DASH! Smash through everything!');
    }
    this.particles.burst(e.x, e.y, ['#ffd83d', '#e8762c', '#fff3c4'], 10, 200);
  }

  addScore(base) { this.score += base * this.combo; }

  finish(escaped, reason) {
    this.state = escaped ? 'escaped' : 'caught';
    this.endedAt = this.time;
    if (escaped) {
      this.score += 500 + this.lives * 150 + Math.round(this.farmerGap) * 2;
      this.sound.win();
      this.particles.burst(this.turkey.x + 60, this.turkey.y - 80, ['#ffd83d', '#7ed957', '#e8762c', '#fff3c4'], 30, 380);
    } else {
      this.sound.caught();
      this.particles.feather(this.turkey.x, this.turkey.y - 60);
    }
    this.score = Math.round(this.score);
    this.hooks.onEnd(this, escaped, reason);
    this.hooks.onHud(this);
  }

  stars() {
    if (this.state !== 'escaped') return 0;
    let s = 1;
    if (this.lives >= 2) s++;
    if (this.score >= 2600) s++;
    return s;
  }

  farmerX() {
    // The gap maps to screen distance: gap 100 keeps him off-screen left,
    // gap 0 puts his hands on Gobbles' tail feathers.
    return this.turkey.x - 120 - this.farmerGap * 2.1;
  }

  draw() {
    const ctx = this.ctx;
    const stage = this.stage();
    drawBackground(ctx, stage, this.scroll, this.time);
    // Barn gate in the final stretch.
    const metresLeft = GOAL_METRES - this.metres;
    if (metresLeft < 90) {
      const barnX = this.turkey.x + metresLeft * 7.2;
      drawBarnGate(ctx, barnX);
    }
    for (const e of this.entities) {
      if (e.type === 'obstacle') drawObstacle(ctx, e, this.time);
      else drawPickup(ctx, e, this.time);
    }
    // The farmer only enters the frame when he's genuinely close.
    const fx = this.farmerX();
    if (fx > -90) drawFarmer(ctx, fx, this.time, this.farmerGap);
    drawTurkey(ctx, this.turkey, this.time);
    this.particles.draw(ctx);

    if (this.state === 'caught') {
      ctx.fillStyle = 'rgba(36,14,28,.35)';
      ctx.fillRect(0, 0, STAGE_W, 720);
      ctx.fillStyle = '#fff7ea';
      ctx.font = '900 44px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('CAUGHT!', STAGE_W / 2, 210);
    }
  }
}
