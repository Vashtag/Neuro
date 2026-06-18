import { PALETTE, GAME_CONFIG } from '../config.js';
import { TEXTURE_KEYS } from '../data/assetManifest.js';

// Extra texture keys that exist only as programmatic placeholders (no manifest
// file override). Directional character frames, archive glow overlay, etc.
export const GEN_KEYS = {
  playerDown: 'player_down',
  playerUp: 'player_up',
  playerSide: 'player_side',
  hebbDown: 'hebb_down',
  archiveGlow: 'building_memory_archive_glow',
  // inventory/item icons (24x24)
  iconHoe: 'icon_neurohoe',
  iconCan: 'icon_recallcan',
  iconPouch: 'icon_seedpouch',
  iconSatchel: 'icon_archivesatchel',
  iconSeed: 'icon_memoryseed',
  iconBerry: 'icon_memoryberry',
  // Synapse Grove (Stage 2)
  iconDreamSeed: 'icon_dreamseed',
  iconDreamBloom: 'icon_dreambloom',
  dreamAltarGlow: 'building_dream_altar_glow',
  // Cortex (Stage 3)
  iconKnowledgeSeed: 'icon_knowledgeseed',
  iconKnowledgeHerb: 'icon_knowledgeherb',
  cortexLibraryGlow: 'building_cortex_library_glow'
};

const T = GAME_CONFIG.tileSize; // 32

// Helper: build a texture by drawing into an off-screen Graphics object.
function make(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

// Helper: scatter small accent "pixels" deterministically for texture variety.
function scatter(g, color, count, w, h, size, seed) {
  g.fillStyle(color, 1);
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = 0; i < count; i += 1) {
    const x = Math.floor(rnd() * (w - size));
    const y = Math.floor(rnd() * (h - size));
    g.fillRect(x, y, size, size);
  }
}

// ---------------------------------------------------------------------------
// TILES (32x32)
// ---------------------------------------------------------------------------
function buildTiles(scene) {
  make(scene, TEXTURE_KEYS.neuralGround, T, T, (g) => {
    g.fillStyle(PALETTE.neuralGround, 1);
    g.fillRect(0, 0, T, T);
    scatter(g, PALETTE.neuralGroundAlt, 10, T, T, 2, 7);
    scatter(g, PALETTE.glow, 2, T, T, 1, 19);
  });

  make(scene, TEXTURE_KEYS.neuralGroundAlt, T, T, (g) => {
    g.fillStyle(PALETTE.neuralGroundAlt, 1);
    g.fillRect(0, 0, T, T);
    scatter(g, PALETTE.neuralGround, 12, T, T, 2, 11);
  });

  make(scene, TEXTURE_KEYS.path, T, T, (g) => {
    g.fillStyle(PALETTE.pathEdge, 1);
    g.fillRect(0, 0, T, T);
    g.fillStyle(PALETTE.path, 1);
    g.fillRect(2, 2, T - 4, T - 4);
    scatter(g, PALETTE.pathEdge, 8, T, T, 2, 3);
  });

  make(scene, TEXTURE_KEYS.soil, T, T, (g) => {
    g.fillStyle(PALETTE.soil, 1);
    g.fillRect(0, 0, T, T);
    g.fillStyle(0x4a3c2e, 1);
    for (let y = 4; y < T; y += 8) g.fillRect(2, y, T - 4, 2);
  });

  make(scene, TEXTURE_KEYS.soilTilled, T, T, (g) => {
    g.fillStyle(PALETTE.soilTilled, 1);
    g.fillRect(0, 0, T, T);
    g.fillStyle(0x553f2c, 1);
    for (let y = 3; y < T; y += 6) g.fillRect(2, y, T - 4, 3);
  });

  make(scene, TEXTURE_KEYS.soilWatered, T, T, (g) => {
    g.fillStyle(PALETTE.soilWatered, 1);
    g.fillRect(0, 0, T, T);
    g.fillStyle(0x3a2f48, 1);
    for (let y = 3; y < T; y += 6) g.fillRect(2, y, T - 4, 3);
    scatter(g, PALETTE.water, 5, T, T, 2, 23);
  });

  make(scene, TEXTURE_KEYS.water, T, T, (g) => {
    g.fillStyle(PALETTE.waterDeep, 1);
    g.fillRect(0, 0, T, T);
    g.fillStyle(PALETTE.water, 1);
    g.fillRect(0, 0, T, T - 6);
    g.fillStyle(0x6fa6d8, 0.7);
    g.fillRect(3, 6, 10, 2);
    g.fillRect(16, 14, 12, 2);
    g.fillRect(6, 22, 9, 2);
  });

  make(scene, TEXTURE_KEYS.border, T, T, (g) => {
    // A dark dendrite hedge / wall.
    g.fillStyle(PALETTE.border, 1);
    g.fillRect(0, 0, T, T);
    g.fillStyle(0x33284a, 1);
    scatter(g, 0x33284a, 16, T, T, 4, 5);
    g.fillStyle(0x4a3d68, 1);
    scatter(g, 0x4a3d68, 8, T, T, 3, 31);
  });

  make(scene, TEXTURE_KEYS.fog, T, T, (g) => {
    g.fillStyle(PALETTE.fog, 1);
    g.fillRect(0, 0, T, T);
    g.fillStyle(0xffffff, 0.5);
    scatter(g, 0xffffff, 10, T, T, 3, 13);
  });

  make(scene, TEXTURE_KEYS.teaser, T, T, (g) => {
    g.fillStyle(PALETTE.teaser, 1);
    g.fillRect(0, 0, T, T);
    scatter(g, PALETTE.sparkle, 4, T, T, 2, 41);
    scatter(g, 0x9a86d8, 8, T, T, 2, 17);
  });

  // --- Synapse Grove tiles ---
  make(scene, TEXTURE_KEYS.groveGround, T, T, (g) => {
    g.fillStyle(PALETTE.grove, 1);
    g.fillRect(0, 0, T, T);
    scatter(g, PALETTE.groveAlt, 10, T, T, 2, 9);
    scatter(g, PALETTE.treeGlow, 2, T, T, 1, 29);
  });

  make(scene, TEXTURE_KEYS.dreamPool, T, T, (g) => {
    g.fillStyle(PALETTE.dreamPoolDeep, 1);
    g.fillRect(0, 0, T, T);
    g.fillStyle(PALETTE.dreamPool, 1);
    g.fillRect(0, 0, T, T - 6);
    g.fillStyle(0x8f8fe0, 0.7);
    g.fillRect(4, 7, 9, 2);
    g.fillRect(17, 15, 11, 2);
    scatter(g, PALETTE.sparkle, 3, T, T, 1, 47);
  });

  // Neuron tree (transparent, drawn over grove ground).
  make(scene, TEXTURE_KEYS.neuronTree, T, T, (g) => {
    g.fillStyle(0x4a3a2a, 1);
    g.fillRect(14, 20, 4, 11); // trunk
    g.fillStyle(PALETTE.tree, 1);
    g.fillCircle(16, 12, 9);
    g.fillCircle(9, 16, 5);
    g.fillCircle(23, 16, 5);
    g.fillStyle(PALETTE.treeGlow, 0.9);
    g.fillCircle(13, 9, 1.5);
    g.fillCircle(19, 13, 1.5);
    g.fillCircle(21, 17, 1.5);
  });

  // --- Cortex tiles ---
  make(scene, TEXTURE_KEYS.cortexGround, T, T, (g) => {
    g.fillStyle(PALETTE.cortex, 1);
    g.fillRect(0, 0, T, T);
    scatter(g, PALETTE.cortexAlt, 9, T, T, 2, 11);
    scatter(g, PALETTE.cortexColumnGlow, 2, T, T, 1, 31);
  });

  // Axon gate — a glowing electric barrier (blocked until the grove restores).
  make(scene, TEXTURE_KEYS.axonGate, T, T, (g) => {
    g.fillStyle(PALETTE.axonGate, 0.9);
    g.fillRect(0, 0, T, T);
    g.lineStyle(2, PALETTE.axonGateGlow, 0.9);
    g.beginPath();
    g.moveTo(4, 2);
    g.lineTo(18, 12);
    g.lineTo(10, 18);
    g.lineTo(26, 30);
    g.strokePath();
    scatter(g, PALETTE.sparkle, 4, T, T, 1, 7);
  });

  // Cortical column (transparent, drawn over cortex ground).
  make(scene, TEXTURE_KEYS.cortexColumn, T, T, (g) => {
    g.fillStyle(PALETTE.cortexColumn, 1);
    g.fillRect(11, 4, 10, 26);
    g.fillStyle(0x564a36, 1);
    g.fillRect(9, 3, 14, 4);
    g.fillRect(9, 27, 14, 4);
    g.fillStyle(PALETTE.cortexColumnGlow, 0.8);
    g.fillCircle(16, 12, 1.5);
    g.fillCircle(16, 19, 1.5);
  });

  // Signpost decoration tile (also an interactable).
  make(scene, TEXTURE_KEYS.signpost, T, T, (g) => {
    g.fillStyle(PALETTE.neuralGround, 1);
    g.fillRect(0, 0, T, T);
    g.fillStyle(0x6b4a32, 1);
    g.fillRect(15, 10, 3, 18); // post
    g.fillStyle(0xb58a5a, 1);
    g.fillRect(6, 8, 20, 10); // board
    g.fillStyle(0x4a3320, 1);
    g.fillRect(9, 12, 14, 2); // text line
  });
}

// ---------------------------------------------------------------------------
// CHARACTERS (24x34) — simple top-down researcher-gardener
// ---------------------------------------------------------------------------
function drawCharacter(g, opts) {
  const { coat, skin, accent, facing } = opts;
  // boots
  g.fillStyle(0x4a3a2a, 1);
  g.fillRect(6, 30, 5, 4);
  g.fillRect(13, 30, 5, 4);
  // lab coat / body
  g.fillStyle(coat, 1);
  g.fillRect(4, 16, 16, 15);
  // arms
  g.fillStyle(coat, 1);
  g.fillRect(2, 17, 3, 10);
  g.fillRect(19, 17, 3, 10);
  // satchel accent
  g.fillStyle(accent, 1);
  g.fillRect(4, 22, 16, 3);
  // head
  g.fillStyle(skin, 1);
  g.fillRect(6, 4, 12, 12);
  if (facing === 'down') {
    // goggles band + eyes
    g.fillStyle(accent, 1);
    g.fillRect(6, 7, 12, 3);
    g.fillStyle(0x222034, 1);
    g.fillRect(8, 11, 2, 2);
    g.fillRect(14, 11, 2, 2);
  } else if (facing === 'up') {
    // back of head / headlamp strap
    g.fillStyle(accent, 1);
    g.fillRect(6, 6, 12, 3);
    g.fillStyle(0x000000, 0.15);
    g.fillRect(6, 9, 12, 6);
  } else {
    // side: goggle on one side, one eye
    g.fillStyle(accent, 1);
    g.fillRect(6, 7, 12, 3);
    g.fillStyle(0x222034, 1);
    g.fillRect(13, 11, 2, 2);
  }
}

function buildCharacters(scene) {
  const W = 24;
  const H = 34;
  make(scene, GEN_KEYS.playerDown, W, H, (g) =>
    drawCharacter(g, { coat: PALETTE.playerCoat, skin: PALETTE.player, accent: 0xc98a3a, facing: 'down' })
  );
  make(scene, GEN_KEYS.playerUp, W, H, (g) =>
    drawCharacter(g, { coat: PALETTE.playerCoat, skin: PALETTE.player, accent: 0xc98a3a, facing: 'up' })
  );
  make(scene, GEN_KEYS.playerSide, W, H, (g) =>
    drawCharacter(g, { coat: PALETTE.playerCoat, skin: PALETTE.player, accent: 0xc98a3a, facing: 'side' })
  );
  make(scene, GEN_KEYS.hebbDown, W, H, (g) => {
    drawCharacter(g, { coat: PALETTE.hut, skin: PALETTE.hebb, accent: 0x8a6f4a, facing: 'down' });
    // little white beard
    g.fillStyle(0xeae2d2, 1);
    g.fillRect(8, 14, 8, 3);
    // spectacles
    g.fillStyle(0xf6d785, 1);
    g.fillRect(8, 10, 3, 2);
    g.fillRect(13, 10, 3, 2);
  });
}

// ---------------------------------------------------------------------------
// CROPS (32x32) — Memory Berry growth stages
// ---------------------------------------------------------------------------
function buildCrops(scene) {
  make(scene, TEXTURE_KEYS.cropSeed, T, T, (g) => {
    g.fillStyle(PALETTE.cropSeed, 1);
    g.fillCircle(16, 22, 3);
    g.fillStyle(PALETTE.sparkle, 0.8);
    g.fillCircle(16, 22, 1);
  });
  make(scene, TEXTURE_KEYS.cropSprout, T, T, (g) => {
    g.fillStyle(0x4a7a3a, 1);
    g.fillRect(15, 16, 2, 8); // stem
    g.fillStyle(PALETTE.cropSprout, 1);
    g.fillCircle(12, 16, 3);
    g.fillCircle(20, 16, 3);
  });
  make(scene, TEXTURE_KEYS.cropBud, T, T, (g) => {
    g.fillStyle(0x4a7a3a, 1);
    g.fillRect(15, 14, 2, 12);
    g.fillStyle(PALETTE.cropSprout, 1);
    g.fillCircle(11, 16, 3);
    g.fillCircle(21, 16, 3);
    g.fillStyle(PALETTE.cropBud, 1);
    g.fillCircle(16, 11, 5); // bud
    g.fillStyle(PALETTE.sparkle, 0.6);
    g.fillCircle(15, 10, 1);
  });
  make(scene, TEXTURE_KEYS.cropReady, T, T, (g) => {
    g.fillStyle(0x4a7a3a, 1);
    g.fillRect(15, 16, 2, 10);
    g.fillStyle(PALETTE.cropSprout, 1);
    g.fillCircle(10, 18, 3);
    g.fillCircle(22, 18, 3);
    // glowing berry cluster
    g.fillStyle(PALETTE.glow, 0.35);
    g.fillCircle(16, 11, 9);
    g.fillStyle(PALETTE.cropReady, 1);
    g.fillCircle(13, 11, 4);
    g.fillCircle(19, 11, 4);
    g.fillCircle(16, 7, 4);
    g.fillStyle(PALETTE.sparkle, 0.9);
    g.fillCircle(12, 9, 1);
    g.fillCircle(18, 6, 1);
  });
}

// ---------------------------------------------------------------------------
// DREAM BLOOM crop stages (32x32) — lavender, dreamy
// ---------------------------------------------------------------------------
function buildDreamCrops(scene) {
  make(scene, TEXTURE_KEYS.cropDreamSeed, T, T, (g) => {
    g.fillStyle(PALETTE.dreamCrop, 1);
    g.fillCircle(16, 22, 3);
    g.fillStyle(PALETTE.sparkle, 0.8);
    g.fillCircle(16, 22, 1);
  });
  make(scene, TEXTURE_KEYS.cropDreamSprout, T, T, (g) => {
    g.fillStyle(0x5a6f8a, 1);
    g.fillRect(15, 16, 2, 8);
    g.fillStyle(PALETTE.dreamCrop, 1);
    g.fillCircle(12, 16, 3);
    g.fillCircle(20, 16, 3);
  });
  make(scene, TEXTURE_KEYS.cropDreamBud, T, T, (g) => {
    g.fillStyle(0x5a6f8a, 1);
    g.fillRect(15, 14, 2, 12);
    g.fillStyle(PALETTE.dreamCrop, 1);
    g.fillCircle(11, 16, 3);
    g.fillCircle(21, 16, 3);
    g.fillStyle(PALETTE.dreamCropReady, 1);
    g.fillCircle(16, 11, 5);
    g.fillStyle(PALETTE.sparkle, 0.7);
    g.fillCircle(15, 10, 1);
  });
  make(scene, TEXTURE_KEYS.cropDreamReady, T, T, (g) => {
    g.fillStyle(0x5a6f8a, 1);
    g.fillRect(15, 16, 2, 10);
    g.fillStyle(PALETTE.dreamCrop, 1);
    g.fillCircle(10, 18, 3);
    g.fillCircle(22, 18, 3);
    g.fillStyle(PALETTE.altarGlow, 0.35);
    g.fillCircle(16, 11, 9);
    g.fillStyle(PALETTE.dreamCropReady, 1);
    g.fillCircle(13, 11, 4);
    g.fillCircle(19, 11, 4);
    g.fillCircle(16, 7, 4);
    g.fillStyle(PALETTE.sparkle, 0.9);
    g.fillCircle(12, 9, 1);
    g.fillCircle(18, 6, 1);
  });
}

// ---------------------------------------------------------------------------
// KNOWLEDGE HERB crop stages (32x32) — leafy green with golden tips
// ---------------------------------------------------------------------------
function buildKnowledgeCrops(scene) {
  make(scene, TEXTURE_KEYS.cropKnowledgeSeed, T, T, (g) => {
    g.fillStyle(PALETTE.knowledgeCrop, 1);
    g.fillCircle(16, 22, 3);
    g.fillStyle(PALETTE.knowledgeCropReady, 0.9);
    g.fillCircle(16, 21, 1);
  });
  make(scene, TEXTURE_KEYS.cropKnowledgeSprout, T, T, (g) => {
    g.fillStyle(0x5a6a32, 1);
    g.fillRect(15, 16, 2, 9);
    g.fillStyle(PALETTE.knowledgeCrop, 1);
    g.fillEllipse(11, 17, 7, 4);
    g.fillEllipse(21, 17, 7, 4);
  });
  make(scene, TEXTURE_KEYS.cropKnowledgeBud, T, T, (g) => {
    g.fillStyle(0x5a6a32, 1);
    g.fillRect(15, 12, 2, 13);
    g.fillStyle(PALETTE.knowledgeCrop, 1);
    g.fillEllipse(10, 16, 8, 4);
    g.fillEllipse(22, 16, 8, 4);
    g.fillEllipse(12, 21, 7, 4);
    g.fillEllipse(20, 21, 7, 4);
    g.fillStyle(PALETTE.knowledgeCropReady, 1);
    g.fillCircle(16, 10, 3);
  });
  make(scene, TEXTURE_KEYS.cropKnowledgeReady, T, T, (g) => {
    g.fillStyle(0x5a6a32, 1);
    g.fillRect(15, 12, 2, 13);
    g.fillStyle(PALETTE.knowledgeCrop, 1);
    g.fillEllipse(9, 17, 9, 5);
    g.fillEllipse(23, 17, 9, 5);
    g.fillEllipse(12, 22, 8, 4);
    g.fillEllipse(20, 22, 8, 4);
    g.fillStyle(PALETTE.libraryGlow, 0.3);
    g.fillCircle(16, 9, 8);
    g.fillStyle(PALETTE.knowledgeCropReady, 1);
    g.fillCircle(16, 9, 5);
    g.fillStyle(PALETTE.sparkle, 0.9);
    g.fillCircle(14, 7, 1);
    g.fillCircle(18, 10, 1);
  });
}

// ---------------------------------------------------------------------------
// BUILDINGS
// ---------------------------------------------------------------------------
function buildBuildings(scene) {
  const cw = 5 * T; // 160
  const ch = 3 * T; // 96

  // Soma Cottage — round neuron-soma home with warm windows.
  make(scene, TEXTURE_KEYS.somaCottage, cw, ch, (g) => {
    g.fillStyle(PALETTE.cottage, 1);
    g.fillRoundedRect(14, 24, cw - 28, ch - 28, 22);
    // roof / dendrite branches
    g.fillStyle(0x9c4f63, 1);
    g.fillRoundedRect(24, 12, cw - 48, 28, 14);
    g.lineStyle(3, 0x9c4f63, 1);
    g.beginPath();
    g.moveTo(30, 16); g.lineTo(16, 4);
    g.moveTo(cw - 30, 16); g.lineTo(cw - 16, 4);
    g.strokePath();
    // door
    g.fillStyle(0x5a2f3a, 1);
    g.fillRect(cw / 2 - 10, ch - 26, 20, 22);
    // windows (warm)
    g.fillStyle(PALETTE.archiveGlow, 1);
    g.fillRect(30, ch - 40, 14, 14);
    g.fillRect(cw - 44, ch - 40, 14, 14);
  });

  // Dr. Hebb's Hut — dendrite hut with chalkboard.
  const hw = 4 * T; // 128
  make(scene, TEXTURE_KEYS.hebbHut, hw, ch, (g) => {
    g.fillStyle(PALETTE.hut, 1);
    g.fillRoundedRect(12, 28, hw - 24, ch - 30, 12);
    g.fillStyle(0x6b5480, 1);
    g.fillTriangle(8, 30, hw - 8, 30, hw / 2, 6); // roof
    // door
    g.fillStyle(0x3a2f48, 1);
    g.fillRect(hw / 2 - 9, ch - 24, 18, 20);
    // chalkboard
    g.fillStyle(0x223322, 1);
    g.fillRect(18, ch - 40, 20, 14);
    g.lineStyle(1, 0xcfe8cf, 0.8);
    g.strokeRect(20, ch - 37, 16, 8);
    // window lamp
    g.fillStyle(PALETTE.archiveGlow, 1);
    g.fillRect(hw - 36, ch - 40, 12, 12);
  });

  // Memory Archive — base (dim) + separate additive glow overlay.
  make(scene, TEXTURE_KEYS.memoryArchive, cw, ch, (g) => {
    g.fillStyle(PALETTE.archiveDim, 1);
    g.fillRoundedRect(10, 16, cw - 20, ch - 18, 10);
    // curved hippocampus doorway
    g.fillStyle(0x2f2a44, 1);
    g.fillRoundedRect(cw / 2 - 16, ch - 34, 32, 32, 14);
    // shelf slots
    g.fillStyle(0x5a5378, 1);
    for (let i = 0; i < 4; i += 1) {
      g.fillRect(20 + i * 30, 26, 22, 10);
      g.fillRect(20 + i * 30, 42, 22, 10);
    }
    // roof ridge
    g.fillStyle(0x393255, 1);
    g.fillRect(10, 12, cw - 20, 8);
  });

  // Dream Altar — Stage 2 goal building (dim base + glow overlay).
  make(scene, TEXTURE_KEYS.dreamAltar, cw, ch, (g) => {
    g.fillStyle(PALETTE.altarDim, 1);
    g.fillRoundedRect(20, 22, cw - 40, ch - 24, 8);
    // stepped plinth
    g.fillStyle(0x3f3460, 1);
    g.fillRect(34, ch - 22, cw - 68, 16);
    g.fillRect(48, ch - 12, cw - 96, 10);
    // central crystal
    g.fillStyle(0x6b5aa0, 1);
    g.fillTriangle(cw / 2 - 12, ch - 26, cw / 2 + 12, ch - 26, cw / 2, 14);
    // arch pillars
    g.fillStyle(0x4a3f70, 1);
    g.fillRect(24, 18, 8, ch - 30);
    g.fillRect(cw - 32, 18, 8, ch - 30);
  });
  make(scene, GEN_KEYS.dreamAltarGlow, cw, ch, (g) => {
    g.fillStyle(PALETTE.altarGlow, 1);
    g.fillTriangle(cw / 2 - 12, ch - 26, cw / 2 + 12, ch - 26, cw / 2, 14);
    g.fillStyle(0xfff4c4, 0.5);
    g.fillCircle(cw / 2, ch / 2, 26);
  });

  // Cortex Library — Stage 3 goal building (shelves of stored facts).
  make(scene, TEXTURE_KEYS.cortexLibrary, cw, ch, (g) => {
    g.fillStyle(PALETTE.libraryDim, 1);
    g.fillRoundedRect(18, 16, cw - 36, ch - 18, 6);
    // roof
    g.fillStyle(0x6e5a38, 1);
    g.fillRect(14, 14, cw - 28, 10);
    // shelf rows with "book" ticks
    g.fillStyle(0x3a2f1e, 1);
    for (let ry = 30; ry < ch - 8; ry += 18) g.fillRect(26, ry, cw - 52, 12);
    g.fillStyle(PALETTE.libraryGlow, 0.8);
    for (let ry = 32; ry < ch - 8; ry += 18) {
      for (let rx = 30; rx < cw - 30; rx += 9) g.fillRect(rx, ry, 3, 8);
    }
    // doorway
    g.fillStyle(0x2a2114, 1);
    g.fillRect(cw / 2 - 9, ch - 22, 18, 22);
  });

  make(scene, GEN_KEYS.cortexLibraryGlow, cw, ch, (g) => {
    g.fillStyle(PALETTE.libraryGlow, 0.85);
    g.fillRoundedRect(18, 16, cw - 36, ch - 18, 6);
    g.fillStyle(0xfff4c4, 0.4);
    g.fillCircle(cw / 2, ch / 2, 30);
  });

  // Glow overlay (drawn on top, alpha controlled by ArchiveSystem).
  make(scene, GEN_KEYS.archiveGlow, cw, ch, (g) => {
    g.fillStyle(PALETTE.archiveGlow, 1);
    for (let i = 0; i < 4; i += 1) {
      g.fillRect(20 + i * 30, 26, 22, 10);
      g.fillRect(20 + i * 30, 42, 22, 10);
    }
    g.fillStyle(PALETTE.archiveGlow, 0.8);
    g.fillRoundedRect(cw / 2 - 16, ch - 34, 32, 32, 14);
    g.fillStyle(0xfff4c4, 0.5);
    g.fillRoundedRect(10, 16, cw - 20, ch - 18, 10);
  });
}

// ---------------------------------------------------------------------------
// FX + UI
// ---------------------------------------------------------------------------
function buildFxUi(scene) {
  make(scene, TEXTURE_KEYS.promptE, 22, 22, (g) => {
    g.fillStyle(0x000000, 0.55);
    g.fillRoundedRect(0, 0, 22, 22, 5);
    g.lineStyle(2, PALETTE.archiveGlow, 1);
    g.strokeRoundedRect(1, 1, 20, 20, 5);
    g.fillStyle(0xf6d785, 1);
    // crude 'E'
    g.fillRect(7, 6, 8, 2);
    g.fillRect(7, 6, 2, 11);
    g.fillRect(7, 10, 6, 2);
    g.fillRect(7, 15, 8, 2);
  });

  make(scene, TEXTURE_KEYS.sparkle, 12, 12, (g) => {
    g.fillStyle(PALETTE.sparkle, 1);
    g.fillRect(5, 0, 2, 12);
    g.fillRect(0, 5, 12, 2);
    g.fillStyle(0xffffff, 1);
    g.fillRect(5, 5, 2, 2);
  });

  make(scene, TEXTURE_KEYS.droplet, 8, 10, (g) => {
    g.fillStyle(0x6fa6d8, 1);
    g.fillCircle(4, 6, 3);
    g.fillTriangle(1, 5, 7, 5, 4, 0);
    g.fillStyle(0xbfe0ff, 1);
    g.fillCircle(3, 5, 1);
  });

  make(scene, TEXTURE_KEYS.orb, 14, 14, (g) => {
    g.fillStyle(PALETTE.glow, 0.4);
    g.fillCircle(7, 7, 7);
    g.fillStyle(PALETTE.archiveGlow, 1);
    g.fillCircle(7, 7, 3);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(6, 6, 1);
  });
}

// ---------------------------------------------------------------------------
// ITEM / TOOL ICONS (24x24)
// ---------------------------------------------------------------------------
function buildIcons(scene) {
  const S = 24;
  make(scene, GEN_KEYS.iconHoe, S, S, (g) => {
    g.lineStyle(3, 0x9b7142, 1);
    g.beginPath();
    g.moveTo(5, 19); g.lineTo(16, 6);
    g.strokePath();
    g.fillStyle(0xc0c4cc, 1);
    g.fillRect(14, 4, 7, 4);
    g.fillStyle(PALETTE.glow, 1);
    g.fillCircle(6, 19, 2);
  });

  make(scene, GEN_KEYS.iconCan, S, S, (g) => {
    g.fillStyle(0x6f8fb8, 1);
    g.fillRoundedRect(6, 9, 11, 11, 3); // body
    g.fillRect(15, 6, 6, 3); // spout
    g.fillStyle(0x9bb6d8, 1);
    g.fillRect(8, 6, 5, 3); // top
    g.fillStyle(0x6fa6d8, 1);
    g.fillCircle(20, 12, 1.5);
    g.fillCircle(21, 15, 1.5);
  });

  make(scene, GEN_KEYS.iconPouch, S, S, (g) => {
    g.fillStyle(0x8a6f4a, 1);
    g.fillRoundedRect(6, 9, 12, 12, 5);
    g.fillStyle(0x6b5236, 1);
    g.fillRect(9, 6, 6, 4); // neck
    g.fillStyle(PALETTE.glow, 0.9);
    g.fillCircle(12, 15, 2);
  });

  make(scene, GEN_KEYS.iconSatchel, S, S, (g) => {
    g.fillStyle(0x7a5a8a, 1);
    g.fillRoundedRect(5, 9, 14, 11, 3);
    g.fillStyle(0x5f4470, 1);
    g.fillRect(5, 9, 14, 5); // flap
    g.fillStyle(PALETTE.glow, 1);
    g.fillRect(11, 12, 2, 4); // clasp
  });

  make(scene, GEN_KEYS.iconSeed, S, S, (g) => {
    g.fillStyle(PALETTE.cropSeed, 1);
    g.fillEllipse(12, 13, 8, 11);
    g.fillStyle(PALETTE.sparkle, 0.9);
    g.fillCircle(10, 10, 1.5);
  });

  make(scene, GEN_KEYS.iconBerry, S, S, (g) => {
    g.fillStyle(PALETTE.glow, 0.35);
    g.fillCircle(12, 12, 9);
    g.fillStyle(PALETTE.cropReady, 1);
    g.fillCircle(9, 13, 4);
    g.fillCircle(15, 13, 4);
    g.fillCircle(12, 8, 4);
    g.fillStyle(PALETTE.sparkle, 0.9);
    g.fillCircle(9, 7, 1);
  });

  make(scene, GEN_KEYS.iconDreamSeed, S, S, (g) => {
    g.fillStyle(PALETTE.dreamCrop, 1);
    g.fillEllipse(12, 13, 8, 11);
    g.fillStyle(PALETTE.sparkle, 0.9);
    g.fillCircle(10, 10, 1.5);
  });

  make(scene, GEN_KEYS.iconDreamBloom, S, S, (g) => {
    g.fillStyle(PALETTE.altarGlow, 0.35);
    g.fillCircle(12, 12, 9);
    g.fillStyle(PALETTE.dreamCropReady, 1);
    g.fillCircle(9, 13, 4);
    g.fillCircle(15, 13, 4);
    g.fillCircle(12, 8, 4);
    g.fillStyle(PALETTE.sparkle, 0.9);
    g.fillCircle(9, 7, 1);
  });

  make(scene, GEN_KEYS.iconKnowledgeSeed, S, S, (g) => {
    g.fillStyle(PALETTE.knowledgeCrop, 1);
    g.fillEllipse(12, 13, 7, 10);
    g.fillStyle(PALETTE.knowledgeCropReady, 0.9);
    g.fillCircle(10, 10, 1.5);
  });

  make(scene, GEN_KEYS.iconKnowledgeHerb, S, S, (g) => {
    g.fillStyle(PALETTE.knowledgeCrop, 1);
    g.fillEllipse(8, 14, 8, 5);
    g.fillEllipse(16, 14, 8, 5);
    g.fillEllipse(12, 17, 7, 4);
    g.fillStyle(PALETTE.libraryGlow, 0.4);
    g.fillCircle(12, 8, 6);
    g.fillStyle(PALETTE.knowledgeCropReady, 1);
    g.fillCircle(12, 8, 4);
    g.fillStyle(PALETTE.sparkle, 0.9);
    g.fillCircle(10, 7, 1);
  });
}

// Generate every placeholder texture that did not arrive as a real asset.
export function generatePlaceholderTextures(scene) {
  buildTiles(scene);
  buildCharacters(scene);
  buildCrops(scene);
  buildDreamCrops(scene);
  buildKnowledgeCrops(scene);
  buildBuildings(scene);
  buildFxUi(scene);
  buildIcons(scene);
}
