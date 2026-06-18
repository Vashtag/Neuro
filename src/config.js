// Central, tweakable configuration for Neurobloom.
// Keep all "magic numbers" here so systems read from one source of truth.

export const GAME_CONFIG = {
  tileSize: 32,
  mapWidthTiles: 40,
  mapHeightTiles: 40,
  get worldWidth() {
    return this.mapWidthTiles * this.tileSize;
  },
  get worldHeight() {
    return this.mapHeightTiles * this.tileSize;
  },
  canvasWidth: 960,
  canvasHeight: 640,
  playerSpeed: 140,
  saveKey: 'neurobloom_mvp_save_v1'
};

// Scene keys, referenced everywhere instead of raw strings.
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  GAME: 'GameScene',
  UI: 'UIScene'
};

// A cohesive warm brain-biome palette used by the programmatic placeholder art.
// When real PNG assets arrive, these only affect generated fallbacks.
export const PALETTE = {
  neuralGround: 0x3b2f57,
  neuralGroundAlt: 0x423566,
  path: 0xc98a6a,
  pathEdge: 0xb1734f,
  soil: 0x5a4a3a,
  soilTilled: 0x6e5740,
  soilWatered: 0x4a3b55,
  water: 0x3a6ea5,
  waterDeep: 0x2d5786,
  fog: 0xb9b3cf,
  teaser: 0x6f5da8,
  border: 0x241c34,
  cottage: 0xc9728a,
  archiveDim: 0x4a4368,
  archiveGlow: 0xf6d785,
  hut: 0x8a6f9c,
  player: 0xf4e9d8,
  playerCoat: 0xe8eef6,
  hebb: 0xd8c6a8,
  cropSeed: 0xd8c98a,
  cropSprout: 0x8fcf7a,
  cropBud: 0xe79ec6,
  cropReady: 0xf7c6e0,
  uiPanel: 0x2a2140,
  uiPanelEdge: 0x6f5da8,
  uiText: 0xf4ecdf,
  glow: 0xf6d785,
  sparkle: 0xfff4c4,
  // Synapse Grove region
  grove: 0x35455f,
  groveAlt: 0x3f5070,
  dreamPool: 0x4a4a8c,
  dreamPoolDeep: 0x35356f,
  tree: 0x336b54,
  treeGlow: 0x8fe0c0,
  altarDim: 0x55477f,
  altarGlow: 0xc6aef6,
  dreamCrop: 0x9a86d8,
  dreamCropReady: 0xc7b6f2
};
