import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, PALETTE } from '../config.js';
import MapManager from '../systems/MapManager.js';
import Player from '../objects/Player.js';
import { PLAYER_START_TILE } from '../data/mapData.js';

// GameScene: the world. Renders the Hippocampus Hollow map and (in later
// milestones) hosts the player, farming, interactions, archive and day systems.
export default class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME);
  }

  create() {
    const { worldWidth, worldHeight } = GAME_CONFIG;

    this.cameras.main.setBackgroundColor(PALETTE.border);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // --- Map ---
    this.map = new MapManager(this).create();

    // --- Player ---
    const start = this.map.tileToWorldCenter(PLAYER_START_TILE.x, PLAYER_START_TILE.y);
    this.player = new Player(this, start.x, start.y);
    this.physics.add.collider(this.player, this.map.colliders);

    // --- Camera ---
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setRoundPixels(true);

    // Debug probe for the headless smoke test (and console inspection).
    this.updateProbe();
  }

  update() {
    this.updateProbe({
      px: Math.round(this.player.x),
      py: Math.round(this.player.y),
      dir: this.player.lastDirection
    });
  }

  updateProbe(extra = {}) {
    window.__NEURO_PROBE__ = {
      scene: 'game',
      mapRows: this.map ? this.map.grid.length : 0,
      mapCols: this.map ? this.map.grid[0].length : 0,
      ...this.probeExtra,
      ...extra
    };
    this.probeExtra = { ...this.probeExtra, ...extra };
  }
}
