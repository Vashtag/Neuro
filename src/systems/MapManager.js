import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { MAP_DATA, TILE_TYPES, TILE } from '../data/mapData.js';
import { TEXTURE_KEYS } from '../data/assetManifest.js';
import { GEN_KEYS as TEX_GEN_KEYS } from './TextureFactory.js';

const T = GAME_CONFIG.tileSize;

// Multi-tile building placements (top-left tile + texture). Driven by the same
// footprints encoded in MAP_DATA; kept here so each building renders as one
// cohesive sprite rather than per-tile.
const BUILDINGS = [
  { key: TEXTURE_KEYS.somaCottage, tx: 16, ty: 41, tw: 5, th: 3, id: 'somaCottage' },
  { key: TEXTURE_KEYS.memoryArchive, tx: 17, ty: 26, tw: 5, th: 3, id: 'memoryArchive' },
  { key: TEXTURE_KEYS.hebbHut, tx: 5, ty: 30, tw: 4, th: 3, id: 'hebbHut' },
  { key: TEXTURE_KEYS.dreamAltar, tx: 17, ty: 12, tw: 5, th: 3, id: 'dreamAltar' },
  { key: TEXTURE_KEYS.cortexLibrary, tx: 17, ty: 1, tw: 5, th: 3, id: 'cortexLibrary' }
];

// MapManager: renders the hard-coded tile map, places building sprites, and
// builds Arcade static collision bodies for blocked tiles. Exposes tile helpers
// and a clearFog() that opens the northern path.
export default class MapManager {
  constructor(scene) {
    this.scene = scene;
    // Mutable copy of the grid so fog tiles can be converted to path later.
    this.grid = MAP_DATA.map((row) => row.split(''));
    this.colliders = null;
    this.fogColliders = [];
    this.fogSprites = [];
    this.axonColliders = [];
    this.axonSprites = [];
    this.buildingSprites = {};
    this.archiveGlowSprite = null;
  }

  create() {
    this.validate();
    this.colliders = this.scene.physics.add.staticGroup();
    this.renderTiles();
    this.renderBuildings();
    return this;
  }

  validate() {
    if (this.grid.length !== GAME_CONFIG.mapHeightTiles) {
      console.warn(`[Neurobloom] map has ${this.grid.length} rows, expected ${GAME_CONFIG.mapHeightTiles}`);
    }
    this.grid.forEach((row, y) => {
      if (row.length !== GAME_CONFIG.mapWidthTiles) {
        console.warn(`[Neurobloom] map row ${y} has ${row.length} cols, expected ${GAME_CONFIG.mapWidthTiles}`);
      }
    });
  }

  renderTiles() {
    for (let y = 0; y < this.grid.length; y += 1) {
      for (let x = 0; x < this.grid[y].length; x += 1) {
        const char = this.grid[y][x];
        const type = TILE_TYPES[char] || TILE_TYPES['.'];
        const wx = x * T;
        const wy = y * T;

        // Buildings, decor and trees sit on a ground floor; draw ground under.
        const onFloor = type.building || type.decor || type.tree;
        const floorKey = TEXTURE_KEYS[type.floor || 'neuralGround'];
        const baseKey = onFloor ? floorKey : TEXTURE_KEYS[type.key];
        this.scene.add.image(wx, wy, baseKey).setOrigin(0, 0).setDepth(-10);

        if (char === TILE.DECOR) {
          this.scene.add
            .image(wx, wy, TEXTURE_KEYS.signpost)
            .setOrigin(0, 0)
            .setDepth(wy + T);
        }

        if (type.tree) {
          this.scene.add
            .image(wx + T / 2, wy + T / 2, TEXTURE_KEYS[type.key])
            .setOrigin(0.5)
            .setDepth(wy + T);
        }

        if (char === TILE.FOG) {
          const fog = this.scene.add
            .image(wx, wy, TEXTURE_KEYS.fog)
            .setOrigin(0, 0)
            .setDepth(50)
            .setAlpha(0.85);
          this.fogSprites.push(fog);
        }

        if (type.gate) {
          const gate = this.scene.add
            .image(wx, wy, TEXTURE_KEYS.axonGate)
            .setOrigin(0, 0)
            .setDepth(50)
            .setAlpha(0.9);
          this.axonSprites.push(gate);
        }

        if (!type.walkable) {
          const body = this.scene.add.rectangle(wx + T / 2, wy + T / 2, T, T);
          body.setVisible(false);
          this.colliders.add(body);
          if (char === TILE.FOG) this.fogColliders.push(body);
          if (type.gate) this.axonColliders.push(body);
        }
      }
    }
  }

  renderBuildings() {
    BUILDINGS.forEach((b) => {
      const sprite = this.scene.add
        .image(b.tx * T, b.ty * T, b.key)
        .setOrigin(0, 0)
        .setDepth((b.ty + b.th) * T); // depth by bottom edge for top-down overlap
      this.buildingSprites[b.id] = sprite;

      // Archive gets a glow overlay sprite that ArchiveSystem fades in.
      if (b.id === 'memoryArchive') {
        this.archiveGlowSprite = this.scene.add
          .image(b.tx * T, b.ty * T, TEX_GEN_KEYS.archiveGlow)
          .setOrigin(0, 0)
          .setDepth((b.ty + b.th) * T + 1)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setAlpha(0);
      }

      // Dream Altar glow overlay (driven by the Stage 2 goal in S2.4).
      if (b.id === 'dreamAltar') {
        this.dreamAltarGlowSprite = this.scene.add
          .image(b.tx * T, b.ty * T, TEX_GEN_KEYS.dreamAltarGlow)
          .setOrigin(0, 0)
          .setDepth((b.ty + b.th) * T + 1)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setAlpha(0);
      }

      // Cortex Library glow overlay (driven by the Stage 3 goal).
      if (b.id === 'cortexLibrary') {
        this.cortexLibraryGlowSprite = this.scene.add
          .image(b.tx * T, b.ty * T, TEX_GEN_KEYS.cortexLibraryGlow)
          .setOrigin(0, 0)
          .setDepth((b.ty + b.th) * T + 1)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setAlpha(0);
      }
    });
  }

  // ---- tile helpers ----
  worldToTile(wx, wy) {
    return { x: Math.floor(wx / T), y: Math.floor(wy / T) };
  }

  tileToWorldCenter(tx, ty) {
    return { x: tx * T + T / 2, y: ty * T + T / 2 };
  }

  inBounds(tx, ty) {
    return ty >= 0 && ty < this.grid.length && tx >= 0 && tx < this.grid[ty].length;
  }

  getTileChar(tx, ty) {
    if (!this.inBounds(tx, ty)) return TILE.BORDER;
    return this.grid[ty][tx];
  }

  getTileType(tx, ty) {
    return TILE_TYPES[this.getTileChar(tx, ty)] || TILE_TYPES['#'];
  }

  isWalkable(tx, ty) {
    return !!this.getTileType(tx, ty).walkable;
  }

  isFarmable(tx, ty) {
    return !!this.getTileType(tx, ty).farmable;
  }

  // Convert the fog band to walkable path tiles and fade the fog sprites out.
  clearFog(onComplete) {
    // Disable collision on the fog band immediately so the path opens.
    this.fogColliders.forEach((body) => {
      if (body.body) body.body.enable = false;
      body.destroy();
    });
    this.fogColliders = [];

    // Update the logical grid so isWalkable() now returns true for those tiles.
    for (let y = 0; y < this.grid.length; y += 1) {
      for (let x = 0; x < this.grid[y].length; x += 1) {
        if (this.grid[y][x] === TILE.FOG) {
          this.grid[y][x] = TILE.TEASER;
          this.scene.add
            .image(x * T, y * T, TEXTURE_KEYS.teaser)
            .setOrigin(0, 0)
            .setDepth(-9);
        }
      }
    }

    // Fade the fog overlay sprites out with a gentle shimmer.
    const sprites = this.fogSprites;
    this.fogSprites = [];
    if (sprites.length === 0) {
      if (onComplete) onComplete();
      return;
    }
    this.scene.tweens.add({
      targets: sprites,
      alpha: 0,
      duration: 1400,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        sprites.forEach((s) => s.destroy());
        if (onComplete) onComplete();
      }
    });
  }

  // Opens the axon bridge between Synapse Grove and the Cortex (Stage 3).
  clearAxonGate(onComplete) {
    this.axonColliders.forEach((body) => {
      if (body.body) body.body.enable = false;
      body.destroy();
    });
    this.axonColliders = [];

    for (let y = 0; y < this.grid.length; y += 1) {
      for (let x = 0; x < this.grid[y].length; x += 1) {
        if (this.grid[y][x] === TILE.AXON) {
          this.grid[y][x] = TILE.CORTEX;
          this.scene.add
            .image(x * T, y * T, TEXTURE_KEYS.cortexGround)
            .setOrigin(0, 0)
            .setDepth(-9);
        }
      }
    }

    const sprites = this.axonSprites;
    this.axonSprites = [];
    if (sprites.length === 0) {
      if (onComplete) onComplete();
      return;
    }
    this.scene.tweens.add({
      targets: sprites,
      alpha: 0,
      duration: 1400,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        sprites.forEach((s) => s.destroy());
        if (onComplete) onComplete();
      }
    });
  }
}
