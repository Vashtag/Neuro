import Phaser from 'phaser';
import { GEN_KEYS } from '../systems/TextureFactory.js';

// A simple static NPC (Dr. Hebb). Has a collision body so the player approaches
// rather than overlaps, and a subtle idle bob so it reads as alive.
export default class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = GEN_KEYS.hebbDown) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body

    this.setOrigin(0.5, 0.85);
    this.setDepth(y);
    if (this.body) {
      this.body.setSize(18, 14);
      this.body.setOffset((this.width - 18) / 2, this.height - 16);
    }

    // Gentle idle bob.
    scene.tweens.add({
      targets: this,
      y: y - 2,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
