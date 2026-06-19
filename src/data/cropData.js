import { TEXTURE_KEYS } from './assetManifest.js';

// Crop definitions. The FarmingSystem is data-driven from this table so new
// crops are mostly new data + art. Each farmable tile carries a cropType that
// points here.
//
// Educational framing:
//   Memory Berry  - episodic memory: encode (plant), attend (water), consolidate
//                   (sleep) over 2 watered nights.
//   Dream Bloom   - sleep-dependent consolidation: the same care but it needs
//                   MORE nights of rest (3) before it matures.
export const CROPS = {
  memory_berry: {
    name: 'Memory Berry',
    seedItem: 'memorySeeds',
    harvestItem: 'memoryBerries',
    wateredNightsRequired: 2,
    stageTextures: [
      TEXTURE_KEYS.cropSeed,
      TEXTURE_KEYS.cropSprout,
      TEXTURE_KEYS.cropBud,
      TEXTURE_KEYS.cropReady
    ],
    plantSlot: 'seedPouch',
    harvestSlot: 'memoryBerry',
    messages: {
      plant: 'Encoding begins. A new memory trace has taken root.',
      harvest: 'Retrieved: one Memory Berry.',
      noSeeds: 'The Seed Pouch is empty. Memory Seeds come from Dr. Hebb.'
    }
  },

  dream_bloom: {
    name: 'Dream Bloom',
    seedItem: 'dreamSeeds',
    harvestItem: 'dreamBlooms',
    wateredNightsRequired: 3,
    stageTextures: [
      'crop_dream_bloom_0',
      'crop_dream_bloom_1',
      'crop_dream_bloom_2',
      'crop_dream_bloom_3'
    ],
    plantSlot: 'dreamSeed',
    harvestSlot: 'dreamBloom',
    messages: {
      plant: 'A dream takes root. Some memories only settle after deep rest.',
      harvest: 'Retrieved: one Dream Bloom.',
      noSeeds: 'No Dream Seeds. Dr. Hebb keeps them for after the fog lifts.'
    }
  },

  knowledge_herb: {
    name: 'Knowledge Herb',
    seedItem: 'knowledgeSeeds',
    harvestItem: 'knowledgeHerbs',
    wateredNightsRequired: 3,
    // Semantic memory: facts hold only with consistent review. Skip a night's
    // watering and the herb loses a step (spaced repetition with forgetting).
    decays: true,
    stageTextures: [
      'crop_knowledge_herb_0',
      'crop_knowledge_herb_1',
      'crop_knowledge_herb_2',
      'crop_knowledge_herb_3'
    ],
    plantSlot: 'knowledgeSeed',
    harvestSlot: 'knowledgeHerb',
    messages: {
      plant: 'A fact takes root. Knowledge holds only with steady review.',
      harvest: 'Retrieved: one Knowledge Herb.',
      noSeeds: 'No Knowledge Seeds. Try the Knowledge Cache in the Cortex.',
      decayed: 'Skipped review — the fact slips a little. Water it again to keep it.'
    }
  }
};

export const DEFAULT_CROP_TYPE = 'memory_berry';
