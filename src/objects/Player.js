import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { GEN_KEYS } from '../systems/TextureFactory.js';

const SPEED = GAME_CONFIG.playerSpeed;

// The Little Neuroscientist. Smooth free movement (WASD / arrows), direction
// tracking for tile-based farming, and a lightweight bob/squash "walk" placeholder.
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, GEN_KEYS.playerDown);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.85);
    // Collision body sits at the feet for natural top-down overlap.
    this.body.setSize(14, 10);
    this.body.setOffset((this.width - 14) / 2, this.height - 12);
    this.setCollideWorldBounds(true);

    this.lastDirection = 'down';
    this.isMoving = false;
    this.walkTimer = 0;
    this.baseY = 0;

    // Input: arrows + WASD.
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.cursors = scene.input.keyboard.createCursorKeys();

    // Movement can be frozen during dialogue, sleeping, etc.
    this.inputLocked = false;
  }

  setInputLocked(locked) {
    this.inputLocked = locked;
    if (locked) {
      this.setVelocity(0, 0);
      this.setFrameForDirection();
    }
  }

  // The tile directly in front of the player, for farming/interaction targeting.
  getFacingTile(map) {
    const t = map.worldToTile(this.x, this.y);
    switch (this.lastDirection) {
      case 'up':
        return { x: t.x, y: t.y - 1 };
      case 'down':
        return { x: t.x, y: t.y + 1 };
      case 'left':
        return { x: t.x - 1, y: t.y };
      case 'right':
        return { x: t.x + 1, y: t.y };
      default:
        return { x: t.x, y: t.y + 1 };
    }
  }

  setFrameForDirection() {
    switch (this.lastDirection) {
      case 'up':
        this.setTexture(GEN_KEYS.playerUp).setFlipX(false);
        break;
      case 'left':
        this.setTexture(GEN_KEYS.playerSide).setFlipX(true);
        break;
      case 'right':
        this.setTexture(GEN_KEYS.playerSide).setFlipX(false);
        break;
      default:
        this.setTexture(GEN_KEYS.playerDown).setFlipX(false);
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Keep render depth tied to world Y so the player passes behind/in front of
    // taller objects correctly.
    this.setDepth(this.y);

    if (this.inputLocked) {
      this.applyBob(delta, false);
      return;
    }

    const left = this.keys.left.isDown || this.cursors.left.isDown;
    const right = this.keys.right.isDown || this.cursors.right.isDown;
    const up = this.keys.up.isDown || this.cursors.up.isDown;
    const down = this.keys.down.isDown || this.cursors.down.isDown;

    let vx = 0;
    let vy = 0;
    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    const moving = vx !== 0 || vy !== 0;

    if (moving) {
      // Normalise so diagonals are not faster.
      const len = Math.hypot(vx, vy);
      this.setVelocity((vx / len) * SPEED, (vy / len) * SPEED);

      // Face the dominant axis; prefer horizontal facing on diagonals so the
      // side sprite reads well.
      if (vx !== 0) this.lastDirection = vx < 0 ? 'left' : 'right';
      else this.lastDirection = vy < 0 ? 'up' : 'down';
      this.setFrameForDirection();
    } else {
      this.setVelocity(0, 0);
    }

    this.isMoving = moving;
    this.applyBob(delta, moving);
  }

  // Simple placeholder "walk": a gentle squash/stretch while moving. Avoids
  // touching position (the physics body owns that).
  applyBob(delta, moving) {
    if (moving) {
      this.walkTimer += delta;
      const squash = Math.abs(Math.sin(this.walkTimer * 0.018)) * 0.06;
      this.setScale(1 + squash * 0.5, 1 - squash);
    } else {
      this.walkTimer = 0;
      this.setScale(1, 1);
    }
  }
}
