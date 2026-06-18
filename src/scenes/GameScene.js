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
import DaySystem from '../systems/DaySystem.js';
import ArchiveSystem from '../systems/ArchiveSystem.js';
import SoundManager from '../systems/SoundManager.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { ACTION_MESSAGES, COMPLETION_TEXT } from '../data/dialogueData.js';
import { TEXTURE_KEYS } from '../data/assetManifest.js';

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

    // --- Audio (synthesized; resumes on first input) ---
    this.soundManager = new SoundManager();
    this.input.keyboard.once('keydown', () => this.soundManager.ensureContext());
    this.input.once('pointerdown', () => this.soundManager.ensureContext());

    // --- Central game state (load save if present) ---
    this.state = SaveSystem.load();

    // --- Map ---
    this.map = new MapManager(this).create();

    // --- Player ---
    const start = this.map.tileToWorldCenter(PLAYER_START_TILE.x, PLAYER_START_TILE.y);
    this.player = new Player(this, start.x, start.y);
    this.physics.add.collider(this.player, this.map.colliders);

    // --- Synapse Grove teaser decorations ---
    this.createTeaserDecorations();

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

    // --- Archive ---
    this.archive = new ArchiveSystem(this);

    // --- UI reference + interaction ---
    this.ui = this.scene.get(SCENES.UI);
    this.interaction = new InteractionSystem(this, this.player, this.map, this.buildHandlers());
    this.syncUI();

    this.interactKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    ];
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.resetKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.muteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    // --- Day / sleep system ---
    this.daySystem = new DaySystem(this);

    // Reflect any loaded progress in the Field Notes objective.
    this.updateFieldNotes();

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
      grow: () => this.farming.growOvernight(),
      setBerries: (n) => {
        this.state.inventory.memoryBerries = n;
        this.syncUI();
      },
      tile: (x, y) => this.map.getTileChar(x, y),
      walkable: (x, y) => this.map.isWalkable(x, y),
      promptSleep: () => this.daySystem.promptSleep()
    };
  }

  // Contextual interaction handlers. Later milestones replace the placeholder
  // bodies with farming, archive and sleep logic.
  buildHandlers() {
    const msg = (m, d) => this.ui.showMessage(m, d);
    return {
      onNpc: () => this.talkToHebb(),
      onArchive: () => this.archive.deposit(),
      onSleep: () => this.daySystem.promptSleep(),
      onSign: (zone) => msg(zone.message || 'A weathered sign.', 3200),
      onFarm: (tile) => this.farming.doAction(tile),
      onUnavailable: () => msg('Nothing to do here right now.')
    };
  }

  // Small non-blocking decorations for the Synapse Grove teaser interactables.
  createTeaserDecorations() {
    const T = GAME_CONFIG.tileSize;
    const place = (id, draw) => {
      const z = INTERACTABLES.find((i) => i.id === id);
      if (z) draw(z.x * T + T / 2, z.y * T + T / 2);
    };

    place('synapse_signpost', (x, y) => {
      this.add.image(x, y, TEXTURE_KEYS.signpost).setDepth(y + 16);
    });

    place('synapse_firefly', (x, y) => {
      const orb = this.add.image(x, y, TEXTURE_KEYS.orb).setDepth(y + 16);
      this.tweens.add({ targets: orb, y: y - 6, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: orb, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });
    });

    place('axon_bridge', (x, y) => {
      const g = this.add.graphics().setDepth(y + 16);
      g.fillStyle(PALETTE.path, 1);
      g.fillRoundedRect(x - 12, y - 5, 24, 10, 3);
      g.lineStyle(2, PALETTE.sparkle, 0.8);
      g.strokeRoundedRect(x - 12, y - 5, 24, 10, 3);
    });
  }

  // Play a synthesized sound effect by key (no-op if audio is unavailable).
  sfx(key) {
    if (this.soundManager) this.soundManager.play(key);
  }

  // Fires once when the player first steps onto the restored teaser path.
  checkTeaserReached() {
    if (!this.state.archive.fogCleared || this.state.tutorial.reachedTeaserPath) return;
    const tile = this.map.worldToTile(this.player.x, this.player.y);
    if (tile.y <= 2) {
      this.state.tutorial.reachedTeaserPath = true;
      this.updateFieldNotes(); // -> complete
      this.sfx('fogClear');
      this.player.setInputLocked(true);
      this.ui.showCompletion(COMPLETION_TEXT.title, COMPLETION_TEXT.body);
    }
  }

  // Reaching 5/5 archived: clear the Forgetting Fog. The teaser path + end-of-
  // build completion are layered on in M10.
  handleArchiveComplete() {
    this.sfx('fogClear');
    this.updateFieldNotes(); // -> explore_path (fogCleared now true)
    this.ui.refreshFieldNotes?.(this.state);
    this.map.clearFog(() => {
      this.ui.showMessage(ACTION_MESSAGES.fogClear, 2600);
    });
    // Dr. Hebb remarks on the lifting fog.
    this.time.delayedCall(700, () => this.talkToHebb());
  }

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
    this.sfx('dialogue');
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
    // Dev-only: reset the save and reload for a guaranteed-clean state.
    if (Phaser.Input.Keyboard.JustDown(this.resetKey)) {
      SaveSystem.reset();
      window.location.reload();
      return;
    }

    // Toggle audio mute.
    if (Phaser.Input.Keyboard.JustDown(this.muteKey)) {
      this.audioMuted = !this.audioMuted;
      this.soundManager.setMuted(this.audioMuted);
      this.ui.showMessage(this.audioMuted ? 'Sound off' : 'Sound on', 1200);
    }

    // The completion overlay captures E to dismiss and then unlocks the player.
    if (this.ui.isCompletionActive()) {
      if (
        Phaser.Input.Keyboard.JustDown(this.interactKeys[0]) ||
        Phaser.Input.Keyboard.JustDown(this.interactKeys[1])
      ) {
        this.ui.dismissCompletion();
        this.player.setInputLocked(false);
      }
      this.updateProbe(this.probeSnapshot());
      return;
    }

    // While a confirm modal is open, E/Space/Enter = yes, Esc = no.
    if (this.ui.isConfirmActive()) {
      if (
        Phaser.Input.Keyboard.JustDown(this.interactKeys[0]) ||
        Phaser.Input.Keyboard.JustDown(this.interactKeys[1])
      ) {
        this.ui.resolveConfirm(true);
      } else if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
        this.ui.resolveConfirm(false);
      }
      this.interaction.setPromptVisible(false);
      this.updateProbe(this.probeSnapshot());
      return;
    }

    // While a dialogue is open, E/Space only advances it.
    if (this.ui.isDialogueActive()) {
      if (
        Phaser.Input.Keyboard.JustDown(this.interactKeys[0]) ||
        Phaser.Input.Keyboard.JustDown(this.interactKeys[1])
      ) {
        this.sfx('dialogue');
        this.ui.advanceDialogue();
      }
      this.interaction.setPromptVisible(false);
      this.updateProbe(this.probeSnapshot());
      return;
    }

    this.interaction.update();
    this.checkTeaserReached();

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
