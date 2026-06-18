import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, PALETTE } from '../config.js';
import MapManager from '../systems/MapManager.js';
import Player from '../objects/Player.js';
import NPC from '../objects/NPC.js';
import InteractionSystem from '../systems/InteractionSystem.js';
import { PLAYER_START_TILE, INTERACTABLES } from '../data/mapData.js';

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

    // --- Dr. Hebb NPC ---
    const hebbZone = INTERACTABLES.find((z) => z.id === 'dr_hebb');
    const hebbPos = this.map.tileToWorldCenter(hebbZone.x, hebbZone.y);
    this.drHebb = new NPC(this, hebbPos.x, hebbPos.y);
    this.physics.add.collider(this.player, this.drHebb);

    // --- Camera ---
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setRoundPixels(true);

    // --- UI reference + interaction ---
    this.ui = this.scene.get(SCENES.UI);
    this.interaction = new InteractionSystem(this, this.player, this.map, this.buildHandlers());

    this.interactKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    ];

    // Debug probe for the headless smoke test (and console inspection).
    this.updateProbe();
  }

  // Contextual interaction handlers. Later milestones replace the placeholder
  // bodies with dialogue, farming, archive and sleep logic.
  buildHandlers() {
    const msg = (m, d) => this.ui.showMessage(m, d);
    return {
      onNpc: () => msg('Dr. Hebb mutters something academic. (dialogue arrives in M5)'),
      onArchive: () => msg('The Archive hums softly. It is waiting for retrieved memories.'),
      onSleep: () => msg('A cozy door. (sleep system arrives in M8)'),
      onSign: (zone) => msg(zone.message || 'A weathered sign.', 3200),
      onFarm: (tile) => msg(`Memory soil at (${tile.x}, ${tile.y}). (farming arrives in M7)`),
      onUnavailable: () => msg('Nothing to do here right now.')
    };
  }

  update() {
    this.interaction.update();

    if (Phaser.Input.Keyboard.JustDown(this.interactKeys[0]) || Phaser.Input.Keyboard.JustDown(this.interactKeys[1])) {
      this.interaction.interact();
    }

    this.updateProbe({
      px: Math.round(this.player.x),
      py: Math.round(this.player.y),
      dir: this.player.lastDirection,
      target: this.interaction.currentTarget ? this.interaction.currentTarget.kind : null
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
