// Hard-coded map (40x40, 32px tiles).
//
// Two regions stacked vertically:
//   - Synapse Grove (north, rows 0-10): opened after the Forgetting Fog clears.
//     Holds the Dream Altar, a Dream Pool, a Dream Bloom plot and neuron trees.
//   - Hippocampus Hollow (rows 11-39): the original MVP village, shifted down by
//     10 rows. The fog gate (rows 13-14) is the only route between them.

export const TILE = {
  BORDER: '#',
  GROUND: '.',
  GROUND_ALT: '_',
  PATH: ',',
  SOIL: 'S',
  DREAM_SOIL: 'B',
  WATER: 'W',
  COTTAGE: 'C',
  ARCHIVE: 'A',
  HUT: 'H',
  FOG: 'F',
  TEASER: 'T',
  DECOR: 'D',
  GROVE: 'g',
  DREAM_POOL: 'P',
  ALTAR: 'R',
  TREE: 'Y'
};

// Per-symbol properties. `farmable` marks plots (with a crop type). `floor`
// chooses the ground texture drawn under buildings/decor/trees.
export const TILE_TYPES = {
  '#': { key: 'border', walkable: false },
  '.': { key: 'neuralGround', walkable: true },
  '_': { key: 'neuralGroundAlt', walkable: true },
  ',': { key: 'path', walkable: true },
  'S': { key: 'soil', walkable: true, farmable: true, crop: 'memory_berry' },
  'B': { key: 'soil', walkable: true, farmable: true, crop: 'dream_bloom' },
  'W': { key: 'water', walkable: false },
  'C': { key: 'somaCottage', walkable: false, building: true },
  'A': { key: 'memoryArchive', walkable: false, building: true },
  'H': { key: 'hebbHut', walkable: false, building: true },
  'F': { key: 'fog', walkable: false, fog: true },
  'T': { key: 'teaser', walkable: true },
  'D': { key: 'signpost', walkable: false, decor: true },
  'g': { key: 'groveGround', walkable: true },
  'P': { key: 'dreamPool', walkable: false },
  'R': { key: 'dreamAltar', walkable: false, building: true, floor: 'groveGround' },
  'Y': { key: 'neuronTree', walkable: false, tree: true, floor: 'groveGround' }
};

// 40 columns x 40 rows. Validated at load time (see GameScene).
export const MAP_DATA = [
  '########################################', // 0  grove
  '#ggYggggggggggggggggggggggggggggggggYgg#', // 1
  '#ggggggggggggggggRRRRRggggggggggggggggg#', // 2  dream altar
  '#ggggggggggggggggRRRRRggggggggggggggggg#', // 3
  '#ggggPPPPPgggggggRRRRRgggggBBBBgggggggg#', // 4  pool / altar / dream plot
  '#ggggPPPPPgggggggggggggggggBBBBgggggggg#', // 5
  '#ggggPPPPPgggggggggggggggggBBBBgggggggg#', // 6
  '#ggggggggggggggggggggggggggBBBBgggggggg#', // 7
  '#gggggggYggggggggggggggggggggggggYggggg#', // 8
  '#gggggggggggggggggggggggggggggggggggggg#', // 9
  '#gggggggggggggggggggggggggggggggggggggg#', // 10 grove floor / neck
  '###############TTTTTTTTTT###############', // 11 teaser path
  '###############TTTTTTTTTT###############', // 12
  '################FFFFFFFF################', // 13 fog gate
  '################FFFFFFFF################', // 14
  '##############............##############', // 15
  '##############D..AAAAA....##############', // 16 memory archive
  '##############...AAAAA....##############', // 17
  '##############...AAAAA....##############', // 18
  '#......................D...............#', // 19
  '#....HHHH..................D.WWWWW.....#', // 20 hut / dream pond
  '#....HHHH....................WWWWW.....#', // 21
  '#....HHHH....................WWWWW.....#', // 22
  '#.......D.D............................#', // 23
  '#................SSSSS.................#', // 24 memory farm
  '#................SSSSS.................#', // 25
  '#................SSSSS.................#', // 26
  '#................SSSSS.................#', // 27
  '#................SSSSS.................#', // 28
  '#......................................#', // 29
  '#.......................D..............#', // 30
  '#...............CCCCC..................#', // 31 soma cottage
  '#...............CCCCC..................#', // 32
  '#...............CCCCC..................#', // 33
  '#......................................#', // 34
  '#......................................#', // 35 player start
  '#......................................#', // 36
  '#......................................#', // 37
  '#......................................#', // 38
  '########################################'  // 39
];

// Player wakes just south of the Soma Cottage door (tile coords).
export const PLAYER_START_TILE = { x: 17, y: 35 };

// Interactable zones, in TILE coordinates.
export const INTERACTABLES = [
  {
    id: 'dr_hebb',
    type: 'npc',
    x: 6,
    y: 23,
    width: 1,
    height: 1
  },
  {
    id: 'soma_cottage_door',
    type: 'sleep',
    x: 16,
    y: 33,
    width: 5,
    height: 1,
    label: 'Soma Cottage'
  },
  {
    id: 'memory_archive',
    type: 'archive',
    x: 17,
    y: 16,
    width: 5,
    height: 3,
    label: 'Memory Archive'
  },
  {
    id: 'dream_altar',
    type: 'dream_altar',
    x: 17,
    y: 2,
    width: 5,
    height: 3,
    label: 'Dream Altar'
  },
  // Future-crop tease signs (D tiles).
  {
    id: 'map_mushrooms_sign',
    type: 'sign',
    x: 14,
    y: 16,
    width: 1,
    height: 1,
    message: 'Map Mushrooms: helpful for finding your way. Unhelpful if you already forgot why you came here.'
  },
  {
    id: 'knowledge_herbs_sign',
    type: 'sign',
    x: 23,
    y: 19,
    width: 1,
    height: 1,
    message: 'Knowledge Herbs: used for stable facts, concepts, and things you pretend you did not just Google.'
  },
  {
    id: 'dream_pond_sign',
    type: 'sign',
    x: 27,
    y: 20,
    width: 1,
    height: 1,
    message: 'Dream Pond. Future site of sleep-dependent consolidation research. Currently very damp.'
  },
  {
    id: 'hebb_hut_sign',
    type: 'sign',
    x: 8,
    y: 23,
    width: 1,
    height: 1,
    message: 'Dr. Hebb’s Hut. Please knock, unless you are a statistically significant result.'
  },
  {
    id: 'emotion_flowers_sign',
    type: 'sign',
    x: 10,
    y: 23,
    width: 1,
    height: 1,
    message: 'Emotion Flowers: some memories grow brighter when feelings are nearby. Handle gently.'
  },
  {
    id: 'rhythm_roots_sign',
    type: 'sign',
    x: 24,
    y: 30,
    width: 1,
    height: 1,
    message: 'Rhythm Roots: improve through repetition. Very smug about practice.'
  },
  // Synapse Grove teaser decorations (drawn in-scene, non-blocking).
  {
    id: 'synapse_signpost',
    type: 'sign',
    x: 16,
    y: 12,
    width: 1,
    height: 1,
    message: 'Synapse Grove — communication, connection, and questionable electrical decisions.'
  },
  {
    id: 'synapse_firefly',
    type: 'sign',
    x: 20,
    y: 11,
    width: 1,
    height: 1,
    message: 'A Synapse Spark flickers nearby. It seems excited to become a future collectible.'
  },
  {
    id: 'axon_bridge',
    type: 'sign',
    x: 19,
    y: 1,
    width: 1,
    height: 1,
    message: 'An axon bridge heads further north. The signal beyond is not stable enough yet.'
  }
];

// The fog gate band (tile rect) — converted to walkable when the fog clears.
export const FOG_TILES = [];
for (let y = 13; y <= 14; y += 1) {
  for (let x = 16; x <= 23; x += 1) {
    FOG_TILES.push({ x, y });
  }
}
