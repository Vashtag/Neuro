import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, PALETTE } from '../config.js';
import MapManager from '../systems/MapManager.js';
import Player from '../objects/Player.js';
import NPC from '../objects/NPC.js';
import InteractionSystem from '../systems/InteractionSystem.js';
import { PLAYER_START_TILE, INTERACTABLES } from '../data/mapData.js';
import { createDefaultGameState, carryingBerries, hasReadyCrop } from '../data/gameState.js';
import { selectHebbStage } from '../data/dialogueData.js';
import FarmingSystem from '../systems/FarmingSystem.js';

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

    // --- Central game state ---
    this.state = createDefaultGameState();

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

    // --- Farming ---
    this.farming = new FarmingSystem(this);
    this.farming.init();

    // --- UI reference + interaction ---
    this.ui = this.scene.get(SCENES.UI);
    this.interaction = new InteractionSystem(this, this.player, this.map, this.buildHandlers());
    this.syncUI();

    this.interactKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    ];

    // Debug probe for the headless smoke test (and console inspection).
    this.updateProbe();

    // Dev-only debug hooks (teleport, state inspection) for testing flows that
    // would otherwise require long manual navigation.
    window.__NEURO_DEBUG__ = {
      teleport: (tx, ty) => {
        const w = this.map.tileToWorldCenter(tx, ty);
        this.player.setPosition(w.x, w.y);
      },
      state: () => this.state,
      talk: () => this.talkToHebb(),
      giveKit: () => this.grantStarterKit(),
      grow: () => this.farming.growOvernight()
    };
  }

  // Contextual interaction handlers. Later milestones replace the placeholder
  // bodies with farming, archive and sleep logic.
  buildHandlers() {
    const msg = (m, d) => this.ui.showMessage(m, d);
    return {
      onNpc: () => this.talkToHebb(),
      onArchive: () => msg('The Archive hums softly. It is waiting for retrieved memories.'),
      onSleep: () => msg('A cozy door. (sleep system arrives in M8)'),
      onSign: (zone) => msg(zone.message || 'A weathered sign.', 3200),
      onFarm: (tile) => this.farming.doAction(tile),
      onUnavailable: () => msg('Nothing to do here right now.')
    };
  }

  // Placeholder SFX hook; replaced by the WebAudio SoundManager in M11.
  sfx() {}

  // Derive the Field Notes objective from current progress and refresh the UI.
  updateFieldNotes() {
    const s = this.state;
    let step;
    if (!s.tutorial.metDrHebb) step = 'talk_to_hebb';
    else if (s.archive.fogCleared) step = s.tutorial.reachedTeaserPath ? 'complete' : 'explore_path';
    else if (carryingBerries(s)) step = 'archive_berries';
    else if (hasReadyCrop(s)) step = 'harvest_berries';
    else step = 'grow_berries';
    s.fieldNotesStep = step;
    this.ui.refreshFieldNotes?.(s);
  }

  // --- Dr. Hebb dialogue ---
  talkToHebb() {
    const stage = selectHebbStage(this.state);
    this.player.setInputLocked(true);
    this.ui.showDialogue('Dr. Hebb', stage.lines, () => this.onHebbDialogueComplete(stage));
  }

  onHebbDialogueComplete(stage) {
    this.player.setInputLocked(false);

    if (stage.id === 'intro' && !this.state.tutorial.receivedTools) {
      this.grantStarterKit();
    }
    if (stage.id === 'fog_cleared' || stage.id === 'fog_cleared_2') {
      this.state.tutorial.hebbPostFogLine += 1;
    }
  }

  // Reward after the intro: tools + 5 Memory Seeds, advance objective.
  grantStarterKit() {
    const inv = this.state.inventory;
    inv.hasNeuroHoe = true;
    inv.hasRecallCan = true;
    inv.hasSeedPouch = true;
    inv.hasArchiveSatchel = true;
    inv.memorySeeds = 5;

    this.state.tutorial.metDrHebb = true;
    this.state.tutorial.receivedTools = true;
    this.state.fieldNotesStep = 'grow_berries';

    this.syncUI(['seedPouch']);
    this.ui.showMessage('Received: NeuroHoe, Recall Can, Seed Pouch, Archive Satchel, and 5 Memory Seeds.', 3400);
  }

  // Refresh all stateful UI. `flash` is an optional list of inventory slot ids
  // to pulse (implemented in M6).
  syncUI(flash = []) {
    this.ui.refreshInventory?.(this.state, flash);
    this.ui.refreshFieldNotes?.(this.state);
  }

  update() {
    // While a dialogue is open, E/Space only advances it.
    if (this.ui.isDialogueActive()) {
      if (
        Phaser.Input.Keyboard.JustDown(this.interactKeys[0]) ||
        Phaser.Input.Keyboard.JustDown(this.interactKeys[1])
      ) {
        this.ui.advanceDialogue();
      }
      this.interaction.setPromptVisible(false);
      this.updateProbe(this.probeSnapshot());
      return;
    }

    this.interaction.update();

    if (
      Phaser.Input.Keyboard.JustDown(this.interactKeys[0]) ||
      Phaser.Input.Keyboard.JustDown(this.interactKeys[1])
    ) {
      this.interaction.interact();
    }

    this.updateProbe(this.probeSnapshot());
  }

  probeSnapshot() {
    return {
      px: Math.round(this.player.x),
      py: Math.round(this.player.y),
      dir: this.player.lastDirection,
      target: this.interaction.currentTarget ? this.interaction.currentTarget.kind : null,
      dialogue: this.ui.isDialogueActive(),
      day: this.state.day,
      seeds: this.state.inventory.memorySeeds,
      berries: this.state.inventory.memoryBerries,
      archived: this.state.archive.memoryBerriesArchived,
      metHebb: this.state.tutorial.metDrHebb,
      fieldNotes: this.state.fieldNotesStep
    };
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
