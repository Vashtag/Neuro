import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, PALETTE } from '../config.js';

// GameScene: the world. In M1 it just proves the pipeline works by drawing a
// placeholder background and a label. Map, player, farming, etc. arrive in
// later milestones.
export default class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME);
  }

  create() {
    const { worldWidth, worldHeight } = GAME_CONFIG;

    this.cameras.main.setBackgroundColor(PALETTE.neuralGround);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    this.add
      .text(worldWidth / 2, worldHeight / 2, 'Hippocampus Hollow\n(scaffold ready)', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '24px',
        color: '#f4ecdf',
        align: 'center'
      })
      .setOrigin(0.5);
  }
}
