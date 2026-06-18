import Phaser from 'phaser';
import { SCENES } from '../config.js';

// BootScene: minimal startup. Sets a couple of global niceties and immediately
// hands off to the PreloadScene. Kept tiny on purpose.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create() {
    // Crisp pixel-art scaling everywhere.
    this.scene.start(SCENES.PRELOAD);
  }
}
