// Hard-coded Hippocampus Hollow map (40x30, 32px tiles).
//
// Layout (north = top):
//   - Synapse Grove teaser path band at the very north (rows 1-2)
//   - Forgetting Fog gate just south of it (rows 3-4) — the ONLY route north,
//     flanked by border so it is a true gate
//   - Memory Archive (north-center, rows 6-8) with walkable lanes either side
//   - A clearing that opens to full width at row 9
//   - Dr. Hebb's Hut (west) and Dream Pond (east) around rows 10-12
//   - Memory Farm 5x5 plot (center, rows 14-18)
//   - Soma Cottage (center, rows 21-23) with the player starting just south
//
// 'D' tiles are decorative sign-posts that double as interactables.

export const TILE = {
  BORDER: '#',
  GROUND: '.',
  GROUND_ALT: '_',
  PATH: ',',
  SOIL: 'S',
  WATER: 'W',
  COTTAGE: 'C',
  ARCHIVE: 'A',
  HUT: 'H',
  FOG: 'F',
  TEASER: 'T',
  DECOR: 'D'
};

// Per-symbol properties. `farmable` marks the 5x5 plot. `key` maps to a texture.
export const TILE_TYPES = {
  '#': { key: 'border', walkable: false },
  '.': { key: 'neuralGround', walkable: true },
  '_': { key: 'neuralGroundAlt', walkable: true },
  ',': { key: 'path', walkable: true },
  'S': { key: 'soil', walkable: true, farmable: true },
  'W': { key: 'water', walkable: false },
  'C': { key: 'somaCottage', walkable: false, building: true },
  'A': { key: 'memoryArchive', walkable: false, building: true },
  'H': { key: 'hebbHut', walkable: false, building: true },
  'F': { key: 'fog', walkable: false, fog: true },
  'T': { key: 'teaser', walkable: true },
  'D': { key: 'signpost', walkable: false, decor: true }
};

// 40 columns x 30 rows. Validated at load time (see GameScene).
export const MAP_DATA = [
  '########################################', // 0
  '###############TTTTTTTTTT###############', // 1
  '###############TTTTTTTTTT###############', // 2
  '################FFFFFFFF################', // 3
  '################FFFFFFFF################', // 4
  '##############............##############', // 5
  '##############D..AAAAA....##############', // 6
  '##############...AAAAA....##############', // 7
  '##############...AAAAA....##############', // 8
  '#......................D...............#', // 9
  '#....HHHH..................D.WWWWW.....#', // 10
  '#....HHHH....................WWWWW.....#', // 11
  '#....HHHH....................WWWWW.....#', // 12
  '#.......D.D............................#', // 13
  '#................SSSSS.................#', // 14
  '#................SSSSS.................#', // 15
  '#................SSSSS.................#', // 16
  '#................SSSSS.................#', // 17
  '#................SSSSS.................#', // 18
  '#......................................#', // 19
  '#.......................D..............#', // 20
  '#...............CCCCC..................#', // 21
  '#...............CCCCC..................#', // 22
  '#...............CCCCC..................#', // 23
  '#......................................#', // 24
  '#......................................#', // 25
  '#......................................#', // 26
  '#......................................#', // 27
  '#......................................#', // 28
  '########################################'  // 29
];

// Player wakes just south of the Soma Cottage door (tile coords).
export const PLAYER_START_TILE = { x: 17, y: 25 };

// Interactable zones, in TILE coordinates. width/height describe a footprint;
// the interaction system uses proximity to the nearest edge.
export const INTERACTABLES = [
  {
    id: 'dr_hebb',
    type: 'npc',
    x: 6,
    y: 13,
    width: 1,
    height: 1
  },
  {
    id: 'soma_cottage_door',
    type: 'sleep',
    x: 16,
    y: 23,
    width: 5,
    height: 1,
    label: 'Soma Cottage'
  },
  {
    id: 'memory_archive',
    type: 'archive',
    x: 17,
    y: 6,
    width: 5,
    height: 3,
    label: 'Memory Archive'
  },
  // Future-crop tease signs (D tiles).
  {
    id: 'map_mushrooms_sign',
    type: 'sign',
    x: 14,
    y: 6,
    width: 1,
    height: 1,
    message: 'Map Mushrooms: helpful for finding your way. Unhelpful if you already forgot why you came here.'
  },
  {
    id: 'knowledge_herbs_sign',
    type: 'sign',
    x: 23,
    y: 9,
    width: 1,
    height: 1,
    message: 'Knowledge Herbs: used for stable facts, concepts, and things you pretend you did not just Google.'
  },
  {
    id: 'dream_pond_sign',
    type: 'sign',
    x: 27,
    y: 10,
    width: 1,
    height: 1,
    message: 'Dream Pond. Future site of sleep-dependent consolidation research. Currently very damp.'
  },
  {
    id: 'hebb_hut_sign',
    type: 'sign',
    x: 8,
    y: 13,
    width: 1,
    height: 1,
    message: 'Dr. Hebb’s Hut. Please knock, unless you are a statistically significant result.'
  },
  {
    id: 'emotion_flowers_sign',
    type: 'sign',
    x: 10,
    y: 13,
    width: 1,
    height: 1,
    message: 'Emotion Flowers: some memories grow brighter when feelings are nearby. Handle gently.'
  },
  {
    id: 'rhythm_roots_sign',
    type: 'sign',
    x: 24,
    y: 20,
    width: 1,
    height: 1,
    message: 'Rhythm Roots: improve through repetition. Very smug about practice.'
  },
  // Synapse Grove teaser interactables (non-blocking decorations drawn in-scene).
  {
    id: 'synapse_signpost',
    type: 'sign',
    x: 16,
    y: 2,
    width: 1,
    height: 1,
    message: 'Synapse Grove — communication, connection, and questionable electrical decisions.'
  },
  {
    id: 'synapse_firefly',
    type: 'sign',
    x: 20,
    y: 1,
    width: 1,
    height: 1,
    message: 'A Synapse Spark flickers nearby. It seems excited to become a future collectible.'
  },
  {
    id: 'axon_bridge',
    type: 'sign',
    x: 23,
    y: 1,
    width: 1,
    height: 1,
    message: 'This axon bridge leads deeper into Synapse Grove. The signal is not stable enough yet.'
  }
];

// The fog gate band (tile rect) — used for the "fog blocks the path" message
// and to convert these tiles to walkable when the fog clears.
export const FOG_TILES = [];
for (let y = 3; y <= 4; y += 1) {
  for (let x = 16; x <= 23; x += 1) {
    FOG_TILES.push({ x, y });
  }
}
