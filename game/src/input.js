// input.js — keyboard + mouse input with the two tricks that make a runner feel fair:
// jump buffering (a press slightly before landing still jumps) and coyote time
// (a press slightly after leaving the ground still jumps). The game polls intents.

export class Input {
  constructor(canvas) {
    this.jumpHeld = false;
    this.slideHeld = false;
    this.jumpPressedAt = -Infinity;   // timestamp of the last fresh jump press
    this.onPause = null;
    this.onMute = null;
    this.onAnyKey = null;

    addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const k = e.code;
      if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW') {
        this.jumpHeld = true;
        this.jumpPressedAt = performance.now() / 1000;
        e.preventDefault();
      }
      if (k === 'ArrowDown' || k === 'KeyS') { this.slideHeld = true; e.preventDefault(); }
      if (k === 'KeyP' || k === 'Escape') this.onPause?.();
      if (k === 'KeyM') this.onMute?.();
      this.onAnyKey?.(k);
    });
    addEventListener('keyup', (e) => {
      const k = e.code;
      if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW') this.jumpHeld = false;
      if (k === 'ArrowDown' || k === 'KeyS') this.slideHeld = false;
    });

    // Mouse: a click anywhere jumps; holding the lower half of the stage slides.
    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const yRatio = (e.clientY - rect.top) / rect.height;
      if (yRatio > 0.62) { this.slideHeld = true; }
      else { this.jumpHeld = true; this.jumpPressedAt = performance.now() / 1000; }
      this.onAnyKey?.('Mouse');
    });
    addEventListener('pointerup', () => { this.jumpHeld = false; this.slideHeld = false; });
  }

  // Was jump pressed within the buffer window? Consuming the press so it fires once.
  consumeBufferedJump(now, bufferSeconds) {
    if (now - this.jumpPressedAt <= bufferSeconds) {
      this.jumpPressedAt = -Infinity;
      return true;
    }
    return false;
  }
}
