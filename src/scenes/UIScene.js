import Phaser from 'phaser';
import { SCENES } from '../config.js';

// UIScene: a transparent overlay that renders on top of GameScene. It will host
// the inventory bar, Field Notes panel, dialogue box, prompts and messages.
// In M1 it is an empty overlay; widgets are added in later milestones.
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.UI, active: false });
  }

  create() {
    // The UI scene must not steal input focus from the world; individual
    // interactive widgets will opt in when they exist.
    this.scene.bringToTop();
  }
}
