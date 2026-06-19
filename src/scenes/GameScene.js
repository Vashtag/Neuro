import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, PALETTE } from '../config.js';
import MapManager from '../systems/MapManager.js';
import Player from '../objects/Player.js';
import NPC from '../objects/NPC.js';
import InteractionSystem from '../systems/InteractionSystem.js';
import { PLAYER_START_TILE, INTERACTABLES } from '../data/mapData.js';
import {
  createDefaultGameState,
  carryingBerries,
  hasReadyCrop,
  carryingDreamBlooms,
  carryingKnowledgeHerbs,
  hasReadyCropOfType
} from '../data/gameState.js';
import { selectHebbStage } from '../data/dialogueData.js';
import FarmingSystem from '../systems/FarmingSystem.js';
import DaySystem from '../systems/DaySystem.js';
import ArchiveSystem from '../systems/ArchiveSystem.js';
import SoundManager from '../systems/SoundManager.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import {
  ACTION_MESSAGES,
  DREAM_MESSAGES,
  KNOWLEDGE_MESSAGES,
  CORTEX_COMPLETION_TEXT
} from '../data/dialogueData.js';
import { TEXTURE_KEYS } from '../data/assetManifest.js';
import { CODEX_ENTRIES } from '../data/codexData.js';

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

    // Restore opened gates when loading a save past those milestones.
    if (this.state.archive.fogCleared) this.map.clearFog();
    if (this.state.grove.restored) this.map.clearAxonGate();

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

    // Restore the Dream Altar / Cortex Library glow if loading mid Stage 2-3.
    this.updateAltarVisual(true);
    this.updateLibraryVisual(true);

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
    this.codexKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);

    // --- Day / sleep system ---
    this.daySystem = new DaySystem(this);

    // Mark already-discovered Field Guide entries as seen (no toast on load).
    this.syncCodex(true);

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
      promptSleep: () => this.daySystem.promptSleep(),
      openCodex: () => this.openCodex()
    };
  }

  // Contextual interaction handlers. Later milestones replace the placeholder
  // bodies with farming, archive and sleep logic.
  buildHandlers() {
    const msg = (m, d) => this.ui.showMessage(m, d);
    return {
      onNpc: () => this.talkToHebb(),
      onArchive: () => this.archive.deposit(),
      onDreamAltar: () => this.onDreamAltar(),
      onCortexLibrary: () => this.onCortexLibrary(),
      onKnowledgeCache: () => this.onKnowledgeCache(),
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

  // Fires once when the player first steps onto the restored teaser path that
  // leads up into Synapse Grove.
  checkTeaserReached() {
    if (!this.state.archive.fogCleared || this.state.tutorial.reachedTeaserPath) return;
    const tile = this.map.worldToTile(this.player.x, this.player.y);
    if (tile.y <= 22) {
      this.state.tutorial.reachedTeaserPath = true;
      this.updateFieldNotes(); // -> explore_grove
      this.sfx('fogClear');
      this.ui.showMessage('The fog has lifted. Synapse Grove opens to the north.', 3000);
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
    else if (s.archive.fogCleared) step = this.deriveGroveStep(s);
    else if (carryingBerries(s)) step = 'archive_berries';
    else if (hasReadyCrop(s)) step = 'harvest_berries';
    else step = 'grow_berries';
    s.fieldNotesStep = step;
    this.ui.refreshFieldNotes?.(s);
    this.syncCodex(false);
  }

  // Reveal newly-discovered Field Guide entries. Silent on load; toasts the
  // first time each concept is encountered during play.
  syncCodex(silent = false) {
    const seen = this.state.codex.seen;
    CODEX_ENTRIES.forEach((e) => {
      if (e.discovered(this.state) && !seen.includes(e.id)) {
        seen.push(e.id);
        if (!silent) {
          this.ui.showMessage(`New Field Guide entry: ${e.title} — press J to read.`, 2800);
          this.sfx('dialogue');
        }
      }
    });
  }

  openCodex() {
    this.syncCodex(true);
    this.player.setInputLocked(true);
    this.ui.openCodex(this.state);
    this.sfx('dialogue');
  }

  // Stage 2 objective progression (post-fog).
  deriveGroveStep(s) {
    if (!s.tutorial.reachedTeaserPath) return 'explore_path';
    if (!s.tutorial.receivedDreamSeeds) return 'explore_grove';
    if (s.grove.restored) return this.deriveCortexStep(s);
    if (carryingDreamBlooms(s)) return 'offer_dreams';
    if (hasReadyCropOfType(s, 'dream_bloom')) return 'harvest_dreams';
    return 'grow_dreams';
  }

  // Stage 3 objective progression (Cortex).
  deriveCortexStep(s) {
    if (s.cortex.complete) return 'complete';
    if (!s.tutorial.reachedCortex) return 'cross_bridge';
    if (!s.tutorial.receivedKnowledgeSeeds) return 'find_cache';
    if (carryingKnowledgeHerbs(s)) return 'store_knowledge';
    if (hasReadyCropOfType(s, 'knowledge_herb')) return 'harvest_knowledge';
    return 'grow_knowledge';
  }

  // Offer carried Dream Blooms to the Dream Altar (Stage 2 goal).
  onDreamAltar() {
    const grove = this.state.grove;
    const inv = this.state.inventory;
    const carried = inv.dreamBlooms;

    if (carried <= 0) {
      this.ui.showMessage(DREAM_MESSAGES.waiting);
      this.sfx('unavailable');
      return;
    }

    inv.dreamBlooms = 0;
    grove.dreamBloomsOffered = Math.min(grove.dreamBloomsOffered + carried, grove.requiredDreamBlooms);
    this.state.tutorial.offeredFirstDream = true;

    this.sfx('archive');
    this.updateAltarVisual();
    this.syncUI(['dreamBloom']);
    this.updateFieldNotes();

    const n = grove.dreamBloomsOffered;
    this.ui.showMessage(`${DREAM_MESSAGES.offer(carried)} (${n}/${grove.requiredDreamBlooms})`, 2600);

    if (n >= grove.requiredDreamBlooms && !grove.restored) {
      grove.restored = true;
      this.time.delayedCall(900, () => this.handleGroveComplete());
    }
  }

  // Glow overlay alpha scales with offered progress.
  updateAltarVisual(instant = false) {
    const glow = this.map.dreamAltarGlowSprite;
    if (!glow) return;
    const grove = this.state.grove;
    const ratio = grove.dreamBloomsOffered / grove.requiredDreamBlooms;
    if (instant) glow.setAlpha(ratio);
    else this.tweens.add({ targets: glow, alpha: ratio, duration: 700, ease: 'Sine.easeInOut' });
  }

  // Stage 2 -> 3 transition: restoring the grove opens the axon bridge north.
  handleGroveComplete() {
    this.sfx('fogClear');
    this.state.tutorial.axonBridgeOpened = true;
    this.ui.showMessage(DREAM_MESSAGES.restored, 2600);
    this.map.clearAxonGate(() => {
      this.ui.showMessage('The axon bridge opens. The Cortex waits to the north.', 3000);
    });
    this.updateFieldNotes(); // -> cross_bridge
  }

  // --- Stage 3: Cortex ---

  // Knowledge Cache: hands the player Knowledge Seeds (once).
  onKnowledgeCache() {
    if (this.state.tutorial.receivedKnowledgeSeeds) {
      this.ui.showMessage(KNOWLEDGE_MESSAGES.cacheEmpty);
      this.sfx('unavailable');
      return;
    }
    this.state.inventory.knowledgeSeeds = 5;
    this.state.tutorial.receivedKnowledgeSeeds = true;
    this.sfx('plant');
    this.syncUI(['knowledgeSeed']);
    this.updateFieldNotes();
    this.ui.showMessage(KNOWLEDGE_MESSAGES.cache, 3200);
  }

  // Cortex Library: store carried Knowledge Herbs (Stage 3 goal).
  onCortexLibrary() {
    const cortex = this.state.cortex;
    const inv = this.state.inventory;
    const carried = inv.knowledgeHerbs;

    if (carried <= 0) {
      this.ui.showMessage(KNOWLEDGE_MESSAGES.storeWaiting);
      this.sfx('unavailable');
      return;
    }

    inv.knowledgeHerbs = 0;
    cortex.knowledgeHerbsStored = Math.min(
      cortex.knowledgeHerbsStored + carried,
      cortex.requiredKnowledgeHerbs
    );
    this.state.tutorial.storedFirstKnowledge = true;

    this.sfx('archive');
    this.updateLibraryVisual();
    this.syncUI(['knowledgeHerb']);
    this.updateFieldNotes();

    const n = cortex.knowledgeHerbsStored;
    this.ui.showMessage(`${KNOWLEDGE_MESSAGES.store(carried)} (${n}/${cortex.requiredKnowledgeHerbs})`, 2600);

    if (n >= cortex.requiredKnowledgeHerbs && !cortex.complete) {
      cortex.complete = true;
      this.time.delayedCall(900, () => this.handleCortexComplete());
    }
  }

  updateLibraryVisual(instant = false) {
    const glow = this.map.cortexLibraryGlowSprite;
    if (!glow) return;
    const c = this.state.cortex;
    const ratio = c.knowledgeHerbsStored / c.requiredKnowledgeHerbs;
    if (instant) glow.setAlpha(ratio);
    else this.tweens.add({ targets: glow, alpha: ratio, duration: 700, ease: 'Sine.easeInOut' });
  }

  // Stage 3 finale.
  handleCortexComplete() {
    this.sfx('fogClear');
    this.updateFieldNotes(); // -> complete
    this.ui.showMessage(KNOWLEDGE_MESSAGES.complete, 2600);
    this.player.setInputLocked(true);
    this.time.delayedCall(1200, () => {
      this.ui.showCompletion(CORTEX_COMPLETION_TEXT.title, CORTEX_COMPLETION_TEXT.body);
    });
  }

  // Fires once when the player first steps into the Cortex.
  checkCortexReached() {
    if (!this.state.grove.restored || this.state.tutorial.reachedCortex) return;
    const tile = this.map.worldToTile(this.player.x, this.player.y);
    if (tile.y <= 9) {
      this.state.tutorial.reachedCortex = true;
      this.updateFieldNotes(); // -> find_cache
      this.ui.showMessage('The Cortex. Facts grow here — loud, stubborn, and easily forgotten.', 3000);
    }
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
    if (stage.id === 'dream_intro' && !this.state.tutorial.receivedDreamSeeds) {
      this.grantDreamSeeds();
    }
    if (stage.id === 'fog_cleared' || stage.id === 'fog_cleared_2') {
      this.state.tutorial.hebbPostFogLine += 1;
    }
  }

  // Stage 2: Dr. Hebb hands over Dream Seeds after the grove opens.
  grantDreamSeeds() {
    this.state.inventory.dreamSeeds = 5;
    this.state.tutorial.receivedDreamSeeds = true;
    this.updateFieldNotes();
    this.syncUI(['dreamSeed']);
    this.ui.showMessage('Received: 5 Dream Seeds. Plant them in the grove soil.', 3200);
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
    // Surface the Dr. Hebb Field Guide entry after the kit message clears.
    this.time.delayedCall(3500, () => this.syncCodex(false));
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

    // While the Field Guide is open, J or Esc closes it.
    if (this.ui.isCodexActive()) {
      if (
        Phaser.Input.Keyboard.JustDown(this.codexKey) ||
        Phaser.Input.Keyboard.JustDown(this.escKey)
      ) {
        this.ui.closeCodex();
        this.player.setInputLocked(false);
      }
      this.interaction.setPromptVisible(false);
      this.updateProbe(this.probeSnapshot());
      return;
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

    // Open the Field Guide (only when no modal is active — gated above).
    if (Phaser.Input.Keyboard.JustDown(this.codexKey)) {
      this.openCodex();
      this.updateProbe(this.probeSnapshot());
      return;
    }

    this.interaction.update();
    this.checkTeaserReached();
    this.checkCortexReached();

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
      fieldNotes: this.state.fieldNotesStep,
      codexActive: this.ui.isCodexActive(),
      codexSeen: this.state.codex.seen.length
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
