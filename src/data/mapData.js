// Hard-coded map (40x50, 32px tiles).
//
// Three regions stacked vertically, north -> south:
//   - Cortex (rows 0-9): opened after Synapse Grove is restored. Holds the
//     Cortex Library, a Knowledge Herb plot and cortical columns.
//   - Axon gate (row 10): the only route between Cortex and the grove; blocked
//     until the grove is restored.
//   - Synapse Grove (rows 11-20): Dream Altar, Dream Pool, Dream Bloom plot.
//   - Fog gate (rows 23-24): blocked until enough Memory Berries are archived.
//   - Hippocampus Hollow (rows 21-49): the original village.

export const TILE = {
  BORDER: '#',
  GROUND: '.',
  GROUND_ALT: '_',
  PATH: ',',
  SOIL: 'S',
  DREAM_SOIL: 'B',
  KNOWLEDGE_SOIL: 'K',
  EMOTION_SOIL: 'E',
  WATER: 'W',
  COTTAGE: 'C',
  ARCHIVE: 'A',
  HUT: 'H',
  AMYGDALA: 'Z',
  FOG: 'F',
  TEASER: 'T',
  DECOR: 'D',
  GROVE: 'g',
  DREAM_POOL: 'P',
  ALTAR: 'R',
  TREE: 'Y',
  CORTEX: 'k',
  LIBRARY: 'L',
  COLUMN: 'O',
  AXON: 'X'
};

// Per-symbol properties. `farmable` marks plots (with a crop type). `floor`
// chooses the ground texture drawn under buildings/decor/trees. `tree` draws
// TEXTURE_KEYS[key] as an overlay sprite. `gate` tiles block until cleared.
export const TILE_TYPES = {
  '#': { key: 'border', walkable: false },
  '.': { key: 'neuralGround', walkable: true },
  '_': { key: 'neuralGroundAlt', walkable: true },
  ',': { key: 'path', walkable: true },
  'S': { key: 'soil', walkable: true, farmable: true, crop: 'memory_berry' },
  'B': { key: 'soil', walkable: true, farmable: true, crop: 'dream_bloom' },
  'K': { key: 'soil', walkable: true, farmable: true, crop: 'knowledge_herb' },
  'E': { key: 'soil', walkable: true, farmable: true, crop: 'emotion_flower' },
  'W': { key: 'water', walkable: false },
  'Z': { key: 'amygdala', walkable: false, building: true },
  'C': { key: 'somaCottage', walkable: false, building: true },
  'A': { key: 'memoryArchive', walkable: false, building: true },
  'H': { key: 'hebbHut', walkable: false, building: true },
  'F': { key: 'fog', walkable: false, fog: true },
  'T': { key: 'teaser', walkable: true },
  'D': { key: 'signpost', walkable: false, decor: true },
  'g': { key: 'groveGround', walkable: true },
  'P': { key: 'dreamPool', walkable: false },
  'R': { key: 'dreamAltar', walkable: false, building: true, floor: 'groveGround' },
  'Y': { key: 'neuronTree', walkable: false, tree: true, floor: 'groveGround' },
  'k': { key: 'cortexGround', walkable: true },
  'L': { key: 'cortexLibrary', walkable: false, building: true, floor: 'cortexGround' },
  'O': { key: 'cortexColumn', walkable: false, tree: true, floor: 'cortexGround' },
  'X': { key: 'axonGate', walkable: false, gate: true }
};

// 40 columns x 50 rows. Validated at load time (see GameScene).
export const MAP_DATA = [
  '########################################', // 0  cortex
  '#kkkkkkkkkkkkkkkkLLLLLkkkkkkkkkkkkkkkkk#', // 1  cortex library
  '#kkkkkkkkkkkkkkkkLLLLLkkkkkkkkkkkkkkkkk#', // 2
  '#kkkkkkkkkkkkkkkkLLLLLkkkkkkkkkkkkkkkkk#', // 3
  '#kkkkkkkkkkkkkkkkkkkkkkkKKKKkkkkkkkkkkk#', // 4  knowledge plot
  '#kkkkkkkkkkkkkkkkkkkkkkkKKKKkkkkkkkkkkk#', // 5
  '#kkkkkkkkkkkkkkkkkkkkkkkKKKKkkkkkkkkkkk#', // 6
  '#kkkkkkkkkkkkkkkkkkkkkkkKKKKkkkkkkkkkkk#', // 7
  '#kkkkkkkOkkkkkkkkkkkkkkkkkkkkkkOkkkkkkk#', // 8  cortical columns
  '#kkkkkkkkkkkkkkDkkkkkkkkkkkkkkkkkkkkkkk#', // 9  knowledge cache (D)
  '#################XXXXXX#################', // 10 axon gate
  '#ggYggggggggggggggggggggggggggggggggYgg#', // 11 grove
  '#ggggggggggggggggRRRRRggggggggggggggggg#', // 12 dream altar
  '#ggggggggggggggggRRRRRggggggggggggggggg#', // 13
  '#ggggPPPPPgggggggRRRRRgggggBBBBgggggggg#', // 14 pool / altar / dream plot
  '#ggggPPPPPgggggggggggggggggBBBBgggggggg#', // 15
  '#ggggPPPPPgggggggggggggggggBBBBgggggggg#', // 16
  '#ggggggggggggggggggggggggggBBBBgggggggg#', // 17
  '#gggggggYggggggggggggggggggggggggYggggg#', // 18
  '#gggggggggggggggggggggggggggggggggggggg#', // 19
  '#gggggggggggggggggggggggggggggggggggggg#', // 20 grove floor / neck
  '###############TTTTTTTTTT###############', // 21 teaser path
  '###############TTTTTTTTTT###############', // 22
  '################FFFFFFFF################', // 23 fog gate
  '################FFFFFFFF################', // 24
  '##############............##############', // 25
  '##############D..AAAAA....##############', // 26 memory archive
  '##############...AAAAA....##############', // 27
  '##############...AAAAA....##############', // 28
  '#......................D...............#', // 29
  '#....HHHH..................D.WWWWW.....#', // 30 hut / dream pond
  '#....HHHH....................WWWWW.....#', // 31
  '#....HHHH....................WWWWW.....#', // 32
  '#.......D.D............................#', // 33
  '#................SSSSS........EEEE.....#', // 34 memory + emotion plots
  '#................SSSSS........EEEE.D...#', // 35 emotion cache (D)
  '#................SSSSS........EEEE.....#', // 36
  '#................SSSSS........EEEE.....#', // 37
  '#................SSSSS.................#', // 38 memory farm
  '#......................................#', // 39
  '#.......................D..............#', // 40
  '#...............CCCCC..................#', // 41 soma cottage
  '#...............CCCCC..................#', // 42
  '#...............CCCCC..................#', // 43
  '#......................................#', // 44
  '#......................................#', // 45 player start
  '#.............................ZZZZZ....#', // 46 amygdala shrine
  '#.............................ZZZZZ....#', // 47
  '#.............................ZZZZZ....#', // 48
  '########################################'  // 49
];

// Player wakes just south of the Soma Cottage door (tile coords).
export const PLAYER_START_TILE = { x: 17, y: 45 };

// Interactable zones, in TILE coordinates.
export const INTERACTABLES = [
  { id: 'dr_hebb', type: 'npc', x: 6, y: 33, width: 1, height: 1 },
  {
    id: 'soma_cottage_door',
    type: 'sleep',
    x: 16,
    y: 43,
    width: 5,
    height: 1,
    label: 'Soma Cottage'
  },
  {
    id: 'memory_archive',
    type: 'archive',
    x: 17,
    y: 26,
    width: 5,
    height: 3,
    label: 'Memory Archive'
  },
  {
    id: 'dream_altar',
    type: 'dream_altar',
    x: 17,
    y: 12,
    width: 5,
    height: 3,
    label: 'Dream Altar'
  },
  {
    id: 'cortex_library',
    type: 'cortex_library',
    x: 17,
    y: 1,
    width: 5,
    height: 3,
    label: 'Cortex Library'
  },
  {
    id: 'knowledge_cache',
    type: 'knowledge_cache',
    x: 15,
    y: 9,
    width: 1,
    height: 1,
    label: 'Knowledge Cache'
  },
  {
    id: 'amygdala',
    type: 'amygdala',
    x: 30,
    y: 46,
    width: 5,
    height: 3,
    label: 'Amygdala'
  },
  {
    id: 'emotion_cache',
    type: 'emotion_cache',
    x: 35,
    y: 35,
    width: 1,
    height: 1,
    label: 'Emotion Cache'
  },
  // Future-crop tease signs (D tiles).
  {
    id: 'map_mushrooms_sign',
    type: 'sign',
    x: 14,
    y: 26,
    width: 1,
    height: 1,
    message: 'Map Mushrooms: helpful for finding your way. Unhelpful if you already forgot why you came here.'
  },
  {
    id: 'knowledge_herbs_sign',
    type: 'sign',
    x: 23,
    y: 29,
    width: 1,
    height: 1,
    message: 'Knowledge Herbs: used for stable facts and concepts. Now growing up in the Cortex, apparently.'
  },
  {
    id: 'dream_pond_sign',
    type: 'sign',
    x: 27,
    y: 30,
    width: 1,
    height: 1,
    message: 'Dream Pond. Future site of sleep-dependent consolidation research. Currently very damp.'
  },
  {
    id: 'hebb_hut_sign',
    type: 'sign',
    x: 8,
    y: 33,
    width: 1,
    height: 1,
    message: 'Dr. Hebb’s Hut. Please knock, unless you are a statistically significant result.'
  },
  {
    id: 'emotion_flowers_sign',
    type: 'sign',
    x: 10,
    y: 33,
    width: 1,
    height: 1,
    message: 'Emotion Flowers: some memories grow brighter when feelings are nearby. Handle gently.'
  },
  {
    id: 'rhythm_roots_sign',
    type: 'sign',
    x: 24,
    y: 40,
    width: 1,
    height: 1,
    message: 'Rhythm Roots: improve through repetition. Very smug about practice.'
  },
  // Synapse Grove decorations (drawn in-scene, non-blocking).
  {
    id: 'synapse_signpost',
    type: 'sign',
    x: 16,
    y: 22,
    width: 1,
    height: 1,
    message: 'Synapse Grove — communication, connection, and questionable electrical decisions.'
  },
  {
    id: 'synapse_firefly',
    type: 'sign',
    x: 20,
    y: 21,
    width: 1,
    height: 1,
    message: 'A Synapse Spark flickers nearby. It seems excited to become a future collectible.'
  },
  {
    id: 'axon_bridge',
    type: 'sign',
    x: 19,
    y: 11,
    width: 1,
    height: 1,
    message: 'The axon bridge hums north toward the Cortex — where facts are filed and never quite shut up.'
  }
];

// The fog gate band (tile rect) — converted to walkable when the fog clears.
export const FOG_TILES = [];
for (let y = 23; y <= 24; y += 1) {
  for (let x = 16; x <= 23; x += 1) {
    FOG_TILES.push({ x, y });
  }
}

// The axon gate (tile rect) — converted to walkable when the grove is restored.
export const AXON_TILES = [];
for (let x = 17; x <= 22; x += 1) {
  AXON_TILES.push({ x, y: 10 });
}
