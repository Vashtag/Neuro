import { GAME_CONFIG } from '../config.js';
import { TEXTURE_KEYS } from '../data/assetManifest.js';
import { ACTION_MESSAGES } from '../data/dialogueData.js';

const T = GAME_CONFIG.tileSize;

const CROP_STAGE_TEXTURE = [
  TEXTURE_KEYS.cropSeed,
  TEXTURE_KEYS.cropSprout,
  TEXTURE_KEYS.cropBud,
  TEXTURE_KEYS.cropReady
];

const WATERED_NIGHTS_REQUIRED = 2;

// FarmingSystem: owns the 5x5 Memory Berry plot. Tile-based contextual actions
// (till > plant > water > harvest), overnight growth, and per-tile visuals.
// Crop state lives in gameState.crops so it serializes for saves.
export default class FarmingSystem {
  constructor(scene) {
    this.scene = scene;
    this.state = scene.state;
    this.map = scene.map;
    this.sprites = new Map(); // key "x,y" -> { soil, crop }
  }

  key(x, y) {
    return `${x},${y}`;
  }

  init() {
    // First run: populate crop tiles from the farmable map tiles.
    if (!this.state.crops || this.state.crops.length === 0) {
      const tiles = [];
      for (let y = 0; y < this.map.grid.length; y += 1) {
        for (let x = 0; x < this.map.grid[y].length; x += 1) {
          if (this.map.isFarmable(x, y)) {
            tiles.push({ x, y, soilState: 'untilled', wateredToday: false, crop: null });
          }
        }
      }
      this.state.crops = tiles;
    }
    this.state.crops.forEach((entry) => this.renderEntry(entry));
  }

  getEntry(tx, ty) {
    return this.state.crops.find((c) => c.x === tx && c.y === ty) || null;
  }

  // Pick the displayed growth-stage index. Bud (2) is a "watered, about to
  // mature" preview so all four stage art gets used across the 2-night cycle.
  cropStageIndex(crop) {
    if (!crop) return -1;
    if (crop.ready) return 3;
    if (crop.wateredToday && crop.wateredNights >= 1) return 2;
    return crop.wateredNights >= 1 ? 1 : 0;
  }

  soilTexture(entry) {
    if (entry.wateredToday) return TEXTURE_KEYS.soilWatered;
    if (entry.soilState === 'tilled') return TEXTURE_KEYS.soilTilled;
    return TEXTURE_KEYS.soil;
  }

  renderEntry(entry) {
    const k = this.key(entry.x, entry.y);
    let pair = this.sprites.get(k);
    const wx = entry.x * T;
    const wy = entry.y * T;
    if (!pair) {
      const soil = this.scene.add.image(wx, wy, this.soilTexture(entry)).setOrigin(0, 0).setDepth(-8);
      const crop = this.scene.add.image(wx + T / 2, wy + T / 2, TEXTURE_KEYS.cropSeed).setOrigin(0.5).setDepth(wy + T);
      crop.setVisible(false);
      pair = { soil, crop };
      this.sprites.set(k, pair);
    }
    pair.soil.setTexture(this.soilTexture(entry));

    const stage = this.cropStageIndex(entry.crop);
    if (stage < 0) {
      pair.crop.setVisible(false);
    } else {
      pair.crop.setTexture(CROP_STAGE_TEXTURE[stage]).setVisible(true);
      if (entry.crop.ready) this.attachReadyPulse(pair.crop);
      else this.detachReadyPulse(pair.crop);
    }
  }

  attachReadyPulse(sprite) {
    if (sprite._pulse) return;
    sprite._pulse = this.scene.tweens.add({
      targets: sprite,
      scale: 1.12,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  detachReadyPulse(sprite) {
    if (sprite._pulse) {
      sprite._pulse.stop();
      sprite._pulse = null;
      sprite.setScale(1);
    }
  }

  // Context-sensitive action on the tile in front of the player.
  doAction(tile) {
    const entry = this.getEntry(tile.x, tile.y);
    if (!entry) return;

    const inv = this.state.inventory;
    const ui = this.scene.ui;

    if (!inv.hasNeuroHoe) {
      ui.showMessage(ACTION_MESSAGES.cannotFarm);
      this.scene.sfx('unavailable');
      return;
    }

    // 1. Till
    if (entry.soilState === 'untilled') {
      entry.soilState = 'tilled';
      this.renderEntry(entry);
      ui.showMessage(ACTION_MESSAGES.till);
      this.scene.sfx('till');
      return;
    }

    // 2. Plant
    if (!entry.crop) {
      if (inv.memorySeeds <= 0) {
        ui.showMessage(ACTION_MESSAGES.noSeeds);
        this.scene.sfx('unavailable');
        return;
      }
      inv.memorySeeds -= 1;
      entry.crop = { type: 'memory_berry', growthStage: 0, wateredNights: 0, ready: false };
      this.state.tutorial.plantedFirstSeed = true;
      this.renderEntry(entry);
      ui.showMessage(ACTION_MESSAGES.plant);
      this.scene.sfx('plant');
      this.scene.syncUI(['seedPouch']);
      this.scene.updateFieldNotes();
      return;
    }

    // 3. Harvest
    if (entry.crop.ready) {
      this.detachReadyPulse(this.sprites.get(this.key(entry.x, entry.y)).crop);
      inv.memoryBerries += 1;
      entry.crop = null;
      entry.wateredToday = false;
      this.state.tutorial.harvestedFirstBerry = true;
      this.renderEntry(entry);
      this.spawnHarvestFx(entry);
      ui.showMessage(ACTION_MESSAGES.harvest);
      this.scene.sfx('harvest');
      this.scene.syncUI(['memoryBerry']);
      this.scene.updateFieldNotes();
      return;
    }

    // 4. Water
    if (!entry.wateredToday) {
      entry.wateredToday = true;
      this.state.tutorial.wateredFirstCrop = true;
      this.renderEntry(entry);
      this.spawnWaterFx(entry);
      ui.showMessage(ACTION_MESSAGES.water);
      this.scene.sfx('water');
      this.scene.updateFieldNotes();
      return;
    }

    // 5. Already watered, resting.
    ui.showMessage('These traces are resting. Let them consolidate overnight.');
    this.scene.sfx('unavailable');
  }

  // Called by the DaySystem when the player sleeps. Grows watered, immature
  // crops; resets wateredToday on all tiles. Returns true if anything advanced.
  growOvernight() {
    let grew = false;
    this.state.crops.forEach((entry) => {
      if (entry.crop && entry.wateredToday && !entry.crop.ready) {
        entry.crop.wateredNights += 1;
        if (entry.crop.wateredNights >= WATERED_NIGHTS_REQUIRED) {
          entry.crop.ready = true;
        }
        grew = true;
      }
    });
    // Reset daily watering and refresh visuals (soil dries, stages update).
    this.state.crops.forEach((entry) => {
      entry.wateredToday = false;
      this.renderEntry(entry);
    });
    return grew;
  }

  // --- particles ---
  spawnWaterFx(entry) {
    const cx = entry.x * T + T / 2;
    const cy = entry.y * T + T / 2;
    const p = this.scene.add.particles(cx, cy - 6, TEXTURE_KEYS.droplet, {
      speedY: { min: 30, max: 70 },
      speedX: { min: -25, max: 25 },
      lifespan: 500,
      quantity: 6,
      scale: { start: 1, end: 0.3 },
      alpha: { start: 1, end: 0 },
      emitting: false
    });
    p.setDepth(cy + T);
    p.explode(6);
    this.scene.time.delayedCall(700, () => p.destroy());
  }

  spawnHarvestFx(entry) {
    const cx = entry.x * T + T / 2;
    const cy = entry.y * T + T / 2;
    const p = this.scene.add.particles(cx, cy - 6, TEXTURE_KEYS.sparkle, {
      speed: { min: 20, max: 60 },
      lifespan: 600,
      quantity: 8,
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false
    });
    p.setDepth(cy + T);
    p.explode(8);
    this.scene.time.delayedCall(800, () => p.destroy());
  }
}
